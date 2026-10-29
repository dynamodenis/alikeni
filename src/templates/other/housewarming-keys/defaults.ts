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
      name: "Joy Kamau",
      shortName: "Joy",
      role: "host",
      photo: photo("housewarming-keys-joy", 800, 1000, "Joy holding new keys"),
    },
    {
      name: "Martin Kamau",
      shortName: "Martin",
      role: "host",
      photo: photo("housewarming-keys-martin", 800, 1000, "Martin at the door"),
    },
  ],
  event: {
    type: "other",
    title: "Our New Home",
    subtitle: "Come and see what the keys open",
    subEvents: [
      {
        label: "Open house",
        start: "2027-02-20T14:00:00+03:00",
        end: "2027-02-20T19:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-02-20T14:00:00+03:00",
    end: "2027-02-20T19:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "12 Jacaranda Close",
    address: "12 Jacaranda Close, Runda, Nairobi, Kenya",
    placeName: "12 Jacaranda Close, Runda",
    lat: -1.213,
    lng: 36.814,
    notes: "Blue gate at the end of the close. Park along the hedge.",
  },
  theme: {
    paletteId: "peach-sorbet",
    fontPairId: "fraunces-dm-sans",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "We got the keys",
    coverButtonLabel: "Come on in",
    headline: "Joy & Martin's new home",
    message:
      "After months of boxes and paint swatches, the door is finally ours. Come for food, a tour and a toast to new beginnings.",
    dressCode: "Casual · comfy shoes for the garden",
    rsvpPrompt: "Tell us by the thirteenth so we know how many plates to set.",
    rsvpDeadline: "2027-02-13T23:59:00+03:00",
    closing: "The kettle is always on. See you at our door.",
    footerNote: "Joy & Martin · Runda · February 2027",
  },
  gallery: [
    photo("housewarming-keys-1", 1200, 1500, "The empty living room"),
    photo("housewarming-keys-2", 1200, 1500, "Paint tins in the hallway"),
    photo("housewarming-keys-3", 1200, 1500, "The overgrown garden"),
    photo("housewarming-keys-4", 1200, 1500, "Boxes stacked to the ceiling"),
    photo("housewarming-keys-5", 1200, 1500, "The kitchen before"),
    photo("housewarming-keys-6", 1200, 1500, "Keys on the doorstep"),
  ],
  gifts: {
    enabled: true,
    accounts: [],
    ewallets: [],
    registryLinks: [
      { label: "Home registry", url: "https://example.com/registry" },
      { label: "Garden wishlist", url: "https://example.com/garden" },
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
    "event",
    "map",
    "countdown",
    "gallery",
    "rsvp",
    "wishes",
    "gifts",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Joy & Martin's housewarming · 20 February 2027",
    description: "Come and celebrate our new home in Runda, Nairobi.",
  },
})
