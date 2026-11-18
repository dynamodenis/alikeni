import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { useEffect } from "react"
import { AuthedPending } from "@/components/brand/pending"
import { NOINDEX } from "@/lib/seo"
import { navigationSession, rememberAccount } from "@/lib/session"

/**
 * Pages that need an account (dashboard, editor). Signed-out visitors go to
 * sign-in and come back here afterwards. This is navigation UX only: every
 * server function checks the session itself.
 */
export const Route = createFileRoute("/_authed")({
  beforeLoad: async ({ location }) => {
    const { user } = await navigationSession()
    if (!user) {
      throw redirect({ to: "/sign-in", search: { redirect: location.href } })
    }
    return { user }
  },
  head: () => ({ meta: [NOINDEX] }),
  pendingComponent: AuthedPending,
  component: AuthedLayout,
})

function AuthedLayout() {
  useEffect(rememberAccount, [])
  return <Outlet />
}
