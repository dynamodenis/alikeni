// The event album: settings, uploads, approval and listing. Pure functions
// over a Drizzle db and a storage driver (tested on PGlite with an in-memory
// driver). Rules live in `src/lib/album.ts`.
//
// - Premium invitations only, and only once the host switches the album on.
// - Guests (anyone with the link, plus the PIN when one is set) may upload
//   from the first event day through seven days after the last; the host may
//   upload at any time.
// - A guest batch of more than BULK_THRESHOLD files stays hidden until the
//   host approves it.
// - Bytes never pass through here: the server signs, the browser PUTs, and
//   `confirmItem` checks what really arrived (size, type, first bytes).
import { randomBytes, randomUUID, timingSafeEqual } from "node:crypto"
import { and, desc, eq, inArray, isNull, lt, sql } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import {
  ALBUM_MAX_BYTES,
  ALBUM_MAX_ITEMS,
  BATCH_MAX_FILES,
  BULK_THRESHOLD,
  PENDING_BATCH_DAYS,
  PIN_PATTERN,
  albumObjectKey,
  albumThumbKey,
  checkAlbumFile,
  checkAlbumThumb,
  guestUploadDays,
  guestUploadState,
  sniffAgrees,
  sniffMedia,
  type GuestUploadState,
} from "@/lib/album"
import { serverEnv } from "@/env.server"
import * as schema from "@/server/db/schema"
import { getPublishedBySlug } from "@/server/invitations/editing.server"
import { sha256Hex } from "@/server/public/fingerprint.server"
import { cleanText } from "@/server/public/sanitize"
import type { RateLimiter, RateRule } from "@/server/rate-limit"
import type { ServerStorage, UploadTarget } from "@/server/storage/types"
import type { InvitationConfigBase } from "@/templates/_shared/schema"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>
const { albums, albumBatches, albumItems, invitations: inv } = schema

/**
 * Which invitations may have an album. Premium only, unless
 * ALBUM_FREE_PREVIEW opens it to free invitations for testing. An object so
 * tests can flip it.
 */
export const albumAccess = { freePreview: serverEnv.ALBUM_FREE_PREVIEW }

export const albumAvailable = (plan: "free" | "premium") =>
  plan === "premium" || albumAccess.freePreview

/** A refusal whose message is safe to show the person verbatim. */
export class AlbumError extends Error {
  constructor(
    message: string,
    /** Seconds to wait, when refused by a rate limit. */
    readonly retryAfterSec?: number
  ) {
    super(message)
    this.name = "AlbumError"
  }
}

export const ALBUM_UNAVAILABLE = "This album is not available."
export const PIN_REQUIRED = "Enter the album PIN to continue."
export const PIN_WRONG = "That PIN is not right."
export const PIN_TOO_MANY = "Too many attempts. Please wait and try again."
export const UPLOADS_CLOSED = "Uploads are closed for this album."
export const UPLOADS_NOT_YET = "Uploads open on the day of the event."
export const ALBUM_FULL = "This album is full."
export const NOT_PREMIUM = "The album is a Premium feature."
export const UPLOAD_TOO_MANY =
  "You have uploaded a lot in a short time. Please wait and try again."
export const VERIFY_FAILED = "Please complete the verification and try again."

/** Wrong PINs per album: 8 per 10 minutes per network, 200 a day overall. */
const PIN_NETWORK_RULES: ReadonlyArray<RateRule> = [
  { limit: 8, windowSec: 600 },
  { limit: 30, windowSec: 86_400 },
]
const PIN_ALBUM_RULES: ReadonlyArray<RateRule> = [
  { limit: 200, windowSec: 86_400 },
]
/** Guest upload sessions per album. */
const BATCH_GUEST_RULES: ReadonlyArray<RateRule> = [
  { limit: 6, windowSec: 3600 },
  { limit: 20, windowSec: 86_400 },
]
const BATCH_NETWORK_RULES: ReadonlyArray<RateRule> = [
  { limit: 40, windowSec: 3600 },
  { limit: 150, windowSec: 86_400 },
]

