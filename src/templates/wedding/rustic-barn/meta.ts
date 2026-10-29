import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "wedding/rustic-barn",
  name: "Rustic Barn",
  category: "wedding",
  tags: ["rustic", "barn", "countryside", "wood", "kraft", "warm"],
  description:
    "Kraft paper and barn wood: leaves drift over a warm hero inside a double hairline frame, a seal reads the year, and masonry photos tilt like pinned prints.",
  thumbnail: "/thumbs/wedding-rustic-barn.webp",
  isPremium: false,
  supportedEventTypes: ["wedding", "engagement", "anniversary"],
  defaultPaletteId: "barnwood",
  defaultFontPairId: "fraunces-dm-sans",
  radius: "0.75rem",
  ornament: "leaf",
  grain: true,
  effects: { background: "waves", title: "blur", gallery: "tilted" },
}
