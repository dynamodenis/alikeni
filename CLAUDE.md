# CLAUDE.md

The project rules are in `AGENTS.md` and apply in full:

@AGENTS.md

## Claude Code notes

- Procedures are project skills in `.claude/skills/`. Load the matching one
  before starting: `template-work`, `invitation-config-field`,
  `verify-in-browser`, `deploy-and-env`.
- Keep `AGENTS.md` as the single place for rules. Add a rule there, not
  here, so every agent reads the same thing.
- When a mistake is found and fixed, add one line to the "Lessons" list of
  the skill for that area in the same change.
- TanStack ships its own guidance: read the `SKILL.md` files under
  `node_modules/@tanstack/*/skills` before using a Start or Router API you
  have not used in this repo.
