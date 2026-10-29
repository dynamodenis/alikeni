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
      name: "Zara Ahmed",
      shortName: "Zara",
      role: "bride",
      parentsLine: "Daughter of Mr. & Mrs. Ahmed",
      photo: photo("midnight-zara", 800, 1000, "Zara under string lights"),
    },
    {
      name: "Elias Mwangi",
      shortName: "Elias",
      role: "groom",
      parentsLine: "Son of Mr. & Mrs. Mwangi",
      photo: photo("midnight-elias", 800, 1000, "Elias in a midnight tuxedo"),
    },
  ],
  event: {
    type: "wedding",
    title: "The Wedding of Zara & Elias",
    subtitle: "An evening under the stars",
    subEvents: [
      {
        label: "Ceremony at dusk",
        start: "2027-09-18T18:30:00+03:00",
        end: "2027-09-18T19:30:00+03:00",
      },
      {
        label: "Dinner & dancing",
        start: "2027-09-18T20:00:00+03:00",
        end: "2027-09-19T00:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-09-18T18:30:00+03:00",
    end: "2027-09-19T00:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "The Observatory Terrace",
    address: "Observatory Lane, Upper Hill, Nairobi, Kenya",
    placeName: "The Observatory Terrace",
    lat: -1.2995,
    lng: 36.8143,
    notes: "The terrace is open-air; bring a light wrap for after midnight.",
  },
  theme: {
    paletteId: "midnight",
    fontPairId: "bricolage-manrope",
    motionLevel: "full",
    envelope: { liner: "dots", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "Under the stars",
    coverButtonLabel: "Open invitation",
    headline: "Zara & Elias",
    message:
      "When the city lights come on, we will say our vows on the terrace. Join us for an evening of sky, song and dancing until the small hours.",
    dressCode: "Black tie · midnight tones",
    rsvpPrompt: "Tell us you will be there by the twentieth of August.",
    rsvpDeadline: "2027-08-20T23:59:00+03:00",
    closing:
      "Of all the nights in the sky, this is the one we most want to share with you.",
    footerNote: "Zara & Elias · Nairobi · September 2027",
  },
  gallery: [
    photo("midnight1", 1200, 1500, "City lights from the terrace at blue hour"),
    photo("midnight2", 1200, 1500, "Two silhouettes against the evening sky"),
    photo("midnight3", 1200, 1500, "Rings on dark velvet"),
    photo("midnight4", 1200, 1500, "Laughing in a doorway lit by neon"),
    photo("midnight5", 1200, 1500, "Dancing after dark"),
    photo("midnight6", 1200, 1500, "The proposal under the stars"),
  ],
  story: [
    {
      date: "2022",
      title: "A late train",
      body: "The last train home, two strangers, one shared umbrella at the station.",
    },
    {
      date: "2024",
      title: "Northern lights",
      body: "A long-planned trip to Tromsø; the sky put on a show we never forgot.",
    },
    {
      date: "2026",
      title: "Yes, under the stars",
      body: "On the observatory terrace, where we will stand again in September.",
    },
  ],
  gifts: {
    enabled: true,
    accounts: [
      { bank: "Equity Bank", holder: "Zara Ahmed", number: "0450198765432" },
    ],
    ewallets: [
      { provider: "M-Pesa", holder: "Elias Mwangi", number: "0711 000 000" },
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
    title: "Zara & Elias · 18 September 2027",
    description:
      "Join us for an evening wedding under the stars at The Observatory Terrace, Nairobi.",
  },
})
