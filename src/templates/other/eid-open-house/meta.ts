import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "other/eid-open-house",
  name: "Eid Open House",
  category: "other",
  tags: ["eid", "open house", "crescent", "lantern", "islamic", "family"],
  description:
    "Eid Mubarak: a crescent moon with a hanging lantern as crest, an eight-point star lattice over the cover and closing, and a foil headline over soft silk.",
  thumbnail: "/thumbs/other-eid-open-house.webp",
  isPremium: false,
  supportedEventTypes: ["other"],
  radius: "0.5rem",
  ornament: "star",
  grain: false,
  effects: { background: "silk", title: "shiny", gallery: "none" },
  defaultPaletteId: "eid",
  defaultFontPairId: "cinzel-garamond",
}
