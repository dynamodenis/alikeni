import { describe, expect, it } from "vitest"
import { canonicalRedirect } from "./canonical"

const ORIGIN = "https://alikeni.com"

describe("canonicalRedirect", () => {
  it("sends www to the app origin, keeping path and query", () => {
    expect(
      canonicalRedirect("https://www.alikeni.com/i/amara?to=Wanjiru", ORIGIN)
    ).toBe("https://alikeni.com/i/amara?to=Wanjiru")
    expect(canonicalRedirect("http://www.alikeni.com/", ORIGIN)).toBe(
      "https://alikeni.com/"
    )
  })

  it("leaves the app origin and other hosts alone", () => {
    expect(
      canonicalRedirect("https://alikeni.com/templates", ORIGIN)
    ).toBeNull()
    expect(
      canonicalRedirect("https://alikeni.example.workers.dev/i/amara", ORIGIN)
    ).toBeNull()
    expect(canonicalRedirect("http://localhost:8787/", ORIGIN)).toBeNull()
  })

  it("ignores a malformed origin", () => {
    expect(canonicalRedirect("https://www.alikeni.com/", "")).toBeNull()
  })
})
