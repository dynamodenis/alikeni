import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "other/engagement-sparkle",
  name: "Engagement Sparkle",
  category: "other",
  tags: ["engagement", "sparkle", "proposal", "lavender", "script", "ring"],
  description:
    "She said yes: StarField sparkles over an iridescent lavender wash, a monogram crest, a ring countdown and a carousel of the proposal.",
  thumbnail: "/thumbs/other-engagement-sparkle.webp",
  isPremium: false,
  supportedEventTypes: ["engagement", "wedding", "other"],
  radius: "1rem",
  ornament: "star",
  grain: false,
  effects: { background: "iridescence", title: "shiny", gallery: "carousel" },
  defaultPaletteId: "lavender",
  defaultFontPairId: "great-vibes-raleway",
}
