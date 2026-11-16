// The album as a grid of small previews. A tile opens the viewer; in
// selection mode (the host's dashboard) it toggles instead.
import { Check, ImageOff, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Messages } from "@/lib/i18n"
import type { AlbumItemView } from "@/server/album/album.server"

export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const minutes = Math.floor(total / 60)
  return `${minutes}:${String(total % 60).padStart(2, "0")}`
}

export function AlbumGrid({
  items,
  t,
  onOpen,
  selected,
  onToggle,
  className,
}: {
  items: ReadonlyArray<AlbumItemView>
  t: Messages["album"]
  onOpen: (index: number) => void
  /** Present: tiles are checkboxes instead of links to the viewer. */
  selected?: ReadonlySet<string>
  onToggle?: (id: string) => void
  className?: string
}) {
  return (
    <ul
      className={cn(
        "grid grid-cols-3 gap-1 sm:grid-cols-4 sm:gap-2 lg:grid-cols-6",
        className
      )}
    >
      {items.map((item, index) => {
        const picked = selected?.has(item.id) ?? false
        return (
          <li key={item.id}>
            <button
              type="button"
              onClick={() =>
                selected && onToggle ? onToggle(item.id) : onOpen(index)
              }
              aria-pressed={selected ? picked : undefined}
              aria-label={
                item.kind === "video"
                  ? `${t.video}. ${t.open(index + 1, items.length)}`
                  : t.open(index + 1, items.length)
              }
              className={cn(
                "group relative block aspect-square w-full overflow-hidden rounded-md bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring",
                picked && "ring-2 ring-primary"
              )}
            >
              {item.thumbUrl ? (
                <img
                  src={item.thumbUrl}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none"
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-muted-foreground">
                  <ImageOff className="size-6" aria-hidden="true" />
                </span>
              )}
              {item.kind === "video" && (
                <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 text-[0.7rem] font-medium text-white">
                  <Play className="size-3 fill-current" aria-hidden="true" />
                  {item.durationSec
                    ? formatDuration(item.durationSec)
                    : t.video}
                </span>
              )}
              {selected && (
                <span
                  aria-hidden="true"
                  className={cn(
                    "absolute top-1.5 right-1.5 grid size-6 place-items-center rounded-full border-2 border-white/90 text-white shadow",
                    picked ? "bg-primary" : "bg-black/40"
                  )}
                >
                  {picked && <Check className="size-3.5" />}
                </span>
              )}
            </button>
          </li>
        )
      })}
    </ul>
  )
}
