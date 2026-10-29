// Text cleanup for guest input. Pure and isomorphic: the public route uses
// `sanitizeGuestName` for `?to=` on both server and client. Nothing here
// produces HTML; React escapes everything on render.

// C0/C1 controls plus zero-width and bidi override characters, which can
// hide or reorder text in names shown to the host.
const INVISIBLE =
  // eslint-disable-next-line no-control-regex
  /[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2060-\u2069\uFEFF]/g

/** Trim, turn every run of whitespace (incl. newlines) into one space, drop controls. */
export function cleanText(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(INVISIBLE, "")
    .replace(/ {2,}/g, " ")
    .trim()
}

export const MAX_GUEST_NAME = 60

/** "Dear {name}" from a URL: cleaned, no angle brackets, at most 60 chars. */
export function sanitizeGuestName(
  value: string | undefined
): string | undefined {
  if (!value) return undefined
  const name = cleanText(value.replace(/[<>]/g, " "))
    .slice(0, MAX_GUEST_NAME)
    .trim()
  return name || undefined
}
