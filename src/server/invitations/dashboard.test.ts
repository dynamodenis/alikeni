// @vitest-environment node
import { PGlite } from "@electric-sql/pglite"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import {
  TITLE_MAX,
  copyTitle,
  deleteInvitation,
  duplicateInvitation,
  setArchived,
  statsForInvitations,
  viewsWindowStart,
} from "./dashboard.server"
import {
  createDraft,
  getOwnedInvitation,
  listOwnedInvitations,
} from "./drafts.server"
import { getPublishedBySlug, publishInvitation } from "./editing.server"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })
const OTHER = "someone-else"
const me: string = DEV_USER.id

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
  await db.insert(schema.users).values(DEV_USER)
  await db.insert(schema.users).values({ id: OTHER, email: "x@example.com" })
}, 30_000)

afterAll(async () => {
  await client.close()
})

const draft = (ownerId = me) =>
  createDraft(db, { ownerId, templateId: "birthday/confetti-pop" }).then(
    (r) => r.id
  )

async function published(slug: string, ownerId = me) {
  const id = await draft(ownerId)
  await publishInvitation(db, { id, ownerId, slug })
  return id
}

const rsvp = (
  invitationId: string,
  attending: "yes" | "no" | "maybe",
  partySize: number
) => ({
  invitationId,
  guestName: "Guest",
  attending,
  partySize,
  ipHash: "ip",
  userAgentHash: "ua",
})

describe("viewsWindowStart", () => {
  it("covers today and the six UTC days before it", () => {
    expect(viewsWindowStart(new Date("2026-10-29T23:30:00-05:00"))).toBe(
      "2026-10-24"
    )
    expect(viewsWindowStart(new Date("2026-03-03T00:00:00Z"))).toBe(
      "2026-02-25"
    )
  })
})

describe("statsForInvitations", () => {
  it("sums 7-day views, responses, attending headcount and wishes", async () => {
    const id = await draft()
    const quiet = await draft()
    await db.insert(schema.pageViews).values([
      { invitationId: id, day: "2026-10-29", count: 5 },
      { invitationId: id, day: "2026-10-23", count: 3 },
      { invitationId: id, day: "2026-10-22", count: 100 }, // outside window
    ])
    await db
      .insert(schema.rsvps)
      .values([
        rsvp(id, "yes", 2),
        rsvp(id, "yes", 3),
        rsvp(id, "no", 4),
        rsvp(id, "maybe", 1),
      ])
    await db.insert(schema.wishes).values([
      { invitationId: id, name: "A", message: "Hi", ipHash: "ip" },
      { invitationId: id, name: "B", message: "Yo", ipHash: "ip" },
    ])
    const stats = await statsForInvitations(
      db,
      [id, quiet],
      new Date("2026-10-29T12:00:00Z")
    )
    expect(stats.get(id)).toEqual({
      views7d: 8,
      responses: 4,
      headcount: 5,
      wishes: 2,
    })
    expect(stats.get(quiet)).toEqual({
      views7d: 0,
      responses: 0,
      headcount: 0,
      wishes: 0,
    })
  })

  it("handles an empty list without querying", async () => {
    expect((await statsForInvitations(db, [])).size).toBe(0)
  })
})

describe("duplicateInvitation", () => {
  it("creates a draft copy with '(copy)' in the title and no slug", async () => {
    const id = await published("dup-source")
    const copy = await duplicateInvitation(db, { id, ownerId: me })
    expect(copy).not.toBeNull()
    const source = await getOwnedInvitation(db, { id, ownerId: me })
    const row = await getOwnedInvitation(db, { id: copy!.id, ownerId: me })
    expect(row?.status).toBe("draft")
    expect(row?.slug).toBeNull()
    expect(row?.publishedAt).toBeNull()
    expect(row?.templateId).toBe(source?.templateId)
    expect(row?.draftConfig.event.title).toBe(
      `${source?.draftConfig.event.title} (copy)`
    )
    expect(row?.draftConfig.theme).toEqual(source?.draftConfig.theme)
  })

  it("keeps long titles unchanged so they stay within the limit", () => {
    const long = "x".repeat(TITLE_MAX - 3)
    expect(copyTitle(long)).toBe(long)
    expect(copyTitle("Party")).toBe("Party (copy)")
  })

  it("refuses another user's invitation", async () => {
    const id = await draft(OTHER)
    const before = await listOwnedInvitations(db, me)
    expect(await duplicateInvitation(db, { id, ownerId: me })).toBeNull()
    expect(await listOwnedInvitations(db, me)).toHaveLength(before.length)
  })
})

