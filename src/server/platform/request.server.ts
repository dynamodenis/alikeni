// Per-request platform work, run by the global request middleware in
// src/start.ts around every request (pages, server functions, API routes).
import { serverEnv } from "@/env.server"
import { endRequest } from "@/server/platform/runtime"
import { applySecurityHeaders } from "./security-headers"

const extraConnect = (() => {
  try {
    return serverEnv.R2_PUBLIC_URL
      ? [new URL(serverEnv.R2_PUBLIC_URL).origin]
      : []
  } catch {
    return []
  }
})()

/** Security headers on the outgoing response (CSP on HTML only). */
export function secureResponse(response: Response): void {
  applySecurityHeaders(response.headers, {
    dev: import.meta.env.DEV,
    connect: extraConnect,
  })
}

/**
 * Release what the platform opened for this request (on Workers: the
 * request's database pool, closed in `waitUntil`). Never throws.
 */
export function finishRequest(request: Request): void {
  endRequest(request).catch((error: unknown) => {
    console.error("[platform] endRequest failed", error)
  })
}
