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
      name: "Catherine Oloo",
      shortName: "Catherine",
      role: "host",
      photo: photo("christmas-dinner-catherine", 800, 1000, "Catherine Oloo"),
    },
    {
      name: "Michael Oloo",
      shortName: "Michael",
      role: "host",
      photo: photo("christmas-dinner-michael", 800, 1000, "Michael Oloo"),
    },
  ],
  event: {
    type: "other",
    title: "Christmas Dinner",
    subtitle: "Catherine & Michael Oloo invite you to their table",
    subEvents: [
      {
        label: "Christmas dinner",
        start: "2027-12-25T18:00:00+03:00",
        end: "2027-12-25T22:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-12-25T18:00:00+03:00",
    end: "2027-12-25T22:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Oloo Residence",
    address: "Kitisuru Road, Kitisuru, Nairobi, Kenya",
    placeName: "Oloo Residence, Kitisuru",
    lat: -1.23,
    lng: 36.78,
    notes: "Ring at the green gate; parking in the driveway.",
  },
  theme: {
    paletteId: "ruby",
    fontPairId: "cormorant-lora",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "You are invited to",
    coverButtonLabel: "Open invitation",
    headline: "Christmas Dinner",
    message:
      "The candles are lit, the nyama choma is on and there is a seat at our table with your name on it. Come and share Christmas with us.",
    dressCode: "Festive · something red or green",
    rsvpPrompt:
      "Kindly reply by the eighteenth of December so we can set your place.",
    rsvpDeadline: "2027-12-18T23:59:00+03:00",
    closing:
      "Wishing you a warm and joyful Christmas. We cannot wait to raise a glass with you.",
    footerNote: "Catherine & Michael Oloo · Nairobi · Christmas 2027",
  },
  gallery: [
    photo("christmas-dinner1", 1200, 1500, "Candles along the dinner table"),
    photo("christmas-dinner2", 1200, 1500, "The tree by the window"),
    photo("christmas-dinner3", 1200, 1500, "Carving the roast"),
    photo("christmas-dinner4", 1200, 1500, "Crackers and paper crowns"),
    photo("christmas-dinner5", 1200, 1500, "Grandma's fruit cake"),
    photo("christmas-dinner6", 1200, 1500, "Everyone around the table"),
  ],
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
    "hosts",
    "event",
    "countdown",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Christmas Dinner with the Oloos · 25 December 2027",
    description:
      "Catherine & Michael Oloo invite you to a candlelit Christmas dinner in Kitisuru.",
  },
})
