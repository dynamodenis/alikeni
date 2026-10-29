import { schema, type StarryFutureConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/1500`,
  width: 1200,
  height: 1500,
  alt,
})

export const defaults: StarryFutureConfig = schema.parse({
  graduation: {
    school: "Moi University",
    degree: "Bachelor of Medicine & Surgery",
    classOf: 2027,
  },
  hosts: [
    {
      name: "Samuel Kiptoo",
      shortName: "Samuel",
      role: "graduate",
      parentsLine: "With pride from the Kiptoo family",
      photo: photo("starry-future-samuel", "Samuel in his graduation gown"),
    },
  ],
  event: {
    type: "graduation",
    title: "Samuel's Graduation",
    subtitle: "Six years of night shifts, one white coat",
    subEvents: [
      {
        label: "Graduation ceremony",
        start: "2027-12-17T09:00:00+03:00",
        end: "2027-12-17T12:00:00+03:00",
        venueRef: "Moi University Main Campus",
      },
      {
        label: "Family lunch & photos",
        start: "2027-12-17T13:30:00+03:00",
        end: "2027-12-17T17:00:00+03:00",
        venueRef: "Eldoret Sports Club",
      },
    ],
  },
  datetime: {
    start: "2027-12-17T09:00:00+03:00",
    end: "2027-12-17T17:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Moi University Main Campus",
    address: "Kesses, Eldoret, Kenya",
    lat: 0.2827,
    lng: 35.304,
    notes: "Gates open at 7:30; guests are seated by 8:45.",
  },
  theme: {
    paletteId: "midnight",
    fontPairId: "fraunces-dm-sans",
    motionLevel: "full",
    envelope: { liner: "dots", seal: "wax", stamp: false },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "Under a sky full of stars, you are invited to",
    coverButtonLabel: "Open invitation",
    headline: "Class of 2027",
    message:
      "After six years of anatomy, wards and very long nights, Samuel is becoming a doctor. Come and watch him take the oath, then celebrate with us.",
    dressCode: "Smart formal",
    rsvpPrompt: "Let us know if you can join us for the ceremony and lunch.",
    rsvpDeadline: "2027-12-03T23:59:00+03:00",
    closing: "Thank you for every star you lit along the way.",
    footerNote: "Samuel Kiptoo · MBChB 2027",
  },
  gallery: [
    photo("starry-future-1", "First white coat"),
    photo("starry-future-2", "Anatomy lab, year one"),
    photo("starry-future-3", "Night shift at the teaching hospital"),
    photo("starry-future-4", "Rural attachment in Kapsabet"),
    photo("starry-future-5", "Study group before finals"),
    photo("starry-future-6", "Last day of clinical rotations"),
  ],
  story: [
    {
      date: "2021",
      title: "First lecture",
      body: "A borrowed lab coat, a brand-new stethoscope and a lecture hall of strangers who became family.",
    },
    {
      date: "2023",
      title: "First patient",
      body: "The first time a patient said thank you. The nerves have never fully gone.",
    },
    {
      date: "2025",
      title: "Rural attachment",
      body: "Three months in Kapsabet delivering babies by torchlight when the power failed.",
    },
    {
      date: "2027",
      title: "Finals",
      body: "Passed. The oath is next, and then the road ahead.",
    },
  ],
  gifts: { enabled: false, accounts: [], ewallets: [], registryLinks: [] },
  features: {
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: true,
    gifts: false,
    calendar: true,
    map: true,
    music: true,
  },
  sectionsOrder: [
    "hero",
    "hosts",
    "event",
    "story",
    "gallery",
    "countdown",
    "map",
    "rsvp",
    "wishes",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Samuel graduates · 17 December 2027",
    description: "Celebrate Dr Samuel Kiptoo's graduation under the stars.",
  },
})
