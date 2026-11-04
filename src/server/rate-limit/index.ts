// Rate limiting behind a swappable interface. Callers get a limiter from
// `getRateLimiter()` (limiter.server.ts): the shared Postgres limiter when a
// database is configured, otherwise an in-memory one.
export type { RateLimiter, RateResult, RateRule } from "./types"
export { MemoryRateLimiter } from "./memory"
export { PostgresRateLimiter } from "./postgres"

/** 5 per minute and 30 per day: guest RSVPs and wishes per invitation per IP. */
export const GUEST_POST_RULES = [
  { limit: 5, windowSec: 60 },
  { limit: 30, windowSec: 86_400 },
] as const