describe("setArchived", () => {
  it("hides a published page and restores it on unarchive", async () => {
    const id = await published("archive-me")
    expect(await setArchived(db, { id, ownerId: me, archived: true })).toBe(
      "archived"
    )
    expect(await getPublishedBySlug(db, "archive-me")).toBeNull()
    const list = await listOwnedInvitations(db, me)
    expect(list.find((r) => r.id === id)?.status).toBe("archived")

    expect(await setArchived(db, { id, ownerId: me, archived: false })).toBe(
      "published"
    )
    expect(await getPublishedBySlug(db, "archive-me")).not.toBeNull()
  })

  it("restores a never-published invitation as a draft", async () => {
    const id = await draft()
    await setArchived(db, { id, ownerId: me, archived: true })
    expect(await setArchived(db, { id, ownerId: me, archived: false })).toBe(
      "draft"
    )
  })

  it("refuses another user's invitation and changes nothing", async () => {
    const id = await published("not-mine-archive", OTHER)
    expect(
      await setArchived(db, { id, ownerId: me, archived: true })
    ).toBeNull()
    const row = await getOwnedInvitation(db, { id, ownerId: OTHER })
    expect(row?.status).toBe("published")
  })
})

describe("deleteInvitation", () => {
  it("removes the invitation, its responses, views, guests and media rows", async () => {
    const id = await draft()
    await db.insert(schema.rsvps).values(rsvp(id, "yes", 1))
    await db
      .insert(schema.wishes)
      .values({ invitationId: id, name: "A", message: "Hi", ipHash: "ip" })
    await db
      .insert(schema.pageViews)
      .values({ invitationId: id, day: "2026-10-29", count: 1 })
    await db
      .insert(schema.guests)
      .values({ invitationId: id, name: "Ann", slugToken: "token-delete-1" })
    await db.insert(schema.mediaAssets).values({
      ownerId: me,
      invitationId: id,
      kind: "image",
      key: `u/${me}/image/delete-me.webp`,
      mime: "image/webp",
      bytes: 10,
    })

    expect(await deleteInvitation(db, { id, ownerId: me })).toBe(true)
    expect(await getOwnedInvitation(db, { id, ownerId: me })).toBeNull()
    for (const table of [
      schema.rsvps,
      schema.wishes,
      schema.pageViews,
      schema.guests,
      schema.mediaAssets,
    ]) {
      const rows = await db
        .select()
        .from(table)
        .where(eq(table.invitationId, id))
      expect(rows).toHaveLength(0)
    }
  })

  it("refuses another user's invitation and leaves it intact", async () => {
    const id = await draft(OTHER)
    await db.insert(schema.rsvps).values(rsvp(id, "yes", 1))
    expect(await deleteInvitation(db, { id, ownerId: me })).toBe(false)
    expect(await getOwnedInvitation(db, { id, ownerId: OTHER })).not.toBeNull()
    const rows = await db
      .select()
      .from(schema.rsvps)
      .where(eq(schema.rsvps.invitationId, id))
    expect(rows).toHaveLength(1)
  })

  it("returns false for an unknown id", async () => {
    expect(
      await deleteInvitation(db, {
        id: "00000000-0000-4000-8000-000000000000",
        ownerId: me,
      })
    ).toBe(false)
  })
})
