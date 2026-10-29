import { cn } from "@/lib/utils"

const GROOVES = [46, 42, 39, 36, 33, 30, 27, 24]

/**
 * Vinyl Love Song's signature: a record with concentric grooves and a label
 * carrying the years and "Side A". It spins slowly (CSS, gated by motion).
 * Pure SVG, tokens only; decorative, the years appear in text elsewhere.
 */
export function VinylRecord({
  years,
  className,
}: {
  years: number
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative rounded-full shadow-[0_24px_60px_-24px_var(--inv-primary)]",
        className
      )}
    >
      <svg viewBox="0 0 100 100" className="inv-anim-spin size-full [--d:12s]">
        <circle
          cx="50"
          cy="50"
          r="49"
          className="fill-inv-surface stroke-inv-line"
          strokeWidth="0.6"
        />
        {GROOVES.map((r) => (
          <circle
            key={r}
            cx="50"
            cy="50"
            r={r}
            fill="none"
            className="stroke-inv-muted"
            strokeOpacity="0.35"
            strokeWidth="0.25"
          />
        ))}
        <path
          d="M22 30 A34 34 0 0 1 40 17"
          fill="none"
          className="stroke-inv-primary"
          strokeOpacity="0.5"
          strokeWidth="0.8"
          strokeLinecap="round"
        />
        <circle cx="50" cy="50" r="18" className="fill-inv-primary" />
        <text
          x="50"
          y="47"
          textAnchor="middle"
          className="fill-inv-bg font-inv-display"
          fontSize="11"
          fontWeight="700"
        >
          {years}
        </text>
        <text
          x="50"
          y="60.5"
          textAnchor="middle"
          className="fill-inv-bg"
          fontSize="3.6"
          letterSpacing="1"
        >
          SIDE A
        </text>
        <circle cx="50" cy="51.5" r="1.2" className="fill-inv-bg" />
      </svg>
    </div>
  )
}
