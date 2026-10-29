import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "anniversary/golden-years",
  name: "Golden Years",
  category: "anniversary",
  tags: ["golden", "50th", "anniversary", "formal", "foil", "milestone"],
  description:
    "Fifty golden years: a foil seal crest carrying the years, a foil poster headline over bold silk with a light star shimmer, a five-decade milestones story and a tilting mosaic.",
  thumbnail: "/thumbs/anniversary-golden-years.webp",
  isPremium: false,
  supportedEventTypes: ["anniversary", "wedding", "other"],
  defaultPaletteId: "ivory-gold",
  defaultFontPairId: "cinzel-garamond",
  radius: "0.25rem",
  ornament: "diamond",
  grain: false,
  effects: { background: "silk", title: "shiny", gallery: "tilted" },
}
