// Shared steps for the e2e specs. Selectors are roles and labels; the only
// test id used is `share-url`, which the app already ships.
import { expect } from "@playwright/test"
import type {
  Browser,
  BrowserContext,
  BrowserContextOptions,
  Locator,
  Page,
} from "@playwright/test"

export const PASSWORD = "e2e-Password-1234"
export const BASE_URL = "http://localhost:3300"

/** Desktop viewport for owner flows (matches the "desktop" project). */
export const DESKTOP: BrowserContextOptions = {
  viewport: { width: 1440, height: 900 },
}
/** Phone viewport for guest flows (matches the "mobile" project). */
export const MOBILE: BrowserContextOptions = {
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
}

let sequence = 0
/** Unique per run and per call: base36 time + counter + random suffix. */
export function uniqueId(prefix: string): string {
  sequence += 1
  const random = Math.random().toString(36).slice(2, 6)
  return `${prefix}-${Date.now().toString(36)}${sequence.toString(36)}${random}`
}

export type Owner = { name: string; email: string; password: string }

export function newOwner(): Owner {
  return {
    name: "E2E Owner",
    email: `${uniqueId("owner")}@example.com`,
    password: PASSWORD,
  }
}

/**
 * A fake client IP for one guest. The app keys its RSVP/wish rate limit on
 * the client IP (X-Forwarded-For), so each guest context gets its own bucket.
 */
export function guestIp(): string {
  const octet = () => Math.floor(Math.random() * 250) + 1
  return `10.${octet()}.${octet()}.${octet()}`
}

/** A fresh phone-sized context with its own client IP. */
export function newGuestContext(
  browser: Browser,
  options: BrowserContextOptions = {}
): Promise<BrowserContext> {
  return browser.newContext({
    ...MOBILE,
    baseURL: BASE_URL,
    extraHTTPHeaders: { "x-forwarded-for": guestIp() },
    ...options,
  })
}

/**
 * Waits until React has hydrated `target` (its event handlers are attached).
 * Pages are server-rendered, so a click that lands before hydration is lost.
 * React stores props on hydrated DOM nodes under a `__reactProps$…` key.
 */
export async function hydrated(target: Locator): Promise<Locator> {
  await expect(target).toBeVisible()
  await expect
    .poll(
      () =>
        target.evaluate((el) =>
          Object.keys(el).some((key) => key.startsWith("__reactProps$"))
        ),
      { timeout: 30_000 }
    )
    .toBe(true)
  return target
}

/* ---------- auth ---------- */

/** Fills and submits the sign-up form (the page must be on /sign-up). */
export async function signUpViaForm(page: Page, owner: Owner): Promise<void> {
  await hydrated(page.getByRole("button", { name: "Create account" }))
  await page.getByLabel("Your name", { exact: true }).fill(owner.name)
  await page.getByLabel("Email", { exact: true }).fill(owner.email)
  await page.getByLabel("Password", { exact: true }).fill(owner.password)
  await page.getByRole("button", { name: "Create account" }).click()
}

/** Creates an account through Better Auth's endpoint; the context keeps the session cookie. */
export async function signUpViaApi(
  context: BrowserContext,
  owner: Owner
): Promise<void> {
  const response = await context.request.post("/api/auth/sign-up/email", {
    data: { name: owner.name, email: owner.email, password: owner.password },
    headers: { Origin: BASE_URL },
  })
  expect(response.ok(), await response.text()).toBe(true)
}

/* ---------- editor ---------- */

export const EDITOR_URL = /\/editor\/([0-9a-f-]{36})$/

export function invitationIdFrom(page: Page): string {
  const match = EDITOR_URL.exec(new URL(page.url()).pathname)
  if (!match) throw new Error(`Not on an editor URL: ${page.url()}`)
  return match[1]
}

/** The visible save indicator in the editor header. */
export function saveStatus(page: Page) {
  return page
    .getByRole("status")
    .filter({ hasText: /changes saved|Unsaved changes|Saving…|Save failed/ })
}

