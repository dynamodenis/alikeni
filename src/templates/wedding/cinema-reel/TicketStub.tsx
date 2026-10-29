import { cn } from "@/lib/utils"
import { formatLongDate } from "@/lib/format-date"

/**
 * Cinema Reel's signature: an admit-one ticket stub carrying the wedding
 * date. The tear line is a dashed border with two notches punched into the
 * edges; pure CSS, so it renders on the server and uses only tokens.
 */
export function TicketStub({
  date,
  timezone,
  className,
}: {
  date: string
  timezone: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative flex w-64 -rotate-2 overflow-hidden rounded-inv border border-inv-line bg-inv-surface text-inv-fg shadow-[0_18px_40px_-20px_var(--inv-primary)] sm:w-72",
        className
      )}
    >
      <div className="flex flex-1 flex-col items-center gap-1 px-5 py-4 text-center">
        <p className="text-[0.55rem] tracking-[0.35em] text-inv-muted uppercase">
          Admit one
        </p>
        <p className="font-inv-display text-2xl leading-none tracking-[0.08em] uppercase sm:text-3xl">
          Premiere
        </p>
        <p className="mt-1 text-[0.65rem] tracking-[0.15em] text-inv-primary uppercase">
          {formatLongDate(date, timezone)}
        </p>
      </div>
      <div className="relative border-l border-dashed border-inv-line">
        <span
          aria-hidden="true"
          className="absolute -top-2 -left-2 size-4 rounded-full border border-inv-line bg-inv-bg"
        />
        <span
          aria-hidden="true"
          className="absolute -bottom-2 -left-2 size-4 rounded-full border border-inv-line bg-inv-bg"
        />
      </div>
      <div className="flex w-14 items-center justify-center bg-inv-primary/10">
        <p className="rotate-90 text-[0.55rem] tracking-[0.3em] whitespace-nowrap text-inv-primary uppercase">
          Row A · Seat 1
        </p>
      </div>
    </div>
  )
}
