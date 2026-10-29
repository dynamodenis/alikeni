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
      name: "Safari Digital",
      shortName: "Safari Digital",
      role: "company",
      parentsLine: "The leadership team and the people & culture crew",
      photo: photo("holiday-party-host", 800, 800, "The Safari Digital team"),
    },
  ],
  event: {
    type: "corporate",
    title: "End of Year Party",
    subtitle: "Safari Digital invites the whole team and their plus-ones",
    subEvents: [
      {
        label: "Mulled drinks & mingling",
        start: "2027-12-17T18:30:00+03:00",
        end: "2027-12-17T19:30:00+03:00",
      },
      {
        label: "Dinner & team awards",
        start: "2027-12-17T19:30:00+03:00",
        end: "2027-12-17T21:30:00+03:00",
      },
      {
        label: "Secret Santa & dancing",
        start: "2027-12-17T21:30:00+03:00",
        end: "2027-12-18T00:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-12-17T18:30:00+03:00",
    end: "2027-12-18T00:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "The Social House",
    address: "James Gichuru Road, Lavington, Nairobi, Kenya",
    placeName: "The Social House, Lavington",
    lat: -1.28,
    lng: 36.77,
    notes:
      "Rides home are on us: ask the front desk for a company cab after 22:00.",
  },
  theme: {
    paletteId: "holiday",
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
    coverTitle: "You're invited to our",
    coverButtonLabel: "Unwrap",
    headline: "Holiday Party",
    message:
      "A big year deserves a proper send-off. Join us for dinner, awards, a little Secret Santa and a lot of dancing.",
    dressCode: "Festive",
    rsvpPrompt:
      "Let us know by the tenth of December so we can save you a seat (and a gift).",
    rsvpDeadline: "2027-12-10T23:59:00+03:00",
    closing: "Thank you for an incredible year. Let's celebrate it together.",
    footerNote: "Safari Digital · Nairobi · December 2027",
  },
  gallery: [
    photo("holiday-party1", 1200, 900, "The team in paper crowns"),
    photo("holiday-party2", 1200, 900, "Fairy lights over the dinner tables"),
    photo("holiday-party3", 1200, 900, "Award winners on stage"),
    photo("holiday-party4", 1200, 900, "A Secret Santa gift being opened"),
    photo("holiday-party5", 1200, 900, "The dance floor in full swing"),
    photo("holiday-party6", 1200, 900, "A group photo at midnight"),
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
    title: "Safari Digital End of Year Party · 17 December 2027",
    description:
      "Celebrate the year with the Safari Digital team in Lavington.",
  },
})
