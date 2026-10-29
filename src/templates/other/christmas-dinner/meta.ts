import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "other/christmas-dinner",
  name: "Christmas Dinner",
  category: "other",
  tags: ["christmas", "dinner", "festive", "candlelit", "ruby", "december"],
  description:
    'A candlelit Christmas dinner: twinkle-light stars, holly leaves and corner flourishes around a 25 December seal, with one "Dinner is served" card on warm ruby paper.',
  thumbnail: "/thumbs/other-christmas-dinner.webp",
  isPremium: false,
  supportedEventTypes: ["other", "corporate"],
  radius: "0.5rem",
  ornament: "star",
  grain: true,
  effects: { background: "silk", title: "split", gallery: "carousel" },
  defaultPaletteId: "ruby",
  defaultFontPairId: "cormorant-lora",
}
