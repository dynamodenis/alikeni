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
      name: "Aisha Abdalla",
      shortName: "Aisha",
      role: "bride",
      parentsLine: "Daughter of Mr. & Mrs. Abdalla",
      photo: photo("royal-aisha", 800, 1000, "Aisha in an emerald gown"),
    },
    {
      name: "Yusuf Rahman",
      shortName: "Yusuf",
      role: "groom",
      parentsLine: "Son of Mr. & Mrs. Rahman",
      photo: photo("royal-yusuf", 800, 1000, "Yusuf in a gold-trimmed kanzu"),
    },
  ],
  event: {
    type: "wedding",
    title: "The Nikah of Aisha & Yusuf",
    subtitle: "With the blessings of Allah and their families",
    subEvents: [
      {
        label: "Nikah",
        start: "2027-12-04T10:00:00+03:00",
        end: "2027-12-04T11:30:00+03:00",
      },
      {
        label: "Walima",
        start: "2027-12-04T19:00:00+03:00",
        end: "2027-12-04T23:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-12-04T10:00:00+03:00",
    end: "2027-12-04T23:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Nyali Grand Ballroom",
    address: "Links Road, Nyali, Mombasa, Kenya",
    placeName: "Nyali Grand Ballroom",
    lat: -4.0435,
    lng: 39.7035,
    notes:
      "Separate seating for ladies and gentlemen at the Nikah. Valet parking at the main entrance.",
  },
  theme: {
    paletteId: "royal-emerald",
    fontPairId: "cinzel-garamond",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "The Nikah of",
    coverButtonLabel: "Open invitation",
    headline: "Aisha & Yusuf",
    message:
      "By the grace of Allah, we invite you to witness our Nikah and to share in the Walima that follows.",
    dressCode: "Formal · modest elegance in emerald, ivory or gold",
    rsvpPrompt:
      "Kindly confirm your attendance by the tenth of November so we may prepare for you.",
    rsvpDeadline: "2027-11-10T23:59:00+03:00",
    closing:
      "Barakallahu lakuma wa baraka alaikuma. Your presence and your du'as are the greatest gift to us.",
    footerNote: "Aisha & Yusuf · Mombasa · December 2027",
  },
  gallery: [
    photo("royal1", 1200, 1500, "Henna on Aisha's hands"),
    photo("royal2", 1200, 1500, "Gold lanterns along the ballroom hall"),
    photo("royal3", 1200, 1500, "Walking through the old town"),
    photo("royal4", 1200, 1500, "An emerald and gold table setting"),
    photo("royal5", 1200, 1500, "Laughing on the Nyali seafront"),
    photo("royal6", 1200, 1500, "The engagement at Fort Jesus"),
  ],
  story: [
    {
      date: "2022",
      title: "Introduced by family",
      body: "An aunt's dinner in Nyali, a long table and a conversation that outlasted dessert.",
    },
    {
      date: "2025",
      title: "Two families meet",
      body: "Tea at the Abdalla home, dates and halwa, and the blessing of both sets of parents.",
    },
    {
      date: "2026",
      title: "The engagement",
      body: "Beneath the walls of Fort Jesus at dusk, with the call to Maghrib carrying over the sea.",
    },
  ],
  gifts: {
    enabled: true,
    accounts: [
      {
        bank: "Gulf African Bank",
        holder: "Yusuf Rahman",
        number: "0510012345678",
      },
    ],
    ewallets: [
      { provider: "M-Pesa", holder: "Aisha Abdalla", number: "0733 000 000" },
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
    title: "Aisha & Yusuf · Nikah · 4 December 2027",
    description:
      "Join us for the Nikah and Walima of Aisha and Yusuf at Nyali Grand Ballroom, Mombasa.",
  },
})
