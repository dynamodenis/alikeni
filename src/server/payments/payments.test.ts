// @vitest-environment node
// Premium upgrades against real migrations on PGlite, with Paystack faked at
// the fetch level (requests are checked, nothing leaves the machine).
import { createHmac } from "node:crypto"
import { PGlite } from "@electric-sql/pglite"
import { eq } from "drizzle-orm"
import { drizzle } from "drizzle-orm/pglite"
import { migrate } from "drizzle-orm/pglite/migrator"
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest"
import { PREMIUM_PRICE } from "@/lib/plans"
import * as schema from "@/server/db/schema"
import { DEV_USER } from "@/server/db/seed"
import { createDraft } from "@/server/invitations/drafts.server"
import { publishInvitation } from "@/server/invitations/editing.server"
import {
  ALREADY_PREMIUM,
  CURRENCY_OFF,
  NOT_FOUND,
  PAYMENTS_OFF,
  PaymentError,
  applyTransaction,
  confirmCheckout,
  getUpgradeInfo,
  handlePaystackWebhook,
  startCheckout,
  type PaymentsDeps,
} from "./payments.server"
import { verifySignature, type PaystackTransaction } from "./paystack.server"

const client = new PGlite()
const db = drizzle(client, { schema, casing: "snake_case" })
const SECRET = "sk_test_abc123"
const ORIGIN = "https://alikeni.test"
const OTHER = { id: "other-user", email: "other@example.com", name: "Other" }
let invitationId = ""

type Call = { url: string; method: string; body: unknown; auth: string | null }
let calls: Array<Call> = []
/** What the fake Paystack answers to /transaction/verify. */
let verifyAnswer: Partial<PaystackTransaction> = {}
let initializeFails = false

const fakeFetch: typeof fetch = async (input, init) => {
  const url = String(input)
  const headers = new Headers(init?.headers)
  calls.push({
    url,
    method: init?.method ?? "GET",
    body: init?.body ? JSON.parse(String(init.body)) : undefined,
    auth: headers.get("authorization"),
  })
  if (url.endsWith("/transaction/initialize")) {
    if (initializeFails) {
      return Response.json(
        { status: false, message: "Currency not supported by merchant" },
        { status: 400 }
      )
    }
    const body = JSON.parse(String(init?.body)) as { reference: string }
    return Response.json({
      status: true,
      message: "Authorization URL created",
      data: {
        authorization_url: `https://checkout.paystack.com/${body.reference}`,
        access_code: "ac",
        reference: body.reference,
      },
    })
  }
  const reference = decodeURIComponent(url.split("/").pop() ?? "")
  return Response.json({
    status: true,
    message: "Verification successful",
    data: {
      id: 42,
      reference,
      status: "success",
      amount: PREMIUM_PRICE.KES,
      currency: "KES",
      channel: "mobile_money",
      paid_at: "2026-11-04T10:00:00.000Z",
      ...verifyAnswer,
    },
  })
}

const deps = (overrides: Partial<PaymentsDeps> = {}): PaymentsDeps => ({
  paystack: { secretKey: SECRET, fetch: fakeFetch },
  origin: ORIGIN,
  ...overrides,
})

const tx = (reference: string, extra: Partial<PaystackTransaction> = {}) => ({
  id: 7,
  reference,
  status: "success",
  amount: PREMIUM_PRICE.KES,
  currency: "KES",
  channel: "mobile_money",
  paid_at: "2026-11-04T10:00:00.000Z",
  ...extra,
})

const sign = (body: string) =>
  createHmac("sha512", SECRET).update(body).digest("hex")

async function invitation() {
  return (
    await db
      .select()
      .from(schema.invitations)
      .where(eq(schema.invitations.id, invitationId))
  )[0]!
}

async function order(reference: string) {
  return (
    await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.reference, reference))
  )[0]!
}

const checkout = (currency: "KES" | "USD" = "KES") =>
  startCheckout(db, deps(), {
    ownerId: DEV_USER.id,
    email: DEV_USER.email,
    invitationId,
    currency,
  })

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" })
  await db.insert(schema.users).values([DEV_USER, OTHER])
}, 30_000)
afterAll(async () => client.close())

beforeEach(async () => {
  calls = []
  verifyAnswer = {}
  initializeFails = false
  invitationId = (
    await createDraft(db, {
      ownerId: DEV_USER.id,
      templateId: "wedding/ivory-garden",
    })
  ).id
})

