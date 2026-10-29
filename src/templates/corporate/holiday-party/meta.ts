import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "corporate/holiday-party",
  name: "Holiday Party",
  category: "corporate",
  tags: ["holiday", "christmas", "year end", "party", "snow", "festive"],
  description:
    "Snowfall: seeded snowflakes drifting over soft particles, a carousel of last December and a wall of season's greetings for the office year-end party.",
  thumbnail: "/thumbs/corporate-holiday-party.webp",
  isPremium: false,
  supportedEventTypes: ["corporate", "other"],
  radius: "1rem",
  ornament: "star",
  grain: false,
  effects: { background: "particles", title: "blur", gallery: "carousel" },
  defaultPaletteId: "holiday",
  defaultFontPairId: "fraunces-dm-sans",
}
