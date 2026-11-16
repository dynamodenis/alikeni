// The event album (photos and videos guests and hosts add to an invitation):
// what may be uploaded, when guests may upload, and when a batch needs the
// host's approval. Isomorphic: the browser pre-checks with these rules, the
// server is the authority.
import { addDays, lastEventMoment, localDay } from "@/lib/plans"
import type { InvitationConfigBase } from "@/templates/_shared/schema"

export const ALBUM_KINDS = ["image", "video"] as const
export type AlbumKind = (typeof ALBUM_KINDS)[number]

const MB = 1024 * 1024

/**
 * Originals are kept as uploaded (people download them), so the limits are
 * far above the editor's. Video stays under Cloudflare's 100 MB request body
 * limit because each file travels in one request.
 */
export const ALBUM_RULES = {
  image: {
    mimes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
    maxBytes: 25 * MB,
  },
  video: {
    mimes: ["video/mp4", "video/quicktime", "video/webm"],
    maxBytes: 95 * MB,
  },
} as const satisfies Record<
  AlbumKind,
  { mimes: ReadonlyArray<string>; maxBytes: number }
>

/** The grid shows a small preview made in the browser, never the original. */
export const ALBUM_THUMB = {
  mimes: ["image/webp", "image/jpeg"],
  maxBytes: 400 * 1024,
  maxEdge: 640,
  quality: 0.8,
} as const

/** Everything one album may hold. */
export const ALBUM_MAX_BYTES = 10 * 1024 * MB
export const ALBUM_MAX_ITEMS = 5000

/** A guest batch larger than this waits for the host's approval. */
export const BULK_THRESHOLD = 20
/** Most files one batch may carry (a zip or folder is split by the browser). */
export const BATCH_MAX_FILES = 500
/** Guests may upload through this many days after the last event day. */
export const GUEST_UPLOAD_GRACE_DAYS = 7
/** Unanswered guest batches are deleted after this many days. */
export const PENDING_BATCH_DAYS = 14

export const PIN_PATTERN = /^\d{4,8}$/

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
}

/** By file extension, for zip entries and files the browser gave no type. */
const MIME_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
}

export function albumMimeForName(name: string): string | undefined {
  const ext = /\.([a-z0-9]+)$/i.exec(name)?.[1]?.toLowerCase()
  return ext ? MIME_BY_EXT[ext] : undefined
}

export function albumKindOf(mime: string): AlbumKind | undefined {
  return ALBUM_KINDS.find((kind) =>
    (ALBUM_RULES[kind].mimes as ReadonlyArray<string>).includes(mime)
  )
}

export type AlbumCheck =
  { ok: true; kind: AlbumKind } | { ok: false; reason: string }

export function checkAlbumFile(mime: string, bytes: number): AlbumCheck {
  const kind = albumKindOf(mime)
  if (!kind) {
    return {
      ok: false,
      reason:
        "Only photos (JPEG, PNG, WebP, AVIF) and videos (MP4, MOV, WebM).",
    }
  }
  if (!Number.isInteger(bytes) || bytes <= 0) {
    return { ok: false, reason: "The file is empty." }
  }
  if (bytes > ALBUM_RULES[kind].maxBytes) {
    return {
      ok: false,
      reason: `Too large: ${kind === "image" ? "photos" : "videos"} can be up to ${ALBUM_RULES[kind].maxBytes / MB} MB.`,
    }
  }
  return { ok: true, kind }
}

export function checkAlbumThumb(mime: string, bytes: number): boolean {
  return (
    (ALBUM_THUMB.mimes as ReadonlyArray<string>).includes(mime) &&
    Number.isInteger(bytes) &&
    bytes > 0 &&
    bytes <= ALBUM_THUMB.maxBytes
  )
}

/* ---------- object keys ---------- */

/** album/<invitationId>/…: one folder per invitation, deleted as a whole. */
export const albumPrefix = (invitationId: string) => `album/${invitationId}/`

