// @vitest-environment node
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import { createDraft } from "./drafts.server"
import {
  addGuest,
  listGuests,
  newGuestToken,
  removeGuest,
} from "./guests.server"

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
  createDraft(db, { ownerId, templateId: "graduation/cap-and-gown" }).then(
    (r) => r.id
  )

describe("newGuestToken", () => {
  it("is URL-safe, at least 10 characters and unique", () => {
    const tokens = new Set(Array.from({ length: 200 }, newGuestToken))
    expect(tokens.size).toBe(200)
    for (const t of tokens) expect(t).toMatch(/^[A-Za-z0-9_-]{10,}$/)
  })
})

describe("guest list", () => {
  it("adds, lists and removes the owner's guests", async () => {
    const invitationId = await draft()
    const ann = await addGuest(db, {
      invitationId,
      ownerId: me,
      name: "Ann",
      group: "Family",
    })
    await addGuest(db, { invitationId, ownerId: me, name: "Bob", group: "" })
    expect(ann?.slugToken).toMatch(/^[A-Za-z0-9_-]{10,}$/)

    const list = await listGuests(db, { invitationId, ownerId: me })
    expect(list?.map((g) => [g.name, g.group])).toEqual([
      ["Ann", "Family"],
      ["Bob", null],
    ])

    expect(await removeGuest(db, { guestId: ann!.id, ownerId: me })).toBe(true)
    expect(await listGuests(db, { invitationId, ownerId: me })).toHaveLength(1)
  })

  it("blocks other users from listing, adding and removing", async () => {
    const invitationId = await draft(OTHER)
    const guest = await addGuest(db, {
      invitationId,
      ownerId: OTHER,
      name: "Cy",
    })
    expect(await listGuests(db, { invitationId, ownerId: me })).toBeNull()
    expect(
      await addGuest(db, { invitationId, ownerId: me, name: "Intruder" })
    ).toBeNull()
    expect(await removeGuest(db, { guestId: guest!.id, ownerId: me })).toBe(
      false
    )
    const list = await listGuests(db, { invitationId, ownerId: OTHER })
    expect(list?.map((g) => g.name)).toEqual(["Cy"])
  })
})
