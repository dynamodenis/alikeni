import { schema, type TechTerminalConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/1500`,
  width: 1200,
  height: 1500,
  alt,
})

export const defaults: TechTerminalConfig = schema.parse({
  graduation: {
    school: "Strathmore University",
    degree: "BSc Computer Science",
    classOf: 2027,
  },
  hosts: [
    {
      name: "Ada Lovelace",
      shortName: "Ada",
      role: "graduate",
      parentsLine: "Deployed with love by the Lovelace family",
      photo: photo("tech-terminal-ada", "Ada in cap and gown"),
    },
  ],
  event: {
    type: "graduation",
    title: "Ada's Graduation",
    subtitle: "Four years, zero unresolved merge conflicts",
    subEvents: [
      {
        label: "Commencement ceremony",
        start: "2027-06-26T10:00:00+03:00",
        end: "2027-06-26T12:30:00+03:00",
        venueRef: "Strathmore University Auditorium",
      },
      {
        label: "Photos & coffee on the lawn",
        start: "2027-06-26T12:30:00+03:00",
        end: "2027-06-26T13:15:00+03:00",
      },
      {
        label: "Lunch & demo day",
        start: "2027-06-26T14:00:00+03:00",
        end: "2027-06-26T17:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-06-26T10:00:00+03:00",
    end: "2027-06-26T17:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Strathmore University Auditorium",
    address: "Ole Sangale Road, Madaraka, Nairobi, Kenya",
    lat: -1.3099,
    lng: 36.8126,
    notes:
      "Parking at the Student Centre; the auditorium is a two-minute walk.",
  },
  theme: {
    paletteId: "terminal",
    fontPairId: "space-grotesk-inter",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "sticker", stamp: false },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "You have 1 new invitation",
    coverButtonLabel: "Run invitation",
    headline: "class_of_2027",
    message:
      "After four years of all-nighters, failing tests and finally passing them, Ada is shipping her degree. Join us for the ceremony and lunch.",
    dressCode: "Smart casual · hoodies tolerated",
    rsvpPrompt: "Return true if you can make it.",
    rsvpDeadline: "2027-06-12T23:59:00+03:00",
    closing:
      "Thank you for every pair-programming session, pep talk and pizza.",
    footerNote: "Ada Lovelace · BSc CS 2027",
  },
  gallery: [
    photo("tech-terminal-1", "First lecture in the computing lab"),
    photo("tech-terminal-2", "Hackathon at 3 a.m."),
    photo("tech-terminal-3", "Demo day for the final project"),
    photo("tech-terminal-4", "Whiteboard full of diagrams"),
    photo("tech-terminal-5", "Internship team photo"),
    photo("tech-terminal-6", "Last commit before graduation"),
  ],
  story: [
    {
      date: "2023",
      title: "git init",
      body: "First semester: Hello, World in four languages and one very confusing pointer.",
    },
    {
      date: "2024",
      title: "feat: hackathon win",
      body: "Built an M-Pesa budgeting bot in 36 hours and took first place.",
    },
    {
      date: "2026",
      title: "chore: internship",
      body: "Six months on a payments team, shipping to a million users.",
    },
    {
      date: "2027",
      title: "release: v1.0",
      body: "A thesis on offline-first apps for rural clinics, graded first class.",
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
    title: "Ada graduates · 26 June 2027",
    description: "Celebrate Ada's Computer Science graduation at Strathmore.",
  },
})
