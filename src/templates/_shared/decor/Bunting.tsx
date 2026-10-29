import { cn } from "@/lib/utils"
import { seeded } from "./random"

/**
 * A string of pennant flags hanging across the top of a band, alternating
 * primary / accent / secondary with a sagging thread. Pure SVG.
 */
export function Bunting({
  flags = 11,
  seed = 5,
  className,
}: {
  flags?: number
  seed?: number
  className?: string
}) {
  const rand = seeded(seed)
  const tones = ["text-inv-primary", "text-inv-accent", "text-inv-secondary"]
  const step = 100 / flags
  const sag = (x: number) => 6 + Math.sin((x / 100) * Math.PI) * 10
  const items = Array.from({ length: flags }, (_, i) => {
    const x = step * i + step / 2
    const y = sag(x)
    return {
      i,
      tone: tones[(i + Math.floor(rand() * 2)) % tones.length],
      d: `M${(x - step * 0.42).toFixed(2)} ${y.toFixed(2)} L${(x + step * 0.42).toFixed(2)} ${y.toFixed(2)} L${x.toFixed(2)} ${(y + 11).toFixed(2)}Z`,
    }
  })
  const thread = Array.from({ length: 21 }, (_, i) => {
    const x = i * 5
    return `${x},${sag(x).toFixed(2)}`
  }).join(" L")
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      className={cn("pointer-events-none block h-16 w-full", className)}
    >
      <path
        d={`M${thread}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.3"
        className="text-inv-fg"
        opacity="0.5"
        vectorEffect="non-scaling-stroke"
      />
      {items.map((f) => (
        <path key={f.i} d={f.d} fill="currentColor" className={f.tone} />
      ))}
    </svg>
  )
}
