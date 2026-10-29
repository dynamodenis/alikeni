import { schema, type SilverJubileeConfig } from "./schema"

const photo = (seed: string, w: number, h: number, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  width: w,
  height: h,
  alt,
})

export const defaults: SilverJubileeConfig = schema.parse({
  years: 25,
  hosts: [
    {
      name: "Anne Odhiambo",
      shortName: "Anne",
      role: "host",
      photo: photo("silver-jubilee-anne", 800, 1000, "Anne in a silver dress"),
    },
    {
      name: "Patrick Odhiambo",
      shortName: "Patrick",
      role: "host",
      photo: photo(
        "silver-jubilee-patrick",
        800,
        1000,
        "Patrick in a grey suit"
      ),
    },
  ],
  event: {
    type: "anniversary",
    title: "Anne & Patrick's Silver Jubilee",
    subtitle: "Twenty-five years, and still dancing",
    subEvents: [],
  },
  datetime: {
    start: "2027-11-06T16:00:00+03:00",
    end: "2027-11-06T22:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Hemingways Nairobi Lawn",
    address: "Mbagathi Ridge, Karen, Nairobi, Kenya",
    placeName: "Hemingways Nairobi",
    lat: -1.32,
    lng: 36.71,
    notes: "Valet parking at the main entrance; the lawn is past the terrace.",
  },
  theme: {
    paletteId: "silver",
    fontPairId: "playfair-inter",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "A silver jubilee",
    coverButtonLabel: "Open invitation",
    headline: "Anne & Patrick",
    message:
      "Twenty-five years of marriage, three children and countless Sunday breakfasts. Come and raise a glass with us on the lawn.",
    dressCode: "Cocktail · silver, grey or white",
    rsvpPrompt: "Please reply by the twentieth of October.",
    rsvpDeadline: "2027-10-20T23:59:00+03:00",
    closing: "Here's to the next twenty-five, and to everyone who got us here.",
    footerNote: "Anne & Patrick Odhiambo · 2002 – 2027",
  },
  gallery: [
    photo("silver-jubilee1", 1200, 900, "The wedding day in Kisumu, 2002"),
    photo("silver-jubilee2", 1200, 900, "Honeymoon on Lamu"),
    photo("silver-jubilee3", 1200, 900, "The first child's christening"),
    photo("silver-jubilee4", 1200, 900, "A family safari in the Mara"),
    photo("silver-jubilee5", 1200, 900, "Tenth anniversary in Cape Town"),
    photo("silver-jubilee6", 1200, 900, "The whole family last Christmas"),
  ],
  story: [
    {
      date: "1999",
      title: "A borrowed umbrella",
      body: "A downpour outside the University of Nairobi library and one umbrella between two strangers.",
    },
    {
      date: "2002",
      title: "The wedding",
      body: "A packed church in Kisumu and a reception that ran until the generator gave up.",
    },
    {
      date: "2010",
      title: "Three under one roof",
      body: "Three children, a move to Karen and a garden Anne still refuses to let Patrick prune.",
    },
    {
      date: "2027",
      title: "Twenty-five",
      body: "Still sharing umbrellas, and now celebrating with all of you.",
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
    title: "Anne & Patrick · 25 years · 6 November 2027",
    description:
      "Celebrate Anne and Patrick Odhiambo's silver jubilee at Hemingways Nairobi.",
  },
})
