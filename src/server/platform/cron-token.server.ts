// Proof that a request to /api/cron/* was made by this Worker's own scheduled
// handler (src/worker.ts), not by someone on the internet. The handler issues
// a random single-use token just before it calls the route inside the same
// isolate, and the route takes it back. Nothing to configure, nothing to leak.

let current: string | undefined

/** A fresh token; replaces any earlier one. */
export function issueCronToken(): string {
  current = crypto.randomUUID()
  return current
}

/** True once for the token issued last; the token is spent either way. */
export function takeCronToken(value: string | null | undefined): boolean {
  const expected = current
  current = undefined
  return !!expected && !!value && value === expected
}
