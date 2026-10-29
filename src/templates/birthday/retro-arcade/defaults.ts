import { schema, type RetroArcadeConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/900`,
  width: 1200,
  height: 900,
  alt,
})

export const defaults: RetroArcadeConfig = schema.parse({
  age: 30,
  hosts: [
    {
      name: "Dev Patel",
      shortName: "Dev",
      role: "celebrant",
      photo: photo("retro-arcade-dev", "Dev at a pinball machine"),
    },
  ],
  event: {
    type: "birthday",
    title: "Dev turns 30",
    subtitle: "Player 1 ready",
    subEvents: [
      {
        label: "Level 1 · Free play & drinks",
        start: "2027-08-28T19:00:00+03:00",
        end: "2027-08-28T20:30:00+03:00",
      },
      {
        label: "Level 2 · Tournament",
        start: "2027-08-28T20:30:00+03:00",
        end: "2027-08-28T22:00:00+03:00",
      },
      {
        label: "Boss fight · Cake",
        start: "2027-08-28T22:00:00+03:00",
        end: "2027-08-28T22:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-08-28T19:00:00+03:00",
    end: "2027-08-29T00:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Pixel Arcade Bar",
    address: "Argwings Kodhek Road, Kilimani, Nairobi, Kenya",
    lat: -1.2921,
    lng: 36.7856,
    notes: "Downstairs from the coffee shop. Tokens are on the house.",
  },
  theme: {
    paletteId: "arcade",
    fontPairId: "bebas-montserrat",
    motionLevel: "full",
    envelope: { liner: "confetti", seal: "sticker", stamp: false },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "Insert coin",
    coverButtonLabel: "Press start",
    headline: "Dev Hits Level 30",
    message:
      "Three decades, no game over. Bring your quarters and your best trash talk: free play, a high-score tournament and cake at the boss fight.",
    dressCode: "Retro sportswear",
    rsvpPrompt:
      "Insert your name below so we can save your seat at the cabinet.",
    rsvpDeadline: "2027-08-21T23:59:00+03:00",
    closing: "Game on.",
    footerNote: "No gifts, just high scores. Rematch next year.",
  },
  gallery: [
    photo("retro-arcade-1", "Dev at the pinball machine"),
    photo("retro-arcade-2", "Last year's pixel-art cake"),
    photo("retro-arcade-3", "The crew on a four-player cabinet"),
    photo("retro-arcade-4", "A wall of glowing arcade screens"),
    photo("retro-arcade-5", "Air hockey showdown"),
    photo("retro-arcade-6", "A fistful of tokens"),
  ],
  story: [],
  gifts: { enabled: false, accounts: [], ewallets: [], registryLinks: [] },
  features: {
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: false,
    gifts: false,
    calendar: true,
    map: true,
    music: true,
  },
  sectionsOrder: [
    "hero",
    "countdown",
    "event",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Dev turns 30 · 28 August 2027",
    description: "An 8-bit 30th birthday at Pixel Arcade Bar, Kilimani.",
  },
})
