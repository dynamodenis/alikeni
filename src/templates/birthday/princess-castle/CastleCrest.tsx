import { cn } from "@/lib/utils"

/**
 * Princess Castle's signature: a three-turret castle with pointed roofs,
 * flags, a crown floating above the keep and a sparkle on each side. Pure
 * SVG in tokens; the crown twinkles at motion "full".
 */
export function CastleCrest({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 120 120"
      className={cn("size-28 text-inv-primary", className)}
    >
      <g className="fill-inv-surface stroke-inv-primary" strokeWidth="2.5">
        <rect x="14" y="60" width="24" height="52" />
        <rect x="82" y="60" width="24" height="52" />
        <rect x="42" y="70" width="36" height="42" />
        <rect
          x="36"
          y="88"
          width="48"
          height="24"
          className="fill-inv-primary"
        />
      </g>
      <g className="fill-inv-primary">
        <path d="M12 60l14-22 14 22Z" />
        <path d="M80 60l14-22 14 22Z" />
        <path d="M40 72l20-28 20 28Z" />
        <rect x="25" y="26" width="2" height="14" />
        <rect x="93" y="26" width="2" height="14" />
        <rect x="59" y="32" width="2" height="14" />
      </g>
      <g className="fill-inv-accent">
        <path d="M27 26l8 3-8 3Z" />
        <path d="M95 26l8 3-8 3Z" />
        <path d="M61 32l9 3-9 3Z" />
      </g>
      <path
        d="M51 112v-14a9 9 0 0 1 18 0v14Z"
        className="fill-inv-bg stroke-inv-primary"
        strokeWidth="2"
      />
      <g className="fill-inv-bg">
        <rect x="21" y="78" width="4" height="7" />
        <rect x="27" y="78" width="4" height="7" />
        <rect x="89" y="78" width="4" height="7" />
        <rect x="95" y="78" width="4" height="7" />
      </g>
      <path
        d="M48 24l5 7 7-13 7 13 5-7v10H48Z"
        className="inv-anim-twinkle fill-inv-accent stroke-inv-primary [--d:3.5s] [--o:1]"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8 14l1.6 4.4L14 20l-4.4 1.6L8 26l-1.6-4.4L2 20l4.4-1.6ZM112 8l1.6 4.4L118 14l-4.4 1.6L112 20l-1.6-4.4L106 14l4.4-1.6Z"
        className="inv-anim-twinkle fill-inv-accent [--d:4s] [--delay:-1.5s] [--o:0.9]"
      />
    </svg>
  )
}
