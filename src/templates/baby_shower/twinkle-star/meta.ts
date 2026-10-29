import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "baby_shower/twinkle-star",
  name: "Twinkle Star",
  category: "baby_shower",
  tags: ["stars", "moon", "night", "baby", "gold", "twinkle"],
  description:
    "A twinkle-twinkle night sky: a star field under a slow aurora, a crescent moon crest with a hanging star and a gold foil headline.",
  thumbnail: "/thumbs/baby-shower-twinkle-star.webp",
  isPremium: false,
  supportedEventTypes: ["baby_shower", "birthday", "other"],
  radius: "1rem",
  ornament: "star",
  grain: false,
  effects: { background: "aurora", title: "shiny", gallery: "none" },
  defaultPaletteId: "navy-gold",
  defaultFontPairId: "cormorant-lora",
}
