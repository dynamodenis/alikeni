import { schema, type LoveLetterConfig } from "./schema"

const photo = (seed: string, w: number, h: number, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  width: w,
  height: h,
  alt,
})

export const defaults: LoveLetterConfig = schema.parse({
  years: 10,
  hosts: [
    {
      name: "Esther Kimani",
      shortName: "Esther",
      role: "host",
      photo: photo("love-letter-esther", 800, 800, "Esther laughing"),
    },
    {
      name: "David Kimani",
      shortName: "David",
      role: "host",
      photo: photo("love-letter-david", 800, 800, "David in a linen shirt"),
    },
  ],
  event: {
    type: "anniversary",
    title: "Esther & David · Ten Years",
    subtitle: "A Valentine's dinner for our tenth anniversary",
    subEvents: [],
  },
  datetime: {
    start: "2027-02-14T19:00:00+03:00",
    end: "2027-02-14T23:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Talisman Restaurant Garden",
    address: "320 Ngong Road, Karen, Nairobi, Kenya",
    placeName: "The Talisman",
    lat: -1.33,
    lng: 36.72,
    notes: "We have the garden to ourselves; candles and blankets provided.",
  },
  theme: {
    paletteId: "blush-champagne",
    fontPairId: "dancing-lora",
    motionLevel: "full",
    envelope: { liner: "floral", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "A letter for you",
    coverButtonLabel: "Open the letter",
    headline: "Esther & David",
    message:
      "Ten years ago we wrote our first letters across two cities. Tonight we would love you beside us for dinner under the jacarandas, to toast a decade of love.",
    dressCode: "Garden dinner · blush, cream or champagne",
    rsvpPrompt: "Write back by the first of February so we can save your seat.",
    rsvpDeadline: "2027-02-01T23:59:00+03:00",
    closing:
      "Every page of our story has your name in it somewhere. Thank you.",
    footerNote: "Esther & David · 2017 – 2027",
  },
  gallery: [
    photo("love-letter1", 1200, 1500, "Letters tied with a ribbon"),
    photo("love-letter2", 1200, 900, "Our wedding in Limuru"),
    photo("love-letter3", 1200, 1500, "Sunset in Diani"),
    photo("love-letter4", 1200, 900, "Breakfast in our first flat"),
    photo("love-letter5", 1200, 1500, "Dancing at a friend's wedding"),
    photo("love-letter6", 1200, 900, "A walk in Karura Forest"),
  ],
  story: [
    {
      date: "2015",
      title: "The first letter",
      body: "Esther in Mombasa, David in Nairobi, and a pen-pal scheme neither of them took seriously.",
    },
    {
      date: "2016",
      title: "The reply that changed it",
      body: "Four pages, a pressed bougainvillea and a train ticket to the coast.",
    },
    {
      date: "2017",
      title: "Signed, sealed",
      body: "A garden wedding in Limuru, with every letter read aloud at the reception.",
    },
    {
      date: "2027",
      title: "Ten years on",
      body: "Still writing to each other, now on the fridge door.",
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
    title: "Esther & David · 10 years · 14 February 2027",
    description:
      "Join Esther and David Kimani for a tenth-anniversary dinner at the Talisman, Karen.",
  },
})
