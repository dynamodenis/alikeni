import { cn } from "@/lib/utils"

/**
 * Varsity's signature: the graduate's initial as a chenille letterman patch.
 * A rounded block in the primary color with a stitched (dashed) inner border
 * and a diagonal chenille weave, with the class year as a felt tab below.
 * Pure CSS so it renders on the server; tokens only.
 */
export function VarsityLetter({
  letter,
  year,
  className,
}: {
  letter: string
  year: number
  className?: string
}) {
  return (
    <div
      className={cn("relative inline-flex flex-col items-center", className)}
    >
      <div
        className="relative grid size-28 place-items-center rounded-[1.25rem] bg-inv-primary text-inv-bg shadow-[0_16px_36px_-18px_var(--inv-primary)] sm:size-32"
        aria-hidden="true"
      >
        <span className="absolute inset-0 rounded-[1.25rem] bg-[repeating-linear-gradient(45deg,transparent_0_3px,color-mix(in_oklab,var(--inv-bg)_14%,transparent)_3px_4px)]" />
        <span className="absolute inset-2 rounded-[0.9rem] border-2 border-dashed border-inv-bg/70" />
        <span className="relative font-inv-display text-7xl leading-none tracking-wide sm:text-8xl">
          {letter}
        </span>
      </div>
      <span className="sr-only">
        {letter}, class of {year}
      </span>
      <span
        aria-hidden="true"
        className="-mt-3 rounded-inv bg-inv-accent px-3 py-1 font-inv-body text-[0.65rem] font-bold tracking-[0.3em] text-inv-bg uppercase shadow-sm"
      >
        Class of {year}
      </span>
    </div>
  )
}
