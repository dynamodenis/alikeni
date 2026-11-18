// @vitest-environment node
import { PGlite } from "@electric-sql/pglite"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { deepMerge } from "@/lib/deep-merge"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import { createDraft, getOwnedInvitation } from "./drafts.server"
import {
  EditorError,
  checkSlug,
  getPublishedBySlug,
  publishInvitation,
  saveDraft,
} from "./editing.server"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })
const OTHER = { id: "other-user", email: "other@example.com" }
let draftId = ""
let loadedAt = ""

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
  await db.insert(schema.users).values([DEV_USER, OTHER])
  draftId = (
    await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "birthday/confetti-pop",
    })
  ).id
  loadedAt = (await getOwnedInvitation(db, {
    id: draftId,
    ownerId: DEV_USER.id,
  }))!.updatedAt.toISOString()
}, 30_000)
afterAll(async () => client.close())

async function current() {
  return (await getOwnedInvitation(db, { id: draftId, ownerId: DEV_USER.id }))!
}

describe("saveDraft", () => {
  it("saves a valid config and returns the new version", async () => {
    const config = deepMerge((await current()).draftConfig, {
      texts: { headline: "Zuri turns 7!" },
      age: 7,
    })
    const { updatedAt } = await saveDraft(db, {
      id: draftId,
      ownerId: DEV_USER.id,
      config,
      baseUpdatedAt: loadedAt,
    })
    expect((await current()).draftConfig.texts.headline).toBe("Zuri turns 7!")
    expect(updatedAt).not.toBe(loadedAt)
    loadedAt = updatedAt
  })

  it("detects a conflicting edit from another session", async () => {
    const stale = loadedAt
    const config = (await current()).draftConfig
    loadedAt = (
      await saveDraft(db, {
        id: draftId,
        ownerId: DEV_USER.id,
        config,
        baseUpdatedAt: stale,
      })
    ).updatedAt
    const attempt = saveDraft(db, {
      id: draftId,
      ownerId: DEV_USER.id,
      config,
      baseUpdatedAt: stale,
    })
    await expect(attempt).rejects.toMatchObject({ code: "conflict" })
    // `force` overwrites deliberately.
    loadedAt = (
      await saveDraft(db, {
        id: draftId,
        ownerId: DEV_USER.id,
        config,
        baseUpdatedAt: stale,
        force: true,
      })
    ).updatedAt
  })

  it("refuses invalid configs (template schema) and other owners", async () => {
    const config = deepMerge((await current()).draftConfig, { age: -3 })
    await expect(
      saveDraft(db, {
        id: draftId,
        ownerId: DEV_USER.id,
        config,
        baseUpdatedAt: loadedAt,
      })
    ).rejects.toMatchObject({
      code: "invalid",
    })
    await expect(
      saveDraft(db, {
        id: draftId,
        ownerId: OTHER.id,
        config: (await current()).draftConfig,
        baseUpdatedAt: loadedAt,
      })
    ).rejects.toMatchObject({ code: "not_found" })
  })
})

describe("slugs and publishing", () => {
  it("checks format, reserved words and uniqueness", async () => {
    expect(await checkSlug(db, { slug: "ab" })).toMatchObject({
      available: false,
    })
    expect(await checkSlug(db, { slug: "templates" })).toMatchObject({
      available: false,
      reason: expect.stringMatching(/reserved/),
    })
    expect(await checkSlug(db, { slug: "zuri-turns-seven" })).toEqual({
      available: true,
    })
  })

  it("publishes the draft and serves it publicly", async () => {
    expect(await getPublishedBySlug(db, "zuri-turns-seven")).toBeNull()
    const published = await publishInvitation(db, {
      id: draftId,
      ownerId: DEV_USER.id,
      slug: "Zuri-Turns-Seven",
    })
    expect(published.slug).toBe("zuri-turns-seven")
    const page = await getPublishedBySlug(db, "zuri-turns-seven")
    expect(page?.templateId).toBe("birthday/confetti-pop")
    expect(page?.config.texts.headline).toBe("Zuri turns 7!")
    expect((await current()).status).toBe("published")
    // Its own slug is still "available" to itself (republish), not to others.
    expect(
      await checkSlug(db, { slug: "zuri-turns-seven", id: draftId })
    ).toEqual({ available: true })
    expect(await checkSlug(db, { slug: "zuri-turns-seven" })).toMatchObject({
      available: false,
    })
  })

  it("keeps the published version until the next publish", async () => {
    const config = deepMerge((await current()).draftConfig, {
      texts: { headline: "Draft-only change" },
    })
    loadedAt = (
      await saveDraft(db, {
        id: draftId,
        ownerId: DEV_USER.id,
        config,
        baseUpdatedAt: (await current()).updatedAt.toISOString(),
      })
    ).updatedAt
    expect(
      (await getPublishedBySlug(db, "zuri-turns-seven"))?.config.texts.headline
    ).toBe("Zuri turns 7!")
  })

  it("refuses a slug another invitation owns", async () => {
    const second = await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "wedding/ivory-garden",
    })
    const attempt = publishInvitation(db, {
      id: second.id,
      ownerId: DEV_USER.id,
      slug: "zuri-turns-seven",
    })
    await expect(attempt).rejects.toBeInstanceOf(EditorError)
    await expect(attempt).rejects.toMatchObject({ code: "slug_taken" })
  })
})

