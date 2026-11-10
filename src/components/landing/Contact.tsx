import { useState } from "react"
import { Mail } from "lucide-react"
import { brandButton } from "@/components/brand/ButtonLink"
import { CONTACT_EMAIL } from "@/lib/social"
import { submitContactFn } from "@/server/contact/contact.functions"
import { SectionHeading } from "./SectionHeading"
import { SocialLinks } from "./SocialLinks"

const fieldClass =
  "w-full rounded-xl border border-gold/20 bg-ink/60 px-3.5 py-2 text-sm text-cream placeholder:text-sand/60 transition-colors duration-300 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/40 focus-visible:outline-none"

type Status =
  { state: "idle" | "sending" | "sent" } | { state: "error"; message: string }

/**
 * Contact section: a short form that emails our inbox (the visitor's address
 * becomes the Reply-To), the address itself, and the social profiles.
 */
export function Contact() {
  const [status, setStatus] = useState<Status>({ state: "idle" })

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const field = (name: string) => String(data.get(name) ?? "")
    setStatus({ state: "sending" })
    try {
      const result = await submitContactFn({
        data: {
          name: field("name"),
          email: field("email"),
          subject: field("subject"),
          message: field("message"),
          website: field("website"),
        },
      })
      if (result.ok) {
        form.reset()
        setStatus({ state: "sent" })
      } else {
        const minutes = Math.max(1, Math.ceil(result.retryAfterSec / 60))
        setStatus({
          state: "error",
          message: `You have sent several messages. Please try again in about ${minutes} ${minutes === 1 ? "minute" : "minutes"}, or email us directly.`,
        })
      }
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error instanceof Error && error.message
            ? error.message
            : "We could not send your message. Please try again.",
      })
    }
  }

  const sending = status.state === "sending"

  return (
    <section id="contact" className="scroll-mt-24 px-4 py-28 sm:px-6">
      <SectionHeading
        eyebrow="Contact"
        title="Talk to"
        accent="us"
        description="A question, an idea or a problem with your invitation? Write to us and we will reply by email."
      />

      <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-[1.5fr_1fr]">
        <form
          onSubmit={onSubmit}
          className="rounded-3xl border border-gold/10 bg-umber/40 p-5 sm:p-6"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-name" className="label">
                Your name
              </label>
              <input
                id="contact-name"
                name="name"
                required
                maxLength={80}
                autoComplete="name"
                className={fieldClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="contact-email" className="label">
                Your email
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                required
                maxLength={120}
                autoComplete="email"
                className={fieldClass}
              />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="contact-subject" className="label">
              Subject
            </label>
            <input
              id="contact-subject"
              name="subject"
              required
              minLength={3}
              maxLength={120}
              className={fieldClass}
            />
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <label htmlFor="contact-message" className="label">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              minLength={10}
              maxLength={4000}
              rows={4}
              className={`${fieldClass} resize-y`}
            />
          </div>
          {/* Honeypot: off-screen and skipped by keyboards and screen readers. */}
          <div aria-hidden="true" className="absolute -left-[9999px] size-px">
            <label htmlFor="contact-website">Website</label>
            <input
              id="contact-website"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={sending}
              className={`${brandButton({ size: "md" })} disabled:pointer-events-none disabled:opacity-60`}
            >
              {sending ? "Sending…" : "Send message"}
            </button>
            <p aria-live="polite" className="min-w-0 flex-1 text-sm">
              {status.state === "sent" && (
                <span className="text-gold-soft">
                  Thank you. Your message is on its way; we will reply by email.
                </span>
              )}
              {status.state === "error" && (
                <span className="text-red-300">{status.message}</span>
              )}
            </p>
          </div>
        </form>

        <div className="flex flex-col gap-6 rounded-3xl border border-gold/10 bg-umber/40 p-5 sm:p-6">
          <div>
            <h3 className="label">Email</h3>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="mt-3 inline-flex items-center gap-2 text-sm text-cream transition-colors duration-300 hover:text-gold-soft"
            >
              <Mail className="size-4 text-gold" aria-hidden="true" />
              {CONTACT_EMAIL}
            </a>
          </div>
          <div>
            <h3 className="label">Follow Alikeni</h3>
            <SocialLinks className="mt-3" />
          </div>
        </div>
      </div>
    </section>
  )
}
