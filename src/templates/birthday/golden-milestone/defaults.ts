import { schema, type GoldenMilestoneConfig } from "./schema"

const photo = (seed: string, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/1200/900`,
  width: 1200,
  height: 900,
  alt,
})

export const defaults: GoldenMilestoneConfig = schema.parse({
  age: 60,
  hosts: [
    {
      name: "Margaret Wambui",
      shortName: "Margaret",
      role: "celebrant",
      parentsLine: "Hosted by her children",
      photo: photo("golden-milestone-margaret", "Margaret in a gold dress"),
    },
  ],
  event: {
    type: "birthday",
    title: "Margaret turns sixty",
    subtitle: "Her children invite you",
    subEvents: [
      {
        label: "Cocktails on the terrace",
        start: "2027-09-25T18:30:00+03:00",
        end: "2027-09-25T19:30:00+03:00",
      },
      {
        label: "Dinner & toasts",
        start: "2027-09-25T19:30:00+03:00",
        end: "2027-09-25T21:30:00+03:00",
      },
      {
        label: "Dancing",
        start: "2027-09-25T21:30:00+03:00",
        end: "2027-09-25T23:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-09-25T18:30:00+03:00",
    end: "2027-09-25T23:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Safari Park Hotel Ballroom",
    address: "Thika Road, Nairobi, Kenya",
    lat: -1.2211,
    lng: 36.8903,
    notes:
      "Valet parking at the main entrance; the ballroom is signposted from the lobby.",
  },
  theme: {
    paletteId: "navy-gold",
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
    coverTitle: "You are warmly invited to celebrate",
    coverButtonLabel: "Open the invitation",
    headline: "Sixty Golden Years",
    message:
      "Six decades of grace, generosity and the best chapati in Nairobi. Join us for an evening of dinner, toasts and dancing in honour of our mother.",
    dressCode: "Black tie · touches of gold",
    rsvpPrompt: "Kindly confirm by 11 September so we can seat you with care.",
    rsvpDeadline: "2027-09-11T23:59:00+03:00",
    closing:
      "Thank you for being part of her story. We look forward to raising a glass with you.",
    footerNote: "Your presence is the only gift she asks for.",
  },
  gallery: [
    photo("golden-milestone-1", "Margaret as a young nurse"),
    photo("golden-milestone-2", "The family at Christmas"),
    photo("golden-milestone-3", "Margaret laughing at her 50th"),
    photo("golden-milestone-4", "Grandchildren on her lap"),
    photo("golden-milestone-5", "Margaret in her garden"),
    photo("golden-milestone-6", "Dancing at a wedding"),
  ],
  story: [
    {
      date: "1967",
      title: "A girl from Nyeri",
      body: "Born at the foot of the Aberdares, the fourth of seven, already in charge of everyone.",
    },
    {
      date: "1979",
      title: "Top of the class",
      body: "First in her school to board the bus to Nairobi for secondary school. She never looked back.",
    },
    {
      date: "1989",
      title: "A nurse in the city",
      body: "Qualified at Kenyatta National Hospital and started the night shifts she still talks about.",
    },
    {
      date: "1994",
      title: "A family begins",
      body: "Married Peter, bought the house in Kasarani and filled it with three children and a dog.",
    },
    {
      date: "2010",
      title: "Matron of the ward",
      body: "Promoted to matron; the ward got stricter, the staff tea got better.",
    },
    {
      date: "2027",
      title: "Sixty & shining",
      body: "Retired, gardening, still correcting our grammar. This evening is for her.",
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
    title: "Margaret turns 60 · 25 September 2027",
    description:
      "Her children invite you to a black-tie dinner celebrating sixty golden years.",
  },
})
