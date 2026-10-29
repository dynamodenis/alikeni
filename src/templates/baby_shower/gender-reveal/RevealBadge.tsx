import { cn } from "@/lib/utils"

/**
 * Gender Reveal's signature: a disc split down the middle into primary
 * (pink) and accent (blue) halves with a big "?" in the display face.
 * Pure CSS, tokens only.
 */
export function RevealBadge({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "@container relative grid aspect-square place-items-center overflow-hidden rounded-full border-4 border-inv-surface shadow-[0_18px_40px_-14px_var(--inv-primary)]",
        className
      )}
    >
      <div className="absolute inset-y-0 left-0 w-1/2 bg-inv-primary" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-inv-accent" />
      <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-inv-surface" />
      <span className="relative font-inv-display text-[60cqw] leading-none font-extrabold text-inv-surface">
        ?
      </span>
    </div>
  )
}
