import { cn } from "@/lib/utils"

/**
 * The Alikeni loader: the "A" mark pulsing inside a gold ring with one arc
 * turning. Used wherever a page or a preview is loading. Small "busy" icons
 * inside buttons stay the plain spinner (`LoaderCircle`): the mark is not
 * readable at 16 px.
 *
 * Reduced motion: the arc turns slowly and the mark stops pulsing.
 */
export function BrandLoader({
  className,
  label = "Loading",
}: {
  /** Size and spacing; defaults to 4rem square. */
  className?: string
  /** Read by screen readers. Pass "" when a visible label sits next to it. */
  label?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      role={label ? "img" : undefined}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={cn("size-16 shrink-0", className)}
    >
      <circle cx="256" cy="256" r="256" className="fill-ink" />
      <circle
        cx="256"
        cy="256"
        r="226"
        fill="none"
        strokeWidth="10"
        className="stroke-gold/25"
      />
      <circle
        cx="256"
        cy="256"
        r="226"
        fill="none"
        strokeWidth="10"
        strokeLinecap="round"
        strokeDasharray="355 1065"
        style={{ transformOrigin: "256px 256px" }}
        className="animate-spin stroke-gold [animation-duration:1.4s] motion-reduce:[animation-duration:4s]"
      />
      <path
        transform="translate(-99.17 -147.57) scale(0.9509)"
        className="animate-pulse fill-gold [animation-duration:1.4s] motion-reduce:animate-none"
        d="M430 327L306 502.2Q291.2 523 288.2 535.4Q285.2 547.8 292.8 553.2Q300.4 558.6 316.8 559L316.8 559L314.8 567Q303.6 566.2 291.6 566Q279.6 565.8 269.2 565.8L269.2 565.8Q259.2 565.8 252.4 566Q245.6 566.2 239.2 567L239.2 567L241.2 559Q246.8 557.8 252.8 554Q258.8 550.2 266 543Q273.2 535.8 281.2 524.2L281.2 524.2L453.6 281.8Q455.2 281.8 456.6 281.8Q458 281.8 459.6 281.8L459.6 281.8L475.6 533.4Q476.8 547.8 483 553.2Q489.2 558.6 495.2 559L495.2 559L493.6 567Q485.6 566.2 473.6 566Q461.6 565.8 450 565.8L450 565.8Q435.6 565.8 422.8 566Q410 566.2 402 567L402 567L403.6 559Q422.8 558.2 430.8 552Q438.8 545.8 438 525.4L438 525.4L427.2 327.8L430 327ZM330.8 459.8L338 451.8L454.8 451.8L451.6 459.8L330.8 459.8Z"
      />
    </svg>
  )
}

/**
 * The loader centred in a page's content area. It goes **inside** the page
 * shell, so the header and footer stay where they are while content loads.
 */
export function ContentLoader({ className }: { className?: string }) {
  return (
    <div
      role="status"
      className={cn("grid min-h-[50svh] place-items-center", className)}
    >
      <BrandLoader />
    </div>
  )
}

/** The loader alone on the brand background, for pages with no shell. */
export function FullPageLoader() {
  return (
    <div
      role="status"
      className="theme-alikeni grid min-h-svh place-items-center bg-ink"
    >
      <BrandLoader />
    </div>
  )
}