export const ALBUM_PAGE_SIZE = 60
/** Thumbnails shown for a batch waiting for approval. */
export const PENDING_PREVIEWS = 12

export type GuestRequest = {
  ipHash: string
  limiter: RateLimiter
  verifyHuman: (token: string | undefined) => Promise<boolean>
  now?: Date
}

/* ---------- settings ---------- */

export type AlbumSettings = {
  enabled: boolean
  guestUploads: boolean
  downloads: boolean
  hasPin: boolean
}

const DEFAULTS = {
  enabled: false,
  guestUploads: true,
  downloads: true,
  pinSalt: null,
  pinHash: null,
} as const

async function albumRow(db: AnyDb, invitationId: string) {
  const row = (
    await db.select().from(albums).where(eq(albums.invitationId, invitationId))
  ).at(0)
  return row ?? { invitationId, ...DEFAULTS }
}
type AlbumRow = Awaited<ReturnType<typeof albumRow>>

const toSettings = (row: AlbumRow): AlbumSettings => ({
  enabled: row.enabled,
  guestUploads: row.guestUploads,
  downloads: row.downloads,
  hasPin: !!row.pinHash,
})

const hashPin = (salt: string, pin: string) => sha256Hex(`pin:${salt}:${pin}`)

/**
 * What a browser holds after entering the right PIN. Derived from the salt,
 * which never leaves the server, so it cannot be computed from a guessed PIN
 * and stops working the moment the host changes or removes the PIN.
 */
const accessKeyOf = (row: AlbumRow) =>
  sha256Hex(`access:${row.pinSalt}:${row.pinHash}`)

function sameText(a: string, b: string): boolean {
  const left = Buffer.from(a)
  const right = Buffer.from(b)
  return left.length === right.length && timingSafeEqual(left, right)
}

async function ownedInvitation(
  db: AnyDb,
  { id, ownerId }: { id: string; ownerId: string }
) {
  return (
    await db
      .select({
        id: inv.id,
        slug: inv.slug,
        status: inv.status,
        plan: inv.plan,
        draftConfig: inv.draftConfig,
        publishedConfig: inv.publishedConfig,
      })
      .from(inv)
      .where(and(eq(inv.id, id), eq(inv.ownerId, ownerId)))
  ).at(0)
}

export type SettingsInput = {
  id: string
  ownerId: string
  enabled?: boolean
  guestUploads?: boolean
  downloads?: boolean
  /** A new PIN, or null to remove it. Omit to leave it as it is. */
  pin?: string | null
}

/** Null when the invitation is not the caller's. */
export async function updateAlbumSettings(
  db: AnyDb,
  input: SettingsInput
): Promise<AlbumSettings | null> {
  const invitation = await ownedInvitation(db, input)
  if (!invitation) return null
  if (input.enabled && !albumAvailable(invitation.plan)) {
    throw new AlbumError(NOT_PREMIUM)
  }
  const changes: Partial<typeof albums.$inferInsert> = {}
  if (input.enabled !== undefined) changes.enabled = input.enabled
  if (input.guestUploads !== undefined) {
    changes.guestUploads = input.guestUploads
  }
  if (input.downloads !== undefined) changes.downloads = input.downloads
  if (input.pin === null) {
    changes.pinSalt = null
    changes.pinHash = null
  } else if (input.pin !== undefined) {
    if (!PIN_PATTERN.test(input.pin)) {
      throw new AlbumError("The PIN must be 4 to 8 digits.")
    }
    const salt = randomBytes(16).toString("hex")
    changes.pinSalt = salt
    changes.pinHash = await hashPin(salt, input.pin)
  }
  const row = (
    await db
      .insert(albums)
      .values({ invitationId: invitation.id, ...changes })
      .onConflictDoUpdate({
        target: albums.invitationId,
        set: { ...changes, updatedAt: new Date() },
      })
      .returning()
  ).at(0)
  return toSettings(row ?? (await albumRow(db, invitation.id)))
}

/* ---------- items ---------- */

export type AlbumItemView = {
  id: string
  kind: "image" | "video"
  url: string
  thumbUrl: string | null
  mime: string
  bytes: number
  width: number | null
  height: number | null
  durationSec: number | null
  uploaderName: string
  createdAt: string
}

