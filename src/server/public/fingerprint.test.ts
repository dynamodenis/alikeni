// @vitest-environment node
import { describe, expect, it } from "vitest"
import {
  analyticsSalt,
  clientIp,
  fingerprint,
  isBot,
} from "./fingerprint.server"
import { cleanText, sanitizeGuestName } from "./sanitize"
import { humanCheck, verifyTurnstile } from "./turnstile.server"

const dev = { NODE_ENV: "development" as const }

describe("clientIp", () => {
  it("prefers cf-connecting-ip, then x-forwarded-for, then x-real-ip", () => {
    expect(
      clientIp(
        new Headers({
          "cf-connecting-ip": "1.1.1.1",
          "x-forwarded-for": "2.2.2.2",
        })
      )
    ).toBe("1.1.1.1")
    expect(
      clientIp(new Headers({ "x-forwarded-for": " 2.2.2.2, 10.0.0.1" }))
    ).toBe("2.2.2.2")
    expect(clientIp(new Headers({ "x-real-ip": "3.3.3.3" }))).toBe("3.3.3.3")
    expect(clientIp(new Headers())).toBe("unknown")
  })
})

describe("analyticsSalt", () => {
  it("falls back from ANALYTICS_SALT to BETTER_AUTH_SECRET to a dev value", () => {
    expect(analyticsSalt({ ...dev, ANALYTICS_SALT: "a".repeat(16) })).toBe(
      "a".repeat(16)
    )
    expect(analyticsSalt({ ...dev, BETTER_AUTH_SECRET: "b".repeat(32) })).toBe(
      "b".repeat(32)
    )
    expect(analyticsSalt(dev)).toMatch(/dev/)
  })

  it("throws in production without either", () => {
    expect(() => analyticsSalt({ NODE_ENV: "production" })).toThrow(
      /ANALYTICS_SALT/
    )
  })
})

describe("fingerprint", () => {
  it("hashes salted IP and UA, never returning raw values", async () => {
    const headers = new Headers({
      "cf-connecting-ip": "203.0.113.9",
      "user-agent": "Mozilla/5.0 (iPhone)",
    })
    const a = await fingerprint(headers, {
      ...dev,
      ANALYTICS_SALT: "s".repeat(16),
    })
    const b = await fingerprint(headers, {
      ...dev,
      ANALYTICS_SALT: "t".repeat(16),
    })
    expect(a.ipHash).toMatch(/^[0-9a-f]{64}$/)
    expect(a.uaHash).toMatch(/^[0-9a-f]{64}$/)
    expect(a.ipHash).not.toBe(b.ipHash)
    expect(JSON.stringify(a)).not.toContain("203.0.113.9")
    expect(a.bot).toBe(false)
  })
})

describe("isBot", () => {
  it.each([
    "WhatsApp/2.23.20.0",
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Twitterbot/1.0",
    "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)",
    "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 HeadlessChrome/120.0",
    "TelegramBot (like TwitterBot)",
    "",
  ])("flags %s", (ua) => {
    expect(isBot(ua)).toBe(true)
  })

  it.each([
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Mobile Safari/537.36",
  ])("lets people through: %s", (ua) => {
    expect(isBot(ua)).toBe(false)
  })
})

describe("sanitize", () => {
  it("collapses whitespace and strips controls", () => {
    expect(cleanText("  a \n\t b\u0000c\u202E ")).toBe("a bc")
  })

  it("sanitizes guest names from the URL", () => {
    expect(sanitizeGuestName("  <img src=x>  Bob ")).toBe("img src=x Bob")
    expect(sanitizeGuestName("x".repeat(100))).toHaveLength(60)
    expect(sanitizeGuestName("  ")).toBeUndefined()
    expect(sanitizeGuestName(undefined)).toBeUndefined()
  })
})

describe("turnstile", () => {
  const reply = (body: unknown, ok = true) =>
    Promise.resolve(
      new Response(JSON.stringify(body), { status: ok ? 200 : 500 })
    )

  it("is skipped without a secret", async () => {
    await expect(humanCheck(undefined)(undefined)).resolves.toBe(true)
  })

  it("posts the token and secret to siteverify", async () => {
    let sent: FormData | undefined
    const fetchMock = (async (
      url: string | URL | Request,
      init?: RequestInit
    ) => {
      expect(String(url)).toBe(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify"
      )
      sent = init?.body as FormData
      return reply({ success: true })
    }) as typeof fetch
    await expect(verifyTurnstile("tok", "sec", fetchMock)).resolves.toBe(true)
    expect(sent?.get("response")).toBe("tok")
    expect(sent?.get("secret")).toBe("sec")
  })

  it("fails closed on a missing token, failure or HTTP error", async () => {
    const never = (() => reply({ success: true })) as typeof fetch
    await expect(verifyTurnstile(undefined, "sec", never)).resolves.toBe(false)
    const no = (() => reply({ success: false })) as typeof fetch
    await expect(verifyTurnstile("t", "sec", no)).resolves.toBe(false)
    const broken = (() => reply({}, false)) as typeof fetch
    await expect(verifyTurnstile("t", "sec", broken)).resolves.toBe(false)
  })
})
