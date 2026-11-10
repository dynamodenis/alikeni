// @vitest-environment node
// RSVP updates and event reminders against a migrated in-memory Postgres,
// with emails captured instead of sent.
import { PGlite } from "@electric-sql/pglite"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { deepMerge } from "@/lib/deep-merge"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import { createDraft } from "@/server/invitations/drafts.server"
import { publishInvitation } from "@/server/invitations/editing.server"
import {
  takeCronToken,
  issueCronToken,
} from "@/server/platform/cron-token.server"
import {
  runNotifications,
  sendEventReminders,
  sendRsvpDigests,
} from "./notifications.server"
import type { Email } from "./send.server"
import { DIGEST_LISTED } from "./templates.server"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })
const SLUG = "amara-and-kofi"
const ORIGIN = "https://alikeni.test"
const NOW = new Date("2026-12-01T09:00:00Z")
const HOUR = 3_600_000
let invitationId = ""

const sent: Array<Email> = []
const send = async (email: Email) => {
  sent.push(email)
}
const options = { origin: ORIGIN, now: NOW, pauseMs: 0 }

type RsvpSeed = Partial<typeof schema.rsvps.$inferInsert>
async function addRsvp(seed: RsvpSeed = {}) {
  const [row] = await db
    .insert(schema.rsvps)
    .values({
      invitationId,
      guestName: "Wanjiru Kamau",
      attending: "yes",
      partySize: 2,
      ipHash: "ip",
      userAgentHash: "ua",
      createdAt: new Date(NOW.getTime() - HOUR),
      ...seed,
    })
    .returning()
  return row
}

const rsvpById = async (id: string) =>
  (await db.select().from(schema.rsvps).where(eq(schema.rsvps.id, id)))[0]

async function patchInvitation(patch: Record<string, unknown>) {
  const [row] = await db
    .select({ config: schema.invitations.publishedConfig })
    .from(schema.invitations)
    .where(eq(schema.invitations.id, invitationId))
  await db
    .update(schema.invitations)
    .set({ publishedConfig: deepMerge(row.config!, patch) })
    .where(eq(schema.invitations.id, invitationId))
}

const setVerified = (emailVerified: boolean) =>
  db
    .update(schema.users)
    .set({ emailVerified })
    .where(eq(schema.users.id, DEV_USER.id))

/** The event starts `hours` after NOW. */
const eventIn = (hours: number) =>
  patchInvitation({
    event: { title: "Amara & Kofi" },
    datetime: {
      start: new Date(NOW.getTime() + hours * HOUR).toISOString(),
      end: undefined,
      timezone: "Africa/Nairobi",
    },
    venue: { name: "Karura Gardens", address: "Limuru Road, Nairobi" },
  })

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
}, 30_000)
afterAll(async () => client.close())

beforeEach(async () => {
  sent.length = 0
  await db.delete(schema.rsvps)
  await setVerified(true)
  await db
    .update(schema.invitations)
    .set({ status: "published" })
    .where(eq(schema.invitations.id, invitationId))
  await eventIn(24 * 30)
})

describe("RSVP updates for the owner", () => {
  it("sends one email per invitation and marks the responses", async () => {
    const first = await addRsvp({ message: "So happy for you" })
    const second = await addRsvp({
      guestName: "Otieno",
      attending: "no",
      partySize: 0,
    })

    expect(await sendRsvpDigests(db, send, options)).toEqual({
      sent: 1,
      failed: 0,
    })
    expect(sent).toHaveLength(1)
    const [email] = sent
    expect(email.to).toBe(DEV_USER.email)
    expect(email.subject).toBe("2 new RSVPs for Amara & Kofi")
    expect(email.text).toContain(
      'Wanjiru Kamau · coming (party of 2): "So happy for you"'
    )
    expect(email.text).toContain("Otieno · not coming")
    expect(email.text).toContain(
      `${ORIGIN}/dashboard/${invitationId}/responses`
    )
    expect((await rsvpById(first.id)).ownerNotifiedAt).toEqual(NOW)
    expect((await rsvpById(second.id)).ownerNotifiedAt).toEqual(NOW)

    // Nothing new: nothing sent.
    expect(await sendRsvpDigests(db, send, options)).toEqual({
      sent: 0,
      failed: 0,
    })
    expect(sent).toHaveLength(1)
  })

  it("names the guest when there is a single response", async () => {
    await addRsvp()
    await sendRsvpDigests(db, send, options)
    expect(sent[0].subject).toBe("Wanjiru Kamau replied to Amara & Kofi")
  })

  it("escapes guest text in the HTML", async () => {
    await addRsvp({ guestName: "<b>Eve</b>", message: "<script>x</script>" })
    await sendRsvpDigests(db, send, options)
    expect(sent[0].html).not.toContain("<b>Eve</b>")
    expect(sent[0].html).not.toContain("<script>")
    expect(sent[0].html).toContain("&lt;b&gt;Eve&lt;/b&gt;")
  })

  it("sums up a long list", async () => {
    for (let i = 0; i < DIGEST_LISTED + 3; i++) {
      await addRsvp({ guestName: `Guest ${i}` })
    }
    await sendRsvpDigests(db, send, options)
    expect(sent[0].text).toContain("…and 3 more.")
    expect(sent[0].text).not.toContain(`Guest ${DIGEST_LISTED}`)
  })

  it("waits until the owner's address is verified", async () => {
    await setVerified(false)
    const row = await addRsvp()
    expect(await sendRsvpDigests(db, send, options)).toEqual({
      sent: 0,
      failed: 0,
    })
    expect((await rsvpById(row.id)).ownerNotifiedAt).toBeNull()

    await setVerified(true)
    expect((await sendRsvpDigests(db, send, options)).sent).toBe(1)
  })

  it("does not announce old responses", async () => {
    await addRsvp({ createdAt: new Date(NOW.getTime() - 8 * 24 * HOUR) })
    expect((await sendRsvpDigests(db, send, options)).sent).toBe(0)
  })

  it("keeps a response pending when the send fails", async () => {
    const row = await addRsvp()
    const failing = () => Promise.reject(new Error("provider down"))
    expect(await sendRsvpDigests(db, failing, options)).toEqual({
      sent: 0,
      failed: 1,
    })
    expect((await rsvpById(row.id)).ownerNotifiedAt).toBeNull()
    expect((await sendRsvpDigests(db, send, options)).sent).toBe(1)
  })
})

