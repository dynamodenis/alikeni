// Editor persistence: autosave with optimistic concurrency, slugs, publish,
// and the public read. Pure functions over a Drizzle db (tested on PGlite).
import { and, eq, isNotNull, ne, sql } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { applyLockedEdits, isEditLocked } from "@/lib/edit-lock"
import { configForPlan, freeHasEnded } from "@/lib/plans"
import { RESERVED_SLUGS, SLUG_PATTERN } from "@/lib/slug"
import { invalidatePublishedCard } from "@/server/og/cache.server"
import { loadTemplate } from "@/templates/registry"
import * as schema from "@/server/db/schema"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>
const inv = schema.invitations

/** Errors safe to show in the editor. */
export class EditorError extends Error {
  constructor(
    message: string,
    readonly code:
      "not_found" | "invalid" | "conflict" | "slug_taken" | "slug_invalid"
  ) {
    super(message)
    this.name = "EditorError"
  }
}

export type SaveResult = { updatedAt: string }

/** Postgres keeps microseconds; JS dates keep milliseconds. Compare at ms. */
const sameMillis = (iso: string) =>
  sql`date_trunc('milliseconds', ${inv.updatedAt}) = ${new Date(iso).toISOString()}::timestamptz`

/** The owner's row with what saving and publishing need, lock included. */
async function ownedForEdit(db: AnyDb, id: string, ownerId: string, now: Date) {
  const row = (
    await db
      .select({
        templateId: inv.templateId,
        slug: inv.slug,
        draftConfig: inv.draftConfig,
        publishedConfig: inv.publishedConfig,
        publishedAt: inv.publishedAt,
        editUnlockedUntil: inv.editUnlockedUntil,
      })
      .from(inv)
      .where(and(eq(inv.id, id), eq(inv.ownerId, ownerId)))
  ).at(0)
  if (!row) throw new EditorError("Invitation not found.", "not_found")
  return { ...row, locked: isEditLocked(row, now) }
}

export async function validateForTemplate(templateId: string, config: unknown) {
  const module = await loadTemplate(templateId)
  return module.schema.safeParse(config)
}

/**
 * Autosave. `baseUpdatedAt` is the version the editor loaded; if the row
 * changed since (another tab, another device) we refuse unless `force`.
 *
 * Once the event has ended (`src/lib/edit-lock.ts`) only photos and the
 * closing words are taken from `config`; everything else stays as stored,
 * whatever the client sent.
 */
export async function saveDraft(
  db: AnyDb,
  input: {
    id: string
    ownerId: string
    config: unknown
    baseUpdatedAt: string
    force?: boolean
  },
  now = new Date()
): Promise<SaveResult> {
  const owned = await ownedForEdit(db, input.id, input.ownerId, now)
  const parsed = await validateForTemplate(
    owned.templateId,
    owned.locked
      ? applyLockedEdits(owned.draftConfig, input.config)
      : input.config
  )
  if (!parsed.success)
    throw new EditorError(
      "Some fields need attention before saving.",
      "invalid"
    )

  const where = and(
    eq(inv.id, input.id),
    eq(inv.ownerId, input.ownerId),
    input.force ? undefined : sameMillis(input.baseUpdatedAt)
  )
  const updated = await db
    .update(inv)
    .set({ draftConfig: parsed.data, updatedAt: now })
    .where(where)
    .returning({ updatedAt: inv.updatedAt })
  const row = updated.at(0)
  if (!row)
    throw new EditorError(
      "This invitation was changed somewhere else.",
      "conflict"
    )
  return { updatedAt: row.updatedAt.toISOString() }
}

/**
 * Throw away the draft's unpublished edits: the draft becomes what guests
 * see now. Allowed while locked too, since it can only put back content that
 * is already public.
 *
 * `updatedAt` goes back to the publish time, so "edited since publishing"
 * (compared by time in the editor) is false again. Not checked against the
 * editor's version: discarding is deliberate, whatever another tab saved.
 */
export async function discardDraft(
  db: AnyDb,
  input: { id: string; ownerId: string }
) {
  const updated = await db
    .update(inv)
    .set({
      draftConfig: sql`${inv.publishedConfig}`,
      updatedAt: sql`coalesce(${inv.publishedAt}, now())`,
    })
    .where(
      and(
        eq(inv.id, input.id),
        eq(inv.ownerId, input.ownerId),
        isNotNull(inv.publishedConfig)
      )
    )
    .returning({ draftConfig: inv.draftConfig, updatedAt: inv.updatedAt })
  const row = updated.at(0)
  if (!row)
    throw new EditorError(
      "There is no published version to go back to.",
      "not_found"
    )
  return {
    draftConfig: row.draftConfig,
    updatedAt: row.updatedAt.toISOString(),
  }
}

