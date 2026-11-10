// `/ics/$slug`: the published invitation as an iCalendar file.
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { buildIcs, type IcsEvent } from "@/lib/calendar"
import type * as schema from "@/server/db/schema"
import { getPublishedBySlug } from "@/server/invitations/editing.server"
import type { InvitationConfigBase } from "@/templates/_shared/schema"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>

/** One event per sub-event (akad, reception, …), else the main date. */
export function invitationEvents(
  config: InvitationConfigBase,
  slug: string,
  origin: string
): Array<IcsEvent> {
  const { event, datetime, venue, texts } = config
  const mainLocation = [venue.name, venue.address].filter(Boolean).join(", ")
  const description = texts.message.slice(0, 300) || undefined
  const url = `${origin}/i/${encodeURIComponent(slug)}`
  const base = { description, url }
  if (event.subEvents.length === 0) {
    return [
      {
        ...base,
        uid: `${slug}-1@alikeni`,
        title: event.title,
        start: datetime.start,
        end: datetime.end,
        location: mainLocation,
      },
    ]
  }
  return event.subEvents.map((sub, index) => ({
    ...base,
    uid: `${slug}-${index + 1}@alikeni`,
    title: `${event.title} · ${sub.label}`,
    start: sub.start,
    end: sub.end,
    location: sub.venueRef ?? mainLocation,
  }))
}

/** 404 unless published; otherwise a downloadable .ics. */
export async function icsResponse(
  db: AnyDb,
  rawSlug: string,
  origin: string,
  now?: Date
): Promise<Response> {
  const slug = rawSlug.replace(/\.ics$/i, "").toLowerCase()
  const invitation = /^[a-z0-9-]{1,80}$/.test(slug)
    ? await getPublishedBySlug(db, slug)
    : null
  if (!invitation) {
    return new Response("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    })
  }
  const body = buildIcs(
    invitationEvents(invitation.config, invitation.slug, origin),
    { now, name: invitation.config.event.title }
  )
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${invitation.slug}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  })
}
