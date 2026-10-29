import { schema, type GardenTeaPartyConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/900`,
  width: 1200,
  height: 900,
  alt,
})

export const defaults: GardenTeaPartyConfig = schema.parse({
  age: 80,
  hosts: [
    {
      name: "Rose Wanjiru",
      shortName: "Rose",
      role: "celebrant",
      parentsLine: "Hosted by her grandchildren",
      photo: photo("garden-tea-party-rose", "Rose in her sun hat"),
    },
  ],
  event: {
    type: "birthday",
    title: "Rose turns eighty",
    subtitle: "An afternoon tea in the garden",
    subEvents: [
      {
        label: "Arrival & welcome tea",
        start: "2027-07-18T15:00:00+03:00",
        end: "2027-07-18T15:30:00+03:00",
      },
      {
        label: "High tea",
        start: "2027-07-18T15:30:00+03:00",
        end: "2027-07-18T17:00:00+03:00",
      },
      {
        label: "Toasts & cake",
        start: "2027-07-18T17:00:00+03:00",
        end: "2027-07-18T17:45:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-07-18T15:00:00+03:00",
    end: "2027-07-18T18:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Karen Country Club Gardens",
    address: "Karen Road, Karen, Nairobi, Kenya",
    lat: -1.3236,
    lng: 36.7081,
    notes: "Follow the signs past the clubhouse to the rose garden lawn.",
  },
  theme: {
    paletteId: "sage",
    fontPairId: "cormorant-lora",
    motionLevel: "full",
    envelope: { liner: "floral", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "You are invited to afternoon tea",
    coverButtonLabel: "Open the invitation",
    headline: "Eighty Years of Rose",
    message:
      "Scones, sandwiches and the garden in full bloom. Join us for a leisurely afternoon celebrating our grandmother, who taught us all how to pour.",
    dressCode: "Garden party · hats encouraged",
    rsvpPrompt:
      "Let us know you're coming so we set a place and pour enough tea.",
    rsvpDeadline: "2027-07-04T23:59:00+03:00",
    closing:
      "Eighty summers, and the garden has never looked lovelier. Come share a cup with us.",
    footerNote:
      "No gifts, please. A card for Rose's memory box would be treasured.",
  },
  gallery: [
    photo("garden-tea-party-1", "Rose among the roses"),
    photo("garden-tea-party-2", "Tiered cake stand on the lawn"),
    photo("garden-tea-party-3", "Rose with her grandchildren"),
    photo("garden-tea-party-4", "A table laid for tea"),
    photo("garden-tea-party-5", "Rose on her wedding day"),
    photo("garden-tea-party-6", "Sun hats and sandwiches"),
  ],
  story: [],
  gifts: { enabled: false, accounts: [], ewallets: [], registryLinks: [] },
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
    "countdown",
    "event",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Rose turns 80 · 18 July 2027",
    description:
      "Her grandchildren invite you to afternoon tea in the Karen gardens.",
  },
})
