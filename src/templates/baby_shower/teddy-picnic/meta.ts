import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "baby_shower/teddy-picnic",
  name: "Teddy Picnic",
  category: "baby_shower",
  tags: ["teddy", "picnic", "gingham", "baby", "bear", "bunting"],
  description:
    "A teddy bears' picnic: a stitched bear-face crest, bunting overhead, a gingham blanket strip under the hero and a ring countdown.",
  thumbnail: "/thumbs/baby-shower-teddy-picnic.webp",
  isPremium: false,
  supportedEventTypes: ["baby_shower", "birthday", "other"],
  radius: "1.25rem",
  ornament: "dots",
  grain: false,
  effects: { background: "none", title: "blur", gallery: "none" },
  defaultPaletteId: "peach-sorbet",
  defaultFontPairId: "dancing-lora",
}