export const albumObjectKey = (
  invitationId: string,
  id: string,
  mime: string
) => `${albumPrefix(invitationId)}${id}.${EXT[mime] ?? "bin"}`

export const albumThumbKey = (invitationId: string, id: string, mime: string) =>
  `${albumPrefix(invitationId)}${id}.thumb.${mime === "image/webp" ? "webp" : "jpg"}`

export const isAlbumKey = (key: string) => key.startsWith("album/")

/* ---------- what the bytes really are ---------- */

const ascii = (bytes: Uint8Array, start: number, end: number) =>
  String.fromCharCode(...bytes.subarray(start, end))

/**
 * The media type the first bytes of a file declare, or undefined when they
 * match nothing we accept. A file is only kept when this agrees with the
 * type it was uploaded as, so renaming a file does not get it in.
 */
export function sniffMedia(head: Uint8Array): string | undefined {
  if (head.length < 12) return undefined
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) {
    return "image/jpeg"
  }
  if (
    head[0] === 0x89 &&
    ascii(head, 1, 4) === "PNG" &&
    head[4] === 0x0d &&
    head[5] === 0x0a
  ) {
    return "image/png"
  }
  if (ascii(head, 0, 4) === "RIFF" && ascii(head, 8, 12) === "WEBP") {
    return "image/webp"
  }
  if (
    head[0] === 0x1a &&
    head[1] === 0x45 &&
    head[2] === 0xdf &&
    head[3] === 0xa3
  ) {
    return "video/webm"
  }
  if (ascii(head, 4, 8) === "ftyp") {
    const brand = ascii(head, 8, 12)
    if (brand === "avif" || brand === "avis") return "image/avif"
    if (brand === "qt  ") return "video/quicktime"
    // heic/heif/mif1 are photos browsers cannot show; refuse them.
    if (/^(hei[cfsx]|hev[cx]|mif1|msf1)$/.test(brand)) return undefined
    return "video/mp4"
  }
  return undefined
}

/** MP4 and MOV share a container, and phones label them either way. */
export function sniffAgrees(declared: string, sniffed: string | undefined) {
  if (!sniffed) return false
  if (declared === sniffed) return true
  const iso = ["video/mp4", "video/quicktime"]
  return iso.includes(declared) && iso.includes(sniffed)
}

/* ---------- when guests may upload ---------- */

type DatedConfig = Pick<InvitationConfigBase, "datetime" | "event">

function firstEventMoment(config: DatedConfig): Date {
  const times = [
    config.datetime.start,
    ...config.event.subEvents.map((sub) => sub.start),
  ]
    .map((value) => Date.parse(value))
    .filter((ms) => Number.isFinite(ms))
  return new Date(Math.min(...times))
}

/**
 * The local days (YYYY-MM-DD, event time zone) on which anyone with the
 * link may upload: from the first event day through the last event day plus
 * the grace period. The host can upload at any time.
 */
export function guestUploadDays(config: DatedConfig): {
  from: string
  until: string
} {
  const zone = config.datetime.timezone
  return {
    from: localDay(firstEventMoment(config), zone),
    until: addDays(
      localDay(lastEventMoment(config), zone),
      GUEST_UPLOAD_GRACE_DAYS
    ),
  }
}

export type GuestUploadState = "before" | "open" | "closed"

export function guestUploadState(
  config: DatedConfig,
  now = new Date()
): GuestUploadState {
  const today = localDay(now, config.datetime.timezone)
  const { from, until } = guestUploadDays(config)
  return today < from ? "before" : today > until ? "closed" : "open"
}

/** "1.4 GB", "320 MB", "12 KB". */
export function formatBytes(bytes: number): string {
  if (bytes >= 1024 * MB) return `${(bytes / (1024 * MB)).toFixed(1)} GB`
  if (bytes >= MB) return `${Math.round(bytes / MB)} MB`
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}
