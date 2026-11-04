// pnpm exec tsx scripts/a11y.ts [--url http://localhost:3400] [--only <substring>]
//                                [--skip-axe] [--skip-motion] [--skip-keyboard]
//                                [--verbose] [--json <file>]
//
// Accessibility audit against a running app (Phase 8). Needs a dev server with
// a seeded database and the dev user, for example:
//   pnpm db:local --port 55436
//   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55436/postgres \
//     ALLOW_DEV_USER=true STORAGE_DRIVER=local pnpm dev --port 3400
//
// Three passes, all in the system Chrome via playwright-core:
//  1. axe (WCAG 2.1 A/AA + best practices) on the marketing pages, auth pages,
//     the dashboard, the public invitation (cover, then opened) and a sample of
//     template previews spanning every category and both palette modes.
//  2. Reduced motion: each sample template with `prefers-reduced-motion: reduce`
//     and with `?motion=none`; fails when any CSS animation/transition with a
//     duration runs or a <canvas> mounts.
//  3. Keyboard path on /i/<slug>: cover button first, Enter opens, focus lands
//     in the content, RSVP works by keyboard, the lightbox traps and restores focus.
// Exits non-zero on any serious/critical axe violation or failed check.
import { writeFile } from "node:fs/promises"
import { AxeBuilder } from "@axe-core/playwright"
import { chromium } from "playwright-core"
import type { Browser, BrowserContextOptions, Page } from "playwright-core"

const args = process.argv.slice(2)
const flag = (name: string) => {
  const i = args.indexOf(`--${name}`)
  return i === -1 ? undefined : args[i + 1]
}
const has = (name: string) => args.includes(`--${name}`)
const base = (
  flag("url") ??
  process.env.A11Y_URL ??
  "http://localhost:3400"
).replace(/\/$/, "")
const only = flag("only")
const verbose = has("verbose")

/** "fg on bg = ratio" for contrast findings, so a fix can target the token. */
function detail(data: unknown): string {
  if (!data || typeof data !== "object") return ""
  const d = data as Record<string, unknown>
  if (typeof d.contrastRatio !== "number") return ""
  return `  [${String(d.fgColor)} on ${String(d.bgColor)} = ${d.contrastRatio}, ${String(d.fontSize)}]`
}
const SLUG = "amara-and-kofi"

/** Every category, light and dark palettes, an Indonesian-locale template. */
export const SAMPLE_TEMPLATES = [
  "wedding/ivory-garden", // light
  "wedding/midnight-aurora", // dark
  "wedding/javanese-heritage", // light, id
  "wedding/cinema-reel", // dark
  "birthday/confetti-pop", // light
  "birthday/neon-night", // dark
  "graduation/cap-and-gown", // dark
  "graduation/varsity", // light
  "baby_shower/cloud-nine", // light
  "baby_shower/twinkle-star", // dark
  "anniversary/love-letter", // light
  "anniversary/vinyl-love-song", // dark
  "corporate/black-tie-gala", // dark
  "corporate/conference-grid", // light
  "other/khitanan-ceria", // light, id
  "other/retirement-sunset", // light
] as const

type AxePage = {
  name: string
  path: string
  /** Runs after load, before axe (e.g. open the cover). */
  prepare?: (page: Page) => Promise<void>
}

const openCover = async (page: Page) => {
  await page.locator('[data-block="cover"] button').first().click()
  await page.locator('[data-block="cover"]').waitFor({ state: "detached" })
}

const AXE_PAGES: Array<AxePage> = [
  { name: "landing", path: "/" },
  { name: "templates", path: "/templates" },
  { name: "template detail", path: "/templates/wedding/ivory-garden" },
  { name: "sign-in", path: "/sign-in" },
  { name: "sign-up", path: "/sign-up" },
  { name: "dashboard", path: "/dashboard" },
  { name: "invitation (cover)", path: `/i/${SLUG}` },
  { name: "invitation (opened)", path: `/i/${SLUG}`, prepare: openCover },
  ...SAMPLE_TEMPLATES.map((id) => ({
    name: `preview ${id}`,
    path: `/preview/${id}?motion=none`,
  })),
]

type Violation = {
  id: string
  impact: string
  help: string
  nodes: Array<string>
}
type PageReport = {
  name: string
  path: string
  counts: Record<string, number>
  serious: Array<Violation>
}

/** Wait for hydration: the router marks the document once React has taken over. */
async function settle(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => undefined)
  await page.waitForTimeout(400)
}

