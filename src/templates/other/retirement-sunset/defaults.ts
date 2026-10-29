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
      name: "Dr. James Mwangi",
      shortName: "James",
      role: "celebrant",
      parentsLine: "Consultant physician, Kenyatta National Hospital",
      photo: photo("retirement-sunset-james", 800, 1000, "Dr. James Mwangi"),
    },
  ],
  event: {
    type: "other",
    title: "35 Years at Kenyatta Hospital",
    subtitle: "A retirement celebration for Dr. James Mwangi",
    subEvents: [
      {
        label: "Sundowner drinks",
        start: "2027-05-28T17:00:00+03:00",
        end: "2027-05-28T18:30:00+03:00",
      },
      {
        label: "Tributes & dinner",
        start: "2027-05-28T18:30:00+03:00",
        end: "2027-05-28T22:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-05-28T17:00:00+03:00",
    end: "2027-05-28T22:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Muthaiga Country Club Lawn",
    address: "Muthaiga Road, Nairobi, Kenya",
    placeName: "Muthaiga Country Club",
    lat: -1.25,
    lng: 36.83,
    notes: "Guest parking at the main clubhouse; follow the signs to the lawn.",
  },
  theme: {
    paletteId: "terracotta",
    fontPairId: "playfair-inter",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "A farewell celebration for",
    coverButtonLabel: "Open invitation",
    headline: "Dr. James Mwangi",
    message:
      "After thirty-five years of rounds, residents and rescued evenings, James is hanging up his stethoscope. Join us as the sun sets on a remarkable career.",
    dressCode: "Smart casual · warm tones welcome",
    rsvpPrompt:
      "Kindly let us know by the fifteenth of May so we can save you a seat.",
    rsvpDeadline: "2027-05-15T23:59:00+03:00",
    closing:
      "Thank you for every shift, every lesson and every kindness. The next chapter starts at sunset.",
    footerNote: "Dr. James Mwangi · Nairobi · May 2027",
  },
  gallery: [
    photo("retirement-sunset1", 1200, 1500, "James on his first ward round"),
    photo("retirement-sunset2", 1200, 1500, "The cardiology team, 2005"),
    photo("retirement-sunset3", 1200, 1500, "Teaching a class of residents"),
    photo("retirement-sunset4", 1200, 1500, "Opening the new wing"),
    photo("retirement-sunset5", 1200, 1500, "Tea in the doctors' lounge"),
    photo("retirement-sunset6", 1200, 1500, "Sunset over the hospital"),
  ],
  story: [
    {
      date: "1992",
      title: "First day",
      body: "Joined Kenyatta as a junior house officer with one white coat and a borrowed stethoscope.",
    },
    {
      date: "2001",
      title: "Consultant",
      body: "Appointed consultant physician and started the hospital's first heart-failure clinic.",
    },
    {
      date: "2010",
      title: "Teacher",
      body: "Trained more than four hundred residents, many of whom now run wards of their own.",
    },
    {
      date: "2018",
      title: "The new wing",
      body: "Led the team that opened the cardiac care unit, now serving patients from across the region.",
    },
    {
      date: "2027",
      title: "Golden hour",
      body: "Thirty-five years, one last round, and a well-earned sunset.",
    },
  ],
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
    "countdown",
    "event",
    "story",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Dr. James Mwangi · Retirement · 28 May 2027",
    description:
      "Celebrate thirty-five years of Dr. James Mwangi at Kenyatta Hospital.",
  },
})
