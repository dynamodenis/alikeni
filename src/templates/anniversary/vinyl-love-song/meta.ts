import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "anniversary/vinyl-love-song",
  name: "Vinyl Love Song",
  category: "anniversary",
  tags: ["vinyl", "record", "music", "anniversary", "retro", "dark"],
  description:
    "A record: a spinning vinyl with the years on its Side A label, a needle-drop countdown, a tracklist schedule and liner-notes story, with dust drifting over charcoal and copper.",
  thumbnail: "/thumbs/anniversary-vinyl-love-song.webp",
  isPremium: false,
  supportedEventTypes: ["anniversary", "wedding", "birthday", "other"],
  defaultPaletteId: "charcoal-copper",
  defaultFontPairId: "bricolage-manrope",
  radius: "1rem",
  ornament: "dots",
  grain: true,
  effects: { background: "particles", title: "split", gallery: "none" },
}
