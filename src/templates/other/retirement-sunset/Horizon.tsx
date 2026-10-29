import { cn } from "@/lib/utils"

/** Twelve soft rays fanned over the upper half, computed once at module load. */
const RAYS = Array.from({ length: 13 }, (_, i) => {
  const a = Math.PI + (i / 12) * Math.PI
  const long = i % 2 === 0
  return {
    x1: (50 + 28 * Math.cos(a)).toFixed(2),
    y1: (58 + 28 * Math.sin(a)).toFixed(2),
    x2: (50 + (long ? 44 : 38) * Math.cos(a)).toFixed(2),
    y2: (58 + (long ? 44 : 38) * Math.sin(a)).toFixed(2),
    w: long ? 1.4 : 0.8,
  }
})

/**
 * Retirement Sunset's signature: a career's golden hour. A half sun disc
 * sets on a horizon line under a fan of soft rays, with two fading lines of
 * water below. Pure SVG in the primary color.
 */
export function Horizon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      className={cn("size-24 text-inv-primary", className)}
    >
      <g stroke="currentColor" strokeLinecap="round" opacity="0.55">
        {RAYS.map((r, i) => (
          <line
            key={i}
            x1={r.x1}
            y1={r.y1}
            x2={r.x2}
            y2={r.y2}
            strokeWidth={r.w}
          />
        ))}
      </g>
      <path d="M26 58a24 24 0 0 1 48 0Z" fill="currentColor" />
      <path
        d="M14 62h72"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M26 69h48"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M38 76h24"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.35"
      />
    </svg>
  )
}
