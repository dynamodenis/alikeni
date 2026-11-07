// Wires `PaymentsDeps` from the server env. Server-only: keep it out of
// payments.functions.ts, whose top level ships to the client bundle.
import { serverEnv } from "@/env.server"
import type { PaymentsDeps } from "./payments.server"

export function paymentsDeps(): PaymentsDeps {
  return {
    paystack: serverEnv.PAYSTACK_SECRET_KEY
      ? { secretKey: serverEnv.PAYSTACK_SECRET_KEY }
      : null,
    origin: serverEnv.APP_ORIGIN,
    currencies: serverEnv.PAYSTACK_CURRENCIES,
  }
}
