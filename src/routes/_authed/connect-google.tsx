// Attaches Google to the signed-in account. The verification email sent from
// the sign-in page lands here, so verifying, signing in and connecting Google
// happen in one go instead of leaving the person to find the button again.
import { createFileRoute, redirect } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { z } from "zod"
import {
  AuthShell,
  GoogleButton,
  authErrorMessage,
} from "@/components/auth/AuthShell"
import { authClient, safeRedirect } from "@/lib/auth-client"
import {
  getLinkedProvidersFn,
  getSessionFn,
} from "@/server/auth/auth.functions"

export const Route = createFileRoute("/_authed/connect-google")({
  validateSearch: z.object({
    redirect: z.string().max(500).optional().catch(undefined),
    // Better Auth sends link failures back here as `?error=<code>`.
    error: z.string().max(100).optional().catch(undefined),
  }),
  beforeLoad: async ({ search }) => {
    const next = safeRedirect(search.redirect)
    const [{ methods }, providers] = await Promise.all([
      getSessionFn(),
      getLinkedProvidersFn(),
    ])
    // Nothing to do: Google is off, or already connected.
    if (!methods.google || providers.includes("google")) {
      throw redirect({ href: next })
    }
  },
  head: () => ({ meta: [{ title: "Connect Google · Alikeni" }] }),
  component: ConnectGoogle,
})

function ConnectGoogle() {
  const { user } = Route.useRouteContext()
  const { redirect: target, error: linkError } = Route.useSearch()
  const next = safeRedirect(target)
  const [pending, setPending] = useState(false)
  const [failure, setFailure] = useState<string | null>(
    linkError
      ? `Google didn't connect. Choose the Google account for ${user.email} and try again.`
      : null
  )

  const connect = async () => {
    setPending(true)
    setFailure(null)
    const { error } = await authClient.linkSocial({
      provider: "google",
      callbackURL: next,
      errorCallbackURL: `/connect-google?redirect=${encodeURIComponent(next)}`,
    })
    // On success the browser is already leaving for Google.
    if (error) {
      setPending(false)
      setFailure(authErrorMessage(error))
    }
  }

  // Straight to Google unless we are back here because it failed.
  const started = useRef(false)
  useEffect(() => {
    if (linkError || started.current) return
    started.current = true
    void connect()
  })

  return (
    <AuthShell
      title="Connect Google"
      subtitle={`Your email is verified. Connecting Google lets you sign in to ${user.email} either way.`}
      footer={
        <a
          href={next}
          className="text-gold-soft underline underline-offset-4 hover:decoration-2"
        >
          Continue without Google
        </a>
      }
    >
      <GoogleButton onClick={() => void connect()} pending={pending} />
      <p role="status" className="min-h-5 text-sm">
        {pending && !failure ? "Taking you to Google…" : null}
      </p>
      {failure && (
        <p role="alert" className="text-sm text-destructive">
          {failure}
        </p>
      )}
    </AuthShell>
  )
}
