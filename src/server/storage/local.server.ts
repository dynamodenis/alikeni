// Development storage on local disk (.storage/). Mirrors the R2 flow: the
// server signs a short-lived URL, the browser PUTs to /api/storage/upload,
// files are served from /api/storage/file/<key>. Never used in production
// (the Workers `binding` driver reuses the same signed-PUT flow).
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises"
import { dirname, join, resolve } from "node:path"
import { createSignedUploadTarget, verifyUpload } from "./signing"
import type { ServerStorage } from "./types"

export { signUpload, verifyUpload, type SignedUpload } from "./signing"

export const LOCAL_ROOT = resolve(".storage")

export type LocalConfig = { secret: string; origin: string; root?: string }

/** Resolve a key inside the root; throws on any path escape. */
export function pathFor(root: string, key: string): string {
  const full = resolve(root, key)
  if (!full.startsWith(root + "/")) throw new Error("Invalid key")
  return full
}

export async function writeLocalObject(
  root: string,
  key: string,
  mime: string,
  body: Uint8Array
) {
  const file = pathFor(root, key)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, body)
  await writeFile(
    `${file}.meta.json`,
    JSON.stringify({ mime, bytes: body.byteLength })
  )
}

export async function readLocalObject(root: string, key: string) {
  const file = pathFor(root, key)
  try {
    const meta = JSON.parse(await readFile(`${file}.meta.json`, "utf8")) as {
      mime: string
    }
    return { body: await readFile(file), mime: meta.mime }
  } catch {
    return null
  }
}

export function createLocalDriver(config: LocalConfig): ServerStorage {
  const root = config.root ?? LOCAL_ROOT
  const origin = config.origin.replace(/\/$/, "")
  return {
    id: "local",

    createUploadTarget: (input) =>
      Promise.resolve(createSignedUploadTarget(config.secret, origin, input)),

    verifyUpload: (upload, sig) => verifyUpload(config.secret, upload, sig),

    async readRange(key, start, end) {
      const object = await readLocalObject(root, key)
      return object
        ? new Uint8Array(object.body).subarray(start, end + 1)
        : null
    },

    async head(key) {
      try {
        const file = pathFor(root, key)
        const meta = JSON.parse(
          await readFile(`${file}.meta.json`, "utf8")
        ) as { mime: string }
        return { bytes: (await stat(file)).size, mime: meta.mime }
      } catch {
        return null
      }
    },

    async delete(key) {
      const file = pathFor(root, key)
      await rm(file, { force: true })
      await rm(`${file}.meta.json`, { force: true })
    },

    put: (key, bytes, contentType) =>
      writeLocalObject(root, key, contentType, bytes),

    async get(key) {
      const object = await readLocalObject(root, key)
      return object
        ? { body: new Uint8Array(object.body), mime: object.mime }
        : null
    },

    publicUrl: (key) =>
      `${origin}/api/storage/file/${key.split("/").map(encodeURIComponent).join("/")}`,
  }
}

export { join }
