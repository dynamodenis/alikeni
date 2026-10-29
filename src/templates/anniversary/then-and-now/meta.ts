import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "anniversary/then-and-now",
  name: "Then and Now",
  category: "anniversary",
  tags: [
    "minimal",
    "photos",
    "anniversary",
    "modern",
    "typographic",
    "then-and-now",
  ],
  description:
    "Two photos, two dates: a then-and-now pair of square photos under a light editorial headline, hairline grid and no effects, with the years counted in a milestones story.",
  thumbnail: "/thumbs/anniversary-then-and-now.webp",
  isPremium: false,
  supportedEventTypes: ["anniversary", "wedding", "other"],
  defaultPaletteId: "slate-minimal",
  defaultFontPairId: "geist",
  radius: "0.25rem",
  ornament: "line",
  grain: false,
  effects: { background: "none", title: "none", gallery: "none" },
}
