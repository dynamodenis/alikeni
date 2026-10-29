import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "birthday/sweet-seventeen",
  name: "Sweet Seventeen",
  category: "birthday",
  tags: ["sweet seventeen", "17th", "rose", "petals", "soft", "teen", "glow"],
  description:
    "A soft glow-up in dusty rose: petals drift over a split cover with the celebrant's portrait, an iridescent hero wears a turning-17 pill, the countdown is a ring and photos swipe in a carousel on pillowy cards.",
  thumbnail: "/thumbs/birthday-sweet-seventeen.webp",
  isPremium: false,
  supportedEventTypes: ["birthday", "other"],
  radius: "1rem",
  ornament: "wave",
  grain: false,
  effects: { background: "iridescence", title: "blur", gallery: "carousel" },
  defaultPaletteId: "dusty-rose",
  defaultFontPairId: "josefin-quicksand",
}
