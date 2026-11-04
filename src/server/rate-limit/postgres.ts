import { and, asc, eq, inArray, lte, or, sql } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import * as schema from "@/server/db/schema"
import type { RateCheck, RateLimiter, RateResult, RateRule } from "./types"
import { decideAll, maxWindowMs } from "./window"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>

export type PostgresRateLimiterOptions = {
  /** Clock, injectable for tests. */
  now?: () => number
  /** Run the table-wide prune on about 1 in `pruneEvery` hits (default 100). */
  pruneEvery?: number
  /** Table-wide prune drops rows older than this (default 2 days). */
  retainSec?: number
  random?: () => number
}

const { rateLimitHits: hits } = schema

/**
 * The sliding-window log of `MemoryRateLimiter`, stored in Postgres
 * (`rate_limit_hits`) so every server instance, Worker isolate and region
 * shares one count, with no Durable Object or KV. Each hit runs in a short
 * transaction holding a per-key advisory lock (`pg_advisory_xact_lock`), so
 * concurrent hits on the same key are serialised and cannot both take the
 * last slot. `hitAll` locks its keys in sorted order (no deadlock between
 * two calls sharing keys) and records on every key or none. Refused hits are
 * not stored. Rows older than the key's longest
 * window are deleted on every hit; the whole table is pruned now and then.
 *
 * `db` is a getter because on Workers the client belongs to the request.
 */
export class PostgresRateLimiter implements RateLimiter {
  private readonly now: () => number
  private readonly pruneEvery: number
  private readonly retainMs: number
  private readonly random: () => number

  constructor(
    private readonly db: () => AnyDb,
    options: PostgresRateLimiterOptions = {}
  ) {
    this.now = options.now ?? Date.now
    this.pruneEvery = options.pruneEvery ?? 100
    this.retainMs = (options.retainSec ?? 2 * 86_400) * 1000
    this.random = options.random ?? Math.random
  }

  hit(key: string, rules: ReadonlyArray<RateRule>): Promise<RateResult> {
    return this.hitAll([{ key, rules }])
  }

  async hitAll(checks: ReadonlyArray<RateCheck>): Promise<RateResult> {
    // Nothing to check (and an empty `or()` would delete the whole table).
    if (checks.length === 0) return { ok: true, retryAfterSec: 0 }
    const now = this.now()
    const keys = [...new Set(checks.map((check) => check.key))].sort()
    const sinceFor = (check: RateCheck) =>
      new Date(now - maxWindowMs(check.rules))
    const db = this.db()
    const result = await db.transaction(async (tx) => {
      for (const key of keys) {
        await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${key}))`)
      }
      // Rows that left their key's longest window no longer count anywhere.
      await tx
        .delete(hits)
        .where(
          or(
            ...checks.map((check) =>
              and(eq(hits.key, check.key), lte(hits.at, sinceFor(check)))
            )
          )
        )
      const rows = await tx
        .select({ key: hits.key, at: hits.at })
        .from(hits)
        .where(inArray(hits.key, keys))
        .orderBy(asc(hits.at))
      const verdict = decideAll(
        checks.map((check) => {
          const since = sinceFor(check).getTime()
          return rows
            .filter((row) => row.key === check.key)
            .map((row) => row.at.getTime())
            .filter((at) => at > since)
        }),
        checks,
        now
      )
      if (verdict.ok) {
        await tx
          .insert(hits)
          .values(keys.map((key) => ({ key, at: new Date(now) })))
      }
      return verdict
    })
    if (this.random() * this.pruneEvery < 1) await this.prune(db, now)
    return result
  }

  /** Drop every row older than the retention horizon (idle keys). */
  async prune(db: AnyDb = this.db(), now = this.now()): Promise<void> {
    try {
      await db.delete(hits).where(lte(hits.at, new Date(now - this.retainMs)))
    } catch (error) {
      // Housekeeping only; the next hit tries again.
      console.error("[rate-limit] prune failed", error)
    }
  }
}
