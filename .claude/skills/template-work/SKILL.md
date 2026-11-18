---
name: template-work
description: Create or edit an Alikeni invitation template, shared block or decor piece. Use for any change under src/templates, including headings, seals, kickers and sample content, and when reviewing a template for values that should come from the invitation.
---

# Template work

Read `docs/TEMPLATE_AUTHORING.md` first for the contract, the block and
effect vocabulary and the per-template checklist. This skill adds the checks
that have gone wrong in practice.

## Where things belong

| Kind of value                                   | Where it goes                                   |
| ----------------------------------------------- | ----------------------------------------------- |
| Fixed wording ("Schedule", "On stage")          | `index.tsx`, as `eyebrow` / `title` props       |
| Anything about one event (see below)            | read from `config`, never typed into the design |
| Sample people, dates, venue, story              | `defaults.ts` only                              |
| A value only this template needs (age, classOf) | `schema.ts` `.extend()` + `fieldsUi`            |
| Something every template should show            | a shared block in `_shared/blocks`              |

## Event data is never typed into a design

Before finishing any template edit, check every string in the template's
`.tsx` files. These must come from `config`:

- dates, days, months, years, including two-digit years on a `Seal`
- ages, anniversaries, durations, counts ("Six decades", "Two days")
- names of people, companies, venues, cities
- prices, phone numbers, links

How to supply them:

```tsx
import { dateParts } from "@/lib/format-date"

const { motion, palette, locale } = useInvitation()
const date = dateParts(config.datetime.start, config.datetime.timezone, locale)
// date.day "13", date.month "May", date.year "2027", date.weekday, date.time

<Hero kicker={`Conference · ${date.year}`} />
<EventDetails eyebrow={`${date.day} ${date.month}`} title="Schedule" />
<Seal label={`'${date.year.slice(-2)}`} caption="Est." />
<Hosts title={hostNames(config.hosts)} />        // from _shared/blocks
```

If no field holds the value:

1. Prefer deriving it (days between `datetime.start` and `end`, years since
   a class year).
2. Else add a template field: `schema.ts` `.extend({ x: … .default(…) })`,
   an entry in `fieldsUi`, the value in `defaults.ts`, and the field's path
   in the Basics tab `prefixes` in `src/components/editor/Editor.tsx` so its
   validation errors show a badge. The `.default()` keeps invitations saved
   before the field existed parsing.
3. Else reword the heading so it holds for any event ("Through the years").

The sample must render the same before and after: compare the preview.

## Audit command

Lists digits, month and weekday names in template string props and text:

```bash
FILES=$(find src/templates -name '*.tsx' -not -path '*/_shared/*' -not -name '*.test.tsx')
grep -n -H -E '(=|\{)"[^"]*([0-9]|January|February|March|April|June|July|August|September|October|November|December|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)[^"]*"' $FILES \
  | grep -v -E 'className=|ClassName=|viewBox|seed=|d="'
```

`src/templates/baked-values.test.ts` runs a stricter version on every
`pnpm test`. It cannot see names of people or places: read for those.

## Before calling it done

1. `pnpm typecheck && pnpm lint && pnpm vitest run src/templates`.
2. Look at `/preview/<category>/<slug>` at phone and desktop width
   (skill `verify-in-browser`).
3. In the editor, change the date, the names and the venue: every place the
   sample showed them must follow.
4. If the cover changed: `pnpm thumbs --only <category>/<slug>` and commit
   the thumbnail.

## Lessons

Add a line when something goes wrong here. Newest first.

- 2026-11-18: A conference closed with "With love, Alikeni & Tunde &
  Halima": the closing signed with every person listed, speakers included,
  and used wedding wording. `Closing` now signs with `signatories(hosts)`
  (role "other" is left out when someone else hosts) and corporate events
  get `closing.signOffFormal`. A shared block must read well for every
  category, not only weddings: check a corporate template too.
- 2026-11-18: Conference Grid showed "13 May" and "Conference · 2027" for
  every event because they were typed into `index.tsx`. An audit found the
  same in ten more templates: years on seals (Rustic Barn, Black Tie Gala,
  Class Reunion), a couple's names as a heading (Minimal Mono), "Six
  decades", "Two days", "Christmas Day". All now come from `config`.
- 2026-11-18: A grep limited to `eyebrow|kicker|title` missed the seals,
  which use `label` and `caption`. Audit every string prop, not a list of
  prop names you expect.
