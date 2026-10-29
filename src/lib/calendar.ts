/** Calendar link builders. Pure string work so they are testable and SSR-safe. */

export type CalendarEvent = {
  title: string
  start: string
  end?: string
  timezone: string
  location?: string
  description?: string
}

const DEFAULT_DURATION_MS = 2 * 60 * 60 * 1000

/** UTC "basic" format Google and ICS both accept: 20270612T120000Z. */
export function toUtcStamp(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")
}

export function endOrDefault(start: string, end?: string): string {
  return end ?? new Date(Date.parse(start) + DEFAULT_DURATION_MS).toISOString()
}

export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${toUtcStamp(event.start)}/${toUtcStamp(endOrDefault(event.start, event.end))}`,
    ctz: event.timezone,
  })
  if (event.location) params.set("location", event.location)
  if (event.description) params.set("details", event.description)
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/** Path served by the app (Phase 6 implements the route). */
export function icsPath(slug: string): string {
  return `/ics/${encodeURIComponent(slug)}`
}

/* ---------- iCalendar (RFC 5545) ---------- */

export type IcsEvent = {
  /** Globally unique, stable across downloads (updates replace the event). */
  uid: string
  title: string
  start: string
  end?: string
  location?: string
  description?: string
  url?: string
}

/** Escape a TEXT value: backslash, semicolon, comma and newlines. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r\n|\r|\n/g, "\\n")
}

const encoder = new TextEncoder()
const MAX_OCTETS = 75

/**
 * Fold a content line to at most 75 octets per physical line (CRLF + one
 * space continues it). Counts UTF-8 bytes and never splits a character.
 */
export function foldIcsLine(line: string): string {
  if (encoder.encode(line).length <= MAX_OCTETS) return line
  const parts: Array<string> = []
  let current = ""
  let size = 0
  // Continuation lines start with a space, which counts toward their 75.
  let limit = MAX_OCTETS
  for (const char of line) {
    const bytes = encoder.encode(char).length
    if (size + bytes > limit) {
      parts.push(current)
      current = ""
      size = 0
      limit = MAX_OCTETS - 1
    }
    current += char
    size += bytes
  }
  parts.push(current)
  return parts.join("\r\n ")
}

/**
 * A VCALENDAR with one VEVENT per event. Times are written in UTC (`…Z`):
 * an instant needs no VTIMEZONE block, every client converts it to the
 * viewer's zone, and it cannot go wrong across DST changes the way a
 * hand-built single-offset VTIMEZONE would. The invitation's own zone is
 * still used everywhere dates are shown as text.
 */
export function buildIcs(
  events: ReadonlyArray<IcsEvent>,
  options: { now?: Date; name?: string } = {}
): string {
  const stamp = toUtcStamp((options.now ?? new Date()).toISOString())
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Festly//Invitations//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    ...(options.name ? [`X-WR-CALNAME:${escapeIcsText(options.name)}`] : []),
  ]
  for (const event of events) {
    lines.push(
      "BEGIN:VEVENT",
      `UID:${event.uid}`,
      `DTSTAMP:${stamp}`,
      `DTSTART:${toUtcStamp(event.start)}`,
      `DTEND:${toUtcStamp(endOrDefault(event.start, event.end))}`,
      `SUMMARY:${escapeIcsText(event.title)}`
    )
    if (event.location) lines.push(`LOCATION:${escapeIcsText(event.location)}`)
    if (event.description)
      lines.push(`DESCRIPTION:${escapeIcsText(event.description)}`)
    // URI values are not TEXT: no escaping, only folding.
    if (event.url) lines.push(`URL:${event.url}`)
    lines.push("END:VEVENT")
  }
  lines.push("END:VCALENDAR")
  return lines.map(foldIcsLine).join("\r\n") + "\r\n"
}