const itemColumns = {
  id: albumItems.id,
  kind: albumItems.kind,
  key: albumItems.key,
  thumbKey: albumItems.thumbKey,
  mime: albumItems.mime,
  bytes: albumItems.bytes,
  width: albumItems.width,
  height: albumItems.height,
  durationSec: albumItems.durationSec,
  createdAt: albumItems.createdAt,
  uploaderName: albumBatches.uploaderName,
}

type ItemRow = {
  id: string
  kind: "image" | "video"
  key: string
  thumbKey: string | null
  mime: string
  bytes: number
  width: number | null
  height: number | null
  durationSec: number | null
  createdAt: Date
  uploaderName: string
}

const toView = (storage: ServerStorage, row: ItemRow): AlbumItemView => ({
  id: row.id,
  kind: row.kind,
  url: storage.publicUrl(row.key),
  thumbUrl: row.thumbKey ? storage.publicUrl(row.thumbKey) : null,
  mime: row.mime,
  bytes: row.bytes,
  width: row.width,
  height: row.height,
  durationSec: row.durationSec,
  uploaderName: row.uploaderName,
  createdAt: row.createdAt.toISOString(),
})

/** Approved items, newest first. `offset` pages through them. */
async function listApproved(
  db: AnyDb,
  storage: ServerStorage,
  invitationId: string,
  offset = 0,
  limit = ALBUM_PAGE_SIZE
) {
  const rows = await db
    .select(itemColumns)
    .from(albumItems)
    .innerJoin(albumBatches, eq(albumItems.batchId, albumBatches.id))
    .where(
      and(
        eq(albumItems.invitationId, invitationId),
        eq(albumBatches.status, "approved")
      )
    )
    .orderBy(desc(albumItems.createdAt), desc(albumItems.id))
    .offset(offset)
    .limit(limit + 1)
  return {
    items: rows.slice(0, limit).map((row) => toView(storage, row)),
    nextOffset: rows.length > limit ? offset + limit : null,
  }
}

async function usageOf(db: AnyDb, invitationId: string) {
  const row = (
    await db
      .select({
        items: sql<number>`count(*)::int`,
        bytes: sql<number>`coalesce(sum(${albumItems.bytes}), 0)::float8`,
      })
      .from(albumItems)
      .where(eq(albumItems.invitationId, invitationId))
  ).at(0)
  return { items: row?.items ?? 0, bytes: row?.bytes ?? 0 }
}

async function approvedCount(db: AnyDb, invitationId: string) {
  const row = (
    await db
      .select({ count: sql<number>`count(*)::int` })
      .from(albumItems)
      .innerJoin(albumBatches, eq(albumItems.batchId, albumBatches.id))
      .where(
        and(
          eq(albumItems.invitationId, invitationId),
          eq(albumBatches.status, "approved")
        )
      )
  ).at(0)
  return row?.count ?? 0
}

async function deleteObjects(storage: ServerStorage, keys: Array<string>) {
  for (let i = 0; i < keys.length; i += 20) {
    await Promise.all(
      keys.slice(i, i + 20).map((key) => storage.delete(key).catch(() => {}))
    )
  }
}

const keysOf = (rows: Array<{ key: string; thumbKey: string | null }>) =>
  rows.flatMap((row) => (row.thumbKey ? [row.key, row.thumbKey] : [row.key]))

/* ---------- the host's view ---------- */

type DatedConfig = Pick<InvitationConfigBase, "datetime" | "event">

function windowOf(config: DatedConfig | null, now: Date) {
  if (!config) return null
  try {
    return { ...guestUploadDays(config), state: guestUploadState(config, now) }
  } catch {
    return null
  }
}