describe("startCheckout", () => {
  it("creates a pending order and returns Paystack's checkout URL", async () => {
    const { url, reference } = await checkout("KES")
    expect(url).toBe(`https://checkout.paystack.com/${reference}`)
    expect(reference).toMatch(/^fst-[0-9a-f-]{36}$/)
    const row = await order(reference)
    expect(row).toMatchObject({
      status: "pending",
      amount: PREMIUM_PRICE.KES,
      currency: "KES",
      invitationId,
      ownerId: DEV_USER.id,
    })
    expect(calls).toHaveLength(1)
    expect(calls[0]).toMatchObject({
      url: "https://api.paystack.co/transaction/initialize",
      method: "POST",
      auth: `Bearer ${SECRET}`,
      body: {
        email: DEV_USER.email,
        amount: String(PREMIUM_PRICE.KES),
        currency: "KES",
        reference,
        callback_url: `${ORIGIN}/dashboard/${invitationId}/upgrade`,
        metadata: {
          invitation_id: invitationId,
          cancel_action: `${ORIGIN}/dashboard/${invitationId}/upgrade`,
        },
      },
    })
  })

  it("charges the USD price in USD", async () => {
    const { reference } = await checkout("USD")
    expect(await order(reference)).toMatchObject({
      amount: PREMIUM_PRICE.USD,
      currency: "USD",
    })
  })

  it("refuses other people's invitations, Premium ones and when off", async () => {
    await expect(
      startCheckout(db, deps(), {
        ownerId: OTHER.id,
        email: OTHER.email,
        invitationId,
        currency: "KES",
      })
    ).rejects.toEqual(new PaymentError(NOT_FOUND))
    await expect(
      startCheckout(db, deps({ paystack: null }), {
        ownerId: DEV_USER.id,
        email: DEV_USER.email,
        invitationId,
        currency: "KES",
      })
    ).rejects.toEqual(new PaymentError(PAYMENTS_OFF))
    await expect(
      startCheckout(db, deps({ currencies: ["KES"] }), {
        ownerId: DEV_USER.id,
        email: DEV_USER.email,
        invitationId,
        currency: "USD",
      })
    ).rejects.toEqual(new PaymentError(CURRENCY_OFF))
    await db
      .update(schema.invitations)
      .set({ plan: "premium" })
      .where(eq(schema.invitations.id, invitationId))
    await expect(checkout()).rejects.toEqual(new PaymentError(ALREADY_PREMIUM))
    expect(calls).toHaveLength(0)
  })

  it("marks the order failed and shows Paystack's reason", async () => {
    initializeFails = true
    await expect(checkout("USD")).rejects.toEqual(
      new PaymentError("Paystack: Currency not supported by merchant")
    )
    const [row] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.invitationId, invitationId))
    expect(row?.status).toBe("failed")
  })
})

describe("applyTransaction", () => {
  it("unlocks Premium once, without touching the editor's updated_at", async () => {
    const { reference } = await checkout()
    const before = await invitation()
    expect(await applyTransaction(db, tx(reference))).toBe("paid")
    expect(await applyTransaction(db, tx(reference))).toBe("paid")
    const after = await invitation()
    expect(after.plan).toBe("premium")
    expect(after.updatedAt.getTime()).toBe(before.updatedAt.getTime())
    expect(await order(reference)).toMatchObject({
      status: "paid",
      providerTransactionId: "7",
      channel: "mobile_money",
      paidAt: new Date("2026-11-04T10:00:00.000Z"),
    })
  })

  it("refuses a different amount or currency", async () => {
    const { reference } = await checkout()
    expect(await applyTransaction(db, tx(reference, { amount: 100 }))).toBe(
      "failed"
    )
    expect((await invitation()).plan).toBe("free")
    const usd = await checkout("USD")
    expect(
      await applyTransaction(
        db,
        tx(usd.reference, { amount: PREMIUM_PRICE.USD, currency: "KES" })
      )
    ).toBe("failed")
    expect((await invitation()).plan).toBe("free")
    expect((await order(reference)).failureReason).toContain("mismatch")
  })

  it("leaves abandoned checkouts pending and ignores unknown references", async () => {
    const { reference } = await checkout()
    expect(
      await applyTransaction(db, tx(reference, { status: "abandoned" }))
    ).toBe("pending")
    expect((await order(reference)).status).toBe("pending")
    expect(await applyTransaction(db, tx("fst-nope"))).toBe("unknown")
  })
})

