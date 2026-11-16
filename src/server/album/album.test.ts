// @vitest-environment node
import { PGlite } from "@electric-sql/pglite"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { BULK_THRESHOLD, albumObjectKey, albumThumbKey } from "@/lib/album"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import { createDraft } from "@/server/invitations/drafts.server"
import { publishInvitation } from "@/server/invitations/editing.server"
import { MemoryRateLimiter } from "@/server/rate-limit"
import type { ServerStorage } from "@/server/storage/types"
import {
  ALBUM_UNAVAILABLE,
  albumAccess,
  AlbumError,
  NOT_PREMIUM,
  PIN_REQUIRED,
  PIN_TOO_MANY,
  PIN_WRONG,
  UPLOADS_CLOSED,
  UPLOADS_NOT_YET,
  confirmItem,
  decideBatch,
  deleteItems,
  finishBatch,
  getOwnerAlbum,
  getPublicAlbum,
  guestUploadScope,
  hasPublicAlbum,
  listPublicItems,
  ownerUploadScope,
  prepareItem,
  purgeStaleBatches,
  startBatch,
  unlockAlbum,
  updateAlbumSettings,
  type GuestRequest,
  type UploadScope,
} from "./album.server"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })
const SLUG = "amara-and-kofi"
const owner = { ownerId: DEV_USER.id }
let invitationId = ""

// The sample wedding is on 12 June 2027 in Nairobi.
const BEFORE = new Date("2027-06-11T12:00:00+03:00")
const EVENT_DAY = new Date("2027-06-12T10:00:00+03:00")
const LAST_GRACE_DAY = new Date("2027-06-19T23:00:00+03:00")
const AFTER = new Date("2027-06-20T00:30:00+03:00")

const JPEG = new Uint8Array([
  0xff, 0xd8, 0xff, 0xe0, 0, 16, 74, 70, 73, 70, 0, 1,
])
const MP4 = new Uint8Array([
  0, 0, 0, 24, 102, 116, 121, 112, 105, 115, 111, 109,
])
const TEXT = new TextEncoder().encode("#!/bin/sh\necho not a photo\n")

/** In-memory storage: tests "upload" by writing the bytes directly. */
function memoryStorage() {
  const objects = new Map<
    string,
    { mime: string; body: Uint8Array<ArrayBuffer> }
  >()
  const storage: ServerStorage = {
    id: "local",
    createUploadTarget: ({ key, mime }) =>
      Promise.resolve({
        url: `https://upload.test/${key}`,
        method: "PUT",
        headers: { "Content-Type": mime },
        expiresAt: new Date().toISOString(),
      }),
    head: (key) => {
      const object = objects.get(key)
      return Promise.resolve(
        object ? { bytes: object.body.byteLength, mime: object.mime } : null
      )
    },
    delete: (key) => {
      objects.delete(key)
      return Promise.resolve()
    },
    publicUrl: (key) => `https://cdn.test/${key}`,
    put: (key, body, mime) => {
      objects.set(key, { mime, body })
      return Promise.resolve()
    },
    get: (key) => {
      const object = objects.get(key)
      return Promise.resolve(object ?? null)
    },
  }
  return { storage, objects }
}

function guest(overrides: Partial<GuestRequest> = {}): GuestRequest {
  return {
    ipHash: "ip-1",
    limiter: new MemoryRateLimiter(),
    verifyHuman: () => Promise.resolve(true),
    now: EVENT_DAY,
    ...overrides,
  }
}

const setPlan = (plan: "free" | "premium") =>
  db
    .update(schema.invitations)
    .set({ plan })
    .where(eq(schema.invitations.id, invitationId))

