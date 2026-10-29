import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "birthday/princess-castle",
  name: "Princess Castle",
  category: "birthday",
  tags: ["princess", "castle", "fairytale", "lavender", "kids", "sparkle"],
  description:
    "A fairytale invitation: a three-turret castle crest with a crown opens and closes the page, sparkles twinkle over an iridescent wash, the script headline shines and the ring countdown waits for the ball.",
  thumbnail: "/thumbs/birthday-princess-castle.webp",
  isPremium: false,
  supportedEventTypes: ["birthday", "other"],
  defaultPaletteId: "lavender",
  defaultFontPairId: "dancing-lora",
  radius: "1.25rem",
  ornament: "star",
  grain: false,
  effects: { background: "iridescence", title: "shiny", gallery: "carousel" },
}
