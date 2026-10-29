import type { z } from "zod"
import { schema } from "./schema"

const photo = (seed: string, w: number, h: number, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  width: w,
  height: h,
  alt,
})

const at = (time: string) => `2027-05-13T${time}:00+03:00`

export const defaults: z.infer<typeof schema> = schema.parse({
  hosts: [
    {
      name: "Wambui Njenga",
      shortName: "Wambui",
      role: "other",
      parentsLine: "CTO, Kilimo Data · Opening keynote",
      photo: photo("conference-grid-wambui", 800, 800, "Wambui Njenga"),
    },
    {
      name: "Tunde Adeyemi",
      shortName: "Tunde",
      role: "other",
      parentsLine: "Founder, Savanna Ventures · Scaling across borders",
      photo: photo("conference-grid-tunde", 800, 800, "Tunde Adeyemi"),
    },
    {
      name: "Halima Yusuf",
      shortName: "Halima",
      role: "other",
      parentsLine: "Head of Design, Matatu Labs · Designing for low bandwidth",
      photo: photo("conference-grid-halima", 800, 800, "Halima Yusuf"),
    },
  ],
  event: {
    type: "corporate",
    title: "Build East Africa 2027",
    subtitle: "One day for the people building the region's software",
    subEvents: [
      { label: "Registration & coffee", start: at("08:30"), end: at("09:15") },
      { label: "Opening keynote", start: at("09:15"), end: at("10:00") },
      { label: "Talks: track A & B", start: at("10:15"), end: at("12:30") },
      { label: "Lunch & expo", start: at("12:30"), end: at("13:30") },
      { label: "Workshops", start: at("13:30"), end: at("16:30") },
      { label: "Closing panel & mixer", start: at("16:45"), end: at("19:00") },
    ],
  },
  datetime: {
    start: at("08:30"),
    end: at("19:00"),
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "KICC, Nairobi",
    address: "Harambee Avenue, Nairobi, Kenya",
    placeName: "Kenyatta International Convention Centre",
    lat: -1.2884,
    lng: 36.8233,
    notes: "Enter through Gate B; badges are collected at the Tsavo Ballroom.",
  },
  theme: {
    paletteId: "slate-minimal",
    fontPairId: "bricolage-manrope",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "sticker", stamp: false },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "Conference · Nairobi",
    coverButtonLabel: "View programme",
    headline: "Build East Africa",
    message:
      "Talks, workshops and hallway conversations with engineers, designers and founders from across the region.",
    dressCode: "Come as you are",
    rsvpPrompt: "Registration is free but capped at 800. Sign up by 30 April.",
    rsvpDeadline: "2027-04-30T23:59:00+03:00",
    closing:
      "See you at KICC. Bring a laptop, a question and someone you want to hire.",
    footerNote: "Build East Africa · KICC Nairobi · 13 May 2027",
  },
  gallery: [
    photo("conference-grid1", 1200, 900, "A packed main hall during a keynote"),
    photo("conference-grid2", 1200, 900, "Speakers on a panel"),
    photo("conference-grid3", 1200, 900, "Attendees at a workshop table"),
    photo("conference-grid4", 1200, 900, "The expo floor"),
    photo("conference-grid5", 1200, 900, "Conversations in the hallway"),
    photo("conference-grid6", 1200, 900, "The closing mixer on the terrace"),
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
    "event",
    "hosts",
    "countdown",
    "gallery",
    "map",
    "rsvp",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Build East Africa 2027 · 13 May, KICC Nairobi",
    description:
      "A one-day conference for engineers, designers and founders in East Africa.",
  },
})
