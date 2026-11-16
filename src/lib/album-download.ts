// Saving album files from the browser: one at a time, or everything as zip
// files built on the device. Large albums are split into several zips so a
// phone does not have to hold the whole album in memory.
import { Zip, ZipPassThrough } from "fflate"

export type Downloadable = {
  id: string
  url: string
  mime: string
  bytes: number
  createdAt: string
}

/** Most files and bytes in one zip part. */
export const ZIP_PART_FILES = 200
export const ZIP_PART_BYTES = 400 * 1024 * 1024

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
}

/** "2027-06-12_a1b2c3d4.jpg": sortable by day, unique by id. */
export const fileNameFor = (item: Downloadable) =>
  `${item.createdAt.slice(0, 10)}_${item.id.slice(0, 8)}.${EXT[item.mime] ?? "bin"}`

export function saveBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = name
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

async function fetchBlob(url: string): Promise<Blob> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download failed (${response.status})`)
  return response.blob()
}

export async function downloadOne(item: Downloadable) {
  try {
    saveBlob(await fetchBlob(item.url), fileNameFor(item))
  } catch {
    // Storage on another origin without CORS: let the browser open it.
    window.open(item.url, "_blank", "noopener")
  }
}

/** Split into parts that each stay under the file and byte limits. */
export function zipParts<T extends { bytes: number }>(
  items: ReadonlyArray<T>
): Array<Array<T>> {
  const parts: Array<Array<T>> = []
  let part: Array<T> = []
  let bytes = 0
  for (const item of items) {
    if (
      part.length > 0 &&
      (part.length >= ZIP_PART_FILES || bytes + item.bytes > ZIP_PART_BYTES)
    ) {
      parts.push(part)
      part = []
      bytes = 0
    }
    part.push(item)
    bytes += item.bytes
  }
  if (part.length > 0) parts.push(part)
  return parts
}

/** Stored (uncompressed) zip: photos and videos do not compress further. */
async function buildZip(
  items: ReadonlyArray<Downloadable>,
  onFile: () => void
): Promise<{ blob: Blob; missed: number }> {
  const chunks: Array<Uint8Array<ArrayBuffer>> = []
  let missed = 0
  const done = new Promise<void>((resolve, reject) => {
    const zip = new Zip((error, chunk, final) => {
      if (error) return reject(error)
      chunks.push(chunk.slice())
      if (final) resolve()
    })
    void (async () => {
      for (const item of items) {
        try {
          const bytes = new Uint8Array(
            await (await fetchBlob(item.url)).arrayBuffer()
          )
          const entry = new ZipPassThrough(fileNameFor(item))
          zip.add(entry)
          entry.push(bytes, true)
        } catch {
          missed += 1
        }
        onFile()
      }
      zip.end()
    })()
  })
  await done
  return { blob: new Blob(chunks, { type: "application/zip" }), missed }
}

/** A chosen few: one file as it is, several as a zip. */
export async function downloadSome(
  items: ReadonlyArray<Downloadable>,
  albumName: string,
  onProgress?: (done: number, total: number) => void
): Promise<number> {
  if (items.length === 1) {
    await downloadOne(items[0])
    return 0
  }
  return downloadAll(items, albumName, onProgress)
}

/**
 * Download every item as one or more zip files named after the album.
 * Returns how many files could not be fetched.
 */
export async function downloadAll(
  items: ReadonlyArray<Downloadable>,
  albumName: string,
  onProgress?: (done: number, total: number) => void
): Promise<number> {
  const parts = zipParts(items)
  const safe =
    albumName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "album"
  let done = 0
  let missed = 0
  for (const [index, part] of parts.entries()) {
    const built = await buildZip(part, () => onProgress?.(++done, items.length))
    missed += built.missed
    saveBlob(
      built.blob,
      parts.length === 1 ? `${safe}.zip` : `${safe}-${index + 1}.zip`
    )
  }
  return missed
}
