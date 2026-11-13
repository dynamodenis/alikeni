// Cloudflare Workers runtime, selected by `pnpm build:worker` through the
// Vite alias in vite.config.ts. Never imported by Node code or Vitest.
//
// Database: Workers forbid sharing I/O objects (sockets) between requests, so
// a pool created while serving one request cannot be used by the next. Each
// request gets its own small node-postgres pool over Hyperdrive (which does
// the real pooling at the edge), cached in a WeakMap keyed by the current
// `Request` from TanStack Start's request context (its AsyncLocalStorage):
// every server function, loader and server route of one request shares it,
// and it is garbage collected with the request. `getDb()` returns a stable
// proxy that resolves to the current request's client on each property
// access, so callers that keep the db (Better Auth's adapter is created once
// per isolate) still talk to the right request's connection.
import { env, waitUntil } from "cloudflare:workers"
import { getRequest } from "@tanstack/react-start/server"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm"
import yogaWasm from "satori/yoga.wasm"
import * as schema from "@/server/db/schema"
import type { BucketLike, BucketObjectBody, Db, OgWasm, Runtime } from "./types"

// The generated Env types the bindings as always present; a wrangler.jsonc
// without them must still fail with a clear message, so treat them as optional.
const bindings: Partial<
  Pick<Cloudflare.Env, "HYPERDRIVE" | "BUCKET" | "IMAGES">
> = env

type Entry = { pool: Pool; db: Db; ending: boolean }
const perRequest = new WeakMap<Request, Entry>()

function connectionString(): string {
  const url = bindings.HYPERDRIVE?.connectionString || process.env.DATABASE_URL
  if (!url) {
    throw new Error(
      "No database: bind Hyperdrive as HYPERDRIVE in wrangler.jsonc (docs/DEPLOY.md)."
    )
  }
  return url
}

function currentRequest(): Request {
  try {
    return getRequest()
  } catch {
    throw new Error(
      "getDb() on Workers must run inside a request (server function, loader or server route)."
    )
  }
}

function currentEntry(): Entry {
  const request = currentRequest()
  let entry = perRequest.get(request)
  if (!entry) {
    // max 5: a request runs a few queries in parallel at most; Hyperdrive
    // pools the real database connections.
    const pool = new Pool({ connectionString: connectionString(), max: 5 })
    const created: Entry = {
      pool,
      db: drizzle(pool, { schema, casing: "snake_case" }),
      ending: false,
    }
    // Same as Node: an erroring idle client must not take the isolate down.
    // Message only, never the connection string. Closing the pool makes the
    // Workers socket report "This socket has been closed"; that is expected.
    pool.on("error", (error) => {
      if (created.ending) return
      console.error(
        `[db] idle client error (client discarded): ${error.message}`
      )
    })
    entry = created
    perRequest.set(request, entry)
  }
  return entry
}

const requestDb = new Proxy({} as Db, {
  get(_target, prop) {
    const db = currentEntry().db
    const value: unknown = Reflect.get(db, prop, db)
    return typeof value === "function" ? value.bind(db) : value
  },
  has(_target, prop) {
    return Reflect.has(currentEntry().db, prop)
  },
})

export const getDb = (): Db => requestDb

export const closeDb = (): Promise<void> => Promise.resolve()

export const hasDatabase = (): boolean =>
  !!bindings.HYPERDRIVE || !!process.env.DATABASE_URL

/** Adapts the R2 binding to the structural `BucketLike` the driver uses. */
function bucketAdapter(bucket: R2Bucket): BucketLike {
  return {
    head: (key) => bucket.head(key),
    async get(key, options) {
      const object = await bucket.get(
        key,
        options?.range ? { range: options.range } : undefined
      )
      if (!object) return null
      const body: BucketObjectBody = {
        body: object.body,
        size: object.size,
        httpMetadata: object.httpMetadata,
        range: object.range,
      }
      return body
    },
    put: (key, value, options) => bucket.put(key, value, options),
    delete: (key) => bucket.delete(key),
  }
}

let bucket: BucketLike | undefined
export function getBucket(): BucketLike | undefined {
  if (!bindings.BUCKET) return undefined
  return (bucket ??= bucketAdapter(bindings.BUCKET))
}

/**
 * Workers cannot compile WebAssembly from bytes at runtime. The Cloudflare
 * Vite plugin turns the `.wasm` imports above into precompiled
 * `WebAssembly.Module`s uploaded with the Worker (CompiledWasm modules).
 *
 * Known limitation (docs/DEPLOY.md): satori 0.63 also embeds HarfBuzz as
 * base64 and compiles it at first render (plus small trampoline modules via
 * `new WebAssembly.Module(bytes)`), which Workers refuse ("Wasm code
 * generation disallowed by embedder"), so OG cards cannot render on Workers
 * until satori is pinned to a build without embedded HarfBuzz.
 */
export async function initOgWasm(
  init: (wasm: OgWasm) => Promise<void>
): Promise<void> {
  await init({ yoga: yogaWasm, resvg: resvgWasm })
}

/**
 * WebP (what uploads are stored as) → JPEG for the OG card, through the
 * Cloudflare Images binding. Undefined without the binding or on any error:
 * the card then renders without the photo.
 */
export async function photoToJpeg(
  bytes: Uint8Array<ArrayBuffer>
): Promise<Uint8Array<ArrayBuffer> | undefined> {
  if (!bindings.IMAGES) return undefined
  try {
    const source = new Response(bytes).body
    if (!source) return undefined
    const output = await bindings.IMAGES.input(source)
      .transform({ width: 1200, fit: "scale-down" })
      .output({ format: "image/jpeg", quality: 82 })
    return new Uint8Array(await output.response().arrayBuffer())
  } catch (error) {
    console.warn("[og] photo conversion failed", error)
    return undefined
  }
}

/**
 * Close this request's pool after the response is produced. `pool.end()`
 * waits for checked-out clients; `waitUntil` keeps the isolate alive for it.
 * Loaders run before streaming starts and Alikeni has no deferred loader
 * data, so no query runs after this point.
 */
export function endRequest(request: Request): Promise<void> {
  let key: Request = request
  let entry = perRequest.get(key)
  if (!entry) {
    try {
      key = getRequest()
      entry = perRequest.get(key)
    } catch {
      return Promise.resolve()
    }
  }
  if (!entry) return Promise.resolve()
  perRequest.delete(key)
  entry.ending = true
  const done = entry.pool.end().catch((error: unknown) => {
    console.error("[db] closing the request pool failed", error)
  })
  waitUntil(done)
  return done
}

export const runtime = {
  name: "workers",
  getDb,
  closeDb,
  hasDatabase,
  getBucket,
  initOgWasm,
  photoToJpeg,
  endRequest,
} satisfies Runtime
