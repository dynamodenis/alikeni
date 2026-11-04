// The seam between Festly and the host runtime. Two implementations exist:
// `runtime.node.ts` (dev server, Node build, Vitest) and `runtime.workers.ts`
// (Cloudflare Workers build). Code imports `@/server/platform/runtime`; the
// Vite alias in vite.config.ts picks the file, so no runtime `if` decides it.
import type { NodePgDatabase } from "drizzle-orm/node-postgres"
import type * as schema from "@/server/db/schema"

export type Db = NodePgDatabase<typeof schema>

/** The subset of an R2 object's metadata Festly reads. */
export type BucketObjectInfo = {
  size: number
  httpMetadata?: { contentType?: string }
}

/** Byte range for a ranged read (R2 `R2Range` shape). */
export type BucketRange =
  | { offset: number; length?: number }
  | { offset?: number; length: number }
  | { suffix: number }

export type BucketObjectBody = BucketObjectInfo & {
  body: ReadableStream<Uint8Array>
  range?: BucketRange
}

/**
 * The subset of the R2 binding API (`env.BUCKET`) the binding storage driver
 * uses. Structural, so tests can pass an in-memory fake and Node code does not
 * need the Workers type package.
 */
export interface BucketLike {
  head: (key: string) => Promise<BucketObjectInfo | null>
  get: (
    key: string,
    options?: { range?: BucketRange }
  ) => Promise<BucketObjectBody | null>
  put: (
    key: string,
    value: ArrayBuffer | Uint8Array<ArrayBuffer>,
    options?: { httpMetadata?: { contentType?: string } }
  ) => Promise<unknown>
  delete: (key: string) => Promise<void>
}

/** The OG card's WASM engines, as bytes (Node) or precompiled modules (Workers). */
export type OgWasm = {
  yoga: ArrayBuffer | WebAssembly.Module
  resvg: ArrayBuffer | WebAssembly.Module
}

export interface Runtime {
  readonly name: "node" | "workers"
  /** Drizzle client. On Workers it resolves to the current request's pool. */
  getDb: () => Db
  /** Close database connections (scripts and tests; no-op on Workers). */
  closeDb: () => Promise<void>
  /** Whether a database is configured (DATABASE_URL or the Hyperdrive binding). */
  hasDatabase: () => boolean
  /** The R2 binding, when the runtime has one. */
  getBucket: () => BucketLike | undefined
  /**
   * Hand the OG card's WASM to `init` (satori + resvg) in whatever form and
   * environment the runtime needs.
   */
  initOgWasm: (init: (wasm: OgWasm) => Promise<void>) => Promise<void>
  /**
   * Release per-request resources once the response is produced (global
   * request middleware calls it). Returns a promise the host may wait on.
   */
  endRequest: (request: Request) => Promise<void>
}