describe("event reminders for guests", () => {
  /** Replied two days ago, well before the reminder window. */
  const early = { createdAt: new Date(NOW.getTime() - 48 * HOUR) }

  it("reminds guests with an email address the day before", async () => {
    await eventIn(20)
    const row = await addRsvp({ ...early, contact: " Wanjiru@Example.com " })

    expect(await sendEventReminders(db, send, options)).toEqual({
      sent: 1,
      failed: 0,
    })
    const [email] = sent
    expect(email.to).toBe("wanjiru@example.com")
    expect(email.subject).toBe(
      "Reminder: Amara & Kofi is on Wednesday, December 2, 2026"
    )
    // 05:00 UTC is 08:00 in Nairobi.
    expect(email.text).toMatch(/8:00\sAM \(Africa\/Nairobi\)/)
    expect(email.text).toContain("Karura Gardens, Limuru Road, Nairobi")
    expect(email.text).toContain(`${ORIGIN}/i/${SLUG}`)
    expect((await rsvpById(row.id)).reminderSentAt).toEqual(NOW)

    // Only once.
    expect((await sendEventReminders(db, send, options)).sent).toBe(0)
  })

  it("sends one email per address", async () => {
    await eventIn(20)
    const a = await addRsvp({ ...early, contact: "family@example.com" })
    const b = await addRsvp({
      ...early,
      guestName: "Kamau",
      contact: "FAMILY@example.com",
    })
    expect((await sendEventReminders(db, send, options)).sent).toBe(1)
    expect((await rsvpById(a.id)).reminderSentAt).toEqual(NOW)
    expect((await rsvpById(b.id)).reminderSentAt).toEqual(NOW)
  })

  it("skips events that are not within a day, or already started", async () => {
    await addRsvp({ ...early, contact: "a@example.com" })
    await eventIn(30)
    expect((await sendEventReminders(db, send, options)).sent).toBe(0)
    await eventIn(-1)
    expect((await sendEventReminders(db, send, options)).sent).toBe(0)
    expect(sent).toHaveLength(0)
  })

  it("skips guests who declined, gave a phone number, or replied late", async () => {
    await eventIn(20)
    await addRsvp({ ...early, attending: "no", contact: "no@example.com" })
    await addRsvp({ ...early, contact: "+254 700 000000" })
    await addRsvp({ ...early, contact: null })
    // Replied one hour ago, inside the 24 hours before the event.
    await addRsvp({ contact: "late@example.com" })
    expect((await sendEventReminders(db, send, options)).sent).toBe(0)
    expect(sent).toHaveLength(0)
  })

  it("marks a contact that only looks like an email, without sending", async () => {
    await eventIn(20)
    const row = await addRsvp({ ...early, contact: "call me @ 0700" })
    expect((await sendEventReminders(db, send, options)).sent).toBe(0)
    expect((await rsvpById(row.id)).reminderSentAt).toEqual(NOW)
  })

  it("skips invitations that are no longer published", async () => {
    await eventIn(20)
    await addRsvp({ ...early, contact: "a@example.com" })
    await db
      .update(schema.invitations)
      .set({ status: "archived" })
      .where(eq(schema.invitations.id, invitationId))
    expect((await sendEventReminders(db, send, options)).sent).toBe(0)
  })

  it("retries after a failed send", async () => {
    await eventIn(20)
    const row = await addRsvp({ ...early, contact: "a@example.com" })
    const failing = () => Promise.reject(new Error("provider down"))
    expect(await sendEventReminders(db, failing, options)).toEqual({
      sent: 0,
      failed: 1,
    })
    expect((await rsvpById(row.id)).reminderSentAt).toBeNull()
    expect((await sendEventReminders(db, send, options)).sent).toBe(1)
  })
})

describe("runNotifications", () => {
  it("runs both jobs and respects the per-run cap", async () => {
    await eventIn(20)
    for (let i = 0; i < 3; i++) {
      await addRsvp({
        createdAt: new Date(NOW.getTime() - 48 * HOUR),
        contact: `guest${i}@example.com`,
      })
    }
    const result = await runNotifications(db, send, {
      ...options,
      maxEmails: 2,
    })
    expect(result).toEqual({
      rsvpUpdates: { sent: 1, failed: 0 },
      reminders: { sent: 2, failed: 0 },
    })
    // The third reminder goes out on the next run.
    expect((await sendEventReminders(db, send, options)).sent).toBe(1)
  })
})

describe("cron token", () => {
  it("is accepted once, and only the latest one", () => {
    expect(takeCronToken("anything")).toBe(false)
    const stale = issueCronToken()
    const token = issueCronToken()
    expect(takeCronToken(stale)).toBe(false)
    expect(takeCronToken(token)).toBe(false) // spent by the wrong guess
    const fresh = issueCronToken()
    expect(takeCronToken(null)).toBe(false)
    expect(takeCronToken(issueCronToken())).toBe(true)
    expect(takeCronToken(fresh)).toBe(false)
  })
})
