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
      name: "Wanjiru Kariuki",
      shortName: "Wanjiru",
      role: "host",
      parentsLine: "Mum-to-be",
      photo: photo(
        "cloud-nine-wanjiru",
        800,
        1000,
        "Wanjiru smiling in a sky-blue dress"
      ),
    },
    {
      name: "Peter Kariuki",
      shortName: "Peter",
      role: "host",
      parentsLine: "Dad-to-be",
      photo: photo("cloud-nine-peter", 800, 1000, "Peter laughing outdoors"),
    },
    {
      name: "Baby Amani",
      shortName: "Amani",
      role: "baby",
      parentsLine: "Arriving spring 2027",
    },
  ],
  event: {
    type: "baby_shower",
    title: "Baby Amani's Shower",
    subtitle: "Wanjiru & Peter are on cloud nine",
    subEvents: [
      {
        label: "Welcome & cloud-shaped treats",
        start: "2027-03-06T14:00:00+03:00",
        end: "2027-03-06T15:00:00+03:00",
      },
      {
        label: "Games & gift opening",
        start: "2027-03-06T15:00:00+03:00",
        end: "2027-03-06T17:30:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-03-06T14:00:00+03:00",
    end: "2027-03-06T17:30:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Tamarind Garden Room",
    address: "Langata Road, Nairobi, Kenya",
    placeName: "Tamarind Garden Room",
    lat: -1.2667,
    lng: 36.8,
    notes: "Free parking on site. The garden room is step-free.",
  },
  theme: {
    paletteId: "cloud-nine",
    fontPairId: "josefin-quicksand",
    motionLevel: "full",
    envelope: { liner: "dots", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "A baby shower for",
    coverButtonLabel: "Float inside",
    headline: "Baby Amani",
    message:
      "We are floating on cloud nine! Join us for an afternoon of soft cakes, silly games and big hugs as we get ready to welcome our little one.",
    dressCode: "Sky blues, cloud whites and anything comfy",
    rsvpPrompt:
      "Let us know by the twentieth of February so we save you a cupcake.",
    rsvpDeadline: "2027-02-20T23:59:00+03:00",
    closing:
      "Thank you for floating along with us. Baby Amani is already loved so much.",
    footerNote: "Wanjiru & Peter · Nairobi · March 2027",
  },
  gallery: [
    photo("cloud-nine-1", 1200, 1500, "A first glimpse on the scan"),
    photo("cloud-nine-2", 1200, 1500, "Bump at twenty weeks"),
    photo("cloud-nine-3", 1200, 1500, "Painting the nursery sky blue"),
    photo("cloud-nine-4", 1200, 1500, "Tiny socks on a clothesline"),
    photo("cloud-nine-5", 1200, 1500, "Peter reading to the bump"),
    photo("cloud-nine-6", 1200, 1500, "Clouds over the garden"),
  ],
  story: [],
  gifts: {
    enabled: true,
    accounts: [],
    ewallets: [],
    registryLinks: [
      {
        label: "Baby Amani's registry",
        url: "https://example.com/registry/amani",
      },
      {
        label: "Nappy fund",
        url: "https://example.com/registry/amani-nappies",
      },
    ],
  },
  features: {
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: false,
    gifts: true,
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
    "gifts",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Baby Amani's Shower · 6 March 2027",
    description:
      "Wanjiru & Peter invite you to a cloud nine baby shower in Nairobi.",
  },
})
