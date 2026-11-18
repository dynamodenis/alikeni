// What a route shows while its data loads on an in-app navigation (the
// first, server-rendered load never shows these). Each keeps the page's own
// header and footer and puts the loader where the content will be.
import { useLocation } from "@tanstack/react-router"
import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { SiteShell } from "@/components/gallery/SiteShell"
import { ContentLoader, FullPageLoader } from "./Loader"

/** Dashboard pages: brand header stays, loader in the content area. */
export function DashboardPending() {
  return (
    <DashboardShell>
      <ContentLoader />
    </DashboardShell>
  )
}

/** Marketing pages (templates, blog): nav and footer stay. */
export function SitePending() {
  return (
    <SiteShell>
      <ContentLoader className="min-h-[70svh]" />
    </SiteShell>
  )
}

/**
 * Signed-in area while the session is checked. The editor has its own
 * full-screen layout; everything else is a dashboard page.
 */
export function AuthedPending() {
  const editor = useLocation({
    select: (location) => location.pathname.startsWith("/editor"),
  })
  return editor ? <FullPageLoader /> : <DashboardPending />
}
