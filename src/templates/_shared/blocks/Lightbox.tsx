import type { KeyboardEvent, ReactNode, RefObject } from "react"
import { ChevronLeft, ChevronRight, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { useInvitation } from "../context"
import type { MediaRef } from "../schema"

export type LightboxProps = {
  photos: ReadonlyArray<MediaRef>
  /** Index of the open photo, or null when closed. */
  active: number | null
  onActiveChange: (index: number | null) => void
  /** Where focus goes back to on close (the tile that opened it). */
  returnFocus?: RefObject<HTMLElement | null>
}

/**
 * The gallery's photo viewer (Radix Dialog: focus trap, Escape, focus back to
 * the tile that opened it). Loaded lazily by `Gallery` the first time a photo
 * is opened, so the dialog code is not part of the invitation's first load.
 * It stays mounted after that so close animations and focus return work.
 */
export default function Lightbox({
  photos,
  active,
  onActiveChange,
  returnFocus,
}: LightboxProps) {
  const { t } = useInvitation()
  const current = active === null ? undefined : photos[active]
  const count = photos.length
  const position = (active ?? 0) + 1

  const step = (delta: number) => {
    if (active !== null) onActiveChange((active + delta + count) % count)
  }
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowRight") step(1)
    if (event.key === "ArrowLeft") step(-1)
  }

  return (
    <Dialog
      open={current !== undefined}
      onOpenChange={(open) => !open && onActiveChange(null)}
    >
      <DialogContent
        showCloseButton={false}
        onKeyDown={onKeyDown}
        // Radix returns focus to a Dialog.Trigger; tiles open the dialog
        // themselves, so hand focus back to the one that did.
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          returnFocus?.current?.focus({ preventScroll: true })
        }}
        className="max-w-5xl border-0 bg-transparent p-0 shadow-none sm:max-w-5xl"
      >
        <DialogTitle className="sr-only">
          {current?.alt || t.gallery.photoN(position, count)}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {t.gallery.help}
        </DialogDescription>
        {current && (
          <figure className="flex flex-col items-center gap-3">
            <img
              src={current.url}
              alt={current.alt ?? ""}
              className="max-h-[80svh] w-auto rounded-lg object-contain shadow-2xl"
            />
            <figcaption className="text-sm text-white/80">
              {current.alt && <span>{current.alt} · </span>}
              {position} / {count}
            </figcaption>
          </figure>
        )}
        {count > 1 && (
          <>
            <LightboxButton
              label={t.gallery.previous}
              onClick={() => step(-1)}
              className="left-2 sm:-left-14"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </LightboxButton>
            <LightboxButton
              label={t.gallery.next}
              onClick={() => step(1)}
              className="right-2 sm:-right-14"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </LightboxButton>
          </>
        )}
        <LightboxButton
          label={t.gallery.close}
          onClick={() => onActiveChange(null)}
          className="top-2 right-2 translate-y-0"
        >
          <X className="size-5" aria-hidden="true" />
        </LightboxButton>
      </DialogContent>
    </Dialog>
  )
}

function LightboxButton({
  label,
  onClick,
  className,
  children,
}: {
  label: string
  onClick: () => void
  className?: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2.5 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none",
        className
      )}
    >
      {children}
    </button>
  )
}
