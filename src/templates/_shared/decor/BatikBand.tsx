import { cn } from "@/lib/utils"

/**
 * Horizontal batik border: a kawung (four-petal) row framed by parang
 * diagonals, drawn as a repeating SVG pattern in the primary color. Use at
 * the top and bottom of bands, or as a frame edge on the cover.
 */
export function BatikBand({
  className,
  flip = false,
}: {
  className?: string
  flip?: boolean
}) {
  const id = flip ? "batik-b" : "batik-a"
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 28"
      preserveAspectRatio="none"
      className={cn(
        "block h-7 w-full text-inv-primary",
        flip && "-scale-y-100",
        className
      )}
    >
      <defs>
        <pattern id={id} width="28" height="28" patternUnits="userSpaceOnUse">
          <path
            d="M14 2c4 0 6 4 6 8s-2 4-6 4-6 0-6-4 2-8 6-8Zm0 24c-4 0-6-4-6-8s2-4 6-4 6 0 6 4-2 8-6 8ZM2 14c0-4 4-6 8-6s4 2 4 6 0 6-4 6-8-2-8-6Zm24 0c0 4-4 6-8 6s-4-2-4-6 0-6 4-6 8 2 8 6Z"
            fill="currentColor"
            opacity="0.45"
          />
          <path
            d="M0 28 28 0M-4 10 10-4M18 32 32 18"
            stroke="currentColor"
            strokeWidth="0.8"
            opacity="0.5"
          />
          <circle cx="14" cy="14" r="2" fill="currentColor" opacity="0.8" />
        </pattern>
      </defs>
      <rect width="400" height="28" fill={`url(#${id})`} />
      <path d="M0 0.5h400M0 27.5h400" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}
