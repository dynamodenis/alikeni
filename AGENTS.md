# Alikeni: rules for agents

Alikeni is one TanStack Start app: marketing site, template gallery, editor,
owner dashboard and every published invitation (`/i/<slug>`). About 50
templates are drawn by one engine from a shared, Zod-validated invitation
config. Production runs on Cloudflare Workers with Neon Postgres and R2.

Read before changing an area:

| Area                    | Read                                                            |
| ----------------------- | --------------------------------------------------------------- |
| Structure, request flow | `docs/ARCHITECTURE.md`                                          |
| Templates               | `docs/TEMPLATE_AUTHORING.md`, `src/templates/_shared/README.md` |
| Tests                   | `docs/TESTING.md`                                               |
| Deploy, env, secrets    | `docs/DEPLOY.md`                                                |
| Auth, storage           | `docs/AUTH.md`, `docs/STORAGE.md`                               |
| Original phase rules    | `docs/BUILD_PROMPT.md` ("Global rules" 1–11 still apply)        |

Step-by-step procedures live in `.claude/skills/` (see "Skills" below).

## Commands

```bash
pnpm dev            # http://localhost:3000 (the owner usually has this running)
pnpm typecheck && pnpm lint && pnpm test   # required before calling work done
pnpm format         # Prettier (Tailwind plugin); run on files you touched
pnpm e2e            # Playwright in system Chrome; own DB (55434) and app (3300)
pnpm db:generate    # new SQL migration from src/server/db/schema.ts
pnpm thumbs --only <category>/<slug>       # template thumbnail (needs pnpm dev)
pnpm blog:shots     # screenshots for blog `image` blocks (needs pnpm dev)
```

Use pnpm, never npm or yarn.

## Hard rules

### 1. Nothing that depends on the event is typed into a template

A template design (`src/templates/<category>/<slug>/*.tsx`) may contain fixed
wording ("Schedule", "Speakers", "Doors open in"). It must never contain a
value that belongs to one particular event:

- dates, days, months, years (also on seals, kickers, ribbons, badges)
- ages, anniversaries, counts ("Six decades", "Two days", "20 years")
- names of people, companies, venues or cities
- prices, phone numbers, links

Take these from `config` (`config.datetime`, `config.hosts`, `config.venue`,
a template field such as `config.age`) and format dates with
`src/lib/format-date.ts` in the invitation's time zone and locale. If the
value has no field, either add one (`schema.ts` + `fieldsUi`, with a
`.default()` so saved invitations still parse) or reword the heading so it is
true for any event. Sample content belongs only in `defaults.ts`.

`src/templates/baked-values.test.ts` fails on digits and number words in
template headings. Do not add to its allow-list to get a design through.

### 2. The invitation config is shared and stored as JSON

- `InvitationConfigBase` (`src/templates/_shared/schema/base.ts`) is the one
  shape. Templates `.extend()` it; never fork it.
- It is stored in `invitations.draft_config` / `published_config` (jsonb).
  Adding a field needs **no database migration**, but every new field must be
  optional or have a `.default()`: invitations saved earlier do not have it.
- The editor works on the draft **as stored**, not parsed. Editor code must
  tolerate a missing new key (`getIn(config, path)`, optional access). Only
  templates and blocks, which receive the parsed config, may assume defaults.
- Guest-facing text for a new block goes in **every** locale file in
  `src/lib/i18n` (`en.ts`, `id.ts`, `sw.ts`). Editor wording that depends on
  the kind of event goes in `src/components/editor/copy.ts`, never hard-coded
  wedding terms in a tab.
- A new section id must be added to `SectionId`, `isSectionEnabled`,
  `SECTION_LABELS` (editor) and `template-sections.ts`.
- **Media is addressed by key.** A photo or audio reference is saved as
  `{ assetKey, url }`; the key is the truth and the saved `url` is only a
  record. Anything that sends invitation data to the browser passes it
  through `withMediaUrls` (`src/lib/media-urls.ts`), which rebuilds each
  `url` from the key and `R2_PUBLIC_URL`. Never build a media address by
  hand, and never treat a saved `url` as current on the server: read the
  file by key.

### 3. Templates are compositions

Exactly `{ meta, schema, defaults, Component }` (+ `fieldsUi`) through
`defineTemplate()`. The component gets only `config` and `mode`, never
fetches, stays under ~200 lines and is built from `_shared/blocks`,
`effects` and `decor`. Colours only from `--inv-*` tokens, never a hex.
A change every template should get belongs in a shared block, not in 50
`index.tsx` files.

### 4. SSR safety

No `window`, `document`, `localStorage`, `canvas`, `Audio` or `Math.random`
in render or at module top level. WebGL and canvas effects are `React.lazy`
inside `<ClientOnly>` with a static fallback. The page must read correctly
with JavaScript off. `TemplateRenderer.ssr.test.tsx` enforces this.

### 5. Server boundaries

- Secrets and database code only in `*.server.ts` or server-function
  handlers. `*.functions.ts` files are imported by routes; keep their top
  level free of server-only imports.
