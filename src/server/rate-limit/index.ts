// Rate limiting behind a swappable interface. Callers get a limiter from
// `getRateLimiter()` (limiter.server.ts): the shared Postgres limiter when a
// database is configured, otherwise an in-memory one.
export type {
  RateBlock,
  RateCheck,
  RateLimiter,
  RateResult,
  RateRule,
} from "./types"
export { MemoryRateLimiter } from "./memory"
export { PostgresRateLimiter } from "./postgres"

/**
 * One guest's budget per invitation, for RSVPs and wishes separately: 5 per
 * minute and 30 per rolling 24 hours. Counted per device id, or per IP for
 * clients that send none.
 */
export const GUEST_POST_RULES = [
  { limit: 5, windowSec: 60 },
  { limit: 30, windowSec: 86_400 },
] as const

/**
 * Ceiling for everyone behind one IP address per invitation (venue wifi,
 * carrier-grade NAT): 30 per minute and 300 per rolling 24 hours. Stops a
 * script that invents a new device id for every post.
 */
export const GUEST_NETWORK_RULES = [
  { limit: 30, windowSec: 60 },
  { limit: 300, windowSec: 86_400 },
] as const
