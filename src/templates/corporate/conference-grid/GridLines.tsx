import { useId } from "react"
import { cn } from "@/lib/utils"

/**
 * Conference Grid's signature: graph paper. Hairlines every 32px in the line
 * token, with a slightly stronger primary rule every fourth cell. Pure SVG,
 * so it renders on the server; the pattern id comes from useId.
 */
export function GridLines({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "")
  return (
    <svg
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full", className)}
    >
      <defs>
        <pattern
          id={`${id}-minor`}
          width="32"
          height="32"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M32 0H0V32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-inv-line"
          />
        </pattern>
        <pattern
          id={`${id}-major`}
          width="128"
          height="128"
          patternUnits="userSpaceOnUse"
        >
          <rect width="128" height="128" fill={`url(#${id}-minor)`} />
          <path
            d="M128 0H0V128"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            className="text-inv-primary opacity-25"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id}-major)`} />
    </svg>
  )
}
