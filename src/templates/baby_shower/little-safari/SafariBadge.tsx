import { cn } from "@/lib/utils"

/**
 * Little Safari's signature: a round nursery badge with a sun disc rising
 * over an acacia-tree silhouette on a horizon line. Pure SVG, tokens only.
 */
export function SafariBadge({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={cn("text-inv-primary", className)}
    >
      <circle cx="50" cy="50" r="47" className="fill-inv-surface" />
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle
        cx="50"
        cy="50"
        r="41"
        fill="none"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="2 3"
      />
      <circle
        cx="60"
        cy="48"
        r="15"
        className="text-inv-accent"
        fill="currentColor"
      />
      <path
        d="M14 68h72"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <g fill="currentColor">
        <path d="M40 68h3.4l-.6-15c3-2 6-5 8-8l-1.6-.8c-2 2.6-4.4 5-6.8 6.6-1.8-2.6-4.4-5-7.2-6.6l-1 1.4c2.8 1.8 5 4 6.4 6.6Z" />
        <path d="M20 41c4-5.5 13-7 23-6.4 10 .6 18 2.4 21 6.2-3 1.6-9 2.4-16 2.2-3 1.4-8 1.6-12 1-7 .4-13-.6-16-3Z" />
      </g>
      <path
        d="M24 76h18M54 76h22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}
