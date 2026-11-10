// A random id per guest browser, sent with RSVPs and wishes so the rate limit
// can count per device instead of per IP: guests sharing one connection (a
// family's wifi, the venue's wifi, a mobile carrier's shared IP) no longer
// use up each other's budget. It identifies nothing about the guest, is never
// shown, and is stored only for abuse prevention.

/** What the server accepts as a device id (base64url, 16–64 chars). */
export const DEVICE_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/

const STORAGE_KEY = "alikeni:device"
let memo: string | undefined

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

/**
 * This browser's device id: read from localStorage, created on first use.
 * Without storage (blocked, private mode quirks) it lives for the page
 * session only. Browser only: call it from event handlers, not render.
 */
export function guestDeviceId(): string {
  if (memo) return memo
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && DEVICE_ID_PATTERN.test(saved)) return (memo = saved)
  } catch {
    // Storage unavailable: fall through to a session-only id.
  }
  const id = randomId()
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // Session-only id is fine.
  }
  return (memo = id)
}
