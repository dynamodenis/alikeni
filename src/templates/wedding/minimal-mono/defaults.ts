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
      name: "Noor Haddad",
      shortName: "Noor",
      role: "bride",
      parentsLine: "daughter of Layla & Samir Haddad",
      photo: photo("mono-noor", 800, 800, "Noor, black and white portrait"),
    },
    {
      name: "Jonas Weber",
      shortName: "Jonas",
      role: "groom",
      parentsLine: "son of Anke & Thomas Weber",
      photo: photo("mono-jonas", 800, 800, "Jonas, black and white portrait"),
    },
  ],
  event: {
    type: "wedding",
    title: "Noor & Jonas",
    subtitle: "are getting married",
    subEvents: [
      {
        label: "ceremony",
        start: "2027-05-22T14:00:00+02:00",
        end: "2027-05-22T14:45:00+02:00",
      },
      {
        label: "dinner & dancing",
        start: "2027-05-22T18:00:00+02:00",
        end: "2027-05-22T23:30:00+02:00",
      },
    ],
  },
  datetime: {
    start: "2027-05-22T14:00:00+02:00",
    end: "2027-05-22T23:30:00+02:00",
    timezone: "Europe/Berlin",
  },
  venue: {
    name: "Studio Halle",
    address: "Mariannenstraße 9, 10999 Berlin, Germany",
    placeName: "Studio Halle, Kreuzberg",
    lat: 52.4987,
    lng: 13.418,
    notes: "U1 Kottbusser Tor, five minutes on foot. No parking on site.",
  },
  theme: {
    paletteId: "monochrome",
    fontPairId: "geist",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "sticker", stamp: false },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "You are invited",
    coverButtonLabel: "open",
    headline: "Noor & Jonas",
    message: "a small wedding in a big room. come as you are, stay late.",
    dressCode: "Black, white or both",
    rsvpPrompt: "let us know by the first of may.",
    rsvpDeadline: "2027-05-01T23:59:00+02:00",
    closing: "thank you for being part of this.",
    footerNote: "noor & jonas · berlin · may 2027",
  },
  gallery: [
    photo("mono1", 1200, 1500, "Shadows across a concrete wall"),
    photo("mono2", 1200, 1500, "Two coffees on a studio table"),
    photo("mono3", 1200, 1500, "Walking along the Landwehrkanal"),
    photo("mono4", 1200, 1500, "Hands, rings, a white tablecloth"),
    photo("mono5", 1200, 1500, "A bicycle leaning on the studio door"),
    photo("mono6", 1200, 1500, "Laughing in the stairwell"),
  ],
  story: [
    {
      date: "2021",
      title: "a shared desk",
      body: "the same studio, opposite corners, one kettle.",
    },
    {
      date: "2024",
      title: "a flat with one window",
      body: "kreuzberg, fourth floor, no lift. we carried the books up together.",
    },
    {
      date: "2026",
      title: "a question on the canal",
      body: "no ring yet, just the question. the ring came a week later.",
    },
  ],
  gifts: {
    enabled: true,
    accounts: [
      {
        bank: "N26",
        holder: "Noor Haddad",
        number: "DE89 3704 0044 0532 0130 00",
      },
    ],
    ewallets: [
      {
        provider: "PayPal",
        holder: "Jonas Weber",
        number: "jonas@example.com",
      },
    ],
    registryLinks: [],
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
    title: "Noor & Jonas · 22 May 2027",
    description: "Noor and Jonas are getting married at Studio Halle, Berlin.",
  },
})
