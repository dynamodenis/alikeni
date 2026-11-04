import type { RateLimiter, RateResult, RateRule } from "./types"
import { decide, maxWindowMs } from "./window"

type Entry = {
  /** Hit timestamps (ms), oldest first. */
  hits: Array<number>
  /** Longest window this key was checked against, for pruning. */
  maxWindowMs: number
}

export type MemoryRateLimiterOptions = {
  /** Clock, injectable for tests. */
  now?: () => number
  /** Sweep idle keys after this many hits (default 500). */
  sweepEvery?: number
  /** Hard cap on tracked keys; the oldest keys are dropped beyond it. */
  maxKeys?: number
}

/**
 * Sliding-window log: each key keeps the timestamps of its accepted hits
 * within its longest window. Exact (no fixed-window burst at the boundary)
 * and cheap at our limits (≤ 30 timestamps per key). Memory is bounded by
 * pruning old timestamps on every hit, sweeping idle keys periodically and
 * a key cap. State is per process: unit tests, and the fallback when no database
 * is configured. Deployments use `PostgresRateLimiter` (shared).
 */
export class MemoryRateLimiter implements RateLimiter {
  private readonly entries = new Map<string, Entry>()
  private readonly now: () => number
  private readonly sweepEvery: number
  private readonly maxKeys: number
  private hitsSinceSweep = 0

  constructor(options: MemoryRateLimiterOptions = {}) {
    this.now = options.now ?? Date.now
    this.sweepEvery = options.sweepEvery ?? 500
    this.maxKeys = options.maxKeys ?? 50_000
  }

  hit(key: string, rules: ReadonlyArray<RateRule>): Promise<RateResult> {
    return Promise.resolve(this.hitSync(key, rules))
  }

  /** Number of tracked keys (tests and diagnostics). */
  get size(): number {
    return this.entries.size
  }

  private hitSync(key: string, rules: ReadonlyArray<RateRule>): RateResult {
    const now = this.now()
    if (++this.hitsSinceSweep >= this.sweepEvery) this.sweep(now)

    const windowMs = maxWindowMs(rules)
    const entry = this.entries.get(key) ?? { hits: [], maxWindowMs: windowMs }
    entry.maxWindowMs = Math.max(entry.maxWindowMs, windowMs)
    entry.hits = entry.hits.filter((t) => t > now - entry.maxWindowMs)

    const result = decide(entry.hits, rules, now)
    if (!result.ok) {
      this.store(key, entry)
      return result
    }
    entry.hits.push(now)
    this.store(key, entry)
    return { ok: true, retryAfterSec: 0 }
  }

  private store(key: string, entry: Entry) {
    if (entry.hits.length === 0) {
      this.entries.delete(key)
      return
    }
    // Re-insert so Map order approximates least-recently-used.
    this.entries.delete(key)
    this.entries.set(key, entry)
    while (this.entries.size > this.maxKeys) {
      const oldest = this.entries.keys().next().value
      if (oldest === undefined) break
      this.entries.delete(oldest)
    }
  }

  /** Drop keys whose newest hit has left their longest window. */
  private sweep(now: number) {
    this.hitsSinceSweep = 0
    for (const [key, entry] of this.entries) {
      const newest = entry.hits.at(-1) ?? 0
      if (newest <= now - entry.maxWindowMs) this.entries.delete(key)
    }
  }
}
