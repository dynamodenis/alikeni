import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "graduation/varsity",
  name: "Varsity",
  category: "graduation",
  tags: [
    "varsity",
    "letterman",
    "college",
    "stripes",
    "maroon",
    "sport",
    "poster",
  ],
  description:
    "A letterman jacket: maroon, navy and cream with three cuff stripes across the cover and hero, the graduate's initial on a stitched chenille patch and poster-size type.",
  thumbnail: "/thumbs/graduation-varsity.webp",
  isPremium: false,
  supportedEventTypes: ["graduation", "other"],
  defaultPaletteId: "varsity",
  defaultFontPairId: "bebas-montserrat",
  radius: "0.5rem",
  ornament: "dots",
  grain: false,
  effects: { background: "none", title: "split", gallery: "none" },
}
