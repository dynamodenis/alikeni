import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "wedding/midnight-aurora",
  name: "Midnight Aurora",
  category: "wedding",
  tags: ["dark", "night", "aurora", "formal", "stars", "modern", "hairline"],
  description:
    "A night sky: a seeded star field under a bold aurora, thin hairline sans typography, a foil headline and a small monogram crest for an evening wedding.",
  thumbnail: "/thumbs/wedding-midnight-aurora.webp",
  isPremium: false,
  supportedEventTypes: ["wedding", "engagement", "anniversary"],
  radius: "0.25rem",
  ornament: "star",
  grain: false,
  effects: { background: "aurora", title: "shiny", gallery: "none" },
  defaultPaletteId: "midnight",
  defaultFontPairId: "bricolage-manrope",
}
