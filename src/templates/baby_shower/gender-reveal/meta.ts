import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "baby_shower/gender-reveal",
  name: "Gender Reveal",
  category: "baby_shower",
  tags: ["gender reveal", "pink", "blue", "confetti", "surprise", "baby"],
  description:
    "Pink or blue: a half-pink, half-blue question-mark disc under falling confetti, with a ring countdown to the big reveal.",
  thumbnail: "/thumbs/baby-shower-gender-reveal.webp",
  isPremium: false,
  supportedEventTypes: ["baby_shower", "other"],
  radius: "2rem",
  ornament: "dots",
  grain: false,
  effects: { background: "particles", title: "shiny", gallery: "carousel" },
  defaultPaletteId: "reveal",
  defaultFontPairId: "bricolage-manrope",
}
