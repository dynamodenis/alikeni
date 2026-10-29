import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "other/housewarming-keys",
  name: "Housewarming Keys",
  category: "other",
  tags: ["housewarming", "new home", "keys", "map", "neighbours", "registry"],
  description:
    "New keys: a house-and-key crest, a hairline frame around the hero and the map right after the details so every guest can find the front door.",
  thumbnail: "/thumbs/other-housewarming-keys.webp",
  isPremium: false,
  supportedEventTypes: ["other"],
  radius: "0.5rem",
  ornament: "line",
  grain: false,
  effects: { background: "none", title: "split", gallery: "none" },
  defaultPaletteId: "peach-sorbet",
  defaultFontPairId: "fraunces-dm-sans",
}
