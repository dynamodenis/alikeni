import { cn } from "@/lib/utils"
import type { Host } from "../../_shared/schema"

/**
 * Then and Now's signature: two square photos side by side, the first host's
 * photo captioned "Then · <year>" and the second's "Now · <year>". The then
 * year is the event year minus the years together.
 */
export function ThenNow({
  hosts,
  years,
  start,
  className,
}: {
  hosts: ReadonlyArray<Host>
  years: number
  start: string
  className?: string
}) {
  const now = Number(start.slice(0, 4))
  const frames = [
    { label: "Then", year: now - years, host: hosts.at(0) },
    { label: "Now", year: now, host: hosts.at(1) },
  ]

  return (
    <div className={cn("grid w-full max-w-xl grid-cols-2 gap-4", className)}>
      {frames.map(({ label, year, host }) => (
        <figure key={label} className="flex flex-col gap-2">
          {host?.photo ? (
            <img
              src={host.photo.url}
              alt={host.photo.alt ?? `${label}, ${year}`}
              width={host.photo.width}
              height={host.photo.height}
              loading="lazy"
              decoding="async"
              className="aspect-square w-full rounded-inv border border-inv-line object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="aspect-square w-full rounded-inv border border-inv-line bg-inv-surface"
            />
          )}
          <figcaption className="text-xs tracking-[0.2em] text-inv-muted uppercase">
            {label} · {year}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}
