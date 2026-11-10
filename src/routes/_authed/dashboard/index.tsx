import { createFileRoute } from "@tanstack/react-router"
import { Plus } from "lucide-react"
import { BrandLink } from "@/components/brand/ButtonLink"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { InvitationCard } from "@/components/dashboard/InvitationCard"
import { listMyInvitationsFn } from "@/server/invitations/invitations.functions"

export const Route = createFileRoute("/_authed/dashboard/")({
  loader: () => listMyInvitationsFn(),
  head: () => ({ meta: [{ title: "My invitations · Alikeni" }] }),
  component: Dashboard,
})

function Dashboard() {
  const all = Route.useLoaderData()
  const { user } = Route.useRouteContext()
  const firstName = user.name?.trim().split(/\s+/)[0]
  const invitations = all.filter((row) => row.status !== "archived")
  const archived = all.filter((row) => row.status === "archived")

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">
            {firstName ? `Hi ${firstName}` : "My invitations"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {invitations.length === 0
              ? "Pick a template to start your first invitation."
              : `${invitations.length} invitation${invitations.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <BrandLink to="/templates" size="md">
          <Plus className="size-4" aria-hidden="true" />
          New invitation
        </BrandLink>
      </div>

      {invitations.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {invitations.map((row) => (
            <InvitationCard key={row.id} row={row} />
          ))}
        </ul>
      )}

      {archived.length > 0 && (
        <details className="group/archived mt-12">
          <summary className="cursor-pointer text-sm text-muted-foreground select-none hover:text-foreground">
            Archived ({archived.length})
          </summary>
          <p className="mt-2 text-xs text-muted-foreground">
            Archived invitations are hidden from guests. Unarchive one to put it
            back online.
          </p>
          <ul className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {archived.map((row) => (
              <InvitationCard key={row.id} row={row} />
            ))}
          </ul>
        </details>
      )}
    </DashboardShell>
  )
}

function EmptyState() {
  return (
    <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <p className="font-display text-2xl">Nothing here yet</p>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Choose a design, add your names, date and venue, and share one link with
        every guest.
      </p>
      <BrandLink to="/templates" className="mt-6" arrow>
        Browse templates
      </BrandLink>
    </div>
  )
}
