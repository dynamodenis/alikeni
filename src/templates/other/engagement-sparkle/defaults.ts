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
      name: "Wanjiru Kamau",
      shortName: "Wanjiru",
      role: "bride",
      parentsLine: "Daughter of Mr. & Mrs. Kamau",
      photo: photo("engagement-sparkle-wanjiru", 800, 1000, "Wanjiru smiling"),
    },
    {
      name: "Brian Ochieng",
      shortName: "Brian",
      role: "groom",
      parentsLine: "Son of Mr. & Mrs. Ochieng",
      photo: photo("engagement-sparkle-brian", 800, 1000, "Brian in a blazer"),
    },
  ],
  event: {
    type: "engagement",
    title: "Wanjiru & Brian are engaged",
    subtitle: "Join us to celebrate our yes",
    subEvents: [
      {
        label: "Ring blessing",
        start: "2027-03-27T16:00:00+03:00",
        end: "2027-03-27T17:00:00+03:00",
      },
      {
        label: "Sunset toasts",
        start: "2027-03-27T17:30:00+03:00",
        end: "2027-03-27T18:30:00+03:00",
      },
      {
        label: "Dinner & dancing",
        start: "2027-03-27T19:00:00+03:00",
        end: "2027-03-27T22:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-03-27T16:00:00+03:00",
    end: "2027-03-27T22:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Sankara Rooftop",
    address: "Woodvale Grove, Westlands, Nairobi, Kenya",
    placeName: "Sankara Rooftop, Westlands",
    lat: -1.264,
    lng: 36.802,
    notes: "Take the lift to the top floor; valet parking at the entrance.",
  },
  theme: {
    paletteId: "lavender",
    fontPairId: "great-vibes-raleway",
    motionLevel: "full",
    envelope: { liner: "dots", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "She said yes",
    coverButtonLabel: "Open invitation",
    headline: "Wanjiru & Brian",
    message:
      "He asked, she said yes, and now we would love to raise a glass with the people who made us who we are.",
    dressCode: "Cocktail · a touch of lilac",
    rsvpPrompt: "Let us know by the first of March so we can save you a seat.",
    rsvpDeadline: "2027-03-01T23:59:00+03:00",
    closing: "Thank you for loving us. Here's to the next chapter.",
    footerNote: "Wanjiru & Brian · Nairobi · March 2027",
  },
  gallery: [
    photo("engagement-sparkle-1", 1200, 1500, "Brian on one knee"),
    photo("engagement-sparkle-2", 1200, 1500, "The ring up close"),
    photo("engagement-sparkle-3", 1200, 1500, "A happy, tearful hug"),
    photo("engagement-sparkle-4", 1200, 1500, "City lights from the rooftop"),
    photo("engagement-sparkle-5", 1200, 1500, "Champagne for two"),
    photo("engagement-sparkle-6", 1200, 1500, "Walking hand in hand"),
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
    title: "Wanjiru & Brian are engaged · 27 March 2027",
    description: "Celebrate the engagement of Wanjiru and Brian in Westlands.",
  },
})
