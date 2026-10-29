import { cn } from "@/lib/utils"

/**
 * Varsity's letterman cuff: three horizontal stripes (primary, accent,
 * primary) with hairline gaps, laid across the top or bottom of a band.
 * Pure CSS, tokens only; position it with `className`.
 */
export function VarsityStripes({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none flex flex-col gap-1", className)}
    >
      <span className="h-2.5 bg-inv-primary sm:h-3" />
      <span className="h-2.5 bg-inv-accent sm:h-3" />
      <span className="h-2.5 bg-inv-primary sm:h-3" />
    </div>
  )
}
