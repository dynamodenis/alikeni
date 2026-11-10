// Better Auth instance: email + password and Google, sessions in Postgres via
// Drizzle (users / sessions / accounts / verifications). Built on first use
// so routes that never touch auth still boot without DATABASE_URL.
import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { setSessionCookie } from "better-auth/cookies"
import { tanstackStartCookies } from "better-auth/tanstack-start"
import { serverEnv, type ServerEnv } from "@/env.server"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { getDb } from "@/server/db/client.server"
import * as schema from "@/server/db/schema"
import {
  sendEmail,
  type Email,
  type EmailSender,
} from "@/server/email/send.server"
import {
  resetPasswordEmail,
  verifyEmail,
} from "@/server/email/templates.server"

// Public on purpose: env validation refuses to start production without a
// real BETTER_AUTH_SECRET.
const DEV_SECRET = "alikeni-dev-only-auth-secret-never-use-in-production"

/** Any Drizzle Postgres database (node-postgres in the app, PGlite in tests). */
type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>

// Who a /reset-password request is for, handed from the before hook to the
// after hook: the endpoint consumes the token, so `after` can't look it up.
const resettingUser = new WeakMap<object, string>()

/** Error code the sign-in page maps to a message when mail can't go out. */
export const EMAIL_SEND_FAILED = "EMAIL_SEND_FAILED"

/**
 * Sends, or tells the caller it couldn't. A plain throw becomes a bodyless
 * 500 that the client can't explain; an APIError carries a code the sign-in
 * page can show. Sign-up and password-reset mails run as Better Auth
 * background tasks, which log and swallow this, so those flows still succeed
 * and the person can ask for the mail again; only an explicit
 * `/send-verification-email` awaits it and reports the failure.
 */
async function deliver(send: EmailSender, email: Email) {
  try {
    await send(email)
  } catch (error) {
    console.error(`[auth] email to ${email.to} failed:`, error)
    throw new APIError("SERVICE_UNAVAILABLE", {
      code: EMAIL_SEND_FAILED,
      message: "We couldn't send the email. Try again in a few minutes.",
    })
  }
}

export function createAuth(db: AnyDb, env: ServerEnv, send: EmailSender) {
  const google =
    env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
          },
        }
      : undefined

  return betterAuth({
    appName: "Alikeni",
    baseURL: env.APP_ORIGIN,
    secret: env.BETTER_AUTH_SECRET ?? DEV_SECRET,
    database: drizzleAdapter(db, { provider: "pg", schema, usePlural: true }),
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
      // Sign-up lands straight in the editor; verification is asked for, not
      // required, so the first invitation is never blocked on an inbox.
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await deliver(send, resetPasswordEmail(user.email, url))
      },
    },
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }) => {
        await deliver(send, verifyEmail(user.email, url))
      },
    },
    socialProviders: google,
    // Signing in with Google on an address that already has a password joins
    // the two instead of failing (Google verifies the address).
    account: {
      accountLinking: { enabled: true, trustedProviders: ["google"] },
    },
    // A successful password reset signs the person in instead of sending them
    // back to the sign-in page to type the password they just chose.
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/reset-password") return
        const token = ctx.body?.token ?? ctx.query?.token
        if (typeof token !== "string" || !token) return
        const verification =
          await ctx.context.internalAdapter.findVerificationValue(
            `reset-password:${token}`
          )
        if (verification) resettingUser.set(ctx.context, verification.value)
      }),
      after: createAuthMiddleware(async (ctx) => {
        if (ctx.path !== "/reset-password") return
        const userId = resettingUser.get(ctx.context)
        if (!userId || ctx.context.returned instanceof Error) return
        const user = await ctx.context.internalAdapter.findUserById(userId)
        if (!user) return
        const session = await ctx.context.internalAdapter.createSession(userId)
        await setSessionCookie(ctx, { session, user })
      }),
    },
    // Must stay last: lets auth calls inside server functions set cookies.
    plugins: [tanstackStartCookies()],
  })
}

export type Auth = ReturnType<typeof createAuth>

let instance: Auth | undefined
export function getAuth(): Auth {
  return (instance ??= createAuth(getDb(), serverEnv, sendEmail))
}

/** Which sign-in methods this deployment offers (for the sign-in page). */
export function authMethods(env: ServerEnv = serverEnv) {
  return { google: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) }
}
