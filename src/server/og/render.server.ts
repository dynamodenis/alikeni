// Invitation config → 1200×630 PNG: satori lays the card out as SVG (text
// becomes paths, so resvg needs no fonts), resvg rasterises it.
import { Resvg } from "@resvg/resvg-wasm"
import satori from "satori/standalone"
import { formatLongDate } from "@/lib/format-date"
import type { Bytes, StoredObject } from "@/server/storage/types"
import type { InvitationConfigBase } from "@/templates/_shared/schema"
import { parseColor } from "@/templates/_shared/theme/contrast"
import { resolvePalette } from "@/templates/_shared/theme/palettes"
import { OG_HEIGHT, OG_WIDTH, OgCard, type OgCardProps } from "./card.server"
import { loadOgFonts } from "./fonts.server"
import { ensureOgEngines } from "./wasm.server"

export type OgConfig = Pick<
  InvitationConfigBase,
  "event" | "datetime" | "venue" | "theme" | "texts" | "gallery" | "hosts"
>

const linearToSrgb = (c: number) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055

/** Hex for satori (it does not read oklch); null when unparseable. */
export function toHex(color: string): string | null {
  const rgb = parseColor(color)
  if (!rgb) return null
  return `#${rgb
    .map((c) =>
      Math.round(Math.min(1, Math.max(0, linearToSrgb(c))) * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`
}

/**
 * The first host portrait (the person the invitation is about), else the
 * first gallery photo.
 */
export function pickPhoto(
  config: OgConfig
): { assetKey: string; url: string } | undefined {
  return config.hosts.find((h) => h.photo)?.photo ?? config.gallery.at(0)
}

export function pickPhotoUrl(config: OgConfig): string | undefined {
  return pickPhoto(config)?.url
}

/** Formats satori and resvg both decode. */
const PHOTO_TYPES = new Set(["image/png", "image/jpeg"])
const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const PHOTO_TIMEOUT_MS = 3000

/**
 * Turns a photo the card cannot decode (uploads are WebP) into JPEG, or
 * undefined when the runtime has no converter or the conversion fails.
 */
export type PhotoConverter = (bytes: Bytes) => Promise<Bytes | undefined>

export type PhotoOptions = {
  fetchImpl?: typeof fetch
  timeoutMs?: number
  /** Read the photo from object storage by key before trying its URL. */
  readObject?: (key: string) => Promise<StoredObject | null>
  toJpeg?: PhotoConverter
}

function toBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

type Photo = { type: string; body: Bytes }

/** PNG and JPEG as they are; anything else through the converter, if any. */
async function toDataUrl(
  photo: Photo,
  toJpeg?: PhotoConverter
): Promise<string | undefined> {
  if (photo.body.byteLength > MAX_PHOTO_BYTES) return undefined
  if (PHOTO_TYPES.has(photo.type)) {
    return `data:${photo.type};base64,${toBase64(photo.body)}`
  }
  if (!toJpeg || !photo.type.startsWith("image/")) return undefined
  const jpeg = await toJpeg(photo.body)
  if (!jpeg || jpeg.byteLength > MAX_PHOTO_BYTES) return undefined
  return `data:image/jpeg;base64,${toBase64(jpeg)}`
}

async function fetchBytes(
  url: string,
  fetchImpl: typeof fetch,
  timeoutMs: number
): Promise<Photo | undefined> {
  if (!/^https?:$/.test(new URL(url).protocol)) return undefined
  const res = await fetchImpl(url, { signal: AbortSignal.timeout(timeoutMs) })
  const type = (res.headers.get("content-type") ?? "").split(";")[0].trim()
  if (!res.ok || !type.startsWith("image/")) return undefined
  const declared = Number(res.headers.get("content-length") ?? 0)
  if (declared > MAX_PHOTO_BYTES) return undefined
  return { type, body: new Uint8Array(await res.arrayBuffer()) }
}

/**
 * Fetch a photo as a data URL, or undefined on any failure (timeout, non-2xx,
 * unsupported type, too large). The card simply renders without it.
 */
export async function fetchPhoto(
  url: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = PHOTO_TIMEOUT_MS,
  toJpeg?: PhotoConverter
): Promise<string | undefined> {
  try {
    const photo = await fetchBytes(url, fetchImpl, timeoutMs)
    return photo && (await toDataUrl(photo, toJpeg))
  } catch {
    return undefined
  }
}

/**
 * The card's photo as a data URL: read from object storage by key when the
 * runtime offers that (no HTTP round trip to our own file route), otherwise
 * fetched by URL. Undefined on any failure; the card renders without it.
 */
export async function loadPhoto(
  photo: { assetKey: string; url: string },
  options: PhotoOptions = {}
): Promise<string | undefined> {
  if (options.readObject) {
    try {
      const stored = await options.readObject(photo.assetKey)
      if (stored) {
        const body = new Uint8Array(
          await new Response(stored.body).arrayBuffer()
        )
        const dataUrl = await toDataUrl(
          { type: stored.mime.split(";")[0].trim(), body },
          options.toJpeg
        )
        if (dataUrl) return dataUrl
      }
    } catch {
      // fall through to the URL
    }
  }
  return fetchPhoto(
    photo.url,
    options.fetchImpl,
    options.timeoutMs,
    options.toJpeg
  )
}

export function cardProps(config: OgConfig, photo?: string): OgCardProps {
  const palette = resolvePalette(config.theme)
  const headline = config.texts.headline.trim()
  const title = config.event.title.trim()
  return {
    colors: {
      background: toHex(palette.background) ?? "#ffffff",
      foreground: toHex(palette.foreground) ?? "#111111",
      primary: toHex(palette.primary) ?? "#111111",
    },
    title: headline || title,
    eyebrow:
      headline && title && headline.toLowerCase() !== title.toLowerCase()
        ? title
        : undefined,
    date: formatLongDate(config.datetime.start, config.datetime.timezone),
    place: config.venue.placeName?.trim() || config.venue.name,
    photo,
  }
}

export type RenderOptions = PhotoOptions

export async function renderOgCard(
  config: OgConfig,
  options: RenderOptions = {}
): Promise<Bytes> {
  const source = pickPhoto(config)
  const [fonts, photo] = await Promise.all([
    loadOgFonts(config.theme.fontPairId),
    source ? loadPhoto(source, options) : undefined,
    ensureOgEngines(),
  ])
  const svg = await satori(OgCard(cardProps(config, photo)), {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  })
  const resvg = new Resvg(svg, { fitTo: { mode: "width", value: OG_WIDTH } })
  try {
    const image = resvg.render()
    try {
      return new Uint8Array(image.asPng())
    } finally {
      image.free()
    }
  } finally {
    resvg.free()
  }
}
