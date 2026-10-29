import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "wedding/beach-sunset",
  name: "Beach Sunset",
  category: "wedding",
  tags: ["beach", "sunset", "coral", "ocean", "destination", "waves"],
  description:
    "A horizon at golden hour: swell lines drift across the cover and hero over bold WebGL waves, a ring counts down to sunset, and beach photos swipe past in a carousel of soft rounded cards.",
  thumbnail: "/thumbs/wedding-beach-sunset.webp",
  isPremium: false,
  supportedEventTypes: ["wedding", "engagement", "anniversary"],
  radius: "1rem",
  ornament: "wave",
  grain: false,
  effects: { background: "waves", title: "blur", gallery: "carousel" },
  defaultPaletteId: "sunset-coral",
  defaultFontPairId: "josefin-quicksand",
}
