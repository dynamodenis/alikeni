import { cn } from "@/lib/utils"

/**
 * Class Reunion's signature: a ribbon banner with notched (swallowtail) ends,
 * cut with clip-path, the label set in the display face. Primary ribbon on
 * background-colored type; two darker tabs sit behind for a folded look.
 */
export function YearsRibbon({
  label,
  className,
}: {
  label: string
  className?: string
}) {
  const notch =
    "polygon(0 0, 100% 0, calc(100% - 0.9rem) 50%, 100% 100%, 0 100%, 0.9rem 50%)"
  return (
    <div
      className={cn("relative inline-flex items-center px-6 py-1", className)}
    >
      <span
        aria-hidden="true"
        className="absolute top-2 -left-1 h-full w-12 bg-inv-primary opacity-60"
        style={{ clipPath: notch }}
      />
      <span
        aria-hidden="true"
        className="absolute top-2 -right-1 h-full w-12 bg-inv-primary opacity-60"
        style={{ clipPath: notch }}
      />
      <span
        className="relative bg-inv-primary px-10 py-2 font-inv-display text-2xl tracking-[0.2em] text-inv-bg uppercase sm:text-3xl"
        style={{ clipPath: notch }}
      >
        {label}
      </span>
    </div>
  )
}
