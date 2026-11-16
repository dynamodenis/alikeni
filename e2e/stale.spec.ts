// A tab left open across a deploy: the next page's script file is gone.
// The visitor should land on the page they asked for (one quiet reload),
// never on an error screen.
import { expect, test } from "@playwright/test"

test("a missing script file reloads the page instead of showing an error", async ({
  page,
}) => {
  // Remember, across the reload, whether any error text was ever on screen.
  await page.addInitScript(() => {
    const check = () => {
      if (/Something went wrong|did not load/.test(document.body.innerText)) {
        sessionStorage.setItem("e2e:error-seen", "1")
      }
    }
    new MutationObserver(check).observe(document, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  })

  await page.goto("/templates")
  const card = page.locator('a[href^="/templates/"]').first()
  await expect(card).toBeVisible()
  await page.waitForLoadState("networkidle")

  // The first request for the template page's code fails, like a file from
  // the previous version would.
  let failed = 0
  await page.route(/\$slug\.tsx\?tsr-split=component/, (route) => {
    if (failed++ === 0) return route.abort()
    return route.continue()
  })

  await card.click()
  await expect(page).toHaveURL(/\/templates\/[a-z]+\/[a-z-]+$/)
  await expect(
    page.getByRole("heading", { name: /^About the .+ template$/ })
  ).toBeVisible({ timeout: 30_000 })
  expect(failed).toBeGreaterThan(0)
  expect(
    await page.evaluate(() => sessionStorage.getItem("e2e:error-seen"))
  ).toBeNull()
})