/** Upload `count` files through the whole flow; returns the item ids. */
async function upload(
  store: ReturnType<typeof memoryStorage>,
  scope: UploadScope,
  count: number,
  options: { name?: string; request?: GuestRequest; body?: Uint8Array } = {}
) {
  const batch = await startBatch(
    db,
    scope,
    { name: options.name ?? "Wanjiru", count },
    scope.byOwner ? undefined : (options.request ?? guest())
  )
  const ids: Array<string> = []
  for (let i = 0; i < count; i++) {
    const prepared = await prepareItem(db, store.storage, scope, {
      batchId: batch.batchId,
      mime: "image/jpeg",
      bytes: 12,
      thumb: { mime: "image/jpeg", bytes: 12 },
    })
    const body = (options.body ?? JPEG) as Uint8Array<ArrayBuffer>
    await store.storage.put(
      albumObjectKey(scope.invitationId, prepared.itemId, "image/jpeg"),
      body,
      "image/jpeg"
    )
    await store.storage.put(
      albumThumbKey(scope.invitationId, prepared.itemId, "image/jpeg"),
      JPEG,
      "image/jpeg"
    )
    await confirmItem(db, store.storage, scope, {
      batchId: batch.batchId,
      itemId: prepared.itemId,
      mime: "image/jpeg",
      thumbMime: "image/jpeg",
      width: 1200,
      height: 800,
    })
    ids.push(prepared.itemId)
  }
  const finished = await finishBatch(db, scope, batch.batchId)
  return { ...batch, ids, finished }
}

const guestScope = (request = guest(), access?: string) =>
  guestUploadScope(db, { slug: SLUG, access }, request)

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
  await db.insert(schema.users).values(DEV_USER)
  invitationId = (
    await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "wedding/ivory-garden",
    })
  ).id
  await publishInvitation(db, { ...owner, id: invitationId, slug: SLUG })
}, 30_000)
afterAll(async () => client.close())

beforeEach(async () => {
  await db.delete(schema.albumBatches)
  await db.delete(schema.albums)
  await setPlan("premium")
  await updateAlbumSettings(db, { ...owner, id: invitationId, enabled: true })
})

describe("album settings", () => {
  it("is off until the host switches it on, and Premium only", async () => {
    await db.delete(schema.albums)
    expect(await getPublicAlbum(db, SLUG, EVENT_DAY)).toBeNull()

    await setPlan("free")
    await expect(
      updateAlbumSettings(db, { ...owner, id: invitationId, enabled: true })
    ).rejects.toThrow(NOT_PREMIUM)

    await setPlan("premium")
    await updateAlbumSettings(db, { ...owner, id: invitationId, enabled: true })
    expect(
      await hasPublicAlbum(db, { id: invitationId, plan: "premium" })
    ).toBe(true)
    // Downgraded later: the album disappears for guests.
    await setPlan("free")
    expect(await getPublicAlbum(db, SLUG, EVENT_DAY)).toBeNull()
  })

  it("works on free invitations while the free preview is switched on", async () => {
    await db.delete(schema.albums)
    await setPlan("free")
    albumAccess.freePreview = true
    try {
      await updateAlbumSettings(db, {
        ...owner,
        id: invitationId,
        enabled: true,
      })
      expect((await getPublicAlbum(db, SLUG, EVENT_DAY))?.slug).toBe(SLUG)
      const store = memoryStorage()
      const scope = await ownerUploadScope(db, { ...owner, id: invitationId })
      expect((await upload(store, scope!, 1)).ids).toHaveLength(1)
      const album = await getOwnerAlbum(db, store.storage, {
        ...owner,
        id: invitationId,
      })
      expect(album?.invitation.albumAvailable).toBe(true)
    } finally {
      albumAccess.freePreview = false
    }
    expect(await getPublicAlbum(db, SLUG, EVENT_DAY)).toBeNull()
  })

  it("only changes an invitation the caller owns", async () => {
    expect(
      await updateAlbumSettings(db, {
        ownerId: "someone-else",
        id: invitationId,
        enabled: false,
      })
    ).toBeNull()
    expect((await getPublicAlbum(db, SLUG, EVENT_DAY))?.slug).toBe(SLUG)
  })

  it("rejects a PIN that is not 4 to 8 digits", async () => {
    await expect(
      updateAlbumSettings(db, { ...owner, id: invitationId, pin: "12a4" })
    ).rejects.toBeInstanceOf(AlbumError)
  })
})

