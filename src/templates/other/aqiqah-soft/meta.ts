import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "other/aqiqah-soft",
  name: "Aqiqah Soft",
  category: "other",
  tags: ["aqiqah", "baby", "islamic", "soft", "mint", "family"],
  description:
    "A gentle aqiqah: a faint geometric lattice, drifting leaves over soft mint silk and a seal crest with the baby's initial captioned Aqiqah.",
  thumbnail: "/thumbs/other-aqiqah-soft.webp",
  isPremium: false,
  supportedEventTypes: ["aqiqah", "baby_shower", "other"],
  radius: "0.75rem",
  ornament: "diamond",
  grain: false,
  effects: { background: "silk", title: "blur", gallery: "none" },
  defaultPaletteId: "mint-cream",
  defaultFontPairId: "cormorant-lora",
}
