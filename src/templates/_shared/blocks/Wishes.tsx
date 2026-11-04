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
  eyebrow,
  title,
  tone,
  className,
}: WishesProps) {
  const { mode, actions, wishes, guestName, t } = useInvitation()
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
      toast(t.common.previewMode, { description: t.wishes.previewToast })
      return
    }
    if (turnstile.enabled && !turnstile.token) {
      toast(t.common.oneMoment, { description: t.common.robotCheck })
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
      toast(t.wishes.thanksToast)
    } catch (error) {
      // Roll back; the form still holds the text so the guest can retry.
      setLocal((prev) => prev.filter((w) => w.id !== pending.id))
      toast.error(t.wishes.errorToast, {
        description: error instanceof Error ? error.message : t.common.tryAgain,
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
      eyebrow={eyebrow ?? t.wishes.eyebrow}
      title={title ?? t.wishes.title}
      width="narrow"
      className={className}
    >
      <form onSubmit={handleSubmit} className="relative flex flex-col gap-4">
        <label htmlFor="wish-name" className="sr-only">
          {t.wishes.name}
        </label>
        <input
          id="wish-name"
          name="name"
          required
          maxLength={80}
          placeholder={t.wishes.name}
          defaultValue={guestName ?? ""}
          className={inputClass}
        />
        <label htmlFor="wish-message" className="sr-only">
          {t.wishes.message}
        </label>
        <textarea
          id="wish-message"
          name="message"
          required
          rows={3}
          maxLength={500}
          placeholder={t.wishes.placeholder}
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
          {sending ? t.common.sending : t.wishes.send}
        </InvButton>
        {disabled && (
          <p className="text-center text-xs text-inv-muted">
            {t.wishes.previewNote}
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
                "flex gap-3 transition-opacity in-data-[motion=none]:transition-none motion-reduce:transition-none",
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
