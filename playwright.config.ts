// End-to-end tests (docs/TESTING.md). `pnpm e2e` starts an in-memory
// Postgres (PGlite) and the Vite dev server on dedicated ports, then drives
// the system Chrome. Nothing here touches Neon, R2 or the network: the dev
// server uses local storage, and Chrome resolves every non-local host to
// NOTFOUND so sample photos, maps and fonts from CDNs cannot leak in.
import { defineConfig } from "@playwright/test"

const DB_PORT = 55434
const APP_PORT = 3300
const APP_ORIGIN = `http://localhost:${APP_PORT}`
const CI = !!process.env.CI

export default defineConfig({
  testDir: "./e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  forbidOnly: CI,
  retries: CI ? 1 : 0,
  workers: 2,
  reporter: CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: APP_ORIGIN,
    channel: "chrome",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    launchOptions: {
      args: [
        "--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE localhost, EXCLUDE 127.0.0.1",
      ],
    },
  },
  projects: [
    {
      name: "desktop",
      testMatch: ["journey.spec.ts", "auth.spec.ts"],
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      testMatch: ["guest.spec.ts", "music.spec.ts"],
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: [
    {
      command: `pnpm db:local --port ${DB_PORT}`,
      port: DB_PORT,
      reuseExistingServer: !CI,
      timeout: 60_000,
      stdout: "ignore",
    },
    {
      // No ALLOW_DEV_USER: the suite signs up real users.
      command: `pnpm dev --port ${APP_PORT}`,
      url: `${APP_ORIGIN}/templates`,
      reuseExistingServer: !CI,
      timeout: 180_000,
      env: {
        DATABASE_URL: `postgresql://postgres:postgres@127.0.0.1:${DB_PORT}/postgres`,
        STORAGE_DRIVER: "local",
        APP_ORIGIN,
        // Never send real mail from the suite: with the key unset, emails
        // are printed to the server log (and a developer's .env may hold one).
        RESEND_API_KEY: "",
        EMAIL_FROM: "",
      },
    },
  ],
})
