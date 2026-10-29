// Responses: the owner's view of RSVPs and wishes, wish moderation, and the
// CSV export. Pure functions over a Drizzle db (tested on PGlite).
import { and, desc, eq, inArray } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import type { InvitationConfigBase } from "@/templates/_shared/schema"
import * as schema from "@/server/db/schema"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>
const inv = schema.invitations

export type Attending = (typeof schema.rsvpAttending.enumValues)[number]

export type RsvpRow = {
  id: string
  guestName: string
  attending: Attending
  partySize: number
  message: string | null
  contact: string | null
  createdAt: Date
}

export type ResponseTotals = {
  yes: number
  no: number
  maybe: number
  /** Sum of party sizes for "yes" answers. */
  headcount: number
}

/** Header fields for owner pages, or null when not the owner's. */
export async function getOwnedSummary(
  db: AnyDb,
  { id, ownerId }: { id: string; ownerId: string }
) {
  const row = (
    await db
      .select({
        id: inv.id,
        slug: inv.slug,
        status: inv.status,
        draftConfig: inv.draftConfig,
        publishedConfig: inv.publishedConfig,
      })
      .from(inv)
      .where(and(eq(inv.id, id), eq(inv.ownerId, ownerId)))
  ).at(0)
  if (!row) return null
  const config = (row.publishedConfig ?? row.draftConfig) as
    Partial<InvitationConfigBase> | undefined
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    title: config?.event?.title || "Untitled",
  }
}

export function totalsOf(
  rsvps: Array<Pick<RsvpRow, "attending" | "partySize">>
) {
  const totals: ResponseTotals = { yes: 0, no: 0, maybe: 0, headcount: 0 }
  for (const r of rsvps) {
    totals[r.attending] += 1
    if (r.attending === "yes") totals.headcount += r.partySize
  }
  return totals
}

/** RSVPs, newest first. Caller must have checked ownership. */
async function rsvpsOf(
  db: AnyDb,
  invitationId: string
): Promise<Array<RsvpRow>> {
  return db
    .select({
      id: schema.rsvps.id,
      guestName: schema.rsvps.guestName,
      attending: schema.rsvps.attending,
      partySize: schema.rsvps.partySize,
      message: schema.rsvps.message,
      contact: schema.rsvps.contact,
      createdAt: schema.rsvps.createdAt,
    })
    .from(schema.rsvps)
    .where(eq(schema.rsvps.invitationId, invitationId))
    .orderBy(desc(schema.rsvps.createdAt))
}

/** Everything the responses page shows, or null when not the owner's. */
export async function getResponses(
  db: AnyDb,
  { id, ownerId }: { id: string; ownerId: string }
) {
  const invitation = await getOwnedSummary(db, { id, ownerId })
  if (!invitation) return null
  const [rsvps, wishes] = await Promise.all([
    rsvpsOf(db, id),
    db
      .select({
        id: schema.wishes.id,
        name: schema.wishes.name,
        message: schema.wishes.message,
        approved: schema.wishes.approved,
        createdAt: schema.wishes.createdAt,
      })
      .from(schema.wishes)
      .where(eq(schema.wishes.invitationId, id))
      .orderBy(desc(schema.wishes.createdAt)),
  ])
  return { invitation, totals: totalsOf(rsvps), rsvps, wishes }
}

/** Show or hide a wish. False when the wish is missing or not the owner's. */
export async function setWishApproved(
  db: AnyDb,
  {
    wishId,
    ownerId,
    approved,
  }: { wishId: string; ownerId: string; approved: boolean }
): Promise<boolean> {
  const updated = await db
    .update(schema.wishes)
    .set({ approved })
    .where(
      and(
        eq(schema.wishes.id, wishId),
        // Ownership through the parent invitation.
        inArray(
          schema.wishes.invitationId,
          db.select({ id: inv.id }).from(inv).where(eq(inv.ownerId, ownerId))
        )
      )
    )
    .returning({ id: schema.wishes.id })
  return updated.length > 0
}

/* ---------- CSV ---------- */

export const CSV_HEADER = [
  "Name",
  "Attending",
  "Party size",
  "Message",
  "Contact",
  "Submitted at",
] as const

/**
 * One CSV field: neutralise spreadsheet formulas (a leading `=`, `+`, `-`,
 * `@`, tab or CR gets a `'` prefix), then quote per RFC 4180 when needed.
 */
export function csvCell(value: string | number | null | undefined): string {
  let text = value == null ? "" : String(value)
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

/** UTF-8 BOM (so Excel detects the encoding), CRLF line endings. */
export function toCsv(rows: Array<Array<string | number | null>>): string {
  return "﻿" + rows.map((r) => r.map(csvCell).join(",") + "\r\n").join("")
}

export function rsvpsCsv(rsvps: Array<RsvpRow>): string {
  return toCsv([
    [...CSV_HEADER],
    ...rsvps.map((r) => [
      r.guestName,
      r.attending,
      r.partySize,
      r.message,
      r.contact,
      r.createdAt.toISOString(),
    ]),
  ])
}

/** The export for the owner, or null (missing and foreign look the same). */
export async function exportRsvpsCsv(
  db: AnyDb,
  { id, ownerId }: { id: string; ownerId: string }
): Promise<{ filename: string; body: string } | null> {
  const invitation = await getOwnedSummary(db, { id, ownerId })
  if (!invitation) return null
  const rsvps = await rsvpsOf(db, id)
  // Oldest first reads better in a spreadsheet.
  rsvps.reverse()
  return {
    filename: `${invitation.slug ?? invitation.id}-rsvps.csv`,
    body: rsvpsCsv(rsvps),
  }
}
