import { cn } from "@/lib/utils"

/**
 * Garden Tea Party's signature: a teacup on its saucer with two curls of
 * steam that float at motion "full" (CSS, switched off by `data-motion`).
 * Pure SVG in the primary token, so it renders on the server.
 */
export function Teacup({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-24 text-inv-primary", className)}
    >
      <g className="inv-anim-float origin-center [--d:5s] [transform-box:fill-box]">
        <path d="M40 30c-5-5 5-9 0-14-4-4 1-7 2-10" opacity="0.7" />
      </g>
      <g className="inv-anim-float origin-center [--d:6.5s] [--delay:-2.5s] [transform-box:fill-box]">
        <path d="M57 32c-5-5 5-9 0-14-4-4 1-7 2-10" opacity="0.55" />
      </g>
      <path
        d="M22 42h52v10c0 14-11 24-26 24S22 66 22 52Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M74 47h5a8 8 0 0 1 0 16h-6" />
      <path d="M29 50c6 3 32 3 38 0" opacity="0.5" />
      <path d="M14 81c8 6 64 6 72 0" />
      <path d="M26 85c6 3 42 3 48 0" opacity="0.6" />
    </svg>
  )
}