- Zod at every server boundary. Every handler checks ownership.
- Uploads go sign → PUT → confirm; never send file bytes through a server
  function.
- Env is validated by `src/env.server.ts` **at startup**: an invalid value
  takes the whole site down with a 500. When adding or changing a variable,
  update `env.server.ts`, `.env.example`, `.dev.vars.example` and
  `docs/DEPLOY.md` together, and keep optional things optional.

### 6. Deploying

- Production deploys when the owner pushes to `main`. Do not run
  `wrangler deploy` or `pnpm run deploy`, and do not commit or push unless
  asked.
- Plain variables live in `wrangler.jsonc` → `vars` and are overwritten on
  every deploy; setting them in the Cloudflare dashboard does not last.
  Secrets are set in the dashboard or with `wrangler secret put` and never
  appear in the repo.
- A migration is needed only when `src/server/db/schema.ts` changes
  (`pnpm db:generate`, commit `drizzle/`). The `db-migrate` workflow applies
  it on push. Destructive migrations need the owner's approval first.

### 7. Money

Prices, the free RSVP cap and free expiry live only in `src/lib/plans.ts`.
A payment is accepted only when Paystack's amount and currency match the
order exactly (`applyTransaction`); keep that check. Offered currencies come
from `PAYSTACK_CURRENCIES`. Never log or echo a secret key.

### 8. Invitations lock after the event

Once the **published** event has ended (the day after its last event day,
event time zone; `src/lib/edit-lock.ts`), only gallery photos, the album and
`texts.closing` may change, on every plan. This stops a host moving the date
to revive a free page or reusing a paid invitation.

- The server enforces it in `saveDraft` and `publishInvitation`; the editor
  only mirrors it. Any new way to change an invitation's content must apply
  the same check.
- To let a new field stay editable, add its path to `LOCKED_EDITABLE_PATHS`
  and ask the owner first.
- Support unlock: set `invitations.edit_unlocked_until` (`docs/DEPLOY.md`).

### 9. Loading states

- A page or preview that is loading shows `BrandLoader`
  (`src/components/brand/Loader.tsx`). The plain `LoaderCircle` spinner is
  only for small "busy" icons inside buttons and inline status text.
- The header and footer never disappear while content loads. A route with a
  loader sets `pendingComponent` to the matching shell from
  `src/components/brand/pending.tsx` (`DashboardPending`, `SitePending`);
  only pages with no shell fall back to the full-page loader.

### 10. Free-plan limits

Production runs on free plans: Workers (100,000 requests a day, 10 ms CPU
per request), Hyperdrive (100,000 queries a day) and Resend (100 emails a
day). Going over fails requests or stops email; nothing is billed. So:

- Do not add a server call that runs on every page view, hover or
  navigation. Session checks for navigation go through
  `navigationSession()` (`src/lib/session.ts`), never `getSessionFn`
  directly; marketing pages ask for the session only when `hasAccountHint()`.
- A public page that is the same for every visitor must stay cacheable
  (`src/server/platform/edge-cache.ts`): nothing visitor-specific in the
  HTML of `/i/<slug>`, no cookies set on it.
- Scheduled emails go through `runNotifications`, which enforces
  `EMAIL_DAILY_BUDGET` and the hourly gap per invitation. A new kind of
  scheduled email must count against the same budget.
- Count the queries a new loader or job makes; batch them.

### 11. Accessibility and motion

Respect `prefers-reduced-motion` and `theme.motionLevel`. Every `<img>` has
`alt`; decorative SVG is `aria-hidden`. Palettes pass the AA checks in
`palettes.test.ts`. Select by role and label in tests; do not add test ids.

### 12. Code quality

TypeScript strict, no `any` in app code, ESLint and Prettier clean, tests
next to the code. `src/components/ui` (shadcn) and
`src/components/reactbits` are registry-owned: wrap them, do not edit them.
ReactBits is fetched from the `@react-bits` registry, never hand-written,
and its source is never redistributed.

### 13. Ask before irreversible choices

Providers (database, auth, storage, payments, hosting), destructive
migrations, deleting user data, and anything that sends email or charges
money.

## Definition of done

1. `pnpm typecheck && pnpm lint && pnpm test` pass, or the failing test is
   named with its reason.
2. A user-visible change was looked at in a browser (skill
   `verify-in-browser`), on a phone width as well as desktop.
3. For a template or shared block: checked with an invitation whose date,
   names and venue differ from the sample, and with an invitation saved
   before the change.
4. The report says what was not checked.

## Skills

Procedures in `.claude/skills/<name>/SKILL.md`. Each ends with a "Lessons"
list: when a mistake or surprise happens in that area, add one line there in
the same change that fixes it.

| Skill                     | Use when                                                         |
| ------------------------- | ---------------------------------------------------------------- |
| `template-work`           | creating or editing a template, block or decor piece             |
| `invitation-config-field` | adding a field, section or editor tab to invitations             |
| `verify-in-browser`       | checking the editor, preview or a published page in a browser    |
| `deploy-and-env`          | env variables, secrets, deploys, migrations, a 500 in production |