describe("guest upload window", () => {
  it("opens on the event day and closes after seven more days", async () => {
    const at = async (now: Date) =>
      (await getPublicAlbum(db, SLUG, now))?.uploads
    expect(await at(BEFORE)).toBe("before")
    expect(await at(EVENT_DAY)).toBe("open")
    expect(await at(LAST_GRACE_DAY)).toBe("open")
    expect(await at(AFTER)).toBe("closed")

    await expect(guestScope(guest({ now: BEFORE }))).rejects.toThrow(
      UPLOADS_NOT_YET
    )
    await expect(guestScope(guest({ now: AFTER }))).rejects.toThrow(
      UPLOADS_CLOSED
    )
  })

  it("lets the host switch guest uploads off, and upload at any time", async () => {
    await updateAlbumSettings(db, {
      ...owner,
      id: invitationId,
      guestUploads: false,
    })
    expect((await getPublicAlbum(db, SLUG, EVENT_DAY))?.uploads).toBe("off")
    await expect(guestScope()).rejects.toThrow(UPLOADS_CLOSED)

    const store = memoryStorage()
    const scope = await ownerUploadScope(db, { ...owner, id: invitationId })
    const done = await upload(store, scope!, 2)
    expect(done.needsApproval).toBe(false)
    expect(
      (await listPublicItems(db, store.storage, { slug: SLUG })).count
    ).toBe(2)
  })
})

