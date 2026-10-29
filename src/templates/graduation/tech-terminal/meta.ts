import type { TemplateMeta } from "../../types"

export const meta: TemplateMeta = {
  id: "graduation/tech-terminal",
  name: "Tech Terminal",
  category: "graduation",
  tags: [
    "terminal",
    "code",
    "tech",
    "monospace",
    "dark",
    "computer science",
    "developer",
  ],
  description:
    "A terminal window: monospace headline, a bash card with `$ graduate` commands and a blinking cursor, matrix-dust particles over phosphor green on black, sections named like files.",
  thumbnail: "/thumbs/graduation-tech-terminal.webp",
  isPremium: false,
  supportedEventTypes: ["graduation", "corporate", "other"],
  defaultPaletteId: "terminal",
  defaultFontPairId: "space-grotesk-inter",
  radius: "0.25rem",
  ornament: "dots",
  grain: false,
  effects: { background: "particles", title: "none", gallery: "none" },
}
