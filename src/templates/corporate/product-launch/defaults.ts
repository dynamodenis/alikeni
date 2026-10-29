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
      name: "Nova Labs",
      shortName: "Nova Labs",
      role: "company",
      parentsLine: "Hardware and software, built in Nairobi",
      photo: photo("product-launch-logo", 800, 800, "The Nova Labs logo mark"),
    },
  ],
  event: {
    type: "corporate",
    title: "Nova One Launch",
    subtitle: "Nova Labs presents",
    subEvents: [
      {
        label: "Doors & coffee",
        start: "2027-04-22T09:30:00+03:00",
        end: "2027-04-22T10:00:00+03:00",
      },
      {
        label: "Keynote & reveal",
        start: "2027-04-22T10:00:00+03:00",
        end: "2027-04-22T11:00:00+03:00",
      },
      {
        label: "Hands-on demos",
        start: "2027-04-22T11:00:00+03:00",
        end: "2027-04-22T12:30:00+03:00",
      },
      {
        label: "Lunch & networking",
        start: "2027-04-22T12:30:00+03:00",
        end: "2027-04-22T14:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-04-22T10:00:00+03:00",
    end: "2027-04-22T14:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Nairobi Garage Auditorium",
    address: "Westlands, Nairobi, Kenya",
    placeName: "Nairobi Garage Auditorium",
    lat: -1.263,
    lng: 36.803,
    notes: "Check in at the ground-floor desk with your name or RSVP email.",
  },
  theme: {
    paletteId: "corporate-blue",
    fontPairId: "space-grotesk-inter",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "sticker", stamp: false },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "You're invited to the launch of",
    coverButtonLabel: "Get your pass",
    headline: "Nova One",
    message:
      "Two years in the making. Be in the room when we lift the lid on Nova One, then get your hands on it first.",
    dressCode: "Smart casual",
    rsvpPrompt: "Seats are limited. Reserve yours by the fifteenth of April.",
    rsvpDeadline: "2027-04-15T23:59:00+03:00",
    closing:
      "See you at the reveal. Bring your questions; we will bring the demo units.",
    footerNote: "Nova Labs · Nairobi · April 2027",
  },
  gallery: [
    photo(
      "product-launch1",
      1200,
      1200,
      "A device silhouette under studio light"
    ),
    photo("product-launch2", 1200, 1200, "Engineers at a prototyping bench"),
    photo("product-launch3", 1200, 1200, "Close-up of a circuit board"),
    photo("product-launch4", 1200, 1200, "Early sketches pinned to a wall"),
    photo("product-launch5", 1200, 1200, "Packaging samples on a table"),
    photo("product-launch6", 1200, 1200, "The team testing in the field"),
  ],
  story: [],
  gifts: { enabled: false, accounts: [], ewallets: [], registryLinks: [] },
  features: {
    countdown: true,
    rsvp: true,
    wishes: false,
    gallery: true,
    story: false,
    gifts: false,
    calendar: true,
    map: true,
    music: true,
  },
  sectionsOrder: [
    "hero",
    "countdown",
    "event",
    "hosts",
    "gallery",
    "map",
    "rsvp",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Nova One Launch · 22 April 2027",
    description: "Join Nova Labs in Nairobi for the launch of Nova One.",
  },
})
