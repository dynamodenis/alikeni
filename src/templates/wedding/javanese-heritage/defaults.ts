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
  locale: "id",
  hosts: [
    {
      name: "Dewi Lestari",
      shortName: "Dewi",
      role: "bride",
      parentsLine: "Putri dari Bapak Sutrisno & Ibu Rahayu Lestari",
      photo: photo("javanese-dewi", 800, 1000, "Dewi in a sogan batik kebaya"),
    },
    {
      name: "Bagus Prasetyo",
      shortName: "Bagus",
      role: "groom",
      parentsLine: "Putra dari Bapak Hartono & Ibu Sri Prasetyo",
      photo: photo(
        "javanese-bagus",
        800,
        1000,
        "Bagus in a beskap and blangkon"
      ),
    },
  ],
  event: {
    type: "wedding",
    title: "Pernikahan Dewi & Bagus",
    subtitle: "Bismillahirrahmanirrahim",
    subEvents: [
      {
        label: "Akad Nikah",
        start: "2027-07-10T08:00:00+07:00",
        end: "2027-07-10T10:00:00+07:00",
      },
      {
        label: "Resepsi",
        start: "2027-07-10T11:00:00+07:00",
        end: "2027-07-10T14:00:00+07:00",
      },
    ],
  },
  datetime: {
    start: "2027-07-10T08:00:00+07:00",
    end: "2027-07-10T14:00:00+07:00",
    timezone: "Asia/Jakarta",
  },
  venue: {
    name: "Pendopo Agung Royal Ambarrukmo",
    address: "Jl. Laksda Adisucipto No. 81, Yogyakarta 55281, Indonesia",
    placeName: "Pendopo Agung Royal Ambarrukmo",
    lat: -7.7828,
    lng: 110.4019,
    notes: "Parkir tersedia di area hotel. Mohon hadir 15 menit sebelum akad.",
  },
  theme: {
    paletteId: "sogan-batik",
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
    coverTitle: "Undangan pernikahan",
    coverButtonLabel: "Buka undangan",
    headline: "Dewi & Bagus",
    message:
      "Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami. Merupakan suatu kehormatan apabila Bapak/Ibu/Saudara/i berkenan hadir.",
    dressCode: "Batik atau busana adat · warna sogan dan krem",
    rsvpPrompt: "Mohon konfirmasi kehadiran Anda sebelum tanggal 20 Juni 2027.",
    rsvpDeadline: "2027-06-20T23:59:00+07:00",
    closing:
      "Atas kehadiran dan doa restu Bapak/Ibu/Saudara/i, kami mengucapkan terima kasih. Wassalamu'alaikum warahmatullahi wabarakatuh.",
    footerNote: "Dewi & Bagus · Yogyakarta · Juli 2027",
  },
  gallery: [
    photo("javanese1", 1200, 1500, "Hands exchanging rings over batik cloth"),
    photo("javanese2", 1200, 1500, "Walking through the pendopo at dawn"),
    photo("javanese3", 1200, 1500, "A siraman ceremony with jasmine"),
    photo("javanese4", 1200, 1500, "Laughing in the Taman Sari courtyard"),
    photo("javanese5", 1200, 1500, "Kawung batik laid out for the day"),
    photo("javanese6", 1200, 1500, "The lamaran, both families together"),
  ],
  story: [
    {
      date: "2020",
      title: "Pertama bertemu",
      body: "Di sebuah pameran batik di Kotagede; ia bertanya tentang motif kawung, dan percakapan itu tidak pernah selesai.",
    },
    {
      date: "2023",
      title: "Menyusuri Malioboro",
      body: "Malam-malam panjang, wedang ronde, dan janji untuk kembali setiap tahun.",
    },
    {
      date: "2026",
      title: "Lamaran",
      body: "Kedua keluarga bertemu di Yogyakarta; tanggal pun ditetapkan dengan penuh syukur.",
    },
  ],
  gifts: {
    enabled: true,
    accounts: [{ bank: "BCA", holder: "Dewi Lestari", number: "4561234567" }],
    ewallets: [
      { provider: "GoPay", holder: "Bagus Prasetyo", number: "0812 3456 7890" },
    ],
    registryLinks: [],
  },
  features: {
    countdown: true,
    rsvp: true,
    wishes: true,
    gallery: true,
    story: true,
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
    "story",
    "gallery",
    "map",
    "rsvp",
    "wishes",
    "gifts",
    "calendar",
    "closing",
  ],
  seo: {
    title: "Dewi & Bagus · 10 Juli 2027",
    description:
      "Undangan pernikahan Dewi Lestari & Bagus Prasetyo di Pendopo Agung Royal Ambarrukmo, Yogyakarta.",
  },
})
