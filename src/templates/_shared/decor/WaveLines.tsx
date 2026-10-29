import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { seeded } from "./random"

/**
 * Layered horizon lines: a few seeded sine-ish curves stacked toward the
 * bottom of the band, like swell lines on water or dunes. Lines drift at
 * motion "full" (CSS float) and sit still otherwise.
 */
export function WaveLines({
  rows = 5,
  seed = 23,
  className,
}: {
  rows?: number
  seed?: number
  className?: string
}) {
  const rand = seeded(seed)
  const lines = Array.from({ length: rows }, (_, i) => {
    const y = 55 + (i / Math.max(rows - 1, 1)) * 40
    const amp = 2 + rand() * 4
    const phase = rand() * 100
    const points: Array<string> = []
    for (let x = -10; x <= 110; x += 5) {
      const yy = y + Math.sin((x + phase) / 12) * amp
      points.push(`${x},${yy.toFixed(2)}`)
    }
    return {
      i,
      d: `M${points.join(" L")}`,
      opacity: 0.25 + (i / rows) * 0.5,
      style: {
        "--d": `${(8 + rand() * 6).toFixed(1)}s`,
        "--delay": `${(-rand() * 6).toFixed(1)}s`,
      } as CSSProperties,
    }
  })
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={cn(
        "absolute inset-0 h-full w-full text-inv-primary",
        className
      )}
    >
      {lines.map((l) => (
        <path
          key={l.i}
          d={l.d}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.35"
          vectorEffect="non-scaling-stroke"
          opacity={l.opacity}
          className="inv-anim-float"
          style={l.style}
        />
      ))}
    </svg>
  )
}
