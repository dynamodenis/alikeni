import { schema, type GoldenYearsConfig } from "./schema"

const photo = (seed: string, w: number, h: number, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  width: w,
  height: h,
  alt,
})

export const defaults: GoldenYearsConfig = schema.parse({
  years: 50,
  hosts: [
    {
      name: "Grace Mwangi",
      shortName: "Grace",
      role: "host",
      photo: photo("golden-years-grace", 800, 800, "Grace smiling in gold"),
    },
    {
      name: "Joseph Mwangi",
      shortName: "Joseph",
      role: "host",
      photo: photo("golden-years-joseph", 800, 800, "Joseph in a dark suit"),
    },
  ],
  event: {
    type: "anniversary",
    title: "Grace & Joseph's Golden Anniversary",
    subtitle: "Fifty years of marriage",
    subEvents: [
      {
        label: "Renewal of vows",
        start: "2027-06-19T17:00:00+03:00",
        end: "2027-06-19T18:00:00+03:00",
      },
      {
        label: "Golden dinner",
        start: "2027-06-19T19:00:00+03:00",
        end: "2027-06-19T23:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-06-19T17:00:00+03:00",
    end: "2027-06-19T23:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Windsor Golf Hotel Gardens",
    address: "Kigwa Road, Ridgeways, Nairobi, Kenya",
    placeName: "Windsor Golf Hotel & Country Club",
    lat: -1.205,
    lng: 36.85,
    notes:
      "Parking at the clubhouse; the gardens are signposted from reception.",
  },
  theme: {
    paletteId: "ivory-gold",
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
    coverTitle: "Fifty golden years",
    coverButtonLabel: "Open invitation",
    headline: "Grace & Joseph",
    message:
      "Fifty years ago we said yes in a small chapel in Nyeri. Join our children, grandchildren and friends as we give thanks and renew our vows.",
    dressCode: "Formal · a touch of gold",
    rsvpPrompt:
      "Kindly let us know by the first of June so we can set your place.",
    rsvpDeadline: "2027-06-01T23:59:00+03:00",
    closing:
      "Your love and friendship are woven through every one of these years.",
    footerNote: "Grace & Joseph Mwangi · 1977 – 2027",
  },
  gallery: [
    photo("golden-years1", 1200, 1500, "The wedding portrait from 1977"),
    photo("golden-years2", 1200, 900, "Their first home in Nyeri"),
    photo("golden-years3", 1200, 1500, "With the children at the coast"),
    photo("golden-years4", 1200, 900, "The silver anniversary dinner"),
    photo("golden-years5", 1200, 1500, "Dancing at a grandchild's wedding"),
    photo("golden-years6", 1200, 900, "Tea on the veranda last year"),
  ],
  story: [
    {
      date: "1977",
      title: "The wedding",
      body: "A small chapel in Nyeri, borrowed shoes and a cake baked by three aunts.",
    },
    {
      date: "1980s",
      title: "A full house",
      body: "Four children, one Peugeot 504 and Sunday lunches that never ended.",
    },
    {
      date: "1990s",
      title: "Building together",
      body: "The family shop on Moi Avenue and the house in Ridgeways that became home.",
    },
    {
      date: "2000s",
      title: "Grandchildren",
      body: "The first of nine grandchildren arrived, and Joseph learned to braid hair.",
    },
    {
      date: "2010s",
      title: "Slowing down",
      body: "Retirement, a garden of roses and long walks around the golf course.",
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
    title: "Grace & Joseph · 50 years · 19 June 2027",
    description:
      "Celebrate fifty golden years with Grace and Joseph Mwangi at Windsor Golf Hotel Gardens, Nairobi.",
  },
})
