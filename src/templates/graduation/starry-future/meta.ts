import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "graduation/starry-future",
  name: "Starry Future",
  category: "graduation",
  tags: ["stars", "constellation", "future", "night", "aurora", "dream"],
  description:
    'The road ahead under stars: a twinkling constellation crest, a star field under a slow aurora, a foil "Class of" headline and an alternating "journey" timeline.',
  thumbnail: "/thumbs/graduation-starry-future.webp",
  isPremium: false,
  supportedEventTypes: ["graduation", "other"],
  defaultPaletteId: "midnight",
  defaultFontPairId: "fraunces-dm-sans",
  radius: "1rem",
  ornament: "star",
  grain: false,
  effects: { background: "aurora", title: "shiny", gallery: "none" },
}
