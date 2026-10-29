import { cn } from "@/lib/utils"

const FOOTPRINT =
  "M10 19c-4.5 0-7-2.6-7-6 0-3 3-5.5 7-5.5s7 2.5 7 5.5c0 3.4-2.5 6-7 6ZM3.5 7a1.8 2.6 0 1 0 3.6 0 1.8 2.6 0 1 0-3.6 0ZM8.2 4a1.8 2.8 0 1 0 3.6 0 1.8 2.8 0 1 0-3.6 0ZM12.9 7a1.8 2.6 0 1 0 3.6 0 1.8 2.6 0 1 0-3.6 0Z"

/**
 * Dino Adventure's signature: the age hatching out of a spotted egg. A zigzag
 * crack splits the shell, the number sits in the gap and a trail of
 * three-toed footprints wanders off underneath. Pure SVG + tokens, so it
 * renders on the server; the egg rocks gently at motion "full".
 */
export function DinoEgg({
  age,
  size = "lg",
  className,
}: {
  age: number
  size?: "lg" | "sm"
  className?: string
}) {
  const lg = size === "lg"
  return (
    <div className={cn("flex flex-col items-center", className)}>
      <div className={cn("relative", lg ? "size-44 sm:size-52" : "size-24")}>
        <svg
          aria-hidden="true"
          viewBox="0 0 100 120"
          className="inv-anim-float absolute inset-0 h-full w-full [--d:5s]"
        >
          <path
            d="M50 4C26 4 12 36 12 68c0 26 17 46 38 46s38-20 38-46C88 36 74 4 50 4Z"
            className="fill-inv-surface stroke-inv-primary"
            strokeWidth="3"
          />
          <g className="fill-inv-accent" opacity="0.85">
            <circle cx="30" cy="38" r="5" />
            <ellipse cx="68" cy="30" rx="6" ry="4" />
            <circle cx="74" cy="84" r="4" />
            <circle cx="26" cy="90" r="4.5" />
            <ellipse cx="50" cy="106" rx="5" ry="3.5" />
          </g>
          <path
            d="M13 60l12 7 8-10 10 10 12-13 10 9 8-9 14 7"
            className="fill-none stroke-inv-primary"
            strokeWidth="3"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 top-[57%] grid place-items-center font-inv-display leading-none font-extrabold text-inv-primary",
            lg ? "text-7xl sm:text-8xl" : "text-4xl"
          )}
        >
          {age}
        </span>
        <span className="sr-only">Turning {age}</span>
      </div>
      <svg
        aria-hidden="true"
        viewBox="0 0 120 30"
        className={cn("mt-1 fill-inv-primary", lg ? "w-40" : "w-20")}
      >
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            d={FOOTPRINT}
            opacity={0.9 - i * 0.2}
            transform={`translate(${6 + i * 30} ${i % 2 ? 2 : 10}) rotate(${i % 2 ? 25 : -5} 10 10)`}
          />
        ))}
      </svg>
    </div>
  )
}