/** Everything the dashboard album page shows; null when not the owner's. */
export async function getOwnerAlbum(
  db: AnyDb,
  storage: ServerStorage,
  input: { id: string; ownerId: string },
  now = new Date()
) {
  const invitation = await ownedInvitation(db, input)
  if (!invitation) return null
  const config = invitation.publishedConfig ?? invitation.draftConfig
  const [row, usage, page, pendingBatches] = await Promise.all([
    albumRow(db, invitation.id),
    usageOf(db, invitation.id),
    listApproved(db, storage, invitation.id),
    db
      .select()
      .from(albumBatches)
      .where(
        and(
          eq(albumBatches.invitationId, invitation.id),
          eq(albumBatches.status, "pending")
        )
      )
      .orderBy(desc(albumBatches.createdAt)),
  ])
  const pending = await Promise.all(
    pendingBatches.map(async (batch) => {
      const rows = await db
        .select(itemColumns)
        .from(albumItems)
        .innerJoin(albumBatches, eq(albumItems.batchId, albumBatches.id))
        .where(eq(albumItems.batchId, batch.id))
        .orderBy(albumItems.createdAt)
      return {
        id: batch.id,
        uploaderName: batch.uploaderName,
        createdAt: batch.createdAt.toISOString(),
        finished: !!batch.finishedAt,
        count: rows.length,
        bytes: rows.reduce((sum, item) => sum + item.bytes, 0),
        previews: rows
          .slice(0, PENDING_PREVIEWS)
          .map((item) => toView(storage, item)),
      }
    })
  )
  return {
    invitation: {
      id: invitation.id,
      slug: invitation.slug,
      status: invitation.status,
      plan: invitation.plan,
      /** False: the album needs Premium (the page shows the upgrade). */
      albumAvailable: albumAvailable(invitation.plan),
      title:
        (config as Partial<InvitationConfigBase>).event?.title || "Untitled",
    },
    settings: toSettings(row),
    window: windowOf(config, now),
    usage: { ...usage, maxBytes: ALBUM_MAX_BYTES, maxItems: ALBUM_MAX_ITEMS },
    // A batch still uploading with nothing in it yet is not worth showing.
    pending: pending.filter((batch) => batch.count > 0),
    items: page.items,
    nextOffset: page.nextOffset,
  }
}

export async function listOwnerItems(
  db: AnyDb,
  storage: ServerStorage,
  input: { id: string; ownerId: string; offset: number }
) {
  const invitation = await ownedInvitation(db, input)
  if (!invitation) return null
  return listApproved(db, storage, invitation.id, input.offset)
}

/** Approve a waiting batch, or reject it (its files are deleted). */
export async function decideBatch(
  db: AnyDb,
  storage: ServerStorage,
  input: { batchId: string; ownerId: string; approve: boolean }
): Promise<boolean> {
  const batch = (
    await db
      .select({ id: albumBatches.id })
      .from(albumBatches)
      .innerJoin(inv, eq(albumBatches.invitationId, inv.id))
      .where(
        and(
          eq(albumBatches.id, input.batchId),
          eq(inv.ownerId, input.ownerId),
          eq(albumBatches.status, "pending")
        )
      )
  ).at(0)
  if (!batch) return false
  if (input.approve) {
    await db
      .update(albumBatches)
      .set({ status: "approved" })
      .where(eq(albumBatches.id, batch.id))
    return true
  }
  await removeBatch(db, storage, batch.id)
  return true
}

async function removeBatch(db: AnyDb, storage: ServerStorage, batchId: string) {
  const rows = await db
    .select({ key: albumItems.key, thumbKey: albumItems.thumbKey })
    .from(albumItems)
    .where(eq(albumItems.batchId, batchId))
  await deleteObjects(storage, keysOf(rows))
  await db.delete(albumBatches).where(eq(albumBatches.id, batchId))
}

/** Delete photos or videos from the host's own album. Returns how many. */
export async function deleteItems(
  db: AnyDb,
  storage: ServerStorage,
  input: { id: string; ownerId: string; itemIds: Array<string> }
): Promise<number | null> {
  const invitation = await ownedInvitation(db, input)
  if (!invitation) return null
  if (input.itemIds.length === 0) return 0
  const rows = await db
    .select({
      id: albumItems.id,
      key: albumItems.key,
      thumbKey: albumItems.thumbKey,
    })
    .from(albumItems)
    .where(
      and(
        eq(albumItems.invitationId, invitation.id),
        inArray(albumItems.id, input.itemIds)
      )
    )
  if (rows.length === 0) return 0
  await deleteObjects(storage, keysOf(rows))
  await db.delete(albumItems).where(
    inArray(
      albumItems.id,
      rows.map((row) => row.id)
    )
  )
  return rows.length
}

