import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

/**
 * A strip of 35 mm film: sprocket holes along both edges and dark frames
 * between them. Children (photos, text) sit inside the frames. Pure SVG and
 * CSS; the strip is decorative and content stays readable without it.
 */
export function FilmStrip({
  frames = 3,
  className,
  children,
}: {
  frames?: number
  className?: string
  children?: ReactNode
}) {
  const holes = Array.from({ length: frames * 4 }, (_, i) => i)
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-inv-fg text-inv-bg",
        className
      )}
    >
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${frames * 100} 14`}
        preserveAspectRatio="none"
        className="block h-4 w-full"
      >
        {holes.map((h) => (
          <rect
            key={h}
            x={h * 25 + 8}
            y="4"
            width="10"
            height="6"
            rx="1"
            fill="currentColor"
            opacity="0.85"
          />
        ))}
      </svg>
      <div
        className="grid gap-2 px-3"
        style={{ gridTemplateColumns: `repeat(${frames}, minmax(0, 1fr))` }}
      >
        {children}
      </div>
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${frames * 100} 14`}
        preserveAspectRatio="none"
        className="block h-4 w-full"
      >
        {holes.map((h) => (
          <rect
            key={h}
            x={h * 25 + 8}
            y="4"
            width="10"
            height="6"
            rx="1"
            fill="currentColor"
            opacity="0.85"
          />
        ))}
      </svg>
    </div>
  )
}
