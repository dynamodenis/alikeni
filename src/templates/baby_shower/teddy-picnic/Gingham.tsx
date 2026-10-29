import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

const check =
  "color-mix(in oklab, var(--inv-secondary) 70%, transparent) 0 12px, transparent 12px 24px"

const style: CSSProperties = {
  backgroundColor: "var(--inv-bg)",
  backgroundImage: `repeating-linear-gradient(0deg, ${check}), repeating-linear-gradient(90deg, ${check})`,
}

/**
 * Teddy Picnic's picnic blanket: a gingham strip woven from two crossing
 * `repeating-linear-gradient`s of the secondary token over the background.
 * Pure CSS, decorative only.
 */
export function Gingham({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      style={style}
      className={cn("h-10 w-full border-y border-inv-line", className)}
    />
  )
}
