import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "anniversary/love-letter",
  name: "Love Letter",
  category: "anniversary",
  tags: ["letter", "romantic", "anniversary", "handwritten", "blush", "petals"],
  description:
    "A handwritten letter: a tilted paper card in the hero quotes the invitation in a script face and signs off with the couple's names, while petals drift over an iridescent wash.",
  thumbnail: "/thumbs/anniversary-love-letter.webp",
  isPremium: false,
  supportedEventTypes: ["anniversary", "wedding", "engagement", "other"],
  defaultPaletteId: "blush-champagne",
  defaultFontPairId: "dancing-lora",
  radius: "0.75rem",
  ornament: "dots",
  grain: true,
  effects: { background: "iridescence", title: "none", gallery: "tilted" },
}
