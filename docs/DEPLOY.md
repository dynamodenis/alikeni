# Deploying Alikeni (Cloudflare Workers)

Alikeni runs on **Cloudflare Workers** (decided in Phase 8): TanStack Start's
server entry runs in the Worker, static assets are served by Workers Static
Assets, Postgres (Neon) is reached through **Hyperdrive**, uploads live in
**R2** through a Worker binding.

Local development is unchanged: `pnpm dev`, `pnpm build` + `pnpm start` and
`pnpm test` run on Node. Only `pnpm build:worker` (and the scripts built on
it) target Workers.

## How the build switches

| Command               | Target  | What happens                                                                                                                          |
| --------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`            | Node    | Vite dev server                                                                                                                       |
| `pnpm build`          | Node    | `dist/`, served by `pnpm start` (`scripts/serve-dist.mjs`)                                                                            |
| `pnpm build:worker`   | Workers | `ALIKENI_TARGET=workers`: `@cloudflare/vite-plugin` runs the SSR environment in workerd; output in `dist-worker/`                     |
| `pnpm preview:worker` | Workers | `build:worker`, then `wrangler dev` (local workerd, local R2 simulation, Hyperdrive → `localConnectionString`)                        |
| `pnpm run deploy`     | Workers | `build:worker`, then `wrangler deploy` (run `pnpm db:migrate` against Neon first when `drizzle/` has a new migration)                 |
| `pnpm cf-typegen`     | —       | Regenerates `worker-configuration.d.ts` (binding and runtime types) from `wrangler.jsonc` and `.dev.vars`; rerun after editing either |

`vite.config.ts` reads `ALIKENI_TARGET`. With `workers` it adds
`cloudflare({ viteEnvironment: { name: "ssr" } })` before `tanstackStart()`,
writes to `dist-worker/` (so it never overwrites the Node build), and aliases
`@/server/platform/runtime` to `src/server/platform/runtime.workers.ts`
instead of `runtime.node.ts`. Everything runtime-specific lives behind that
one module:

| Concern  | Node (`runtime.node.ts`)                       | Workers (`runtime.workers.ts`)                                                                                    |
| -------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Database | one `pg` pool per process from `DATABASE_URL`  | a small `pg` pool **per request** from `env.HYPERDRIVE.connectionString`, closed after the response (`waitUntil`) |
| R2       | none (`r2` driver over the S3 API, or `local`) | the `BUCKET` binding (`binding` driver)                                                                           |
| OG WASM  | base64 data URLs decoded to bytes              | `.wasm` imports compiled at deploy time (`CompiledWasm` modules)                                                  |

Workers forbid sharing sockets between requests, so the per-request pool is
keyed by the current `Request` (TanStack Start's request context) in a
`WeakMap`. `getDb()` returns a stable proxy that resolves to the current
request's client on every call, so code that keeps the db (Better Auth's
adapter) stays correct. No caller changed.

## One-time setup

You need a Cloudflare account on the **Workers Paid** plan ($5/month): the
Worker bundle is about 3.4 MB gzipped (JS + WASM), above the free plan's
3 MB limit and well under the paid 10 MB limit.

```bash
pnpm exec wrangler login
```

### 1. Database (Neon + Hyperdrive)

1. Run migrations against Neon from your machine (Workers never migrate):
   `DATABASE_URL=<neon url> pnpm db:migrate && pnpm db:seed`.
2. Create the Hyperdrive config with Neon's **direct** (non-pooler)
   connection string, and **turn query caching off** (the editor's
   save-conflict check and the dashboard must read fresh rows):

   ```bash
   pnpm exec wrangler hyperdrive create alikeni-db \
     --connection-string="postgresql://USER:PASSWORD@ep-xxx.REGION.aws.neon.tech/alikeni?sslmode=require" \
     --caching-disabled
   ```

3. Paste the printed id into `wrangler.jsonc` → `hyperdrive[0].id`
   (replacing `<replace-me>`).

Hyperdrive needs `pg` ≥ 8.16.3; the lockfile has 8.23.1.

### 2. Storage (R2 binding)

1. Create the bucket: `pnpm exec wrangler r2 bucket create alikeni`
   (or use another name and update `r2_buckets[0].bucket_name`).
2. Optional but recommended: enable public access on the bucket (r2.dev
   subdomain or a custom domain) and set `R2_PUBLIC_URL` (as a var) so media
   is served by R2 directly. Without it, files are streamed by the Worker
   through `/api/storage/file/<key>` (Range supported, one Worker request per
   file).

With `STORAGE_DRIVER=binding` the browser uploads to our own
`/api/storage/upload` route with an HMAC-signed URL (key, type and size
bound, 10-minute expiry); the route re-checks type and size and writes to the
bucket. No CORS rule and no S3 API token are needed. Details:
`docs/STORAGE.md`.

### 3. Vars and secrets

Non-secret vars live in `wrangler.jsonc` → `vars` (`NODE_ENV=production`,
`STORAGE_DRIVER=binding`, `APP_ORIGIN`, `GEOCODE_PROVIDER`,
`PAYSTACK_CURRENCIES`). **Set
`APP_ORIGIN`** to the deployed origin (workers.dev URL or custom domain, no
trailing slash); OG URLs, share links and auth callbacks use it.

Add these too when you use them: `R2_PUBLIC_URL`, `GEOCODE_CONTACT_EMAIL`
(Nominatim policy), `EMAIL_FROM` (it can also be a secret), `EMAIL_REPLY_TO`
(set to `info@alikeni.com`: replies to automatic emails reach a real inbox).

The Worker is served on `alikeni.com` (`routes` with `custom_domain`; the
zone is on the same Cloudflare account, so the DNS record and certificate are
created on deploy). `workers_dev` stays on so links shared on the workers.dev
URL keep opening; sign-in only works on `APP_ORIGIN`.

Email addresses on the domain: `notifications@alikeni.com` is the sender of
automatic emails (`EMAIL_FROM`, through Resend, no inbox);
`info@alikeni.com` is the contact address in the landing page footer,
forwarded to a personal inbox by Cloudflare Email Routing.

Secrets (never in `wrangler.jsonc`):

```bash
pnpm exec wrangler secret put BETTER_AUTH_SECRET      # openssl rand -base64 32 (required)
pnpm exec wrangler secret put RESEND_API_KEY          # required in production
pnpm exec wrangler secret put EMAIL_FROM              # "Alikeni <hello@yourdomain.com>" (required)
pnpm exec wrangler secret put STORAGE_SIGNING_SECRET  # openssl rand -base64 32 (required with binding)
pnpm exec wrangler secret put ANALYTICS_SALT          # openssl rand -base64 32 (optional; falls back to BETTER_AUTH_SECRET)
pnpm exec wrangler secret put TURNSTILE_SECRET_KEY    # optional; pair with VITE_TURNSTILE_SITE_KEY
pnpm exec wrangler secret put PAYSTACK_SECRET_KEY     # Premium upgrades: sk_live_… (sk_test_… on a preview)
pnpm exec wrangler secret put GOOGLE_CLIENT_ID        # optional Google sign-in (set both)
pnpm exec wrangler secret put GOOGLE_CLIENT_SECRET
pnpm exec wrangler secret put GOOGLE_GEOCODING_KEY    # only with GEOCODE_PROVIDER=google
pnpm exec wrangler secret put MAPBOX_GEOCODING_TOKEN  # only with GEOCODE_PROVIDER=mapbox
pnpm exec wrangler secret put RADAR_SECRET_KEY        # only with GEOCODE_PROVIDER=radar
```

`DATABASE_URL` is **not** needed on Workers (Hyperdrive replaces it), nor are
`R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET`.

With `nodejs_compat` and a compatibility date after 2025-04-01, vars and
secrets are present in `process.env` when the Worker starts, so
`src/env.server.ts` keeps reading `process.env` and validates them with Zod at
startup (a missing required secret fails loudly in the logs).

`VITE_*` variables are **build-time**: they are inlined into the client
bundle by `pnpm build:worker`, so they must be in the environment (or `.env`)
of the machine that builds, e.g. `VITE_TURNSTILE_SITE_KEY`,
`VITE_GOOGLE_MAPS_EMBED_KEY`.

Google sign-in: add `<APP_ORIGIN>/api/auth/callback/google` as an authorized
redirect URI.

Paystack: in Settings → API Keys & Webhooks, set the webhook URL to
`<APP_ORIGIN>/api/payments/paystack` (separately for test and live mode).
Enable the channels you want (M-Pesa, cards, Apple Pay). Kenyan accounts
charge KES; Paystack enables USD on request ("Currency not supported by
merchant" at checkout means it is not enabled yet). List what the account
accepts in `PAYSTACK_CURRENCIES` (default `KES`; `KES,USD` once USD is on):
the upgrade page offers only those. Prices, the free RSVP cap and the free
expiry live in `src/lib/plans.ts`.

To test webhooks against `pnpm dev`, expose port 3000 with a Cloudflare quick
tunnel (no account needed; `vite.config.ts` allows `*.trycloudflare.com`):

```sh
npx cloudflared tunnel --url http://localhost:3000
```

Paste the printed `https://….trycloudflare.com/api/payments/paystack` as the
test-mode webhook URL in Paystack. The URL changes every run. Keep browsing on
`http://localhost:3000` (APP_ORIGIN): the return from checkout verifies the
transaction itself, the tunnel only carries the webhook.

