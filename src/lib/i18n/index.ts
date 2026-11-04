import { en, type Messages } from "./en"
import { id } from "./id"
import type { Locale } from "./locales"

export * from "./locales"
export type { Messages }

const MESSAGES: Record<Locale, Messages> = { en, id }

/** The guest-facing strings for an invitation locale (English when unknown). */
export function getMessages(locale: Locale | undefined): Messages {
  return (locale && MESSAGES[locale]) || en
}
