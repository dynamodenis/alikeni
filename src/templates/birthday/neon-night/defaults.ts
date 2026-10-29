import { schema, type NeonNightConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/900`,
  width: 1200,
  height: 900,
  alt,
})

export const defaults: NeonNightConfig = schema.parse({
  age: 21,
  hosts: [
    {
      name: "Brian Kiprop",
      shortName: "Brian",
      role: "celebrant",
      photo: photo("neon-night-brian", "Brian lit by pink and blue neon"),
    },
  ],
  event: {
    type: "birthday",
    title: "Brian turns 21",
    subtitle: "Doors open late",
    subEvents: [
      {
        label: "Doors & cocktails",
        start: "2027-03-13T21:00:00+03:00",
        end: "2027-03-13T22:00:00+03:00",
      },
      {
        label: "DJ set",
        start: "2027-03-13T22:00:00+03:00",
        end: "2027-03-14T00:00:00+03:00",
      },
      {
        label: "Midnight cake & toast",
        start: "2027-03-14T00:00:00+03:00",
        end: "2027-03-14T00:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-03-13T21:00:00+03:00",
    end: "2027-03-14T03:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "The Alchemist",
    address: "Parklands Road, Westlands, Nairobi, Kenya",
    lat: -1.263,
    lng: 36.803,
    notes: "Say Brian's name at the door. Parking on Parklands Road.",
  },
  theme: {
    paletteId: "neon-night",
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
    coverTitle: "You're on the list",
    coverButtonLabel: "Lights on",
    headline: "Brian's Neon 21st",
    message:
      "Twenty-one years loud. Come dressed to glow: cocktails at nine, a DJ until the lights come up and cake at midnight.",
    dressCode: "Neon & black",
    rsvpPrompt: "Names on the list by the 6th so the door knows you.",
    rsvpDeadline: "2027-03-06T23:59:00+03:00",
    closing: "See you under the lights.",
    footerNote: "18+ venue. Rides home are on us until 3am.",
  },
  gallery: [
    photo("neon-night-1", "Brian under the DJ booth lights"),
    photo("neon-night-2", "Last year's sparkler cake"),
    photo("neon-night-3", "The crew on the rooftop"),
    photo("neon-night-4", "Neon signs over the bar"),
    photo("neon-night-5", "Dance floor in pink haze"),
    photo("neon-night-6", "A blurry 4am selfie"),
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
    title: "Brian turns 21 · 13 March 2027",
    description: "A neon-lit 21st birthday night at The Alchemist, Westlands.",
  },
})
