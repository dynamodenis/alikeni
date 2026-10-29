import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "anniversary/silver-jubilee",
  name: "Silver Jubilee",
  category: "anniversary",
  tags: ["silver", "25th", "anniversary", "elegant", "monogram", "classic"],
  description:
    "Twenty-five in silver: a monogram crest, a hairline-framed hero over soft waves with the years in a thin double-ring badge, and arch portraits.",
  thumbnail: "/thumbs/anniversary-silver-jubilee.webp",
  isPremium: false,
  supportedEventTypes: ["anniversary", "wedding", "other"],
  defaultPaletteId: "silver",
  defaultFontPairId: "playfair-inter",
  radius: "0.5rem",
  ornament: "line",
  grain: false,
  effects: { background: "waves", title: "blur", gallery: "none" },
}
