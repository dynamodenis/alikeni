// The main owner → guest → owner journey, end to end on the dev server:
// browse → preview → use → sign up → edit → upload → publish → open → RSVP
// → wish → dashboard → responses → hide wish → CSV.
import { readFile } from "node:fs/promises"
import { expect, test } from "@playwright/test"
import type { BrowserContext, Page } from "@playwright/test"
import {
  dashboardStat,
  expectEditorReady,
  hydrated,
  invitationIdFrom,
  newGuestContext,
  newOwner,
  openCover,
  openEditorTab,
  publish,
  signUpViaForm,
  submitRsvp,
  uniqueId,
  waitForAutosave,
  wishForm,
} from "./support/app"
import { makePng } from "./support/png"

const TEMPLATE = { id: "wedding/ivory-garden", name: "Ivory Garden" }
const PALETTE = "Midnight"

test.describe.serial("owner and guest journey", () => {
  const owner = newOwner()
  const headline = `E2E ${uniqueId("headline")}`
  const slug = uniqueId("journey")
  const guestName = "Wanjiru Guest"
  const wish = `Congratulations from ${uniqueId("wish")}`
  let ownerPage: Page
  let guestContext: BrowserContext
  let guestPage: Page
  let invitationId = ""

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext()
    ownerPage = await context.newPage()
    guestContext = await newGuestContext(browser)
    guestPage = await guestContext.newPage()
  })

  test.afterAll(async () => {
    await ownerPage.context().close()
    await guestContext.close()
  })

  test("browse, filter and preview a template", async () => {
    const page = ownerPage
    await page.goto("/templates")
    await expect(
      page.getByRole("heading", { name: "All templates" })
    ).toBeVisible()

    const wedding = page
      .getByRole("navigation", { name: "Template categories" })
      .getByRole("link", { name: /^Wedding/ })
    await (await hydrated(wedding)).click()
    await expect(page).toHaveURL(/category=wedding/)
    await expect(
      page.getByRole("heading", { name: "Wedding templates" })
    ).toBeVisible()
    await expect(
      page.getByRole("link", { name: /Ivory Garden/ }).first()
    ).toBeVisible()
    await expect(page.getByRole("link", { name: /Confetti Pop/ })).toHaveCount(
      0
    )

    await page.getByRole("link", { name: new RegExp(TEMPLATE.name) }).click()
    await expect(page).toHaveURL(`/templates/${TEMPLATE.id}`)
    await expect(
      page.getByRole("heading", { level: 1, name: TEMPLATE.name })
    ).toBeVisible()
    await expect(
      page.getByTitle(`Live preview of the ${TEMPLATE.name} template`)
    ).toBeVisible()

    const swatch = await hydrated(page.getByRole("radio", { name: PALETTE }))
    await swatch.click()
    await expect(swatch).toHaveAttribute("aria-checked", "true")
    await expect(page).toHaveURL(/palette=/)
  })

  test("use the template, sign up, land in the editor", async () => {
    const page = ownerPage
    await page.getByRole("button", { name: "Use this template" }).click()
    await expect(page).toHaveURL(/\/sign-up\?redirect=/)
    await signUpViaForm(page, owner)

    // Back where the visitor started; the draft is created on this click.
    await expect(page).toHaveURL(new RegExp(`/templates/${TEMPLATE.id}`))
    await expect(page.getByRole("radio", { name: PALETTE })).toHaveAttribute(
      "aria-checked",
      "true"
    )
    await (
      await hydrated(page.getByRole("button", { name: "Use this template" }))
    ).click()
    await expectEditorReady(page)
    invitationId = invitationIdFrom(page)
  })

  test("edit the headline (autosave)", async () => {
    const page = ownerPage
    await openEditorTab(page, "Texts")
    await page.getByLabel("Headline", { exact: true }).fill(headline)
    await waitForAutosave(page)
  })

  test("upload a photo to the gallery", async () => {
    const page = ownerPage
    await openEditorTab(page, "Gallery")
    const before = await page
      .getByRole("button", { name: /^Remove photo \d+$/ })
      .count()
    const chooser = page.waitForEvent("filechooser")
    await page.getByRole("button", { name: "Add photos" }).click()
    await (
      await chooser
    ).setFiles({
      name: "e2e-photo.png",
      mimeType: "image/png",
      buffer: makePng(320, 240),
    })
    await expect(page.getByText("1 photo added to the gallery")).toBeVisible({
      timeout: 20_000,
    })
    const index = before + 1
    await expect(
      page.getByRole("button", { name: `Remove photo ${index}` })
    ).toBeVisible()
    await page.getByLabel(`Describe photo ${index}`).fill("A gold test card")
    await waitForAutosave(page)

    // The local storage driver serves the uploaded bytes back.
    const src = await page
      .locator("img[src*='/api/storage/file/']")
      .last()
      .getAttribute("src")
    expect(src).toBeTruthy()
    const file = await page.request.get(src ?? "")
    expect(file.ok()).toBe(true)
    expect(file.headers()["content-type"]).toMatch(/^image\//)
  })

  test("publish with a unique slug", async () => {
    await publish(ownerPage, slug)
  })

  test("guest opens the invitation, RSVPs and posts a wish", async () => {
    const page = guestPage
    const response = await page.goto(`/i/${slug}`)
    expect(response?.status()).toBe(200)
    const cover = page.getByRole("dialog")
    await expect(cover).toBeVisible()
    await expect(cover.getByRole("heading", { level: 1 })).toHaveText(headline)
    await openCover(page)

    await submitRsvp(page, { name: guestName, partySize: 2 })
    await expect(
      page.getByText("Thank you, we have your response.")
    ).toBeVisible()

    const form = wishForm(page)
    await form.getByLabel("Your name").fill(guestName)
    await form.getByLabel("Your message").fill(wish)
    await form.getByRole("button", { name: "Send wishes" }).click()
    await expect(page.getByText("Thank you for your wishes!")).toBeVisible()
    await expect(page.getByText(wish)).toBeVisible()
  })

  test("dashboard counts the response, headcount and wish", async () => {
    const page = ownerPage
    await page.goto("/dashboard")
    await expect(
      dashboardStat(page, "Responses").getByRole("definition").first()
    ).toHaveText("1")
    await expect(dashboardStat(page, "Responses")).toContainText("2 attending")
    await expect(
      dashboardStat(page, "Wishes").getByRole("definition")
    ).toHaveText("1")
    // The card shows the owner's own invitation, not the template's sample.
    const preview = page.frameLocator(
      'iframe[title="Preview of your invitation"]'
    )
    await expect(preview.getByText(headline).first()).toBeVisible()
  })

  test("responses page lists the guest; hiding the wish removes it", async () => {
    const page = ownerPage
    await page
      .getByRole("listitem")
      .getByRole("link", { name: "Responses" })
      .click()
    await expect(page).toHaveURL(`/dashboard/${invitationId}/responses`)
    await expect(page.getByRole("cell", { name: guestName })).toBeVisible()

    const visible = await hydrated(page.getByRole("switch"))
    await expect(visible).toBeChecked()
    await visible.click()
    await expect(page.getByText("Wish hidden")).toBeVisible()
    await expect(visible).not.toBeChecked()

    await guestPage.reload()
    await openCover(guestPage)
    await expect(wishForm(guestPage)).toBeVisible()
    await expect(guestPage.getByText(wish)).toHaveCount(0)
  })

  test("CSV export has a BOM, the header row and the guest", async () => {
    const page = ownerPage
    const download = page.waitForEvent("download")
    await page.getByRole("link", { name: "Download CSV" }).click()
    const file = await download
    expect(file.suggestedFilename()).toMatch(/\.csv$/)
    const bytes = await readFile(await file.path())
    expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf])
    const lines = bytes.subarray(3).toString("utf8").split("\r\n")
    expect(lines[0]).toBe(
      "Name,Attending,Party size,Message,Contact,Submitted at"
    )
    const rows = lines.filter((line) => line.startsWith(`${guestName},`))
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatch(new RegExp(`^${guestName},yes,2,`))
  })
})
