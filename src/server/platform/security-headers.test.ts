import { describe, expect, it } from "vitest"
import {
  BASE_SECURITY_HEADERS,
  applySecurityHeaders,
  contentSecurityPolicy,
} from "./security-headers"

const directives = (csp: string) =>
  Object.fromEntries(
    csp.split("; ").map((d) => {
      const [name, ...values] = d.split(" ")
      return [name, values]
    })
  )

describe("contentSecurityPolicy", () => {
  const csp = directives(contentSecurityPolicy())

  it("locks the defaults down", () => {
    expect(csp["default-src"]).toEqual(["'self'"])
    expect(csp["object-src"]).toEqual(["'none'"])
    expect(csp["base-uri"]).toEqual(["'self'"])
    expect(csp["frame-ancestors"]).toEqual(["'self'"])
    expect(csp["script-src"]).not.toContain("'unsafe-eval'")
  })

  it("allows the third parties the invitation uses", () => {
    expect(csp["frame-src"]).toEqual(
      expect.arrayContaining([
        "'self'",
        "https://www.google.com",
        "https://maps.google.com",
        "https://w.soundcloud.com",
        "https://challenges.cloudflare.com",
      ])
    )
    expect(csp["script-src"]).toContain("https://challenges.cloudflare.com")
    expect(csp["style-src"]).toContain("'unsafe-inline'")
    expect(csp["img-src"]).toEqual(["'self'", "data:", "blob:", "https:"])
    expect(csp["font-src"]).toEqual(expect.arrayContaining(["'self'", "data:"]))
  })

  it("adds the dev websocket and extra connect origins only when asked", () => {
    expect(csp["connect-src"]).not.toContain("ws:")
    const dev = directives(
      contentSecurityPolicy({
        dev: true,
        connect: ["https://media.example.com"],
      })
    )
    expect(dev["connect-src"]).toEqual(
      expect.arrayContaining(["ws:", "https://media.example.com"])
    )
  })
})

describe("applySecurityHeaders", () => {
  it("sets the base headers everywhere and CSP on HTML only", () => {
    const html = new Headers({ "Content-Type": "text/html; charset=utf-8" })
    expect(applySecurityHeaders(html)).toBe(true)
    for (const [name, value] of Object.entries(BASE_SECURITY_HEADERS)) {
      expect(html.get(name)).toBe(value)
    }
    expect(html.get("Content-Security-Policy")).toContain("default-src 'self'")

    const json = new Headers({ "Content-Type": "application/json" })
    applySecurityHeaders(json)
    expect(json.get("X-Content-Type-Options")).toBe("nosniff")
    expect(json.has("Content-Security-Policy")).toBe(false)
  })

  it("keeps headers a route already set", () => {
    const headers = new Headers({
      "Content-Type": "text/html",
      "Referrer-Policy": "no-referrer",
    })
    applySecurityHeaders(headers)
    expect(headers.get("Referrer-Policy")).toBe("no-referrer")
  })

  it("leaves immutable headers alone (redirects)", () => {
    const redirect = Response.redirect("https://example.com/", 302)
    expect(applySecurityHeaders(redirect.headers)).toBe(false)
  })
})
