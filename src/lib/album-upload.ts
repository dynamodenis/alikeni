// Uploading a batch of album files from the browser: open the batch, then
// for each file make a preview, get signed URLs, PUT the bytes straight to
// storage and confirm. A few files travel at once; one failing does not stop
// the rest.
import { makeThumb } from "@/lib/album-thumbs"
import type { AlbumFile } from "@/lib/album-files"
import { putWithProgress } from "@/lib/upload-request"
import {
  confirmAlbumItemFn,
  finishAlbumBatchFn,
  prepareAlbumItemFn,
  startAlbumBatchFn,
} from "@/server/album/album.functions"

/** The host (by invitation) or a guest (by slug, with the PIN's access key). */
export type AlbumUploader =
  { invitationId: string } | { slug: string; access?: string }

export type BatchProgress = {
  /** Files finished (uploaded or failed). */
  done: number
  total: number
  /** 0–100 across all bytes. */
  percent: number
}

export type BatchResult = {
  uploaded: number
  failed: Array<{ name: string; reason: string }>
  needsApproval: boolean
}

const CONCURRENCY = 3

const reasonOf = (error: unknown) =>
  error instanceof Error ? error.message : "Upload failed"

export async function uploadAlbumBatch(input: {
  who: AlbumUploader
  name: string
  files: Array<AlbumFile>
  device?: string
  turnstileToken?: string
  onProgress?: (progress: BatchProgress) => void
}): Promise<BatchResult> {
  const { who, files, onProgress } = input
  const { batchId } = await startAlbumBatchFn({
    data: {
      who,
      name: input.name,
      count: files.length,
      device: input.device,
      turnstileToken: input.turnstileToken,
    },
  })

  const totalBytes = files.reduce((sum, item) => sum + item.file.size, 0) || 1
  const sent = new Array<number>(files.length).fill(0)
  const failed: BatchResult["failed"] = []
  let done = 0
  const report = () =>
    onProgress?.({
      done,
      total: files.length,
      percent: Math.min(
        100,
        Math.round((sent.reduce((a, b) => a + b, 0) / totalBytes) * 100)
      ),
    })

  async function uploadOne(index: number) {
    const { file, mime, kind } = files[index]
    try {
      const thumb = await makeThumb(file, kind)
      const prepared = await prepareAlbumItemFn({
        data: {
          who,
          batchId,
          mime,
          bytes: file.size,
          thumb: thumb.blob
            ? { mime: thumb.blob.type, bytes: thumb.blob.size }
            : undefined,
        },
      })
      await putWithProgress(prepared.upload, file, (percent) => {
        sent[index] = (file.size * percent) / 100
        report()
      })
      // A preview that fails to upload is not worth failing the file for.
      const thumbSent =
        !!prepared.thumb &&
        !!thumb.blob &&
        (await putWithProgress(prepared.thumb, thumb.blob).then(
          () => true,
          () => false
        ))
      await confirmAlbumItemFn({
        data: {
          who,
          batchId,
          itemId: prepared.itemId,
          mime,
          thumbMime: thumbSent ? thumb.blob?.type : undefined,
          width: thumb.width,
          height: thumb.height,
          durationSec: thumb.durationSec || undefined,
        },
      })
    } catch (error) {
      failed.push({ name: file.name, reason: reasonOf(error) })
    } finally {
      sent[index] = file.size
      done += 1
      report()
    }
  }

  let next = 0
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, files.length) }, async () => {
      while (next < files.length) await uploadOne(next++)
    })
  )

  const finished = await finishAlbumBatchFn({ data: { who, batchId } })
  return {
    uploaded: finished.count,
    failed,
    needsApproval: finished.needsApproval && finished.count > 0,
  }
}