async function runAxe(browser: Browser): Promise<Array<PageReport>> {
  const reports: Array<PageReport> = []
  for (const target of AXE_PAGES) {
    if (only && !target.name.includes(only) && !target.path.includes(only))
      continue
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "reduce",
    })
    const page = await context.newPage()
    try {
      const audit = async () => {
        await page.goto(base + target.path, { waitUntil: "load" })
        await settle(page)
        if (target.prepare) await target.prepare(page)
        return (
          new AxeBuilder({ page })
            .withTags([
              "wcag2a",
              "wcag2aa",
              "wcag21a",
              "wcag21aa",
              "best-practice",
            ])
            // Third-party map iframe content is outside our control.
            .exclude("iframe")
            .analyze()
        )
      }
      // One retry: a dev server may reload the page mid-run.
      const results = await audit().catch(() => audit())
      const counts: Record<string, number> = {}
      const serious: Array<Violation> = []
      for (const v of results.violations) {
        const impact = v.impact ?? "unknown"
        counts[impact] = (counts[impact] ?? 0) + v.nodes.length
        if (impact === "serious" || impact === "critical") {
          serious.push({
            id: v.id,
            impact,
            help: v.help,
            nodes: v.nodes
              .slice(0, verbose ? 40 : 6)
              .map(
                (n) =>
                  `${n.target.join(" ")}${detail(n.any[0]?.data)}${verbose ? `\n        ${n.html.slice(0, 160)}` : ""}`
              ),
          })
        }
      }
      reports.push({ name: target.name, path: target.path, counts, serious })
      const line = ["critical", "serious", "moderate", "minor"]
        .map((k) => `${k[0]}${counts[k] ?? 0}`)
        .join(" ")
      console.log(`${serious.length ? "✗" : "✓"} axe ${target.name}: ${line}`)
      for (const v of serious) {
        console.log(`    ${v.impact} ${v.id}: ${v.help}`)
        for (const node of v.nodes) console.log(`      ${node}`)
      }
    } catch (error) {
      console.log(`✗ axe ${target.name}: ${String(error)}`)
      reports.push({
        name: target.name,
        path: target.path,
        counts: { error: 1 },
        serious: [
          { id: "error", impact: "critical", help: String(error), nodes: [] },
        ],
      })
    } finally {
      await context.close()
    }
  }
  return reports
}

type MotionReport = {
  id: string
  mode: string
  animations: Array<string>
  /** Elements that would animate transform/opacity (hover, focus, state changes). */
  declared: Array<string>
  canvases: number
}

/**
 * Runs in the page. A plain string on purpose: tsx compiles named helpers
 * with an `__name` wrapper that does not exist in the browser.
 *
 * - `animations`: CSS animations/transitions/Web Animations running now.
 * - `declared`: elements that would move on hover, focus or a state change
 *   (transition or animation on transform/opacity with a real duration).
 */
const MOTION_PROBE = `(() => {
  const label = (el) => {
    if (!el) return "?"
    const cls = typeof el.className === "string"
      ? el.className.split(/\\s+/).slice(0, 4).join(".")
      : ""
    return el.tagName.toLowerCase() + (cls ? "." + cls : "")
  }
  const seconds = (value) => Math.max(...value.split(",").map((v) =>
    parseFloat(v) * (v.trim().endsWith("ms") ? 0.001 : 1)))
  const animations = document.getAnimations()
    .filter((a) => a.playState === "running" &&
      Number(a.effect && a.effect.getComputedTiming().duration) > 0)
    .map((a) => {
      const name = a.animationName ||
        (a.transitionProperty ? "transition:" + a.transitionProperty : "web-animation")
      return name + " on " + label(a.effect && a.effect.target)
    })
  const declared = []
  // Only the invitation (and portals such as the lightbox), not dev tooling.
  const scope = [...document.querySelectorAll("[data-inv-root] *, [role=dialog] *")]
  for (const el of scope) {
    const cs = getComputedStyle(el)
    const moves = /\\b(all|transform|opacity|translate|scale|rotate)\\b/.test(cs.transitionProperty) &&
      seconds(cs.transitionDuration) > 0.01
    const animates = cs.animationName !== "none" && seconds(cs.animationDuration) > 0.01
    if (moves || animates) {
      declared.push((animates ? cs.animationName : "transition:" + cs.transitionProperty) + " on " + label(el))
    }
  }
  return {
    animations: [...new Set(animations)],
    declared: [...new Set(declared)],
    canvases: document.querySelectorAll("canvas").length,
  }
})()`

