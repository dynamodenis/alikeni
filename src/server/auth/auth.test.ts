// @vitest-environment node
// Better Auth end to end against a migrated in-memory Postgres: the same
// tables, adapter and options the app uses, with emails captured.
import { PGlite } from "@electric-sql/pglite"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { parseServerEnv } from "@/env.server"
import * as schema from "@/server/db/schema"
import type { Email } from "@/server/email/send.server"
import { EMAIL_SEND_FAILED, createAuth } from "./auth.server"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })
const sent: Array<Email> = []
const auth = createAuth(db, parseServerEnv({ NODE_ENV: "test" }), async (e) => {
  sent.push(e)
})

const AMINA = {
  name: "Amina Otieno",
  email: "amina@example.com",
  password: "correct horse battery",
}

/** The session cookie from a sign-in/sign-up response, as request headers. */
function cookieHeaders(response: Response) {
  const cookie = response.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ")
  return new Headers({ cookie })
}

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
}, 30_000)

afterAll(async () => {
  await client.close()
})

describe("email + password", () => {
  it("signs up: user row, hashed password, confirmation email", async () => {
    const response = await auth.api.signUpEmail({
      body: AMINA,
      asResponse: true,
    })
    expect(response.status).toBe(200)

    const user = (
      await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, AMINA.email))
    ).at(0)
    expect(user).toMatchObject({ name: AMINA.name, emailVerified: false })

    const account = (
      await db
        .select()
        .from(schema.accounts)
        .where(eq(schema.accounts.userId, user!.id))
    ).at(0)
    expect(account?.providerId).toBe("credential")
    expect(account?.password).toBeTruthy()
    expect(account?.password).not.toContain(AMINA.password)

    const confirm = sent.find((e) => e.to === AMINA.email)
    expect(confirm?.subject).toMatch(/confirm/i)
    expect(confirm?.text).toContain("/api/auth/verify-email?token=")
  })

  it("refuses a second account on the same email", async () => {
    const response = await auth.api.signUpEmail({
      body: { ...AMINA, name: "Someone else" },
      asResponse: true,
    })
    expect(response.status).toBe(422)
  })

  it("signs in and the cookie resolves to the session", async () => {
    const response = await auth.api.signInEmail({
      body: { email: AMINA.email, password: AMINA.password },
      asResponse: true,
    })
    expect(response.status).toBe(200)
    const session = await auth.api.getSession({
      headers: cookieHeaders(response),
    })
    expect(session?.user.email).toBe(AMINA.email)
  })

  it("rejects a wrong password and an unknown email the same way", async () => {
    const wrong = await auth.api.signInEmail({
      body: { email: AMINA.email, password: "not the password" },
      asResponse: true,
    })
    const unknown = await auth.api.signInEmail({
      body: { email: "nobody@example.com", password: "whatever123" },
      asResponse: true,
    })
    expect(wrong.status).toBe(401)
    expect(unknown.status).toBe(401)
  })

  it("has no session without a cookie", async () => {
    expect(await auth.api.getSession({ headers: new Headers() })).toBeNull()
  })

  it("resets a password through the emailed link", async () => {
    await auth.api.requestPasswordReset({
      body: { email: AMINA.email, redirectTo: "/reset-password" },
    })
    const email = [...sent].reverse().find((e) => /reset/i.test(e.subject))
    expect(email?.to).toBe(AMINA.email)
    const link = /(http\S+)/.exec(email?.text ?? "")?.[1]
    const token = link && new URL(link).pathname.split("/").at(-1)
    expect(token).toBeTruthy()

    const reset = await auth.api.resetPassword({
      body: { token: token!, newPassword: "a brand new password" },
      asResponse: true,
    })
    expect(reset.status).toBe(200)
    const session = await auth.api.getSession({
      headers: cookieHeaders(reset),
    })
    expect(session?.user.email).toBe(AMINA.email)

    const old = await auth.api.signInEmail({
      body: { email: AMINA.email, password: AMINA.password },
      asResponse: true,
    })
    const fresh = await auth.api.signInEmail({
      body: { email: AMINA.email, password: "a brand new password" },
      asResponse: true,
    })
    expect(old.status).toBe(401)
    expect(fresh.status).toBe(200)
  })
  it("does not sign anyone in when the reset token is bad", async () => {
    const reset = await auth.api.resetPassword({
      body: { token: "not-a-real-token", newPassword: "another new password" },
      asResponse: true,
    })
    expect(reset.status).toBe(400)
    expect(reset.headers.getSetCookie()).toHaveLength(0)
  })
})

describe("when email can't be sent", () => {
  const broken = createAuth(
    db,
    parseServerEnv({ NODE_ENV: "test" }),
    async () => {
      throw new Error("mail provider rejected the message")
    }
  )
  const ORIGIN = "http://localhost:3000"
  const json = (path: string, body: unknown) =>
    broken.handler(
      new Request(`${ORIGIN}/api/auth${path}`, {
        method: "POST",
        headers: { "content-type": "application/json", origin: ORIGIN },
        body: JSON.stringify(body),
      })
    )

  it("still completes sign-up; the confirmation can be resent later", async () => {
    const response = await json("/sign-up/email", {
      name: "Wanjiru Kamau",
      email: "wanjiru@example.com",
      password: "another fine passphrase",
    })
    expect(response.status).toBe(200)
    const user = (
      await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, "wanjiru@example.com"))
    ).at(0)
    expect(user).toBeDefined()
  })

  it("tells an explicit resend that it failed", async () => {
    const response = await json("/send-verification-email", {
      email: "wanjiru@example.com",
      callbackURL: "/dashboard",
    })
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ code: EMAIL_SEND_FAILED })
  })

  it("keeps a password reset request silent, as for unknown emails", async () => {
    const response = await json("/request-password-reset", {
      email: "wanjiru@example.com",
      redirectTo: "/reset-password",
    })
    expect(response.status).toBe(200)
  })
})
