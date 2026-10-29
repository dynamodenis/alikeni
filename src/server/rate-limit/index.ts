// Rate limiting behind a swappable interface. `getRateLimiter()` is the only
// entry point callers use, so Phase 8 can return a Durable Object / KV backed
// limiter (shared across instances) without touching them.
import { MemoryRateLimiter } from "./memory"
import type { RateLimiter } from "./types"

export type { RateLimiter, RateResult, RateRule } from "./types"
export { MemoryRateLimiter } from "./memory"

/** 5 per minute and 30 per day: guest RSVPs and wishes per invitation per IP. */
export const GUEST_POST_RULES = [
  { limit: 5, windowSec: 60 },
  { limit: 30, windowSec: 86_400 },
] as const

type Cache = { limiter?: RateLimiter }
// Survive Vite HMR in dev so reloads keep counting.
const cache = ((
  globalThis as { __festlyRateLimit?: Cache }
).__festlyRateLimit ??= {})

export function getRateLimiter(): RateLimiter {
  return (cache.limiter ??= new MemoryRateLimiter())
}
