import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "other/bridal-shower-blush",
  name: "Bridal Shower Blush",
  category: "other",
  tags: ["bridal shower", "blush", "petals", "bride", "floral", "registry"],
  description:
    "The bride-to-be: drifting petals and corner flourishes, a split cover and an arch spotlight with her portrait, a ring countdown and tilting masonry.",
  thumbnail: "/thumbs/other-bridal-shower-blush.webp",
  isPremium: false,
  supportedEventTypes: ["other", "engagement", "wedding"],
  radius: "1.25rem",
  ornament: "dots",
  grain: false,
  effects: { background: "iridescence", title: "split", gallery: "tilted" },
  defaultPaletteId: "dusty-rose",
  defaultFontPairId: "cormorant-lora",
}
