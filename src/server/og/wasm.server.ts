// The two WASM engines behind the OG card: satori's layout engine (yoga) and
// resvg (SVG → PNG). Both are loaded once per process / isolate.
//
// Where the binaries come from depends on the runtime (src/server/platform):
// - Node (Vite dev, the Node build, Vitest): base64 data URLs decoded to
//   bytes, so no `fs` and no node_modules at runtime.
// - Cloudflare Workers: precompiled `WebAssembly.Module`s, because Workers
//   refuse to compile WASM from bytes at runtime.
// Both init functions accept either form.
import { initWasm } from "@resvg/resvg-wasm"
import { init as initSatori } from "satori/standalone"
import { initOgWasm } from "@/server/platform/runtime"

async function load() {
  await initOgWasm(async ({ yoga, resvg }) => {
    await Promise.all([initSatori(yoga), initWasm(resvg)])
  })
}

let ready: Promise<void> | undefined

/** Resolves once both engines are initialised; safe to call on every request. */
export function ensureOgEngines(): Promise<void> {
  ready ??= load().catch((error: unknown) => {
    ready = undefined // let the next request retry
    throw error
  })
  return ready
}
