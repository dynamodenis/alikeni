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
      name: "Diana Wambui",
      shortName: "Diana",
      role: "bride",
      parentsLine: "Bride-to-be · marrying Eric in June",
      photo: photo("bridal-shower-blush-diana", 800, 1000, "Diana in blush"),
    },
  ],
  event: {
    type: "other",
    title: "Diana's Bridal Shower",
    subtitle: "Hosted by her bridesmaids",
    subEvents: [
      {
        label: "Garden brunch",
        start: "2027-04-03T13:00:00+03:00",
        end: "2027-04-03T14:30:00+03:00",
      },
      {
        label: "Games & advice cards",
        start: "2027-04-03T14:30:00+03:00",
        end: "2027-04-03T16:00:00+03:00",
      },
      {
        label: "Gifts & cake",
        start: "2027-04-03T16:00:00+03:00",
        end: "2027-04-03T17:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-04-03T13:00:00+03:00",
    end: "2027-04-03T17:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Ololo Lodge Garden",
    address: "Ololo Lodge, Nairobi National Park, Nairobi, Kenya",
    placeName: "Ololo Lodge Garden",
    lat: -1.37,
    lng: 36.79,
    notes: "Parking inside the lodge gate; follow the signs to the garden.",
  },
  theme: {
    paletteId: "dusty-rose",
    fontPairId: "cormorant-lora",
    motionLevel: "full",
    envelope: { liner: "floral", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "A shower for the bride-to-be",
    coverButtonLabel: "Open invitation",
    headline: "Diana's Bridal Shower",
    message:
      "Before she says I do, let's shower our Diana with love, laughter and the best advice we have. Brunch, petals and a little bubbly await.",
    dressCode: "Garden chic · shades of blush",
    rsvpPrompt:
      "Please reply by the twentieth of March so we can plan the brunch.",
    rsvpDeadline: "2027-03-20T23:59:00+03:00",
    closing: "Thank you for loving our bride. See you in the garden.",
    footerNote: "Diana's bridesmaids · Nairobi · April 2027",
  },
  gallery: [
    photo("bridal-shower-blush-1", 1200, 1500, "Diana laughing with friends"),
    photo("bridal-shower-blush-2", 1200, 1500, "A table of blush roses"),
    photo("bridal-shower-blush-3", 1200, 1500, "The engagement ring"),
    photo("bridal-shower-blush-4", 1200, 1500, "Bridesmaids in a row"),
    photo("bridal-shower-blush-5", 1200, 1500, "Pastries and tea"),
    photo("bridal-shower-blush-6", 1200, 1500, "A bouquet in soft light"),
  ],
  gifts: {
    enabled: true,
    accounts: [],
    ewallets: [],
    registryLinks: [
      { label: "Bridal registry", url: "https://example.com/registry" },
    ],
  },
  features: {
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: false,
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
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "gifts",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Diana's Bridal Shower · 3 April 2027",
    description: "Join Diana's bridesmaids for a garden bridal shower.",
  },
})
