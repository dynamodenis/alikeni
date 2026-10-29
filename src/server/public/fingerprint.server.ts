// Who is this guest, without knowing who they are: salted SHA-256 hashes of
// the client IP and user agent. Raw values are only read from the request
// headers here and are never stored or logged.
import { serverEnv, type ServerEnv } from "@/env.server"

export type Fingerprint = { ipHash: string; uaHash: string; bot: boolean }

type SaltEnv = Pick<
  ServerEnv,
  "NODE_ENV" | "ANALYTICS_SALT" | "BETTER_AUTH_SECRET"
>

const DEV_SALT = "festly-dev-analytics-salt-not-secret"

/**
 * ANALYTICS_SALT, else BETTER_AUTH_SECRET, else a fixed development value.
 * Production without either throws (env.server also refuses to start).
 */
export function analyticsSalt(env: SaltEnv = serverEnv): string {
  const salt = env.ANALYTICS_SALT ?? env.BETTER_AUTH_SECRET
  if (salt) return salt
  if (env.NODE_ENV === "production") {
    throw new Error(
      "ANALYTICS_SALT (or BETTER_AUTH_SECRET) is required in production"
    )
  }
  return DEV_SALT
}

/**
 * Client IP: Cloudflare's header first, then the first X-Forwarded-For hop,
 * then X-Real-IP. "unknown" when none is present (all such clients then
 * share one rate-limit bucket, which errs on the side of limiting).
 */
export function clientIp(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip")?.trim()
  if (cf) return cf
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim()
  if (forwarded) return forwarded
  const real = headers.get("x-real-ip")?.trim()
  if (real) return real
  return "unknown"
}

const BOT_UA =
  /\bbot\b|[a-z]bot[/-]|crawl|spider|slurp|preview|facebookexternalhit|facebookcatalog|whatsapp|telegrambot|twitterbot|slackbot|discordbot|linkedinbot|googlebot|google-inspectiontool|bingbot|yandex|baiduspider|duckduckbot|applebot|embedly|skypeuripreview|headless|phantomjs|puppeteer|playwright|lighthouse|curl\/|wget\/|python-requests|httpclient|go-http-client|node-fetch|axios\//i

/** Link-preview crawlers, search bots and headless browsers. Empty UA counts as a bot. */
export function isBot(userAgent: string | null | undefined): boolean {
  if (!userAgent?.trim()) return true
  return BOT_UA.test(userAgent)
}

/** Lowercase hex SHA-256 via Web Crypto (Node 20+, Workers, browsers). */
export async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(input)
  )
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0")
  ).join("")
}

export async function fingerprint(
  headers: Headers,
  env: SaltEnv = serverEnv
): Promise<Fingerprint> {
  const salt = analyticsSalt(env)
  const userAgent = headers.get("user-agent") ?? ""
  const [ipHash, uaHash] = await Promise.all([
    sha256Hex(`${salt}:ip:${clientIp(headers)}`),
    sha256Hex(`${salt}:ua:${userAgent}`),
  ])
  return { ipHash, uaHash, bot: isBot(userAgent) }
}
