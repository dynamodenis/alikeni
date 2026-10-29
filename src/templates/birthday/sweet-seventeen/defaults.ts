import { schema, type SweetSeventeenConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/900`,
  width: 1200,
  height: 900,
  alt,
})

export const defaults: SweetSeventeenConfig = schema.parse({
  age: 17,
  hosts: [
    {
      name: "Natasha Putri",
      shortName: "Natasha",
      role: "celebrant",
      parentsLine: "With love from Ibu & Ayah",
      photo: photo("sweet-seventeen-natasha", "Natasha at golden hour"),
    },
  ],
  event: {
    type: "birthday",
    title: "Natasha's Sweet Seventeen",
    subtitle: "A rooftop evening in blush & white",
    subEvents: [
      {
        label: "Golden hour photos",
        start: "2027-05-29T18:00:00+07:00",
        end: "2027-05-29T19:00:00+07:00",
      },
      {
        label: "Dinner",
        start: "2027-05-29T19:00:00+07:00",
        end: "2027-05-29T20:30:00+07:00",
      },
      {
        label: "Cake & dancing",
        start: "2027-05-29T20:30:00+07:00",
        end: "2027-05-29T22:00:00+07:00",
      },
    ],
  },
  datetime: {
    start: "2027-05-29T18:00:00+07:00",
    end: "2027-05-29T22:00:00+07:00",
    timezone: "Asia/Jakarta",
  },
  venue: {
    name: "Skye Rooftop",
    address: "Menara BCA, Jl. M.H. Thamrin No.1, Jakarta Pusat, Indonesia",
    lat: -6.1944,
    lng: 106.8229,
    notes:
      "Take the lobby lift to level 56 and mention Natasha's party at the desk.",
  },
  theme: {
    paletteId: "dusty-rose",
    fontPairId: "josefin-quicksand",
    motionLevel: "full",
    envelope: { liner: "floral", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "You're invited to",
    coverButtonLabel: "Open invitation",
    headline: "Natasha's Sweet Seventeen",
    message:
      "Seventeen candles, a rooftop above the city and all my favourite people. Come watch the sun go down with me.",
    dressCode: "Blush & white",
    rsvpPrompt: "Tell me you're coming so there's a seat with your name on it.",
    rsvpDeadline: "2027-05-20T23:59:00+07:00",
    closing: "Seventeen only happens once. Come glow with me.",
    footerNote: "Soft music, city lights and far too many photos.",
  },
  gallery: [
    photo("sweet-seventeen-1", "Natasha laughing with friends"),
    photo("sweet-seventeen-2", "Blush balloons on the rooftop"),
    photo("sweet-seventeen-3", "Last year's cake"),
    photo("sweet-seventeen-4", "Natasha and her best friend"),
    photo("sweet-seventeen-5", "Sunset over Jakarta"),
    photo("sweet-seventeen-6", "Natasha in a white dress"),
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
    title: "Natasha turns 17 · 29 May 2027",
    description: "A blush-and-white sweet seventeen on a Jakarta rooftop.",
  },
})
