/** Languages an invitation's guest-facing chrome can be shown in. */
export const LOCALES = ["en", "id", "sw"] as const
export type Locale = (typeof LOCALES)[number]

/** BCP 47 tag handed to `Intl` (and to `lang`) for each invitation locale. */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en",
  id: "id-ID",
  sw: "sw",
}

/** Names shown in the editor's language picker, each in its own language. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  id: "Bahasa Indonesia",
  sw: "Kiswahili",
}

export const isLocale = (value: unknown): value is Locale =>
  (LOCALES as ReadonlyArray<unknown>).includes(value)
