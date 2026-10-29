import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "birthday/retro-arcade",
  name: "Retro Arcade",
  category: "birthday",
  tags: ["arcade", "retro", "pixel", "8-bit", "gaming", "30th", "party"],
  description:
    "An 8-bit birthday: seeded pixel blocks twinkle behind the cover and hero, the age reads as a zero-padded HI-SCORE on a dotted scoreboard that blinks INSERT COIN, and every corner is square.",
  thumbnail: "/thumbs/birthday-retro-arcade.webp",
  isPremium: false,
  supportedEventTypes: ["birthday", "other"],
  defaultPaletteId: "arcade",
  defaultFontPairId: "bebas-montserrat",
  radius: "0rem",
  ornament: "dots",
  grain: false,
  effects: { background: "none", title: "split", gallery: "none" },
}
