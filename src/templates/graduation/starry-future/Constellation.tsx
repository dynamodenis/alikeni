import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { seeded } from "../../_shared/decor"

/**
 * Starry Future's signature: a small constellation. Seeded points are joined
 * left to right by hairlines; each star twinkles on its own phase (CSS, so
 * motion "none" leaves it still). Pure SVG, tokens only, renders on the server.
 */
export function Constellation({
  seed = 7,
  points = 7,
  className,
}: {
  seed?: number
  points?: number
  className?: string
}) {
  const rand = seeded(seed)
  const stars = Array.from({ length: points }, (_, i) => ({
    i,
    x: 12 + rand() * 76,
    y: 12 + rand() * 76,
    r: 1.4 + rand() * 1.8,
    style: {
      "--o": (0.7 + rand() * 0.3).toFixed(2),
      "--d": `${(2.5 + rand() * 3).toFixed(1)}s`,
      "--delay": `${(-rand() * 4).toFixed(1)}s`,
    } as CSSProperties,
  })).sort((a, b) => a.x - b.x)
  const dust = Array.from({ length: 14 }, (_, i) => ({
    i,
    x: rand() * 100,
    y: rand() * 100,
    r: 0.3 + rand() * 0.4,
  }))
  const path = stars.map((s) => `${s.x.toFixed(1)},${s.y.toFixed(1)}`).join(" ")

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={cn("size-28 text-inv-primary", className)}
    >
      {dust.map((d) => (
        <circle
          key={`d${d.i}`}
          cx={d.x}
          cy={d.y}
          r={d.r}
          fill="currentColor"
          opacity="0.45"
        />
      ))}
      <polyline
        points={path}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinejoin="round"
        opacity="0.7"
      />
      {stars.map((s) => (
        <g key={s.i} className="inv-anim-twinkle" style={s.style}>
          <circle
            cx={s.x}
            cy={s.y}
            r={s.r * 2.6}
            fill="currentColor"
            opacity="0.15"
          />
          <circle cx={s.x} cy={s.y} r={s.r} fill="currentColor" />
        </g>
      ))}
    </svg>
  )
}
