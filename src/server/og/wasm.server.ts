// The two WASM engines behind the OG card: satori's layout engine (yoga) and
// resvg (SVG → PNG). Both are loaded once per process.
//
// Today (Node, Vite dev and the Node build) the binaries are imported as
// base64 data URLs (`?url&inline`), so no `fs` and no `node_modules` at
// runtime; `fetch` decodes a data URL on every runtime.
//
// Cloudflare Workers (Phase 8) refuse to compile WASM from bytes at runtime.
// There, import each binary as a precompiled module instead and pass the
// `WebAssembly.Module` to the same init calls:
//   import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm"
//   import yogaWasm from "satori/layout.wasm"
//   await Promise.all([initSatori(yogaWasm), initWasm(resvgWasm)])
// That is the only change; everything else here is runtime-neutral.
import { initWasm } from "@resvg/resvg-wasm"
import { init as initSatori } from "satori/standalone"

async function dataUrlBytes(url: string): Promise<ArrayBuffer> {
  return (await fetch(url)).arrayBuffer()
}

async function load() {
  const [{ default: resvgUrl }, { default: yogaUrl }] = await Promise.all([
    import("@resvg/resvg-wasm/index_bg.wasm?url&inline"),
    import("satori/layout.wasm?url&inline"),
  ])
  const [resvgBytes, yogaBytes] = await Promise.all([
    dataUrlBytes(resvgUrl),
    dataUrlBytes(yogaUrl),
  ])
  await Promise.all([initSatori(yogaBytes), initWasm(resvgBytes)])
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
