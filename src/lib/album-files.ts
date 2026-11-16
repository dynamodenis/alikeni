// Turning what a person picked (photos, a folder, a .zip) into a list of
// album files, entirely in the browser. A zip is read as a stream and its
// entries become ordinary Files, so the upload path is the same for all
// three and nothing is sent before the person has seen the preview.
import { Unzip, UnzipInflate } from "fflate"
import {
  BATCH_MAX_FILES,
  albumKindOf,
  albumMimeForName,
  checkAlbumFile,
  sniffAgrees,
  sniffMedia,
  type AlbumKind,
} from "@/lib/album"

export type AlbumFile = { file: File; mime: string; kind: AlbumKind }
export type SkippedFile = { name: string; reason: string }
export type Gathered = {
  files: Array<AlbumFile>
  skipped: Array<SkippedFile>
}

const baseName = (path: string) => path.split("/").pop() ?? path

/** macOS resource forks, dotfiles and folders inside archives. */
const isJunk = (path: string) =>
  path.endsWith("/") ||
  path.startsWith("__MACOSX/") ||
  baseName(path).startsWith(".")

export const isZip = (file: File) =>
  /\.zip$/i.test(file.name) ||
  file.type === "application/zip" ||
  file.type === "application/x-zip-compressed"

/** Check one file against the album rules and its own first bytes. */
async function accept(file: File): Promise<AlbumFile | SkippedFile> {
  const name = baseName(file.name)
  const mime =
    (albumKindOf(file.type) ? file.type : undefined) ??
    albumMimeForName(file.name)
  if (!mime) return { name, reason: "Not a photo or video" }
  const verdict = checkAlbumFile(mime, file.size)
  if (!verdict.ok) return { name, reason: verdict.reason }
  const head = new Uint8Array(await file.slice(0, 32).arrayBuffer())
  if (!sniffAgrees(mime, sniffMedia(head))) {
    return { name, reason: "Not a photo or video we can show" }
  }
  const typed =
    file.type === mime ? file : new File([file], name, { type: mime })
  return { file: typed, mime, kind: verdict.kind }
}

/** Entries of a zip as Files, read chunk by chunk (the zip is never held whole). */
async function unzip(
  zip: File,
  onEntry: (count: number) => void
): Promise<{ files: Array<File>; skipped: Array<SkippedFile> }> {
  const files: Array<File> = []
  const skipped: Array<SkippedFile> = []
  let failure: unknown

  const unzipper = new Unzip((entry) => {
    const name = baseName(entry.name)
    const mime = albumMimeForName(entry.name)
    if (isJunk(entry.name)) return
    if (!mime) {
      skipped.push({ name, reason: "Not a photo or video" })
      return
    }
    if (files.length + 1 > BATCH_MAX_FILES) {
      skipped.push({
        name,
        reason: `Only ${BATCH_MAX_FILES} files per upload`,
      })
      return
    }
    const verdict = checkAlbumFile(mime, entry.originalSize ?? 1)
    if (!verdict.ok) {
      skipped.push({ name, reason: verdict.reason })
      return
    }
    const chunks: Array<Uint8Array<ArrayBuffer>> = []
    entry.ondata = (error, chunk, final) => {
      if (error) {
        failure = error
        return
      }
      chunks.push(chunk.slice())
      if (final) {
        files.push(new File(chunks, name, { type: mime }))
        onEntry(files.length)
      }
    }
    entry.start()
  })
  unzipper.register(UnzipInflate)

  const reader = zip.stream().getReader()
  for (;;) {
    const { done, value } = await reader.read()
    if (failure) throw new Error("That zip file could not be read.")
    if (done) {
      unzipper.push(new Uint8Array(0), true)
      break
    }
    unzipper.push(value)
  }
  if (failure) throw new Error("That zip file could not be read.")
  return { files, skipped }
}

/**
 * Everything usable in a selection. Zips are opened; other files are taken
 * as they are. `onProgress` reports how many files have been found so far.
 */
export async function gatherAlbumFiles(
  picked: Iterable<File>,
  onProgress?: (found: number) => void
): Promise<Gathered> {
  const files: Array<AlbumFile> = []
  const skipped: Array<SkippedFile> = []
  const candidates: Array<File> = []

  for (const file of picked) {
    if (isZip(file)) {
      const opened = await unzip(file, (count) =>
        onProgress?.(candidates.length + count)
      )
      candidates.push(...opened.files)
      skipped.push(...opened.skipped)
    } else if (!isJunk(file.name)) {
      candidates.push(file)
    }
    onProgress?.(candidates.length)
  }

  for (const file of candidates) {
    if (files.length >= BATCH_MAX_FILES) {
      skipped.push({
        name: baseName(file.name),
        reason: `Only ${BATCH_MAX_FILES} files per upload`,
      })
      continue
    }
    const result = await accept(file)
    if ("file" in result) files.push(result)
    else skipped.push(result)
  }
  return { files, skipped }
}
