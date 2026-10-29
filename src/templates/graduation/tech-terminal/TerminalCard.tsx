import { cn } from "@/lib/utils"

/**
 * Tech Terminal's signature: a terminal window. Three traffic-light dots in
 * the title bar, monospace lines underneath (`$` prompts in the primary
 * green, `>` output muted) and a block cursor that blinks via
 * `inv-anim-twinkle`, so it stops with the motion level. Pure CSS, tokens only.
 */
export function TerminalCard({
  lines,
  compact = false,
  className,
}: {
  lines: ReadonlyArray<string>
  compact?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-inv border border-inv-line bg-inv-surface text-left font-mono text-inv-fg shadow-[0_24px_60px_-30px_var(--inv-primary)]",
        compact
          ? "w-64 text-xs sm:w-72"
          : "w-full max-w-xl text-sm sm:text-base",
        className
      )}
    >
      <div
        aria-hidden="true"
        className="flex items-center gap-1.5 border-b border-inv-line bg-inv-bg/60 px-3 py-2"
      >
        <span className="size-2.5 rounded-full bg-inv-accent" />
        <span className="size-2.5 rounded-full bg-inv-primary" />
        <span className="size-2.5 rounded-full bg-inv-muted" />
        <span className="ml-2 text-[0.6rem] tracking-[0.2em] text-inv-muted uppercase">
          festly — bash
        </span>
      </div>
      <pre
        className={cn(
          "overflow-x-auto leading-relaxed whitespace-pre-wrap",
          compact ? "px-3 py-3" : "px-5 py-4 sm:px-6"
        )}
      >
        {lines.map((line, i) => {
          const prompt = line.startsWith("$ ")
          const output = line.startsWith("> ")
          return (
            <span key={i} className={cn("block", output && "text-inv-muted")}>
              {prompt ? (
                <>
                  <span className="text-inv-primary">$ </span>
                  {line.slice(2)}
                </>
              ) : (
                line
              )}
            </span>
          )
        })}
        <span className="block">
          <span className="text-inv-primary">$ </span>
          <span
            aria-hidden="true"
            className="inv-anim-twinkle inline-block h-[1em] w-[0.6em] translate-y-[0.15em] bg-inv-primary [--d:1.1s]"
          />
        </span>
      </pre>
    </div>
  )
}
