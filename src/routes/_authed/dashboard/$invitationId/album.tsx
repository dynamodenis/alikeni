import { DashboardPending } from "@/components/brand/pending"
import { createFileRoute, notFound } from "@tanstack/react-router"
import { z } from "zod"
import { AlbumView } from "@/components/dashboard/AlbumView"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { getOwnerAlbumFn } from "@/server/album/album.functions"

/** The event album of one invitation: settings, approvals, uploads, items. */
export const Route = createFileRoute("/_authed/dashboard/$invitationId/album")({
  loader: async ({ params }) => {
    if (!z.uuid().safeParse(params.invitationId).success) throw notFound()
    const data = await getOwnerAlbumFn({ data: { id: params.invitationId } })
    if (!data) throw notFound()
    return data
  },
  head: () => ({
    meta: [
      { title: "Album · Alikeni" },
      { name: "robots", content: "noindex" },
    ],
  }),
  pendingComponent: DashboardPending,
  component: AlbumPage,
})

function AlbumPage() {
  const data = Route.useLoaderData()
  return (
    <DashboardShell back>
      <AlbumView data={data} />
    </DashboardShell>
  )
}
