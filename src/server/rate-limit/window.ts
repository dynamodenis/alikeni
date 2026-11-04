import type { RateResult, RateRule } from "./types"

/** Longest window among the rules, in ms. */
export const maxWindowMs = (rules: ReadonlyArray<RateRule>): number =>
  Math.max(0, ...rules.map((r) => r.windowSec * 1000))

/**
 * Sliding-window decision shared by every limiter: `hits` are the accepted
 * hit timestamps (ms, oldest first) within the longest window. Refused when
 * any rule is full; `retryAfterSec` is when its oldest counting hit expires.
 */
export function decide(
  hits: ReadonlyArray<number>,
  rules: ReadonlyArray<RateRule>,
  now: number
): RateResult {
  let retryAfterMs = 0
  for (const rule of rules) {
    const windowMs = rule.windowSec * 1000
    const inWindow = hits.filter((t) => t > now - windowMs)
    if (inWindow.length >= rule.limit) {
      // The slot frees when the oldest hit that still counts expires.
      const oldest = inWindow[inWindow.length - rule.limit] ?? now
      retryAfterMs = Math.max(retryAfterMs, oldest + windowMs - now)
    }
  }
  if (retryAfterMs > 0 || rules.some((r) => r.limit <= 0)) {
    return {
      ok: false,
      retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    }
  }
  return { ok: true, retryAfterSec: 0 }
}
