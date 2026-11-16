// The event album end to end: the host switches it on and uploads photos
// and a .zip, guests see it through the invitation, add their own, a PIN
// locks it, and a large guest upload waits for the host's approval.
import { expect, test, type Page } from "@playwright/test"
import { zipSync } from "fflate"
import pg from "pg"
import {
  createPublishedInvitation,
  hydrated,
  newGuestContext,
  type Published,
} from "./support/app"
import { makePng } from "./support/png"

const DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:55434/postgres"

/**
 * What the suite cannot do through the UI: pay for Premium, and move the
 * sample event (2027) to today so the guest upload window is open.
 */
async function makePremiumToday(invitationId: string) {
  const client = new pg.Client({ connectionString: DATABASE_URL })
  await client.connect()
  try {
    const start = new Date(Date.now() - 3_600_000).toISOString()
    const end = new Date(Date.now() + 3_600_000).toISOString()
    await client.query(
      `update invitations
         set plan = 'premium',
             published_config = jsonb_set(
               jsonb_set(
                 jsonb_set(published_config, '{datetime,start}', to_jsonb($2::text)),
                 '{datetime,end}', to_jsonb($3::text)),
               '{event,subEvents}', '[]'::jsonb)
       where id = $1`,
      [invitationId, start, end]
    )
  } finally {
    await client.end()
  }
}

const png = (index: number) => ({
  name: `photo-${index}.png`,
  mimeType: "image/png",
  buffer: makePng(120 + index, 90, [40 + index * 7, 120, 200]),
})

/** The uploader's three hidden inputs: files, folder, zip. */
const fileInput = (page: Page) => page.locator('input[type="file"]').nth(0)
const zipInput = (page: Page) => page.locator('input[type="file"]').nth(2)

const tiles = (page: Page) =>
  page.getByRole("button", { name: /^(Video\. )?Open \d+ of \d+$/ })

test.describe.configure({ mode: "serial" })

let published: Published

test.beforeAll(async ({ browser }) => {
  test.setTimeout(180_000)
  published = await createPublishedInvitation(browser)
  await makePremiumToday(published.invitationId)
})

test.afterAll(async () => {
  await published.context.close()
})

test("the host switches the album on and uploads photos and a zip", async () => {
  const { page, invitationId } = published
  await page.goto(`/dashboard/${invitationId}/album`)
  await (await hydrated(page.getByRole("switch", { name: "Album on" }))).click()
  await expect(page.getByRole("switch", { name: "Album on" })).toBeChecked()

  await fileInput(page).setInputFiles([png(1), png(2)])
  await expect(page.getByText("2 files ready")).toBeVisible()
  // The preview shows the real photos, not broken images.
  await expect
    .poll(() =>
      page
        .getByAltText("photo-1.png")
        .evaluate((img: HTMLImageElement) => img.naturalWidth)
    )
    .toBeGreaterThan(0)
  await page.getByRole("button", { name: "Upload 2 files" }).click()
  await expect(page.getByText("2 files added to the album")).toBeVisible({
    timeout: 30_000,
  })
  await expect(tiles(page)).toHaveCount(2)

  // A zip with three photos, one text file and macOS junk.
  const zip = zipSync({
    "wedding/a.png": new Uint8Array(png(3).buffer),
    "wedding/b.png": new Uint8Array(png(4).buffer),
    "c.png": new Uint8Array(png(5).buffer),
    "notes.txt": new TextEncoder().encode("not a photo"),
    "__MACOSX/._a.png": new Uint8Array([0, 5, 22, 7]),
    // Renamed text: the name says photo, the bytes do not.
    "fake.jpg": new TextEncoder().encode("this is definitely not a jpeg"),
  })
  await page.getByRole("button", { name: "Add more" }).click()
  await zipInput(page).setInputFiles({
    name: "photos.zip",
    mimeType: "application/zip",
    buffer: Buffer.from(zip),
  })
  await expect(page.getByText("3 files ready")).toBeVisible()
  await expect(page.getByText("2 files left out")).toBeVisible()
  await page.getByRole("button", { name: "Upload 3 files" }).click()
  await expect(page.getByText("3 files added to the album")).toBeVisible({
    timeout: 30_000,
  })
  await expect(tiles(page)).toHaveCount(5)
  await expect(
    page.getByText("5 files", { exact: false }).first()
  ).toBeVisible()
})

