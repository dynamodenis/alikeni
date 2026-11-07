// POST /api/payments/paystack: Paystack webhooks. Authenticated by the
// `x-paystack-signature` HMAC of the raw body (see paystack.server.ts), not by
// cookies, so it sits outside the server-function CSRF check. Set this URL in
// the Paystack dashboard (Settings → API Keys & Webhooks).
import { createFileRoute } from "@tanstack/react-router"
import { getDb } from "@/server/db/client.server"
import { paymentsDeps } from "@/server/payments/payments.deps.server"
import { handlePaystackWebhook } from "@/server/payments/payments.server"

const MAX_BODY = 64 * 1024

export const Route = createFileRoute("/api/payments/paystack")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const length = Number(request.headers.get("content-length") ?? 0)
        if (length > MAX_BODY) return new Response(null, { status: 413 })
        const body = await request.text()
        if (body.length > MAX_BODY) return new Response(null, { status: 413 })
        const { status } = await handlePaystackWebhook(
          getDb(),
          paymentsDeps(),
          body,
          request.headers.get("x-paystack-signature")
        )
        return new Response(null, {
          status,
          headers: { "Cache-Control": "no-store" },
        })
      },
    },
  },
})
