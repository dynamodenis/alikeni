import { schema, type ThenAndNowConfig } from "./schema"

const photo = (seed: string, w: number, h: number, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  width: w,
  height: h,
  alt,
})

export const defaults: ThenAndNowConfig = schema.parse({
  years: 15,
  hosts: [
    {
      name: "Lucy Baraza",
      shortName: "Lucy",
      role: "host",
      photo: photo("then-and-now-lucy", 800, 800, "Lucy and Tom in 2012"),
    },
    {
      name: "Tom Baraza",
      shortName: "Tom",
      role: "host",
      photo: photo("then-and-now-tom", 800, 800, "Lucy and Tom today"),
    },
  ],
  event: {
    type: "anniversary",
    title: "Lucy & Tom · 15 Years",
    subtitle: "Same two people, fifteen years apart",
    subEvents: [],
  },
  datetime: {
    start: "2027-07-31T18:00:00+03:00",
    end: "2027-07-31T23:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Loft 15",
    address: "Woodvale Grove, Westlands, Nairobi, Kenya",
    placeName: "Loft 15",
    lat: -1.265,
    lng: 36.805,
    notes: "Top floor; take the lift from the lobby on Woodvale Grove.",
  },
  theme: {
    paletteId: "slate-minimal",
    fontPairId: "geist",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "Then and now",
    coverButtonLabel: "Open",
    headline: "Lucy & Tom",
    message:
      "Fifteen years, two photos and a lot in between. Join us for drinks, a long table and a few old stories.",
    dressCode: "Smart casual",
    rsvpPrompt: "Reply by the fifteenth of July.",
    rsvpDeadline: "2027-07-15T23:59:00+03:00",
    closing: "Thank you for being in both pictures.",
    footerNote: "Lucy & Tom · 2012 – 2027",
  },
  gallery: [
    photo("then-and-now1", 1200, 1200, "The registry office, 2012"),
    photo("then-and-now2", 1200, 1200, "Our first flat in Kileleshwa"),
    photo("then-and-now3", 1200, 1200, "Road trip to Lake Turkana"),
    photo("then-and-now4", 1200, 1200, "The kids on the beach in Watamu"),
    photo("then-and-now5", 1200, 1200, "Tenth anniversary in Lisbon"),
    photo("then-and-now6", 1200, 1200, "Sunday morning, last month"),
  ],
  story: [
    {
      date: "15 years",
      title: "Married",
      body: "Since a ten-minute ceremony at the Sheria House registry in 2012.",
    },
    {
      date: "3 homes",
      title: "Kileleshwa, Kilimani, Lavington",
      body: "Each one with a slightly bigger kitchen.",
    },
    {
      date: "2 children",
      title: "Amara and Jabali",
      body: "Who now take better photos of us than we ever did.",
    },
    {
      date: "11 countries",
      title: "Passport stamps",
      body: "From Lamu to Lisbon, mostly chasing good coffee.",
    },
    {
      date: "1 dog",
      title: "Pilipili",
      body: "Our longest-serving house guest.",
    },
  ],
  gifts: { enabled: false, accounts: [], ewallets: [], registryLinks: [] },
  features: {
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: true,
    gifts: false,
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
    "calendar",
    "closing",
  ],
  seo: {
    title: "Lucy & Tom · 15 years · 31 July 2027",
    description:
      "Celebrate fifteen years of Lucy and Tom Baraza at Loft 15, Westlands.",
  },
})
