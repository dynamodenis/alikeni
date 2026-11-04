// Background music must wait for the cover tap (browsers only allow sound
// after a user gesture, and guests should never be surprised). Chrome runs
// with its default autoplay policy; on top of that, every media element and
// every play() call is recorded, so an early start is caught even where the
// browser would allow it.
import { existsSync } from "node:fs"
import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import {
  createPublishedInvitation,
  hydrated,
  newGuestContext,
  openEditorTab,
  waitForAutosave,
} from "./support/app"
import type { Published } from "./support/app"

type AudioState = {
  /** Every <audio>, in the DOM or created with `new Audio()`. */
  elements: Array<{ paused: boolean; muted: boolean; currentTime: number }>
  /** play() calls so far, and whether the element was muted at the time. */
  plays: Array<{ muted: boolean }>
}

declare global {
  interface Window {
    __e2eAudio?: {
      elements: Set<HTMLMediaElement>
      plays: Array<{ muted: boolean }>
    }
  }
}

/** Runs before any page script: wraps Audio, createElement and play(). */
function trackAudio() {
  const record = {
    elements: new Set<HTMLMediaElement>(),
    plays: [] as Array<{ muted: boolean }>,
  }
  window.__e2eAudio = record
  const NativeAudio = window.Audio
  window.Audio = class extends NativeAudio {
    constructor(src?: string) {
      super(src)
      record.elements.add(this)
    }
  }
  const createElement = document.createElement.bind(document)
  document.createElement = (tag: string, options?: ElementCreationOptions) => {
    const el = createElement(tag, options)
    if (el instanceof HTMLMediaElement) record.elements.add(el)
    return el
  }
  const play = HTMLMediaElement.prototype.play
  HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
    record.elements.add(this)
    record.plays.push({ muted: this.muted })
    return play.call(this)
  }
}

function audioState(page: Page): Promise<AudioState> {
  return page.evaluate(() => {
    const record = window.__e2eAudio
    const all = new Set<HTMLMediaElement>(record?.elements ?? [])
    document.querySelectorAll("audio").forEach((el) => all.add(el))
    return {
      elements: Array.from(all, (el) => ({
        paused: el.paused,
        muted: el.muted,
        currentTime: el.currentTime,
      })),
      plays: record?.plays ?? [],
    }
  })
}

let invitation: Published
/** False when beforeAll failed before the invitation existed. */
let created = false

test.beforeAll(async ({ browser }) => {
  test.setTimeout(120_000)
  invitation = await createPublishedInvitation(browser, {
    configure: async (page) => {
      await openEditorTab(page, "Music")
      const toggle = page.getByRole("switch", { name: "Play music" })
      if (!(await toggle.isChecked())) await toggle.click()
      await page.getByRole("radio", { name: /Festly library/ }).click()
      // Pick a library track other than the current one, so autosave runs.
      const tracks = page.getByRole("radiogroup", { name: "Library tracks" })
      const title = await tracks
        .getByRole("radio", { checked: false })
        .first()
        .locator("span")
        .first()
        .textContent()
      const track = tracks.getByRole("radio", { name: title ?? "" })
      await track.click()
      await expect(track).toHaveAttribute("aria-checked", "true")
      await waitForAutosave(page)
    },
  })
  created = true
})

test.afterAll(async () => {
  if (created) await invitation.context.close()
})

test("no audio plays before the cover tap; music starts after it", async ({
  browser,
}) => {
  test.skip(
    !existsSync(".storage/library/sketch-calm.wav") ||
      !existsSync(".storage/library/sketch-bright.wav"),
    "Library audio is missing in .storage/library (run `pnpm music:placeholders`)."
  )
  const context = await newGuestContext(browser)
  await context.addInitScript(trackAudio)
  const page = await context.newPage()
  await page.goto(`/i/${invitation.slug}`)

  const gate = page.getByRole("dialog")
  const button = await hydrated(
    gate.getByRole("button", { name: "Open invitation", exact: true })
  )
  // Give any eager autoplay attempt time to happen.
  await page.waitForTimeout(1500)
  const before = await audioState(page)
  expect(before.plays).toEqual([])
  for (const el of before.elements) expect(el.paused).toBe(true)

  await button.click()
  await expect(gate).toBeHidden({ timeout: 10_000 })
  await expect
    .poll(
      async () => {
        const { elements } = await audioState(page)
        return elements.some(
          (el) => !el.paused && !el.muted && el.currentTime > 0
        )
      },
      { timeout: 15_000 }
    )
    .toBe(true)
  await expect(page.getByRole("button", { name: "Pause music" })).toBeVisible()
  await context.close()
})
