import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "corporate/conference-grid",
  name: "Conference Grid",
  category: "corporate",
  tags: ["conference", "summit", "speakers", "schedule", "grid", "minimal"],
  description:
    "Graph paper: hairline grid lines behind an editorial headline, a schedule timeline in a tint band and speakers in square portraits, all with square corners.",
  thumbnail: "/thumbs/corporate-conference-grid.webp",
  isPremium: false,
  supportedEventTypes: ["corporate", "other"],
  radius: "0rem",
  ornament: "line",
  grain: false,
  effects: { background: "none", title: "none", gallery: "none" },
  defaultPaletteId: "slate-minimal",
  defaultFontPairId: "bricolage-manrope",
}
