// Small previews for the album grid, made in the browser before upload so
// the grid never has to load full-size originals. Best effort: when a
// preview cannot be made the file still uploads and the grid shows a
// placeholder.
import { ALBUM_THUMB, type AlbumKind } from "@/lib/album"

export type Thumb = {
  blob: Blob | null
  width?: number
  height?: number
  durationSec?: number
}

function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) =>
    canvas.toBlob(resolve, type, ALBUM_THUMB.quality)
  )
}

/** Draw `source` scaled to fit the preview size; WebP, or JPEG on old Safari. */
async function render(
  source: CanvasImageSource,
  width: number,
  height: number
): Promise<Blob | null> {
  const scale = Math.min(1, ALBUM_THUMB.maxEdge / Math.max(width, height))
  const canvas = document.createElement("canvas")
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const context = canvas.getContext("2d")
  if (!context) return null
  context.drawImage(source, 0, 0, canvas.width, canvas.height)
  const webp = await toBlob(canvas, "image/webp")
  const blob =
    webp?.type === "image/webp" ? webp : await toBlob(canvas, "image/jpeg")
  return blob && blob.size <= ALBUM_THUMB.maxBytes ? blob : null
}

async function imageThumb(file: File): Promise<Thumb> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  })
  try {
    return {
      blob: await render(bitmap, bitmap.width, bitmap.height),
      width: bitmap.width,
      height: bitmap.height,
    }
  } finally {
    bitmap.close()
  }
}

/** A frame from just after the start of the video. */
function videoThumb(file: File): Promise<Thumb> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement("video")
    let settled = false
    const finish = (thumb: Thumb) => {
      if (settled) return
      settled = true
      window.clearTimeout(timer)
      URL.revokeObjectURL(url)
      video.removeAttribute("src")
      video.load()
      resolve(thumb)
    }
    const meta = (): Thumb => ({
      blob: null,
      width: video.videoWidth || undefined,
      height: video.videoHeight || undefined,
      durationSec: Number.isFinite(video.duration) ? video.duration : undefined,
    })
    // Some phones never fire `seeked` for codecs they cannot decode.
    const timer = window.setTimeout(() => finish(meta()), 8000)
    video.muted = true
    video.playsInline = true
    video.preload = "auto"
    video.onloadedmetadata = () => {
      const at = Number.isFinite(video.duration)
        ? Math.min(0.5, video.duration / 2)
        : 0
      video.currentTime = at
    }
    video.onseeked = () => {
      void render(video, video.videoWidth, video.videoHeight)
        .catch(() => null)
        .then((blob) => finish({ ...meta(), blob }))
    }
    video.onerror = () => finish({ blob: null })
    video.src = url
  })
}

export async function makeThumb(file: File, kind: AlbumKind): Promise<Thumb> {
  try {
    return kind === "image" ? await imageThumb(file) : await videoThumb(file)
  } catch {
    return { blob: null }
  }
}
