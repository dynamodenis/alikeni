// @vitest-environment node
// PostgresRateLimiter against real migrations on in-memory Postgres (PGlite).
import { PGlite } from "@electric-sql/pglite"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import * as schema from "@/server/db/schema"
import { GUEST_POST_RULES, PostgresRateLimiter } from "./index"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
}, 30_000)

beforeEach(async () => {
  await db.delete(schema.rateLimitHits)
})

afterAll(async () => {
  await client.close()
})

function clock(start = Date.UTC(2027, 0, 1)) {
  let t = start
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms
    },
  }
}

const limiterWith = (now: () => number, random = () => 0.5) =>
  new PostgresRateLimiter(() => db, { now, random })

describe("PostgresRateLimiter", () => {
  it("allows only 5 of 20 rapid hits", async () => {
    const c = clock()
    const limiter = limiterWith(c.now)
    const results = []
    for (let i = 0; i < 20; i++) {
      results.push(await limiter.hit("rsvp:inv:ip", GUEST_POST_RULES))
      c.advance(50)
    }
    expect(results.filter((r) => r.ok)).toHaveLength(5)
    expect(results.slice(0, 5).every((r) => r.ok)).toBe(true)
    const blocked = results.at(5)
    expect(blocked?.ok).toBe(false)
    expect(blocked?.retryAfterSec).toBeGreaterThan(0)
    expect(blocked?.retryAfterSec).toBeLessThanOrEqual(60)
    // Refused hits are not stored.
    expect(await db.select().from(schema.rateLimitHits)).toHaveLength(5)
  })

  it("counts concurrent hits exactly once each", async () => {
    const c = clock()
    const limiter = limiterWith(c.now)
    const results = await Promise.all(
      Array.from({ length: 12 }, () => limiter.hit("k", GUEST_POST_RULES))
    )
    expect(results.filter((r) => r.ok)).toHaveLength(5)
  })

  it("frees slots as the minute window slides", async () => {
    const c = clock()
    const limiter = limiterWith(c.now)
    for (let i = 0; i < 5; i++) await limiter.hit("k", GUEST_POST_RULES)
    expect((await limiter.hit("k", GUEST_POST_RULES)).ok).toBe(false)
    c.advance(60_001)
    expect((await limiter.hit("k", GUEST_POST_RULES)).ok).toBe(true)
  })

  it("enforces the daily cap across minutes", async () => {
    const c = clock()
    const limiter = limiterWith(c.now)
    let allowed = 0
    for (let minute = 0; minute < 10; minute++) {
      for (let i = 0; i < 5; i++) {
        if ((await limiter.hit("k", GUEST_POST_RULES)).ok) allowed++
      }
      c.advance(61_000)
    }
    expect(allowed).toBe(30)
    const blocked = await limiter.hit("k", GUEST_POST_RULES)
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfterSec).toBeGreaterThan(3600)
  })

  it("keeps keys independent and shares counts between instances", async () => {
    const c = clock()
    const a = limiterWith(c.now)
    const b = limiterWith(c.now)
    for (let i = 0; i < 5; i++) await a.hit("a", GUEST_POST_RULES)
    expect((await b.hit("a", GUEST_POST_RULES)).ok).toBe(false)
    expect((await b.hit("b", GUEST_POST_RULES)).ok).toBe(true)
  })

  it("prunes expired rows for the key and, now and then, the whole table", async () => {
    const c = clock()
    const limiter = limiterWith(c.now)
    await limiter.hit("old", [{ limit: 1, windowSec: 1 }])
    await limiter.hit("idle", GUEST_POST_RULES)
    c.advance(2000)
    await limiter.hit("old", [{ limit: 1, windowSec: 1 }])
    const keys = (await db.select().from(schema.rateLimitHits)).map(
      (r) => r.key
    )
    expect(keys.sort()).toEqual(["idle", "old"])

    c.advance(3 * 86_400_000)
    const pruning = limiterWith(c.now, () => 0)
    await pruning.hit("fresh", GUEST_POST_RULES)
    const left = (await db.select().from(schema.rateLimitHits)).map(
      (r) => r.key
    )
    expect(left).toEqual(["fresh"])
  })
})
