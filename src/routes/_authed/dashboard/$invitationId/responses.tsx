import { createFileRoute, notFound } from "@tanstack/react-router"
import { z } from "zod"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { ResponsesView } from "@/components/dashboard/ResponsesView"
import { getResponsesFn } from "@/server/invitations/dashboard.functions"

/** RSVPs, totals, wish moderation and CSV export for one invitation. */
export const Route = createFileRoute(
  "/_authed/dashboard/$invitationId/responses"
)({
  loader: async ({ params }) => {
    if (!z.uuid().safeParse(params.invitationId).success) throw notFound()
    const data = await getResponsesFn({ data: { id: params.invitationId } })
    if (!data) throw notFound()
    return data
  },
  head: () => ({
    meta: [
      { title: "Responses · Festly" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResponsesPage,
})

function ResponsesPage() {
  const data = Route.useLoaderData()
  return (
    <DashboardShell back>
      <ResponsesView data={data} />
    </DashboardShell>
  )
}
