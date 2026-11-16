// Full-screen viewer for one album item: the photo or the video, arrows and
// keys to move, and (when allowed) download and share.
import { ChevronLeft, ChevronRight, Download, Share2, X } from "lucide-react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { useEffect, useState, type ReactNode } from "react"
import { toast } from "sonner"
import { downloadOne, fileNameFor } from "@/lib/album-download"
import type { Messages } from "@/lib/i18n"
import type { AlbumItemView } from "@/server/album/album.server"

/** Photos small enough to hand to the share sheet as a file. */
const SHARE_FILE_MAX = 15 * 1024 * 1024

async function shareItem(item: AlbumItemView, t: Messages["album"]) {
  try {
    if (item.kind === "image" && item.bytes <= SHARE_FILE_MAX) {
      const blob = await (await fetch(item.url)).blob()
      const file = new File([blob], fileNameFor(item), { type: item.mime })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file] })
        return
      }
    }
    await navigator.share({ url: item.url })
  } catch (error) {
    // The person closed the share sheet: nothing to say.
    if (error instanceof DOMException && error.name === "AbortError") return
    try {
      await navigator.clipboard.writeText(item.url)
      toast(t.linkCopied)
    } catch {
      window.open(item.url, "_blank", "noopener")
    }
  }
}

const control =
  "grid size-11 place-items-center rounded-full bg-white/10 text-white outline-none transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white disabled:opacity-30"

export function AlbumViewer({
  items,
  index,
  onIndex,
  onClose,
  t,
  downloads,
  actions,
}: {
  items: ReadonlyArray<AlbumItemView>
  /** null: closed. */
  index: number | null
  onIndex: (index: number) => void
  onClose: () => void
  t: Messages["album"]
  downloads: boolean
  /** Extra buttons for the current item (the host's delete). */
  actions?: (item: AlbumItemView) => ReactNode
}) {
  const item = index === null ? undefined : items[index]
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (index === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && index > 0) onIndex(index - 1)
      if (event.key === "ArrowRight" && index < items.length - 1) {
        onIndex(index + 1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [index, items.length, onIndex])

  return (
    <DialogPrimitive.Root
      open={!!item}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/95" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-50 flex flex-col outline-none"
        >
          {item && index !== null && (
            <>
              <div className="flex items-center justify-between gap-3 p-3 text-white">
                <DialogPrimitive.Title className="min-w-0 truncate text-sm text-white/80">
                  {t.by(item.uploaderName)}
                  <span className="ml-2 text-white/50">
                    {index + 1} / {items.length}
                  </span>
                </DialogPrimitive.Title>
                <div className="flex shrink-0 items-center gap-2">
                  {actions?.(item)}
                  {downloads && (
                    <>
                      <button
                        type="button"
                        className={control}
                        aria-label={t.share}
                        onClick={() => void shareItem(item, t)}
                      >
                        <Share2 className="size-5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        className={control}
                        aria-label={t.download}
                        disabled={busy}
                        onClick={() => {
                          setBusy(true)
                          void downloadOne(item).finally(() => setBusy(false))
                        }}
                      >
                        <Download className="size-5" aria-hidden="true" />
                      </button>
                    </>
                  )}
                  <DialogPrimitive.Close
                    className={control}
                    aria-label={t.close}
                  >
                    <X className="size-5" aria-hidden="true" />
                  </DialogPrimitive.Close>
                </div>
              </div>

              <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4">
                {item.kind === "video" ? (
                  // Guests' own clips: there are no captions to offer.
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video
                    key={item.id}
                    src={item.url}
                    poster={item.thumbUrl ?? undefined}
                    controls
                    playsInline
                    preload="metadata"
                    controlsList={downloads ? undefined : "nodownload"}
                    className="max-h-full max-w-full rounded-md"
                  />
                ) : (
                  <img
                    key={item.id}
                    src={item.url}
                    alt={t.by(item.uploaderName)}
                    decoding="async"
                    className="max-h-full max-w-full rounded-md object-contain"
                  />
                )}
                <button
                  type="button"
                  className={`${control} absolute top-1/2 left-2 -translate-y-1/2`}
                  aria-label={t.previous}
                  disabled={index === 0}
                  onClick={() => onIndex(index - 1)}
                >
                  <ChevronLeft className="size-6" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${control} absolute top-1/2 right-2 -translate-y-1/2`}
                  aria-label={t.next}
                  disabled={index === items.length - 1}
                  onClick={() => onIndex(index + 1)}
                >
                  <ChevronRight className="size-6" aria-hidden="true" />
                </button>
              </div>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
