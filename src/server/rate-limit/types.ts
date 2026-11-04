/** One window: at most `limit` hits per `windowSec` seconds. */
export type RateRule = { limit: number; windowSec: number }

/** One key checked against its rules (see `RateLimiter.hitAll`). */
export type RateCheck = { key: string; rules: ReadonlyArray<RateRule> }

/** Why a hit was refused: the window that sets the wait and how full it is. */
export type RateBlock = {
  /** Index of the refused check in the `hitAll` list (0 for `hit`). */
  check: number
  rule: RateRule
  /** Accepted hits already counted in that window (≥ `rule.limit`). */
  used: number
}

export type RateResult = {
  ok: boolean
  /** Seconds until the tightest violated window frees a slot (0 when ok). */
  retryAfterSec: number
  /** Set when refused: the check and window with the longest wait. */
  blocked?: RateBlock
}

/**
 * Counts hits per key against every rule. A hit that is refused is not
 * counted, so a blocked client regains access as soon as its window frees up.
 * Implementations: `PostgresRateLimiter` (shared, used whenever a database
 * exists) and `MemoryRateLimiter` (per process: tests, database-less dev).
 */
export interface RateLimiter {
  hit: (key: string, rules: ReadonlyArray<RateRule>) => Promise<RateResult>
  /**
   * All or nothing across several keys: accepted only when every check has
   * room, and then one hit is recorded on each key. When refused, nothing is
   * recorded and `blocked` names the check whose window frees up last.
   */
  hitAll: (checks: ReadonlyArray<RateCheck>) => Promise<RateResult>
}
