// Server functions for the event album: the host's (dashboard, editor tab)
// and the guests' (`/i/<slug>/album`). Safe to import from routes: the build
// replaces handlers with RPC stubs on the client.
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { z } from "zod"
import { serverEnv } from "@/env.server"
import { DEVICE_ID_PATTERN } from "@/lib/guest-device"
import {
  UnauthorizedError,
  requireUserId,
} from "@/server/auth/current-user.server"
import { getDb } from "@/server/db/client.server"
import { sendEmail } from "@/server/email/send.server"
import { albumBatchEmail } from "@/server/email/templates.server"
import { fingerprint } from "@/server/public/fingerprint.server"
import { humanCheck } from "@/server/public/turnstile.server"
import { getRateLimiter } from "@/server/rate-limit/limiter.server"
import { getStorage } from "@/server/storage/index.server"
import {
  AlbumError,
  confirmItem,
  decideBatch,
  deleteItems,
  finishBatch,
  getOwnerAlbum,
  getPublicAlbum,
  guestUploadScope,
  listOwnerItems,
  listPublicItems,
  ownerUploadScope,
  prepareItem,
  startBatch,
  unlockAlbum,
  updateAlbumSettings,
  type FinishedBatch,
  type GuestRequest,
  type UploadScope,
} from "./album.server"

const NOT_FOUND = "Invitation not found."

/** Only messages written for people leave the server. */
function publicError(error: unknown): Error {
  if (error instanceof AlbumError || error instanceof UnauthorizedError) {
    return new Error(error.message)
  }
  if (error instanceof Error && error.message === NOT_FOUND) return error
  console.error("[album]", error)
  return new Error("Something went wrong. Please try again.")
}

async function run<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work()
  } catch (error) {
    throw publicError(error)
  }
}

function found<T>(value: T | null | false): T {
  if (value === null || value === false) throw new Error(NOT_FOUND)
  return value
}

async function guestRequest(): Promise<GuestRequest> {
  const { ipHash } = await fingerprint(new Headers(getRequestHeaders()))
  return {
    ipHash,
    limiter: getRateLimiter(),
    verifyHuman: humanCheck(serverEnv.TURNSTILE_SECRET_KEY),
  }
}

const Slug = z.string().trim().toLowerCase().min(1).max(80)
const Access = z
  .string()
  .regex(/^[0-9a-f]{64}$/)
  .optional()
  .catch(undefined)
const Offset = z.int().min(0).max(100_000).default(0)

/**
 * Who is uploading: the host (by invitation id, signed in) or a guest (by
 * slug, plus the album access key when there is a PIN).
 */
const Uploader = z.union([
  z.object({ invitationId: z.uuid() }),
  z.object({ slug: Slug, access: Access }),
])
type Uploader = z.infer<typeof Uploader>

async function scopeFor(
  who: Uploader,
  request?: GuestRequest
): Promise<UploadScope> {
  const db = getDb()
  if ("invitationId" in who) {
    const ownerId = await requireUserId(db)
    return found(await ownerUploadScope(db, { id: who.invitationId, ownerId }))
  }
  return guestUploadScope(db, who, request ?? (await guestRequest()))
}

/* ---------- host ---------- */

export const getOwnerAlbumFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.uuid() }))
  .handler(({ data }) =>
    run(async () => {
      const db = getDb()
      const ownerId = await requireUserId(db)
      return getOwnerAlbum(db, getStorage(), { id: data.id, ownerId })
    })
  )

export const listOwnerAlbumItemsFn = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.uuid(), offset: Offset }))
  .handler(({ data }) =>
    run(async () => {
      const db = getDb()
      const ownerId = await requireUserId(db)
      return found(await listOwnerItems(db, getStorage(), { ...data, ownerId }))
    })
  )

export const updateAlbumSettingsFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.uuid(),
      enabled: z.boolean().optional(),
      guestUploads: z.boolean().optional(),
      downloads: z.boolean().optional(),
      pin: z.string().max(8).nullable().optional(),
    })
  )
  .handler(({ data }) =>
    run(async () => {
      const db = getDb()
      const ownerId = await requireUserId(db)
      return found(await updateAlbumSettings(db, { ...data, ownerId }))
    })
  )

