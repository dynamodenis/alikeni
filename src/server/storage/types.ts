/** A signed, short-lived instruction for the browser to upload one object directly. */
export type UploadTarget = {
  url: string
  method: "PUT"
  /** Headers the browser must send exactly (they are part of the signature). */
  headers: Record<string, string>
  expiresAt: string
}

export type ObjectInfo = { bytes: number; mime: string }

/**
 * Object storage behind uploads. Bytes never pass through server functions:
 * the server signs, the browser PUTs, the server confirms with `head`.
 */
export interface StorageDriver {
  readonly id: "r2" | "local" | "binding"
  createUploadTarget: (input: {
    key: string
    mime: string
    bytes: number
  }) => Promise<UploadTarget>
  head: (key: string) => Promise<ObjectInfo | null>
  delete: (key: string) => Promise<void>
  publicUrl: (key: string) => string
}

/** Bytes backed by a plain ArrayBuffer (what `fetch`/`Response` accept). */
export type Bytes = Uint8Array<ArrayBuffer>

/** An object read back on the server. */
export type StoredObject = {
  body: ReadableStream<Bytes> | Bytes
  mime: string
}

/**
 * Server-side reads and writes for objects the server itself produces (OG
 * cards). Kept apart from `StorageDriver` so code and tests that only need the
 * upload flow do not have to implement it.
 */
export interface ServerObjects {
  put: (key: string, bytes: Bytes, contentType: string) => Promise<void>
  /** null when the object does not exist. */
  get: (key: string) => Promise<StoredObject | null>
}

/**
 * Drivers whose browser uploads and file reads go through our own routes
 * (`local`, `binding`): `/api/storage/upload` checks the HMAC-signed PUT and
 * writes with `put`; `/api/storage/file/<key>` serves with `readRange`.
 * The `r2` driver has neither (the browser talks to R2 directly).
 */
export interface RouteServedStorage {
  verifyUpload: (
    upload: { key: string; mime: string; bytes: number; exp: number },
    sig: string
  ) => boolean
  /** Bytes `start..end` (inclusive) of an object, or null when missing. */
  readRange: (
    key: string,
    start: number,
    end: number
  ) => Promise<ReadableStream<Bytes> | Bytes | null>
}

/** What `getStorage()` returns: both halves, plus the route hooks if any. */
export type ServerStorage = StorageDriver &
  ServerObjects &
  Partial<RouteServedStorage>

/** Presigned URLs live at most 10 minutes (build prompt, Phase 8 security). */
export const UPLOAD_TTL_SECONDS = 600
