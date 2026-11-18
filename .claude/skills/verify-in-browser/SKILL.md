---
name: verify-in-browser
description: Look at Alikeni in a real browser to confirm a change works, including the signed-in editor and its live preview, a template preview at phone and desktop width, and comparing local behaviour with the live site. Use before reporting any user-visible change as done.
---

# Verifying in a browser

Typecheck and tests do not show a broken layout, a preview that ignores an
edit, or an editor tab that crashes. Look.

## What is already there

- The owner usually has `pnpm dev` on **http://localhost:3000**. Use it for
  public pages. Do not stop or restart it.
- Playwright is installed but its bundled browser is not. Launch the system
  Chrome: `chromium.launch({ executablePath: "/usr/bin/google-chrome" })`.
- Run scripts from the repo root (`node --input-type=module -e '…'`) so
  `@playwright/test` and `pg` resolve. Write screenshots to the scratchpad
  directory, never into the repo.

## Public pages (no sign-in)

| Page                                     | Shows                                     |
| ---------------------------------------- | ----------------------------------------- |
| `/preview/<category>/<slug>?motion=none` | a template with its sample content        |
| `/templates/<category>/<slug>`           | the template page with the preview iframe |

Sections carry `data-section="<id>"`; screenshot one with
`page.locator('[data-section="admission"]').screenshot()`. The cover must be
opened first: click its button (the label is `texts.coverButtonLabel`).
Check 1280 px and 390 px wide.

## The editor (needs a user)

Start a throwaway database and app with the dev user, on ports nothing else
uses:

```bash
pnpm db:local --port 55441 &          # in-memory Postgres, migrated + seeded
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55441/postgres \
  STORAGE_DRIVER=local APP_ORIGIN=http://localhost:3311 ALLOW_DEV_USER=true \
  RESEND_API_KEY= EMAIL_FROM= pnpm exec vite dev --port 3311 &
```

Then: open `/templates/<category>/<slug>`, click "Use this template", wait
for `/editor/<id>`. The preview is
`page.frameLocator('iframe[title="Live preview of your invitation"]')`.

- After `fill()`, wait about 2 s before reading the preview (updates are
  throttled, autosave runs after 1.5 s).
- Use a value the draft has never held. Autosave keeps earlier test values,
  so reusing one proves nothing.
- To stand in for an invitation saved before a schema change, remove the new
  keys from `invitations.draft_config` with `pg`, then reload the editor.
- Collect `pageerror` and console errors and report them.

Stop both processes when finished and check the ports are free
(`ss -ltn | grep -E ':3311|:55441'`).

Ports in use by other tooling: 3000 (owner's dev), 3300 and 55434 (e2e),
3400 and 55436 (a11y script), 55435 and 8787 (Workers preview).

## Live site

`https://alikeni.com` can be read without signing in: public pages, the
preview route, response headers. The signed-in editor on live cannot be
reached; say so rather than guessing. To compare, run the same script
against both origins.

Server errors on live: `pnpm exec wrangler tail alikeni --format json`
while requesting the page (skill `deploy-and-env`).

## Lessons

Add a line when something goes wrong here. Newest first.

- 2026-11-18: `pkill -f "<pattern>"` killed the shell running it twice,
  because the pattern is in the shell's own command line. Stop servers by
  port: `ss -ltnp | grep ":<port> "`, take the pid, `kill` it.
- 2026-11-18: To test Worker-only code (edge cache, cron): `pnpm db:local
--port 55435`, `pnpm build:worker`, `pnpm exec wrangler dev --port 8787`,
  then `curl -D -` and look for `CF-Cache-Status: HIT`.
- 2026-11-18: The editor logo was a plain `<a href>`, so going to the
  dashboard reloaded the whole app and flashed. In-app links are router
  `Link`s. To prove no reload happened, set a value on `window` before the
  click and read it back after, and count main-frame navigation requests.
  The editor's `useBlocker` saves pending edits before any in-app leave.
- 2026-11-18: A flicker report could not be judged from a screenshot.
  Record frames with CDP `Page.startScreencast` around the click and compare
  frame sizes: a dip marks the flash. It showed the dashboard card previews
  going white, because `/preview` said "ready" before the template chunk
  had loaded and the pushed config made React show the loading skeleton.
  The preview now announces itself from inside the Suspense boundary.
- 2026-11-18: A check "passed" because the title typed in an earlier run
  had been autosaved. Use a fresh value each run.
- 2026-11-18: `pkill -f` on a pattern that also matched the running shell
  ended the command early. Find the process by port and kill that pid.
- 2026-11-18: A screenshot path built from an unset variable created an
  `undefined/` folder in the repo. Check `git status` after scripted runs.