/* ---------- the guests' view ---------- */

/** A published Premium invitation whose album is switched on, or null. */
async function publicAlbum(db: AnyDb, slug: string, now: Date) {
  const invitation = await getPublishedBySlug(db, slug, now)
  if (!invitation || !albumAvailable(invitation.plan)) return null
  const row = await albumRow(db, invitation.id)
  if (!row.enabled) return null
  return { invitation, row }
}

/** Whether the public page should link to an album at all. */
export async function hasPublicAlbum(
  db: AnyDb,
  invitation: { id: string; plan: "free" | "premium" }
): Promise<boolean> {
  if (!albumAvailable(invitation.plan)) return false
  return (await albumRow(db, invitation.id)).enabled
}

async function requireAccess(row: AlbumRow, access: string | undefined) {
  if (!row.pinHash) return
  if (!access) throw new AlbumError(PIN_REQUIRED)
  if (!sameText(access, await accessKeyOf(row))) {
    throw new AlbumError(PIN_REQUIRED)
  }
}

/**
 * What the album page needs before any photo is shown: enough to draw the
 * page in the invitation's colours and to ask for the PIN. Null when there
 * is no album to show.
 */
export async function getPublicAlbum(
  db: AnyDb,
  slug: string,
  now = new Date()
) {
  const found = await publicAlbum(db, slug, now)
  if (!found) return null
  const { invitation, row } = found
  const { config } = invitation
  return {
    slug: invitation.slug,
    title: config.event.title,
    locale: config.locale,
    timezone: config.datetime.timezone,
    pinRequired: !!row.pinHash,
    downloads: row.downloads,
    uploads: uploadStateOf(row, config, now),
    uploadUntil: guestUploadDays(config).until,
    count: row.pinHash ? null : await approvedCount(db, invitation.id),
  }
}

export type PublicUploadState = GuestUploadState | "off"

const uploadStateOf = (
  row: AlbumRow,
  config: DatedConfig,
  now: Date
): PublicUploadState =>
  row.guestUploads ? guestUploadState(config, now) : "off"

/**
 * Exchange the PIN for an access key. Wrong attempts are counted before the
 * PIN is compared, per network and per album, so guessing stops working
 * rather than merely being told to slow down.
 */
export async function unlockAlbum(
  db: AnyDb,
  input: { slug: string; pin: string },
  request: GuestRequest
): Promise<{ access: string | null }> {
  const found = await publicAlbum(db, input.slug, request.now ?? new Date())
  if (!found) throw new AlbumError(ALBUM_UNAVAILABLE)
  const { row, invitation } = found
  if (!row.pinHash || !row.pinSalt) return { access: null }
  const scope = `album-pin:${invitation.id}`
  const allowed = await request.limiter.hitAll([
    { key: `${scope}:ip:${request.ipHash}`, rules: PIN_NETWORK_RULES },
    { key: scope, rules: PIN_ALBUM_RULES },
  ])
  if (!allowed.ok) throw new AlbumError(PIN_TOO_MANY, allowed.retryAfterSec)
  const given = PIN_PATTERN.test(input.pin)
    ? await hashPin(row.pinSalt, input.pin)
    : ""
  if (!sameText(given, row.pinHash)) throw new AlbumError(PIN_WRONG)
  return { access: await accessKeyOf(row) }
}

export async function listPublicItems(
  db: AnyDb,
  storage: ServerStorage,
  input: { slug: string; access?: string; offset?: number },
  now = new Date()
) {
  const found = await publicAlbum(db, input.slug, now)
  if (!found) throw new AlbumError(ALBUM_UNAVAILABLE)
  await requireAccess(found.row, input.access)
  const [page, count] = await Promise.all([
    listApproved(db, storage, found.invitation.id, input.offset ?? 0),
    approvedCount(db, found.invitation.id),
  ])
  return { ...page, count }
}

