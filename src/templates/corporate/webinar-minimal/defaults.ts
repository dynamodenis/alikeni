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
      name: "Nova Labs",
      shortName: "Nova Labs",
      role: "company",
      parentsLine: "Host · payments infrastructure for African businesses",
      photo: photo("webinar-minimal-host", 800, 800, "The Nova Labs logo mark"),
    },
    {
      name: "Achieng Otieno",
      shortName: "Achieng",
      role: "other",
      parentsLine: "Head of Payments, Nova Labs",
      photo: photo("webinar-minimal-achieng", 800, 800, "Achieng Otieno"),
    },
    {
      name: "Musa Kiprotich",
      shortName: "Musa",
      role: "other",
      parentsLine: "Lead Engineer, Mobile Money Integrations",
      photo: photo("webinar-minimal-musa", 800, 800, "Musa Kiprotich"),
    },
  ],
  event: {
    type: "corporate",
    title: "Scaling Payments in East Africa",
    subtitle: "A 60-minute live session with Q&A",
    subEvents: [
      {
        label: "Live session & Q&A",
        start: "2027-06-09T15:00:00+03:00",
        end: "2027-06-09T16:00:00+03:00",
      },
    ],
  },
  datetime: {
    start: "2027-06-09T15:00:00+03:00",
    end: "2027-06-09T16:00:00+03:00",
    timezone: "Africa/Nairobi",
  },
  venue: {
    name: "Online",
    address: "Zoom · link sent after registration",
    notes:
      "The join link and a calendar invite are emailed once you register. A recording follows for everyone who signs up.",
  },
  theme: {
    paletteId: "ocean",
    fontPairId: "geist",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "sticker", stamp: false },
  },
  music: { enabled: false, loop: true },
  texts: {
    coverTitle: "Live webinar",
    coverButtonLabel: "View details",
    headline: "Scaling Payments in East Africa",
    message:
      "How we moved from one market to five: mobile money rails, reconciliation at scale and the lessons we learned the hard way.",
    rsvpPrompt: "Register to receive the join link. Seats are capped at 500.",
    rsvpDeadline: "2027-06-09T12:00:00+03:00",
    closing:
      "Thanks for registering. Bring your questions; we will save time for them.",
    footerNote: "Nova Labs · Live online · 9 June 2027",
  },
  gallery: [],
  story: [],
  gifts: { enabled: false, accounts: [], ewallets: [], registryLinks: [] },
  features: {
    countdown: true,
    rsvp: true,
    wishes: false,
    gallery: false,
    story: false,
    gifts: false,
    calendar: true,
    map: false,
    music: false,
  },
  sectionsOrder: [
    "hero",
    "event",
    "calendar",
    "hosts",
    "countdown",
    "rsvp",
    "closing",
  ],
  seo: {
    title: "Scaling Payments in East Africa · Live webinar, 9 June 2027",
    description:
      "A live webinar from Nova Labs on scaling payments across East Africa.",
  },
})
