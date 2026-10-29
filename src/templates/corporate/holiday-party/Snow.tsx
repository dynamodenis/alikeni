import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { clearMask, seeded, type DecorClear } from "../../_shared/decor"

/**
 * Holiday Party's signature: seeded snowflakes. Round, larger cousins of the
 * StarField dots in the foreground token at 30–60% opacity that float at
 * motion "full". Pure SVG + CSS, so it renders on the server.
 */
export function Snow({
  count = 48,
  seed = 13,
  clear = "center",
  className,
}: {
  count?: number
  seed?: number
  clear?: DecorClear
  className?: string
}) {
  const rand = seeded(seed)
  const flakes = Array.from({ length: count }, (_, i) => ({
    i,
    cx: rand() * 100,
    cy: rand() * 100,
    r: 0.35 + rand() * 0.75,
    opacity: (0.3 + rand() * 0.3).toFixed(2),
    style: {
      "--d": `${(6 + rand() * 6).toFixed(1)}s`,
      "--delay": `${(-rand() * 6).toFixed(1)}s`,
    } as CSSProperties,
  }))
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 h-full w-full text-inv-fg", className)}
      style={clearMask(clear)}
    >
      {flakes.map((f) => (
        <circle
          key={f.i}
          cx={f.cx}
          cy={f.cy}
          r={f.r}
          fill="currentColor"
          opacity={f.opacity}
          className="inv-anim-float"
          style={f.style}
        />
      ))}
    </svg>
  )
}
