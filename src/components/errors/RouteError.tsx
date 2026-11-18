// What a visitor sees when a page fails to load, instead of the router's
// bare "Something went wrong!".
//
// The common case is not a bug: after a deploy, a tab that was already open
// still asks for the previous version's script files, which no longer exist.
// The cure is to load the page again, so that is done automatically (once,
// so a real outage cannot loop) while a quiet spinner shows.
import { BrandLoader } from "@/components/brand/Loader"
import { useRouter, type ErrorComponentProps } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

const RELOADED_KEY = "alikeni:reloaded-at"
/** A second failure this soon after reloading is not a stale tab. */
const RELOAD_GUARD_MS = 15_000

/** The browser could not fetch a script or style file of this version. */
export function isStaleBuildError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)
  return /dynamically imported module|Importing a module script failed|Unable to preload CSS|not a valid JavaScript MIME type/i.test(
    message
  )
}

/** Whether a reload is worth trying: not when one was just tried. */
function canReload(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOADED_KEY) ?? 0)
    return Date.now() - last >= RELOAD_GUARD_MS
  } catch {
    // No session storage (the server, private mode): without a guard, do
    // not risk a loop.
    return false
  }
}

/**
 * Reload the page unless that was just tried. Returns whether a reload was
 * started.
 */
export function reloadOnce(): boolean {
  if (!canReload()) return false
  sessionStorage.setItem(RELOADED_KEY, String(Date.now()))
  window.location.reload()
  return true
}

export function RouteError({ error, reset }: ErrorComponentProps) {
  const router = useRouter()
  const stale = isStaleBuildError(error)
  // Decided before the first paint, so the message never flashes ahead of
  // the reload.
  const [reloading] = useState(() => stale && canReload())

  useEffect(() => {
    if (reloading) reloadOnce()
  }, [reloading])

  if (reloading) {
    return (
      <main className="theme-alikeni grid min-h-svh place-items-center bg-background text-muted-foreground">
        <BrandLoader />
      </main>
    )
  }

  return (
    <main className="theme-alikeni grid min-h-svh place-items-center bg-background px-6 text-foreground">
      <div
        role="alert"
        className="flex max-w-sm flex-col items-center gap-4 text-center"
      >
        <h1 className="font-display text-3xl text-balance">
          This page did not load
        </h1>
        <p className="text-sm text-muted-foreground">
          {stale
            ? "Alikeni was updated while this page was open. Load it again to continue."
            : "Something on our side went wrong. Trying again usually fixes it."}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            type="button"
            onClick={() => {
              if (stale) {
                window.location.reload()
                return
              }
              reset()
              void router.invalidate()
            }}
          >
            {stale ? "Load again" : "Try again"}
          </Button>
          <Button asChild variant="outline">
            <a href="/">Go to the home page</a>
          </Button>
        </div>
      </div>
    </main>
  )
}
