import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { clearMask, type DecorClear } from "./mask"
import { seeded } from "./random"

/**
 * Seeded fluffy clouds drifting across a band: three overlapping circles on
 * a flat base, in the secondary tint with a hairline edge. Pure SVG + CSS,
 * so it renders on the server and only floats at motion "full".
 */
export function CloudField({
  count = 9,
  seed = 19,
  clear = "center",
  className,
}: {
  count?: number
  seed?: number
  clear?: DecorClear
  className?: string
}) {
  const rand = seeded(seed)
  const clouds = Array.from({ length: count }, (_, i) => {
    const w = 90 + rand() * 120
    return {
      i,
      style: {
        left: `${(rand() * 100).toFixed(2)}%`,
        top: `${(rand() * 100).toFixed(2)}%`,
        width: w,
        height: w * 0.55,
        "--d": `${(9 + rand() * 8).toFixed(1)}s`,
        "--delay": `${(-rand() * 9).toFixed(1)}s`,
        opacity: 0.45 + rand() * 0.4,
      } as CSSProperties,
    }
  })
  return (
    <div
      aria-hidden="true"
      className={cn("absolute inset-0 overflow-hidden", className)}
      style={clearMask(clear)}
    >
      {clouds.map((c) => (
        <svg
          key={c.i}
          viewBox="0 0 100 55"
          className="inv-anim-float absolute -translate-x-1/2 -translate-y-1/2 text-inv-secondary"
          style={c.style}
        >
          <path
            d="M18 50a14 14 0 0 1-2-28 20 20 0 0 1 38-6 16 16 0 0 1 27 10 12 12 0 0 1-1 24Z"
            fill="currentColor"
            stroke="var(--inv-primary)"
            strokeOpacity="0.35"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
        </svg>
      ))}
    </div>
  )
}
