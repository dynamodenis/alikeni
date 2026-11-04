// Cloudflare R2 through the Worker's `BUCKET` binding (STORAGE_DRIVER=binding).
// No S3 credentials: the Worker talks to its bucket directly. Browser uploads
// use the same flow as the local driver: the server signs a short-lived URL
// (HMAC, ≤ 10 min, type and size bound), the browser PUTs it to our
// /api/storage/upload route, which re-checks type and size and writes here.
// Files are read back from R2_PUBLIC_URL when the bucket has public access,
// otherwise through /api/storage/file/<key> (Range-capable).
import type { BucketLike } from "@/server/platform/types"
import { createSignedUploadTarget, verifyUpload } from "./signing"
import type { Bytes, ServerStorage } from "./types"

export type BindingConfig = {
  bucket: BucketLike
  /** HMAC secret for upload URLs (STORAGE_SIGNING_SECRET). */
  secret: string
  /** APP_ORIGIN: where /api/storage/* lives. */
  origin: string
  /** R2_PUBLIC_URL (r2.dev or custom domain); unset → served by our route. */
  publicUrl?: string
}

const encodeKey = (key: string) =>
  key.split("/").map(encodeURIComponent).join("/")

export function createBindingDriver(
  config: BindingConfig
): ServerStorage & { id: "binding" } {
  const { bucket } = config
  const origin = config.origin.replace(/\/$/, "")
  const publicBase = config.publicUrl?.replace(/\/$/, "")

  return {
    id: "binding",

    createUploadTarget: (input) =>
      Promise.resolve(createSignedUploadTarget(config.secret, origin, input)),

    verifyUpload: (upload, sig) => verifyUpload(config.secret, upload, sig),

    async head(key) {
      const object = await bucket.head(key)
      if (!object) return null
      return {
        bytes: object.size,
        mime: object.httpMetadata?.contentType ?? "application/octet-stream",
      }
    },

    delete: (key) => bucket.delete(key),

    async put(key, bytes, contentType) {
      await bucket.put(key, bytes, { httpMetadata: { contentType } })
    },

    async get(key) {
      const object = await bucket.get(key)
      if (!object) return null
      return {
        body: object.body as ReadableStream<Bytes>,
        mime: object.httpMetadata?.contentType ?? "application/octet-stream",
      }
    },

    async readRange(key, start, end) {
      const object = await bucket.get(key, {
        range: { offset: start, length: end - start + 1 },
      })
      return object ? (object.body as ReadableStream<Bytes>) : null
    },

    publicUrl: (key) =>
      publicBase
        ? `${publicBase}/${encodeKey(key)}`
        : `${origin}/api/storage/file/${encodeKey(key)}`,
  }
}
