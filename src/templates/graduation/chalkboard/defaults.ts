import { schema, type ChalkboardConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/1500`,
  width: 1200,
  height: 1500,
  alt,
})

export const defaults: ChalkboardConfig = schema.parse({
  graduation: {
    school: "Kenya High School",
    degree: "KCSE · Sciences",
    classOf: 2027,
  },
  hosts: [
    {
      name: "Faith Chebet",
      shortName: "Faith",
      role: "graduate",
      parentsLine: "With pride from the Chebet family",
      photo: photo("chalkboard-faith", "Faith in her school blazer"),
    },
  ],
  event: {
    type: "graduation",
    title: "Faith's Graduation Day",
    subtitle: "Four years of chalk, chemistry and choir practice",
    subEvents: [
      {
        label: "Prize-giving & graduation ceremony",
        start: "2027-11-27T10:00:00+03:00",
        end: "2027-11-27T12:30:00+03:00",
        venueRef: "Kenya High School Hall",
      },
      {
        label: "Class photos on the quad",
        start: "2027-11-27T12:30:00+03:00",
        end: "2027-11-27T13:00:00+03:00",
      },
      {
        label: "Family lunch",
        start: "2027-11-27T13:30:00+03:00",
        end: "2027-11-27T16:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-11-27T10:00:00+03:00",
    end: "2027-11-27T16:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Kenya High School Hall",
    address: "Kenya High School, Kileleshwa, Nairobi, Kenya",
    lat: -1.2735,
    lng: 36.79,
    notes: "Enter through the main gate; parking on the lower field.",
  },
  theme: {
    paletteId: "chalkboard",
    fontPairId: "dancing-lora",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "sticker", stamp: false },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "School's out, come celebrate",
    coverButtonLabel: "Open invitation",
    headline: "Class of 2027",
    message:
      "Faith has finished her final exams and is leaving the classroom behind. Join us for the ceremony and lunch afterwards.",
    dressCode: "Smart casual",
    rsvpPrompt: "Let us know if you can join us for lunch.",
    rsvpDeadline: "2027-11-13T23:59:00+03:00",
    closing: "Thank you for every lesson along the way.",
    footerNote: "Faith Chebet · Class of 2027",
  },
  gallery: [
    photo("chalkboard-1", "First day in Form One"),
    photo("chalkboard-2", "Chemistry lab, goggles on"),
    photo("chalkboard-3", "Choir at the music festival"),
    photo("chalkboard-4", "Science fair project board"),
    photo("chalkboard-5", "Prefects on the quad"),
    photo("chalkboard-6", "Last day in the classroom"),
  ],
  story: [
    {
      date: "2024",
      title: "Form One",
      body: "A new blazer two sizes too big and a seat at the front of the class.",
    },
    {
      date: "2025",
      title: "Science fair",
      body: "A solar water heater built from bottles took first place in the county.",
    },
    {
      date: "2026",
      title: "Head of the choir",
      body: "Led the school to the national music festival finals.",
    },
    {
      date: "2027",
      title: "Finals",
      body: "Pens down, board wiped clean, the next chapter waiting.",
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
    title: "Faith graduates · 27 November 2027",
    description: "Celebrate Faith's graduation from Kenya High School with us.",
  },
})
