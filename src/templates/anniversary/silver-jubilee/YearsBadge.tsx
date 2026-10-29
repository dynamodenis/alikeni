import { cn } from "@/lib/utils"

/**
 * Silver Jubilee's signature: the years in a thin double ring with "years"
 * set small beneath. Pure SVG + CSS, tokens only.
 */
export function YearsBadge({
  years,
  className,
}: {
  years: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative grid size-36 place-items-center text-inv-primary sm:size-40",
        className
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        className="absolute inset-0"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="50" cy="50" r="48" strokeWidth="0.6" />
        <circle cx="50" cy="50" r="44" strokeWidth="0.3" />
      </svg>
      <p className="relative flex flex-col items-center">
        <span className="font-inv-display text-5xl leading-none sm:text-6xl">
          {years}
        </span>
        <span className="mt-1 text-[0.6rem] tracking-[0.4em] text-inv-muted uppercase">
          years
        </span>
      </p>
    </div>
  )
}
