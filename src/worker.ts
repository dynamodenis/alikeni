// Cloudflare Worker entry (wrangler.jsonc `main`). Wraps TanStack Start's
// server entry with what only the Worker does: the www → APP_ORIGIN redirect
// and the cron trigger. Node (`pnpm dev`, `pnpm start`) never loads this file.
import handler from "@tanstack/react-start/server-entry"
import { env } from "cloudflare:workers"
import { canonicalRedirect } from "@/server/platform/canonical"
import { issueCronToken } from "@/server/platform/cron-token.server"

export default {
  async fetch(request: Request): Promise<Response> {
    const target = canonicalRedirect(request.url, env.APP_ORIGIN)
    if (target) return Response.redirect(target, 301)
    const response = await handler.fetch(request)
    // The workers.dev address serves the same pages as APP_ORIGIN; only
    // APP_ORIGIN belongs in search results.
    if (new URL(request.url).hostname.endsWith(".workers.dev")) {
      const copy = new Response(response.body, response)
      copy.headers.set("X-Robots-Tag", "noindex")
      return copy
    }
    return response
  },

  /**
   * Cron (wrangler.jsonc `triggers`): RSVP updates and event reminders. The
   * job runs as an ordinary request through the app, so it gets the same
   * per-request database pool and cleanup as every other route.
   */
  async scheduled(): Promise<void> {
    const response = await handler.fetch(
      new Request(`${env.APP_ORIGIN}/api/cron/notifications`, {
        method: "POST",
        headers: { "x-alikeni-cron": issueCronToken() },
      })
    )
    const body = await response.text()
    if (response.ok) console.info(`[cron] notifications ${body}`)
    else console.error(`[cron] notifications failed: ${response.status}`)
  },
}
