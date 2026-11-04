// Receives the browser's signed PUT for the drivers that route uploads
// through the app: `local` (development, writes .storage/) and `binding`
// (Workers, writes the BUCKET R2 binding). 404 for the `r2` driver, whose
// presigned URLs point at R2 itself.
import { createFileRoute } from "@tanstack/react-router"
import { getStorage } from "@/server/storage/index.server"
import { handleSignedUpload } from "@/server/storage/routes.server"

export const Route = createFileRoute("/api/storage/upload")({
  server: {
    handlers: {
      PUT: ({ request }) => handleSignedUpload(request, getStorage()),
    },
  },
})
