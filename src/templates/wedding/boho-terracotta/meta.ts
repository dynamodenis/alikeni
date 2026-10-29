import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "wedding/boho-terracotta",
  name: "Boho Terracotta",
  category: "wedding",
  tags: ["boho", "terracotta", "arch", "desert", "sun", "earthy"],
  description:
    "Desert boho: a slowly turning sun crest, arch-framed portraits, very round corners, an iridescent shimmer behind a script headline and a swipeable photo carousel.",
  thumbnail: "/thumbs/wedding-boho-terracotta.webp",
  isPremium: false,
  supportedEventTypes: ["wedding", "engagement"],
  defaultPaletteId: "terracotta",
  defaultFontPairId: "dancing-lora",
  radius: "2rem",
  ornament: "wave",
  grain: true,
  effects: { background: "iridescence", title: "split", gallery: "carousel" },
}
