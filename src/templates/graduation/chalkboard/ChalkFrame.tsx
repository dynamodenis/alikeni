import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import { seeded } from "../../_shared/decor"

const STAR =
  "M12 2l2.9 6.6L22 9.4l-5.4 4.8L18.2 22 12 18.3 5.8 22l1.6-7.8L2 9.4l7.1-.8Z"
const ARROW = "M3 20C8 9 13 5 21 6m-4-3l4 3-4 4"
const UNDERLINE = "M34 93c6-1.6 12 1.4 18 0s9-2 14 .4"
const stroke = { vectorEffect: "non-scaling-stroke" } as const
/** Inherited SVG paint, set once on the wrapper for every path below. */
const chalk: CSSProperties = {
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
}

/**
 * Chalkboard's signature: a hand-drawn chalk border (dashed, with wobbly
 * corners) plus seeded doodles along the edges: stars, one arrow and a
 * "class of" underline squiggle near the bottom. Pure SVG in the chalk
 * (primary) color, seeded so server and client agree; grain adds the dust.
 */
export function ChalkFrame(props: { seed?: number; className?: string }) {
  const { seed = 1, className } = props
  const rand = seeded(seed)
  const pt = (x: number, y: number) =>
    `${(x + rand() * 1.6 - 0.8).toFixed(1)} ${(y + rand() * 1.6 - 0.8).toFixed(1)}`
  const border = `M${pt(3, 3)} L${pt(97, 3)} L${pt(97, 97)} L${pt(3, 97)} Z`
  const doodles = Array.from({ length: 6 }, (_, i) => ({
    arrow: i === 5,
    style: {
      left: `${(i % 2 === 0 ? 5 + rand() * 10 : 82 + rand() * 9).toFixed(1)}%`,
      top: `${(8 + rand() * 62).toFixed(1)}%`,
      transform: `rotate(${Math.round(rand() * 50 - 25)}deg) scale(${(0.7 + rand() * 0.6).toFixed(2)})`,
      "--d": `${(3 + rand() * 3).toFixed(1)}s`,
      "--delay": `${(-rand() * 4).toFixed(1)}s`,
    } as CSSProperties,
  }))
  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 text-inv-primary",
        className
      )}
      style={chalk}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <path
          d={border}
          strokeWidth="2"
          strokeDasharray="14 7 3 7"
          {...stroke}
        />
        <path d={UNDERLINE} strokeWidth="2.5" opacity="0.8" {...stroke} />
      </svg>
      {doodles.map((d, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`absolute size-7 sm:size-9 ${d.arrow ? "" : "inv-anim-twinkle"}`}
          style={d.style}
          strokeWidth={d.arrow ? 1.8 : 1.5}
          opacity="0.85"
        >
          <path d={d.arrow ? ARROW : STAR} />
        </svg>
      ))}
    </div>
  )
}
