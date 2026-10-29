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
      name: "Naomi Kariuki",
      shortName: "Naomi",
      role: "host",
      parentsLine: "Mum-to-be",
      photo: photo("twinkle-star-naomi", 800, 1000, "Naomi smiling at dusk"),
    },
    {
      name: "Samuel Kariuki",
      shortName: "Samuel",
      role: "host",
      parentsLine: "Dad-to-be",
      photo: photo(
        "twinkle-star-samuel",
        800,
        1000,
        "Samuel under string lights"
      ),
    },
  ],
  event: {
    type: "baby_shower",
    title: "A baby shower for Baby Nuru",
    subtitle: "Twinkle, twinkle, little star",
    subEvents: [
      {
        label: "Starlight welcome",
        start: "2027-08-21T18:00:00+03:00",
        end: "2027-08-21T19:00:00+03:00",
      },
      {
        label: "Dinner & wishes",
        start: "2027-08-21T19:00:00+03:00",
        end: "2027-08-21T21:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-08-21T18:00:00+03:00",
    end: "2027-08-21T21:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Villa Rosa Kempinski Terrace",
    address: "Chiromo Road, Westlands, Nairobi, Kenya",
    placeName: "Villa Rosa Kempinski",
    lat: -1.273,
    lng: 36.809,
    notes: "The terrace is on the first floor; ask at reception.",
  },
  theme: {
    paletteId: "navy-gold",
    fontPairId: "cormorant-lora",
    motionLevel: "full",
    envelope: { liner: "dots", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "A little star is on the way",
    coverButtonLabel: "Open invitation",
    headline: "Baby Nuru",
    message:
      "Our little light is almost here. Join us under the evening sky to shower Baby Nuru with love before the big arrival.",
    dressCode: "Midnight blues & a touch of gold",
    rsvpPrompt: "Kindly let us know if you can join us by the first of August.",
    rsvpDeadline: "2027-08-01T23:59:00+03:00",
    closing:
      "Thank you for wishing upon a star with us. We cannot wait to share the night with you.",
    footerNote: "Naomi & Samuel · Nairobi · August 2027",
  },
  gallery: [
    photo("twinkle-star-1", 1200, 1500, "Bump silhouette against the sunset"),
    photo("twinkle-star-2", 1200, 1500, "Tiny knitted booties"),
    photo(
      "twinkle-star-3",
      1200,
      1500,
      "The nursery mobile of moons and stars"
    ),
    photo("twinkle-star-4", 1200, 1500, "Naomi and Samuel holding the scan"),
    photo("twinkle-star-5", 1200, 1500, "Fairy lights over the crib"),
    photo("twinkle-star-6", 1200, 1500, "A stack of bedtime story books"),
  ],
  story: [],
  gifts: {
    enabled: true,
    accounts: [],
    ewallets: [
      { provider: "M-Pesa", holder: "Naomi Kariuki", number: "0700 000 000" },
    ],
    registryLinks: [
      { label: "Baby Nuru's registry", url: "https://example.com/registry" },
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
    title: "Baby Nuru's shower · 21 August 2027",
    description:
      "Join Naomi & Samuel under the stars to celebrate Baby Nuru in Nairobi.",
  },
})
