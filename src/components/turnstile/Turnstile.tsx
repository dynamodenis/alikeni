// Cloudflare Turnstile widget. Client-only: loaded lazily by `useTurnstile`
// after hydration, so the script never blocks the first paint.
import { useEffect, useRef } from "react"

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string
      appearance?: "always" | "execute" | "interaction-only"
      callback?: (token: string) => void
      "expired-callback"?: () => void
      "error-callback"?: () => void
    }
  ) => string
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

const SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"

let loading: Promise<TurnstileApi> | undefined

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  loading ??= new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = SCRIPT
    script.async = true
    script.defer = true
    script.onload = () =>
      window.turnstile
        ? resolve(window.turnstile)
        : reject(new Error("Turnstile did not load"))
    script.onerror = () => {
      loading = undefined
      reject(new Error("Turnstile did not load"))
    }
    document.head.appendChild(script)
  })
  return loading
}

export type TurnstileProps = {
  siteKey: string
  /** A fresh token, or undefined when it expired or failed. */
  onToken: (token: string | undefined) => void
  className?: string
}

export default function Turnstile({
  siteKey,
  onToken,
  className,
}: TurnstileProps) {
  const ref = useRef<HTMLDivElement>(null)
  const onTokenRef = useRef(onToken)
  useEffect(() => {
    onTokenRef.current = onToken
  }, [onToken])

  useEffect(() => {
    let widgetId: string | undefined
    let cancelled = false
    loadTurnstile()
      .then((api) => {
        if (cancelled || !ref.current) return
        widgetId = api.render(ref.current, {
          sitekey: siteKey,
          appearance: "interaction-only",
          callback: (token) => onTokenRef.current(token),
          "expired-callback": () => onTokenRef.current(undefined),
          "error-callback": () => onTokenRef.current(undefined),
        })
      })
      .catch((error: unknown) => console.error("[turnstile]", error))
    return () => {
      cancelled = true
      if (widgetId) window.turnstile?.remove(widgetId)
    }
  }, [siteKey])

  return <div ref={ref} className={className} />
}
