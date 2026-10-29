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
      name: "Amani Foundation",
      shortName: "Amani Foundation",
      role: "company",
      parentsLine: "Scholarships for gifted students since 2009",
      photo: photo(
        "black-tie-gala-host",
        800,
        800,
        "The Amani Foundation crest"
      ),
    },
  ],
  event: {
    type: "corporate",
    title: "Annual Charity Gala",
    subtitle: "The Board of Trustees requests the pleasure of your company",
    subEvents: [
      {
        label: "Champagne reception",
        start: "2027-10-30T19:00:00+03:00",
        end: "2027-10-30T20:00:00+03:00",
      },
      {
        label: "Dinner & address",
        start: "2027-10-30T20:00:00+03:00",
        end: "2027-10-30T22:00:00+03:00",
      },
      {
        label: "Auction & dancing",
        start: "2027-10-30T22:00:00+03:00",
        end: "2027-10-31T00:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-10-30T19:00:00+03:00",
    end: "2027-10-31T00:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Radisson Blu Ballroom",
    address: "Elgon Road, Upper Hill, Nairobi, Kenya",
    placeName: "Radisson Blu Ballroom, Upper Hill",
    lat: -1.299,
    lng: 36.815,
    notes:
      "Valet parking at the main entrance. Kindly present your invitation.",
  },
  theme: {
    paletteId: "gala",
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
    coverTitle: "An invitation to the",
    coverButtonLabel: "Open invitation",
    headline: "The Amani Gala",
    message:
      "An evening of fine dining, music and generosity in support of the Amani Scholars programme.",
    dressCode: "Black tie",
    rsvpPrompt: "The favour of a reply is requested by the first of October.",
    rsvpDeadline: "2027-10-01T23:59:00+03:00",
    closing:
      "We are honoured to count you among our guests and look forward to a memorable evening.",
    footerNote: "Amani Foundation · Nairobi · October 2027",
  },
  gallery: [
    photo("black-tie-gala1", 1200, 1500, "Candlelit tables in the ballroom"),
    photo("black-tie-gala2", 1200, 1500, "Guests raising a toast"),
    photo("black-tie-gala3", 1200, 1500, "A string quartet on stage"),
    photo("black-tie-gala4", 1200, 1500, "The auction in full swing"),
    photo("black-tie-gala5", 1200, 1500, "Scholars receiving their awards"),
    photo("black-tie-gala6", 1200, 1500, "The dance floor after midnight"),
  ],
  story: [],
  gifts: { enabled: false, accounts: [], ewallets: [], registryLinks: [] },
  features: {
    countdown: true,
    rsvp: true,
    wishes: false,
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
    "calendar",
    "closing",
  ],
  seo: {
    title: "Amani Annual Charity Gala · 30 October 2027",
    description:
      "The Amani Foundation requests the pleasure of your company at its Annual Charity Gala.",
  },
})
