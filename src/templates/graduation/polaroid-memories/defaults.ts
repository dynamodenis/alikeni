import { schema, type PolaroidMemoriesConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/1500`,
  width: 1200,
  height: 1500,
  alt,
})

export const defaults: PolaroidMemoriesConfig = schema.parse({
  graduation: {
    school: "Kenyatta University",
    degree: "Bachelor of Education (Arts)",
    classOf: 2027,
  },
  hosts: [
    {
      name: "Wanjiru Kamau",
      shortName: "Wanjiru",
      role: "graduate",
      parentsLine: "With love from the Kamau family",
      photo: photo("polaroid-memories-wanjiru", "Wanjiru in cap and gown"),
    },
  ],
  event: {
    type: "graduation",
    title: "Wanjiru's Graduation",
    subtitle: "Four years, a thousand photos, one teacher",
    subEvents: [
      {
        label: "Graduation ceremony",
        start: "2027-07-23T10:00:00+03:00",
        end: "2027-07-23T12:30:00+03:00",
        venueRef: "Kenyatta University Graduation Square",
      },
      {
        label: "Photos at the square",
        start: "2027-07-23T12:30:00+03:00",
        end: "2027-07-23T13:30:00+03:00",
      },
      {
        label: "Lunch at home",
        start: "2027-07-23T15:00:00+03:00",
        end: "2027-07-23T18:00:00+03:00",
        venueRef: "Kamau Residence, Ruiru",
      },
    ],
  },
  datetime: {
    start: "2027-07-23T10:00:00+03:00",
    end: "2027-07-23T18:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Kenyatta University Graduation Square",
    address: "Thika Road, Kahawa, Nairobi, Kenya",
    lat: -1.18,
    lng: 36.93,
    notes:
      "Bring your camera; the square is open for photos after the ceremony.",
  },
  theme: {
    paletteId: "peach-sorbet",
    fontPairId: "josefin-quicksand",
    motionLevel: "full",
    envelope: { liner: "confetti", seal: "sticker", stamp: false },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "Say cheese! You are invited to",
    coverButtonLabel: "Open invitation",
    headline: "Class of 2027",
    message:
      "Wanjiru has spent four years learning how to teach, and a few more learning how to pose. Join us as she graduates, then stay for lunch and a photo on the wall.",
    dressCode: "Bright colours · bring a smile",
    rsvpPrompt: "Let us know if you can make it, so we save you a frame.",
    rsvpDeadline: "2027-07-09T23:59:00+03:00",
    closing: "Thank you for being in so many of our pictures.",
    footerNote: "Wanjiru Kamau · B.Ed (Arts) 2027",
  },
  gallery: [
    photo("polaroid-memories-1", "Freshers' week, the first selfie"),
    photo("polaroid-memories-2", "Teaching practice, first day in class"),
    photo("polaroid-memories-3", "Library all-nighter"),
    photo("polaroid-memories-4", "Drama club closing night"),
    photo("polaroid-memories-5", "Road trip to Naivasha"),
    photo("polaroid-memories-6", "Last lecture, last row"),
  ],
  story: [
    {
      date: "2023",
      title: "First snapshot",
      body: "Freshers' week: a borrowed camera and a hostel room full of new friends.",
    },
    {
      date: "2025",
      title: "Teaching practice",
      body: "Thirty-eight pupils in Form Two and the day one of them called her 'Madam'.",
    },
    {
      date: "2026",
      title: "Drama club",
      body: "Directed the end-of-year play. Nobody forgot their lines, mostly.",
    },
    {
      date: "2027",
      title: "Last lecture",
      body: "A photo from the back row, and then it was done.",
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
    title: "Wanjiru graduates · 23 July 2027",
    description:
      "Celebrate Wanjiru Kamau's graduation and add a photo to the wall.",
  },
})
