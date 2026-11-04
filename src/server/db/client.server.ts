// Database client. node-postgres everywhere: on Node one pool per process
// (Neon's pooled endpoint or any local Postgres); on Cloudflare Workers a
// small pool per request over Hyperdrive. The platform module picks the
// implementation at build time (src/server/platform, vite.config.ts).
export { closeDb, getDb, hasDatabase } from "@/server/platform/runtime"
export type { Db } from "@/server/platform/types"
