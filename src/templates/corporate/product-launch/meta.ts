import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "corporate/product-launch",
  name: "Product Launch",
  category: "corporate",
  tags: ["launch", "product", "tech", "countdown", "corporate", "blue"],
  description:
    "T-minus: a bold aurora behind a poster headline, a countdown straight after the hero, an agenda timeline and a sneak-peek gallery for a product reveal.",
  thumbnail: "/thumbs/corporate-product-launch.webp",
  isPremium: false,
  supportedEventTypes: ["corporate", "other"],
  radius: "0.5rem",
  ornament: "line",
  grain: false,
  effects: { background: "aurora", title: "shiny", gallery: "none" },
  defaultPaletteId: "corporate-blue",
  defaultFontPairId: "space-grotesk-inter",
}
