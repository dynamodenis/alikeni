// Scheduled emails, run every few minutes by the Worker's cron trigger
// (src/worker.ts → POST /api/cron/notifications):
//
//  - RSVP updates: one email per invitation to its owner, listing the
//    responses that arrived since the last one.
//  - Event reminders: one email to each guest who said yes or maybe and left
//    an email address, in the 24 hours before the event starts.
//
// Pure functions over a Drizzle db and an `EmailSender` (tested on PGlite).
// A row is marked only after its email was accepted, so a failed send is
// retried on the next run.
import { and, asc, eq, gt, inArray, isNotNull, isNull, sql } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { z } from "zod"
import { formatLongDate, formatTime } from "@/lib/format-date"
import * as schema from "@/server/db/schema"
import type { EmailSender } from "./send.server"
import {
  eventReminderEmail,
  rsvpDigestEmail,
  type RsvpLine,
} from "./templates.server"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>

const { rsvps, invitations: inv, users } = schema

const HOUR = 3_600_000

/** Responses older than this are never announced (an owner who verifies late). */
export const DIGEST_MAX_AGE_MS = 7 * 24 * HOUR
/** Reminders go out once the event is this close. */
export const REMINDER_WINDOW_MS = 24 * HOUR

export type NotifyOptions = {
  /** APP_ORIGIN, for links. */
  origin: string
  now?: Date
  /** Emails per run and kind; the rest waits for the next run. */
  maxEmails?: number
  /** Wait between two sends, to stay under the provider's rate limit. */
  pauseMs?: number
}

export type NotifyResult = { sent: number; failed: number }

const DEFAULT_MAX_EMAILS = 40
/** Resend allows 2 requests per second by default. */
const DEFAULT_PAUSE_MS = 550

const pause = (ms: number) =>
  ms > 0 ? new Promise<void>((resolve) => setTimeout(resolve, ms)) : undefined

const failure = (kind: string, error: unknown) =>
  console.error(
    `[notifications] ${kind} failed: ${error instanceof Error ? error.message : String(error)}`
  )

/** Text at a path inside a jsonb column. */
const jsonText = (column: unknown, ...path: Array<string>) =>
  sql<string | null>`${column} #>> ${`{${path.join(",")}}`}::text[]`

/* ---------- RSVP updates for owners ---------- */

/**
 * Emails each owner the responses not announced yet, one email per
 * invitation. Only verified addresses get them (the confirmation email says
 * so), which also keeps a mistyped sign-up address from receiving guest names.
 */
export async function sendRsvpDigests(
  db: AnyDb,
  send: EmailSender,
  options: NotifyOptions
): Promise<NotifyResult> {
  const now = options.now ?? new Date()
  const maxEmails = options.maxEmails ?? DEFAULT_MAX_EMAILS
  const rows = await db
    .select({
      id: rsvps.id,
      invitationId: rsvps.invitationId,
      guestName: rsvps.guestName,
      attending: rsvps.attending,
      partySize: rsvps.partySize,
      message: rsvps.message,
      to: users.email,
      title: sql<string>`coalesce(${jsonText(inv.publishedConfig, "event", "title")}, ${jsonText(inv.draftConfig, "event", "title")}, 'your invitation')`,
    })
    .from(rsvps)
    .innerJoin(inv, eq(inv.id, rsvps.invitationId))
    .innerJoin(users, eq(users.id, inv.ownerId))
    .where(
      and(
        isNull(rsvps.ownerNotifiedAt),
        eq(users.emailVerified, true),
        gt(rsvps.createdAt, new Date(now.getTime() - DIGEST_MAX_AGE_MS))
      )
    )
    .orderBy(asc(rsvps.createdAt))
    .limit(2000)

  const byInvitation = new Map<
    string,
    { to: string; title: string; ids: Array<string>; lines: Array<RsvpLine> }
  >()
  for (const row of rows) {
    let group = byInvitation.get(row.invitationId)
    if (!group) {
      group = { to: row.to, title: row.title, ids: [], lines: [] }
      byInvitation.set(row.invitationId, group)
    }
    group.ids.push(row.id)
    group.lines.push(row)
  }

  const result: NotifyResult = { sent: 0, failed: 0 }
  for (const [invitationId, group] of byInvitation) {
    if (result.sent + result.failed >= maxEmails) break
    if (result.sent + result.failed > 0)
      await pause(options.pauseMs ?? DEFAULT_PAUSE_MS)
    try {
      await send(
        rsvpDigestEmail({
          to: group.to,
          title: group.title,
          rsvps: group.lines,
          url: `${options.origin}/dashboard/${invitationId}/responses`,
        })
      )
      await db
        .update(rsvps)
        .set({ ownerNotifiedAt: now })
        .where(inArray(rsvps.id, group.ids))
      result.sent += 1
    } catch (error) {
      failure("RSVP update", error)
      result.failed += 1
    }
  }
  return result
}

