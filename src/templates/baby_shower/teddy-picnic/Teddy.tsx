import { cn } from "@/lib/utils"

/**
 * Teddy Picnic's signature crest: a bear face with two round ears, a muzzle
 * and a stitched smile. Pure SVG in the primary token; renders on the server.
 */
export function Teddy({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      className={cn("size-20 text-inv-primary", className)}
    >
      <circle cx="24" cy="26" r="13" fill="currentColor" fillOpacity="0.18" />
      <circle cx="24" cy="26" r="6" fill="currentColor" fillOpacity="0.35" />
      <circle cx="76" cy="26" r="13" fill="currentColor" fillOpacity="0.18" />
      <circle cx="76" cy="26" r="6" fill="currentColor" fillOpacity="0.35" />
      <circle cx="50" cy="56" r="34" fill="currentColor" fillOpacity="0.12" />
      <circle cx="37" cy="48" r="3" fill="currentColor" stroke="none" />
      <circle cx="63" cy="48" r="3" fill="currentColor" stroke="none" />
      <ellipse
        cx="50"
        cy="67"
        rx="15"
        ry="12"
        fill="currentColor"
        fillOpacity="0.2"
      />
      <ellipse cx="50" cy="61" rx="5" ry="3.5" fill="currentColor" />
      <path d="M50 64.5 V70" />
      <path d="M42 71 Q50 78 58 71" strokeDasharray="2.2 2" />
    </svg>
  )
}
