// Free vs Premium, in one place: limits, prices and the rules that apply a
// plan to a published invitation. Isomorphic: the server enforces these, the
// dashboard and editor show them.
import type { InvitationConfigBase } from "@/templates/_shared/schema"

export const PLANS = ["free", "premium"] as const
export type Plan = (typeof PLANS)[number]

/**
 * A free invitation stays online through this many days after the last event
 * day (in the event's time zone), then goes offline. 1 = the day after.
 */
export const FREE_DAYS_AFTER_EVENT = 1

/** RSVPs (responses, not headcount) a free invitation accepts. */
export const FREE_RSVP_LIMIT = 50

/**
 * One-time Premium upgrade per invitation, in each currency's subunit (what
 * Paystack charges). KES is for M-Pesa and Kenyan cards, USD for everyone
 * else. Placeholder prices: change them here.
 */
export const PREMIUM_PRICE = { KES: 150_000, USD: 1_200 } as const
export type Currency = keyof typeof PREMIUM_PRICE
export const CURRENCIES = Object.keys(PREMIUM_PRICE) as Array<Currency>

export const isCurrency = (value: unknown): value is Currency =>
  typeof value === "string" && value in PREMIUM_PRICE

/** "KES 1,500" / "$12". */
export function formatPrice(currency: Currency, locale = "en"): string {
  const amount = PREMIUM_PRICE[currency] / 100
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

/** KES for visitors in Kenya (M-Pesa), USD elsewhere. */
export const defaultCurrency = (
  country: string | null | undefined
): Currency => (country?.toUpperCase() === "KE" ? "KES" : "USD")

/* ---------- free-plan expiry ---------- */

/** YYYY-MM-DD of an instant in a time zone (UTC when the zone is unknown). */
export function localDay(at: Date, timeZone: string): string {
  const format = (zone: string) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(at)
  let parts: Array<Intl.DateTimeFormatPart>
  try {
    parts = format(timeZone)
  } catch {
    parts = format("UTC")
  }
  const get = (type: string) => parts.find((p) => p.type === type)?.value
  return `${get("year")}-${get("month")}-${get("day")}`
}

/** `day` (YYYY-MM-DD) plus `n` calendar days. */
export function addDays(day: string, n: number): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + n)
  return date.toISOString().slice(0, 10)
}

type DatedConfig = Pick<InvitationConfigBase, "datetime" | "event">

/** The latest event moment: main start/end and every sub-event's. */
export function lastEventMoment(config: DatedConfig): Date {
  const times = [
    config.datetime.start,
    config.datetime.end,
    ...config.event.subEvents.flatMap((sub) => [sub.start, sub.end]),
  ]
    .filter((value): value is string => !!value)
    .map((value) => Date.parse(value))
    .filter((ms) => Number.isFinite(ms))
  return new Date(Math.max(...times))
}

/**
 * Last local day a free invitation is online (YYYY-MM-DD, event time zone):
 * the last event day plus `FREE_DAYS_AFTER_EVENT`. It goes offline when that
 * day ends.
 */
export function freeOnlineUntil(config: DatedConfig): string {
  const zone = config.datetime.timezone
  return addDays(localDay(lastEventMoment(config), zone), FREE_DAYS_AFTER_EVENT)
}

/** Whether a free invitation's page has gone offline at `now`. */
export function freeHasEnded(config: DatedConfig, now = new Date()): boolean {
  return localDay(now, config.datetime.timezone) > freeOnlineUntil(config)
}

/* ---------- what guests receive ---------- */

const NO_GIFTS: InvitationConfigBase["gifts"] = {
  enabled: false,
  accounts: [],
  ewallets: [],
  registryLinks: [],
}

/**
 * The published config as guests may see it on `plan`. Free: no gift
 * section, and the bank, wallet, QR and registry details are removed, so they
 * never leave the server.
 */
export function configForPlan<C extends InvitationConfigBase>(
  config: C,
  plan: Plan
): C {
  if (plan === "premium") return config
  return {
    ...config,
    gifts: NO_GIFTS,
    features: { ...config.features, gifts: false },
  }
}
