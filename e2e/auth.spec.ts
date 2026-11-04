// Access control: signed-out redirects, owner-only pages and files, sign-out.
import { randomUUID } from "node:crypto"
import { expect, test } from "@playwright/test"
import {
  BASE_URL,
  DESKTOP,
  createDraft,
  hydrated,
  newOwner,
  signUpViaApi,
} from "./support/app"

function redirectParam(url: string): string | null {
  return new URL(url).searchParams.get("redirect")
}

test("signed-out visitors are sent to sign-in and come back after", async ({
  page,
}) => {
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/sign-in\?/)
  expect(redirectParam(page.url())).toBe("/dashboard")

  const draftId = randomUUID()
  await page.goto(`/editor/${draftId}`)
  await expect(page).toHaveURL(/\/sign-in\?/)
  expect(redirectParam(page.url())).toBe(`/editor/${draftId}`)

  // Signing in honours the redirect.
  const owner = newOwner()
  await signUpViaApi(page.context(), owner)
  await page.context().clearCookies()
  await page.goto(`/sign-in?redirect=${encodeURIComponent("/dashboard")}`)
  await hydrated(page.getByRole("button", { name: "Sign in", exact: true }))
  await page.getByLabel("Email", { exact: true }).fill(owner.email)
  await page.getByLabel("Password", { exact: true }).fill(owner.password)
  await page.getByRole("button", { name: "Sign in", exact: true }).click()
  await expect(page).toHaveURL(/\/dashboard$/)
})

test("another user's editor, responses, guests and CSV are 404", async ({
  browser,
}) => {
  const ownerContext = await browser.newContext({
    ...DESKTOP,
    baseURL: BASE_URL,
  })
  await signUpViaApi(ownerContext, newOwner())
  const ownerPage = await ownerContext.newPage()
  const id = await createDraft(ownerPage, "birthday/confetti-pop")

  // The owner can reach everything.
  expect(
    (await ownerContext.request.get(`/api/export/${id}.csv`)).status()
  ).toBe(200)

  const otherContext = await browser.newContext({
    ...DESKTOP,
    baseURL: BASE_URL,
  })
  await signUpViaApi(otherContext, newOwner())
  const other = await otherContext.newPage()
  for (const path of [
    `/editor/${id}`,
    `/dashboard/${id}/responses`,
    `/dashboard/${id}/guests`,
  ]) {
    const response = await other.goto(path)
    expect(response?.status(), path).toBe(404)
    await expect(other).toHaveURL(path)
  }
  const csv = await otherContext.request.get(`/api/export/${id}.csv`)
  expect(csv.status()).toBe(404)
  expect(await csv.text()).not.toContain("Name,Attending")

  await ownerContext.close()
  await otherContext.close()
})

test("sign out ends the session", async ({ page }) => {
  await signUpViaApi(page.context(), newOwner())
  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/dashboard$/)
  await (
    await hydrated(page.getByRole("button", { name: /^Account: / }))
  ).click()
  await page.getByRole("menuitem", { name: "Sign out" }).click()
  await expect(page).toHaveURL(`${BASE_URL}/`)

  await page.goto("/dashboard")
  await expect(page).toHaveURL(/\/sign-in\?/)
  const session = await page.request.get("/api/auth/get-session")
  expect(await session.text()).toMatch(/^(null)?$/)
})