describe("after the event has ended", () => {
  // Its own invitation, so the tests above keep their state.
  let id = ""
  let version = ""
  let slug = ""
  const START = "2026-12-12T15:00:00+03:00"
  const BEFORE = new Date("2026-12-01T09:00:00Z")
  const AFTER = new Date("2026-12-20T09:00:00Z")
  const photo = { assetKey: "after-party", url: "https://example.com/p.webp" }

  const row = async () =>
    (
      await db
        .select()
        .from(schema.invitations)
        .where(eq(schema.invitations.id, id))
    )[0]
  const save = async (patch: unknown, now: Date) => {
    const stored = await row()
    // Some tests change the row directly, which moves its version.
    version = stored.updatedAt.toISOString()
    const config = deepMerge(stored.draftConfig, patch)
    version = (
      await saveDraft(
        db,
        { id, ownerId: DEV_USER.id, config, baseUpdatedAt: version },
        now
      )
    ).updatedAt
  }
  const publish = async (now: Date, as = slug) => {
    const result = await publishInvitation(
      db,
      { id, ownerId: DEV_USER.id, slug: as },
      now
    )
    version = result.updatedAt
    return result
  }

  beforeAll(async () => {
    id = (
      await createDraft(db, {
        ownerId: DEV_USER.id,
        templateId: "wedding/ivory-garden",
      })
    ).id
    slug = `locked-${id.slice(0, 8)}`
    version = (await row()).updatedAt.toISOString()
    await save(
      {
        datetime: { start: START, end: undefined },
        event: { title: "Amara & Kofi", subEvents: [] },
      },
      BEFORE
    )
    // deepMerge keeps `end` when patched with undefined; clear it for real.
    const config = structuredClone((await row()).draftConfig)
    delete config.datetime.end
    version = (
      await saveDraft(
        db,
        { id, ownerId: DEV_USER.id, config, baseUpdatedAt: version },
        BEFORE
      )
    ).updatedAt
    await publish(BEFORE)
  })

  it("still saves everything before the event ends", async () => {
    await save({ texts: { headline: "Before the day" } }, BEFORE)
    expect((await row()).draftConfig.texts.headline).toBe("Before the day")
    await publish(BEFORE)
  })

  it("keeps the date, names and words; takes photos and the closing", async () => {
    await save(
      {
        datetime: { start: "2027-06-01T15:00:00+03:00" },
        event: { title: "A different event" },
        texts: { headline: "Reused", closing: "Thank you for coming!" },
        gallery: [photo],
      },
      AFTER
    )
    const draft = (await row()).draftConfig
    expect(draft.datetime.start).toBe(START)
    expect(draft.event.title).toBe("Amara & Kofi")
    expect(draft.texts.headline).toBe("Before the day")
    expect(draft.texts.closing).toBe("Thank you for coming!")
    expect(draft.gallery).toEqual([photo])
  })

  it("republishes only those parts, at the same link", async () => {
    // A date change that reached the draft some other way must not publish.
    await db
      .update(schema.invitations)
      .set({
        draftConfig: deepMerge((await row()).draftConfig, {
          datetime: { start: "2027-06-01T15:00:00+03:00" },
          texts: { headline: "Sneaked in" },
        }),
      })
      .where(eq(schema.invitations.id, id))
    const result = await publish(AFTER, "a-new-link-for-reuse")
    expect(result.slug).toBe(slug)
    const live = (await row()).publishedConfig!
    expect(live.datetime.start).toBe(START)
    expect(live.texts.headline).toBe("Before the day")
    expect(live.texts.closing).toBe("Thank you for coming!")
    expect(live.gallery).toEqual([photo])
  })

  it("stays locked when unpublished or archived", async () => {
    await db
      .update(schema.invitations)
      .set({ status: "archived" })
      .where(eq(schema.invitations.id, id))
    await save({ event: { title: "Archived then edited" } }, AFTER)
    expect((await row()).draftConfig.event.title).toBe("Amara & Kofi")
  })

  it("opens again while support has unlocked it", async () => {
    await db
      .update(schema.invitations)
      .set({ editUnlockedUntil: new Date(AFTER.getTime() + 86_400_000) })
      .where(eq(schema.invitations.id, id))
    await save({ event: { title: "Corrected title" } }, AFTER)
    expect((await row()).draftConfig.event.title).toBe("Corrected title")
  })

  it("never locks a draft that was not published", async () => {
    const fresh = await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "wedding/ivory-garden",
    })
    const before = (await getOwnedInvitation(db, {
      id: fresh.id,
      ownerId: DEV_USER.id,
    }))!
    const config = deepMerge(before.draftConfig, {
      datetime: { start: "2020-01-01T10:00:00+03:00", end: undefined },
      event: { title: "Old date, new draft", subEvents: [] },
    })
    delete (config.datetime as { end?: string }).end
    await saveDraft(
      db,
      {
        id: fresh.id,
        ownerId: DEV_USER.id,
        config,
        baseUpdatedAt: before.updatedAt.toISOString(),
      },
      AFTER
    )
    const after = (await getOwnedInvitation(db, {
      id: fresh.id,
      ownerId: DEV_USER.id,
    }))!
    expect(after.draftConfig.event.title).toBe("Old date, new draft")
  })
})
