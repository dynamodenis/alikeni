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
      name: "Maggie Njeri",
      shortName: "Maggie",
      role: "bride",
      parentsLine: "Daughter of Mr. & Mrs. Njeri",
      photo: photo("rustic-maggie", 800, 1000, "Maggie in a field of wheat"),
    },
    {
      name: "Joel Otieno",
      shortName: "Joel",
      role: "groom",
      parentsLine: "Son of Mr. & Mrs. Otieno",
      photo: photo("rustic-joel", 800, 1000, "Joel leaning on a fence post"),
    },
  ],
  event: {
    type: "wedding",
    title: "The Wedding of Maggie & Joel",
    subtitle: "A celebration at the barn",
    subEvents: [
      {
        label: "Ceremony",
        start: "2027-08-14T15:00:00+03:00",
        end: "2027-08-14T16:00:00+03:00",
      },
      {
        label: "Barn dinner & dance",
        start: "2027-08-14T18:00:00+03:00",
        end: "2027-08-14T23:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-08-14T15:00:00+03:00",
    end: "2027-08-14T23:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Kiboko Barn",
    address: "Moi South Lake Road, Naivasha, Kenya",
    placeName: "Kiboko Barn",
    lat: -0.7167,
    lng: 36.4333,
    notes: "Follow the lanterns from the farm gate. Parking in the paddock.",
  },
  theme: {
    paletteId: "barnwood",
    fontPairId: "fraunces-dm-sans",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "You're invited to the barn",
    coverButtonLabel: "Open the invitation",
    headline: "Maggie & Joel",
    message:
      "Come for the vows, stay for the bonfire. We are getting married under the barn rafters and we would love you there.",
    dressCode: "Smart casual · boots welcome",
    rsvpPrompt:
      "Let us know by the twentieth of July so we can set a place for you at the long table.",
    rsvpDeadline: "2027-07-20T23:59:00+03:00",
    closing:
      "Bring your dancing boots and your appetite. We cannot wait to share this day with you.",
    footerNote: "Maggie & Joel · Naivasha · August 2027",
  },
  gallery: [
    photo("rustic1", 1200, 1500, "Hay bales at golden hour"),
    photo("rustic2", 1200, 900, "The barn doors swung open"),
    photo("rustic3", 1200, 1500, "Laughing on the farm track"),
    photo("rustic4", 1200, 1200, "Wildflowers in a mason jar"),
    photo("rustic5", 1200, 1500, "Dancing on the wooden floor"),
    photo("rustic6", 1200, 900, "Lanterns strung between the posts"),
  ],
  story: [
    {
      date: "2020",
      title: "A farmers' market",
      body: "Joel sold Maggie the last jar of honey. She came back the next week for another, and the week after that.",
    },
    {
      date: "2023",
      title: "The first harvest",
      body: "A rented plot in Naivasha, a very stubborn pumpkin patch and a lot of muddy boots.",
    },
    {
      date: "2026",
      title: "He asked by the lake",
      body: "At dusk, with the barn lights glowing behind us. The same barn we will marry in.",
    },
  ],
  gifts: {
    enabled: true,
    accounts: [
      {
        bank: "Co-operative Bank",
        holder: "Maggie Njeri",
        number: "0112233445566",
      },
    ],
    ewallets: [
      { provider: "M-Pesa", holder: "Joel Otieno", number: "0711 000 000" },
    ],
    registryLinks: [
      { label: "Our farmhouse registry", url: "https://example.com/registry" },
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
    title: "Maggie & Joel · 14 August 2027",
    description: "Join us for a rustic barn wedding at Kiboko Barn, Naivasha.",
  },
})
