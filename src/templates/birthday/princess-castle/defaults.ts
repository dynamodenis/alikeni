import { schema, type PrincessCastleConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/900`,
  width: 1200,
  height: 900,
  alt,
})

export const defaults: PrincessCastleConfig = schema.parse({
  age: 6,
  hosts: [
    {
      name: "Amara Njoki",
      shortName: "Amara",
      role: "celebrant",
      parentsLine: "Hosted by Wanjiku & Peter Njoki",
      photo: photo("princess-castle-amara", "Amara in a tulle gown and tiara"),
    },
  ],
  event: {
    type: "birthday",
    title: "Princess Amara turns six",
    subtitle: "A royal ball in the garden",
    subEvents: [
      {
        label: "Arrival & crowning",
        start: "2027-06-05T14:00:00+03:00",
        end: "2027-06-05T14:30:00+03:00",
      },
      {
        label: "Royal tea & games",
        start: "2027-06-05T14:30:00+03:00",
        end: "2027-06-05T16:00:00+03:00",
      },
      {
        label: "The castle cake",
        start: "2027-06-05T16:00:00+03:00",
        end: "2027-06-05T16:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-06-05T14:00:00+03:00",
    end: "2027-06-05T17:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Rosewood Garden Pavilion",
    address: "James Gichuru Road, Lavington, Nairobi, Kenya",
    lat: -1.2833,
    lng: 36.7667,
    notes: "The pavilion is at the back of the garden, past the fountain.",
  },
  theme: {
    paletteId: "lavender",
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
    coverTitle: "By royal decree",
    coverButtonLabel: "Enter the castle",
    headline: "Princess Amara's Royal Ball",
    message:
      "Tiaras, gowns and glass slippers welcome. Join us for an afternoon of royal tea, enchanted games and a castle cake fit for a princess.",
    dressCode: "Princes, princesses and friendly dragons",
    rsvpPrompt: "Kindly let the palace know who will attend the ball.",
    rsvpDeadline: "2027-05-29T23:59:00+03:00",
    closing: "Happily ever after starts with you.",
    footerNote: "Carriages (and car seats) depart at five.",
  },
  gallery: [
    photo("princess-castle-1", "Amara twirling in her gown"),
    photo("princess-castle-2", "Last year's crown-shaped cake"),
    photo("princess-castle-3", "A tea party with her dolls"),
    photo("princess-castle-4", "Amara and her best friend in tiaras"),
    photo("princess-castle-5", "Balloons in the garden pavilion"),
    photo("princess-castle-6", "A wand, a tiara and a pair of slippers"),
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
    title: "Princess Amara turns 6 · 5 June 2027",
    description: "You are invited to Amara's royal birthday ball in Lavington.",
  },
})
