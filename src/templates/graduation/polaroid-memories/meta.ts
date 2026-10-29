import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "graduation/polaroid-memories",
  name: "Polaroid Memories",
  category: "graduation",
  tags: ["polaroid", "photos", "memories", "peach", "scrapbook", "wall"],
  description:
    "A photo wall on matte paper: the graduate's portrait in a tilted Polaroid frame with a handwritten caption, light confetti, a ring countdown and masonry photos that tilt.",
  thumbnail: "/thumbs/graduation-polaroid-memories.webp",
  isPremium: false,
  supportedEventTypes: ["graduation", "birthday", "other"],
  defaultPaletteId: "peach-sorbet",
  defaultFontPairId: "josefin-quicksand",
  radius: "0.5rem",
  ornament: "wave",
  grain: true,
  effects: { background: "none", title: "blur", gallery: "tilted" },
}
