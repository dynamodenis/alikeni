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
      name: "Hassan Abdullahi",
      shortName: "Hassan",
      role: "host",
      photo: photo("eid-open-house-hassan", 800, 1000, "Hassan Abdullahi"),
    },
    {
      name: "Amina Abdullahi",
      shortName: "Amina",
      role: "host",
      photo: photo("eid-open-house-amina", 800, 1000, "Amina Abdullahi"),
    },
  ],
  event: {
    type: "other",
    title: "Eid al-Fitr Open House",
    subtitle: "The Abdullahi family welcomes you",
    subEvents: [
      {
        label: "Open house",
        start: "2027-03-21T11:00:00+03:00",
        end: "2027-03-21T18:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-03-21T11:00:00+03:00",
    end: "2027-03-21T18:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Abdullahi Residence",
    address: "3rd Parklands Avenue, Parklands, Nairobi, Kenya",
    placeName: "Abdullahi Residence, Parklands",
    lat: -1.26,
    lng: 36.82,
    notes:
      "Drop in any time between 11:00 and 18:00. Street parking on 3rd Avenue.",
  },
  theme: {
    paletteId: "eid",
    fontPairId: "cinzel-garamond",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "Eid Mubarak from",
    coverButtonLabel: "Open invitation",
    headline: "Eid Mubarak",
    message:
      "Ramadan has come and gone, and our doors are open. Come share biryani, sweets and chai with our family as we celebrate Eid al-Fitr together.",
    dressCode: "Your Eid best",
    rsvpPrompt:
      "Let us know roughly when you'll stop by so the samosas stay warm.",
    rsvpDeadline: "2027-03-18T23:59:00+03:00",
    closing:
      "May this Eid bring peace to your home and joy to your heart. Eid Mubarak.",
    footerNote: "The Abdullahi family · Nairobi · Eid al-Fitr 2027",
  },
  gallery: [
    photo("eid-open-house1", 1200, 1500, "Lanterns on the veranda"),
    photo("eid-open-house2", 1200, 1500, "A table of sweets and dates"),
    photo("eid-open-house3", 1200, 1500, "Cousins in new Eid clothes"),
    photo("eid-open-house4", 1200, 1500, "Henna on little hands"),
    photo("eid-open-house5", 1200, 1500, "Biryani served in the courtyard"),
    photo("eid-open-house6", 1200, 1500, "The family together at sunset"),
  ],
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
    "event",
    "countdown",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Eid al-Fitr Open House · 21 March 2027",
    description:
      "The Abdullahi family invites you to their Eid al-Fitr open house in Parklands.",
  },
})
