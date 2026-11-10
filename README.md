# Alikeni

Configurable invitation websites: pick one of ~50 templates, edit it live,
publish to `/i/<slug>` with RSVP, wishes, countdown, map, gallery and music.

Built with TanStack Start, React 19, Tailwind v4, shadcn/ui, ReactBits, Zod
and Drizzle. See `docs/ARCHITECTURE.md` and `TODO.md` for the phase plan.

## Getting started

```bash
pnpm install
cp .env.example .env        # paste your Neon pooled DATABASE_URL
pnpm db:migrate             # create tables
pnpm db:seed                # templates + one sample invitation
pnpm dev                    # http://localhost:3000
```

Routes available now: `/` and `/dev/smoke` (ReactBits SSR smoke test; hidden
in production builds unless `VITE_ENABLE_DEV_ROUTES=true`).

## Scripts

| Script                              | What it does                                                                                                                     |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                          | Vite dev server on port 3000                                                                                                     |
| `pnpm build` / `pnpm start`         | Node production build to `dist/`, then serve it with `scripts/serve-dist.mjs` (local checks; production runs on Workers)         |
| `pnpm build:worker`                 | Cloudflare Workers build to `dist-worker/` (`ALIKENI_TARGET=workers`, see `docs/DEPLOY.md`)                                      |
| `pnpm preview:worker`               | `build:worker`, then `wrangler dev` on http://localhost:8787 (local workerd; needs `.dev.vars` and `pnpm db:local --port 55435`) |
| `pnpm run deploy`                   | `build:worker`, then `wrangler deploy` (needs `wrangler login` and the setup in `docs/DEPLOY.md`)                                |
| `pnpm cf-typegen`                   | Regenerate `worker-configuration.d.ts` from `wrangler.jsonc` and `.dev.vars`                                                     |
| `pnpm typecheck`                    | `tsc --noEmit`                                                                                                                   |
| `pnpm lint` / `pnpm lint:fix`       | ESLint (TanStack config + react-hooks + jsx-a11y)                                                                                |
| `pnpm format` / `pnpm format:check` | Prettier with the Tailwind plugin                                                                                                |
| `pnpm test` / `pnpm test:watch`     | Vitest                                                                                                                           |
| `pnpm e2e` / `pnpm e2e:ui`          | Playwright e2e in the system Chrome; boots its own PGlite (55434) and dev server (3300). See `docs/TESTING.md`                   |
| `pnpm db:generate`                  | Write a new SQL migration in `drizzle/` from `src/server/db/schema.ts`                                                           |
| `pnpm db:migrate` / `pnpm db:seed`  | Apply migrations / run the idempotent seed against `DATABASE_URL`                                                                |
| `pnpm db:studio` / `pnpm db:check`  | Browse the database / verify migration history                                                                                   |
| `pnpm db:local`                     | In-memory Postgres (PGlite, migrated + seeded) on `127.0.0.1:55433` for local testing without Neon                               |
| `pnpm music:add <file> …`           | Add a curated library track (uploads to storage, records license + credit); `music:list`, `music:placeholders`                   |
| `pnpm thumbs`                       | Regenerate `public/thumbs/*.webp` from `/preview` (needs `pnpm dev` running; `--url`, `--only <id>`)                             |
| `pnpm smoke:check [url]`            | Opens a page in the system Chrome via playwright-core, waits for hydration, fails on console errors/warnings                     |
| `pnpm exec tsx scripts/a11y.ts`     | axe (WCAG 2.1 AA), reduced-motion and keyboard audit in the system Chrome; needs a dev server (see the script header)            |

## Deployment

Production runs on **Cloudflare Workers**: Neon Postgres through Hyperdrive
(a small `pg` pool per request), uploads in R2 through the `BUCKET` binding,
security headers and CSP from a global request middleware (`src/start.ts`).
`pnpm dev`, `pnpm build` and `pnpm test` stay on Node; only
`pnpm build:worker` targets Workers. Setup, secrets (`wrangler secret put`),
caching and known limitations (OG cards on Workers): `docs/DEPLOY.md`.

## Adding components

```bash
pnpm dlx shadcn@latest add <ui-component>
pnpm dlx shadcn@latest add @react-bits/<Name>-TS-TW   # then move into src/components/reactbits
```

The ReactBits catalog is in `docs/REACTBITS_CATALOG.md`.
