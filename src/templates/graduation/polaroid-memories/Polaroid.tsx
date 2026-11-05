import type { CSSProperties } from "react"
import { cn } from "@/lib/utils"
import type { MediaRef } from "../../_shared/schema"

/**
 * Polaroid Memories' signature: an instant-camera print. A pale frame with
 * a thick bottom margin holds the photo; the caption sits in the display face
 * like handwriting; `tilt` rotates the whole print a few degrees and it
 * swings gently from the tape (resting at `tilt` when motion is off). Pure
 * CSS, tokens only. Renders nothing without a photo.
 */
export function Polaroid({
  photo,
  caption,
  tilt = -3,
  className,
}: {
  photo?: MediaRef
  caption: string
  tilt?: number
  className?: string
}) {
  if (!photo) return null
  const style = { "--r": `${tilt}deg` } as CSSProperties
  return (
    <figure
      style={style}
      className={cn(
        "inv-anim-swing relative w-56 rounded-[0.2rem] border border-inv-line bg-inv-surface p-3 pb-5 text-inv-fg shadow-[0_24px_50px_-24px_var(--inv-primary)] [--d:7s] [--swing:1.6deg] sm:w-64",
        className
      )}
    >
      <span
        aria-hidden="true"
        className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 -rotate-2 rounded-xs bg-inv-accent/50"
      />
      <img
        src={photo.url}
        alt={photo.alt ?? caption}
        width={photo.width}
        height={photo.height}
        loading="eager"
        decoding="async"
        className="aspect-square w-full rounded-xs bg-inv-secondary object-cover"
      />
      <figcaption className="mt-4 font-inv-display text-xl leading-none tracking-wide">
        {caption}
      </figcaption>
    </figure>
  )
}
