// Paystack REST client: plain fetch and Web Crypto, so the same code runs on
// Cloudflare Workers and Node. Only what the upgrade flow needs: start a
// hosted checkout, verify a transaction, check a webhook signature.
// Docs: https://paystack.com/docs/api/transaction/
import { z } from "zod"

const API = "https://api.paystack.co"
const TIMEOUT_MS = 15_000

export type PaystackDeps = {
  /** sk_test_… or sk_live_… */
  secretKey: string
  /** Injectable for tests. */
  fetch?: typeof fetch
}

/** A Paystack refusal or outage; `message` is safe to show the host. */
export class PaystackError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "PaystackError"
  }
}

/** The fields of a Paystack transaction we act on. */
export const PaystackTransaction = z.object({
  id: z.number(),
  reference: z.string(),
  /** success | failed | abandoned | ongoing | pending | reversed … */
  status: z.string(),
  /** Subunits (cents). */
  amount: z.number().int(),
  currency: z.string(),
  channel: z.string().nullish(),
  paid_at: z.string().nullish(),
})
export type PaystackTransaction = z.infer<typeof PaystackTransaction>

const Envelope = z.object({
  status: z.boolean(),
  message: z.string(),
  data: z.unknown(),
})

async function call<T extends z.ZodType>(
  deps: PaystackDeps,
  path: string,
  schema: T,
  init: { method: "GET" | "POST"; body?: unknown } = { method: "GET" }
): Promise<z.output<T>> {
  const doFetch = deps.fetch ?? fetch
  let res: Response
  try {
    res = await doFetch(`${API}${path}`, {
      method: init.method,
      headers: {
        Authorization: `Bearer ${deps.secretKey}`,
        "Content-Type": "application/json",
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
  } catch (error) {
    console.error("[paystack] request failed", path, error)
    throw new PaystackError("Paystack did not respond. Please try again.")
  }
  const json: unknown = await res.json().catch(() => null)
  const envelope = Envelope.safeParse(json)
  const parsed = envelope.success
    ? schema.safeParse(envelope.data.data)
    : undefined
  if (
    !res.ok ||
    !envelope.success ||
    !envelope.data.status ||
    !parsed?.success
  ) {
    const message =
      json && typeof json === "object" && "message" in json
        ? String(json.message)
        : `HTTP ${res.status}`
    console.error("[paystack]", path, res.status, message)
    throw new PaystackError(`Paystack: ${message}`)
  }
  return parsed.data as z.output<T>
}

/**
 * Start a hosted checkout. The host is sent to `authorizationUrl`; Paystack
 * returns them to `callbackUrl?trxref=…&reference=…` when done, and to
 * `cancelUrl` from its cancel button.
 */
export async function initializeTransaction(
  deps: PaystackDeps,
  input: {
    email: string
    /** Subunits (cents). */
    amount: number
    currency: string
    reference: string
    callbackUrl: string
    cancelUrl: string
    metadata: Record<string, string>
  }
): Promise<{ authorizationUrl: string; reference: string }> {
  const data = await call(
    deps,
    "/transaction/initialize",
    z.object({ authorization_url: z.url(), reference: z.string() }),
    {
      method: "POST",
      body: {
        email: input.email,
        amount: String(input.amount),
        currency: input.currency,
        reference: input.reference,
        callback_url: input.callbackUrl,
        metadata: { ...input.metadata, cancel_action: input.cancelUrl },
      },
    }
  )
  return { authorizationUrl: data.authorization_url, reference: data.reference }
}

/** The current state of a transaction, straight from Paystack. */
export function verifyTransaction(
  deps: PaystackDeps,
  reference: string
): Promise<PaystackTransaction> {
  return call(
    deps,
    `/transaction/verify/${encodeURIComponent(reference)}`,
    PaystackTransaction
  )
}

/**
 * Webhook authenticity: `x-paystack-signature` is the hex HMAC-SHA512 of the
 * raw request body keyed with the secret key. Compared in constant time.
 */
export async function verifySignature(
  rawBody: string,
  signature: string | null,
  secretKey: string
): Promise<boolean> {
  if (!signature) return false
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secretKey),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  )
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody)
  )
  const expected = [...new Uint8Array(mac)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
  const given = signature.trim().toLowerCase()
  if (given.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ given.charCodeAt(i)
  }
  return diff === 0
}
