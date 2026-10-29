// @vitest-environment node
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import { createDraft } from "@/server/invitations/drafts.server"
import { publishInvitation } from "@/server/invitations/editing.server"
import type { Bytes, ServerStorage } from "@/server/storage/types"
import {
  OG_CACHE_CONTROL,
  getOrRenderCard,
  invalidateOgCard,
  ogCacheKey,
} from "./cache.server"
import { ogImageResponse } from "./og.server"

/** In-memory storage standing in for R2 / local disk. */
function memoryStorage() {
  const objects = new Map<string, { bytes: Bytes; mime: string }>()
  const deleted: Array<string> = []
  const driver: ServerStorage = {
    id: "local",
    createUploadTarget: async () => {
      throw new Error("not used")
    },
    head: async (key) => {
      const o = objects.get(key)
      return o ? { bytes: o.bytes.byteLength, mime: o.mime } : null
    },
    delete: async (key) => {
      objects.delete(key)
      deleted.push(key)
    },
    publicUrl: (key) => `https://cdn.test/${key}`,
    put: async (key, bytes, mime) => {
      objects.set(key, { bytes, mime })
    },
    get: async (key) => {
      const o = objects.get(key)
      return o ? { body: o.bytes, mime: o.mime } : null
    },
  }
  return { driver, objects, deleted }
}

const memory = memoryStorage()
// The publish hook resolves the app's storage itself; point it at memory.
vi.mock("@/server/storage/index.server", () => ({
  getStorage: () => memory.driver,
}))

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })
let draftId = ""
const FAKE_PNG: Bytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3])

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
  await db.insert(schema.users).values(DEV_USER)
  draftId = (
    await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "birthday/confetti-pop",
    })
  ).id
}, 30_000)
afterAll(async () => client.close())

describe("GET /og/<slug>.png", () => {
  const render = vi.fn(async () => FAKE_PNG)
  const deps = () => ({ db, storage: memory.driver, render })

  it("404s for unknown, unpublished and malformed slugs", async () => {
    expect((await ogImageResponse("party-time", deps())).status).toBe(404)
    expect((await ogImageResponse("../etc", deps())).status).toBe(404)
    expect((await ogImageResponse("a", deps())).status).toBe(404)
    expect(render).not.toHaveBeenCalled()
  })

  let firstKey = ""
  it("renders and stores on a miss, then serves the stored card", async () => {
    const { publishedAt } = await publishInvitation(db, {
      id: draftId,
      ownerId: DEV_USER.id,
      slug: "party-time",
    })
    firstKey = ogCacheKey(draftId, publishedAt)
    expect(firstKey).toBe(`og/${draftId}-${Date.parse(publishedAt)}.png`)

    const miss = await ogImageResponse("Party-Time", deps())
    expect(miss.status).toBe(200)
    expect(miss.headers.get("content-type")).toBe("image/png")
    expect(miss.headers.get("cache-control")).toBe(OG_CACHE_CONTROL)
    expect(miss.headers.get("x-og-cache")).toBe("miss")
    expect(new Uint8Array(await miss.arrayBuffer())).toEqual(FAKE_PNG)
    expect(memory.objects.get(firstKey)?.mime).toBe("image/png")

    const hit = await ogImageResponse("party-time", deps())
    expect(hit.headers.get("x-og-cache")).toBe("hit")
    expect(new Uint8Array(await hit.arrayBuffer())).toEqual(FAKE_PNG)
    expect(render).toHaveBeenCalledTimes(1)
  })

  it("republishing drops the old card and renders a new one", async () => {
    render.mockClear()
    await new Promise((resolve) => setTimeout(resolve, 5))
    const { publishedAt } = await publishInvitation(db, {
      id: draftId,
      ownerId: DEV_USER.id,
      slug: "party-time",
    })
    expect(memory.deleted).toContain(firstKey)
    expect(memory.objects.has(firstKey)).toBe(false)

    const res = await ogImageResponse("party-time", deps())
    expect(res.headers.get("x-og-cache")).toBe("miss")
    expect(memory.objects.has(ogCacheKey(draftId, publishedAt))).toBe(true)
    expect(render).toHaveBeenCalledTimes(1)
  })

  it("answers 500 without caching when rendering fails", async () => {
    memory.objects.clear()
    const failing = vi.fn(async (): Promise<Bytes> => {
      throw new Error("boom")
    })
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    const res = await ogImageResponse("party-time", {
      db,
      storage: memory.driver,
      render: failing,
    })
    expect(res.status).toBe(500)
    expect(res.headers.get("cache-control")).toBe("no-store")
    expect(memory.objects.size).toBe(0)
    spy.mockRestore()
  })
})

describe("cache helpers", () => {
  it("serves a fresh render even when storage is down", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const broken = {
      get: async () => {
        throw new Error("down")
      },
      put: async () => {
        throw new Error("down")
      },
    }
    const result = await getOrRenderCard(
      broken,
      { id: "x", publishedAt: new Date().toISOString() },
      async () => FAKE_PNG
    )
    expect(result).toEqual({ body: FAKE_PNG, hit: false })
    warn.mockRestore()
  })

  it("invalidation is best effort and skips first publishes", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    const del = vi.fn(async () => {
      throw new Error("down")
    })
    await expect(
      invalidateOgCard({ delete: del }, "x", new Date())
    ).resolves.toBeUndefined()
    await invalidateOgCard({ delete: del }, "x", null)
    expect(del).toHaveBeenCalledTimes(1)
    warn.mockRestore()
  })
})
