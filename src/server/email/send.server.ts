// Outgoing email. Resend when RESEND_API_KEY is set; otherwise (development
// only, env validation requires the key in production) the message is printed
// to the server log so links can be clicked from the terminal.
import { Resend } from "resend"
import { serverEnv, type ServerEnv } from "@/env.server"

export type Email = {
  to: string
  subject: string
  /** Plain text: always sent, and what the dev log prints. */
  text: string
  html: string
  /** Overrides EMAIL_REPLY_TO (contact form: the visitor's address). */
  replyTo?: string
}

export type EmailSender = (email: Email) => Promise<void>

/**
 * The provider's sending allowance is used up (Resend free plan: 100 a day,
 * 3,000 a month). Retrying before it resets cannot work, so batch jobs stop
 * at the first one instead of failing every remaining send.
 */
export class EmailQuotaError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "EmailQuotaError"
  }
}

const DEV_FROM = "Alikeni <onboarding@resend.dev>"

export function createEmailSender(env: ServerEnv): EmailSender {
  if (!env.RESEND_API_KEY) {
    return async (email) => {
      console.info(
        `\n[email] (not sent: RESEND_API_KEY is unset)\n  to: ${email.to}${email.replyTo ? `\n  reply-to: ${email.replyTo}` : ""}\n  subject: ${email.subject}\n\n${email.text}\n`
      )
    }
  }
  const resend = new Resend(env.RESEND_API_KEY)
  const from = env.EMAIL_FROM ?? DEV_FROM
  return async (email) => {
    const { replyTo, ...message } = email
    const { error } = await resend.emails.send({
      from,
      replyTo: replyTo ?? env.EMAIL_REPLY_TO,
      ...message,
    })
    if (!error) return
    const reason = `Email to ${email.to} failed: ${error.message}`
    // Resend: daily_quota_exceeded, monthly_quota_exceeded.
    throw /quota/i.test(error.name)
      ? new EmailQuotaError(reason)
      : new Error(reason)
  }
}

let sender: EmailSender | undefined
export const sendEmail: EmailSender = (email) =>
  (sender ??= createEmailSender(serverEnv))(email)
