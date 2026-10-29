import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "wedding/royal-islamic",
  name: "Royal Islamic",
  category: "wedding",
  tags: ["islamic", "emerald", "gold", "geometric", "nikah", "walima"],
  description:
    "Emerald and gold girih: an eight-point star lattice behind the cover and closing, a foil headline opened by a Bismillah line, mihrab-arch portraits and a seal captioned Nikah.",
  thumbnail: "/thumbs/wedding-royal-islamic.webp",
  isPremium: false,
  supportedEventTypes: ["wedding", "engagement"],
  defaultPaletteId: "royal-emerald",
  defaultFontPairId: "cinzel-garamond",
  radius: "0.5rem",
  ornament: "star",
  grain: false,
  effects: { background: "silk", title: "shiny", gallery: "none" },
}
