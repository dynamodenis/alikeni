import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "wedding/cinema-reel",
  name: "Cinema Reel",
  category: "wedding",
  tags: ["cinema", "film", "noir", "poster", "retro", "premiere"],
  description:
    "A premiere night in noir: the couple's names as a poster title card, an admit-one ticket stub on the cover, a strip of 35 mm film holding the first stills, and showtimes instead of a schedule.",
  thumbnail: "/thumbs/wedding-cinema-reel.webp",
  isPremium: false,
  supportedEventTypes: ["wedding", "engagement", "anniversary"],
  radius: "0.25rem",
  ornament: "line",
  grain: true,
  effects: { background: "particles", title: "split", gallery: "none" },
  defaultPaletteId: "noir",
  defaultFontPairId: "bebas-montserrat",
}
