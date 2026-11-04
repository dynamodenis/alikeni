import { Suspense, lazy, useRef, useState } from "react"
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

export type GalleryVariant = "grid" | "masonry" | "carousel" | "mosaic"

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
}

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
