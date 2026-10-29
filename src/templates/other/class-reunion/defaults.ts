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
      name: "Peter Kamau",
      shortName: "Peter",
      role: "other",
      parentsLine: "Head boy, 2007 · Chair",
      photo: photo("class-reunion-peter", 800, 1000, "Peter Kamau"),
    },
    {
      name: "Samuel Otieno",
      shortName: "Sam",
      role: "other",
      parentsLine: "Captain, rugby XV · Events",
      photo: photo("class-reunion-samuel", 800, 1000, "Samuel Otieno"),
    },
    {
      name: "David Mutua",
      shortName: "David",
      role: "other",
      parentsLine: "Editor, school magazine · Treasurer",
      photo: photo("class-reunion-david", 800, 1000, "David Mutua"),
    },
  ],
  event: {
    type: "other",
    title: "Alliance High Class of '07 Reunion",
    subtitle: "Class of '07",
    subEvents: [
      {
        label: "Arrivals & campus tour",
        start: "2027-08-07T18:00:00+03:00",
        end: "2027-08-07T19:00:00+03:00",
      },
      {
        label: "Dinner in the hall",
        start: "2027-08-07T19:00:00+03:00",
        end: "2027-08-07T21:00:00+03:00",
      },
      {
        label: "Speeches & awards",
        start: "2027-08-07T21:00:00+03:00",
        end: "2027-08-07T22:00:00+03:00",
      },
      {
        label: "Throwback dance floor",
        start: "2027-08-07T22:00:00+03:00",
        end: "2027-08-08T01:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-08-07T18:00:00+03:00",
    end: "2027-08-08T01:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Alliance High School Hall",
    address: "Alliance High School, Kikuyu, Kenya",
    placeName: "Alliance High School, Kikuyu",
    lat: -1.247,
    lng: 36.665,
    notes: "Park on the sports field and follow the signs to the main hall.",
  },
  theme: {
    paletteId: "slate-minimal",
    fontPairId: "bebas-montserrat",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "Twenty years later",
    coverButtonLabel: "Open invitation",
    headline: "Class of '07",
    message:
      "Twenty years since we threw our caps in the air. Same hall, new grey hairs. Come back to Kikuyu for one night of stories, old songs and catching up.",
    dressCode: "Smart casual · school colours encouraged",
    rsvpPrompt:
      "Reply by the fifteenth of July so we can sort the seating plan (no, not by house).",
    rsvpDeadline: "2027-07-15T23:59:00+03:00",
    closing:
      "See you in the hall. Bring your stories, your old photos and your best dance moves.",
    footerNote: "Alliance High · Class of '07 · August 2027",
  },
  gallery: [
    photo("class-reunion1", 1200, 1500, "The class photo on the front steps"),
    photo("class-reunion2", 1200, 1600, "Prep in the library"),
    photo("class-reunion3", 1200, 1400, "Rugby final, 2006"),
    photo("class-reunion4", 1200, 1500, "Drama club backstage"),
    photo("class-reunion5", 1200, 1700, "Lunch queue in the dining hall"),
    photo("class-reunion6", 1200, 1400, "Graduation day, 2007"),
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
    title: "Alliance High Class of '07 Reunion · 7 August 2027",
    description:
      "Twenty years later: the Alliance High Class of '07 reunites in Kikuyu.",
  },
})
