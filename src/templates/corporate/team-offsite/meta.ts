import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "corporate/team-offsite",
  name: "Team Offsite",
  category: "corporate",
  tags: ["offsite", "retreat", "team", "outdoors", "nature", "green"],
  description:
    "Into the hills: rolling wave-line hills and drifting leaves, a trail-badge crest, a two-day itinerary timeline and a split map for getting there.",
  thumbnail: "/thumbs/corporate-team-offsite.webp",
  isPremium: false,
  supportedEventTypes: ["corporate", "other"],
  radius: "1.25rem",
  ornament: "wave",
  grain: false,
  effects: { background: "waves", title: "blur", gallery: "none" },
  defaultPaletteId: "forest",
  defaultFontPairId: "josefin-quicksand",
}
