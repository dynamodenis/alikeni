import {
  Suspense,
  lazy,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react"
import { cn } from "@/lib/utils"
import { useInvitation } from "../context"
import {
  PhotoButton,
  PhotoCarousel,
  TiltedPhoto,
  type GalleryEffect,
} from "../effects/GalleryFx"
import { Section, type BlockProps } from "./Section"

const loadLightbox = () => import("./Lightbox")
// The dialog (Radix + its focus/scroll-lock code) is only needed once a
// guest opens a photo, so it lives in its own chunk.
const Lightbox = lazy(loadLightbox)

export type GalleryVariant =
  "grid" | "masonry" | "carousel" | "mosaic" | "polaroid"

type GalleryProps = BlockProps & {
  variant?: GalleryVariant
  effect?: GalleryEffect
}

const layouts: Record<Exclude<GalleryVariant, "carousel">, string> = {
  grid: "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 [&>li]:aspect-[4/5]",
  masonry:
    "columns-2 gap-3 sm:columns-3 sm:gap-4 [&>li]:mb-3 [&>li]:break-inside-avoid sm:[&>li]:mb-4",
  // Editorial mosaic: the first photo spans a 2×2 block.
  mosaic:
    "grid auto-rows-[9rem] grid-cols-2 gap-3 sm:auto-rows-[12rem] sm:grid-cols-4 sm:gap-4 [&>li:first-child]:col-span-2 [&>li:first-child]:row-span-2",
  // Prints pinned to a wall; see PolaroidPrint.
  polaroid:
    "grid grid-cols-2 gap-x-5 gap-y-10 px-1 pt-3 sm:grid-cols-3 sm:gap-x-10 sm:gap-y-14",
}

/** Resting tilts for the polaroid wall, in degrees, cycled per photo. */
const PRINT_TILTS = [-4, 3, -2, 5, -3, 2, 4, -5]

/** Photo grid (or carousel) with an accessible, keyboard-navigable, lazily loaded lightbox. */
export function Gallery({
  variant = "grid",
  effect = "none",
  eyebrow,
  title,
  tone,
  className,
}: GalleryProps) {
  const { config, motion, palette, t } = useInvitation()
  const photos = config.gallery
  const [active, setActive] = useState<number | null>(null)
  const [lightboxMounted, setLightboxMounted] = useState(false)
  const opener = useRef<HTMLElement | null>(null)
  const count = photos.length

  const openPhoto = (index: number) => {
    opener.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null
    setLightboxMounted(true)
    setActive(index)
  }
  // Warm the chunk as soon as a guest points at or tabs into the photos.
  const prefetch = () => void loadLightbox()

  const grid = (
    <ul
      className={layouts[variant === "carousel" ? "grid" : variant]}
      onPointerEnter={prefetch}
      onFocus={prefetch}
    >
      {photos.map((photo, i) => {
        const label = photo.alt
          ? t.gallery.openPhoto(photo.alt)
          : t.gallery.openPhotoN(i + 1, count)
        const tile = {
          photo,
          label,
          onOpen: () => openPhoto(i),
          className: "h-full w-full",
        }
        if (variant === "polaroid") {
          return (
            <PolaroidPrint
              key={`${photo.assetKey}-${i}`}
              index={i}
              caption={photo.alt}
            >
              <PhotoButton {...tile} />
            </PolaroidPrint>
          )
        }
        return (
          <li key={`${photo.assetKey}-${i}`} className="relative">
            {effect === "tilted" ? (
              <TiltedPhoto {...tile} motion={motion} />
            ) : (
              <PhotoButton {...tile} />
            )}
          </li>
        )
      })}
    </ul>
  )

  return (
    <Section
      id="gallery"
      eyebrow={eyebrow ?? t.gallery.eyebrow}
      title={title ?? t.gallery.title}
      tone={tone}
      width="wide"
      className={className}
    >
      {variant === "carousel" ? (
        <PhotoCarousel
          photos={photos}
          motion={motion}
          mode={palette.mode}
          fallback={grid}
        />
      ) : (
        grid
      )}

      {lightboxMounted && (
        <Suspense fallback={null}>
          <Lightbox
            photos={photos}
            active={active}
            onActiveChange={setActive}
            returnFocus={opener}
          />
        </Suspense>
      )}
    </Section>
  )
}

/**
 * One instant print on the polaroid wall: a pale frame with a deep bottom
 * margin, a strip of tape and the photo's alt text as a handwritten caption
 * (hidden from screen readers; the button already says it). Each print
 * rests at its own tilt and sways slightly from the tape, out of step with
 * its neighbours; on hover or focus it stops, straightens and lifts. The
 * print itself tilts, so the pointer-tilt effect is not used here.
 */
function PolaroidPrint({
  index,
  caption,
  children,
}: {
  index: number
  caption?: string
  children: ReactNode
}) {
  const tilt = PRINT_TILTS[index % PRINT_TILTS.length]
  const sway = {
    "--r": "0deg",
    "--d": `${6 + (index % 3) * 1.3}s`,
    "--delay": `${-index * 1.7}s`,
    "--swing": "1deg",
  } as CSSProperties
  return (
    <li
      style={sway}
      className="inv-anim-swing relative focus-within:z-10 hover:z-10"
    >
      <figure
        style={{ "--r": `${tilt}deg` } as CSSProperties}
        className={cn(
          "group/print relative m-0 rotate-(--r) rounded-[0.2rem] border border-inv-line bg-inv-surface p-2 pb-3 text-inv-fg shadow-[0_18px_36px_-22px_var(--inv-primary)] sm:p-3 sm:pb-4",
          "transition-[rotate,translate,box-shadow] duration-500 ease-out in-data-[motion=none]:transition-none motion-reduce:transition-none",
          "focus-within:translate-y-[-6px] focus-within:rotate-0 hover:translate-y-[-6px] hover:rotate-0 hover:shadow-[0_28px_50px_-24px_var(--inv-primary)]"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute -top-2.5 left-1/2 z-10 h-5 w-12 -translate-x-1/2 rounded-xs bg-inv-accent/45 sm:w-14",
            index % 2 ? "rotate-3" : "-rotate-2"
          )}
        />
        <div className="aspect-square overflow-hidden rounded-xs bg-inv-secondary [&>button]:rounded-xs">
          {children}
        </div>
        <figcaption
          aria-hidden="true"
          className="mt-2.5 line-clamp-2 min-h-[2lh] px-0.5 text-center font-inv-display text-sm leading-tight tracking-wide sm:mt-3 sm:text-base"
        >
          {caption}
        </figcaption>
      </figure>
    </li>
  )
}
