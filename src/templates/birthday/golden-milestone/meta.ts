import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "birthday/golden-milestone",
  name: "Golden Milestone",
  category: "birthday",
  tags: ["milestone", "gold", "navy", "formal", "60th", "elegant", "black tie"],
  description:
    "A formal milestone in navy and gold: a rosette seal carries the age, the foil poster headline sits over bold silk and a star field, the story reads as decade milestones and photos tilt in a mosaic.",
  thumbnail: "/thumbs/birthday-golden-milestone.webp",
  isPremium: false,
  supportedEventTypes: ["birthday", "anniversary", "other"],
  radius: "0.25rem",
  ornament: "diamond",
  grain: false,
  effects: { background: "silk", title: "shiny", gallery: "tilted" },
  defaultPaletteId: "navy-gold",
  defaultFontPairId: "cinzel-garamond",
}
