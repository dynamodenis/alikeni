import { cn } from "@/lib/utils"
import { clearMask, type DecorClear } from "./mask"

const star =
  "M20 2l4.2 7.6L32 6l-3.6 7.8L36 18l-7.6 4.2L32 30l-7.8-3.6L20 34l-4.2-7.6L8 30l3.6-7.8L4 18l7.6-4.2L8 6l7.8 3.6Z"

/**
 * Eight-point star lattice in the primary color: a repeating SVG pattern
 * with a hairline connecting grid, in the spirit of Islamic girih tiling.
 * Pure SVG, so it renders on the server; `density` is the tile size.
 */
export function GeoLattice({
  density = 72,
  clear = "center",
  className,
}: {
  density?: number
  clear?: DecorClear
  className?: string
}) {
  const id = `geo-${density}`
  return (
    <svg
      aria-hidden="true"
      className={cn(
        "absolute inset-0 h-full w-full text-inv-primary",
        className
      )}
      style={clearMask(clear)}
    >
      <defs>
        <pattern
          id={id}
          width={density}
          height={density}
          patternUnits="userSpaceOnUse"
          viewBox="0 0 40 40"
        >
          <path
            d={star}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.7"
            opacity="0.9"
          />
          <path
            d="M20 0v6M20 34v6M0 20h6M34 20h6M0 0l6 6M40 0l-6 6M0 40l6-6M40 40l-6-6"
            stroke="currentColor"
            strokeWidth="0.5"
            opacity="0.6"
          />
          <circle
            cx="20"
            cy="20"
            r="3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
