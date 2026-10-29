import type { z } from "zod"
import { schema } from "./schema"

const photo = (seed: string, w: number, h: number, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  width: w,
  height: h,
  alt,
})

export const defaults: z.infer<typeof schema> = schema.parse({
  hosts: [
    {
      name: "Sade Achieng",
      shortName: "Sade",
      role: "bride",
      parentsLine: "Daughter of Mr. & Mrs. Achieng",
      photo: photo(
        "boho-sade",
        800,
        1000,
        "Sade in a linen dress by the creek"
      ),
    },
    {
      name: "Tariq Hassan",
      shortName: "Tariq",
      role: "groom",
      parentsLine: "Son of Mr. & Mrs. Hassan",
      photo: photo("boho-tariq", 800, 1000, "Tariq on the boathouse deck"),
    },
  ],
  event: {
    type: "wedding",
    title: "The Wedding of Sade & Tariq",
    subtitle: "Under the sun, by the water",
    subEvents: [
      {
        label: "Vows on the deck",
        start: "2027-10-02T16:00:00+03:00",
        end: "2027-10-02T17:00:00+03:00",
      },
      {
        label: "Sunset dinner",
        start: "2027-10-02T18:30:00+03:00",
        end: "2027-10-02T23:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-10-02T16:00:00+03:00",
    end: "2027-10-02T23:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Kilifi Creek Boathouse",
    address: "Bofa Road, Kilifi, Kenya",
    placeName: "Kilifi Creek Boathouse",
    lat: -3.6305,
    lng: 39.8499,
    notes: "The deck is sand and timber. Flat shoes are your friend.",
  },
  theme: {
    paletteId: "terracotta",
    fontPairId: "dancing-lora",
    motionLevel: "full",
    envelope: { liner: "floral", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "Come celebrate with us",
    coverButtonLabel: "Open invitation",
    headline: "Sade & Tariq",
    message:
      "Warm sand, a slow sunset and the people we love most. We are getting married by the creek and we want you with us.",
    dressCode: "Earth tones · linen",
    rsvpPrompt:
      "Tell us you are coming by the fifth of September so we can save you a cushion at the table.",
    rsvpDeadline: "2027-09-05T23:59:00+03:00",
    closing:
      "Leave your shoes at the door and stay until the stars come out. See you by the water.",
    footerNote: "Sade & Tariq · Kilifi · October 2027",
  },
  gallery: [
    photo("boho1", 1200, 1500, "Walking barefoot along the creek"),
    photo("boho2", 1200, 1500, "Pampas grass against a clay wall"),
    photo("boho3", 1200, 1500, "Laughing in the dunes"),
    photo("boho4", 1200, 1500, "Rings on a woven blanket"),
    photo("boho5", 1200, 1500, "The boathouse at golden hour"),
    photo("boho6", 1200, 1500, "Dancing under string lights"),
  ],
  story: [
    {
      date: "2021",
      title: "A shared umbrella in Lamu",
      body: "A sudden storm, one tiny café awning and two strangers who talked until the rain stopped.",
    },
    {
      date: "2024",
      title: "The road trip",
      body: "Nairobi to the coast in a borrowed van, a broken speaker and the best week of our lives.",
    },
    {
      date: "2026",
      title: "Yes, at sunset",
      body: "On the boathouse deck, with the tide coming in. The exact spot where we will say our vows.",
    },
  ],
  gifts: {
    enabled: true,
    accounts: [
      { bank: "Equity Bank", holder: "Sade Achieng", number: "0400123456789" },
    ],
    ewallets: [
      { provider: "M-Pesa", holder: "Tariq Hassan", number: "0722 000 000" },
    ],
    registryLinks: [
      { label: "Our honeymoon fund", url: "https://example.com/registry" },
    ],
  },
  features: {
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: true,
    gifts: true,
    calendar: true,
    map: true,
    music: true,
  },
  sectionsOrder: [
    "hero",
    "hosts",
    "countdown",
    "event",
    "story",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "gifts",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Sade & Tariq · 2 October 2027",
    description:
      "Join us for a boho wedding by the water at Kilifi Creek Boathouse.",
  },
})
