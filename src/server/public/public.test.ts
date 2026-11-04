// @vitest-environment node
import { PGlite } from "@electric-sql/pglite"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import { createDraft } from "@/server/invitations/drafts.server"
import { publishInvitation } from "@/server/invitations/editing.server"
import { MemoryRateLimiter } from "@/server/rate-limit"
import { deepMerge } from "@/lib/deep-merge"
import { icsResponse } from "./ics.server"
import {
  NOT_AVAILABLE,
  PublicError,
  RSVP_CLOSED,
  RateLimitedError,
  VERIFY_FAILED,
  listWishes,
  loadPublicPage,
  recordView,
  recordViewBySlug,
  resolveGuestName,
  submitRsvp,
  submitWish,
  type GuestContext,
} from "./public.server"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })
const SLUG = "amara-and-kofi"
let invitationId = ""

const visitor = { ipHash: "ip-1", uaHash: "ua-1", bot: false }

function ctx(overrides: Partial<GuestContext> = {}): GuestContext {
  return {
    ipHash: "ip-1",
    uaHash: "ua-1",
    limiter: new MemoryRateLimiter(),
    verifyHuman: () => Promise.resolve(true),
    ...overrides,
  }
}

const rsvp = {
  slug: SLUG,
  guestName: "  Wanjiru   Kamau ",
  attending: "yes" as const,
  partySize: 2,
  message: "So happy\n\nfor you",
  website: "",
}

async function patchConfig(patch: Record<string, unknown>) {
  const [row] = await db
    .select({ config: schema.invitations.publishedConfig })
    .from(schema.invitations)
    .where(eq(schema.invitations.id, invitationId))
  await db
    .update(schema.invitations)
    .set({ publishedConfig: deepMerge(row.config!, patch) })
    .where(eq(schema.invitations.id, invitationId))
}

const countRsvps = async () =>
  (await db.select().from(schema.rsvps)).filter(
    (r) => r.invitationId === invitationId
  ).length

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
  await db.insert(schema.users).values(DEV_USER)
  invitationId = (
    await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "wedding/ivory-garden",
    })
  ).id
  await publishInvitation(db, {
    ownerId: DEV_USER.id,
    id: invitationId,
    slug: SLUG,
  })
  await db.insert(schema.guests).values({
    invitationId,
    name: "Auntie <Grace>",
    slugToken: "g7Kq2xPz",
  })
}, 30_000)
afterAll(async () => client.close())

beforeEach(async () => {
  await patchConfig({
    features: { rsvp: true, wishes: true },
    texts: { rsvpDeadline: undefined },
  })
})

