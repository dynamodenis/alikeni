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
      name: "Raffi Aditya Pratama",
      shortName: "Raffi",
      role: "celebrant",
      parentsLine: "Putra dari Bapak Hendra Pratama & Ibu Dewi Lestari",
      photo: photo("khitanan-ceria-raffi", 800, 1000, "Raffi tersenyum"),
    },
  ],
  event: {
    type: "khitanan",
    title: "Tasyakuran Khitanan Raffi",
    subtitle: "Dengan memohon rahmat dan ridho Allah SWT",
    subEvents: [
      {
        label: "Pembukaan & doa bersama",
        start: "2027-06-27T09:00:00+07:00",
        end: "2027-06-27T09:45:00+07:00",
      },
      {
        label: "Tausiyah singkat",
        start: "2027-06-27T09:45:00+07:00",
        end: "2027-06-27T10:30:00+07:00",
      },
      {
        label: "Ramah tamah & makan siang",
        start: "2027-06-27T10:30:00+07:00",
        end: "2027-06-27T13:00:00+07:00",
      },
    ],
  },
  datetime: {
    start: "2027-06-27T09:00:00+07:00",
    end: "2027-06-27T13:00:00+07:00",
    timezone: "Asia/Jakarta",
  },
  venue: {
    name: "Kediaman Keluarga Pratama",
    address: "Jl. Cihampelas No. 45, Bandung, Jawa Barat, Indonesia",
    placeName: "Kediaman Keluarga Pratama, Bandung",
    lat: -6.9175,
    lng: 107.6191,
    notes: "Parkir tersedia di halaman masjid sebelah rumah.",
  },
  theme: {
    paletteId: "sunshine",
    fontPairId: "baloo-nunito",
    motionLevel: "full",
    envelope: { liner: "confetti", seal: "sticker", stamp: true },
  },
  music: {
    enabled: true,
    source: { kind: "library", trackId: "sketch-bright" },
    loop: true,
  },
  texts: {
    coverTitle: "Undangan khitanan",
    coverButtonLabel: "Buka undangan",
    headline: "Raffi Aditya Pratama",
    message:
      "Dengan penuh rasa syukur, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada tasyakuran khitanan putra kami.",
    dressCode: "Busana muslim · warna cerah",
    rsvpPrompt: "Mohon konfirmasi kehadiran sebelum 20 Juni 2027.",
    rsvpDeadline: "2027-06-20T23:59:00+07:00",
    closing:
      "Merupakan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir. Terima kasih.",
    footerNote: "Keluarga Pratama · Bandung · Juni 2027",
  },
  gallery: [
    photo("khitanan-ceria-1", 1200, 1500, "Raffi bermain sepeda"),
    photo("khitanan-ceria-2", 1200, 1500, "Raffi bersama kakak"),
    photo("khitanan-ceria-3", 1200, 1500, "Mengaji di masjid"),
    photo("khitanan-ceria-4", 1200, 1500, "Liburan keluarga"),
    photo("khitanan-ceria-5", 1200, 1500, "Tertawa di taman"),
    photo("khitanan-ceria-6", 1200, 1500, "Foto keluarga"),
  ],
  gifts: {
    enabled: true,
    accounts: [{ bank: "BCA", holder: "Hendra Pratama", number: "1234567890" }],
    ewallets: [
      { provider: "GoPay", holder: "Dewi Lestari", number: "0812 3456 7890" },
    ],
    registryLinks: [],
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
    title: "Khitanan Raffi · 27 Juni 2027",
    description: "Tasyakuran khitanan Raffi Aditya Pratama di Bandung.",
  },
})
