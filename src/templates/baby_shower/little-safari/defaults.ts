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
      name: "Achieng Omondi",
      shortName: "Achieng",
      role: "host",
      parentsLine: "Chief explorer and mum-to-be",
      photo: photo(
        "little-safari-achieng",
        800,
        1000,
        "Achieng in a khaki dress under a tree"
      ),
    },
    {
      name: "Brian Omondi",
      shortName: "Brian",
      role: "host",
      parentsLine: "Trail guide and dad-to-be",
      photo: photo("little-safari-brian", 800, 1000, "Brian in a safari hat"),
    },
    {
      name: "Baby Zuri",
      shortName: "Zuri",
      role: "baby",
      parentsLine: "Our little cub, due this summer",
    },
  ],
  event: {
    type: "baby_shower",
    title: "Baby Zuri's Safari Shower",
    subtitle: "A wild welcome for our little cub",
    subEvents: [
      {
        label: "Arrivals & giraffe feeding",
        start: "2027-05-15T11:00:00+03:00",
        end: "2027-05-15T12:00:00+03:00",
      },
      {
        label: "Picnic lunch on the lawn",
        start: "2027-05-15T12:00:00+03:00",
        end: "2027-05-15T13:30:00+03:00",
      },
      {
        label: "Games & gift opening",
        start: "2027-05-15T13:30:00+03:00",
        end: "2027-05-15T15:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-05-15T11:00:00+03:00",
    end: "2027-05-15T15:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Giraffe Centre Lawn",
    address: "Duma Road, Lang'ata, Nairobi, Kenya",
    placeName: "Giraffe Centre",
    lat: -1.3753,
    lng: 36.7455,
    notes: "Park at the main gate and follow the bunting to the lawn.",
  },
  theme: {
    paletteId: "safari",
    fontPairId: "baloo-nunito",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "You're invited on a safari for",
    coverButtonLabel: "Start the adventure",
    headline: "Baby Zuri",
    message:
      "Pack your binoculars! Join Achieng & Brian for a wild morning of giraffes, games and good food as we get ready to welcome our little cub.",
    dressCode: "Khaki, leafy greens and comfy shoes",
    rsvpPrompt: "Let us know by the first of May so we pack enough snacks.",
    rsvpDeadline: "2027-05-01T23:59:00+03:00",
    closing:
      "Thank you for joining the expedition. Our little cub is lucky to have such a pride.",
    footerNote: "Achieng & Brian · Nairobi · May 2027",
  },
  gallery: [
    photo("little-safari-1", 1200, 1500, "The first scan"),
    photo("little-safari-2", 1200, 900, "A giraffe peeking over the fence"),
    photo("little-safari-3", 1200, 1500, "Bump in the sunshine"),
    photo("little-safari-4", 1200, 900, "A plush lion for the nursery"),
    photo(
      "little-safari-5",
      1200,
      1500,
      "Painting acacias on the nursery wall"
    ),
    photo("little-safari-6", 1200, 900, "Sunset on the savannah"),
  ],
  story: [],
  gifts: {
    enabled: true,
    accounts: [],
    ewallets: [
      { provider: "M-Pesa", holder: "Achieng Omondi", number: "0711 000 000" },
    ],
    registryLinks: [
      { label: "Nursery registry", url: "https://example.com/registry/zuri" },
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
    title: "Baby Zuri's Safari Shower · 15 May 2027",
    description:
      "Achieng & Brian invite you on a safari baby shower in Nairobi.",
  },
})
