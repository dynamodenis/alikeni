// pnpm blog:shots [--url http://localhost:3000] [--only <post-slug>]
//
// Takes the screenshots that blog posts show. Every `image` block in
// src/blog/posts/ says what to capture (`shot`: a template and one of its
// sections, or its cover) and where the file goes (`src`, under
// public/blog/). This script opens the template's sample at a phone width,
// captures that part and writes the WebP, then records each picture's size in
// src/blog/shots.json so the page can reserve its space. Needs a running app
// (`pnpm dev` or `pnpm start`). Run it again after a template's look changes.
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { chromium, type Page } from "playwright-core"
import { POSTS } from "../src/blog/posts"
import type { Block } from "../src/blog/types"

type ImageBlock = Extract<Block, { type: "image" }>

const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : args[i + 1]
}
const base = (
  flag("url") ??
  process.env.THUMBS_URL ??
  "http://localhost:3000"
).replace(/\/$/, "")
const only = flag("only")
const VIEWPORT = { width: 390, height: 844 }
const SCALE = 2
const QUALITY = 0.82
/** Tallest capture, in CSS pixels: a long section is cut here. */
const MAX_HEIGHT = 1200
const MANIFEST = "src/blog/shots.json"

// Hide dev tooling, toasts and the floating music chip: everything in <body>
// except the page itself.
const HIDE_CHROME = `
  body > *:not(:first-child) { display: none !important; }
  button[aria-label$="music" i] { display: none !important; }
  *, *::before, *::after { animation-play-state: paused !important; caret-color: transparent !important; }
`

/** PNG → WebP inside the browser, so no image library is needed. */
async function toWebp(page: Page, png: Buffer): Promise<Buffer> {
  const webp = await page.evaluate(
    async ({ data, quality }) => {
      // Decoded here, not fetched: the page's CSP has no data: in
      // connect-src, so fetch() of a data: URL is refused.
      const blob = new Blob(
        [Uint8Array.from(atob(data), (c) => c.charCodeAt(0))],
        { type: "image/png" }
      )
      const bitmap = await createImageBitmap(blob)
      const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      canvas.getContext("2d")?.drawImage(bitmap, 0, 0)
      const out = await canvas.convertToBlob({ type: "image/webp", quality })
      const bytes = new Uint8Array(await out.arrayBuffer())
      let binary = ""
      for (const b of bytes) binary += String.fromCharCode(b)
      return { type: out.type, base64: btoa(binary) }
    },
    { data: png.toString("base64"), quality: QUALITY }
  )
  if (webp.type !== "image/webp")
    throw new Error(`browser produced ${webp.type}, not WebP`)
  return Buffer.from(webp.base64, "base64")
}

/**
 * Fonts and the pictures on screen are ready. Off-screen lazy images never
 * load, so waiting for them would hang: only those in view count, and each
 * gets a few seconds at most.
 */
const settle = (page: Page) =>
  page.evaluate(async () => {
    await document.fonts.ready
    // No named helpers in here: tsx wraps them in a call the page lacks.
    await Promise.race([
      new Promise((resolve) => setTimeout(resolve, 5000)),
      Promise.all(
        [...document.images]
          .filter((img) => {
            const box = img.getBoundingClientRect()
            return box.bottom > 0 && box.top < window.innerHeight
          })
          .map((img) => (img.complete ? null : img.decode().catch(() => null)))
      ),
    ])
  })

