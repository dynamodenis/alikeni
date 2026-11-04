// Signed upload URLs for drivers that receive the browser's PUT on our own
// route (`local`, `binding`): HMAC-SHA256 over key, type, size and expiry.
// node:crypto works on Node and on Workers (nodejs_compat).
import { createHmac, timingSafeEqual } from "node:crypto"
import type { UploadTarget } from "./types"
import { UPLOAD_TTL_SECONDS } from "./types"

export type SignedUpload = {
  key: string
  mime: string
  bytes: number
  exp: number
}

export function signUpload(secret: string, u: SignedUpload): string {
  return createHmac("sha256", secret)
    .update(`${u.key}\n${u.mime}\n${u.bytes}\n${u.exp}`)
    .digest("hex")
}

export function verifyUpload(
  secret: string,
  u: SignedUpload,
  sig: string,
  now = Date.now()
): boolean {
  if (!Number.isFinite(u.exp) || u.exp * 1000 < now) return false
  // A forged far-future expiry still needs a valid signature, but refuse
  // anything beyond the TTL outright (clock skew allowance: 60 s).
  if (u.exp * 1000 > now + (UPLOAD_TTL_SECONDS + 60) * 1000) return false
  if (!/^[0-9a-f]{64}$/.test(sig)) return false
  const expected = Buffer.from(signUpload(secret, u), "hex")
  const given = Buffer.from(sig, "hex")
  return expected.length === given.length && timingSafeEqual(expected, given)
}

/** `PUT <origin>/api/storage/upload?key&mime&bytes&exp&sig`, valid 10 minutes. */
export function createSignedUploadTarget(
  secret: string,
  origin: string,
  { key, mime, bytes }: { key: string; mime: string; bytes: number },
  now = Date.now()
): UploadTarget {
  const exp = Math.floor(now / 1000) + UPLOAD_TTL_SECONDS
  const sig = signUpload(secret, { key, mime, bytes, exp })
  const qs = new URLSearchParams({
    key,
    mime,
    bytes: String(bytes),
    exp: String(exp),
    sig,
  })
  return {
    url: `${origin.replace(/\/$/, "")}/api/storage/upload?${qs.toString()}`,
    method: "PUT",
    headers: { "Content-Type": mime },
    expiresAt: new Date(exp * 1000).toISOString(),
  }
}
