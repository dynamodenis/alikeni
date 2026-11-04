import { useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"
import { GuestRateLimitError, describeRateLimit } from "@/lib/guest-limit"
import { cn } from "@/lib/utils"
import { formatLongDate } from "@/lib/format-date"
import { useTurnstile } from "@/components/turnstile/useTurnstile"
import { useInvitation, type RsvpInput } from "../context"
import { Section, type BlockProps } from "./Section"
import { InvButton, inputClass } from "./ui"

export type RsvpVariant = "card" | "plain"

type RsvpFormProps = BlockProps & {
  variant?: RsvpVariant
}

const ATTENDING: ReadonlyArray<RsvpInput["attending"]> = ["yes", "no", "maybe"]

/**
 * Hidden honeypot field (`website`). People never see or reach it; bots that
 * fill every input do, and the server then pretends success without saving.
 */
export function HoneypotField({ id }: { id: string }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -left-[9999px] h-px w-px overflow-hidden opacity-0"
    >
      <label htmlFor={id}>Website</label>
      <input
        id={id}
        name="website"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        defaultValue=""
      />
    </div>
  )
}

/**
 * RSVP form. Submits through `actions.submitRsvp` from context (wired by the
 * public page in Phase 6). In preview, or without an action, it explains that
 * responses are disabled instead of pretending to send.
 */
export function RsvpForm({
  variant = "card",
  eyebrow,
  title,
  tone,
  className,
}: RsvpFormProps) {
  const { config, mode, actions, guestName, locale, t } = useInvitation()
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle")
  const [attending, setAttending] = useState<RsvpInput["attending"]>("yes")
  const { texts, datetime } = config
  const disabled = mode === "preview" || !actions.submitRsvp
  const turnstile = useTurnstile(!disabled)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled || !actions.submitRsvp) {
      toast(t.common.previewMode, { description: t.rsvp.previewToast })
      return
    }
    if (turnstile.enabled && !turnstile.token) {
      toast(t.common.oneMoment, { description: t.common.robotCheck })
      return
    }
    const form = new FormData(event.currentTarget)
    const input: RsvpInput = {
      guestName: String(form.get("guestName") ?? "").trim(),
      attending,
      partySize: attending === "no" ? 0 : Number(form.get("partySize") ?? 1),
      message: String(form.get("message") ?? "").trim() || undefined,
      contact: String(form.get("contact") ?? "").trim() || undefined,
      website: String(form.get("website") ?? ""),
      turnstileToken: turnstile.token,
    }
    setStatus("sending")
    try {
      await actions.submitRsvp(input)
      setStatus("sent")
      toast(t.rsvp.thanksToast, { description: t.rsvp.thanksToastBody })
    } catch (error) {
      setStatus("idle")
      if (error instanceof GuestRateLimitError) {
        toast.error(t.limits.title, {
          description: describeRateLimit(error.info, "rsvp", t, locale),
          duration: 10_000,
        })
      } else {
        toast.error(t.rsvp.errorToast, {
          description:
            error instanceof Error ? error.message : t.common.tryAgain,
        })
      }
    } finally {
      if (turnstile.enabled) turnstile.reset()
    }
  }

  return (
    <Section
      id="rsvp"
      tone={tone}
      eyebrow={eyebrow ?? t.rsvp.eyebrow}
      title={title ?? t.rsvp.title}
      intro={texts.rsvpPrompt}
      width="narrow"
      className={className}
    >
      {status === "sent" ? (
        <p className="text-center font-inv-display text-2xl text-inv-primary">
          {t.rsvp.sent}
        </p>
      ) : (
        <form
          onSubmit={handleSubmit}
          aria-describedby={disabled ? "rsvp-preview-note" : undefined}
          className={cn(
            "relative flex flex-col gap-5",
            variant === "card" &&
              "rounded-inv border border-inv-line bg-inv-surface p-6 sm:p-8"
          )}
        >
          <div className="flex flex-col gap-2">
            <label htmlFor="rsvp-name" className="text-sm font-medium">
              {t.rsvp.name}
            </label>
            <input
              id="rsvp-name"
              name="guestName"
              required
              maxLength={80}
              autoComplete="name"
              defaultValue={guestName ?? ""}
              className={inputClass}
            />
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-medium">
              {t.rsvp.attending}
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {ATTENDING.map((option) => (
                <label
                  key={option}
                  className={cn(
                    "flex cursor-pointer items-center justify-center rounded-inv border px-3 py-3 text-center text-sm transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-inv-primary has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-inv-bg",
                    attending === option
                      ? "border-inv-primary bg-inv-primary text-inv-bg"
                      : "border-inv-line hover:border-inv-primary/60"
                  )}
                >
                  <input
                    type="radio"
                    name="attending"
                    value={option}
                    checked={attending === option}
                    onChange={() => setAttending(option)}
                    className="sr-only"
                  />
                  {t.rsvp[option]}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <div
              className={cn(
                "flex flex-col gap-2",
                attending === "no" && "opacity-50"
              )}
            >
              <label htmlFor="rsvp-party" className="text-sm font-medium">
                {t.rsvp.partySize}
              </label>
              <input
                id="rsvp-party"
                name="partySize"
                type="number"
                min={1}
                max={20}
                defaultValue={1}
                disabled={attending === "no"}
                inputMode="numeric"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="rsvp-contact" className="text-sm font-medium">
                {t.rsvp.contact}{" "}
                <span className="text-inv-muted">{t.common.optional}</span>
              </label>
              <input
                id="rsvp-contact"
                name="contact"
                maxLength={120}
                className={inputClass}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="rsvp-message" className="text-sm font-medium">
              {t.rsvp.note}{" "}
              <span className="text-inv-muted">{t.common.optional}</span>
            </label>
            <textarea
              id="rsvp-message"
              name="message"
              rows={3}
              maxLength={500}
              className={inputClass}
            />
          </div>

          <HoneypotField id="rsvp-website" />
          {turnstile.widget}

          <InvButton
            type="submit"
            size="lg"
            disabled={status === "sending"}
            className="self-center"
          >
            {status === "sending" ? t.common.sending : t.rsvp.send}
          </InvButton>

          {texts.rsvpDeadline && (
            <p className="text-center text-xs text-inv-muted">
              {t.rsvp.replyBy(
                formatLongDate(texts.rsvpDeadline, datetime.timezone, locale)
              )}
            </p>
          )}
          {disabled && (
            <p
              id="rsvp-preview-note"
              className="text-center text-xs text-inv-muted"
            >
              {t.rsvp.previewNote}
            </p>
          )}
        </form>
      )}
    </Section>
  )
}
