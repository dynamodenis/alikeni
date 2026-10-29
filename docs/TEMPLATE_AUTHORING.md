# Template authoring

How to add a template to Festly. The kit under `src/templates/_shared` does
the heavy lifting; a template is a `meta`, a `schema`, sample `defaults` and
one `index.tsx` that composes shared blocks. Target: under 200 lines, visibly
different from every other template in its category, and indistinguishable in
behaviour (SSR, no-JS, reduced motion, keyboard) from the three originals.

Start with the generator, then edit:

```bash
pnpm gen:template --id wedding/midnight-aurora --name "Midnight Aurora" \
  --base wedding/ivory-garden --palette midnight --font cinzel-garamond \
  --tags "dark,aurora,night,formal"
```

It copies the base template into `src/templates/<category>/<slug>/`, writes a
fresh `meta.ts`, registers the id in `registry.ts`, removes the name from
`UPCOMING_TEMPLATES` in `catalog.ts`, and copies the base thumbnail as a
placeholder so tests pass until `pnpm thumbs --only <id>` replaces it.

## 1. Contract

Every template exports exactly `{ meta, schema, defaults, Component }` (plus
optional `fieldsUi`) through `defineTemplate()`. The component receives only
`config` and `mode` (`"preview" | "public"`) and never fetches data.

| File          | Rule                                                                                                                                              |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `meta.ts`     | `id` is `<category>/<slug>`; `thumbnail` is `/thumbs/<category>-<slug>.webp`; `defaultPaletteId` / `defaultFontPairId` must exist in `theme/`.    |
| `schema.ts`   | `InvitationConfigBase` as-is, or `.extend({...})` for template-only fields. Never fork the base.                                                  |
| `defaults.ts` | `schema.parse({...})` so a bad sample fails at import. `theme.paletteId` / `fontPairId` must equal the meta defaults (`registry.test.ts` checks). |
| `index.tsx`   | `CoverGate` → hero wrapper (`BackgroundFx` + decor + `Hero`) → `<Sections>` → `MusicPlayer`. Read everything from props and `useInvitation()`.    |
| `fieldsUi`    | One entry per extension field (`path`, `label`, `type: text \| number \| textarea`) so the editor can render it. Required when `schema` extends.  |

The id's category must be one of `TEMPLATE_CATEGORIES` in `types.ts`;
`supportedEventTypes` lists the `EventType` values the sample content and copy
make sense for.

## 2. Vocabulary: what you compose from

### Blocks (`_shared/blocks`)

Every section block takes `BlockProps` (`eyebrow`, `title`, `tone`,
`className`) plus its `variant`. Alternate `tone="tint"` bands down the page.

| Block           | Variants                                   | Notes                                                                       |
| --------------- | ------------------------------------------ | --------------------------------------------------------------------------- |
| `CoverGate`     | `curtain` · `split` · `minimal`            | `imageUrl/imageAlt` (split), `crest`, `decor`. Reveal comes from theme.     |
| `Hero`          | `classic` · `editorial` · `poster`         | `titleEffect`, `title`, `titleClassName`, `kicker`, `hideMessage`, children |
| `Hosts`         | `duo` · `list` · `spotlight`               | `portrait`: `circle` · `arch` · `square`                                    |
| `Countdown`     | `boxes` · `inline` · `ring`                | `doneLabel`                                                                 |
| `EventDetails`  | `cards` · `timeline` · `single`            |                                                                             |
| `StoryTimeline` | `alternating` · `list` · `milestones`      |                                                                             |
| `Gallery`       | `grid` · `masonry` · `carousel` · `mosaic` | `effect`: `tilted` · `carousel` · `none`                                    |
| `MapSection`    | `embed` · `card` · `split`                 |                                                                             |
| `RsvpForm`      | `card` · `plain`                           |                                                                             |
| `Wishes`        | `cards` · `stream`                         |                                                                             |
| `GiftEnvelope`  | `envelope` · `cards`                       |                                                                             |
| `Closing`       | `signature` · `banner`                     | `crest`, `decor`, children; pair with `<Footer />`                          |
| `AddToCalendar` |                                            | Google + `/ics/$slug`                                                       |
| `Divider`       | `kind?`                                    | Draws `theme.ornament`, else `meta.ornament`                                |
| `Section`       |                                            | Primitive for template-local sections: `id`, `tone`, `width`, `decor`       |

`Sections` renders `config.sectionsOrder` and honours `config.features`; pass
only the sections you style. A section you omit simply does not render.

### Tokens

Colors come from `--inv-*` only: `bg-inv-bg`, `text-inv-fg`, `text-inv-primary`,
`bg-inv-secondary`, `text-inv-accent`, `text-inv-muted`, `border-inv-line`,
`bg-inv-surface`; type `font-inv-display` / `font-inv-body`; corners
`rounded-inv` (from `meta.radius`). Never hard-code a hex in a template.

Utilities in `styles.css`: `inv-foil` (gradient text), `inv-frame` (double
hairline inside a positioned parent; `--inv-frame-inset`), `inv-grain` (enable
with `meta.grain`), `inv-anim-float | twinkle | spin | rise` (CSS motion that
`data-motion` switches off).

### Effects (`_shared/effects`)

