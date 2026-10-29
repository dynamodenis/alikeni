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
      name: "Leila Omar",
      shortName: "Leila",
      role: "bride",
      parentsLine: "Daughter of Mr. & Mrs. Omar",
      photo: photo(
        "beachsunset-leila",
        800,
        1000,
        "Leila laughing on the shore"
      ),
    },
    {
      name: "Marco Rossi",
      shortName: "Marco",
      role: "groom",
      parentsLine: "Son of Mr. & Mrs. Rossi",
      photo: photo(
        "beachsunset-marco",
        800,
        1000,
        "Marco barefoot in the sand"
      ),
    },
  ],
  event: {
    type: "wedding",
    title: "The Wedding of Leila & Marco",
    subtitle: "Where the ocean meets the sky",
    subEvents: [
      {
        label: "Sunset ceremony",
        start: "2027-02-13T17:30:00+03:00",
        end: "2027-02-13T18:30:00+03:00",
      },
      {
        label: "Beach dinner & dancing",
        start: "2027-02-13T19:00:00+03:00",
        end: "2027-02-13T23:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-02-13T17:30:00+03:00",
    end: "2027-02-13T23:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Diani Reef Beach",
    address: "Diani Beach Road, Diani, Kwale County, Kenya",
    placeName: "Diani Reef Beach",
    lat: -4.3167,
    lng: 39.5833,
    notes: "The ceremony is on the sand; leave your heels at the boardwalk.",
  },
  theme: {
    paletteId: "sunset-coral",
    fontPairId: "josefin-quicksand",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "Meet us at the shore",
    coverButtonLabel: "Open invitation",
    headline: "Leila & Marco",
    message:
      "As the sun dips into the Indian Ocean, we will say our vows with our toes in the sand. Come watch the sky turn coral with us.",
    dressCode: "Barefoot formal",
    rsvpPrompt:
      "Tell us you are coming by the twentieth of January so we can save you a spot on the sand.",
    rsvpDeadline: "2027-01-20T23:59:00+03:00",
    closing:
      "Salt in the air, sand at our feet and you beside us. That is all we need.",
    footerNote: "Leila & Marco · Diani · February 2027",
  },
  gallery: [
    photo("beachsunset1", 1200, 1500, "Walking the tide line at golden hour"),
    photo("beachsunset2", 1200, 1500, "Footprints leading to the water"),
    photo("beachsunset3", 1200, 1500, "Laughing under a palm"),
    photo("beachsunset4", 1200, 1500, "A dhow against the sunset"),
    photo("beachsunset5", 1200, 1500, "Rings on a seashell"),
    photo("beachsunset6", 1200, 1500, "Dancing on the sand after dark"),
  ],
  story: [
    {
      date: "2020",
      title: "A missed ferry",
      body: "We both missed the last boat to the island and shared a plate of fried fish while we waited.",
    },
    {
      date: "2023",
      title: "The long swim",
      body: "A whole summer of early mornings in the reef, and a promise to come back every February.",
    },
    {
      date: "2026",
      title: "He asked at sunset",
      body: "Same beach, same hour, one small box hidden in a beach bag.",
    },
  ],
  gifts: {
    enabled: true,
    accounts: [
      { bank: "Equity Bank", holder: "Leila Omar", number: "0987654321" },
    ],
    ewallets: [
      { provider: "M-Pesa", holder: "Marco Rossi", number: "0711 000 000" },
    ],
    registryLinks: [
      { label: "Honeymoon fund", url: "https://example.com/honeymoon" },
    ],
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
    title: "Leila & Marco · 13 February 2027",
    description: "Join us for a sunset wedding on Diani Beach.",
  },
})