describe("uploads", () => {
  it("shows a small guest batch at once", async () => {
    const store = memoryStorage()
    const done = await upload(store, await guestScope(), 3)
    expect(done.needsApproval).toBe(false)
    const page = await listPublicItems(db, store.storage, { slug: SLUG })
    expect(page.count).toBe(3)
    expect(page.items[0]).toMatchObject({
      kind: "image",
      uploaderName: "Wanjiru",
      width: 1200,
    })
    expect(page.items[0].url).toContain(`album/${invitationId}/`)
    expect(page.items[0].thumbUrl).toContain(".thumb.jpg")
  })

  it("holds a large guest batch until the host approves it", async () => {
    const store = memoryStorage()
    const done = await upload(store, await guestScope(), BULK_THRESHOLD + 1, {
      name: "Studio Kamau",
    })
    expect(done.needsApproval).toBe(true)
    expect(done.finished.notify).toMatchObject({
      to: DEV_USER.email,
      name: "Studio Kamau",
    })
    expect(
      (await listPublicItems(db, store.storage, { slug: SLUG })).count
    ).toBe(0)

    const album = await getOwnerAlbum(
      db,
      store.storage,
      { ...owner, id: invitationId },
      EVENT_DAY
    )
    expect(album?.pending).toHaveLength(1)
    expect(album?.pending[0]).toMatchObject({
      uploaderName: "Studio Kamau",
      count: BULK_THRESHOLD + 1,
      finished: true,
    })
    expect(album?.items).toHaveLength(0)

    // Someone else cannot decide it.
    expect(
      await decideBatch(db, store.storage, {
        batchId: done.batchId,
        ownerId: "someone-else",
        approve: true,
      })
    ).toBe(false)
    expect(
      await decideBatch(db, store.storage, {
        ...owner,
        batchId: done.batchId,
        approve: true,
      })
    ).toBe(true)
    expect(
      (await listPublicItems(db, store.storage, { slug: SLUG })).count
    ).toBe(BULK_THRESHOLD + 1)
  })

  it("deletes the files of a rejected batch", async () => {
    const store = memoryStorage()
    const done = await upload(store, await guestScope(), BULK_THRESHOLD + 1)
    expect(store.objects.size).toBe((BULK_THRESHOLD + 1) * 2)
    await decideBatch(db, store.storage, {
      ...owner,
      batchId: done.batchId,
      approve: false,
    })
    expect(store.objects.size).toBe(0)
    expect(await db.$count(schema.albumItems)).toBe(0)
  })

  it("refuses a file whose bytes are not what it claims to be", async () => {
    const store = memoryStorage()
    const scope = await guestScope()
    await expect(upload(store, scope, 1, { body: TEXT })).rejects.toThrow(
      /not a photo or video/
    )
    expect(store.objects.size).toBe(0)
    expect(await db.$count(schema.albumItems)).toBe(0)
  })

  it("accepts a video and rejects types outside the list", async () => {
    const store = memoryStorage()
    const scope = await guestScope()
    const batch = await startBatch(
      db,
      scope,
      { name: "Kip", count: 2 },
      guest()
    )
    const video = await prepareItem(db, store.storage, scope, {
      batchId: batch.batchId,
      mime: "video/mp4",
      bytes: 12,
    })
    await store.storage.put(
      albumObjectKey(invitationId, video.itemId, "video/mp4"),
      MP4,
      "video/mp4"
    )
    const item = await confirmItem(db, store.storage, scope, {
      batchId: batch.batchId,
      itemId: video.itemId,
      mime: "video/mp4",
      durationSec: 12.5,
    })
    expect(item).toMatchObject({ kind: "video", thumbUrl: null })

    await expect(
      prepareItem(db, store.storage, scope, {
        batchId: batch.batchId,
        mime: "application/zip",
        bytes: 12,
      })
    ).rejects.toBeInstanceOf(AlbumError)
    await expect(
      prepareItem(db, store.storage, scope, {
        batchId: batch.batchId,
        mime: "video/mp4",
        bytes: 500 * 1024 * 1024,
      })
    ).rejects.toThrow(/Too large/)
  })

  it("accepts no more files than the batch announced", async () => {
    const store = memoryStorage()
    const scope = await guestScope()
    const batch = await startBatch(
      db,
      scope,
      { name: "Kip", count: 1 },
      guest()
    )
    const put = async () => {
      const prepared = await prepareItem(db, store.storage, scope, {
        batchId: batch.batchId,
        mime: "image/jpeg",
        bytes: 12,
      })
      await store.storage.put(
        albumObjectKey(invitationId, prepared.itemId, "image/jpeg"),
        JPEG,
        "image/jpeg"
      )
      return confirmItem(db, store.storage, scope, {
        batchId: batch.batchId,
        itemId: prepared.itemId,
        mime: "image/jpeg",
      })
    }
    await put()
    await expect(put()).rejects.toThrow(/no files left/)
    // One retry per file is signed, no more.
    await expect(
      prepareItem(db, store.storage, scope, {
        batchId: batch.batchId,
        mime: "image/jpeg",
        bytes: 12,
      })
    ).rejects.toThrow(/no files left/)
    expect(await db.$count(schema.albumItems)).toBe(1)
  })

  it("asks guests for a name and limits how many batches they start", async () => {
    const scope = await guestScope()
    await expect(
      startBatch(db, scope, { name: "  ", count: 1 }, guest())
    ).rejects.toThrow(/name/)

    const request = guest()
    for (let i = 0; i < 6; i++) {
      await startBatch(db, scope, { name: "Kip", count: 1 }, request)
    }
    await expect(
      startBatch(db, scope, { name: "Kip", count: 1 }, request)
    ).rejects.toThrow(/wait/)
    await expect(
      startBatch(
        db,
        scope,
        { name: "Kip", count: 1 },
        guest({ verifyHuman: () => Promise.resolve(false) })
      )
    ).rejects.toThrow(/verification/)
  })

  it("lets the host delete items, files included", async () => {
    const store = memoryStorage()
    const done = await upload(store, await guestScope(), 3)
    expect(
      await deleteItems(db, store.storage, {
        ownerId: "someone-else",
        id: invitationId,
        itemIds: done.ids,
      })
    ).toBeNull()
    expect(
      await deleteItems(db, store.storage, {
        ...owner,
        id: invitationId,
        itemIds: done.ids.slice(0, 2),
      })
    ).toBe(2)
    expect(store.objects.size).toBe(2)
    expect(
      (await listPublicItems(db, store.storage, { slug: SLUG })).count
    ).toBe(1)
  })
})

