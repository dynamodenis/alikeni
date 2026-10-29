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
      name: "Kijani Collective",
      shortName: "Kijani Collective",
      role: "company",
      parentsLine: "Organised by the people & culture team",
      photo: photo("team-offsite-host", 800, 800, "The Kijani Collective team"),
    },
  ],
  event: {
    type: "corporate",
    title: "Team Offsite 2027",
    subtitle: "Two days by the lake to plan the year ahead",
    subEvents: [
      {
        label: "Day one",
        start: "2027-03-19T09:00:00+03:00",
        end: "2027-03-19T21:00:00+03:00",
      },
      {
        label: "Day two",
        start: "2027-03-20T09:00:00+03:00",
        end: "2027-03-20T16:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-03-19T09:00:00+03:00",
    end: "2027-03-20T16:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Lake Naivasha Lodge",
    address: "Moi South Lake Road, Naivasha, Kenya",
    placeName: "Lake Naivasha Lodge",
    lat: -0.77,
    lng: 36.37,
    notes:
      "The bus leaves the Westlands office at 06:30 on day one. Pack walking shoes and a warm layer.",
  },
  theme: {
    paletteId: "forest",
    fontPairId: "josefin-quicksand",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "sticker", stamp: false },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "Pack your bags for",
    coverButtonLabel: "Let's go",
    headline: "Into the hills",
    message:
      "Strategy in the mornings, hikes and boat rides in the afternoons, and long dinners by the fire. Laptops optional.",
    dressCode: "Outdoor casual · walking shoes",
    rsvpPrompt: "Confirm by the first of March so we can book your room.",
    rsvpDeadline: "2027-03-01T23:59:00+03:00",
    closing: "See you on the bus. The lake, the hills and the team await.",
    footerNote: "Kijani Collective · Naivasha · March 2027",
  },
  gallery: [
    photo("team-offsite1", 1200, 1500, "The team on a hilltop trail"),
    photo("team-offsite2", 1200, 900, "Boats on the lake at sunrise"),
    photo("team-offsite3", 1200, 1500, "A workshop under the acacia trees"),
    photo("team-offsite4", 1200, 900, "Dinner around the fire"),
    photo("team-offsite5", 1200, 1500, "Giraffes on Crescent Island"),
    photo("team-offsite6", 1200, 900, "A group photo on the jetty"),
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
    "hosts",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Kijani Collective Team Offsite · 19–20 March 2027",
    description: "Two days at Lake Naivasha to plan the year ahead.",
  },
})
