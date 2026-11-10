// The limiter server code uses. Postgres-backed whenever a database exists
// (DATABASE_URL on Node, Hyperdrive on Workers), so limits hold across
// instances and isolates; in-memory only without a database (some dev setups).
import { getDb, hasDatabase } from "@/server/db/client.server"
import { MemoryRateLimiter } from "./memory"
import { PostgresRateLimiter } from "./postgres"
import type { RateLimiter } from "./types"

type Cache = { db?: RateLimiter; memory?: RateLimiter }
// Survive Vite HMR in dev so reloads keep counting.
const cache = ((
  globalThis as { __alikeniRateLimit?: Cache }
).__alikeniRateLimit ??= {})

export function getRateLimiter(): RateLimiter {
  if (hasDatabase()) return (cache.db ??= new PostgresRateLimiter(getDb))
  return (cache.memory ??= new MemoryRateLimiter())
}
