import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "birthday/garden-tea-party",
  name: "Garden Tea Party",
  category: "birthday",
  tags: [
    "tea party",
    "garden",
    "sage",
    "80th",
    "afternoon",
    "floral",
    "vintage",
  ],
  description:
    "An afternoon tea in sage: a steaming teacup crest, botanical flourishes in the corners of a double-hairline frame, arch portraits, a split cover with the guest of honour and tilting masonry photos on matte paper grain.",
  thumbnail: "/thumbs/birthday-garden-tea-party.webp",
  isPremium: false,
  supportedEventTypes: ["birthday", "anniversary", "other"],
  radius: "0.75rem",
  ornament: "leaf",
  grain: true,
  effects: { background: "silk", title: "split", gallery: "tilted" },
  defaultPaletteId: "sage",
  defaultFontPairId: "cormorant-lora",
}