describe("PIN", () => {
  const withPin = (pin: string | null) =>
    updateAlbumSettings(db, { ...owner, id: invitationId, pin })

  it("hides the album until the right PIN is entered", async () => {
    const store = memoryStorage()
    await upload(store, await guestScope(), 1)
    await withPin("4821")

    const page = await getPublicAlbum(db, SLUG, EVENT_DAY)
    expect(page).toMatchObject({ pinRequired: true, count: null })
    await expect(
      listPublicItems(db, store.storage, { slug: SLUG })
    ).rejects.toThrow(PIN_REQUIRED)
    await expect(
      listPublicItems(db, store.storage, { slug: SLUG, access: "0".repeat(64) })
    ).rejects.toThrow(PIN_REQUIRED)
    await expect(guestScope()).rejects.toThrow(PIN_REQUIRED)

    await expect(
      unlockAlbum(db, { slug: SLUG, pin: "0000" }, guest())
    ).rejects.toThrow(PIN_WRONG)
    const { access } = await unlockAlbum(
      db,
      { slug: SLUG, pin: "4821" },
      guest()
    )
    expect(access).toMatch(/^[0-9a-f]{64}$/)
    expect(
      (
        await listPublicItems(db, store.storage, {
          slug: SLUG,
          access: access!,
        })
      ).count
    ).toBe(1)
    expect((await guestScope(guest(), access!)).invitationId).toBe(invitationId)
  })

  it("ends earlier access when the PIN changes or is removed", async () => {
    const store = memoryStorage()
    await withPin("4821")
    const { access } = await unlockAlbum(
      db,
      { slug: SLUG, pin: "4821" },
      guest()
    )
    await withPin("4821")
    await expect(
      listPublicItems(db, store.storage, { slug: SLUG, access: access! })
    ).rejects.toThrow(PIN_REQUIRED)

    await withPin(null)
    expect(
      (await listPublicItems(db, store.storage, { slug: SLUG })).count
    ).toBe(0)
    expect(await unlockAlbum(db, { slug: SLUG, pin: "" }, guest())).toEqual({
      access: null,
    })
  })

  it("stops guessing: after the limit even the right PIN is refused", async () => {
    await withPin("4821")
    const request = guest()
    for (let i = 0; i < 8; i++) {
      await expect(
        unlockAlbum(db, { slug: SLUG, pin: String(1000 + i) }, request)
      ).rejects.toThrow(PIN_WRONG)
    }
    await expect(
      unlockAlbum(db, { slug: SLUG, pin: "4821" }, request)
    ).rejects.toThrow(PIN_TOO_MANY)
    // Another network is not affected.
    const other = guest({ ipHash: "ip-2" })
    expect(
      (await unlockAlbum(db, { slug: SLUG, pin: "4821" }, other)).access
    ).toBeTruthy()
  })

  it("never stores the PIN itself", async () => {
    await withPin("4821")
    const row = (await db.select().from(schema.albums)).at(0)
    expect(JSON.stringify(row)).not.toContain("4821")
    expect(row?.pinHash).toMatch(/^[0-9a-f]{64}$/)
  })
})

describe("unavailable albums", () => {
  it("refuses everything for an unknown or unpublished invitation", async () => {
    const store = memoryStorage()
    expect(await getPublicAlbum(db, "nope", EVENT_DAY)).toBeNull()
    await expect(
      listPublicItems(db, store.storage, { slug: "nope" })
    ).rejects.toThrow(ALBUM_UNAVAILABLE)
    await expect(
      guestUploadScope(db, { slug: "nope" }, guest())
    ).rejects.toThrow(ALBUM_UNAVAILABLE)
  })
})

describe("purgeStaleBatches", () => {
  it("deletes pending batches the host never answered", async () => {
    const store = memoryStorage()
    const old = await upload(store, await guestScope(), BULK_THRESHOLD + 1)
    const small = await upload(store, await guestScope(), 1)
    const in13 = new Date(Date.now() + 13 * 86_400_000)
    const in15 = new Date(Date.now() + 15 * 86_400_000)

    expect(await purgeStaleBatches(db, store.storage, in13)).toBe(0)
    expect(await purgeStaleBatches(db, store.storage, in15)).toBe(1)
    const left = await db
      .select({ id: schema.albumBatches.id })
      .from(schema.albumBatches)
    expect(left.map((b) => b.id)).toEqual([small.batchId])
    expect(left.map((b) => b.id)).not.toContain(old.batchId)
    expect(store.objects.size).toBe(2)
  })
})
