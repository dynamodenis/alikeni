// Server function behind the landing page's contact form.
import { createServerFn } from "@tanstack/react-start"
import { getRequestHeaders } from "@tanstack/react-start/server"
import { sendEmail } from "@/server/email/send.server"
import { fingerprint } from "@/server/public/fingerprint.server"
import { getRateLimiter } from "@/server/rate-limit/limiter.server"
import { ContactSubmission, submitContact } from "./contact.server"

export const submitContactFn = createServerFn({ method: "POST" })
  .validator((input: ContactSubmission) => {
    const result = ContactSubmission.safeParse(input)
    if (!result.success) {
      throw new Error("Please check your name, email and message.")
    }
    return input
  })
  .handler(async ({ data }) => {
    try {
      const { ipHash } = await fingerprint(new Headers(getRequestHeaders()))
      return await submitContact(data, {
        send: sendEmail,
        limiter: getRateLimiter(),
        ipHash,
      })
    } catch (error) {
      console.error(
        `[contact] failed: ${error instanceof Error ? error.message : String(error)}`
      )
      throw new Error("We could not send your message. Please try again.")
    }
  })
