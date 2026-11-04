import { and, asc, eq, gt, lte, sql } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import * as schema from "@/server/db/schema"
import type { RateLimiter, RateResult, RateRule } from "./types"
import { decide, maxWindowMs } from "./window"

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
 * last slot. Refused hits are not stored. Rows older than the key's longest
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

  async hit(key: string, rules: ReadonlyArray<RateRule>): Promise<RateResult> {
    const now = this.now()
    const windowMs = maxWindowMs(rules)
    const since = new Date(now - windowMs)
    const db = this.db()
    const result = await db.transaction(async (tx) => {
      await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${key}))`)
      await tx.delete(hits).where(and(eq(hits.key, key), lte(hits.at, since)))
      const rows = await tx
        .select({ at: hits.at })
        .from(hits)
        .where(and(eq(hits.key, key), gt(hits.at, since)))
        .orderBy(asc(hits.at))
      const verdict = decide(
        rows.map((row) => row.at.getTime()),
        rules,
        now
      )
      if (verdict.ok) {
        await tx.insert(hits).values({ key, at: new Date(now) })
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
