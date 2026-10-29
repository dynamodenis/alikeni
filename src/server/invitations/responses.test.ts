// @vitest-environment node
import { PGlite } from "@electric-sql/pglite"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import { createDraft } from "./drafts.server"
import { publishInvitation } from "./editing.server"
import {
  csvCell,
  exportRsvpsCsv,
  getResponses,
  rsvpsCsv,
  setWishApproved,
  toCsv,
} from "./responses.server"

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
  createDraft(db, { ownerId, templateId: "wedding/ivory-garden" }).then(
    (r) => r.id
  )

describe("csvCell", () => {
  it("quotes fields with commas, quotes and line breaks (RFC 4180)", () => {
    expect(csvCell("plain")).toBe("plain")
    expect(csvCell("a,b")).toBe('"a,b"')
    expect(csvCell('say "hi"')).toBe('"say ""hi"""')
    expect(csvCell("line\nbreak")).toBe('"line\nbreak"')
    expect(csvCell("cr\r\nlf")).toBe('"cr\r\nlf"')
    expect(csvCell(null)).toBe("")
    expect(csvCell(3)).toBe("3")
  })

  it("neutralises formula injection", () => {
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"')
    expect(csvCell("+1 555")).toBe("'+1 555")
    expect(csvCell("-2")).toBe("'-2")
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)")
    expect(csvCell("\tcmd")).toBe("'\tcmd")
    expect(csvCell("\rcmd")).toBe('"\'\rcmd"')
    expect(csvCell("a=b")).toBe("a=b")
  })
})

describe("toCsv / rsvpsCsv", () => {
  it("starts with a UTF-8 BOM and ends every line with CRLF", () => {
    const csv = toCsv([
      ["a", "b"],
      ["c", "d"],
    ])
    expect(csv.charCodeAt(0)).toBe(0xfeff)
    expect(csv.slice(1)).toBe("a,b\r\nc,d\r\n")
  })

  it("writes the expected columns with ISO timestamps", () => {
    const csv = rsvpsCsv([
      {
        id: "1",
        guestName: "Zoë, Jr.",
        attending: "yes",
        partySize: 2,
        message: "=cmd",
        contact: null,
        createdAt: new Date("2026-10-29T10:00:00Z"),
      },
    ])
    const lines = csv.slice(1).split("\r\n")
    expect(lines[0]).toBe(
      "Name,Attending,Party size,Message,Contact,Submitted at"
    )
    expect(lines[1]).toBe('"Zoë, Jr.",yes,2,\'=cmd,,2026-10-29T10:00:00.000Z')
    expect(lines[2]).toBe("")
  })
})

describe("getResponses", () => {
  it("returns totals, RSVPs and wishes for the owner", async () => {
    const id = await draft()
    await db.insert(schema.rsvps).values([
      {
        invitationId: id,
        guestName: "Ann",
        attending: "yes",
        partySize: 3,
        ipHash: "i",
        userAgentHash: "u",
      },
      {
        invitationId: id,
        guestName: "Bob",
        attending: "no",
        partySize: 1,
        ipHash: "i",
        userAgentHash: "u",
      },
      {
        invitationId: id,
        guestName: "Cy",
        attending: "maybe",
        partySize: 2,
        ipHash: "i",
        userAgentHash: "u",
      },
    ])
    await db
      .insert(schema.wishes)
      .values({ invitationId: id, name: "Di", message: "Yay", ipHash: "i" })
    const result = await getResponses(db, { id, ownerId: me })
    expect(result?.totals).toEqual({ yes: 1, no: 1, maybe: 1, headcount: 3 })
    expect(result?.rsvps).toHaveLength(3)
    expect(result?.wishes).toHaveLength(1)
    expect(result?.invitation.id).toBe(id)
  })

  it("returns null for another user's invitation", async () => {
    const id = await draft(OTHER)
    expect(await getResponses(db, { id, ownerId: me })).toBeNull()
  })
})

describe("setWishApproved", () => {
  it("hides and shows the owner's wish", async () => {
    const id = await draft()
    const [wish] = await db
      .insert(schema.wishes)
      .values({ invitationId: id, name: "E", message: "Hi", ipHash: "i" })
      .returning()
    expect(
      await setWishApproved(db, {
        wishId: wish.id,
        ownerId: me,
        approved: false,
      })
    ).toBe(true)
    const [row] = await db
      .select()
      .from(schema.wishes)
      .where(eq(schema.wishes.id, wish.id))
    expect(row.approved).toBe(false)
  })

  it("refuses another user's wish and changes nothing", async () => {
    const id = await draft(OTHER)
    const [wish] = await db
      .insert(schema.wishes)
      .values({ invitationId: id, name: "F", message: "Hi", ipHash: "i" })
      .returning()
    expect(
      await setWishApproved(db, {
        wishId: wish.id,
        ownerId: me,
        approved: false,
      })
    ).toBe(false)
    const [row] = await db
      .select()
      .from(schema.wishes)
      .where(eq(schema.wishes.id, wish.id))
    expect(row.approved).toBe(true)
  })
})

describe("exportRsvpsCsv", () => {
  it("names the file after the slug once published", async () => {
    const id = await draft()
    await publishInvitation(db, { id, ownerId: me, slug: "csv-party" })
    await db.insert(schema.rsvps).values({
      invitationId: id,
      guestName: "Gil",
      attending: "yes",
      partySize: 2,
      ipHash: "i",
      userAgentHash: "u",
    })
    const csv = await exportRsvpsCsv(db, { id, ownerId: me })
    expect(csv?.filename).toBe("csv-party-rsvps.csv")
    expect(csv?.body.split("\r\n")[1]).toMatch(/^Gil,yes,2,,,/)
  })

  it("uses the id for unpublished invitations", async () => {
    const id = await draft()
    expect((await exportRsvpsCsv(db, { id, ownerId: me }))?.filename).toBe(
      `${id}-rsvps.csv`
    )
  })

  it("returns null for another user's invitation", async () => {
    const id = await draft(OTHER)
    expect(await exportRsvpsCsv(db, { id, ownerId: me })).toBeNull()
  })
})