test("a guest reaches the album from the invitation and adds a photo", async ({
  browser,
}) => {
  const context = await newGuestContext(browser)
  const page = await context.newPage()
  await page.goto(`/i/${published.slug}`)
  const link = page.getByRole("link", {
    name: /Photos & videos from the event/,
  })
  await expect(link).toHaveAttribute("href", `/i/${published.slug}/album`)

  await page.goto(`/i/${published.slug}/album`)
  await expect(tiles(page)).toHaveCount(5)
  await expect(page.getByText("5 photos and videos")).toBeVisible()

  await fileInput(page).setInputFiles([png(6)])
  await expect(page.getByText("1 file ready")).toBeVisible()
  await page.getByLabel("Your name").fill("Wanjiru")
  await page.getByRole("button", { name: "Upload 1 file" }).click()
  await expect(page.getByText("1 file added to the album")).toBeVisible({
    timeout: 30_000,
  })
  await expect(tiles(page)).toHaveCount(6)

  // The viewer shows who added it, and moves with the arrows.
  await tiles(page).first().click()
  const viewer = page.getByRole("dialog")
  await expect(viewer.getByText("Added by Wanjiru")).toBeVisible()
  await expect(viewer.getByRole("button", { name: "Download" })).toBeVisible()
  await viewer.getByRole("button", { name: "Next" }).click()
  await expect(viewer.getByText("2 / 6")).toBeVisible()
  await viewer.getByRole("button", { name: "Close" }).click()
  await expect(viewer).toBeHidden()
  await context.close()
})

test("a large guest upload waits for the host's approval", async ({
  browser,
}) => {
  test.setTimeout(180_000)
  const context = await newGuestContext(browser)
  const page = await context.newPage()
  await page.goto(`/i/${published.slug}/album`)
  await expect(tiles(page)).toHaveCount(6)

  await fileInput(page).setInputFiles(
    Array.from({ length: 21 }, (_, i) => png(20 + i))
  )
  await expect(page.getByText("21 files ready")).toBeVisible()
  await page.getByLabel("Your name").fill("Studio Kamau")
  await page.getByRole("button", { name: "Upload 21 files" }).click()
  await expect(
    page.getByText("21 files sent. They appear once the host approves them.")
  ).toBeVisible({ timeout: 90_000 })
  await page.reload()
  await expect(tiles(page)).toHaveCount(6)

  // The host sees the batch and approves it.
  const owner = published.page
  await owner.goto(`/dashboard/${published.invitationId}/album`)
  await expect(
    owner.getByRole("heading", { name: "Waiting for your approval" })
  ).toBeVisible()
  await expect(owner.getByText("Studio Kamau")).toBeVisible()
  await (
    await hydrated(owner.getByRole("button", { name: "Approve all 21" }))
  ).click()
  await expect(
    owner.getByRole("heading", { name: "Waiting for your approval" })
  ).toBeHidden({ timeout: 15_000 })

  await page.reload()
  await expect(page.getByText("27 photos and videos")).toBeVisible()
  await context.close()
})

test("the host deletes a photo", async () => {
  const { page, invitationId } = published
  await page.goto(`/dashboard/${invitationId}/album`)
  await (await hydrated(page.getByRole("button", { name: "Select" }))).click()
  await tiles(page).first().click()
  page.once("dialog", (dialog) => void dialog.accept())
  await page.getByRole("button", { name: "Delete 1" }).click()
  await expect(page.getByText("1 deleted")).toBeVisible({ timeout: 15_000 })
  await expect(page.getByText("26", { exact: true })).toBeVisible()
})

test("a PIN locks the album until it is entered", async ({ browser }) => {
  const owner = published.page
  await owner.goto(`/dashboard/${published.invitationId}/album`)
  await (await hydrated(owner.getByPlaceholder("e.g. 4821"))).fill("4821")
  await owner.getByRole("button", { name: "Set PIN" }).click()
  await expect(owner.getByText("PIN saved")).toBeVisible()

  const context = await newGuestContext(browser)
  const page = await context.newPage()
  await page.goto(`/i/${published.slug}/album`)
  await expect(
    page.getByRole("heading", { name: "This album is private" })
  ).toBeVisible()
  await expect(tiles(page)).toHaveCount(0)

  await page.getByLabel("PIN").fill("1111")
  await page.getByRole("button", { name: "Open album" }).click()
  await expect(page.getByRole("alert")).toHaveText("That PIN is not right.")

  await page.getByLabel("PIN").fill("4821")
  await page.getByRole("button", { name: "Open album" }).click()
  await expect(page.getByText("26 photos and videos")).toBeVisible()

  // The browser remembers; a changed PIN locks it again.
  await page.reload()
  await expect(page.getByText("26 photos and videos")).toBeVisible()
  await owner.getByPlaceholder("New PIN").fill("9090")
  await owner.getByRole("button", { name: "Change PIN" }).click()
  await expect(owner.getByText("PIN saved")).toBeVisible()
  await page.reload()
  await expect(
    page.getByRole("heading", { name: "This album is private" })
  ).toBeVisible()
  await context.close()
})
