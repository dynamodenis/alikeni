import { createRouter as createTanStackRouter } from "@tanstack/react-router"
import { RouteError, reloadOnce } from "@/components/errors/RouteError"
import { routeTree } from "./routeTree.gen"

// A script or style file of this version is gone (a newer version was
// deployed while the tab was open): load the page again instead of failing.
// Fired by Vite for every dynamic import it wraps, including link preloads.
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    if (reloadOnce()) event.preventDefault()
  })
}

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,

    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: RouteError,
  })

  return router
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