/** Animations running after the page scrolled through every section. */
async function runningMotion(page: Page) {
  // Scroll down in steps so in-viewport reveals and lazy effects get a chance.
  await page.evaluate(async () => {
    const step = window.innerHeight * 0.8
    for (let y = 0; y < document.body.scrollHeight; y += step) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForTimeout(800)
  return page.evaluate<Omit<MotionReport, "id" | "mode">>(MOTION_PROBE)
}

async function runMotion(browser: Browser): Promise<Array<MotionReport>> {
  const reports: Array<MotionReport> = []
  const modes: Array<{
    mode: string
    query: string
    options: BrowserContextOptions
  }> = [
    { mode: "os-reduce", query: "", options: { reducedMotion: "reduce" } },
    {
      mode: "motion=none",
      query: "?motion=none",
      options: { reducedMotion: "no-preference" },
    },
  ]
  // Control: at full motion the probe must see something, or it is blind.
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "no-preference",
    })
    const page = await context.newPage()
    await page.goto(`${base}/preview/${SAMPLE_TEMPLATES[0]}`, {
      waitUntil: "load",
    })
    await settle(page)
    const control = await runningMotion(page)
    const seen =
      control.animations.length + control.declared.length + control.canvases
    console.log(
      `${seen > 0 ? "✓" : "✗"} motion control ${SAMPLE_TEMPLATES[0]} [full]: ${control.animations.length} running, ${control.declared.length} declared, ${control.canvases} canvas (expected > 0)`
    )
    await context.close()
  }
  for (const id of SAMPLE_TEMPLATES) {
    if (only && !id.includes(only)) continue
    for (const { mode, query, options } of modes) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        ...options,
      })
      const page = await context.newPage()
      try {
        const measure = async () => {
          await page.goto(`${base}/preview/${id}${query}`, {
            waitUntil: "load",
          })
          await settle(page)
          return runningMotion(page)
        }
        // A dev server may reload a page mid-run (dependency optimisation);
        // one retry keeps that from failing the audit.
        const result = await measure().catch(() => measure())
        reports.push({ id, mode, ...result })
        const ok =
          result.animations.length === 0 &&
          result.declared.length === 0 &&
          result.canvases === 0
        console.log(
          `${ok ? "✓" : "✗"} motion ${id} [${mode}]: ${result.animations.length} running, ${result.declared.length} declared, ${result.canvases} canvas`
        )
        for (const a of [...result.animations, ...result.declared].slice(
          0,
          verbose ? 40 : 8
        ))
          console.log(`    ${a}`)
      } finally {
        await context.close()
      }
    }
  }
  return reports
}

type Check = { name: string; ok: boolean; detail?: string }

async function runKeyboard(browser: Browser): Promise<Array<Check>> {
  const checks: Array<Check> = []
  const check = (name: string, ok: boolean, note?: string) => {
    checks.push({ name, ok, detail: note })
    console.log(
      `${ok ? "✓" : "✗"} keyboard: ${name}${note ? ` (${note})` : ""}`
    )
  }
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  })
  const page = await context.newPage()
  const active = () =>
    page.evaluate(() => {
      const el = document.activeElement
      if (!el || el === document.body) return "body"
      const label =
        el.getAttribute("aria-label") ??
        el.getAttribute("name") ??
        (el.id || el.textContent.trim().slice(0, 40))
      return `${el.tagName.toLowerCase()}#${el.id}[${label}]`
    })
  try {
    await page.goto(`${base}/i/${SLUG}`, { waitUntil: "load" })
    await settle(page)

    const inCover = () =>
      page.evaluate(() =>
        Boolean(document.activeElement?.closest('[data-block="cover"]'))
      )
    // The gated cover focuses its button on hydration.
    check("Cover button has focus after load", await inCover(), await active())
    // Tab from the top of the page (clicking the heading moves the
    // sequential-focus start point there) must land on the cover button.
    await page.locator('[data-block="cover"] h1').click()
    await page.keyboard.press("Tab")
    check("Tab reaches the cover button first", await inCover(), await active())
    // Nothing behind the modal cover is reachable: further Tabs leave for the
    // browser UI (body) or wrap back to the cover, never into the page.
    let escaped = false
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press("Tab")
      const where = await page.evaluate(() => {
        const el = document.activeElement
        if (!el || el === document.body) return "outside-page"
        return el.closest('[data-block="cover"]') ? "cover" : "page"
      })
      escaped ||= where === "page"
    }
    check("Tab cannot reach the page behind the cover", !escaped)
    await page.locator('[data-block="cover"] button').first().focus()
    await page.keyboard.press("Enter")
    await page.locator('[data-block="cover"]').waitFor({ state: "detached" })
    const inContent = await page.evaluate(
      () => document.activeElement?.id === "inv-content"
    )
    check(
      "Enter opens and focus lands in the content",
      inContent,
      await active()
    )

    // RSVP by keyboard only.
    await page.locator("#rsvp-name").focus()
    await page.keyboard.press("Control+A")
    await page.keyboard.type("Keyboard Guest")
    await page.keyboard.press("Tab") // first radio
    await page.keyboard.press("ArrowRight") // "no"
    await page.keyboard.press("ArrowLeft") // back to "yes"
    const yes = await page.evaluate(
      () =>
        document.querySelector<HTMLInputElement>(
          'input[name="attending"]:checked'
        )?.value
    )
    check("RSVP choice changes with arrow keys", yes === "yes", String(yes))
    await page.keyboard.press("Tab") // party size
    await page.keyboard.press("Control+A")
    await page.keyboard.type("2")
    await page.keyboard.press("Tab") // contact
    await page.keyboard.press("Tab") // note
    await page.keyboard.type("See you there")
    // Tab on to the submit button and press it.
    let onSubmit = false
    for (let i = 0; i < 6 && !onSubmit; i++) {
      await page.keyboard.press("Tab")
      onSubmit = await page.evaluate(
        () =>
          (document.activeElement as HTMLButtonElement | null)?.type ===
          "submit"
      )
    }
    check("Tab reaches the RSVP submit button", onSubmit, await active())
    if (onSubmit) {
      await page.keyboard.press("Enter")
      const sent = await page
        .locator("#rsvp")
        .getByText(/thank you|terima kasih/i)
        .first()
        .waitFor({ timeout: 8000 })
        .then(() => true)
        .catch(() => false)
      check("RSVP submits from the keyboard", sent)
    }

    await checkLightbox(page, "invitation", check, active)

    // The sample invitation has one photo; browse a full gallery in a preview.
    await page.goto(`${base}/preview/wedding/ivory-garden?motion=none`, {
      waitUntil: "load",
    })
    await settle(page)
    await page.locator("#gallery").scrollIntoViewIfNeeded()
    await checkLightbox(page, "preview gallery", check, active)
  } catch (error) {
    check("keyboard path completed", false, String(error))
  } finally {
    await context.close()
  }
  return checks
}

