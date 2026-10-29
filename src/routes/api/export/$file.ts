// GET /api/export/<invitationId>.csv: the owner's RSVPs as a spreadsheet.
// Anyone else (signed out, another user, unknown id) gets the same 404.
import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"
import { currentUser } from "@/server/auth/current-user.server"
import { getDb } from "@/server/db/client.server"
import { exportRsvpsCsv } from "@/server/invitations/responses.server"

const FileName = z
  .string()
  .regex(/\.csv$/i)
  .transform((name) => name.slice(0, -4))
  .pipe(z.uuid())

const notFound = () =>
  new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  })

export const Route = createFileRoute("/api/export/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const id = FileName.safeParse(params.file)
        if (!id.success) return notFound()
        const db = getDb()
        const user = await currentUser(db)
        if (!user) return notFound()
        const csv = await exportRsvpsCsv(db, { id: id.data, ownerId: user.id })
        if (!csv) return notFound()
        return new Response(csv.body, {
          headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${csv.filename}"`,
            "Cache-Control": "private, no-store",
            "X-Content-Type-Options": "nosniff",
          },
        })
      },
    },
  },
})
