import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "other/retirement-sunset",
  name: "Retirement Sunset",
  category: "other",
  tags: ["retirement", "sunset", "career", "farewell", "horizon", "milestones"],
  description:
    "A career's golden hour: a half sun setting on the horizon as crest, rolling wave lines, a career-highlights milestone story and a mosaic of photos in warm terracotta.",
  thumbnail: "/thumbs/other-retirement-sunset.webp",
  isPremium: false,
  supportedEventTypes: ["other", "anniversary"],
  radius: "0.75rem",
  ornament: "wave",
  grain: false,
  effects: { background: "waves", title: "blur", gallery: "none" },
  defaultPaletteId: "terracotta",
  defaultFontPairId: "playfair-inter",
}
