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
      name: "Hana Sato",
      shortName: "Hana",
      role: "bride",
      parentsLine: "Daughter of Mr. & Mrs. Sato",
      photo: photo(
        "pastelpetals-hana",
        800,
        1000,
        "Hana holding a bouquet of peonies"
      ),
    },
    {
      name: "Daniel Pretorius",
      shortName: "Daniel",
      role: "groom",
      parentsLine: "Son of Mr. & Mrs. Pretorius",
      photo: photo(
        "pastelpetals-daniel",
        800,
        1000,
        "Daniel in a pale linen suit"
      ),
    },
  ],
  event: {
    type: "wedding",
    title: "The Wedding of Hana & Daniel",
    subtitle: "Together with their families",
    subEvents: [
      {
        label: "Garden ceremony",
        start: "2027-10-09T15:00:00+02:00",
        end: "2027-10-09T16:00:00+02:00",
      },
      {
        label: "Reception on the lawn",
        start: "2027-10-09T17:30:00+02:00",
        end: "2027-10-09T23:00:00+02:00",
      },
    ],
  },
  datetime: {
    start: "2027-10-09T15:00:00+02:00",
    end: "2027-10-09T23:00:00+02:00",
    timezone: "Africa/Johannesburg",
  },
  venue: {
    name: "Vergelegen Rose Garden",
    address: "Lourensford Road, Somerset West, Cape Town, South Africa",
    placeName: "Vergelegen Rose Garden",
    lat: -34.0768,
    lng: 18.8906,
    notes:
      "Follow the signs past the camphor trees; the rose garden is a short walk from the parking.",
  },
  theme: {
    paletteId: "blush-champagne",
    fontPairId: "great-vibes-raleway",
    motionLevel: "full",
    envelope: { liner: "floral", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "You are warmly invited to",
    coverButtonLabel: "Open invitation",
    headline: "Hana & Daniel",
    message:
      "Spring has come to the Cape and so has our wedding day. Join us among the roses as we promise each other forever.",
    dressCode: "Pastels · garden formal",
    rsvpPrompt:
      "Please let us know if you can join us by the tenth of September.",
    rsvpDeadline: "2027-09-10T23:59:00+02:00",
    closing:
      "Thank you for growing with us. We cannot wait to celebrate under the petals.",
    footerNote: "Hana & Daniel · Cape Town · October 2027",
  },
  gallery: [
    photo(
      "pastelpetals1",
      1200,
      1500,
      "Walking hand in hand through the rose beds"
    ),
    photo("pastelpetals2", 1200, 1500, "Cherry blossom in Hana's hair"),
    photo("pastelpetals3", 1200, 1500, "A picnic blanket on the lawn"),
    photo("pastelpetals4", 1200, 1500, "Daniel laughing in the orchard"),
    photo("pastelpetals5", 1200, 1500, "Rings resting on a peony"),
    photo("pastelpetals6", 1200, 1500, "The two of them at the garden gate"),
  ],
  story: [
    {
      date: "2021",
      title: "A flower market",
      body: "Hana was buying ranunculus; Daniel was lost. He asked for directions and stayed for coffee.",
    },
    {
      date: "2024",
      title: "Two springs",
      body: "Cherry blossom in Kyoto one year, jacaranda in Pretoria the next, and a promise to pick a garden of our own.",
    },
    {
      date: "2026",
      title: "Under the roses",
      body: "He asked in the very garden where we will say our vows, with petals in the air.",
    },
  ],
  gifts: {
    enabled: true,
    accounts: [{ bank: "FNB", holder: "Hana Sato", number: "62012345678" }],
    ewallets: [
      {
        provider: "SnapScan",
        holder: "Daniel Pretorius",
        number: "082 000 0000",
      },
    ],
    registryLinks: [
      { label: "Our registry", url: "https://example.com/registry" },
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
    title: "Hana & Daniel · 9 October 2027",
    description: "Join us for a garden wedding among the roses in Cape Town.",
  },
})
