import {
  Link,
  createFileRoute,
  redirect,
  useRouter,
} from "@tanstack/react-router"
import { useRef, useState } from "react"
import { z } from "zod"
import {
  AuthField,
  AuthShell,
  FormError,
  GoogleButton,
  OrDivider,
  SubmitButton,
  authErrorMessage,
} from "@/components/auth/AuthShell"
import { authClient, safeRedirect } from "@/lib/auth-client"
import { getSessionFn } from "@/server/auth/auth.functions"

export const AuthSearch = z.object({
  redirect: z.string().max(500).optional().catch(undefined),
  // Better Auth sends OAuth failures back here as `?error=<code>`.
  error: z.string().max(100).optional().catch(undefined),
})

/**
 * Google refuses to join an existing password account until that account's
 * email is verified (Better Auth `requireLocalEmailVerified`, kept on so a
 * stranger can't pre-register your address and inherit your Google sign-in).
 * The fix is to verify, so this page offers the link right here.
 */
export const ACCOUNT_NOT_LINKED = "account_not_linked"

export const Route = createFileRoute("/sign-in")({
  validateSearch: AuthSearch,
  beforeLoad: async ({ search }) => {
    const { user, methods } = await getSessionFn()
    if (user) throw redirect({ href: safeRedirect(search.redirect) })
    return { methods }
  },
  loader: ({ context }) => context.methods,
  head: () => ({ meta: [{ title: "Sign in · Alikeni" }] }),
  component: SignIn,
})

function SignIn() {
  const methods = Route.useLoaderData()
  const { redirect: target, error: oauthError } = Route.useSearch()
  const router = useRouter()
  const next = safeRedirect(target)
  const [pending, setPending] = useState<"email" | "google" | "verify" | null>(
    null
  )
  const [error, setError] = useState<string | null>(
    oauthError && oauthError !== ACCOUNT_NOT_LINKED
      ? "Google sign-in didn't complete. Please try again."
      : null
  )
  // Read at click time rather than mirrored in state: text typed or autofilled
  // before hydration never reaches a controlled input's state.
  const emailRef = useRef<HTMLInputElement>(null)
  const [verificationSentTo, setVerificationSentTo] = useState<string | null>(
    null
  )
  // Shown inside the notice, next to the button that caused it.
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const needsVerification = oauthError === ACCOUNT_NOT_LINKED

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    setPending("email")
    setError(null)
    const { error: failure } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    })
    if (failure) {
      setPending(null)
      setError(authErrorMessage(failure))
      return
    }
    await router.invalidate()
    await router.navigate({ href: next })
  }

  const onGoogle = async () => {
    setPending("google")
    setError(null)
    const { error: failure } = await authClient.signIn.social({
      provider: "google",
      callbackURL: next,
      errorCallbackURL: `/sign-in?redirect=${encodeURIComponent(next)}`,
    })
    // On success the browser is already leaving for Google.
    if (failure) {
      setPending(null)
      setError(authErrorMessage(failure))
    }
  }

  const onSendVerification = async () => {
    const email = emailRef.current?.value.trim() ?? ""
    if (!email.includes("@")) {
      setVerifyError("Enter your email in the field below first.")
      emailRef.current?.focus()
      return
    }
    setPending("verify")
    setVerifyError(null)
    const { error: failure } = await authClient.sendVerificationEmail({
      email,
      // The link verifies, signs in, then connects Google before `next`.
      callbackURL: `/connect-google?redirect=${encodeURIComponent(next)}`,
    })
    setPending(null)
    if (failure) {
      setVerifyError(authErrorMessage(failure))
      return
    }
    setVerificationSentTo(email)
  }

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to keep working on your invitations."
      footer={
        <>
          New to Alikeni?{" "}
          <Link
            to="/sign-up"
            search={{ redirect: target }}
            className="text-gold-soft underline underline-offset-4 hover:decoration-2"
          >
            Create an account
          </Link>
        </>
      }
    >
      {needsVerification && (
        <div
          role="status"
          className="flex flex-col gap-3 rounded-lg border border-gold-soft/40 bg-gold-soft/10 p-4 text-sm"
        >
          <p className="font-medium">Verify your email to connect Google</p>
          {verificationSentTo ? (
            <p>
              Check <strong>{verificationSentTo}</strong> for the link. Once you
              have clicked it, sign in with Google again and it will join your
              account.
            </p>
          ) : (
            <>
              <p>
                This address already has an Alikeni account with a password, but
                the email was never verified, so Google can't be connected to it
                yet. Enter the email below and send yourself a verification
                link, then sign in with Google again. You can also sign in with
                your password as usual.
              </p>
              <button
                type="button"
                onClick={onSendVerification}
                disabled={pending !== null}
                aria-busy={pending === "verify"}
                className="self-start text-gold-soft underline underline-offset-4 hover:decoration-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pending === "verify" ? "Sending…" : "Send verification link"}
              </button>
              {verifyError && (
                <p role="alert" className="text-destructive">
                  {verifyError}
                </p>
              )}
            </>
          )}
        </div>
      )}
      {methods.google && (
        <>
          <GoogleButton onClick={onGoogle} pending={pending !== null} />
          <OrDivider />
        </>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <AuthField
          id="email"
          name="email"
          type="email"
          label="Email"
          autoComplete="email"
          inputMode="email"
          ref={emailRef}
          required
        />
        <AuthField
          id="password"
          name="password"
          type="password"
          label="Password"
          autoComplete="current-password"
          required
          aside={
            <Link
              to="/forgot-password"
              className="text-xs text-gold-soft underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          }
        />
        <FormError message={error} />
        <SubmitButton pending={pending === "email"} pendingLabel="Signing in…">
          Sign in
        </SubmitButton>
      </form>
    </AuthShell>
  )
}
