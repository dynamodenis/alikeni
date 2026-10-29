import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "baby_shower/botanical-sage",
  name: "Botanical Sage",
  category: "baby_shower",
  tags: ["botanical", "sage", "greenhouse", "leaves", "baby", "natural"],
  description:
    "A greenhouse shower: drifting leaves and botanical corners inside a double hairline frame, arch portraits and a tilting photo mosaic over silk.",
  thumbnail: "/thumbs/baby-shower-botanical-sage.webp",
  isPremium: false,
  supportedEventTypes: ["baby_shower", "other"],
  radius: "0.5rem",
  ornament: "leaf",
  grain: true,
  effects: { background: "silk", title: "split", gallery: "tilted" },
  defaultPaletteId: "sage",
  defaultFontPairId: "fraunces-dm-sans",
}
