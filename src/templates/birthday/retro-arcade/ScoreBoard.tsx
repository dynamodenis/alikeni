import { cn } from "@/lib/utils"

/**
 * Retro Arcade's signature: the age as a high score. A dotted-border panel
 * with a HI-SCORE / 1UP row, the age zero-padded to six chunky digits in the
 * display face and a blinking INSERT COIN line. CSS only, tokens only, so it
 * renders on the server; the blink stops with motion.
 */
export function ScoreBoard({
  age,
  compact = false,
  className,
}: {
  age: number
  compact?: boolean
  className?: string
}) {
  const score = String(age).padStart(6, "0")
  return (
    <div
      className={cn(
        "inline-flex flex-col items-center border-4 border-dotted border-inv-primary bg-inv-bg/80 font-inv-display tracking-[0.18em] text-inv-fg uppercase",
        compact ? "gap-1 px-5 py-3" : "gap-2 px-8 py-5 sm:px-12",
        className
      )}
    >
      <div
        className={cn(
          "flex w-full items-center justify-between gap-6 text-inv-accent",
          compact ? "text-xs" : "text-sm sm:text-base"
        )}
      >
        <span>1UP</span>
        <span>Hi-score</span>
      </div>
      <p
        aria-hidden="true"
        className={cn(
          "leading-none font-bold tracking-[0.2em] text-inv-primary tabular-nums",
          compact ? "text-4xl" : "text-6xl sm:text-8xl"
        )}
        style={{ textShadow: "4px 4px 0 var(--inv-accent)" }}
      >
        {score}
      </p>
      <span className="sr-only">Turning {age}</span>
      {!compact && (
        <p className="inv-anim-twinkle mt-2 text-sm text-inv-fg [--d:1.4s] [--o:1] sm:text-base">
          Insert coin
        </p>
      )}
    </div>
  )
}
