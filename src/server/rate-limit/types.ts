/** One window: at most `limit` hits per `windowSec` seconds. */
export type RateRule = { limit: number; windowSec: number }

export type RateResult = {
  ok: boolean
  /** Seconds until the tightest violated window frees a slot (0 when ok). */
  retryAfterSec: number
}

/**
 * Counts hits per key against every rule. A hit that is refused is not
 * counted, so a blocked client regains access as soon as its window frees up.
 * Implementations: in-memory (single instance, dev and Node). Phase 8 can add
 * a Durable Object / KV version behind the same interface.
 */
export interface RateLimiter {
  hit: (key: string, rules: ReadonlyArray<RateRule>) => Promise<RateResult>
}