| Effect         | Choices                                                                                                               | Where                                              |
| -------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `BackgroundFx` | `aurora` · `silk` · `particles` · `iridescence` · `waves` · `none`; `variant` `soft` · `bold` · `confetti`; `opacity` | hero wrapper; static gradient always renders       |
| `TitleFx`      | `split` · `blur` · `shiny` · `none` (via `Hero titleEffect`)                                                          | `split` needs motion full; plain heading otherwise |
| `GalleryFx`    | `tilted` · `carousel` · `none` (via `Gallery effect`)                                                                 |                                                    |
| `Reveal`       | scroll fade-in, motion full only                                                                                      | wrap below-the-fold sections                       |

Set the three in `meta.effects` and read them back (`meta.effects.background`)
so the gallery card can describe the template.

### Decor (`_shared/decor`)

Pure SVG/CSS, seeded (`seeded(seed)`, never `Math.random`), `aria-hidden`,
renders on the server. `clear="center"` fades the layer out behind headlines.

| Piece           | Props                                | Feel                             |
| --------------- | ------------------------------------ | -------------------------------- |
| `Flourishes`    | `className`                          | botanical corners                |
| `Monogram`      | `hosts`                              | initials in a double ring        |
| `Seal`          | `label`, `caption`                   | scalloped foil rosette           |
| `ConfettiField` | `count`, `seed`, `clear`             | scattered confetti               |
| `StarField`     | `count`, `sparkles`, `seed`, `clear` | night sky with twinkles          |
| `PetalField`    | `count`, `seed`, `clear`             | drifting petals / leaves         |
| `GeoLattice`    | `seed`, `density`                    | eight-point star lattice         |
| `BatikBand`     | `className`                          | repeating parang / kawung border |
| `FilmStrip`     | `frames`, `className`                | sprocket-holed film edge         |
| `WaveLines`     | `rows`, `seed`                       | layered horizon lines            |

A signature piece that only one template needs (Confetti Pop's `AgeBadge`,
Cap & Gown's `Diploma`) lives next to that template's `index.tsx`. Promote it
to `_shared/decor` the second time another template wants it.

## 3. Motion and SSR rules

- `useInvitation().motion` is `full | reduced | none`. WebGL and `Reveal` run
  only at `full`; `split` titles only at `full`; CSS float/spin stop at
  `reduced`; everything is static at `none`. OS reduce-motion always wins.
- No `window`, `document`, `Audio`, `canvas` or `Math.random` in render or at
  module top level. ReactBits go through `effects/` (lazy + `ClientOnly`).
- The cover is a normal first screen on the server (`data-state="inline"`),
  so the page reads fine without JS.
- Every `<img>` has `alt`; decorative SVGs are `aria-hidden`.

The SSR test (`TemplateRenderer.ssr.test.tsx`) renders each template with
`renderToString` in a node environment and fails on `<canvas>`, split-text
markup or any browser global, so the rules above are enforced, not advisory.

## 4. Making it distinct

Two templates in one category must differ in at least four of: palette
mode (light/dark), font pair vibe, cover variant, hero variant, background
effect, ornament, decor family, gallery layout, radius. Write the one-line
"signature" into the component's doc comment first; if you cannot name what
only this template does, it is a palette swap, not a template.

Sample content should fit the template (names, venue, city, story) and the
`supportedEventTypes`. Photos use `https://picsum.photos/seed/<seed>/<w>/<h>`
with a seed unique to the template so galleries differ in the gallery view.

Palettes: pick from `theme/palettes.ts`. Add one only when no preset fits the
template's signature; every preset must pass the AA checks in
`palettes.test.ts` (foreground/background ≥ 4.5, primary/background ≥ 3,
foreground/secondary ≥ 4.5).

## 5. Thumbnails and contact sheets

```bash
pnpm dev                                   # in another terminal
pnpm thumbs --only wedding/midnight-aurora # one template
pnpm thumbs                                # all
pnpm contact-sheet --category wedding      # docs/batches/wedding.png
```

`pnpm thumbs` captures `/preview/<id>?device=mobile&motion=none` at 390×844
@2× and writes WebP to `public/thumbs/`. Commit the thumbnail. The contact
sheet lays every thumbnail of a category side by side for the batch review
(`docs/batches/<category>.png`); check it for two cards that look alike.

## 6. Checklist (per template)

1. `meta.ts`: id, name, category, tags (5–6 searchable words), description
   (one sentence that names the signature), palette, font pair, `radius`,
   `ornament`, `grain`, `effects`, `supportedEventTypes`.
2. `schema.ts` + `fieldsUi` if the template has its own fields.
3. `defaults.ts` parses; dates have offsets and an IANA zone; sections order
   and features cover what the template styles.
4. `index.tsx` under 200 lines; doc comment states the signature; cover,
   hero, every section in `sectionsOrder`, closing + footer, `MusicPlayer`.
   Render at least one `<Divider />` (hero children or under a section): the
   SSR test asserts `data-ornament` carries the template's ornament.
5. `/dev/templates/<id>` at motion full and none, mobile and desktop: no
   console errors, no hydration warnings, headline readable over the decor.
6. `pnpm thumbs --only <id>`; the thumbnail shows the cover, not a blank.
7. `pnpm typecheck && pnpm lint && pnpm test` green.

## 7. Batch procedure (Phase 7)

Batches are one category at a time ("Run Phase 7, batch: wedding 2–10").

1. Generate every template of the batch from the closest existing base.
2. Author them; add shared decor when two templates want the same piece.
3. `pnpm dev`, then `pnpm thumbs` and `pnpm contact-sheet --category <cat>`.
4. Review the sheet for distinctness; fix look-alikes before moving on.
5. Update `TODO.md` (batch line + count) and commit with the thumbnails and
   the contact sheet.
