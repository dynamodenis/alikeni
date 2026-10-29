import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "wedding/javanese-heritage",
  name: "Javanese Heritage",
  category: "wedding",
  tags: [
    "javanese",
    "batik",
    "traditional",
    "brown",
    "gold",
    "heritage",
    "kawung",
  ],
  description:
    "Sogan-brown batik: kawung bands frame the cover and every tinted band, a wax-seal crest carries the couple's initials, and silk drifts behind a classic serif headline.",
  thumbnail: "/thumbs/wedding-javanese-heritage.webp",
  isPremium: false,
  supportedEventTypes: ["wedding", "engagement"],
  radius: "0.125rem",
  ornament: "diamond",
  grain: true,
  effects: { background: "silk", title: "blur", gallery: "none" },
  defaultPaletteId: "sogan-batik",
  defaultFontPairId: "cormorant-lora",
}
