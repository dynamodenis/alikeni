// Premium upgrades through Paystack. Pure functions over a Drizzle db (tested
// on PGlite); the Paystack client and origin come in as `PaymentsDeps`.
//
// Flow: startCheckout creates a pending order and returns Paystack's hosted
// checkout URL → the host pays (M-Pesa, card, Apple Pay) → Paystack calls our
// webhook (`charge.success`) and sends the host back to the upgrade page,
// which also verifies the reference. Either path ends in `applyTransaction`,
// which marks the order paid and the invitation premium only when Paystack
// reports success with the exact amount and currency of the order. It is
// idempotent, so the webhook and the return can race safely.
import { and, desc, eq, ne, sql } from "drizzle-orm"
import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core"
import { z } from "zod"
import {
  FREE_RSVP_LIMIT,
  PREMIUM_PRICE,
  freeHasEnded,
  freeOnlineUntil,
  type Currency,
} from "@/lib/plans"
import * as schema from "@/server/db/schema"
import type { InvitationConfigBase } from "@/templates/_shared/schema"
import {
  PaystackError,
  PaystackTransaction,
  initializeTransaction,
  verifySignature,
  verifyTransaction,
  type PaystackDeps,
} from "./paystack.server"

type AnyDb = PgDatabase<PgQueryResultHKT, typeof schema>
const inv = schema.invitations
const orders = schema.orders

export type PaymentsDeps = {
  /** Null when PAYSTACK_SECRET_KEY is not set: payments are off. */
  paystack: PaystackDeps | null
  /** Public origin for Paystack's return URL. */
  origin: string
  now?: () => Date
}

/** Errors whose message is safe to show the host. */
export class PaymentError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PaymentError"
  }
}

export const PAYMENTS_OFF = "Payments are not available yet."
export const NOT_FOUND = "Invitation not found."
export const ALREADY_PREMIUM = "This invitation is already Premium."

const upgradePath = (invitationId: string) =>
  `/dashboard/${invitationId}/upgrade`

/* ---------- checkout ---------- */

export async function startCheckout(
  db: AnyDb,
  deps: PaymentsDeps,
  input: {
    ownerId: string
    email: string
    invitationId: string
    currency: Currency
  }
): Promise<{ url: string; reference: string }> {
  if (!deps.paystack) throw new PaymentError(PAYMENTS_OFF)
  const invitation = (
    await db
      .select({ id: inv.id, plan: inv.plan })
      .from(inv)
      .where(
        and(eq(inv.id, input.invitationId), eq(inv.ownerId, input.ownerId))
      )
  ).at(0)
  if (!invitation) throw new PaymentError(NOT_FOUND)
  if (invitation.plan === "premium") throw new PaymentError(ALREADY_PREMIUM)

  const reference = `fst-${crypto.randomUUID()}`
  const amount = PREMIUM_PRICE[input.currency]
  await db.insert(orders).values({
    reference,
    invitationId: invitation.id,
    ownerId: input.ownerId,
    amount,
    currency: input.currency,
  })
  const back = `${deps.origin}${upgradePath(invitation.id)}`
  try {
    const checkout = await initializeTransaction(deps.paystack, {
      email: input.email,
      amount,
      currency: input.currency,
      reference,
      callbackUrl: back,
      cancelUrl: back,
      metadata: { invitation_id: invitation.id, order_reference: reference },
    })
    return { url: checkout.authorizationUrl, reference }
  } catch (error) {
    await db
      .update(orders)
      .set({
        status: "failed",
        failureReason:
          error instanceof Error ? error.message.slice(0, 300) : "initialize",
      })
      .where(eq(orders.reference, reference))
    if (error instanceof PaystackError) throw new PaymentError(error.message)
    throw error
  }
}

/* ---------- applying Paystack's answer ---------- */

export type ApplyResult = "paid" | "pending" | "failed" | "unknown"

/**
 * Settle an order from a Paystack transaction. Paid only on `success` with
 * the order's exact amount and currency; anything else that is final marks
 * the order failed. Repeat calls are no-ops once paid.
 */
export async function applyTransaction(
  db: AnyDb,
  tx: PaystackTransaction,
  now = new Date()
): Promise<ApplyResult> {
  const order = (
    await db.select().from(orders).where(eq(orders.reference, tx.reference))
  ).at(0)
  if (!order) return "unknown"
  if (order.status === "paid") return "paid"

  if (tx.status !== "success") {
    // Abandoned or ongoing checkouts may still complete; only a hard
    // failure is final.
    if (tx.status === "failed" || tx.status === "reversed") {
      await db
        .update(orders)
        .set({ status: "failed", failureReason: `paystack: ${tx.status}` })
        .where(and(eq(orders.id, order.id), ne(orders.status, "paid")))
      return "failed"
    }
    return "pending"
  }

  if (tx.amount !== order.amount || tx.currency !== order.currency) {
    console.error("[payments] amount mismatch", tx.reference, {
      expected: [order.amount, order.currency],
      got: [tx.amount, tx.currency],
    })
    await db
      .update(orders)
      .set({
        status: "failed",
        failureReason: `mismatch: got ${tx.amount} ${tx.currency}`,
        providerTransactionId: String(tx.id),
      })
      .where(and(eq(orders.id, order.id), ne(orders.status, "paid")))
    return "failed"
  }

  const paidAt = tx.paid_at ? new Date(tx.paid_at) : now
  await db.transaction(async (t) => {
    const updated = await t
      .update(orders)
      .set({
        status: "paid",
        paidAt: Number.isNaN(paidAt.getTime()) ? now : paidAt,
        providerTransactionId: String(tx.id),
        channel: tx.channel ?? null,
        failureReason: null,
      })
      .where(and(eq(orders.id, order.id), ne(orders.status, "paid")))
      .returning({ invitationId: orders.invitationId })
    const invitationId = updated.at(0)?.invitationId
    if (!invitationId) return
    await t
      .update(inv)
      // Keep updated_at as is: the editor uses it to detect edits made
      // elsewhere, and a payment is not an edit.
      .set({ plan: "premium", updatedAt: sql`${inv.updatedAt}` })
      .where(eq(inv.id, invitationId))
  })
  return "paid"
}

