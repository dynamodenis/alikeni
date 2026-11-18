---
name: invitation-config-field
description: Add or change a field, section or editor tab in the Alikeni invitation config (InvitationConfigBase), for example tickets, sponsors, a new host attribute or a new guest-facing section. Covers schema defaults, the editor, shared blocks, translations and compatibility with invitations saved earlier.
---

# Adding to the invitation config

The config is one Zod shape (`src/templates/_shared/schema/base.ts`) stored
as JSON in `invitations.draft_config` and `published_config`. No database
migration is involved. The risk is the other way round: thousands of saved
invitations do not have the new key.

## Two views of the same config

| Reader                             | Gets                            | May assume the new key exists |
| ---------------------------------- | ------------------------------- | ----------------------------- |
| Templates, blocks, the public page | parsed config (`resolveConfig`) | yes, defaults are applied     |
| The editor (`useEditor().config`)  | the draft exactly as stored     | **no**                        |

In editor code read new keys with `getIn(config, path)` or optional access.
Anything shared between the two (for example `isSectionEnabled`) must accept
the key missing.

## Steps

1. **Schema** (`base.ts`): add the field as optional or with `.default()`.
   Export its type. Add it to `schema/sample.ts`.
2. **Section** (only for a new page section): add the id to `SectionId`;
   `isSectionEnabled` in `blocks/Sections.tsx` (hide when empty); a label in
   `SECTION_LABELS` (`editor/tabs/SectionsTab.tsx`) and in
   `templates/template-sections.ts`.
3. **Block**: build it in `_shared/blocks`, export from `blocks/index.ts`.
   To give it to every template without editing each one, add a default
   entry in `Sections` (see `admission` and `sponsors`); a template can
   still pass its own.
4. **Guest-facing strings**: `src/lib/i18n/en.ts` and `id.ts`, same keys.
   Let the host override a heading with an optional `title` field.
5. **Editor**: fields in a tab under `src/components/editor/tabs/`. Wording
   that depends on the kind of event goes in `editor/copy.ts` (per
   category), not in the tab. Register a new tab in `Editor.tsx` (`TabId`,
   `TABS` with its config `prefixes`, `PANELS`).
6. **Visibility**: content the host adds should appear in the preview
   without a second step. If a section must be in `sectionsOrder` to show,
   add it automatically when its first content is added (`SectionSwitch` in
   `TicketsTab.tsx`).
7. **Uploads**: reuse an existing `UploadPurpose` unless the server needs to
   treat the file differently.
8. **Sample**: add content to one or two template `defaults.ts` so the
   gallery shows the feature.

## Checks

- `pnpm typecheck && pnpm lint && pnpm test`.
- In a browser (skill `verify-in-browser`), with **two** drafts: a new one,
  and one with the new keys removed from `draft_config` to stand in for an
  older invitation. Open every editor tab on the older one.
- Fill the new fields and watch the preview follow each edit.
- Phone width for the new block.

## Lessons

Add a line when something goes wrong here. Newest first.

- 2026-11-18: The editor crashed on the Sections tab for an older
  invitation: `isSectionEnabled` read `config.admission.tiers` on a draft
  that had no `admission`. The editor passes drafts unparsed.
- 2026-11-18: Tickets typed into an older invitation did not show in the
  preview, because the section was not in its `sectionsOrder` and needed a
  switch the host had not noticed. Sections now switch on with their first
  content.
- 2026-11-18: The editor asked a conference speaker for a "Family line"
  with a wedding example. Editor wording now comes from `copy.ts` by
  template category.
