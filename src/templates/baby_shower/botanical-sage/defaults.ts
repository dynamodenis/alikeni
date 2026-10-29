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
      name: "Mercy Wekesa",
      shortName: "Mercy",
      role: "host",
      parentsLine: "Mum-to-be",
      photo: photo("botanical-sage-mercy", 800, 1000, "Mercy among ferns"),
    },
    {
      name: "Daniel Wekesa",
      shortName: "Daniel",
      role: "host",
      parentsLine: "Dad-to-be",
      photo: photo("botanical-sage-daniel", 800, 1000, "Daniel in the garden"),
    },
  ],
  event: {
    type: "baby_shower",
    title: "A baby shower for Baby Imani",
    subtitle: "Something new is growing",
    subEvents: [
      {
        label: "Garden welcome",
        start: "2027-09-04T13:00:00+03:00",
        end: "2027-09-04T14:00:00+03:00",
      },
      {
        label: "Lunch in the glasshouse",
        start: "2027-09-04T14:00:00+03:00",
        end: "2027-09-04T15:30:00+03:00",
      },
      {
        label: "Seedling planting",
        start: "2027-09-04T15:30:00+03:00",
        end: "2027-09-04T16:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-09-04T13:00:00+03:00",
    end: "2027-09-04T16:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Nairobi Arboretum Glasshouse",
    address: "Arboretum Drive, Nairobi, Kenya",
    placeName: "Nairobi Arboretum",
    lat: -1.2778,
    lng: 36.8,
    notes: "Enter by the main gate; the glasshouse is past the picnic lawn.",
  },
  theme: {
    paletteId: "sage",
    fontPairId: "fraunces-dm-sans",
    motionLevel: "full",
    envelope: { liner: "floral", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "A baby shower for",
    coverButtonLabel: "Open invitation",
    headline: "Baby Imani",
    message:
      "Our family is growing. Join us among the leaves and blooms to celebrate the little sprout on the way.",
    dressCode: "Garden casual · greens & neutrals",
    rsvpPrompt:
      "Kindly let us know if you can join us by the twentieth of August.",
    rsvpDeadline: "2027-08-20T23:59:00+03:00",
    closing:
      "Thank you for helping our little one grow in love. We cannot wait to see you in the garden.",
    footerNote: "Mercy & Daniel · Nairobi · September 2027",
  },
  gallery: [
    photo(
      "botanical-sage-1",
      1200,
      1500,
      "Mercy's bump framed by monstera leaves"
    ),
    photo("botanical-sage-2", 1200, 1500, "A tiny pot with a seedling"),
    photo("botanical-sage-3", 1200, 1500, "The green nursery corner"),
    photo("botanical-sage-4", 1200, 1500, "Daniel reading to the bump"),
    photo("botanical-sage-5", 1200, 1500, "Sunlight through the glasshouse"),
    photo("botanical-sage-6", 1200, 1500, "Folded baby clothes in sage"),
  ],
  story: [],
  gifts: {
    enabled: true,
    accounts: [],
    ewallets: [
      { provider: "M-Pesa", holder: "Mercy Wekesa", number: "0700 000 000" },
    ],
    registryLinks: [
      { label: "Baby Imani's registry", url: "https://example.com/registry" },
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
    title: "Baby Imani's shower · 4 September 2027",
    description:
      "Join Mercy & Daniel in the glasshouse to celebrate Baby Imani in Nairobi.",
  },
})
