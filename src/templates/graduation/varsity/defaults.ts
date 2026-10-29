import { schema, type VarsityConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/1500`,
  width: 1200,
  height: 1500,
  alt,
})

export const defaults: VarsityConfig = schema.parse({
  graduation: {
    school: "University of Nairobi",
    degree: "BSc Mechanical Engineering",
    classOf: 2027,
  },
  hosts: [
    {
      name: "Marcus Oduya",
      shortName: "Marcus",
      role: "graduate",
      parentsLine: "Cheered on by the Oduya family",
      photo: photo("varsity-marcus", "Marcus in his graduation gown"),
    },
  ],
  event: {
    type: "graduation",
    title: "Marcus's Graduation",
    subtitle: "Five seasons, one degree, no regrets",
    subEvents: [
      {
        label: "Commencement ceremony",
        start: "2027-12-10T09:00:00+03:00",
        end: "2027-12-10T12:00:00+03:00",
        venueRef: "Taifa Hall, University of Nairobi",
      },
      {
        label: "Photos on the steps",
        start: "2027-12-10T12:00:00+03:00",
        end: "2027-12-10T12:45:00+03:00",
      },
      {
        label: "Victory lunch",
        start: "2027-12-10T13:30:00+03:00",
        end: "2027-12-10T16:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-12-10T09:00:00+03:00",
    end: "2027-12-10T16:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Taifa Hall, University of Nairobi",
    address: "University Way, Nairobi, Kenya",
    lat: -1.28,
    lng: 36.817,
    notes: "Gates open at 7:30; seating is first come, first served.",
  },
  theme: {
    paletteId: "varsity",
    fontPairId: "bebas-montserrat",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "sticker", stamp: false },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "You're on the roster",
    coverButtonLabel: "Open invitation",
    headline: "Class of 2027",
    message:
      "After five seasons of late labs, early lectures and one unforgettable robotics final, Marcus is graduating. Come cheer him across the stage.",
    dressCode: "Smart casual · team colours welcome",
    rsvpPrompt: "Save your seat in the stands.",
    rsvpDeadline: "2027-11-26T23:59:00+03:00",
    closing: "Thank you for being on the team all the way.",
    footerNote: "Marcus Oduya · BSc Mech. Eng. 2027",
  },
  gallery: [
    photo("varsity-1", "Freshers' week on the main quad"),
    photo("varsity-2", "The engineering workshop"),
    photo("varsity-3", "Robotics team at nationals"),
    photo("varsity-4", "Inter-faculty rugby final"),
    photo("varsity-5", "Final-year project rig"),
    photo("varsity-6", "Last lecture, front row"),
  ],
  story: [
    {
      date: "2022",
      title: "Pre-season",
      body: "Moved into halls with a toolbox and a borrowed calculator.",
    },
    {
      date: "2024",
      title: "Captain",
      body: "Led the robotics team to a national title with a two-wheeled balancing bot.",
    },
    {
      date: "2026",
      title: "Away game",
      body: "Six months on an industrial attachment at a geothermal plant in Naivasha.",
    },
    {
      date: "2027",
      title: "Final whistle",
      body: "A thesis on low-cost wind turbines, defended with first-class honours.",
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
    title: "Marcus graduates · 10 December 2027",
    description: "Cheer Marcus across the stage at Taifa Hall.",
  },
})
