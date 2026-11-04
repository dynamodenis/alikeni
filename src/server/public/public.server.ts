// Guest-facing logic for published invitations: RSVPs, wishes, page views
// and personal links. Pure functions over a Drizzle db (tested on PGlite);
// request details (hashes, limiter, human check) come in as `GuestContext`.
import { and, desc, eq, lt, sql } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { z } from "zod"
import * as schema from "@/server/db/schema"
import { getPublishedBySlug } from "@/server/invitations/editing.server"
import { GUEST_POST_RULES, type RateLimiter } from "@/server/rate-limit"
import type { WishItem } from "@/templates/_shared/context"
import { sha256Hex } from "./fingerprint.server"
import { cleanText, sanitizeGuestName } from "./sanitize"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>

/** Errors whose message is safe to show to guests verbatim. */
export class PublicError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PublicError"
  }
}

export const NOT_AVAILABLE = "This invitation is not available."
export const RSVP_CLOSED = "RSVPs are closed."
export const WISHES_CLOSED = "Wishes are closed."
export const TOO_MANY = "Too many responses. Please wait a moment."
export const VERIFY_FAILED = "Please complete the verification and try again."

export type GuestContext = {
  ipHash: string
  uaHash: string
  limiter: RateLimiter
  /** Turnstile when configured; always true otherwise. */
  verifyHuman: (token: string | undefined) => Promise<boolean>
  now?: Date
}

/* ---------- input schemas (shared with the server functions) ---------- */

const Slug = z.string().trim().toLowerCase().min(1).max(80)
/** Trimmed, whitespace-collapsed, control-free text. */
const Clean = (min: number, max: number) =>
  z
    .string()
    .max(max * 2)
    .transform(cleanText)
    .pipe(z.string().min(min).max(max))
const OptionalClean = (max: number) =>
  z
    .string()
    .max(max * 2)
    .optional()
    .transform((value) => (value === undefined ? undefined : cleanText(value)))
    .pipe(z.string().max(max).optional())
    .transform((value) => value || undefined)
/** Honeypot: real people never see it, so anything in it marks a bot. */
const Honeypot = z.string().max(500).optional().default("")
const TurnstileToken = z.string().max(4096).optional()

export const RsvpSubmission = z
  .object({
    slug: Slug,
    guestName: Clean(1, 80),
    attending: z.enum(["yes", "no", "maybe"]),
    partySize: z.number().int().min(0).max(20),
    message: OptionalClean(500),
    contact: OptionalClean(120),
    website: Honeypot,
    turnstileToken: TurnstileToken,
  })
  .refine((v) => v.partySize > 0 || v.attending === "no", {
    message: "Party size must be at least 1",
    path: ["partySize"],
  })
export type RsvpSubmission = z.input<typeof RsvpSubmission>

export const WishSubmission = z.object({
  slug: Slug,
  name: Clean(1, 80),
  message: Clean(1, 500),
  website: Honeypot,
  turnstileToken: TurnstileToken,
})
export type WishSubmission = z.input<typeof WishSubmission>

/* ---------- helpers ---------- */

async function requirePublished(db: AnyDb, slug: string) {
  const invitation = await getPublishedBySlug(db, slug)
  if (!invitation) throw new PublicError(NOT_AVAILABLE)
  return invitation
}

/** Rate limit per invitation per hashed IP (5/min, 30/day). */
async function rateLimit(
  kind: "rsvp" | "wish",
  invitationId: string,
  ctx: GuestContext
) {
  const limit = await ctx.limiter.hit(
    `${kind}:${invitationId}:${ctx.ipHash}`,
    GUEST_POST_RULES
  )
  if (!limit.ok) throw new PublicError(TOO_MANY)
}

/* ---------- RSVP ---------- */

export async function submitRsvp(
  db: AnyDb,
  raw: RsvpSubmission,
  ctx: GuestContext
): Promise<{ ok: true }> {
  const input = RsvpSubmission.parse(raw)
  const invitation = await requirePublished(db, input.slug)
  const { features, texts } = invitation.config
  const now = ctx.now ?? new Date()
  if (!features.rsvp) throw new PublicError(RSVP_CLOSED)
  if (texts.rsvpDeadline && now.getTime() > Date.parse(texts.rsvpDeadline)) {
    throw new PublicError(RSVP_CLOSED)
  }
  await rateLimit("rsvp", invitation.id, ctx)
  // Honeypot filled: look successful so the bot moves on; store nothing.
  if (input.website) return { ok: true }
  if (!(await ctx.verifyHuman(input.turnstileToken))) {
    throw new PublicError(VERIFY_FAILED)
  }
  await db.insert(schema.rsvps).values({
    invitationId: invitation.id,
    guestName: input.guestName,
    attending: input.attending,
    partySize: input.attending === "no" ? 0 : input.partySize,
    message: input.message ?? null,
    contact: input.contact ?? null,
    ipHash: ctx.ipHash,
    userAgentHash: ctx.uaHash,
  })
  return { ok: true }
}

/* ---------- wishes ---------- */

export const MAX_LISTED_WISHES = 50

const toWishItem = (row: {
  id: string
  name: string
  message: string
  createdAt: Date
}): WishItem => ({
  id: row.id,
  name: row.name,
  message: row.message,
  createdAt: row.createdAt.toISOString(),
})

