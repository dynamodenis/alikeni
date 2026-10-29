import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "graduation/chalkboard",
  name: "Chalkboard",
  category: "graduation",
  tags: [
    "chalkboard",
    "school",
    "chalk",
    "handwritten",
    "classroom",
    "green",
    "doodles",
  ],
  description:
    'A classroom board: a hand-drawn dashed chalk frame with star and arrow doodles around a handwritten "Class of" headline, chalk-dust grain, a "Sign my board" guest wall.',
  thumbnail: "/thumbs/graduation-chalkboard.webp",
  isPremium: false,
  supportedEventTypes: ["graduation", "other"],
  defaultPaletteId: "chalkboard",
  defaultFontPairId: "dancing-lora",
  radius: "0.125rem",
  ornament: "line",
  grain: true,
  effects: { background: "none", title: "blur", gallery: "none" },
}
