import { Suspense, lazy, useCallback, useState } from "react"
import type { ReactNode } from "react"
import { publicEnv } from "@/env.public"
import { useHydrated } from "@/hooks/use-hydrated"

const LazyTurnstile = lazy(() => import("./Turnstile"))

export type TurnstileState = {
  /** True when a site key is configured and the form is live (public mode). */
  enabled: boolean
  token: string | undefined
  /** The widget, or null (server, preview, no site key). */
  widget: ReactNode
  /** Tokens are single-use: call after every submit to get a new one. */
  reset: () => void
}

/**
 * Turnstile for guest forms. Renders nothing unless VITE_TURNSTILE_SITE_KEY
 * is set and `active` (public mode), and only after hydration; the widget
 * chunk and Cloudflare's script load lazily.
 */
export function useTurnstile(active: boolean): TurnstileState {
  const siteKey = publicEnv.VITE_TURNSTILE_SITE_KEY
  const hydrated = useHydrated()
  const [token, setToken] = useState<string>()
  const [generation, setGeneration] = useState(0)
  const enabled = active && !!siteKey
  const reset = useCallback(() => {
    setToken(undefined)
    setGeneration((g) => g + 1)
  }, [])
  const widget =
    enabled && hydrated && siteKey ? (
      <Suspense fallback={null}>
        <LazyTurnstile
          key={generation}
          siteKey={siteKey}
          onToken={setToken}
          className="flex justify-center"
        />
      </Suspense>
    ) : null
  return { enabled, token, widget, reset }
}
