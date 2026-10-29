// Guest list: named guests with unguessable tokens for personal links
// (`/i/<slug>?to=<token>`). Pure functions over a Drizzle db.
import { and, asc, eq, inArray } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import * as schema from "@/server/db/schema"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>
const inv = schema.invitations

export const GUEST_NAME_MAX = 80
export const GUEST_GROUP_MAX = 60

/** 16 random bytes as base64url: 22 URL-safe characters (Web Crypto). */
export function newGuestToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let binary = ""
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "")
}

async function ownsInvitation(db: AnyDb, id: string, ownerId: string) {
  const rows = await db
    .select({ id: inv.id })
    .from(inv)
    .where(and(eq(inv.id, id), eq(inv.ownerId, ownerId)))
  return rows.length > 0
}

const guestColumns = {
  id: schema.guests.id,
  name: schema.guests.name,
  group: schema.guests.group,
  slugToken: schema.guests.slugToken,
}

/** The invitation's guests (by group, then name), or null when not owned. */
export async function listGuests(
  db: AnyDb,
  { invitationId, ownerId }: { invitationId: string; ownerId: string }
) {
  if (!(await ownsInvitation(db, invitationId, ownerId))) return null
  return db
    .select(guestColumns)
    .from(schema.guests)
    .where(eq(schema.guests.invitationId, invitationId))
    .orderBy(asc(schema.guests.group), asc(schema.guests.name))
}

/** Add a guest with a fresh token. Null when the invitation is not owned. */
export async function addGuest(
  db: AnyDb,
  input: {
    invitationId: string
    ownerId: string
    name: string
    group?: string | null
  }
) {
  if (!(await ownsInvitation(db, input.invitationId, input.ownerId)))
    return null
  const [row] = await db
    .insert(schema.guests)
    .values({
      invitationId: input.invitationId,
      name: input.name,
      group: input.group || null,
      slugToken: newGuestToken(),
    })
    .returning(guestColumns)
  return row
}

/** Remove a guest. False when missing or not the owner's. */
export async function removeGuest(
  db: AnyDb,
  { guestId, ownerId }: { guestId: string; ownerId: string }
): Promise<boolean> {
  const deleted = await db
    .delete(schema.guests)
    .where(
      and(
        eq(schema.guests.id, guestId),
        inArray(
          schema.guests.invitationId,
          db.select({ id: inv.id }).from(inv).where(eq(inv.ownerId, ownerId))
        )
      )
    )
    .returning({ id: schema.guests.id })
  return deleted.length > 0
}
