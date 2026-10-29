import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "corporate/webinar-minimal",
  name: "Webinar Minimal",
  category: "corporate",
  tags: ["webinar", "online", "virtual", "talk", "minimal", "typographic"],
  description:
    "An online event: a typographic hero, one event card with add-to-calendar right after it, a speakers list and a register form, with no gallery or map.",
  thumbnail: "/thumbs/corporate-webinar-minimal.webp",
  isPremium: false,
  supportedEventTypes: ["corporate", "other"],
  radius: "0.5rem",
  ornament: "line",
  grain: false,
  effects: { background: "none", title: "none", gallery: "none" },
  defaultPaletteId: "ocean",
  defaultFontPairId: "geist",
}
