// Dashboard: per-card stats and the card actions (duplicate, archive,
// delete). Pure functions over a Drizzle db; every function filters on the
// owner so a foreign id behaves exactly like a missing one.
import { and, count, eq, gte, inArray, sql, sum } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import type { InvitationConfigBase } from "@/templates/_shared/schema"
import * as schema from "@/server/db/schema"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>
const inv = schema.invitations

/** Matches `event.title` in the config schema. */
export const TITLE_MAX = 120
const COPY_SUFFIX = " (copy)"

export type InvitationStats = {
  views7d: number
  responses: number
  /** Sum of party sizes for "yes" answers. */
  headcount: number
  wishes: number
}

export const EMPTY_STATS: InvitationStats = {
  views7d: 0,
  responses: 0,
  headcount: 0,
  wishes: 0,
}

/** First UTC day (YYYY-MM-DD) of the 7-day window ending today. */
export function viewsWindowStart(now: Date): string {
  const start = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 6)
  )
  return start.toISOString().slice(0, 10)
}

/**
 * Stats for the given invitation ids. Callers pass ids they already
 * resolved for the owner; unknown ids simply get zeros.
 */
export async function statsForInvitations(
  db: AnyDb,
  ids: Array<string>,
  now = new Date()
): Promise<Map<string, InvitationStats>> {
  const result = new Map<string, InvitationStats>(
    ids.map((id) => [id, { ...EMPTY_STATS }])
  )
  if (ids.length === 0) return result

  const [views, rsvps, wishes] = await Promise.all([
    db
      .select({
        id: schema.pageViews.invitationId,
        total: sum(schema.pageViews.count).mapWith(Number),
      })
      .from(schema.pageViews)
      .where(
        and(
          inArray(schema.pageViews.invitationId, ids),
          gte(schema.pageViews.day, viewsWindowStart(now))
        )
      )
      .groupBy(schema.pageViews.invitationId),
    db
      .select({
        id: schema.rsvps.invitationId,
        responses: count(),
        headcount:
          sql<number>`coalesce(sum(${schema.rsvps.partySize}) filter (where ${schema.rsvps.attending} = 'yes'), 0)`.mapWith(
            Number
          ),
      })
      .from(schema.rsvps)
      .where(inArray(schema.rsvps.invitationId, ids))
      .groupBy(schema.rsvps.invitationId),
    db
      .select({ id: schema.wishes.invitationId, total: count() })
      .from(schema.wishes)
      .where(inArray(schema.wishes.invitationId, ids))
      .groupBy(schema.wishes.invitationId),
  ])

  for (const row of views) {
    const stats = result.get(row.id)
    if (stats) stats.views7d = row.total
  }
  for (const row of rsvps) {
    const stats = result.get(row.id)
    if (stats) {
      stats.responses = row.responses
      stats.headcount = row.headcount
    }
  }
  for (const row of wishes) {
    const stats = result.get(row.id)
    if (stats) stats.wishes = row.total
  }
  return result
}

const owned = (id: string, ownerId: string) =>
  and(eq(inv.id, id), eq(inv.ownerId, ownerId))

/** "Title (copy)" when it still fits the title limit, else the title as is. */
export function copyTitle(title: string): string {
  return title.length + COPY_SUFFIX.length <= TITLE_MAX
    ? `${title}${COPY_SUFFIX}`
    : title
}

/**
 * A new draft with the same template and draft config. Slug and published
 * config are not copied. Returns `null` when the source is not the owner's.
 */
export async function duplicateInvitation(
  db: AnyDb,
  { id, ownerId }: { id: string; ownerId: string }
): Promise<{ id: string } | null> {
  const source = (
    await db
      .select({ templateId: inv.templateId, draftConfig: inv.draftConfig })
      .from(inv)
      .where(owned(id, ownerId))
  ).at(0)
  if (!source) return null

  // Drafts are stored unparsed; only touch the title when it is a string.
  const config = structuredClone(source.draftConfig)
  const event = (config as Partial<InvitationConfigBase>).event
  if (event && typeof event.title === "string") {
    event.title = copyTitle(event.title)
  }

  const [row] = await db
    .insert(inv)
    .values({
      ownerId,
      templateId: source.templateId,
      draftConfig: config,
      status: "draft",
    })
    .returning({ id: inv.id })
  return row
}

/**
 * Archive hides a published page (the public read only serves "published").
 * Unarchive restores "published" when the invitation had been published,
 * otherwise "draft". Returns the new status, or `null` when not found.
 */
export async function setArchived(
  db: AnyDb,
  { id, ownerId, archived }: { id: string; ownerId: string; archived: boolean }
): Promise<"draft" | "published" | "archived" | null> {
  const status = archived
    ? sql`'archived'::invitation_status`
    : sql`case when ${inv.publishedConfig} is not null and ${inv.slug} is not null then 'published'::invitation_status else 'draft'::invitation_status end`
  const rows = await db
    .update(inv)
    .set({ status })
    .where(owned(id, ownerId))
    .returning({ status: inv.status })
  return rows.at(0)?.status ?? null
}

/**
 * Delete an invitation. RSVPs, wishes, page views and guests cascade in the
 * database. Its media rows are deleted too (they would otherwise survive
 * with `invitation_id = null`); the stored objects are left in storage.
 */
export async function deleteInvitation(
  db: AnyDb,
  { id, ownerId }: { id: string; ownerId: string }
): Promise<boolean> {
  return db.transaction(async (tx) => {
    const found = (
      await tx.select({ id: inv.id }).from(inv).where(owned(id, ownerId))
    ).at(0)
    if (!found) return false
    await tx
      .delete(schema.mediaAssets)
      .where(
        and(
          eq(schema.mediaAssets.invitationId, id),
          eq(schema.mediaAssets.ownerId, ownerId)
        )
      )
    await tx.delete(inv).where(owned(id, ownerId))
    return true
  })
}
