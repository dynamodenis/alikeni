// Open Graph card for a published invitation: /og/<slug>.png (1200×630).
// `/i/$slug` points og:image here; the card is cached in object storage.
import { createFileRoute } from "@tanstack/react-router"
import { getDb } from "@/server/db/client.server"
import { ogImageResponse } from "@/server/og/og.server"
import { getStorage } from "@/server/storage/index.server"

export const Route = createFileRoute("/og/{$slug}.png")({
  server: {
    handlers: {
      GET: ({ params }) =>
        ogImageResponse(params.slug, { db: getDb(), storage: getStorage() }),
    },
  },
})
