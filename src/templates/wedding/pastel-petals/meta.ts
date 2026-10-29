import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "wedding/pastel-petals",
  name: "Pastel Petals",
  category: "wedding",
  tags: ["pastel", "petals", "blush", "floral", "soft", "romantic"],
  description:
    "Blush petals drift over the cover, hero and closing while a script headline floats on a soft iridescent wash; round portraits, tilting grid photos and pillowy corners keep everything gentle.",
  thumbnail: "/thumbs/wedding-pastel-petals.webp",
  isPremium: false,
  supportedEventTypes: ["wedding", "engagement", "anniversary"],
  radius: "1.25rem",
  ornament: "dots",
  grain: false,
  effects: { background: "iridescence", title: "blur", gallery: "tilted" },
  defaultPaletteId: "blush-champagne",
  defaultFontPairId: "great-vibes-raleway",
}
