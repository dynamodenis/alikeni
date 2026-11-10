// Security headers for every response (src/start.ts applies them).
//
// script-src needs 'unsafe-inline': TanStack Start streams the dehydrated
// router state and hydration bootstrap as inline <script> tags whose content
// differs per request, so hashes cannot work. The router can stamp a nonce
// (`ssr.nonce`), but Start 1.169 has no per-request hook to set it, and the
// public invitation HTML is cached at the edge for 60 s, which would reuse a
// nonce across visitors anyway. Everything else is locked down: no eval, no
// plugins, no foreign framing of Alikeni, and an explicit host list for the
// few third parties (maps, SoundCloud widget, Turnstile).
// style-src 'unsafe-inline': invitations set their palette as inline
// `--inv-*` custom properties, and motion/map libraries write style attributes.

export type CspOptions = {
  /** Vite dev server: allow its HMR websocket. */
  dev?: boolean
  /** Extra origins the browser fetches from (e.g. R2 public URL). */
  connect?: ReadonlyArray<string>
}

const TURNSTILE = "https://challenges.cloudflare.com"
const SOUNDCLOUD_WIDGET = "https://w.soundcloud.com"
const GOOGLE_MAPS_JS = [
  "https://maps.googleapis.com",
  "https://maps.gstatic.com",
]
const MAPBOX = ["https://api.mapbox.com", "https://events.mapbox.com"]
const RADAR = ["https://api.radar.io", "https://api-maps.radar.io"]

export function contentSecurityPolicy(options: CspOptions = {}): string {
  const directives: Record<string, ReadonlyArray<string>> = {
    "default-src": ["'self'"],
    "script-src": [
      "'self'",
      "'unsafe-inline'",
      TURNSTILE,
      SOUNDCLOUD_WIDGET,
      ...GOOGLE_MAPS_JS,
    ],
    "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    "img-src": ["'self'", "data:", "blob:", "https:"],
    "media-src": ["'self'", "blob:", "https:"],
    "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
    "connect-src": [
      "'self'",
      TURNSTILE,
      // Browser uploads with the `r2` driver go straight to R2.
      "https://*.r2.cloudflarestorage.com",
      ...GOOGLE_MAPS_JS,
      ...MAPBOX,
      ...RADAR,
      ...(options.connect ?? []),
      ...(options.dev ? ["ws:", "wss:"] : []),
    ],
    "frame-src": [
      "'self'",
      "https://www.google.com",
      "https://maps.google.com",
      SOUNDCLOUD_WIDGET,
      TURNSTILE,
    ],
    // Map libraries (mapbox-gl, maplibre) run their workers from blob: URLs.
    "worker-src": ["'self'", "blob:"],
    "child-src": ["'self'", "blob:"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    // The editor previews /preview in an iframe; nobody else may frame us.
    "frame-ancestors": ["'self'"],
  }
  return Object.entries(directives)
    .map(([name, values]) => `${name} ${[...new Set(values)].join(" ")}`)
    .join("; ")
}

/** Headers set on every response (HTML or not). */
export const BASE_SECURITY_HEADERS: Readonly<Record<string, string>> = {
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  // Legacy twin of frame-ancestors 'self' for old browsers.
  "X-Frame-Options": "SAMEORIGIN",
}

const isHtml = (headers: Headers) =>
  (headers.get("content-type") ?? "").toLowerCase().includes("text/html")

/**
 * Adds the security headers in place. CSP goes on HTML documents only (it
 * does nothing for JSON, images or files). Headers already set by a route
 * win. Returns false when the headers are immutable (e.g. a
 * `Response.redirect`), which carry no document to protect.
 */
export function applySecurityHeaders(
  headers: Headers,
  options: CspOptions = {}
): boolean {
  try {
    for (const [name, value] of Object.entries(BASE_SECURITY_HEADERS)) {
      if (!headers.has(name)) headers.set(name, value)
    }
    if (isHtml(headers) && !headers.has("Content-Security-Policy")) {
      headers.set("Content-Security-Policy", contentSecurityPolicy(options))
    }
    return true
  } catch {
    return false
  }
}
