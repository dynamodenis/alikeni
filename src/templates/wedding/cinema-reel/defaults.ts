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
      name: "Grace Wairimu",
      shortName: "Grace",
      role: "bride",
      parentsLine: "Daughter of Mr. & Mrs. Wairimu",
      photo: photo(
        "cinemareel-grace",
        800,
        1000,
        "Grace in a black gown under a spotlight"
      ),
    },
    {
      name: "Theo Kimani",
      shortName: "Theo",
      role: "groom",
      parentsLine: "Son of Mr. & Mrs. Kimani",
      photo: photo(
        "cinemareel-theo",
        800,
        1000,
        "Theo in a tuxedo, half in shadow"
      ),
    },
  ],
  event: {
    type: "wedding",
    title: "Grace & Theo: The Wedding",
    subtitle: "A feature presentation in two acts",
    subEvents: [
      {
        label: "Act I · The vows",
        start: "2027-11-20T18:00:00+03:00",
        end: "2027-11-20T19:00:00+03:00",
      },
      {
        label: "Act II · The after-party",
        start: "2027-11-20T20:00:00+03:00",
        end: "2027-11-21T00:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-11-20T18:00:00+03:00",
    end: "2027-11-21T00:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Alliance Française Auditorium",
    address: "Loita Street, Nairobi CBD, Kenya",
    placeName: "Alliance Française Auditorium",
    lat: -1.2864,
    lng: 36.8172,
    notes: "Doors open at 17:30. Seating is unreserved; the red carpet is not.",
  },
  theme: {
    paletteId: "noir",
    fontPairId: "bebas-montserrat",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "Now showing",
    coverButtonLabel: "Take your seat",
    headline: "Grace & Theo",
    message:
      "After years in development, a love story finally reaches the big screen. You are invited to the premiere.",
    dressCode: "Red carpet",
    rsvpPrompt:
      "Seats are limited. Reserve yours by the first of November and tell us how many are in your party.",
    rsvpDeadline: "2027-11-01T23:59:00+03:00",
    closing:
      "Thank you for being part of our story. The sequel starts the morning after.",
    footerNote: "Grace & Theo · Nairobi · November 2027",
  },
  gallery: [
    photo("cinemareel1", 1200, 800, "The two of them under a marquee at night"),
    photo("cinemareel2", 1200, 800, "A kiss in the projector light"),
    photo("cinemareel3", 1200, 800, "Walking down a rain-slicked street"),
    photo("cinemareel4", 1200, 1500, "Grace adjusting Theo's bow tie"),
    photo("cinemareel5", 1200, 1500, "Popcorn and two tickets"),
    photo("cinemareel6", 1200, 1500, "Sharing one pair of headphones"),
  ],
  story: [
    {
      date: "2019",
      title: "Opening scene",
      body: "A late screening, two seats double-booked and neither of us willing to move.",
    },
    {
      date: "2022",
      title: "The plot twist",
      body: "She moved to Mombasa for a year. He bought a very reliable car.",
    },
    {
      date: "2026",
      title: "The proposal",
      body: "He rented the whole auditorium and played a film of every place we had ever been.",
    },
  ],
  gifts: {
    enabled: true,
    accounts: [
      {
        bank: "Stanbic Bank",
        holder: "Grace Wairimu",
        number: "0100123456789",
      },
    ],
    ewallets: [
      { provider: "M-Pesa", holder: "Theo Kimani", number: "0722 000 000" },
    ],
    registryLinks: [
      { label: "Our registry", url: "https://example.com/registry" },
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
    title: "Grace & Theo · 20 November 2027",
    description: "You are invited to the premiere of our wedding in Nairobi.",
  },
})
