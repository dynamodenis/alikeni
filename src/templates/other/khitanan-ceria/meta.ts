import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "other/khitanan-ceria",
  name: "Khitanan Ceria",
  category: "other",
  tags: ["khitanan", "sunat", "ceria", "indonesia", "confetti", "kids"],
  description:
    "A joyful khitanan: bunting and confetti over falling confetti particles, a seal crest with the boy's initial and warm Indonesian copy throughout.",
  thumbnail: "/thumbs/other-khitanan-ceria.webp",
  isPremium: false,
  supportedEventTypes: ["khitanan", "birthday", "other"],
  radius: "1.5rem",
  ornament: "wave",
  grain: false,
  effects: { background: "particles", title: "blur", gallery: "none" },
  defaultPaletteId: "sunshine",
  defaultFontPairId: "baloo-nunito",
}
