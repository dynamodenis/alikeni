// The contact form on the landing page: one email to our inbox per message,
// with the visitor's address as Reply-To. Nothing is stored. Abuse controls:
// a honeypot field and a rate limit per hashed IP.
import { z } from "zod"
import { CONTACT_EMAIL } from "@/lib/social"
import type { EmailSender } from "@/server/email/send.server"
import { contactEmail } from "@/server/email/templates.server"
import type { RateLimiter } from "@/server/rate-limit"

/** Trim and collapse spaces; keep line breaks (at most one blank line). */
const tidy = (value: string) =>
  value
    .replace(/\t/g, " ")
    // Control characters other than the line break.
    .replace(/[^\P{Cc}\n]/gu, "")
    .replace(/ +/g, " ")
    .replace(/ ?\n ?/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()

export const ContactSubmission = z.object({
  name: z
    .string()
    .max(200)
    .transform((value) => tidy(value).replace(/\n/g, " "))
    .pipe(z.string().min(1).max(80)),
  email: z.string().trim().max(120).pipe(z.email()),
  message: z
    .string()
    .max(8000)
    .transform(tidy)
    .pipe(z.string().min(10).max(4000)),
  /** Honeypot: hidden from people, so anything in it marks a bot. */
  website: z.string().max(500).optional().default(""),
})
export type ContactSubmission = z.input<typeof ContactSubmission>

/** 3 messages per 10 minutes and 10 per day from one address. */
export const CONTACT_RULES = [
  { limit: 3, windowSec: 600 },
  { limit: 10, windowSec: 86_400 },
] as const

export type ContactResult =
  { ok: true } | { ok: false; reason: "rate_limited"; retryAfterSec: number }

export async function submitContact(
  raw: ContactSubmission,
  deps: { send: EmailSender; limiter: RateLimiter; ipHash: string }
): Promise<ContactResult> {
  const input = ContactSubmission.parse(raw)
  const limit = await deps.limiter.hitAll([
    { key: `contact:ip:${deps.ipHash}`, rules: CONTACT_RULES },
  ])
  if (!limit.ok) {
    return {
      ok: false,
      reason: "rate_limited",
      retryAfterSec: limit.retryAfterSec,
    }
  }
  // Honeypot filled: look successful so the bot moves on; send nothing.
  if (input.website) return { ok: true }
  await deps.send(
    contactEmail({
      to: CONTACT_EMAIL,
      name: input.name,
      email: input.email,
      message: input.message,
    })
  )
  return { ok: true }
}
