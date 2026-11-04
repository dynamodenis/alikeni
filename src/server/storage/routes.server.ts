// Request handlers behind /api/storage/upload and /api/storage/file/<key>,
// for the drivers that route uploads and reads through this app (`local` in
// development, `binding` on Workers). Kept out of the route files so they
// can be tested against any driver.
import { ObjectKey, checkUpload, type MediaKind } from "@/lib/upload-policy"
import type { ServerStorage } from "./types"

const notFound = () => new Response("Not found", { status: 404 })

/**
 * The browser's signed PUT: HMAC over key, type, size and expiry (≤ 10 min),
 * the Content-Type header must equal the signed type, and the body may not
 * exceed the signed size or the media policy.
 */
export async function handleSignedUpload(
  request: Request,
  storage: ServerStorage
): Promise<Response> {
  if (!storage.verifyUpload) return notFound()
  const q = new URL(request.url).searchParams
  const key = q.get("key") ?? ""
  const mime = q.get("mime") ?? ""
  const bytes = Number(q.get("bytes"))
  const exp = Number(q.get("exp"))
  const sig = q.get("sig") ?? ""

  if (
    !ObjectKey.safeParse(key).success ||
    !storage.verifyUpload({ key, mime, bytes, exp }, sig)
  ) {
    return new Response("Invalid or expired upload URL", { status: 403 })
  }
  if (request.headers.get("content-type") !== mime) {
    return new Response("Content-Type does not match the signed type", {
      status: 400,
    })
  }
  const declared = Number(request.headers.get("content-length") ?? 0)
  if (declared > bytes) {
    return new Response("Larger than signed", { status: 413 })
  }
  const kind: MediaKind = key.split("/")[2] === "audio" ? "audio" : "image"
  const body = new Uint8Array(await request.arrayBuffer())
  const verdict = checkUpload(kind, mime, body.byteLength)
  if (!verdict.ok || body.byteLength > bytes) {
    return new Response(verdict.ok ? "Larger than signed" : verdict.reason, {
      status: 413,
    })
  }
  await storage.put(key, body, mime)
  return new Response(null, { status: 200 })
}

export type ByteRange = { start: number; end: number }

/**
 * Parses a single `bytes=` range against an object size. null: no (or an
 * unsupported) Range header, serve everything; "unsatisfiable": 416.
 */
export function parseRange(
  header: string | null,
  size: number
): ByteRange | "unsatisfiable" | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header?.trim() ?? "")
  if (!match || (!match[1] && !match[2])) return null
  let start: number
  let end: number
  if (match[1]) {
    start = Number(match[1])
    end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
  } else {
    start = Math.max(0, size - Number(match[2]))
    end = size - 1
  }
  if (start > end || start >= size) return "unsatisfiable"
  return { start, end }
}

/**
 * Serves a stored object with HTTP Range support (Safari will not play audio
 * from a server that ignores Range). Keys are immutable, so cache for a year.
 */
export async function serveStoredFile(
  request: Request,
  rawKey: string,
  storage: ServerStorage
): Promise<Response> {
  if (!storage.readRange) return notFound()
  const key = decodeURIComponent(rawKey)
  if (!ObjectKey.safeParse(key).success) return notFound()
  const info = await storage.head(key)
  if (!info) return notFound()

  const size = info.bytes
  const headers: Record<string, string> = {
    "Content-Type": info.mime,
    "Accept-Ranges": "bytes",
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  }
  const range = parseRange(request.headers.get("range"), size)
  if (range === "unsatisfiable") {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${size}` },
    })
  }
  if (size === 0) {
    return new Response(null, {
      headers: { ...headers, "Content-Length": "0" },
    })
  }
  const { start, end } = range ?? { start: 0, end: size - 1 }
  const body = await storage.readRange(key, start, end)
  if (!body) return notFound()
  const length = String(end - start + 1)
  if (!range) {
    return new Response(body, {
      headers: { ...headers, "Content-Length": length },
    })
  }
  return new Response(body, {
    status: 206,
    headers: {
      ...headers,
      "Content-Range": `bytes ${start}-${end}/${size}`,
      "Content-Length": length,
    },
  })
}
