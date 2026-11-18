---
name: deploy-and-env
description: Handle Alikeni environment variables, Cloudflare Worker secrets, deploys, database migrations and Paystack settings, and diagnose a 500 or misconfiguration on the live site at alikeni.com. Use when adding or changing configuration, when asked how something reaches production, or when production is failing.
---

# Deploys, env and production

Full reference: `docs/DEPLOY.md`.

## How a change reaches production

| What                     | Lives in                                     | Takes effect                                    |
| ------------------------ | -------------------------------------------- | ----------------------------------------------- |
| Code                     | `main` branch                                | the owner pushes; Cloudflare builds and deploys |
| Plain variables          | `wrangler.jsonc` → `vars`                    | next deploy; the dashboard value is overwritten |
| Secrets                  | Cloudflare dashboard / `wrangler secret put` | at once; survive deploys                        |
| Database schema          | `drizzle/` migrations                        | `db-migrate` workflow on push to `main`         |
| Invitation config fields | JSON in the database                         | no migration (skill `invitation-config-field`)  |

- Do not run `wrangler deploy` or `pnpm run deploy`. A bare
  `wrangler deploy` uploads whatever is in `dist-worker/`, which may be days
  old.
- Do not commit or push unless the owner asks.

## Adding or changing a variable

1. `src/env.server.ts`: add it to the Zod schema. Keep it optional or give
   it a default unless the app truly cannot run without it.
2. `.env.example` and `.dev.vars.example`, with a comment.
3. `wrangler.jsonc` → `vars` if it is not secret.
4. `docs/DEPLOY.md`: the vars list or the `wrangler secret put` list.
5. Tell the owner which secrets to set and where. Never ask for the value
   in chat and never print one.

The env is validated when the Worker starts. One invalid value fails every
server-rendered page with
`{"status":500,"unhandled":true,"message":"HTTPError"}` while static files
still load.

## Production returns 500

```bash
for p in / /templates /robots.txt; do
  curl -s -o /dev/null -w "$p %{http_code}\n" https://alikeni.com$p
done
pnpm exec wrangler tail alikeni --format json   # then request the page
```

Read `logs[].message` in the tail output; an env problem says
`Invalid server environment:` and names the variable. Fixing a secret in the
dashboard restores the site within seconds, with no deploy.

To see what is actually deployed, fetch a page and look for something only
the latest commit renders.

## Payments (Paystack)

- Prices: `PREMIUM_PRICE` in `src/lib/plans.ts`, in subunits (cents).
  `plans.test.ts` asserts the formatted prices; update it with real price
  changes.
- Currencies offered: `PAYSTACK_CURRENCIES` in `wrangler.jsonc`.
- Secret: `PAYSTACK_SECRET_KEY`, must match `sk_test_…` or `sk_live_…`
  exactly (no quotes, spaces, or the public `pk_` key).
- Webhook URL in Paystack, set separately for test and live:
  `https://alikeni.com/api/payments/paystack`. An unsigned POST to it
  returns 401; that is the healthy answer.
- The callback URL in the Paystack dashboard stays empty: each checkout
  sends its own.
- Checkout is Paystack's hosted page; enabled channels appear there without
  code changes.

## Migrations

Only when `src/server/db/schema.ts` changes: `pnpm db:generate`, review the
SQL, commit `drizzle/`. Restart any local `pnpm db:local` afterwards.
Destructive changes (drop, rename, type change on data) need the owner's
approval before the migration is written.

## Lessons

Add a line when something goes wrong here. Newest first.

- 2026-11-18: The site went down after a deploy because the saved
  `PAYSTACK_SECRET_KEY` did not match the `sk_(test|live)_` pattern. A new
  secret only takes effect in the running Worker on the next deploy or
  secret change, so the failure appeared with an unrelated push.
- 2026-11-18: `npx wrangler deploy` offered to upload a build from two days
  earlier, with a removed `ALBUM_FREE_PREVIEW` and the old currency list.
  Deploys go through the push to `main`.
- 2026-11-18: Temporary test prices were pushed to `main` for live payment
  tests. Anything temporary in `plans.ts` needs a comment saying what to
  restore, and the owner reminded until it is restored.
