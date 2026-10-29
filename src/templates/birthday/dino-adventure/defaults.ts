import { schema, type DinoAdventureConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/900`,
  width: 1200,
  height: 900,
  alt,
})

export const defaults: DinoAdventureConfig = schema.parse({
  age: 5,
  hosts: [
    {
      name: "Kai Otieno",
      shortName: "Kai",
      role: "celebrant",
      parentsLine: "Hosted by Mum & Dad",
      photo: photo("dino-adventure-kai", "Kai in a dino hoodie, mid-roar"),
    },
  ],
  event: {
    type: "birthday",
    title: "Kai is turning five!",
    subtitle: "A roaring jungle expedition",
    subEvents: [
      {
        label: "Fossil dig & face painting",
        start: "2027-04-17T11:00:00+03:00",
        end: "2027-04-17T12:30:00+03:00",
      },
      {
        label: "Picnic lunch",
        start: "2027-04-17T12:30:00+03:00",
        end: "2027-04-17T13:15:00+03:00",
      },
      {
        label: "Volcano cake eruption",
        start: "2027-04-17T13:15:00+03:00",
        end: "2027-04-17T14:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-04-17T11:00:00+03:00",
    end: "2027-04-17T14:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Karura Forest Picnic Site",
    address: "Kiambu Road Gate, Karura Forest, Nairobi, Kenya",
    lat: -1.2367,
    lng: 36.8325,
    notes: "Follow the green footprints from the car park to base camp.",
  },
  theme: {
    paletteId: "mint-cream",
    fontPairId: "baloo-nunito",
    motionLevel: "full",
    envelope: { liner: "dots", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "Calling all explorers",
    coverButtonLabel: "Start the expedition",
    headline: "Kai's Dino Adventure",
    message:
      "Grab your binoculars and your loudest roar. We are digging for fossils, hunting for footprints and feasting under the trees.",
    dressCode: "Explorer gear or your favourite dinosaur",
    rsvpPrompt:
      "Let us know which explorers are joining so we pack enough snacks.",
    rsvpDeadline: "2027-04-10T23:59:00+03:00",
    closing: "See you in the jungle!",
    footerNote: "Bring a hat and a water bottle; the sun gets fierce.",
  },
  gallery: [
    photo("dino-adventure-1", "Kai stomping through tall grass"),
    photo("dino-adventure-2", "A toy T. rex guarding last year's cake"),
    photo("dino-adventure-3", "Fossil dig in the sandpit"),
    photo("dino-adventure-4", "Kai and his cousins in dino masks"),
    photo("dino-adventure-5", "Muddy boots after the forest walk"),
    photo("dino-adventure-6", "Picnic blanket under the trees"),
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
    title: "Kai turns 5 · 17 April 2027",
    description: "Join Kai for a roaring dino expedition in Karura Forest.",
  },
})
