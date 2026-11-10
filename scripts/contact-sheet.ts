// pnpm contact-sheet [--category wedding] [--out docs/batches/wedding.png] [--url http://localhost:3000]
//
// Lays every thumbnail of a category (or of all templates) out on one page
// and screenshots it to docs/batches/<category>.png, the batch-review
// artefact Phase 7 asks for. Reads the WebP files `pnpm thumbs` produced via
// the running app (`pnpm dev` or `pnpm start`), so run thumbs first.
import { mkdir, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { chromium } from "playwright-core"
import { TEMPLATE_METAS } from "../src/templates/registry"

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
const category = flag("category")
const out = flag("out") ?? join("docs", "batches", `${category ?? "all"}.png`)

const metas = TEMPLATE_METAS.filter((m) => !category || m.category === category)
if (metas.length === 0) {
  console.error(`✗ no templates in category "${category}"`)
  process.exit(1)
}

const escape = (s: string) =>
  s.replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!
  )

const cards = metas
  .map(
    (m) => `
    <figure>
      <img src="${base}${m.thumbnail}" alt="" width="195" height="422" />
      <figcaption>
        <strong>${escape(m.name)}</strong>
        <span>${escape(m.id)}</span>
        <span>${escape(m.defaultPaletteId)} · ${escape(m.defaultFontPairId)}</span>
        <span>${escape(
          [m.effects.background, m.effects.title, m.effects.gallery]
            .filter(Boolean)
            .join(" · ")
        )}</span>
      </figcaption>
    </figure>`
  )
  .join("")

const html = `<!doctype html>
<meta charset="utf-8" />
<style>
  body { margin: 0; padding: 32px; background: #f4efe6; color: #2a1e14;
         font: 13px/1.35 system-ui, sans-serif; }
  h1 { margin: 0 0 20px; font-size: 20px; font-weight: 600; }
  .grid { display: grid; grid-template-columns: repeat(5, 195px); gap: 28px 24px; }
  figure { margin: 0; }
  img { display: block; width: 195px; height: 422px; border-radius: 18px;
        box-shadow: 0 10px 30px -12px rgba(0,0,0,.35); background: #fff; }
  figcaption { display: grid; gap: 2px; margin-top: 10px; }
  figcaption span { color: #6b5a4a; font-size: 11px; }
</style>
<h1>Alikeni · ${escape(category ?? "all templates")} · ${metas.length} templates</h1>
<div class="grid">${cards}</div>`

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
  const page = await browser.newPage({
    viewport: { width: 1180, height: 800 },
    deviceScaleFactor: 1,
  })
  await page.setContent(html, { waitUntil: "networkidle" })
  await page.evaluate(() =>
    Promise.all(
      [...document.images].map((img) =>
        img.complete ? null : img.decode().catch(() => null)
      )
    )
  )
  const png = await page.screenshot({ type: "png", fullPage: true })
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, png)
  await browser.close()
  console.log(`✓ ${metas.length} templates → ${out}`)
}

await main()
