// Media is addressed by its storage key. Every photo and audio reference in
// an invitation is saved as `{ assetKey, url }`; the key is the truth and the
// saved `url` is only a record of where the file was served from when it was
// uploaded. Whenever a config leaves the server, each `url` is rebuilt from
// the key and the current public address, so moving the bucket or changing
// `R2_PUBLIC_URL` moves every existing invitation with it.

/** Folder all uploads live under (`ownerPrefix` in upload-policy.ts). */
const UPLOADS_PREFIX = "useruploads/"

/**
 * Whether a key names a file in our own storage. Sample content in template
 * defaults uses keys like `samples/…` with an outside URL: those are left
 * alone.
 */
export const isStoredKey = (key: string): boolean =>
  key.startsWith(UPLOADS_PREFIX)

type Plain = Record<string, unknown>
const isPlain = (value: unknown): value is Plain =>
  typeof value === "object" && value !== null && !Array.isArray(value)

/**
 * A copy of `value` in which every `{ assetKey, url }` that points into our
 * storage has its `url` built by `publicUrl(assetKey)`. Works on anything
 * (a config, a list of rows, a whole server response); parts that do not
 * change keep their identity.
 */
export function withMediaUrls<T>(
  value: T,
  publicUrl: (key: string) => string
): T {
  if (Array.isArray(value)) {
    const items: ReadonlyArray<unknown> = value
    const next = items.map((item) => withMediaUrls(item, publicUrl))
    return (next.some((item, i) => item !== items[i]) ? next : value) as T
  }
  if (!isPlain(value)) return value
  let out: Plain | undefined
  for (const [key, item] of Object.entries(value)) {
    const mapped = withMediaUrls(item, publicUrl)
    if (mapped !== item) (out ??= { ...value })[key] = mapped
  }
  const { assetKey, url } = value
  if (
    typeof assetKey === "string" &&
    typeof url === "string" &&
    isStoredKey(assetKey)
  ) {
    const current = publicUrl(assetKey)
    if (current !== url) (out ??= { ...value }).url = current
  }
  return (out ?? value) as T
}
