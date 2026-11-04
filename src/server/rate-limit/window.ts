import type { RateCheck, RateResult, RateRule } from "./types"

/** Longest window among the rules, in ms. */
export const maxWindowMs = (rules: ReadonlyArray<RateRule>): number =>
  Math.max(0, ...rules.map((r) => r.windowSec * 1000))

const OK: RateResult = { ok: true, retryAfterSec: 0 }

/**
 * Sliding-window decision shared by every limiter: `hits` are the accepted
 * hit timestamps (ms, oldest first) within the longest window. Refused when
 * any rule is full; `retryAfterSec` is when its oldest counting hit expires,
 * and `blocked` names the rule with the longest wait.
 */
export function decide(
  hits: ReadonlyArray<number>,
  rules: ReadonlyArray<RateRule>,
  now: number
): RateResult {
  let retryAfterMs = 0
  let blocked: RateResult["blocked"]
  for (const rule of rules) {
    const windowMs = rule.windowSec * 1000
    const inWindow = hits.filter((t) => t > now - windowMs)
    if (rule.limit <= 0) {
      blocked ??= { check: 0, rule, used: inWindow.length }
      continue
    }
    if (inWindow.length >= rule.limit) {
      // The slot frees when the oldest hit that still counts expires.
      const oldest = inWindow[inWindow.length - rule.limit] ?? now
      const waitMs = oldest + windowMs - now
      if (!blocked || waitMs > retryAfterMs) {
        blocked = { check: 0, rule, used: inWindow.length }
      }
      retryAfterMs = Math.max(retryAfterMs, waitMs)
    }
  }
  if (!blocked) return OK
  return {
    ok: false,
    retryAfterSec: Math.max(1, Math.ceil(retryAfterMs / 1000)),
    blocked,
  }
}

/**
 * `decide` for several keys at once (`hitsPerCheck[i]` belongs to
 * `checks[i]`): refused when any check is, reporting the longest wait,
 * because that is when every check has room again.
 */
export function decideAll(
  hitsPerCheck: ReadonlyArray<ReadonlyArray<number>>,
  checks: ReadonlyArray<RateCheck>,
  now: number
): RateResult {
  let worst: RateResult = OK
  checks.forEach((check, index) => {
    const result = decide(hitsPerCheck[index] ?? [], check.rules, now)
    if (result.ok || !result.blocked) return
    if (worst.ok || result.retryAfterSec > worst.retryAfterSec) {
      worst = { ...result, blocked: { ...result.blocked, check: index } }
    }
  })
  return worst
}
