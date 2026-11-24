import { createFileRoute } from "@tanstack/react-router"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { HelpView } from "@/components/dashboard/HelpView"

/** The in-app guide. No loader: the page is static text. */
export const Route = createFileRoute("/_authed/dashboard/help")({
  head: () => ({ meta: [{ title: "Help · Alikeni" }] }),
  component: HelpPage,
})

function HelpPage() {
  return (
    <DashboardShell back>
      <HelpView />
    </DashboardShell>
  )
}
