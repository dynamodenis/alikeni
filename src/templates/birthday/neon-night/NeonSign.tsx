import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"

const glow: CSSProperties = {
  textShadow:
    "0 0 4px var(--inv-bg), 0 0 10px var(--inv-primary), 0 0 24px var(--inv-primary), 0 0 48px var(--inv-accent)",
}
const tube: CSSProperties = {
  boxShadow:
    "0 0 8px var(--inv-primary), inset 0 0 8px var(--inv-primary), 0 0 32px var(--inv-accent)",
}

/**
 * Neon Night's signature: text as a lit neon tube. The letters carry a
 * layered glow in the primary and accent colours, sit inside a glowing
 * rounded tube frame and flicker with the twinkle animation at motion
 * "full". CSS only, so it renders on the server in tokens.
 */
export function NeonSign({
  text,
  size = "lg",
  className,
}: {
  text: string
  size?: "lg" | "sm"
  className?: string
}) {
  const lg = size === "lg"
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-inv border-2 border-inv-primary bg-inv-bg/70",
        lg ? "px-8 py-4 sm:px-12 sm:py-5" : "px-5 py-2",
        className
      )}
      style={tube}
    >
      <span
        className={cn(
          "inv-anim-twinkle font-inv-display leading-none font-bold tracking-[0.12em] text-inv-fg uppercase [--d:3.2s] [--o:1]",
          lg ? "text-4xl sm:text-6xl" : "text-2xl"
        )}
        style={glow}
      >
        {text}
      </span>
    </div>
  )
}
