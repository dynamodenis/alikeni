import { fileURLToPath } from "node:url"
import { defineConfig, type PluginOption } from "vite"
import { cloudflare } from "@cloudflare/vite-plugin"
import { devtools } from "@tanstack/devtools-vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

/**
 * Build target. `pnpm dev`, `pnpm build` and Vitest run on Node (the default).
 * `pnpm build:worker` sets ALIKENI_TARGET=workers: the Cloudflare plugin runs
 * the SSR environment in workerd, and the platform module switches to the
 * Workers adapters (Hyperdrive per request, R2 binding, precompiled WASM).
 * See docs/DEPLOY.md.
 */
const workers = process.env.ALIKENI_TARGET === "workers"

const runtimeFile = fileURLToPath(
  new URL(
    workers
      ? "./src/server/platform/runtime.workers.ts"
      : "./src/server/platform/runtime.node.ts",
    import.meta.url
  )
)

const cloudflarePlugins: Array<PluginOption> = workers
  ? [cloudflare({ viteEnvironment: { name: "ssr" } })]
  : []

const config = defineConfig({
  // Separate output so a Worker build never overwrites the Node build (dist/,
  // served by `pnpm start`). wrangler finds it via .wrangler/deploy/config.json.
  ...(workers ? { build: { outDir: "dist-worker" } } : {}),
  server: {
    // Vite answers 403 to hosts it does not know. Let a Cloudflare quick
    // tunnel (`cloudflared tunnel --url http://localhost:3000`) reach the dev
    // server so Paystack webhooks can be tested locally (docs/DEPLOY.md).
    allowedHosts: [".trycloudflare.com"],
  },
  resolve: {
    tsconfigPaths: true,
    alias: [
      { find: /^@\/server\/platform\/runtime$/, replacement: runtimeFile },
    ],
  },
  plugins: [
    // Console piping echoes browser and server logs into each other; with a
    // live preview iframe logging, that feedback loop starves the dev server.
    devtools({ consolePiping: { enabled: false } }),
    tailwindcss(),
    // Must come before tanstackStart() (Cloudflare + TanStack Start docs).
    ...cloudflarePlugins,
    tanstackStart(),
    viteReact(),
  ],
})

export default config