export type SlugCheck =
  { available: true } | { available: false; reason: string }

export async function checkSlug(
  db: AnyDb,
  input: { slug: string; id?: string }
): Promise<SlugCheck> {
  const slug = input.slug.trim().toLowerCase()
  if (!SLUG_PATTERN.test(slug) || slug.includes("--")) {
    return {
      available: false,
      reason: "Use 3–60 lowercase letters, numbers or dashes.",
    }
  }
  if (RESERVED_SLUGS.has(slug))
    return { available: false, reason: "That address is reserved." }
  const clash = await db
    .select({ id: inv.id })
    .from(inv)
    .where(
      input.id
        ? and(eq(inv.slug, slug), ne(inv.id, input.id))
        : eq(inv.slug, slug)
    )
  return clash.length
    ? { available: false, reason: "That address is already taken." }
    : { available: true }
}

/**
 * Publish (or republish) the current draft at `slug`.
 *
 * Once the event has ended, republishing only carries the draft's photos and
 * closing words onto the published page; its date, names, address and the
 * rest stay as guests last saw them, and so does the link.
 */
export async function publishInvitation(
  db: AnyDb,
  input: { id: string; ownerId: string; slug: string },
  now = new Date()
) {
  const owned = await ownedForEdit(db, input.id, input.ownerId, now)
  const { templateId } = owned
  const keepSlug = owned.locked && owned.slug ? owned.slug : null
  const check = keepSlug
    ? ({ available: true } as const)
    : await checkSlug(db, { slug: input.slug, id: input.id })
  if (!check.available)
    throw new EditorError(
      check.reason,
      check.reason.includes("taken") ? "slug_taken" : "slug_invalid"
    )

  const draft = owned
  const parsed = await validateForTemplate(
    templateId,
    owned.locked
      ? applyLockedEdits(owned.publishedConfig, owned.draftConfig)
      : owned.draftConfig
  )
  if (!parsed.success)
    throw new EditorError(
      "Fix the highlighted fields before publishing.",
      "invalid"
    )

  const slug = keepSlug ?? input.slug.trim().toLowerCase()
  try {
    const [row] = await db
      .update(inv)
      .set({
        slug,
        status: "published",
        publishedConfig: parsed.data,
        publishedAt: now,
        updatedAt: now,
      })
      .where(and(eq(inv.id, input.id), eq(inv.ownerId, input.ownerId)))
      .returning({
        slug: inv.slug,
        publishedAt: inv.publishedAt,
        updatedAt: inv.updatedAt,
      })
    // The OG card key includes publishedAt; drop the old one (best effort).
    await invalidatePublishedCard(input.id, draft.publishedAt)
    return {
      slug: row.slug ?? slug,
      publishedAt: (row.publishedAt ?? now).toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    }
  } catch (error) {
    // A concurrent publish grabbed the slug between check and update.
    if (
      String(error).includes("invitations_slug_unique") ||
      String((error as { cause?: unknown }).cause).includes("unique")
    ) {
      throw new EditorError("That address is already taken.", "slug_taken")
    }
    throw error
  }
}

/**
 * A published invitation as guests may see it: the plan is applied (free:
 * gift details removed) and `ended` is true once a free invitation's page has
 * gone offline (see `src/lib/plans.ts`). Null when missing or not published.
 */
export async function findPublishedBySlug(
  db: AnyDb,
  slug: string,
  now = new Date()
) {
  const row = (
    await db
      .select({
        id: inv.id,
        templateId: inv.templateId,
        slug: inv.slug,
        plan: inv.plan,
        config: inv.publishedConfig,
        publishedAt: inv.publishedAt,
      })
      .from(inv)
      .where(and(eq(inv.slug, slug.toLowerCase()), eq(inv.status, "published")))
  ).at(0)
  if (!row?.config || !row.slug) return null
  return {
    id: row.id,
    templateId: row.templateId,
    slug: row.slug,
    plan: row.plan,
    config: configForPlan(row.config, row.plan),
    publishedAt: row.publishedAt?.toISOString() ?? null,
    ended: row.plan === "free" && freeHasEnded(row.config, now),
  }
}

/**
 * The public page's data: published invitations that are still online. Every
 * guest-facing path (page, RSVP, wishes, views, calendar, OG card) goes
 * through here, so an ended free invitation is unavailable everywhere.
 */
export async function getPublishedBySlug(
  db: AnyDb,
  slug: string,
  now = new Date()
) {
  const found = await findPublishedBySlug(db, slug, now)
  if (!found || found.ended) return null
  const { ended: _ended, ...invitation } = found
  return invitation
}
