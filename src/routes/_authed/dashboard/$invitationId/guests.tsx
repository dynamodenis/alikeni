import { createFileRoute, notFound } from "@tanstack/react-router"
import { z } from "zod"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { GuestsView } from "@/components/dashboard/GuestsView"
import { getGuestsFn } from "@/server/invitations/dashboard.functions"

/** Guest list with personal `?to=` links for one invitation. */
export const Route = createFileRoute("/_authed/dashboard/$invitationId/guests")(
  {
    loader: async ({ params }) => {
      if (!z.uuid().safeParse(params.invitationId).success) throw notFound()
      const data = await getGuestsFn({ data: { id: params.invitationId } })
      if (!data) throw notFound()
      return data
    },
    head: () => ({
      meta: [
        { title: "Guests · Festly" },
        { name: "robots", content: "noindex" },
      ],
    }),
    component: GuestsPage,
  }
)

function GuestsPage() {
  const data = Route.useLoaderData()
  return (
    <DashboardShell back>
      <GuestsView data={data} />
    </DashboardShell>
  )
}
