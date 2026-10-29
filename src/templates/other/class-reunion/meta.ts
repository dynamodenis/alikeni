import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "other/class-reunion",
  name: "Class Reunion",
  category: "other",
  tags: ["reunion", "class of", "alumni", "school", "memories", "20 years"],
  description:
    'Twenty years later: a "Class of \'07" seal, a notched "20 years" ribbon under a poster headline, light confetti and a masonry wall of throwback photos.',
  thumbnail: "/thumbs/other-class-reunion.webp",
  isPremium: false,
  supportedEventTypes: ["other", "graduation"],
  radius: "0.25rem",
  ornament: "line",
  grain: false,
  effects: { background: "particles", title: "split", gallery: "none" },
  defaultPaletteId: "slate-minimal",
  defaultFontPairId: "bebas-montserrat",
}