/**
 * The host is back from Paystack with `?reference=`: ask Paystack directly
 * (the webhook may not have arrived yet). Only the order's owner can.
 */
export async function confirmCheckout(
  db: AnyDb,
  deps: PaymentsDeps,
  input: { ownerId: string; reference: string }
): Promise<ApplyResult> {
  const order = (
    await db
      .select({ status: orders.status })
      .from(orders)
      .where(
        and(
          eq(orders.reference, input.reference),
          eq(orders.ownerId, input.ownerId)
        )
      )
  ).at(0)
  if (!order) return "unknown"
  if (order.status === "paid") return "paid"
  if (!deps.paystack) return "pending"
  try {
    const tx = await verifyTransaction(deps.paystack, input.reference)
    return await applyTransaction(db, tx, deps.now?.())
  } catch (error) {
    if (error instanceof PaystackError) return "pending"
    throw error
  }
}

/* ---------- webhook ---------- */

const WebhookEvent = z.object({ event: z.string(), data: z.unknown() })

/**
 * POST /api/payments/paystack. 401 on a bad signature; 200 for everything
 * Paystack sent correctly (including events we ignore), so it stops retrying.
 */
export async function handlePaystackWebhook(
  db: AnyDb,
  deps: PaymentsDeps,
  rawBody: string,
  signature: string | null
): Promise<{ status: number; result?: ApplyResult }> {
  if (!deps.paystack) return { status: 404 }
  if (!(await verifySignature(rawBody, signature, deps.paystack.secretKey))) {
    return { status: 401 }
  }
  let json: unknown
  try {
    json = JSON.parse(rawBody)
  } catch {
    return { status: 400 }
  }
  const event = WebhookEvent.safeParse(json)
  if (!event.success) return { status: 400 }
  if (event.data.event !== "charge.success") return { status: 200 }
  const tx = PaystackTransaction.safeParse(event.data.data)
  if (!tx.success) return { status: 400 }
  const result = await applyTransaction(db, tx.data, deps.now?.())
  return { status: 200, result }
}

/* ---------- the upgrade page ---------- */

/** What the upgrade page shows for one of the owner's invitations. */
export async function getUpgradeInfo(
  db: AnyDb,
  input: { ownerId: string; invitationId: string; now?: Date }
) {
  const row = (
    await db
      .select({
        id: inv.id,
        plan: inv.plan,
        status: inv.status,
        slug: inv.slug,
        draftConfig: inv.draftConfig,
        publishedConfig: inv.publishedConfig,
      })
      .from(inv)
      .where(
        and(eq(inv.id, input.invitationId), eq(inv.ownerId, input.ownerId))
      )
  ).at(0)
  if (!row) return null
  // Published configs are validated; drafts are stored as typed, so read
  // them defensively (a draft may still lack dates).
  const config = row.publishedConfig ?? row.draftConfig
  const loose = config as Partial<InvitationConfigBase>
  const now = input.now ?? new Date()
  let onlineUntil: string | null = null
  let ended = false
  try {
    onlineUntil = freeOnlineUntil(config)
    ended = row.plan === "free" && freeHasEnded(config, now)
  } catch {
    // No usable event date yet.
  }
  const responses = await db.$count(
    schema.rsvps,
    eq(schema.rsvps.invitationId, row.id)
  )
  const paid = (
    await db
      .select({
        amount: orders.amount,
        currency: orders.currency,
        paidAt: orders.paidAt,
      })
      .from(orders)
      .where(and(eq(orders.invitationId, row.id), eq(orders.status, "paid")))
      .orderBy(desc(orders.paidAt))
      .limit(1)
  ).at(0)
  return {
    id: row.id,
    plan: row.plan,
    live: row.status === "published" && !!row.slug,
    slug: row.slug,
    title: loose.texts?.headline || loose.event?.title || "Untitled",
    onlineUntil,
    ended,
    responses,
    rsvpLimit: FREE_RSVP_LIMIT,
    paid: paid
      ? {
          amount: paid.amount,
          currency: paid.currency,
          paidAt: paid.paidAt?.toISOString() ?? null,
        }
      : null,
  }
}