export async function expectEditorReady(page: Page): Promise<void> {
  await expect(page).toHaveURL(EDITOR_URL)
  await expect(saveStatus(page)).toHaveText("All changes saved", {
    timeout: 30_000,
  })
}

/** After an edit: wait until autosave has started and then finished. */
export async function waitForAutosave(page: Page): Promise<void> {
  await expect(saveStatus(page)).not.toHaveText("All changes saved")
  await expect(saveStatus(page)).toHaveText("All changes saved", {
    timeout: 20_000,
  })
}

export async function openEditorTab(page: Page, name: string): Promise<void> {
  const tab = page
    .getByRole("navigation", { name: "Editor sections" })
    .getByRole("button", { name: new RegExp(`^${name}`) })
  await tab.click()
  await expect(tab).toHaveAttribute("aria-current", "page")
}

/** Template detail → "Use this template" → editor (signed in). Returns the draft id. */
export async function createDraft(
  page: Page,
  templateId: string
): Promise<string> {
  await page.goto(`/templates/${templateId}`)
  await (
    await hydrated(page.getByRole("button", { name: "Use this template" }))
  ).click()
  await expectEditorReady(page)
  return invitationIdFrom(page)
}

/** Sharing tab: set the slug, wait until it is available, publish. */
export async function publish(page: Page, slug: string): Promise<void> {
  await openEditorTab(page, "Sharing")
  await page.getByLabel("Link", { exact: true }).fill(slug)
  await expect(page.getByText("Available", { exact: true })).toBeVisible({
    timeout: 15_000,
  })
  await page.getByRole("button", { name: "Publish invitation" }).click()
  await expect(page.getByTestId("share-url")).toContainText(`/i/${slug}`, {
    timeout: 20_000,
  })
}

export type Published = {
  owner: Owner
  context: BrowserContext
  page: Page
  invitationId: string
  slug: string
}

/**
 * Signs up a new owner in a fresh desktop context, starts a draft from
 * `templateId`, runs `configure` in the editor, and publishes it.
 */
export async function createPublishedInvitation(
  browser: Browser,
  {
    templateId = "wedding/ivory-garden",
    configure,
  }: {
    templateId?: string
    configure?: (page: Page) => Promise<void>
  } = {}
): Promise<Published> {
  const owner = newOwner()
  const context = await browser.newContext({ ...DESKTOP, baseURL: BASE_URL })
  await signUpViaApi(context, owner)
  const page = await context.newPage()
  const invitationId = await createDraft(page, templateId)
  if (configure) await configure(page)
  const slug = uniqueId("e2e")
  await publish(page, slug)
  return { owner, context, page, invitationId, slug }
}

/* ---------- public page ---------- */

/** Taps the cover button and waits for the gate to leave. */
export async function openCover(
  page: Page,
  label = "Open invitation"
): Promise<void> {
  // The gate only becomes a dialog after hydration.
  const gate = page.getByRole("dialog")
  await expect(gate).toBeVisible({ timeout: 30_000 })
  await (
    await hydrated(gate.getByRole("button", { name: label, exact: true }))
  ).click()
  await expect(gate).toBeHidden({ timeout: 10_000 })
}

export function rsvpForm(page: Page) {
  return page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Send RSVP" }) })
}

export function wishForm(page: Page) {
  return page
    .locator("form")
    .filter({ has: page.getByRole("button", { name: "Send wishes" }) })
}

export async function submitRsvp(
  page: Page,
  { name, partySize }: { name: string; partySize: number }
): Promise<void> {
  const form = rsvpForm(page)
  await form.getByLabel("Your name").fill(name)
  await form.getByText("Joyfully accept").click()
  await form.getByLabel("Number of guests").fill(String(partySize))
  await form.getByRole("button", { name: "Send RSVP" }).click()
}

/** The Responses / Wishes counters on an owner's dashboard card. */
export function dashboardStat(page: Page, label: string) {
  return page
    .getByRole("listitem")
    .locator("dl > div")
    .filter({ has: page.getByRole("term").filter({ hasText: label }) })
}
