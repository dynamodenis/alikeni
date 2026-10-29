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
      name: "Ahmad Fauzi",
      shortName: "Ahmad",
      role: "host",
      parentsLine: "Ayah",
      photo: photo("aqiqah-soft-ahmad", 800, 1000, "Ahmad smiling"),
    },
    {
      name: "Siti Rahma",
      shortName: "Siti",
      role: "host",
      parentsLine: "Ibu",
      photo: photo("aqiqah-soft-siti", 800, 1000, "Siti in a mint hijab"),
    },
    {
      name: "Zahra Aulia",
      shortName: "Zahra",
      role: "baby",
      parentsLine: "Putri dari Ahmad Fauzi & Siti Rahma",
      photo: photo("aqiqah-soft-zahra", 800, 1000, "Baby Zahra sleeping"),
    },
  ],
  event: {
    type: "aqiqah",
    title: "Aqiqah Zahra Aulia",
    subtitle: "Bismillahirrahmanirrahim",
    subEvents: [
      {
        label: "Doa & tasyakuran",
        start: "2027-08-08T10:00:00+07:00",
        end: "2027-08-08T13:00:00+07:00",
      },
    ],
  },
  datetime: {
    start: "2027-08-08T10:00:00+07:00",
    end: "2027-08-08T13:00:00+07:00",
    timezone: "Asia/Jakarta",
  },
  venue: {
    name: "Masjid Al-Ikhlas Hall",
    address: "Jl. Margonda Raya, Depok, Jawa Barat, Indonesia",
    placeName: "Aula Masjid Al-Ikhlas, Depok",
    lat: -6.4025,
    lng: 106.7942,
    notes: "Aula berada di sisi kanan masjid; tersedia tempat parkir.",
  },
  theme: {
    paletteId: "mint-cream",
    fontPairId: "cormorant-lora",
    motionLevel: "full",
    envelope: { liner: "plain", seal: "wax", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-calm" },
    loop: true,
  },
  texts: {
    coverTitle: "Undangan aqiqah",
    coverButtonLabel: "Buka undangan",
    headline: "Zahra Aulia",
    message:
      "Alhamdulillah, dengan penuh syukur kami mengundang Bapak/Ibu/Saudara/i untuk hadir pada syukuran aqiqah putri kami tercinta.",
    dressCode: "Busana muslim · nuansa pastel",
    rsvpPrompt: "Mohon konfirmasi kehadiran sebelum 1 Agustus 2027.",
    rsvpDeadline: "2027-08-01T23:59:00+07:00",
    closing: "Jazakumullah khairan atas doa dan kehadiran Bapak/Ibu/Saudara/i.",
    footerNote: "Keluarga Ahmad Fauzi · Depok · Agustus 2027",
  },
  gallery: [
    photo("aqiqah-soft-1", 1200, 1500, "Tiny hands"),
    photo("aqiqah-soft-2", 1200, 1500, "Zahra in her mother's arms"),
    photo("aqiqah-soft-3", 1200, 1500, "A soft knitted blanket"),
    photo("aqiqah-soft-4", 1200, 1500, "Father and daughter"),
    photo("aqiqah-soft-5", 1200, 1500, "Sleeping peacefully"),
    photo("aqiqah-soft-6", 1200, 1500, "The family together"),
  ],
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
    "hosts",
    "event",
    "countdown",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Aqiqah Zahra Aulia · 8 Agustus 2027",
    description: "Syukuran aqiqah Zahra Aulia di Depok.",
  },
})