/** Open the first gallery tile by keyboard; focus in, trapped, arrows, restored. */
async function checkLightbox(
  page: Page,
  where: string,
  check: (name: string, ok: boolean, note?: string) => void,
  active: () => Promise<string>
) {
  const tile = page.locator("#gallery [aria-label]").first()
  await tile.focus()
  const tileLabel = await tile.getAttribute("aria-label")
  await page.keyboard.press("Enter")
  const dialog = page.getByRole("dialog")
  await dialog.waitFor({ timeout: 8000 })
  const focusInside = await page.evaluate(() =>
    Boolean(document.activeElement?.closest('[role="dialog"]'))
  )
  check(`${where}: lightbox takes focus`, focusInside, await active())
  let trapped = true
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab")
    trapped &&= await page.evaluate(() =>
      Boolean(document.activeElement?.closest('[role="dialog"]'))
    )
  }
  check(`${where}: lightbox traps Tab`, trapped)
  const photos = await page.locator("#gallery [aria-label]").count()
  if (photos > 1) {
    // The visible counter ("1 / 6") follows the current photo.
    const counter = page.locator('[role="dialog"] figcaption')
    const first = await counter.textContent()
    await page.keyboard.press("ArrowRight")
    await page
      .waitForFunction(
        (text) =>
          document.querySelector('[role="dialog"] figcaption')?.textContent !==
          text,
        first ?? "",
        { timeout: 2000 }
      )
      .catch(() => undefined)
    const next = await counter.textContent()
    check(
      `${where}: arrow keys browse photos`,
      Boolean(next) && next !== first,
      `${first} → ${next}`
    )
  }
  await page.keyboard.press("Escape")
  // Radix returns focus when the content unmounts, after its exit animation.
  await page.locator('[role="dialog"]').waitFor({ state: "detached" })
  await page.waitForTimeout(100)
  const restored = await page.evaluate(
    () => document.activeElement?.getAttribute("aria-label") ?? null
  )
  check(
    `${where}: Escape restores focus to the tile`,
    restored === tileLabel,
    String(restored)
  )
}

async function main() {
  try {
    await fetch(base, { signal: AbortSignal.timeout(10_000) })
  } catch {
    console.error(`No app at ${base}. See the header of scripts/a11y.ts.`)
    process.exit(1)
  }
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  })
  try {
    const axe = has("skip-axe") ? [] : await runAxe(browser)
    const motion = has("skip-motion") ? [] : await runMotion(browser)
    const keyboard = has("skip-keyboard") ? [] : await runKeyboard(browser)

    const seriousPages = axe.filter((r) => r.serious.length > 0).length
    const motionLeaks = motion.filter(
      (r) => r.animations.length + r.declared.length + r.canvases > 0
    ).length
    const failedChecks = keyboard.filter((c) => !c.ok).length
    console.log(
      `\naxe: ${axe.length} pages, ${seriousPages} with serious/critical · motion: ${motion.length} runs, ${motionLeaks} leaking · keyboard: ${keyboard.length} checks, ${failedChecks} failed`
    )
    const out = flag("json")
    if (out) {
      await writeFile(out, JSON.stringify({ axe, motion, keyboard }, null, 2))
    }
    process.exitCode = seriousPages + motionLeaks + failedChecks > 0 ? 1 : 0
  } finally {
    await browser.close()
  }
}

await main()
