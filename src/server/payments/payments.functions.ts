// Server functions for Premium upgrades. Safe to import from routes: the
// build replaces handlers with RPC stubs in the client bundle.
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { z } from "zod"
import { serverEnv } from "@/env.server"
import { CURRENCIES, defaultCurrency, type Currency } from "@/lib/plans"
import {
  UnauthorizedError,
  currentUser,
  requireUserId,
} from "@/server/auth/current-user.server"
import { getDb } from "@/server/db/client.server"
import {
  PaymentError,
  confirmCheckout,
  getUpgradeInfo,
  startCheckout,
  type PaymentsDeps,
} from "./payments.server"

export function paymentsDeps(): PaymentsDeps {
  return {
    paystack: serverEnv.PAYSTACK_SECRET_KEY
      ? { secretKey: serverEnv.PAYSTACK_SECRET_KEY }
      : null,
    origin: serverEnv.APP_ORIGIN,
  }
}

/** Only `PaymentError` messages reach the host; the rest is logged. */
function hostError(error: unknown): Error {
  if (error instanceof PaymentError || error instanceof UnauthorizedError) {
    return new Error(error.message)
  }
  console.error("[payments]", error)
  return new Error("Something went wrong. Please try again.")
}

const Id = z.object({ id: z.uuid() })

/** The upgrade page: plan, limits, prices and the suggested currency. */
export const getUpgradeFn = createServerFn({ method: "GET" })
  .validator(Id)
  .handler(async ({ data }) => {
    const db = getDb()
    const ownerId = await requireUserId(db)
    const info = await getUpgradeInfo(db, { ownerId, invitationId: data.id })
    if (!info) return null
    const country = new Headers(getRequestHeaders()).get("cf-ipcountry")
    return {
      ...info,
      paymentsEnabled: !!serverEnv.PAYSTACK_SECRET_KEY,
      suggestedCurrency: defaultCurrency(country),
    }
  })

/** "Pay": a pending order and Paystack's hosted checkout URL. */
export const startCheckoutFn = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.uuid(),
      currency: z.enum(CURRENCIES as [Currency, ...Array<Currency>]),
    })
  )
  .handler(async ({ data }) => {
    try {
      const db = getDb()
      const user = await currentUser(db)
      if (!user) throw new UnauthorizedError()
      const { url } = await startCheckout(db, paymentsDeps(), {
        ownerId: user.id,
        email: user.email,
        invitationId: data.id,
        currency: data.currency,
      })
      return { url }
    } catch (error) {
      throw hostError(error)
    }
  })

/** Back from Paystack with `?reference=`: settle it now if Paystack agrees. */
export const confirmCheckoutFn = createServerFn({ method: "POST" })
  .validator(z.object({ reference: z.string().min(1).max(100) }))
  .handler(async ({ data }) => {
    const db = getDb()
    const ownerId = await requireUserId(db)
    const status = await confirmCheckout(db, paymentsDeps(), {
      ownerId,
      reference: data.reference,
    })
    return { status }
  })