### 4. Deploy

```bash
pnpm run deploy
```

Check: `/`, `/templates`, sign-up (the confirmation email arrives via
Resend), a published `/i/<slug>`, an RSVP, `/ics/<slug>`, an upload in the
editor.

## Local Workers preview (no Cloudflare account)

```bash
cp .dev.vars.example .dev.vars          # NODE_ENV=development, local origin
pnpm db:local --port 55435              # PGlite on the port wrangler.jsonc points at
pnpm preview:worker                     # build:worker + wrangler dev on http://localhost:8787
```

Open **http://localhost:8787** (the same origin as `APP_ORIGIN` in
`.dev.vars`; Better Auth refuses other origins). `wrangler dev` runs the
Worker in local workerd, simulates the R2 bucket under `.wrangler/state`
(never the real bucket) and connects Hyperdrive to `localConnectionString`.
Without `RESEND_API_KEY`, emails are printed to the wrangler log.

Keep a `.dev.vars` file: without one, wrangler falls back to `.env`, which may
hold your real Neon `DATABASE_URL`.

## Scheduled emails

`wrangler.jsonc` → `triggers.crons` runs the Worker's `scheduled` handler
(`src/worker.ts`) every 15 minutes. It calls `POST /api/cron/notifications`
inside the same isolate with a single-use in-memory token (the route answers
404 to everyone else), which runs `src/server/email/notifications.server.ts`:

