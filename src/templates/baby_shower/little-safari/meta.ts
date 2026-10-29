import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "baby_shower/little-safari",
  name: "Little Safari",
  category: "baby_shower",
  tags: ["safari", "jungle", "animals", "baby", "kraft", "adventure"],
  description:
    "Safari nursery: bunting across the top, drifting leaves on kraft grain and a round sun-over-acacia badge as the crest.",
  thumbnail: "/thumbs/baby-shower-little-safari.webp",
  isPremium: false,
  supportedEventTypes: ["baby_shower", "birthday", "other"],
  radius: "1rem",
  ornament: "leaf",
  grain: true,
  effects: { background: "none", title: "split", gallery: "none" },
  defaultPaletteId: "safari",
  defaultFontPairId: "baloo-nunito",
}
