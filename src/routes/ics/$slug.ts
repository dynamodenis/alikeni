// `/ics/$slug`: download the published invitation as an iCalendar file
// (one VEVENT per sub-event, UTC times). 404 unless published.
import { createFileRoute } from "@tanstack/react-router"
import { serverEnv } from "@/env.server"
import { getDb } from "@/server/db/client.server"
import { icsResponse } from "@/server/public/ics.server"

export const Route = createFileRoute("/ics/$slug")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        try {
          return await icsResponse(getDb(), params.slug, serverEnv.APP_ORIGIN)
        } catch (error) {
          console.error("[ics]", error)
          return new Response("Something went wrong", { status: 500 })
        }
      },
    },
  },
})