export const decideAlbumBatchFn = createServerFn({ method: "POST" })
  .validator(z.object({ batchId: z.uuid(), approve: z.boolean() }))
  .handler(({ data }) =>
    run(async () => {
      const db = getDb()
      const ownerId = await requireUserId(db)
      found(await decideBatch(db, getStorage(), { ...data, ownerId }))
      return { ok: true as const }
    })
  )

export const deleteAlbumItemsFn = createServerFn({ method: "POST" })
  .validator(
    z.object({ id: z.uuid(), itemIds: z.array(z.uuid()).min(1).max(200) })
  )
  .handler(({ data }) =>
    run(async () => {
      const db = getDb()
      const ownerId = await requireUserId(db)
      return {
        deleted: found(
          await deleteItems(db, getStorage(), { ...data, ownerId })
        ),
      }
    })
  )

/* ---------- guests ---------- */

/** Page data for `/i/<slug>/album`; null when there is no album to show. */
export const getPublicAlbumFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: Slug }))
  .handler(({ data }) => run(() => getPublicAlbum(getDb(), data.slug)))

export const unlockAlbumFn = createServerFn({ method: "POST" })
  .validator(z.object({ slug: Slug, pin: z.string().max(12) }))
  .handler(({ data }) =>
    run(async () => unlockAlbum(getDb(), data, await guestRequest()))
  )

export const listAlbumItemsFn = createServerFn({ method: "GET" })
  .validator(z.object({ slug: Slug, access: Access, offset: Offset }))
  .handler(({ data }) =>
    run(() => listPublicItems(getDb(), getStorage(), data))
  )

/* ---------- uploading (host and guests) ---------- */

export const startAlbumBatchFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      who: Uploader,
      name: z.string().max(120).default(""),
      count: z.int().min(1).max(10_000),
      device: z.string().regex(DEVICE_ID_PATTERN).optional().catch(undefined),
      turnstileToken: z.string().max(4096).optional(),
    })
  )
  .handler(({ data }) =>
    run(async () => {
      const request = "slug" in data.who ? await guestRequest() : undefined
      const scope = await scopeFor(data.who, request)
      return startBatch(getDb(), scope, data, request)
    })
  )

export const prepareAlbumItemFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      who: Uploader,
      batchId: z.uuid(),
      mime: z.string().max(100),
      bytes: z.int().positive(),
      thumb: z
        .object({ mime: z.string().max(100), bytes: z.int().positive() })
        .optional(),
    })
  )
  .handler(({ data }) =>
    run(async () =>
      prepareItem(getDb(), getStorage(), await scopeFor(data.who), data)
    )
  )

export const confirmAlbumItemFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      who: Uploader,
      batchId: z.uuid(),
      itemId: z.uuid(),
      mime: z.string().max(100),
      thumbMime: z.string().max(100).optional(),
      width: z.int().positive().max(30_000).optional(),
      height: z.int().positive().max(30_000).optional(),
      durationSec: z.number().positive().max(86_400).optional(),
    })
  )
  .handler(({ data }) =>
    run(async () =>
      confirmItem(getDb(), getStorage(), await scopeFor(data.who), data)
    )
  )

async function notifyHost(notify: FinishedBatch["notify"], count: number) {
  if (!notify) return
  try {
    await sendEmail(
      albumBatchEmail({
        to: notify.to,
        title: notify.title,
        name: notify.name,
        count,
        url: `${serverEnv.APP_ORIGIN}/dashboard/${notify.invitationId}/album`,
      })
    )
  } catch (error) {
    // The batch is on the dashboard either way.
    console.error("[album] approval email failed", error)
  }
}

export const finishAlbumBatchFn = createServerFn({ method: "POST" })
  .validator(z.object({ who: Uploader, batchId: z.uuid() }))
  .handler(({ data }) =>
    run(async () => {
      const scope = await scopeFor(data.who)
      const { notify, ...result } = await finishBatch(
        getDb(),
        scope,
        data.batchId
      )
      await notifyHost(notify, result.count)
      return result
    })
  )
