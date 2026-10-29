import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "baby_shower/cloud-nine",
  name: "Cloud Nine",
  category: "baby_shower",
  tags: ["clouds", "sky", "baby", "soft", "blue", "dreamy"],
  description:
    "Up in the clouds: drifting clouds over a soft silk wash on the cover, hero and closing, with pillowy corners and wave ornaments.",
  thumbnail: "/thumbs/baby-shower-cloud-nine.webp",
  isPremium: false,
  supportedEventTypes: ["baby_shower", "other"],
  radius: "1.5rem",
  ornament: "wave",
  grain: false,
  effects: { background: "silk", title: "blur", gallery: "none" },
  defaultPaletteId: "cloud-nine",
  defaultFontPairId: "josefin-quicksand",
}
