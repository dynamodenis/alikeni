import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "corporate/black-tie-gala",
  name: "Black Tie Gala",
  category: "corporate",
  tags: ["gala", "black tie", "formal", "charity", "gold", "dark"],
  description:
    "A black-tie gala: a foil headline over bold silk and a starry night, a 'Gala' seal crest, a programme of cards and a tilting mosaic of last year.",
  thumbnail: "/thumbs/corporate-black-tie-gala.webp",
  isPremium: false,
  supportedEventTypes: ["corporate", "anniversary", "other"],
  radius: "0.25rem",
  ornament: "diamond",
  grain: false,
  effects: { background: "silk", title: "shiny", gallery: "tilted" },
  defaultPaletteId: "gala",
  defaultFontPairId: "cinzel-garamond",
}
