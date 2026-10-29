import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { clearMask, type DecorClear } from "./mask"
import { seeded } from "./random"

/**
 * Seeded drift of petals (or leaves with `shape="leaf"`), scattered over a
 * band and floating slowly at motion "full". Pure SVG + CSS, so it renders on
 * the server and stays in place without JS or motion.
 */
export function PetalField({
  count = 28,
  seed = 17,
  shape = "petal",
  clear = "center",
  className,
}: {
  count?: number
  seed?: number
  shape?: "petal" | "leaf"
  clear?: DecorClear
  className?: string
}) {
  const rand = seeded(seed)
  const pieces = Array.from({ length: count }, (_, i) => {
    const size = 14 + rand() * 22
    return {
      i,
      tone: rand() > 0.5 ? "text-inv-primary" : "text-inv-accent",
      style: {
        left: `${(rand() * 100).toFixed(2)}%`,
        top: `${(rand() * 100).toFixed(2)}%`,
        width: size,
        height: size,
        transform: `rotate(${Math.round(rand() * 360)}deg)`,
        "--d": `${(6 + rand() * 7).toFixed(1)}s`,
        "--delay": `${(-rand() * 7).toFixed(1)}s`,
        opacity: 0.35 + rand() * 0.45,
      } as CSSProperties,
    }
  })
  const d =
    shape === "leaf"
      ? "M10 1C4 4 2 10 3 18c7-1 12-5 14-13-2-2-4-4-7-4Z M4 17 15 5"
      : "M10 2c4 2 7 7 7 11a7 7 0 0 1-14 0c0-4 3-9 7-11Z"
  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={clearMask(clear)}
    >
      {pieces.map((p) => (
        <svg
          key={p.i}
          viewBox="0 0 20 20"
          className={cn("inv-anim-float absolute", p.tone)}
          style={p.style}
        >
          <path
            d={d}
            fill="currentColor"
            fillOpacity={shape === "leaf" ? 0.9 : 1}
            stroke={shape === "leaf" ? "var(--inv-bg)" : "none"}
            strokeWidth={0.8}
          />
        </svg>
      ))}
    </div>
  )
}
