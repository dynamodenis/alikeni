// What a guest is told when an RSVP or wish is refused by the rate limit.
// The server sends the numbers (`GuestRateLimit`); the page words them in the
// invitation's language.
import { INTL_LOCALE, type Locale, type Messages } from "@/lib/i18n"

export type GuestRateLimit = {
  /**
   * "you": this guest's own budget (per device, or per IP for clients that
   * send no device id). "network": the shared ceiling for everyone behind the
   * guest's IP address.
   */
  scope: "you" | "network"
  /** Posts already counted in the window. */
  used: number
  limit: number
  windowSec: number
  /** Seconds until one more post is accepted. */
  retryAfterSec: number
}

/** Thrown on the client by the public page's actions; forms catch it. */
export class GuestRateLimitError extends Error {
  constructor(readonly info: GuestRateLimit) {
    super("Rate limited")
    this.name = "GuestRateLimitError"
  }
}

/**
 * "42 seconds", "5 minutes", "3 hours 10 minutes" in the locale's words.
 * Rounds up, so a guest is never told a time that is too early.
 */
export function formatWait(totalSec: number, locale: Locale): string {
  const tag = INTL_LOCALE[locale]
  const unit = (value: number, name: "second" | "minute" | "hour") =>
    new Intl.NumberFormat(tag, {
      style: "unit",
      unit: name,
      unitDisplay: "long",
    }).format(value)
  const sec = Math.max(1, Math.ceil(totalSec))
  if (sec < 60) return unit(sec, "second")
  const totalMin = Math.ceil(sec / 60)
  if (totalMin < 60) return unit(totalMin, "minute")
  const hours = Math.floor(totalMin / 60)
  const minutes = totalMin % 60
  return minutes === 0
    ? unit(hours, "hour")
    : `${unit(hours, "hour")} ${unit(minutes, "minute")}`
}

/**
 * The sentence a guest sees, e.g. "You have sent 5 responses in the last
 * minute. You can send another in 42 seconds."
 */
export function describeRateLimit(
  info: GuestRateLimit,
  kind: "rsvp" | "wish",
  t: Messages,
  locale: Locale
): string {
  const wait = formatWait(info.retryAfterSec, locale)
  if (info.scope === "network") return t.limits.network(wait)
  const sent =
    kind === "rsvp" ? t.limits.responses(info.used) : t.limits.wishes(info.used)
  return t.limits.you(sent, t.limits.window(info.windowSec), wait)
}