describe("confirmCheckout", () => {
  it("asks Paystack and settles the owner's order", async () => {
    const { reference } = await checkout()
    calls = []
    expect(
      await confirmCheckout(db, deps(), { ownerId: DEV_USER.id, reference })
    ).toBe("paid")
    expect(calls[0]?.url).toBe(
      `https://api.paystack.co/transaction/verify/${reference}`
    )
    expect((await invitation()).plan).toBe("premium")
  })

  it("does not reveal or settle someone else's order", async () => {
    const { reference } = await checkout()
    expect(
      await confirmCheckout(db, deps(), { ownerId: OTHER.id, reference })
    ).toBe("unknown")
    expect((await invitation()).plan).toBe("free")
  })

  it("stays pending while M-Pesa is still waiting", async () => {
    const { reference } = await checkout()
    verifyAnswer = { status: "ongoing" }
    expect(
      await confirmCheckout(db, deps(), { ownerId: DEV_USER.id, reference })
    ).toBe("pending")
  })
})

describe("webhook", () => {
  const event = (reference: string, name = "charge.success") =>
    JSON.stringify({ event: name, data: tx(reference) })

  it("verifies the signature in constant time", async () => {
    const body = '{"event":"x"}'
    expect(await verifySignature(body, sign(body), SECRET)).toBe(true)
    expect(await verifySignature(body, sign(body).toUpperCase(), SECRET)).toBe(
      true
    )
    expect(await verifySignature(body, sign(`${body} `), SECRET)).toBe(false)
    expect(await verifySignature(body, null, SECRET)).toBe(false)
    expect(await verifySignature(body, "abc", SECRET)).toBe(false)
  })

  it("rejects unsigned or forged events", async () => {
    const { reference } = await checkout()
    const body = event(reference)
    expect(await handlePaystackWebhook(db, deps(), body, null)).toEqual({
      status: 401,
    })
    expect(
      await handlePaystackWebhook(db, deps(), body, sign(event("fst-other")))
    ).toEqual({ status: 401 })
    expect((await invitation()).plan).toBe("free")
  })

  it("unlocks Premium on a signed charge.success", async () => {
    const { reference } = await checkout()
    const body = event(reference)
    expect(await handlePaystackWebhook(db, deps(), body, sign(body))).toEqual({
      status: 200,
      result: "paid",
    })
    expect((await invitation()).plan).toBe("premium")
  })

  it("acknowledges other events and refuses junk", async () => {
    const other = event("fst-x", "transfer.success")
    expect(await handlePaystackWebhook(db, deps(), other, sign(other))).toEqual(
      { status: 200 }
    )
    expect(
      await handlePaystackWebhook(db, deps(), "not json", sign("not json"))
    ).toEqual({ status: 400 })
    expect(
      await handlePaystackWebhook(db, deps({ paystack: null }), other, null)
    ).toEqual({ status: 404 })
  })
})

describe("getUpgradeInfo", () => {
  it("shows the plan, the free limits and the payment", async () => {
    await publishInvitation(db, {
      ownerId: DEV_USER.id,
      id: invitationId,
      slug: `upgrade-${invitationId.slice(0, 8)}`,
    })
    const free = await getUpgradeInfo(db, {
      ownerId: DEV_USER.id,
      invitationId,
      now: new Date("2027-01-01T00:00:00Z"),
    })
    expect(free).toMatchObject({
      plan: "free",
      live: true,
      ended: false,
      responses: 0,
      rsvpLimit: 50,
      paid: null,
    })
    expect(free?.onlineUntil).toMatch(/^2027-06-1\d$/)

    const { reference } = await checkout()
    await applyTransaction(db, tx(reference))
    const premium = await getUpgradeInfo(db, {
      ownerId: DEV_USER.id,
      invitationId,
    })
    expect(premium?.plan).toBe("premium")
    expect(premium?.paid).toMatchObject({
      amount: PREMIUM_PRICE.KES,
      currency: "KES",
    })
    expect(
      await getUpgradeInfo(db, { ownerId: OTHER.id, invitationId })
    ).toBeNull()
  })
})
