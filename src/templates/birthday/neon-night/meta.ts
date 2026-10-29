import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "birthday/neon-night",
  name: "Neon Night",
  category: "birthday",
  tags: ["neon", "night", "club", "21st", "dark", "glow", "party"],
  description:
    "Neon tubes after dark: the age glows and flickers as a layered neon sign over a bold aurora, a city haze of stars hangs behind the poster headline and every corner is cut sharp.",
  thumbnail: "/thumbs/birthday-neon-night.webp",
  isPremium: false,
  supportedEventTypes: ["birthday", "other"],
  defaultPaletteId: "neon-night",
  defaultFontPairId: "space-grotesk-inter",
  radius: "0.5rem",
  ornament: "line",
  grain: false,
  effects: { background: "aurora", title: "shiny", gallery: "none" },
}