/* ---------- event reminders for guests ---------- */

const EmailAddress = z.email().max(120)

/**
 * Reminds guests of a published invitation whose event starts within the
 * next 24 hours: those who answered yes or maybe, left an email address as
 * their contact, and replied before that window opened (someone who replies
 * the day before does not need reminding). One email per address and
 * invitation, sent once.
 */
export async function sendEventReminders(
  db: AnyDb,
  send: EmailSender,
  options: NotifyOptions
): Promise<NotifyResult> {
  const now = options.now ?? new Date()
  const maxEmails = options.maxEmails ?? DEFAULT_MAX_EMAILS
  const start = sql<Date>`(${jsonText(inv.publishedConfig, "datetime", "start")})::timestamptz`
  const nowSql = sql`${now.toISOString()}::timestamptz`
  const windowEnd = sql`${new Date(now.getTime() + REMINDER_WINDOW_MS).toISOString()}::timestamptz`
  const rows = await db
    .select({
      id: rsvps.id,
      invitationId: rsvps.invitationId,
      guestName: rsvps.guestName,
      contact: rsvps.contact,
      slug: inv.slug,
      title: jsonText(inv.publishedConfig, "event", "title"),
      start: jsonText(inv.publishedConfig, "datetime", "start"),
      timezone: jsonText(inv.publishedConfig, "datetime", "timezone"),
      venueName: jsonText(inv.publishedConfig, "venue", "name"),
      venueAddress: jsonText(inv.publishedConfig, "venue", "address"),
    })
    .from(rsvps)
    .innerJoin(inv, eq(inv.id, rsvps.invitationId))
    .where(
      and(
        isNull(rsvps.reminderSentAt),
        inArray(rsvps.attending, ["yes", "maybe"]),
        isNotNull(rsvps.contact),
        sql`${rsvps.contact} LIKE '%@%'`,
        eq(inv.status, "published"),
        isNotNull(inv.slug),
        sql`${start} > ${nowSql}`,
        sql`${start} <= ${windowEnd}`,
        sql`${rsvps.createdAt} < ${start} - interval '24 hours'`
      )
    )
    .orderBy(asc(rsvps.createdAt))
    .limit(2000)

  // One email per address and invitation; every row it covers gets marked.
  // A contact that is not an email address (a phone number with an @ typo)
  // is marked too, so it is not scanned again.
  const groups = new Map<
    string,
    { row: (typeof rows)[number]; to: string | null; ids: Array<string> }
  >()
  for (const row of rows) {
    const parsed = EmailAddress.safeParse(row.contact?.trim())
    const to = parsed.success ? parsed.data.toLowerCase() : null
    const key = `${row.invitationId}:${to ?? `invalid:${row.id}`}`
    const group = groups.get(key)
    if (group) group.ids.push(row.id)
    else groups.set(key, { row, to, ids: [row.id] })
  }

  const mark = (ids: Array<string>) =>
    db.update(rsvps).set({ reminderSentAt: now }).where(inArray(rsvps.id, ids))

  const result: NotifyResult = { sent: 0, failed: 0 }
  for (const { row, to, ids } of groups.values()) {
    if (!to || !row.slug || !row.title || !row.start || !row.timezone) {
      await mark(ids)
      continue
    }
    if (result.sent + result.failed >= maxEmails) break
    if (result.sent + result.failed > 0)
      await pause(options.pauseMs ?? DEFAULT_PAUSE_MS)
    try {
      await send(
        eventReminderEmail({
          to,
          guestName: row.guestName,
          title: row.title,
          date: formatLongDate(row.start, row.timezone),
          time: formatTime(row.start, row.timezone),
          timezone: row.timezone,
          venue: [row.venueName, row.venueAddress].filter(Boolean).join(", "),
          url: `${options.origin}/i/${encodeURIComponent(row.slug)}`,
        })
      )
      await mark(ids)
      result.sent += 1
    } catch (error) {
      failure("event reminder", error)
      result.failed += 1
    }
  }
  return result
}

/** Both jobs; one failing does not stop the other. */
export async function runNotifications(
  db: AnyDb,
  send: EmailSender,
  options: NotifyOptions
) {
  const run = async (
    kind: string,
    job: () => Promise<NotifyResult>
  ): Promise<NotifyResult> => {
    try {
      return await job()
    } catch (error) {
      failure(kind, error)
      return { sent: 0, failed: 0 }
    }
  }
  return {
    rsvpUpdates: await run("RSVP updates", () =>
      sendRsvpDigests(db, send, options)
    ),
    reminders: await run("event reminders", () =>
      sendEventReminders(db, send, options)
    ),
  }
}
