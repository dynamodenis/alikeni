import { useState } from "react"
import type { FormEvent } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useTurnstile } from "@/components/turnstile/useTurnstile"
import { useInvitation, type WishItem } from "../context"
import { Section, type BlockProps } from "./Section"
import { InvButton, inputClass } from "./ui"
import { initials } from "./hosts"
import { HoneypotField } from "./RsvpForm"

const PENDING = "pending-"

export type WishesVariant = "cards" | "stream"

type WishesProps = BlockProps & {
  variant?: WishesVariant
}

/**
 * Guest book: a short form plus the approved wishes passed in via context.
 * A new wish shows immediately (optimistic), is swapped for the saved one
 * when the server answers, and is removed again if sending fails.
 */
export function Wishes({
  variant = "cards",
  eyebrow = "Wishes",
  title = "Leave a message",
  tone,
  className,
}: WishesProps) {
  const { mode, actions, wishes, guestName } = useInvitation()
  const [local, setLocal] = useState<Array<WishItem>>([])
  const [sending, setSending] = useState(false)
  const disabled = mode === "preview" || !actions.submitWish
  const turnstile = useTurnstile(!disabled)
  // Loader revalidation may already include a wish we added locally.
  const localIds = new Set(local.map((w) => w.id))
  const all = [...local, ...wishes.filter((w) => !localIds.has(w.id))]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (disabled || !actions.submitWish) {
      toast("Preview mode", {
        description: "Wishes are disabled while previewing.",
      })
      return
    }
    if (turnstile.enabled && !turnstile.token) {
      toast("One moment", {
        description: "We are checking you are not a robot. Try again shortly.",
      })
      return
    }
    const formEl = event.currentTarget
    const form = new FormData(formEl)
    const name = String(form.get("name") ?? "").trim()
    const message = String(form.get("message") ?? "").trim()
    const pending: WishItem = {
      id: `${PENDING}${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name,
      message,
      createdAt: new Date().toISOString(),
    }
    setLocal((prev) => [pending, ...prev])
    setSending(true)
    try {
      const wish = await actions.submitWish({
        name,
        message,
        website: String(form.get("website") ?? ""),
        turnstileToken: turnstile.token,
      })
      setLocal((prev) => prev.map((w) => (w.id === pending.id ? wish : w)))
      formEl.reset()
      toast("Thank you for your wishes!")
    } catch (error) {
      // Roll back; the form still holds the text so the guest can retry.
      setLocal((prev) => prev.filter((w) => w.id !== pending.id))
      toast.error("Could not send your wish", {
        description:
          error instanceof Error ? error.message : "Please try again.",
      })
    } finally {
      setSending(false)
      if (turnstile.enabled) turnstile.reset()
    }
  }

  return (
    <Section
      id="wishes"
      tone={tone}
      eyebrow={eyebrow}
      title={title}
      width="narrow"
      className={className}
    >
      <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
        <label htmlFor="wish-name" className="sr-only">
          Your name
        </label>
        <input
          id="wish-name"
          name="name"
          required
          maxLength={80}
          placeholder="Your name"
          defaultValue={guestName ?? ""}
          className={inputClass}
        />
        <label htmlFor="wish-message" className="sr-only">
          Your message
        </label>
        <textarea
          id="wish-message"
          name="message"
          required
          rows={3}
          maxLength={500}
          placeholder="Write your wishes…"
          className={inputClass}
        />
        <HoneypotField id="wish-website" />
        {turnstile.widget}
        <InvButton
          type="submit"
          variant="outline"
          disabled={sending}
          className="self-end"
        >
          {sending ? "Sending…" : "Send wishes"}
        </InvButton>
        {disabled && (
          <p className="text-center text-xs text-inv-muted">
            Preview: wishes are not recorded.
          </p>
        )}
      </form>

      {all.length > 0 && (
        <ul
          className={cn(
            "mt-10 flex flex-col gap-4",
            variant === "cards" && "sm:grid sm:grid-cols-2"
          )}
        >
          {all.map((wish) => (
            <li
              key={wish.id}
              aria-busy={wish.id.startsWith(PENDING) || undefined}
              className={cn(
                "flex gap-3 transition-opacity",
                wish.id.startsWith(PENDING) && "opacity-60",
                variant === "cards" &&
                  "rounded-inv border border-inv-line bg-inv-surface p-4"
              )}
            >
              <span
                aria-hidden="true"
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-inv-secondary text-xs font-medium text-inv-primary"
              >
                {initials(wish.name)}
              </span>
              <div>
                <p className="text-sm font-medium">{wish.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-inv-muted">
                  {wish.message}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  )
}
