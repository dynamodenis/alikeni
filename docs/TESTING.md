# Testing

Four layers, from fastest to slowest. All of them run locally without Neon,
R2 or a Cloudflare account.

| Layer         | Command                         | What it covers                                                         |
| ------------- | ------------------------------- | ---------------------------------------------------------------------- |
| Unit / server | `pnpm test`                     | Vitest: schemas, slug, rate limiter, ics, CSV, server logic on PGlite  |
| End to end    | `pnpm e2e`                      | Playwright in the system Chrome against the dev server                 |
| Accessibility | `pnpm exec tsx scripts/a11y.ts` | axe, reduced motion and keyboard paths against a running app           |
| Lighthouse    | (see below)                     | Mobile performance and accessibility of a published wedding invitation |

## Unit and server tests (Vitest)

```bash
pnpm test                 # everything once
pnpm test:watch           # watch mode
pnpm vitest run src/lib   # one folder or file
```

Tests sit next to the code (`*.test.ts(x)` under `src/`). Server tests that
need Postgres use an in-process PGlite with the real migrations, so they need
no database. `vitest.config.ts` only includes `src/**`, so the Playwright
specs in `e2e/` never run under Vitest.

## End-to-end tests (Playwright)

```bash
pnpm e2e                          # the whole suite, headless
pnpm e2e e2e/guest.spec.ts        # one file
pnpm e2e -g "rate-limit"          # tests whose title matches
pnpm e2e --project desktop        # one project
pnpm e2e:ui                       # Playwright UI mode (watch, time travel)
pnpm exec playwright show-trace test-results/<test>/trace.zip
```

### What `pnpm e2e` starts

`playwright.config.ts` launches two web servers and waits for each:

1. `pnpm db:local --port 55434`: in-memory Postgres (PGlite), migrated and
   seeded. Data is thrown away when the run ends.
2. `pnpm dev --port 3300` with
   `DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55434/postgres`,
   `STORAGE_DRIVER=local` and `APP_ORIGIN=http://localhost:3300`.
   `ALLOW_DEV_USER` is **not** set: the suite signs up real users (a unique
   email per test), so the auth paths are exercised for real.

Locally, a server that is already listening on those ports is reused (handy
while iterating: start both by hand and runs skip the boot). Restart the
database after pulling a new migration, or the dev server will query tables
that do not exist. On CI (`CI=1`) both always start fresh, `test.only` fails
the run and failed tests retry once with a trace.

The browser is the installed Google Chrome (`channel: "chrome"`); nothing is
downloaded. Chrome resolves every host except `localhost` to NOTFOUND
(`--host-resolver-rules`), so sample photos (picsum), map embeds and any other
third-party request fail fast instead of reaching the network. Uploads go
through the real sign → PUT → confirm flow into `.storage/` with the local
driver; the test photo is a PNG generated in memory (`e2e/support/png.ts`).

### Projects and specs

| Project   | Viewport                     | Specs                             |
| --------- | ---------------------------- | --------------------------------- |
| `desktop` | 1440 × 900                   | `journey.spec.ts`, `auth.spec.ts` |
| `mobile`  | 390 × 844, touch, `isMobile` | `guest.spec.ts`, `music.spec.ts`  |

- `journey.spec.ts` (serial): `/templates` → Wedding filter → Ivory Garden
  detail → palette switch → "Use this template" → sign-up → back on the
  template → editor with a new draft → headline edit (waits for "All changes
  saved") → gallery upload → publish with a unique slug → guest (phone
  context) opens `/i/<slug>`, RSVPs yes for 2, posts a wish → dashboard card
  shows 1 response / 2 attending / 1 wish → responses page lists the guest →
  hiding the wish removes it from the public page → CSV download (BOM, header,
  guest row).
- `guest.spec.ts`: `?to=` name on the cover and in the RSVP form; a filled
  honeypot gets the thank-you but the dashboard stays at 0; the sixth RSVP in
  a minute shows "Too many responses"; the calendar link downloads a valid
  VCALENDAR; `/og/<slug>.png` is a 1200×630 PNG; unknown slugs 404 on
  `/i`, `/ics` and `/og`.
- `auth.spec.ts`: signed-out `/dashboard` and `/editor/<id>` go to
  `/sign-in?redirect=…` and sign-in returns there; another user's editor,
  responses, guests and CSV are 404; sign-out ends the session.
- `music.spec.ts`: with a library track selected, no media element has played
  (and `play()` was never called) before the cover tap; after the tap one is
  playing unmuted. Chrome keeps its default autoplay policy. Skipped when
  `.storage/library/` has no audio (`pnpm music:placeholders` creates it).

### Writing specs

- Shared steps live in `e2e/support/app.ts` (sign-up, create draft, publish,
  open cover, RSVP, dashboard stats).
- Select by role and label first. The only test ids used are ones the app
  already ships (`share-url`); do not add new ones for convenience.
- Pages are server-rendered. Before the first click on a freshly loaded page,
  wait for hydration with `hydrated(locator)`, otherwise the click can land
  before React attaches handlers and is lost.
- Each guest context sends its own `X-Forwarded-For`, because the RSVP/wish
  rate limit is keyed on the client IP per invitation (`newGuestContext`).
- Keep tests independent: every spec creates its own owner and invitation.

## Accessibility audit

`scripts/a11y.ts` runs axe (WCAG 2.1 A/AA), a reduced-motion check and a
keyboard path against a running app. It needs the dev user, so it uses its
own ports:

```bash
pnpm db:local --port 55436
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:55436/postgres \
  ALLOW_DEV_USER=true STORAGE_DRIVER=local pnpm dev --port 3400
pnpm exec tsx scripts/a11y.ts --url http://localhost:3400
```

Flags: `--only <substring>`, `--skip-axe`, `--skip-motion`,
`--skip-keyboard`, `--verbose`, `--json <file>`. It exits non-zero on any
serious or critical violation or a failed check.

## Lighthouse

To be filled in: how to run the mobile Lighthouse check on a published
wedding invitation (target ≥ 90 performance, ≥ 95 accessibility) and the
latest numbers.
