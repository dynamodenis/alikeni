import { describe, expect, it } from "vitest"
import { edgeCacheKey, isEdgeCacheable } from "./edge-cache"

const get = (url: string, init?: RequestInit) => new Request(url, init)
const PAGE = "public, max-age=0, s-maxage=60, stale-while-revalidate=600"

describe("edgeCacheKey", () => {
  it("covers the public invitation page, guest name included", () => {
    expect(edgeCacheKey(get("https://alikeni.com/i/amara-and-kofi"))).toBe(
      "https://alikeni.com/i/amara-and-kofi"
    )
    expect(
      edgeCacheKey(get("https://alikeni.com/i/amara-and-kofi?to=Zuri"))
    ).toBe("https://alikeni.com/i/amara-and-kofi?to=Zuri")
  })

  it("leaves everything else to the app", () => {
    for (const path of [
      "/",
      "/dashboard",
      "/editor/abc",
      "/i/amara-and-kofi/album",
      "/api/payments/paystack",
      "/_serverFn/abc",
      "/og/amara-and-kofi.png",
    ]) {
      expect(edgeCacheKey(get(`https://alikeni.com${path}`))).toBeNull()
    }
    expect(
      edgeCacheKey(
        get("https://alikeni.com/i/amara-and-kofi", { method: "POST" })
      )
    ).toBeNull()
  })
})

describe("isEdgeCacheable", () => {
  const response = (status: number, headers: Record<string, string>) =>
    new Response("x", { status, headers })

  it("stores only successful pages that say shared caches may keep them", () => {
    expect(isEdgeCacheable(response(200, { "cache-control": PAGE }))).toBe(true)
    expect(isEdgeCacheable(response(404, { "cache-control": PAGE }))).toBe(
      false
    )
    expect(isEdgeCacheable(response(200, {}))).toBe(false)
    expect(
      isEdgeCacheable(response(200, { "cache-control": "private, no-store" }))
    ).toBe(false)
    expect(
      isEdgeCacheable(
        response(200, { "cache-control": PAGE, "set-cookie": "a=b" })
      )
    ).toBe(false)
  })
})
