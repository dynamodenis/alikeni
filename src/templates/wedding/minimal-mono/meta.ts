import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "wedding/minimal-mono",
  name: "Minimal Mono",
  category: "wedding",
  tags: [
    "minimal",
    "black",
    "white",
    "typographic",
    "modern",
    "clean",
    "editorial",
  ],
  description:
    "Pure typography: an oversized left-aligned editorial headline on black and white, hairline rules, square corners and no effects, decor or motion.",
  thumbnail: "/thumbs/wedding-minimal-mono.webp",
  isPremium: false,
  supportedEventTypes: ["wedding", "engagement", "anniversary"],
  radius: "0rem",
  ornament: "line",
  grain: false,
  effects: { background: "none", title: "none", gallery: "none" },
  defaultPaletteId: "monochrome",
  defaultFontPairId: "geist",
}