/* ---------- uploading ---------- */

/** Who is uploading, already checked: the host, or a guest in the window. */
export type UploadScope = {
  invitationId: string
  byOwner: boolean
  ipHash?: string
}

export async function ownerUploadScope(
  db: AnyDb,
  input: { id: string; ownerId: string }
): Promise<UploadScope | null> {
  const invitation = await ownedInvitation(db, input)
  if (!invitation) return null
  if (!albumAvailable(invitation.plan)) throw new AlbumError(NOT_PREMIUM)
  return { invitationId: invitation.id, byOwner: true }
}

export async function guestUploadScope(
  db: AnyDb,
  input: { slug: string; access?: string },
  request: Pick<GuestRequest, "ipHash" | "now">
): Promise<UploadScope> {
  const now = request.now ?? new Date()
  const found = await publicAlbum(db, input.slug, now)
  if (!found) throw new AlbumError(ALBUM_UNAVAILABLE)
  await requireAccess(found.row, input.access)
  const state = uploadStateOf(found.row, found.invitation.config, now)
  if (state === "before") throw new AlbumError(UPLOADS_NOT_YET)
  if (state !== "open") throw new AlbumError(UPLOADS_CLOSED)
  return {
    invitationId: found.invitation.id,
    byOwner: false,
    ipHash: request.ipHash,
  }
}

const Name = (value: string) => cleanText(value).slice(0, 60)

/**
 * Open an upload session for `count` files. A guest session larger than
 * BULK_THRESHOLD starts out pending: its files stay hidden until the host
 * approves them.
 */
export async function startBatch(
  db: AnyDb,
  scope: UploadScope,
  input: {
    name: string
    count: number
    device?: string
    turnstileToken?: string
  },
  request?: GuestRequest
) {
  const count = input.count
  if (!Number.isInteger(count) || count < 1 || count > BATCH_MAX_FILES) {
    throw new AlbumError(
      `Choose between 1 and ${BATCH_MAX_FILES} files at a time.`
    )
  }
  const name = Name(input.name)
  if (!scope.byOwner && !name) throw new AlbumError("Please add your name.")
  const usage = await usageOf(db, scope.invitationId)
  if (usage.items + count > ALBUM_MAX_ITEMS || usage.bytes >= ALBUM_MAX_BYTES) {
    throw new AlbumError(ALBUM_FULL)
  }
  if (!scope.byOwner) {
    if (!request) throw new Error("guest batches need the request context")
    const key = `album-batch:${scope.invitationId}`
    const network = { key: `${key}:ip:${request.ipHash}` }
    const allowed = await request.limiter.hitAll(
      input.device
        ? [
            {
              key: `${key}:device:${await sha256Hex(`device:${input.device}`)}`,
              rules: BATCH_GUEST_RULES,
            },
            { ...network, rules: BATCH_NETWORK_RULES },
          ]
        : [{ ...network, rules: BATCH_GUEST_RULES }]
    )
    if (!allowed.ok) {
      throw new AlbumError(UPLOAD_TOO_MANY, allowed.retryAfterSec)
    }
    if (!(await request.verifyHuman(input.turnstileToken))) {
      throw new AlbumError(VERIFY_FAILED)
    }
  }
  const needsApproval = !scope.byOwner && count > BULK_THRESHOLD
  const batch = (
    await db
      .insert(albumBatches)
      .values({
        invitationId: scope.invitationId,
        uploaderName: name || "Host",
        byOwner: scope.byOwner,
        declaredCount: count,
        status: needsApproval ? "pending" : "approved",
        ipHash: scope.ipHash,
      })
      .returning({ id: albumBatches.id })
  ).at(0)
  if (!batch) throw new Error("batch insert returned nothing")
  return { batchId: batch.id, needsApproval }
}

