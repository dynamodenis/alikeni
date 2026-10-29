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
      name: "Lydia Njoroge",
      shortName: "Lydia",
      role: "host",
      parentsLine: "Mum-to-be",
      photo: photo(
        "teddy-picnic-lydia",
        800,
        1000,
        "Lydia on a picnic blanket"
      ),
    },
    {
      name: "Mark Njoroge",
      shortName: "Mark",
      role: "host",
      parentsLine: "Dad-to-be",
      photo: photo("teddy-picnic-mark", 800, 1000, "Mark holding a teddy bear"),
    },
  ],
  event: {
    type: "baby_shower",
    title: "A teddy bears' picnic for Baby Leo",
    subtitle: "Bring a blanket and a bear",
    subEvents: [
      {
        label: "Blankets down",
        start: "2027-10-16T11:30:00+03:00",
        end: "2027-10-16T12:30:00+03:00",
      },
      {
        label: "Picnic lunch",
        start: "2027-10-16T12:30:00+03:00",
        end: "2027-10-16T14:00:00+03:00",
      },
      {
        label: "Games & cake",
        start: "2027-10-16T14:00:00+03:00",
        end: "2027-10-16T15:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-10-16T11:30:00+03:00",
    end: "2027-10-16T15:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Karura Forest Amani Garden",
    address: "Limuru Road, Karura Forest, Nairobi, Kenya",
    placeName: "Karura Forest",
    lat: -1.242,
    lng: 36.83,
    notes: "Use Gate A; the Amani Garden is a short walk from the car park.",
  },
  theme: {
    paletteId: "peach-sorbet",
    fontPairId: "dancing-lora",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "You're invited to a picnic for",
    coverButtonLabel: "Open invitation",
    headline: "Baby Leo",
    message:
      "If you go down to the woods today, you're sure of a big surprise: a picnic for our little bear on the way!",
    dressCode: "Picnic casual · bring your favourite teddy",
    rsvpPrompt:
      "Kindly let us know if you can join us by the first of October.",
    rsvpDeadline: "2027-10-01T23:59:00+03:00",
    closing:
      "Thank you for sharing a blanket with us. Our little bear is lucky to have you.",
    footerNote: "Lydia & Mark · Nairobi · October 2027",
  },
  gallery: [
    photo("teddy-picnic-1", 1200, 1500, "A wicker basket on a checked blanket"),
    photo(
      "teddy-picnic-2",
      1200,
      1500,
      "A row of teddy bears waiting for guests"
    ),
    photo("teddy-picnic-3", 1200, 1500, "Lydia's bump under the trees"),
    photo("teddy-picnic-4", 1200, 1500, "Tiny dungarees on a washing line"),
    photo("teddy-picnic-5", 1200, 1500, "Mark building the cot"),
    photo("teddy-picnic-6", 1200, 1500, "Honey cakes for the picnic"),
  ],
  story: [],
  gifts: {
    enabled: true,
    accounts: [],
    ewallets: [
      { provider: "M-Pesa", holder: "Lydia Njoroge", number: "0700 000 000" },
    ],
    registryLinks: [
      { label: "Baby Leo's registry", url: "https://example.com/registry" },
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
    title: "Baby Leo's picnic shower · 16 October 2027",
    description:
      "Join Lydia & Mark for a teddy bears' picnic for Baby Leo in Karura Forest.",
  },
})
