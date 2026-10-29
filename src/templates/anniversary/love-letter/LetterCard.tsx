import { cn } from "@/lib/utils"
import type { Host } from "../../_shared/schema"

const LIMIT = 180

/**
 * Love Letter's signature: a handwritten note on ruled paper, tilted on the
 * table. Opens "Dearest …", quotes the invitation message in the display
 * face, counts the years and signs off with the couple's short names.
 */
export function LetterCard({
  hosts,
  message,
  years,
  className,
}: {
  hosts: ReadonlyArray<Host>
  message: string
  years: number
  className?: string
}) {
  const text =
    message.length > LIMIT ? `${message.slice(0, LIMIT).trimEnd()}…` : message
  const names = hosts
    .slice(0, 2)
    .map((h) => h.shortName ?? h.name)
    .join(" & ")

  return (
    <figure
      className={cn(
        "relative w-full max-w-md -rotate-[1.5deg] rounded-inv border border-inv-line bg-inv-surface bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_1.95rem,color-mix(in_oklab,var(--inv-primary)_14%,transparent)_2rem)] px-7 py-8 text-left shadow-[0_24px_50px_-28px_var(--inv-primary)] sm:px-10",
        className
      )}
    >
      <p className="font-inv-display text-3xl text-inv-primary">
        Dearest friends,
      </p>
      <blockquote className="mt-4 font-inv-display text-2xl leading-snug text-inv-fg">
        {text}
      </blockquote>
      <p className="mt-6 text-xs tracking-[0.3em] text-inv-muted uppercase">
        {years} years and counting
      </p>
      <figcaption className="mt-4 border-t border-inv-line pt-3 font-inv-display text-2xl text-inv-primary">
        With love, {names}
      </figcaption>
    </figure>
  )
}