- **RSVP updates**: one email per invitation to its owner with the responses
  since the last one (`rsvps.owner_notified_at`). Only owners with a verified
  email get them; responses older than 7 days are never announced.
- **Event reminders**: one email to each guest who answered yes or maybe and
  typed an email address as their contact, in the 24 hours before
  `datetime.start` (`rsvps.reminder_sent_at`). Guests who replied inside those
  24 hours are not reminded.

At most 40 emails of each kind per run, about two per second (Resend's
default rate limit); the rest go out on the next run, and a failed send is
retried then. Watch the runs with `pnpm exec wrangler tail` (`[cron]` lines).
Locally: `pnpm exec wrangler dev --test-scheduled`, then open
`/cdn-cgi/handler/scheduled`. The Node server (`pnpm start`) has no cron.

`www.alikeni.com` is attached to the Worker too and only redirects (301) to
`APP_ORIGIN`.

## Caching and page views

`/i/<slug>` responds with
`Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=600`.
The HTML contains nothing visitor-specific except the `?to=` guest name,
which is part of the URL and therefore of the cache key. Browsers always
revalidate; shared caches may keep the page for 60 s and serve it stale for
10 more minutes while refetching, so **a republish shows within about a
minute** wherever the header is honoured.

On Cloudflare itself, note that a Worker runs _in front of_ the CDN cache:
its responses are not stored automatically, whatever their `Cache-Control`.
Edge caching of `/i/<slug>` needs either a Cache Rule on a **custom domain**
or a small Cache API (`caches.default`) wrapper in the Worker; neither is
built yet, so today every view renders (fast: one indexed query plus the
wishes list). Instant purge on publish would additionally need the Cloudflare
cache purge API (zone id + API token); also not implemented.