async function capture(
  page: Page,
  { shot }: ImageBlock
): Promise<{ png: Buffer; width: number; height: number }> {
  // motion=none: a fixed frame, no WebGL (software GL renders it badly).
  await page.goto(
    `${base}/preview/${shot.template}?device=mobile&motion=none`,
    {
      waitUntil: "networkidle",
    }
  )
  await page.addStyleTag({ content: HIDE_CHROME })
  if (shot.section === "cover") {
    await settle(page)
    await page.waitForTimeout(400)
    return { png: await page.screenshot({ type: "png" }), ...VIEWPORT }
  }
  // In a preview the cover stays on the page above the sections; on a
  // published page it is removed once opened. Open it either way.
  const cover = page.locator('[data-block="cover"]')
  if ((await cover.getAttribute("data-state")) !== "inline") {
    await cover.locator("button").first().click()
    await cover.waitFor({ state: "detached" })
  }
  const section = page.locator(`[data-section="${shot.section}"]`).first()
  await section.waitFor({ state: "attached", timeout: 5000 })
  // Lazy images load as they come into view; walk the section into view.
  await section.evaluate((el) =>
    el.querySelectorAll("img").forEach((img) => (img.loading = "eager"))
  )
  await section.scrollIntoViewIfNeeded()
  await settle(page)
  // A map draws its tiles after the page is otherwise ready.
  const hasMap = (await section.locator("iframe, canvas").count()) > 0
  await page.waitForTimeout(hasMap ? 5000 : 600)
  // Floating controls (the music chip) would sit on top of the picture.
  await page.evaluate(() => {
    for (const el of document.querySelectorAll<HTMLElement>("body *")) {
      if (getComputedStyle(el).position === "fixed") el.style.display = "none"
    }
  })
  const box = await section.boundingBox()
  if (!box) throw new Error(`section "${shot.section}" is not visible`)
  const height = Math.min(Math.round(box.height), MAX_HEIGHT)
  const top = await section.evaluate(
    (el) => el.getBoundingClientRect().top + window.scrollY
  )
  const png = await page.screenshot({
    type: "png",
    fullPage: true,
    clip: { x: 0, y: top, width: VIEWPORT.width, height },
  })
  return { png, width: VIEWPORT.width, height }
}

async function main() {
  try {
    await fetch(base, { signal: AbortSignal.timeout(5000) })
  } catch {
    console.error(
      `No app at ${base}. Start one with \`pnpm dev\` (or pass --url).`
    )
    process.exit(1)
  }

  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  })
  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: SCALE,
  })
  const { default: saved } = (await import(`../${MANIFEST}`, {
    with: { type: "json" },
  }).catch(() => ({ default: {} }))) as {
    default: Record<string, { width: number; height: number }>
  }
  // Sizes of pictures no post uses any more are dropped.
  const used = new Set(
    POSTS.flatMap((post) =>
      post.blocks.flatMap((b) => (b.type === "image" ? [b.src] : []))
    )
  )
  const manifest = Object.fromEntries(
    Object.entries(saved).filter(([src]) => used.has(src))
  )
  let failed = 0

  for (const post of POSTS.filter((p) => !only || p.slug === only)) {
    for (const block of post.blocks) {
      if (block.type !== "image") continue
      if (!/^\/blog\/[a-z0-9-]+\/[a-z0-9-]+\.webp$/.test(block.src)) {
        console.error(`✗ ${block.src}: must look like /blog/<post>/<name>.webp`)
        failed++
        continue
      }
      const page = await context.newPage()
      try {
        const { png, width, height } = await capture(page, block)
        const buffer = await toWebp(page, png)
        const file = join("public", block.src)
        await mkdir(dirname(file), { recursive: true })
        await writeFile(file, buffer)
        manifest[block.src] = { width: width * SCALE, height: height * SCALE }
        console.log(
          `✓ ${block.src} (${block.shot.template} · ${block.shot.section}, ${Math.round(buffer.length / 1024)} KB)`
        )
      } catch (error) {
        failed++
        console.error(
          `✗ ${block.src}: ${error instanceof Error ? error.message : String(error)}`
        )
      } finally {
        await page.close()
      }
    }
  }

  const sorted = Object.fromEntries(
    Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b))
  )
  await writeFile(MANIFEST, `${JSON.stringify(sorted, null, 2)}\n`)
  await browser.close()
  if (failed) process.exit(1)
}

await main()
