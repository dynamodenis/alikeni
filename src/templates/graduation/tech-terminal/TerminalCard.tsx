import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { useInvitation } from "../../_shared/context"

/**
 * Tech Terminal's signature: a terminal window. Three traffic-light dots in
 * the title bar, monospace lines underneath (`$` prompts in the primary
 * green, `>` output muted) and a block cursor that blinks via
 * `inv-anim-twinkle`, so it stops with the motion level. Pure CSS, tokens
 * only, except `typeLast`: the last line types itself out, holds, backspaces
 * and types again (full motion only), with the cursor riding at its end.
 */
export function TerminalCard({
  lines,
  compact = false,
  typeLast = false,
  className,
}: {
  lines: ReadonlyArray<string>
  compact?: boolean
  /** Loop typing and deleting the last line (e.g. the name after `whoami`). */
  typeLast?: boolean
  className?: string
}) {
  const { motion } = useInvitation()
  const shown = typeLast ? lines.slice(0, -1) : lines
  const typed = typeLast ? lines.at(-1) : undefined
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
          alikeni — bash
        </span>
      </div>
      <pre
        className={cn(
          "overflow-x-auto leading-relaxed whitespace-pre-wrap",
          compact ? "px-3 py-3" : "px-5 py-4 sm:px-6"
        )}
      >
        {shown.map((line, i) => {
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
        {typed !== undefined ? (
          // Keyed so an edit (text or motion level) restarts from the full line.
          <TypedLine key={`${motion}:${typed}`} text={typed} />
        ) : (
          <span className="block">
            <span className="text-inv-primary">$ </span>
            <Cursor />
          </span>
        )}
      </pre>
    </div>
  )
}

/** Blinks while idle; solid while keys are going (`busy`), like a shell. */
function Cursor({ busy = false }: { busy?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block h-[1em] w-[0.6em] translate-y-[0.15em] bg-inv-primary",
        !busy && "inv-anim-twinkle [--d:1.1s]"
      )}
    />
  )
}

/** Milliseconds: per key typed (plus jitter), per backspace, and the holds. */
const TYPE_MS = 95
const TYPE_JITTER_MS = 70
const DELETE_MS = 45
const HOLD_FULL_MS = 2200
const HOLD_EMPTY_MS = 650

/** User-perceived characters, so accents and emoji type as one key. */
function graphemes(text: string): Array<string> {
  if (typeof Intl.Segmenter === "function") {
    return Array.from(new Intl.Segmenter().segment(text), (s) => s.segment)
  }
  return Array.from(text)
}

/**
 * One line that types, holds, backspaces and retypes forever. It renders the
 * full text first (server, thumbnails, motion below "full"), and an invisible
 * copy reserves the full line's size so wrapping never moves the card.
 * Screen readers get the text once, not every keystroke.
 */
function TypedLine({ text }: { text: string }) {
  const { motion } = useInvitation()
  const chars = useMemo(() => graphemes(text), [text])
  const [state, setState] = useState({ count: chars.length, busy: false })
  const animate = motion === "full" && chars.length > 0

  useEffect(() => {
    if (!animate) return
    let count = chars.length
    let deleting = true
    let timer: number
    const step = () => {
      count += deleting ? -1 : 1
      const done = deleting ? count === 0 : count === chars.length
      setState({ count, busy: !done })
      if (done) deleting = !deleting
      const wait = done
        ? deleting
          ? HOLD_FULL_MS
          : HOLD_EMPTY_MS
        : deleting
          ? DELETE_MS
          : TYPE_MS + Math.random() * TYPE_JITTER_MS
      timer = window.setTimeout(step, wait)
    }
    timer = window.setTimeout(step, HOLD_FULL_MS)
    return () => window.clearTimeout(timer)
  }, [animate, chars])

  const count = animate ? state.count : chars.length
  return (
    <span className="block">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-grid align-top">
        <span className="invisible col-start-1 row-start-1">
          {text}
          <Cursor />
        </span>
        <span className="col-start-1 row-start-1">
          {chars.slice(0, count).join("")}
          <Cursor busy={animate && state.busy} />
        </span>
      </span>
    </span>
  )
}