async function openBatch(db: AnyDb, scope: UploadScope, batchId: string) {
  const batch = (
    await db
      .select()
      .from(albumBatches)
      .where(
        and(
          eq(albumBatches.id, batchId),
          eq(albumBatches.invitationId, scope.invitationId),
          eq(albumBatches.byOwner, scope.byOwner),
          isNull(albumBatches.finishedAt)
        )
      )
  ).at(0)
  if (!batch)
    throw new AlbumError("This upload has expired. Please start again.")
  return batch
}

export type PreparedItem = {
  itemId: string
  upload: UploadTarget
  thumb: UploadTarget | null
}

/** Sign the PUT for one file (and its preview) of an open batch. */
export async function prepareItem(
  db: AnyDb,
  storage: ServerStorage,
  scope: UploadScope,
  input: {
    batchId: string
    mime: string
    bytes: number
    thumb?: { mime: string; bytes: number }
  }
): Promise<PreparedItem> {
  const batch = await openBatch(db, scope, input.batchId)
  const verdict = checkAlbumFile(input.mime, input.bytes)
  if (!verdict.ok) throw new AlbumError(verdict.reason)
  const usage = await usageOf(db, scope.invitationId)
  if (usage.bytes + input.bytes > ALBUM_MAX_BYTES) {
    throw new AlbumError(ALBUM_FULL)
  }
  // Each file may be signed twice (one retry); beyond that the batch is done.
  const claimed = await db
    .update(albumBatches)
    .set({ preparedCount: sql`${albumBatches.preparedCount} + 1` })
    .where(
      and(
        eq(albumBatches.id, batch.id),
        lt(albumBatches.preparedCount, batch.declaredCount * 2)
      )
    )
    .returning({ id: albumBatches.id })
  if (claimed.length === 0) {
    throw new AlbumError("This upload has no files left. Please start again.")
  }
  const itemId = randomUUID()
  const upload = await storage.createUploadTarget({
    key: albumObjectKey(scope.invitationId, itemId, input.mime),
    mime: input.mime,
    bytes: input.bytes,
  })
  const thumb =
    input.thumb && checkAlbumThumb(input.thumb.mime, input.thumb.bytes)
      ? await storage.createUploadTarget({
          key: albumThumbKey(scope.invitationId, itemId, input.thumb.mime),
          mime: input.thumb.mime,
          bytes: input.thumb.bytes,
        })
      : null
  return { itemId, upload, thumb }
}

/** The first bytes of a stored object, enough to tell what it really is. */
async function readHead(
  storage: ServerStorage,
  key: string
): Promise<Uint8Array | null> {
  const source = storage.readRange
    ? await storage.readRange(key, 0, 31)
    : ((await storage.get(key))?.body ?? null)
  if (!source) return null
  if (source instanceof Uint8Array) return source.subarray(0, 32)
  const reader = source.getReader()
  try {
    const { value } = await reader.read()
    return value ? value.subarray(0, 32) : null
  } finally {
    await reader.cancel().catch(() => {})
  }
}

/** Head the object, re-check the rules and the real content type. */
async function verifyStored(
  storage: ServerStorage,
  key: string,
  check: (mime: string, bytes: number) => boolean
) {
  const info = await storage.head(key)
  if (!info) return null
  const head = check(info.mime, info.bytes)
    ? await readHead(storage, key)
    : null
  if (!head || !sniffAgrees(info.mime, sniffMedia(head))) {
    await storage.delete(key).catch(() => {})
    return null
  }
  return info
}

/**
 * Record one uploaded file. The keys are rebuilt from the item id, so a
 * caller can only confirm what `prepareItem` signed for this invitation.
 */
