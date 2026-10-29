import { cn } from "@/lib/utils"

/**
 * Eid Open House's signature: a crescent moon with a lantern hanging from its
 * lower tip on a thin chain. The moon is primary, the lantern glass accent.
 * Pure SVG; the lantern sways gently (CSS float, off at reduced motion).
 */
export function Crescent({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      className={cn("size-24 text-inv-primary", className)}
    >
      <path
        d="M50 15A30 30 0 1 0 75 60A26 26 0 0 0 50 15Z"
        fill="currentColor"
      />
      <circle cx="70" cy="24" r="1.4" fill="currentColor" />
      <path
        d="M80 30l1.2 2.6 2.8.3-2.1 1.9.6 2.8-2.5-1.4-2.5 1.4.6-2.8-2.1-1.9 2.8-.3Z"
        fill="currentColor"
      />
      <g className="inv-anim-float [--d:6s]">
        <g transform="translate(5 2)">
          <path
            d="M70 58v12"
            stroke="currentColor"
            strokeWidth="0.9"
            strokeDasharray="1.6 1.2"
          />
          <path d="M66 70h8l-1.5 3h-5Z" fill="currentColor" />
          <path
            d="M65.5 73h9l1.5 4v9l-1.5 3h-9l-1.5-3v-9Z"
            stroke="currentColor"
            strokeWidth="1.2"
          />
          <path
            d="M67 76h6v10h-6Z"
            className="text-inv-accent"
            fill="currentColor"
            opacity="0.8"
          />
          <path d="M70 76v10" stroke="currentColor" strokeWidth="0.8" />
          <path d="M67 89h6l-1 2.5h-4Z" fill="currentColor" />
        </g>
      </g>
    </svg>
  )
}
