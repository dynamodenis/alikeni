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
      name: "Faith Mutua",
      shortName: "Faith",
      role: "host",
      parentsLine: "Guessing pink",
      photo: photo(
        "gender-reveal-faith",
        800,
        1000,
        "Faith holding a pink balloon"
      ),
    },
    {
      name: "Kevin Mutua",
      shortName: "Kevin",
      role: "host",
      parentsLine: "Guessing blue",
      photo: photo(
        "gender-reveal-kevin",
        800,
        1000,
        "Kevin holding a blue balloon"
      ),
    },
  ],
  event: {
    type: "baby_shower",
    title: "Faith & Kevin's Gender Reveal",
    subtitle: "Faith & Kevin can't keep the secret much longer",
    subEvents: [
      {
        label: "Snacks & casting your vote",
        start: "2027-04-10T15:00:00+03:00",
        end: "2027-04-10T16:30:00+03:00",
      },
      {
        label: "The big reveal",
        start: "2027-04-10T16:30:00+03:00",
        end: "2027-04-10T17:00:00+03:00",
      },
      {
        label: "Cake & celebration",
        start: "2027-04-10T17:00:00+03:00",
        end: "2027-04-10T19:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-04-10T15:00:00+03:00",
    end: "2027-04-10T19:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Paradise Lost Gardens",
    address: "Paradise Lost Road, Kiambu, Kenya",
    placeName: "Paradise Lost",
    lat: -1.2,
    lng: 36.83,
    notes: "Follow the pink and blue balloons from the car park to the lawn.",
  },
  theme: {
    paletteId: "reveal",
    fontPairId: "bricolage-manrope",
    motionLevel: "full",
    envelope: { liner: "confetti", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "Pink or blue? Find out with",
    coverButtonLabel: "Open the surprise",
    headline: "Boy or girl?",
    message:
      "We can barely keep the secret! Come cast your vote, wear your team colour and be there the moment the confetti tells us whether it's a boy or a girl.",
    dressCode: "Team pink or team blue: wear your guess",
    rsvpPrompt: "Tell us by the twenty-seventh of March, and pick your team.",
    rsvpDeadline: "2027-03-27T23:59:00+03:00",
    closing:
      "Pink or blue, this little one is already so loved. Thank you for sharing the surprise with us.",
    footerNote: "Faith & Kevin · Kiambu · April 2027",
  },
  gallery: [
    photo("gender-reveal-1", 1200, 1500, "The scan with the secret envelope"),
    photo(
      "gender-reveal-2",
      1200,
      1500,
      "Pink and blue balloons in the garden"
    ),
    photo("gender-reveal-3", 1200, 1500, "Bump at eighteen weeks"),
    photo("gender-reveal-4", 1200, 1500, "Two tiny pairs of shoes"),
    photo("gender-reveal-5", 1200, 1500, "Faith and Kevin guessing"),
    photo("gender-reveal-6", 1200, 1500, "A cake hiding the answer"),
  ],
  story: [],
  gifts: { enabled: false, accounts: [], ewallets: [], registryLinks: [] },
  features: {
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: false,
    gifts: false,
    calendar: true,
    map: true,
    music: true,
  },
  sectionsOrder: [
    "hero",
    "countdown",
    "event",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Faith & Kevin's Gender Reveal · 10 April 2027",
    description:
      "Pink or blue? Join Faith & Kevin for the big reveal in Kiambu.",
  },
})
