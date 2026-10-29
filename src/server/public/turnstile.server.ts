// Cloudflare Turnstile token check. Only used when TURNSTILE_SECRET_KEY is
// set; without it (development) every submission passes.
import { z } from "zod"

const SITEVERIFY = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

const SiteverifyResponse = z.object({ success: z.boolean() })

export async function verifyTurnstile(
  token: string | undefined,
  secret: string,
  fetchImpl: typeof fetch = fetch
): Promise<boolean> {
  if (!token) return false
  try {
    const body = new FormData()
    body.set("secret", secret)
    body.set("response", token)
    const response = await fetchImpl(SITEVERIFY, { method: "POST", body })
    if (!response.ok) return false
    const parsed = SiteverifyResponse.safeParse(await response.json())
    return parsed.success && parsed.data.success
  } catch (error) {
    console.error("[turnstile] verification failed", error)
    return false
  }
}

/** The check the public server functions use: Turnstile when configured. */
export function humanCheck(
  secret: string | undefined
): (token: string | undefined) => Promise<boolean> {
  if (!secret) return () => Promise.resolve(true)
  return (token) => verifyTurnstile(token, secret)
}
