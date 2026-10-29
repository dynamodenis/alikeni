import { schema, type VinylLoveSongConfig } from "./schema"

const photo = (seed: string, w: number, h: number, alt: string) => ({
  assetKey: `samples/${seed}.jpg`,
  url: `https://picsum.photos/seed/${seed}/${w}/${h}`,
  width: w,
  height: h,
  alt,
})

export const defaults: VinylLoveSongConfig = schema.parse({
  years: 20,
  hosts: [
    {
      name: "Nina Asante",
      shortName: "Nina",
      role: "host",
      photo: photo("vinyl-love-song-nina", 800, 800, "Nina with headphones"),
    },
    {
      name: "Kofi Asante",
      shortName: "Kofi",
      role: "host",
      photo: photo("vinyl-love-song-kofi", 800, 800, "Kofi behind the decks"),
    },
  ],
  event: {
    type: "anniversary",
    title: "Nina & Kofi · Twenty Years",
    subtitle: "Our song, on repeat for two decades",
    subEvents: [
      {
        label: "Side A · Drinks & the first spin",
        start: "2027-09-11T20:00:00+03:00",
        end: "2027-09-11T21:00:00+03:00",
      },
      {
        label: "Side B · Dinner & toasts",
        start: "2027-09-11T21:00:00+03:00",
        end: "2027-09-11T22:30:00+03:00",
      },
      {
        label: "Bonus track · Dance floor",
        start: "2027-09-11T22:30:00+03:00",
        end: "2027-09-12T01:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-09-11T20:00:00+03:00",
    end: "2027-09-12T01:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "The Vinyl Room, Kilimani",
    address: "Argwings Kodhek Road, Kilimani, Nairobi, Kenya",
    placeName: "The Vinyl Room",
    lat: -1.293,
    lng: 36.787,
    notes: "Bring a record that reminds you of us; the DJ will take requests.",
  },
  theme: {
    paletteId: "charcoal-copper",
    fontPairId: "bricolage-manrope",
    motionLevel: "full",
    envelope: { liner: "stripes", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "Now playing",
    coverButtonLabel: "Drop the needle",
    headline: "Nina & Kofi",
    message:
      "Twenty years ago a record shop in Accra played the right song at the right time. Come dance with us to the soundtrack of two decades.",
    dressCode: "Retro glam · copper, black or anything that shines",
    rsvpPrompt: "Save your seat by the first of September.",
    rsvpDeadline: "2027-09-01T23:59:00+03:00",
    closing: "Thanks for being on every track. Play it loud.",
    footerNote: "Nina & Kofi Asante · 2007 – 2027",
  },
  gallery: [
    photo("vinyl-love-song1", 1200, 1200, "The record shop in Accra"),
    photo("vinyl-love-song2", 1200, 1500, "Our wedding first dance"),
    photo("vinyl-love-song3", 1200, 900, "A crate of favourite records"),
    photo("vinyl-love-song4", 1200, 1500, "Festival weekend in Naivasha"),
    photo("vinyl-love-song5", 1200, 900, "Kofi spinning at a house party"),
    photo("vinyl-love-song6", 1200, 1200, "Dancing in the kitchen"),
  ],
  story: [
    {
      date: "2007",
      title: "Track 1 · The record shop",
      body: "Both reaching for the same Fela LP in a shop in Osu. Kofi let Nina have it, then asked for it back on a date.",
    },
    {
      date: "2009",
      title: "Track 2 · Our song",
      body: "A first dance to Miriam Makeba, played on a borrowed turntable at a garden wedding.",
    },
    {
      date: "2015",
      title: "Track 3 · Moving to Nairobi",
      body: "Three hundred records, two suitcases and one very nervous cat.",
    },
    {
      date: "2027",
      title: "Track 4 · Twenty years",
      body: "Still arguing over who owns the Fela record.",
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
    title: "Nina & Kofi · 20 years · 11 September 2027",
    description:
      "Dance with Nina and Kofi Asante to twenty years of their song at The Vinyl Room, Kilimani.",
  },
})
