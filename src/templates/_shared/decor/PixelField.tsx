import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { clearMask, type DecorClear } from "./mask"
import { seeded } from "./random"

/**
 * Seeded 8-bit scatter: square pixel blocks in primary and accent, some
 * grouped into small 2×2 clusters, twinkling at motion "full". Pure SVG, so
 * it renders on the server and stays put without JS.
 */
export function PixelField({
  count = 60,
  seed = 29,
  clear = "center",
  className,
}: {
  count?: number
  seed?: number
  clear?: DecorClear
  className?: string
}) {
  const rand = seeded(seed)
  const blocks = Array.from({ length: count }, (_, i) => {
    const size = rand() > 0.75 ? 3 : 1.6
    return {
      i,
      x: Math.round(rand() * 48) * 2,
      y: Math.round(rand() * 48) * 2,
      size,
      accent: rand() > 0.65,
      style: {
        "--o": (0.3 + rand() * 0.6).toFixed(2),
        "--d": `${(2 + rand() * 4).toFixed(1)}s`,
        "--delay": `${(-rand() * 4).toFixed(1)}s`,
      } as CSSProperties,
    }
  })
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn("absolute inset-0 h-full w-full", className)}
      style={clearMask(clear)}
      shapeRendering="crispEdges"
    >
      {blocks.map((b) => (
        <rect
          key={b.i}
          x={b.x}
          y={b.y}
          width={b.size}
          height={b.size}
          fill="currentColor"
          className={cn(
            "inv-anim-twinkle",
            b.accent ? "text-inv-accent" : "text-inv-primary"
          )}
          style={b.style}
        />
      ))}
    </svg>
  )
}
