import { cn } from "@/lib/utils"

/**
 * Team Offsite's signature: a map pin standing above a dashed trail that
 * winds down toward the viewer. Pure SVG in the primary token.
 */
export function TrailBadge({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 80"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("text-inv-primary", className)}
    >
      <circle cx="40" cy="40" r="38" strokeWidth="1" opacity="0.5" />
      <path
        d="M40 42S28 30.5 28 23a12 12 0 0 1 24 0c0 7.5-12 19-12 19Z"
        strokeWidth="2"
      />
      <circle cx="40" cy="23" r="4" fill="currentColor" stroke="none" />
      <path
        d="M40 46c8 2 12 5 6 8s-18 4-12 8 14 3 10 8"
        strokeWidth="2"
        strokeDasharray="3 4"
      />
    </svg>
  )
}
