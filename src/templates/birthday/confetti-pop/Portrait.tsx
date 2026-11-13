import type { MediaRef } from "../../_shared/schema"
import { AgeBadge } from "./AgeBadge"

/**
 * The celebrant's portrait as the hero's main image: a round sticker photo
 * with a dashed spinning ring (the age badge's ring, larger) and the age
 * sticker overlapping its corner.
 */
export function Portrait({
  photo,
  name,
  age,
}: {
  photo: MediaRef
  name: string
  age: number
}) {
  return (
    <div className="inv-anim-rise relative mb-2 size-52 sm:size-64">
      <div
        aria-hidden="true"
        className="inv-anim-spin absolute -inset-3 rounded-full border-2 border-dashed border-inv-accent [--d:32s]"
      />
      <img
        src={photo.url}
        alt={photo.alt ?? name}
        width={photo.width}
        height={photo.height}
        decoding="async"
        className="size-full -rotate-2 rounded-full border-4 border-inv-bg bg-inv-secondary object-cover shadow-[0_22px_48px_-18px_var(--inv-primary)]"
      />
      <AgeBadge
        age={age}
        size="sm"
        className="absolute -right-5 -bottom-4 sm:-right-6"
      />
      <span className="sr-only">Turning {age}</span>
    </div>
  )
}
