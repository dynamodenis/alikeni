// The session as navigation sees it. Signed-in pages check it before every
// in-app move (`_authed`), and link hover-preloads check it too, so asking
// the server each time costs a Worker request and a database query per
// click. This keeps the answer for a minute in the browser.
//
// Navigation UX only: every server function checks the real session itself,
// so a stale answer here can never expose data. On the server it always
// asks (one request, one user).
import { getSessionFn } from "@/server/auth/auth.functions"

const TTL_MS = 60_000
/** Set once this browser has been signed in; cleared on sign-out. */
const ACCOUNT_HINT = "alikeni:account"

type Session = ReturnType<typeof getSessionFn>
let cached: { at: number; value: Session } | undefined

function setHint(on: boolean) {
  try {
    if (on) window.localStorage.setItem(ACCOUNT_HINT, "1")
    else window.localStorage.removeItem(ACCOUNT_HINT)
  } catch {
    // Storage blocked (private mode): the hint is only an optimisation.
  }
}

export function navigationSession(): Session {
  if (typeof window === "undefined") return getSessionFn()
  const now = Date.now()
  if (cached && now - cached.at <= TTL_MS) return cached.value
  const value = getSessionFn()
  cached = { at: now, value }
  value.then(
    ({ user }) => {
      if (user) setHint(true)
      // "Signed out" is never remembered: signing in must work at once.
      else if (cached?.value === value) cached = undefined
    },
    () => {
      if (cached?.value === value) cached = undefined
    }
  )
  return value
}

/**
 * Mark this browser as an account holder's. Signed-in pages call it on
 * mount: a page loaded directly is checked on the server, where the hint
 * cannot be written.
 */
export function rememberAccount() {
  if (typeof window !== "undefined") setHint(true)
}

/** Call after signing in, up or out, so the next navigation asks again. */
export function forgetNavigationSession(options: { signedOut?: boolean } = {}) {
  cached = undefined
  if (options.signedOut && typeof window !== "undefined") setHint(false)
}

/**
 * Whether this browser has ever been signed in. Marketing pages use it to
 * decide if asking for the session is worth a request: for a first-time
 * visitor (and every crawler) it is not. False on the server.
 */
export function hasAccountHint(): boolean {
  if (typeof window === "undefined") return false
  try {
    return window.localStorage.getItem(ACCOUNT_HINT) === "1"
  } catch {
    return false
  }
}
