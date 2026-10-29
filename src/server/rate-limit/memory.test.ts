import { describe, expect, it } from "vitest"
import { GUEST_POST_RULES, MemoryRateLimiter } from "./index"

function clock(start = 1_000_000) {
  let t = start
  return {
    now: () => t,
    advance: (ms: number) => {
      t += ms
    },
  }
}

describe("MemoryRateLimiter", () => {
  it("allows only 5 of 20 rapid hits", async () => {
    const c = clock()
    const limiter = new MemoryRateLimiter({ now: c.now })
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
  })

  it("frees slots as the minute window slides", async () => {
    const c = clock()
    const limiter = new MemoryRateLimiter({ now: c.now })
    for (let i = 0; i < 5; i++) await limiter.hit("k", GUEST_POST_RULES)
    expect((await limiter.hit("k", GUEST_POST_RULES)).ok).toBe(false)
    c.advance(60_001)
    expect((await limiter.hit("k", GUEST_POST_RULES)).ok).toBe(true)
  })

  it("enforces the daily cap across minutes", async () => {
    const c = clock()
    const limiter = new MemoryRateLimiter({ now: c.now })
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

  it("keeps keys independent", async () => {
    const limiter = new MemoryRateLimiter()
    for (let i = 0; i < 5; i++) await limiter.hit("a", GUEST_POST_RULES)
    expect((await limiter.hit("a", GUEST_POST_RULES)).ok).toBe(false)
    expect((await limiter.hit("b", GUEST_POST_RULES)).ok).toBe(true)
  })

  it("prunes idle keys and caps the key count", async () => {
    const c = clock()
    const limiter = new MemoryRateLimiter({
      now: c.now,
      sweepEvery: 1,
      maxKeys: 3,
    })
    for (const key of ["a", "b", "c", "d"]) {
      await limiter.hit(key, [{ limit: 1, windowSec: 1 }])
    }
    expect(limiter.size).toBe(3)
    c.advance(2000)
    await limiter.hit("e", [{ limit: 1, windowSec: 1 }])
    expect(limiter.size).toBe(1)
  })
})
