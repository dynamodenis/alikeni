// Invitation config → 1200×630 PNG: satori lays the card out as SVG (text
// becomes paths, so resvg needs no fonts), resvg rasterises it.
import { Resvg } from "@resvg/resvg-wasm"
import satori from "satori/standalone"
import { formatLongDate } from "@/lib/format-date"
import type { Bytes } from "@/server/storage/types"
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

/** First gallery photo, else the first host photo. */
export function pickPhotoUrl(config: OgConfig): string | undefined {
  return (
    config.gallery.at(0)?.url ?? config.hosts.find((h) => h.photo)?.photo?.url
  )
}

/** Formats satori and resvg both decode. */
const PHOTO_TYPES = new Set(["image/png", "image/jpeg"])
const MAX_PHOTO_BYTES = 5 * 1024 * 1024
export const PHOTO_TIMEOUT_MS = 3000

function toBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

/**
 * Fetch a photo as a data URL, or undefined on any failure (timeout, non-2xx,
 * unsupported type, too large). The card simply renders without it.
 */
export async function fetchPhoto(
  url: string,
  fetchImpl: typeof fetch = fetch,
  timeoutMs = PHOTO_TIMEOUT_MS
): Promise<string | undefined> {
  try {
    if (!/^https?:$/.test(new URL(url).protocol)) return undefined
    const res = await fetchImpl(url, {
      signal: AbortSignal.timeout(timeoutMs),
    })
    const type = (res.headers.get("content-type") ?? "").split(";")[0].trim()
    if (!res.ok || !PHOTO_TYPES.has(type)) return undefined
    const declared = Number(res.headers.get("content-length") ?? 0)
    if (declared > MAX_PHOTO_BYTES) return undefined
    const body = new Uint8Array(await res.arrayBuffer())
    if (body.byteLength > MAX_PHOTO_BYTES) return undefined
    return `data:${type};base64,${toBase64(body)}`
  } catch {
    return undefined
  }
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

export type RenderOptions = { fetchImpl?: typeof fetch; timeoutMs?: number }

export async function renderOgCard(
  config: OgConfig,
  options: RenderOptions = {}
): Promise<Bytes> {
  const photoUrl = pickPhotoUrl(config)
  const [fonts, photo] = await Promise.all([
    loadOgFonts(config.theme.fontPairId),
    photoUrl
      ? fetchPhoto(photoUrl, options.fetchImpl, options.timeoutMs)
      : undefined,
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