export async function confirmItem(
  db: AnyDb,
  storage: ServerStorage,
  scope: UploadScope,
  input: {
    batchId: string
    itemId: string
    mime: string
    thumbMime?: string
    width?: number
    height?: number
    durationSec?: number
  }
): Promise<AlbumItemView> {
  const batch = await openBatch(db, scope, input.batchId)
  const kind = checkAlbumFile(input.mime, 1)
  if (!kind.ok) throw new AlbumError(kind.reason)
  const key = albumObjectKey(scope.invitationId, input.itemId, input.mime)
  const thumbKey = input.thumbMime
    ? albumThumbKey(scope.invitationId, input.itemId, input.thumbMime)
    : null
  const drop = async (reason: string): Promise<never> => {
    await deleteObjects(storage, thumbKey ? [key, thumbKey] : [key])
    throw new AlbumError(reason)
  }

  const info = await verifyStored(
    storage,
    key,
    (mime, bytes) => checkAlbumFile(mime, bytes).ok
  )
  if (!info) {
    return drop("That file is not a photo or video we can accept.")
  }
  const thumb = thumbKey
    ? await verifyStored(storage, thumbKey, checkAlbumThumb)
    : null

  const existing = await db.$count(albumItems, eq(albumItems.batchId, batch.id))
  if (existing >= batch.declaredCount) {
    return drop("This upload has no files left. Please start again.")
  }
  const row = (
    await db
      .insert(albumItems)
      .values({
        id: input.itemId,
        invitationId: scope.invitationId,
        batchId: batch.id,
        kind: kind.kind,
        key,
        thumbKey: thumb ? thumbKey : null,
        mime: info.mime,
        bytes: info.bytes,
        width: input.width,
        height: input.height,
        durationSec: input.durationSec,
      })
      .onConflictDoNothing()
      .returning()
  ).at(0)
  if (!row) throw new AlbumError("That file was already added.")
  return toView(storage, { ...row, uploaderName: batch.uploaderName })
}

export type FinishedBatch = {
  count: number
  needsApproval: boolean
  /** Set when the host should be told a batch is waiting. */
  notify: {
    to: string
    title: string
    invitationId: string
    name: string
  } | null
}

/** Close a batch. An empty one is removed. */
export async function finishBatch(
  db: AnyDb,
  scope: UploadScope,
  batchId: string,
  now = new Date()
): Promise<FinishedBatch> {
  const batch = await openBatch(db, scope, batchId)
  const count = await db.$count(albumItems, eq(albumItems.batchId, batch.id))
  if (count === 0) {
    await db.delete(albumBatches).where(eq(albumBatches.id, batch.id))
    return { count: 0, needsApproval: false, notify: null }
  }
  await db
    .update(albumBatches)
    .set({ finishedAt: now })
    .where(eq(albumBatches.id, batch.id))
  const needsApproval = batch.status === "pending"
  if (!needsApproval) return { count, needsApproval, notify: null }
  const owner = (
    await db
      .select({
        email: schema.users.email,
        draftConfig: inv.draftConfig,
        publishedConfig: inv.publishedConfig,
      })
      .from(inv)
      .innerJoin(schema.users, eq(inv.ownerId, schema.users.id))
      .where(eq(inv.id, scope.invitationId))
  ).at(0)
  const config = (owner?.publishedConfig ?? owner?.draftConfig) as
    Partial<InvitationConfigBase> | undefined
  return {
    count,
    needsApproval,
    notify: owner
      ? {
          to: owner.email,
          title: config?.event?.title || "your invitation",
          invitationId: scope.invitationId,
          name: batch.uploaderName,
        }
      : null,
  }
}

/* ---------- housekeeping ---------- */

/**
 * Delete guest batches the host never answered (PENDING_BATCH_DAYS) and
 * upload sessions abandoned for a day with nothing in them. Run by the cron.
 */
export async function purgeStaleBatches(
  db: AnyDb,
  storage: ServerStorage,
  now = new Date()
): Promise<number> {
  const day = 86_400_000
  const pending = await db
    .select({ id: albumBatches.id })
    .from(albumBatches)
    .where(
      and(
        eq(albumBatches.status, "pending"),
        lt(
          albumBatches.createdAt,
          new Date(now.getTime() - PENDING_BATCH_DAYS * day)
        )
      )
    )
  for (const batch of pending) await removeBatch(db, storage, batch.id)
  await db
    .delete(albumBatches)
    .where(
      and(
        isNull(albumBatches.finishedAt),
        lt(albumBatches.createdAt, new Date(now.getTime() - day)),
        sql`not exists (select 1 from ${albumItems} where ${albumItems.batchId} = ${albumBatches.id})`
      )
    )
  return pending.length
}
