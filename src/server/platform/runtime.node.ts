// Node runtime: `pnpm dev`, `pnpm build` + `pnpm start`, Vitest and scripts.
// One pool per process (kept across Vite HMR reloads), local env from
// process.env, OG WASM decoded from inlined data URLs, no R2 binding.
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import { serverEnv } from "@/env.server"
import * as schema from "@/server/db/schema"
import type { Db, OgWasm, Runtime } from "./types"

type Cache = { pool?: Pool; db?: Db }
// Survive Vite HMR in dev so each reload does not open a new pool.
const cache = ((globalThis as { __alikeniDb?: Cache }).__alikeniDb ??= {})

export function getDb(): Db {
  if (cache.db) return cache.db
  const url = serverEnv.DATABASE_URL
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and paste your Neon pooled connection string."
    )
  }
  const pool = new Pool({ connectionString: url, max: 5 })
  // An idle client that errors (server restart, network drop, a protocol
  // error from the backend) emits on the pool; unhandled, that crashes the
  // process. The pool discards the broken client and opens a new one on the
  // next query. Log the message only: never the connection string.
  pool.on("error", (error) => {
    console.error(`[db] idle client error (client discarded): ${error.message}`)
  })
  cache.pool = pool
  cache.db = drizzle(pool, { schema, casing: "snake_case" })
  return cache.db
}

export async function closeDb(): Promise<void> {
  await cache.pool?.end()
  cache.pool = undefined
  cache.db = undefined
}

export const hasDatabase = (): boolean => !!serverEnv.DATABASE_URL

export const getBucket = (): undefined => undefined

async function dataUrlBytes(url: string): Promise<ArrayBuffer> {
  return (await fetch(url)).arrayBuffer()
}

/**
 * The binaries are imported as base64 data URLs (`?url&inline`): no `fs` and
 * no node_modules at runtime; `fetch` decodes a data URL everywhere.
 */
async function loadOgWasm(): Promise<OgWasm> {
  const [{ default: resvgUrl }, { default: yogaUrl }] = await Promise.all([
    import("@resvg/resvg-wasm/index_bg.wasm?url&inline"),
    import("satori/yoga.wasm?url&inline"),
  ])
  const [resvg, yoga] = await Promise.all([
    dataUrlBytes(resvgUrl),
    dataUrlBytes(yogaUrl),
  ])
  return { yoga, resvg }
}

export async function initOgWasm(
  init: (wasm: OgWasm) => Promise<void>
): Promise<void> {
  await init(await loadOgWasm())
}

/** Node has no image converter: WebP photos are left off the OG card. */
export const photoToJpeg = (
  _bytes: Uint8Array<ArrayBuffer>
): Promise<undefined> => Promise.resolve(undefined)

/** The process-wide pool outlives requests; nothing to release. */
export const endRequest = (_request: Request): Promise<void> =>
  Promise.resolve()

export const runtime = {
  name: "node",
  getDb,
  closeDb,
  hasDatabase,
  getBucket,
  initOgWasm,
  photoToJpeg,
  endRequest,
} satisfies Runtime
