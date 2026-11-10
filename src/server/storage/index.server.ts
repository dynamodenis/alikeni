import { R2_KEYS, serverEnv, type ServerEnv } from "@/env.server"
import { getBucket } from "@/server/platform/runtime"
import type { BucketLike } from "@/server/platform/types"
import { createBindingDriver } from "./binding.server"
import { createLocalDriver } from "./local.server"
import { createR2Driver } from "./r2.server"
import type { ServerStorage } from "./types"

const DEV_SECRET = "alikeni-local-storage-dev-secret"

/**
 * STORAGE_DRIVER=binding → R2 through the Worker's BUCKET binding (Workers).
 * STORAGE_DRIVER=r2 → R2 over its S3 API (env validation already guaranteed
 * every key; for Node or other non-Workers hosts).
 * STORAGE_DRIVER=local → local disk (development only).
 * Unset → R2 when fully configured, else the binding when present, else
 * local in development.
 */
export function selectStorage(
  env: ServerEnv,
  bucket: BucketLike | undefined = getBucket()
): ServerStorage {
  const complete = R2_KEYS.every((key) => !!env[key])
  const wantR2 =
    env.STORAGE_DRIVER === "r2" ||
    (env.STORAGE_DRIVER === undefined && complete)
  const wantBinding =
    env.STORAGE_DRIVER === "binding" ||
    (env.STORAGE_DRIVER === undefined && !complete && !!bucket)

  if (wantBinding) {
    if (!bucket) {
      throw new Error(
        "STORAGE_DRIVER=binding needs the BUCKET R2 binding (Cloudflare Workers, wrangler.jsonc). On Node use r2 or local."
      )
    }
    const secret =
      env.STORAGE_SIGNING_SECRET ??
      (env.NODE_ENV === "production" ? undefined : DEV_SECRET)
    if (!secret) {
      throw new Error(
        "STORAGE_SIGNING_SECRET is required for the binding storage driver in production."
      )
    }
    return createBindingDriver({
      bucket,
      secret,
      origin: env.APP_ORIGIN,
      publicUrl: env.R2_PUBLIC_URL,
    })
  }

  if (wantR2) {
    const {
      R2_ACCOUNT_ID,
      R2_ACCESS_KEY_ID,
      R2_SECRET_ACCESS_KEY,
      R2_BUCKET,
      R2_PUBLIC_URL,
    } = env
    if (
      !R2_ACCOUNT_ID ||
      !R2_ACCESS_KEY_ID ||
      !R2_SECRET_ACCESS_KEY ||
      !R2_BUCKET ||
      !R2_PUBLIC_URL
    ) {
      throw new Error(
        `Storage is set to R2 but missing: ${R2_KEYS.filter((k) => !env[k]).join(", ")}`
      )
    }
    return createR2Driver({
      accountId: R2_ACCOUNT_ID,
      accessKeyId: R2_ACCESS_KEY_ID,
      secretAccessKey: R2_SECRET_ACCESS_KEY,
      bucket: R2_BUCKET,
      publicUrl: R2_PUBLIC_URL,
    })
  }
  if (env.NODE_ENV === "production") {
    throw new Error(
      "Storage is not configured: set STORAGE_DRIVER=binding (Workers) or r2 with the R2_* variables (docs/STORAGE.md)."
    )
  }
  return createLocalDriver({
    secret: env.STORAGE_SIGNING_SECRET ?? DEV_SECRET,
    origin: env.APP_ORIGIN,
  })
}

let cached: ServerStorage | undefined
export function getStorage(): ServerStorage {
  cached ??= selectStorage(serverEnv)
  return cached
}

/** "r2" covers both R2 drivers (S3 API and Workers binding). */
export type StorageInfo = { driver: "local" | "r2" }

/** Which driver is active (the editor shows a badge for local storage). */
export function storageInfo(): StorageInfo {
  return { driver: getStorage().id === "local" ? "local" : "r2" }
}

export type { ServerStorage, StorageDriver } from "./types"