Page views are therefore not counted while rendering: after hydration the
page POSTs a small beacon (`recordViewFn`). Bots are skipped on the server by
user agent, and one view is counted per hashed IP + user agent per invitation
per UTC day, deduplicated in Postgres (`page_view_visitors`), so it holds
across isolates and regions.

## Rate limits

Guest RSVPs and wishes are limited to 5 per minute and 30 per day per hashed
IP per invitation by a sliding-window log in Postgres (`rate_limit_hits`,
per-key advisory lock in a short transaction). Every isolate and region shares
it; no Durable Object or KV is needed. Old rows are pruned as hits arrive.

## Security headers

`src/start.ts` registers a global request middleware that sets, on every
response, `Referrer-Policy: strict-origin-when-cross-origin`,
`X-Content-Type-Options: nosniff`,
`Permissions-Policy: camera=(), microphone=(), geolocation=()` and
`X-Frame-Options: SAMEORIGIN`, plus a `Content-Security-Policy` on HTML
(`src/server/platform/security-headers.ts`): `default-src 'self'`,
`frame-ancestors 'self'` (the editor frames `/preview`), explicit hosts for
Google Maps, the SoundCloud widget and Turnstile, `object-src 'none'`, no
`unsafe-eval`. `script-src` keeps `'unsafe-inline'` because TanStack Start
streams per-request inline bootstrap/dehydration scripts (hashes impossible)
and 1.169 has no per-request nonce hook; an edge-cached page would reuse a
nonce anyway. Zod runs `jitless` so it never probes `eval`.

The same file re-adds Start's CSRF middleware for server functions (defining
`requestMiddleware` replaces Start's default list).

HSTS is best set in the Cloudflare dashboard (SSL/TLS → Edge Certificates)
once a custom domain is attached.

## Known limitations

- **OG cards (`/og/<slug>.png`): `satori` is pinned to `0.32.0`; do not
  upgrade it.** satori ≥ 0.33 bundles HarfBuzz (emscripten), which reads
  `self.location.href` (undefined on Workers) and compiles WASM at runtime
  (refused by Workers), so the route answers 500 and link previews show no
  image. 0.32.0 is the last build without it. It reads TTF, OTF and WOFF but
  not WOFF2 or variable fonts, so the card uses the static `@fontsource/*`
  packages (`src/server/og/fonts.server.ts`). Its layout binary is
  `satori/yoga.wasm`.
- **Photo on the OG card needs the Cloudflare Images binding (`IMAGES` in
  `wrangler.jsonc`).** Uploads are WebP, which the card renderer cannot
  decode; on Workers the first gallery photo is converted to JPEG and the
  finished card is compressed to JPEG (about 70 KB; WhatsApp drops preview
  images near 600 KB). Two transformations per publish, then the card is
  served from R2. Without the binding, or when a conversion fails, the card
  is a PNG without the photo. On Node (dev, tests) there is no converter.
- The Worker bundle needs the paid plan (see above). The biggest pieces are
  resvg's WASM (~0.95 MB gz) and the OG fonts inlined as base64 (~0.8 MB gz);
  serving those fonts from static assets would bring it closer to 3 MB.