export async function submitWish(
  db: AnyDb,
  raw: WishSubmission,
  ctx: GuestContext
): Promise<WishItem> {
  const input = WishSubmission.parse(raw)
  const invitation = await requirePublished(db, input.slug)
  if (!invitation.config.features.wishes) throw new PublicError(WISHES_CLOSED)
  await rateLimit("wish", invitation.id, ctx)
  if (input.website) {
    // Same shape as a real wish, never stored.
    return {
      id: crypto.randomUUID(),
      name: input.name,
      message: input.message,
      createdAt: (ctx.now ?? new Date()).toISOString(),
    }
  }
  if (!(await ctx.verifyHuman(input.turnstileToken))) {
    throw new PublicError(VERIFY_FAILED)
  }
  const row = (
    await db
      .insert(schema.wishes)
      .values({
        invitationId: invitation.id,
        name: input.name,
        message: input.message,
        ipHash: ctx.ipHash,
      })
      .returning({
        id: schema.wishes.id,
        name: schema.wishes.name,
        message: schema.wishes.message,
        createdAt: schema.wishes.createdAt,
      })
  ).at(0)
  if (!row) throw new Error("wish insert returned nothing")
  return toWishItem(row)
}

/** Approved wishes, newest first. */
export async function listWishes(
  db: AnyDb,
  invitationId: string,
  limit = MAX_LISTED_WISHES
): Promise<Array<WishItem>> {
  const rows = await db
    .select({
      id: schema.wishes.id,
      name: schema.wishes.name,
      message: schema.wishes.message,
      createdAt: schema.wishes.createdAt,
    })
    .from(schema.wishes)
    .where(
      and(
        eq(schema.wishes.invitationId, invitationId),
        eq(schema.wishes.approved, true)
      )
    )
    .orderBy(desc(schema.wishes.createdAt))
    .limit(limit)
  return rows.map(toWishItem)
}

export async function listWishesBySlug(
  db: AnyDb,
  slug: string
): Promise<Array<WishItem>> {
  const invitation = await getPublishedBySlug(db, slug)
  return invitation ? listWishes(db, invitation.id) : []
}

/* ---------- personal links ---------- */

/**
 * `?to=` is either a guest's personal token (then their stored name wins) or
 * a free-text name, sanitized.
 */
export async function resolveGuestName(
  db: AnyDb,
  invitationId: string,
  to: string | undefined
): Promise<string | undefined> {
  const value = to?.trim()
  if (!value) return undefined
  if (/^[A-Za-z0-9_-]{4,60}$/.test(value)) {
    const guest = (
      await db
        .select({ name: schema.guests.name })
        .from(schema.guests)
        .where(
          and(
            eq(schema.guests.invitationId, invitationId),
            eq(schema.guests.slugToken, value)
          )
        )
        .limit(1)
    ).at(0)
    if (guest) return sanitizeGuestName(guest.name)
  }
  return sanitizeGuestName(value)
}

/* ---------- page views ---------- */

/** UTC calendar day, "YYYY-MM-DD". */
export const utcDay = (date: Date) => date.toISOString().slice(0, 10)

/** Visitor rows are kept this many days, then pruned. */
const VISITOR_RETENTION_DAYS = 2

export type Visitor = { ipHash: string; uaHash: string; bot: boolean }

/**
 * +1 on today's `page_views` row the first time a visitor (salted IP + UA
 * hashes) opens this invitation on this UTC day; bots never count. Dedupe
 * lives in `page_view_visitors` (insert … on conflict do nothing), so it
 * holds across server instances, Worker isolates and restarts. Old visitor
 * rows are pruned on about 1 in `pruneEvery` counted views.
 */
export async function recordView(
  db: AnyDb,
  invitationId: string,
  visitor: Visitor,
  options: { now?: Date; pruneEvery?: number; random?: () => number } = {}
): Promise<boolean> {
  if (visitor.bot) return false
  const now = options.now ?? new Date()
  const day = utcDay(now)
  const visitorHash = await sha256Hex(`${visitor.ipHash}:${visitor.uaHash}`)
  const inserted = await db
    .insert(schema.pageViewVisitors)
    .values({ invitationId, day, visitorHash })
    .onConflictDoNothing()
    .returning({ day: schema.pageViewVisitors.day })
  if (inserted.length === 0) return false
  await db
    .insert(schema.pageViews)
    .values({ invitationId, day, count: 1 })
    .onConflictDoUpdate({
      target: [schema.pageViews.invitationId, schema.pageViews.day],
      set: { count: sql`${schema.pageViews.count} + 1` },
    })
  const random = options.random ?? Math.random
  if (random() * (options.pruneEvery ?? 200) < 1) {
    const horizon = new Date(
      now.getTime() - VISITOR_RETENTION_DAYS * 86_400_000
    )
    await db
      .delete(schema.pageViewVisitors)
      .where(lt(schema.pageViewVisitors.day, utcDay(horizon)))
  }
  return true
}

/**
 * The view beacon (`recordViewFn`, fired once after hydration): counts a
 * view of a published slug. False for bots, unknown slugs and repeats.
 */
export async function recordViewBySlug(
  db: AnyDb,
  slug: string,
  visitor: Visitor,
  options: { now?: Date } = {}
): Promise<boolean> {
  if (visitor.bot) return false
  const invitation = await getPublishedBySlug(db, slug)
  if (!invitation) return false
  return recordView(db, invitation.id, visitor, options)
}

/* ---------- the public page ---------- */

/**
 * Everything `/i/$slug` needs, or null when the invitation is not public.
 * Nothing here depends on who is asking (views are counted by the client
 * beacon), so the HTML is cacheable at the edge.
 */
export async function loadPublicPage(
  db: AnyDb,
  input: { slug: string; to?: string }
) {
  const invitation = await getPublishedBySlug(db, input.slug)
  if (!invitation) return null
  const [wishes, guestName] = await Promise.all([
    invitation.config.features.wishes
      ? listWishes(db, invitation.id)
      : Promise.resolve([]),
    resolveGuestName(db, invitation.id, input.to),
  ])
  return {
    templateId: invitation.templateId,
    slug: invitation.slug,
    config: invitation.config,
    wishes,
    guestName,
  }
}
