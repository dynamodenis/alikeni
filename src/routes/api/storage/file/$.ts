// Serves uploaded files for the `local` driver (development) and the
// `binding` driver when R2_PUBLIC_URL is unset, with HTTP Range support
// (Safari will not play audio from a server that ignores Range).
import { createFileRoute } from "@tanstack/react-router"
import { getStorage } from "@/server/storage/index.server"
import { serveStoredFile } from "@/server/storage/routes.server"

export const Route = createFileRoute("/api/storage/file/$")({
  server: {
    handlers: {
      GET: ({ request, params }) =>
        serveStoredFile(request, params._splat ?? "", getStorage()),
    },
  },
})