describe("submitRsvp", () => {
  it("stores a cleaned response with hashes only", async () => {
    await submitRsvp(db, rsvp, ctx())
    const row = (
      await db
        .select()
        .from(schema.rsvps)
        .where(eq(schema.rsvps.invitationId, invitationId))
    ).at(0)
    expect(row?.guestName).toBe("Wanjiru Kamau")
    expect(row?.message).toBe("So happy for you")
    expect(row?.partySize).toBe(2)
    expect(row?.ipHash).toBe("ip-1")
    expect(row?.userAgentHash).toBe("ua-1")
  })

  it("rate-limits 20 rapid posts to 5", async () => {
    const limiter = new MemoryRateLimiter()
    const before = await countRsvps()
    const results = await Promise.allSettled(
      Array.from({ length: 20 }, () =>
        submitRsvp(db, rsvp, ctx({ limiter, ipHash: "burst" }))
      )
    )
    const ok = results.filter((r) => r.status === "fulfilled").length
    expect(ok).toBe(5)
    const rejected = results.find((r) => r.status === "rejected")
    const reason: unknown = rejected?.status === "rejected" && rejected.reason
    expect(reason).toBeInstanceOf(RateLimitedError)
    expect((reason as RateLimitedError).info).toMatchObject({
      scope: "you",
      used: 5,
      limit: 5,
      windowSec: 60,
    })
    expect((await countRsvps()) - before).toBe(5)
  })

  it("counts per device, so guests sharing an IP do not block each other", async () => {
    const limiter = new MemoryRateLimiter()
    const shared = ctx({ limiter, ipHash: "venue-wifi" })
    const post = (device: string) => submitRsvp(db, { ...rsvp, device }, shared)
    for (let i = 0; i < 5; i++) await post("phone-aaaaaaaaaaaaaaaa")
    await expect(post("phone-aaaaaaaaaaaaaaaa")).rejects.toMatchObject({
      info: { scope: "you", used: 5 },
    })
    await expect(post("phone-bbbbbbbbbbbbbbbb")).resolves.toEqual({ ok: true })
  })

  it("caps everyone behind one IP at 30 a minute", async () => {
    const limiter = new MemoryRateLimiter()
    const shared = ctx({ limiter, ipHash: "carrier-nat" })
    for (let i = 0; i < 30; i++) {
      await submitRsvp(
        db,
        { ...rsvp, device: `guest-${i}-xxxxxxxxxxxx` },
        shared
      )
    }
    await expect(
      submitRsvp(db, { ...rsvp, device: "guest-31-xxxxxxxxxxxx" }, shared)
    ).rejects.toMatchObject({ info: { scope: "network", used: 30 } })
  })

  it("falls back to the IP budget for a missing or malformed device id", async () => {
    const limiter = new MemoryRateLimiter()
    const shared = ctx({ limiter, ipHash: "no-device" })
    for (let i = 0; i < 5; i++) {
      await submitRsvp(db, { ...rsvp, device: "bad id!" }, shared)
    }
    await expect(submitRsvp(db, rsvp, shared)).rejects.toBeInstanceOf(
      RateLimitedError
    )
  })

  it("pretends success for a filled honeypot and stores nothing", async () => {
    const before = await countRsvps()
    await expect(
      submitRsvp(db, { ...rsvp, website: "http://spam" }, ctx())
    ).resolves.toEqual({ ok: true })
    expect(await countRsvps()).toBe(before)
  })

  it("rejects a failed human check", async () => {
    await expect(
      submitRsvp(db, rsvp, ctx({ verifyHuman: () => Promise.resolve(false) }))
    ).rejects.toThrow(VERIFY_FAILED)
  })

  it("closes after the deadline and when RSVPs are off", async () => {
    await patchConfig({ texts: { rsvpDeadline: "2020-01-01T00:00:00Z" } })
    await expect(submitRsvp(db, rsvp, ctx())).rejects.toThrow(RSVP_CLOSED)
    await patchConfig({
      texts: { rsvpDeadline: "2099-01-01T00:00:00Z" },
      features: { rsvp: false },
    })
    await expect(submitRsvp(db, rsvp, ctx())).rejects.toThrow(RSVP_CLOSED)
  })

  it("validates party size and lengths", async () => {
    await expect(
      submitRsvp(db, { ...rsvp, partySize: 0 }, ctx())
    ).rejects.toThrow()
    await expect(
      submitRsvp(db, { ...rsvp, guestName: "x".repeat(81) }, ctx())
    ).rejects.toThrow()
    await expect(
      submitRsvp(db, { ...rsvp, attending: "no", partySize: 0 }, ctx())
    ).resolves.toEqual({ ok: true })
  })

  it("hides unknown slugs behind a generic error", async () => {
    await expect(
      submitRsvp(db, { ...rsvp, slug: "nope-nope" }, ctx())
    ).rejects.toThrow(NOT_AVAILABLE)
  })
})

describe("wishes", () => {
  it("creates and lists wishes newest first, approved only", async () => {
    const first = await submitWish(
      db,
      { slug: SLUG, name: "Ali", message: "Congrats <b>!</b>", website: "" },
      ctx()
    )
    expect(first.message).toBe("Congrats <b>!</b>")
    const second = await submitWish(
      db,
      { slug: SLUG, name: "Bea", message: "Mazel tov", website: "" },
      ctx()
    )
    await db.insert(schema.wishes).values({
      invitationId,
      name: "Spam",
      message: "x",
      approved: false,
      ipHash: "h",
    })
    const list = await listWishes(db, invitationId)
    expect(list.map((w) => w.id)).toEqual([second.id, first.id])
  })

  it("returns a fake item for a filled honeypot", async () => {
    const fake = await submitWish(
      db,
      { slug: SLUG, name: "Bot", message: "buy", website: "x" },
      ctx()
    )
    const list = await listWishes(db, invitationId)
    expect(list.some((w) => w.id === fake.id)).toBe(false)
  })

  it("respects features.wishes", async () => {
    await patchConfig({ features: { wishes: false } })
    await expect(
      submitWish(
        db,
        { slug: SLUG, name: "A", message: "B", website: "" },
        ctx()
      )
    ).rejects.toBeInstanceOf(PublicError)
  })
})

