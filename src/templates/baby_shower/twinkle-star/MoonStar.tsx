import { cn } from "@/lib/utils"

/**
 * Twinkle Star's signature: a crescent moon with a small star hanging from a
 * thread beside it. Pure SVG in the primary token, so it renders on the
 * server; the star twinkles via CSS (switched off by the motion level).
 */
export function MoonStar({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className={cn("size-24 text-inv-primary", className)}
    >
      <path
        d="M52 18 A34 34 0 1 0 86 66 A26 26 0 0 1 52 18 Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <line
        x1="76"
        y1="0"
        x2="76"
        y2="30"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="1.5 1.5"
      />
      <path
        className="inv-anim-twinkle [--d:3.2s]"
        d="M76 30 L78.4 35.6 L84.4 36.1 L79.8 40 L81.3 45.9 L76 42.7 L70.7 45.9 L72.2 40 L67.6 36.1 L73.6 35.6 Z"
        fill="currentColor"
      />
      <circle cx="24" cy="20" r="1.2" fill="currentColor" opacity="0.7" />
      <circle cx="14" cy="44" r="0.9" fill="currentColor" opacity="0.5" />
    </svg>
  )
}
