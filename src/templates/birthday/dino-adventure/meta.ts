import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "birthday/dino-adventure",
  name: "Dino Adventure",
  category: "birthday",
  tags: ["dino", "jungle", "kids", "adventure", "green", "egg", "party"],
  description:
    "A jungle expedition: leaves drift over a firefly particle wash, the age hatches from a cracked, spotted dino egg with a footprint trail, and every band sits in rounded sticker cards.",
  thumbnail: "/thumbs/birthday-dino-adventure.webp",
  isPremium: false,
  supportedEventTypes: ["birthday", "other"],
  defaultPaletteId: "mint-cream",
  defaultFontPairId: "baloo-nunito",
  radius: "1.5rem",
  ornament: "leaf",
  grain: false,
  effects: { background: "particles", title: "blur", gallery: "none" },
}