describe("page views", () => {
  const views = async () =>
    db
      .select()
      .from(schema.pageViews)
      .where(eq(schema.pageViews.invitationId, invitationId))

  it("counts once per visitor per day and skips bots", async () => {
    const now = new Date("2027-03-01T10:00:00Z")
    expect(await recordView(db, invitationId, visitor, { now })).toBe(true)
    expect(await recordView(db, invitationId, visitor, { now })).toBe(false)
    expect(
      await recordView(db, invitationId, { ...visitor, bot: true }, { now })
    ).toBe(false)
    await recordView(db, invitationId, { ...visitor, ipHash: "ip-2" }, { now })
    const next = new Date("2027-03-02T00:00:01Z")
    await recordView(db, invitationId, visitor, { now: next })
    const rows = await views()
    expect(rows.find((r) => r.day === "2027-03-01")?.count).toBe(2)
    expect(rows.find((r) => r.day === "2027-03-02")?.count).toBe(1)
  })

  it("dedupes in the database, so separate instances agree", async () => {
    const now = new Date("2027-04-01T10:00:00Z")
    const results = await Promise.all(
      Array.from({ length: 5 }, () =>
        recordView(db, invitationId, { ...visitor, ipHash: "ip-c" }, { now })
      )
    )
    expect(results.filter(Boolean)).toHaveLength(1)
    const rows = await views()
    expect(rows.find((r) => r.day === "2027-04-01")?.count).toBe(1)
  })

  it("stores only a hash of the visitor", async () => {
    const rows = await db
      .select()
      .from(schema.pageViewVisitors)
      .where(eq(schema.pageViewVisitors.invitationId, invitationId))
    expect(rows.length).toBeGreaterThan(0)
    for (const row of rows) {
      expect(row.visitorHash).toMatch(/^[0-9a-f]{64}$/)
      expect(row.visitorHash).not.toContain("ip-")
    }
  })

  it("prunes visitor rows older than two days", async () => {
    const later = new Date("2027-04-10T10:00:00Z")
    await recordView(
      db,
      invitationId,
      { ...visitor, ipHash: "ip-prune" },
      { now: later, random: () => 0 }
    )
    const days = (
      await db
        .select({ day: schema.pageViewVisitors.day })
        .from(schema.pageViewVisitors)
    ).map((r) => r.day)
    expect(days).toEqual(["2027-04-10"])
    // Pruning visitor rows never touches the counts.
    expect((await views()).find((r) => r.day === "2027-03-01")?.count).toBe(2)
  })

  it("counts by slug for the beacon; unknown slugs and bots do not", async () => {
    const now = new Date("2027-05-01T10:00:00Z")
    expect(await recordViewBySlug(db, SLUG, visitor, { now })).toBe(true)
    expect(await recordViewBySlug(db, "missing", visitor, { now })).toBe(false)
    expect(
      await recordViewBySlug(db, SLUG, { ...visitor, bot: true }, { now })
    ).toBe(false)
  })
})

describe("loadPublicPage", () => {
  it("returns config, wishes and the guest name", async () => {
    const before = await db.select().from(schema.pageViews)
    const page = await loadPublicPage(db, {
      slug: SLUG,
      to: "  Mr <script>  Otieno ",
    })
    // Rendering the page never counts a view (the client beacon does).
    expect(await db.select().from(schema.pageViews)).toEqual(before)
    expect(page?.slug).toBe(SLUG)
    expect(page?.guestName).toBe("Mr script Otieno")
    expect(page?.wishes.length).toBeGreaterThan(0)
  })

  it("is null for unknown or archived slugs", async () => {
    expect(await loadPublicPage(db, { slug: "missing" })).toBeNull()
  })

  it("prefers a guest's personal token", async () => {
    expect(await resolveGuestName(db, invitationId, "g7Kq2xPz")).toBe(
      "Auntie Grace"
    )
    expect(await resolveGuestName(db, invitationId, undefined)).toBeUndefined()
  })
})

describe("/ics/$slug", () => {
  it("serves a calendar for a published slug", async () => {
    await patchConfig({
      event: {
        subEvents: [
          { label: "Ceremony", start: "2027-06-12T09:00:00+03:00" },
          {
            label: "Reception",
            start: "2027-06-12T18:00:00+03:00",
            end: "2027-06-12T23:00:00+03:00",
            venueRef: "Garden Hall",
          },
        ],
      },
    })
    const response = await icsResponse(db, SLUG, "https://festly.test")
    expect(response.status).toBe(200)
    expect(response.headers.get("content-type")).toBe(
      "text/calendar; charset=utf-8"
    )
    expect(response.headers.get("content-disposition")).toBe(
      `attachment; filename="${SLUG}.ics"`
    )
    const body = await response.text()
    expect(body.match(/BEGIN:VEVENT/g)).toHaveLength(2)
    expect(body).toContain(`UID:${SLUG}-1@festly`)
    expect(body).toContain(`UID:${SLUG}-2@festly`)
    expect(body).toContain("DTSTART:20270612T060000Z")
    expect(body).toContain("DTEND:20270612T200000Z")
    expect(body).toContain("LOCATION:Garden Hall")
    expect(body).toContain(`URL:https://festly.test/i/${SLUG}`)
  })

  it("404s for unknown slugs", async () => {
    expect((await icsResponse(db, "missing", "https://x.test")).status).toBe(
      404
    )
    expect((await icsResponse(db, "../etc", "https://x.test")).status).toBe(404)
  })
})
