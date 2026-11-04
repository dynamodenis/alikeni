// Guest-side behaviour of a published invitation on a phone viewport:
// personal links, the honeypot, the RSVP rate limit, calendar file, OG card
// and the 404 for unknown slugs.
import { readFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"
import {
  createPublishedInvitation,
  dashboardStat,
  hydrated,
  newGuestContext,
  openCover,
  rsvpForm,
  submitRsvp,
  uniqueId,
} from "./support/app"
import type { Published } from "./support/app"
import { pngSize } from "./support/png"

let invitation: Published
/** False when beforeAll failed before the invitation existed. */
let created = false

test.beforeAll(async ({ browser }) => {
  test.setTimeout(120_000)
  invitation = await createPublishedInvitation(browser)
  created = true
})

test.afterAll(async () => {
  if (created) await invitation.context.close()
})

test("?to= puts the guest's name on the cover and in the RSVP form", async ({
  browser,
}) => {
  const context = await newGuestContext(browser)
  const page = await context.newPage()
  await page.goto(
    `/i/${invitation.slug}?to=${encodeURIComponent("Auntie Njeri")}`
  )
  await expect(page.getByRole("dialog")).toContainText("Auntie Njeri", {
    timeout: 30_000,
  })
  await openCover(page)
  await expect(rsvpForm(page).getByLabel("Your name")).toHaveValue(
    "Auntie Njeri"
  )
  await context.close()
})

test("a filled honeypot looks accepted but stores nothing", async ({
  browser,
}) => {
  const context = await newGuestContext(browser)
  const page = await context.newPage()
  await page.goto(`/i/${invitation.slug}`)
  await openCover(page)
  // Bots fill every input, including the hidden `website` field.
  await rsvpForm(page)
    .locator("input[name='website']")
    .fill("https://spam.example", { force: true })
  await submitRsvp(page, { name: "Spam Bot", partySize: 3 })
  await expect(
    page.getByText("Thank you, we have your response.")
  ).toBeVisible()
  await context.close()

  const owner = invitation.page
  await owner.goto("/dashboard")
  await expect(
    dashboardStat(owner, "Responses").getByRole("definition").first()
  ).toHaveText("0")
  await owner.goto(`/dashboard/${invitation.invitationId}/responses`)
  await expect(owner.getByRole("heading", { name: /^RSVPs/ })).toContainText(
    "(0)"
  )
})

test("the sixth rapid RSVP is refused with a rate-limit error", async ({
  browser,
}) => {
  // Reduced motion: the cover opens instantly, so six rounds fit well inside
  // the one-minute window.
  const context = await newGuestContext(browser, { reducedMotion: "reduce" })
  const page = await context.newPage()
  for (let round = 1; round <= 6; round++) {
    await page.goto(`/i/${invitation.slug}`)
    await openCover(page)
    await submitRsvp(page, { name: `Rapid Guest ${round}`, partySize: 1 })
    if (round < 6) {
      await expect(
        page.getByText("Thank you, we have your response.")
      ).toBeVisible()
    }
  }
  await expect(page.getByText("Please wait a little")).toBeVisible()
  await expect(
    page.getByText(
      /You have sent 5 responses in the last minute\. You can send another in \d+ seconds\./
    )
  ).toBeVisible()
  await expect(rsvpForm(page)).toBeVisible()
  await context.close()
})

test("the calendar link downloads a valid VCALENDAR", async ({ browser }) => {
  const context = await newGuestContext(browser)
  const page = await context.newPage()
  await page.goto(`/i/${invitation.slug}`)
  await openCover(page)
  const link = page.locator(`a[href="/ics/${invitation.slug}"]`)
  await link.scrollIntoViewIfNeeded()
  const download = page.waitForEvent("download")
  await (await hydrated(link)).click()
  const file = await download
  expect(file.suggestedFilename()).toBe(`${invitation.slug}.ics`)
  const text = await readFile(await file.path(), "utf8")
  const lines = text.split("\r\n")
  expect(lines[0]).toBe("BEGIN:VCALENDAR")
  expect(lines).toContain("VERSION:2.0")
  expect(lines.filter((l) => l === "BEGIN:VEVENT").length).toBeGreaterThan(0)
  expect(lines.filter((l) => l === "BEGIN:VEVENT").length).toBe(
    lines.filter((l) => l === "END:VEVENT").length
  )
  expect(lines.some((l) => /^DTSTART(;[^:]*)?:\d{8}T\d{6}Z$/.test(l))).toBe(
    true
  )
  expect(lines.filter(Boolean).at(-1)).toBe("END:VCALENDAR")
  // RFC 5545: no content line longer than 75 octets.
  for (const line of lines)
    expect(Buffer.byteLength(line, "utf8")).toBeLessThanOrEqual(75)
  await context.close()
})

test("the OG card is a 1200×630 PNG", async ({ request }) => {
  const response = await request.get(`/og/${invitation.slug}.png`)
  expect(response.status()).toBe(200)
  expect(response.headers()["content-type"]).toBe("image/png")
  expect(pngSize(await response.body())).toEqual({ width: 1200, height: 630 })
})

test("an unknown slug is a 404 everywhere", async ({ page, request }) => {
  const missing = uniqueId("missing")
  const response = await page.goto(`/i/${missing}`)
  expect(response?.status()).toBe(404)
  expect((await request.get(`/ics/${missing}`)).status()).toBe(404)
  expect((await request.get(`/og/${missing}.png`)).status()).toBe(404)
})
