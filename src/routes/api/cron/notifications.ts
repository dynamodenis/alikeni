// POST /api/cron/notifications: sends pending RSVP updates and event
// reminders (src/server/email/notifications.server.ts). Called only by the
// Worker's scheduled handler (src/worker.ts), which proves itself with a
// single-use in-memory token; everyone else gets 404.
import { createFileRoute } from "@tanstack/react-router"
import { serverEnv } from "@/env.server"
import { purgeStaleBatches } from "@/server/album/album.server"
import { getDb } from "@/server/db/client.server"
import { runNotifications } from "@/server/email/notifications.server"
import { sendEmail } from "@/server/email/send.server"
import { takeCronToken } from "@/server/platform/cron-token.server"
import { getStorage } from "@/server/storage/index.server"

const CRON_TOKEN_HEADER = "x-alikeni-cron"

export const Route = createFileRoute("/api/cron/notifications")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!takeCronToken(request.headers.get(CRON_TOKEN_HEADER))) {
          return new Response("Not found", { status: 404 })
        }
        const result = await runNotifications(getDb(), sendEmail, {
          origin: serverEnv.APP_ORIGIN,
          dailyBudget: serverEnv.EMAIL_DAILY_BUDGET,
        })
        // Album housekeeping rides along; it must never fail the emails.
        const albumBatchesPurged = await purgeStaleBatches(
          getDb(),
          getStorage()
        ).catch((error: unknown) => {
          console.error("[cron] album purge failed", error)
          return 0
        })
        return Response.json(
          { ...result, albumBatchesPurged },
          {
            headers: { "Cache-Control": "no-store" },
          }
        )
      },
    },
  },
})
