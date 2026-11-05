import type { Messages } from "./en"

/**
 * Indonesian strings for the shared invitation blocks, in the formal "Anda"
 * register invitations use.
 */
export const id: Messages = {
  common: {
    previewMode: "Mode pratinjau",
    oneMoment: "Mohon tunggu sebentar",
    robotCheck:
      "Kami sedang memastikan Anda bukan robot. Silakan coba lagi sesaat lagi.",
    tryAgain: "Silakan coba lagi.",
    optional: "(opsional)",
    sending: "Mengirim…",
    opensInNewTab: "(terbuka di tab baru)",
  },
  cover: {
    dear: "Kepada Yth.",
    open: "Buka undangan",
  },
  hosts: {
    bride: "Mempelai Wanita",
    groom: "Mempelai Pria",
    host: "Tuan Rumah",
    graduate: "Sang Wisudawan",
    celebrant: "Yang Berbahagia",
    baby: "Si Kecil",
    company: "Diselenggarakan oleh",
    other: "",
  },
  countdown: {
    eyebrow: "Menghitung hari",
    done: "Hari bahagia telah tiba",
    days: "hari",
    hours: "jam",
    minutes: "menit",
    seconds: "detik",
    daysToGo: (days: number) => `${days} hari lagi.`,
    starts: (date: string) => `Dimulai ${date}.`,
  },
  event: {
    eyebrow: "Detail acara",
    date: "Tanggal",
    time: "Waktu",
    venue: "Tempat",
    dressCode: "Busana:",
    dressInspiration: "Inspirasi busana",
  },
  map: {
    eyebrow: "Lokasi",
    directions: "Petunjuk arah",
    directionsWith: (app: string) => `Petunjuk arah dengan ${app}`,
  },
  story: {
    eyebrow: "Kisah kami",
    title: "Perjalanan kami",
  },
  gallery: {
    eyebrow: "Momen",
    title: "Galeri",
    openPhoto: (alt: string) => `Buka foto: ${alt}`,
    openPhotoN: (n: number, count: number) => `Buka foto ${n} dari ${count}`,
    photoN: (n: number, count: number) => `Foto ${n} dari ${count}`,
    help: "Gunakan tombol panah kiri dan kanan untuk berpindah foto. Tekan Escape untuk menutup.",
    previous: "Foto sebelumnya",
    next: "Foto berikutnya",
    close: "Tutup",
  },
  rsvp: {
    eyebrow: "RSVP",
    title: "Kami menantikan kehadiran Anda",
    name: "Nama Anda",
    attending: "Apakah Anda akan hadir?",
    yes: "Dengan senang hati hadir",
    no: "Mohon maaf, tidak dapat hadir",
    maybe: "Belum dapat memastikan",
    partySize: "Jumlah tamu",
    contact: "Telepon atau email",
    note: "Pesan untuk kami",
    send: "Kirim konfirmasi",
    sent: "Terima kasih, konfirmasi Anda telah kami terima.",
    replyBy: (date: string) => `Mohon konfirmasi sebelum ${date}`,
    previewNote: "Pratinjau: konfirmasi tidak disimpan.",
    previewToast: "Konfirmasi kehadiran dinonaktifkan selama pratinjau.",
    thanksToast: "Terima kasih!",
    thanksToastBody: "Konfirmasi Anda telah tercatat.",
    errorToast: "Konfirmasi Anda gagal dikirim",
  },
  wishes: {
    eyebrow: "Ucapan",
    title: "Kirim ucapan & doa",
    name: "Nama Anda",
    message: "Ucapan Anda",
    placeholder: "Tuliskan ucapan dan doa Anda…",
    send: "Kirim ucapan",
    previewNote: "Pratinjau: ucapan tidak disimpan.",
    previewToast: "Ucapan dinonaktifkan selama pratinjau.",
    thanksToast: "Terima kasih atas ucapan dan doa Anda!",
    errorToast: "Ucapan Anda gagal dikirim",
  },
  gifts: {
    eyebrow: "Hadiah",
    title: "Tanda kasih",
    intro:
      "Kehadiran Anda sudah lebih dari cukup. Namun, apabila Anda ingin memberikan tanda kasih, berikut beberapa caranya.",
    open: "Buka amplop",
    copyNumber: "Salin nomor",
    copied: "Tersalin",
    copyFailed: "Gagal menyalin. Silakan salin secara manual.",
    qrAlt: "Kode QR pembayaran",
    qrCaption: "Pindai untuk mengirim hadiah",
  },
  calendar: {
    heading: "Tambahkan ke kalender",
    google: "Google Kalender",
    ics: "Apple / Outlook (.ics)",
  },
  music: {
    play: "Putar musik",
    pause: "Jeda musik",
    playing: "Sedang diputar",
    tapToPlay: "Ketuk untuk memutar",
    music: "Musik",
    nowPlaying: "Sedang diputar",
    tapWidget: "Ketuk ▶ di bawah untuk musik",
    minimize: "Kecilkan dan jeda musik",
    creditPrefix: "Musik:",
    by: "oleh",
    onSoundCloud: "di SoundCloud",
    widgetTitle: (title: string, artist: string) =>
      `${title} oleh ${artist} di SoundCloud`,
  },
  closing: {
    signOff: "Kami yang berbahagia",
    madeWith: "Dibuat dengan",
  },
  share: {
    label: "Bagikan undangan ini",
    share: "Bagikan undangan",
    copy: "Salin tautan",
    copied: "Tautan tersalin",
    copyFailed: "Gagal menyalin tautan",
  },
  ended: {
    title: "Undangan ini telah berakhir",
    body: "Terima kasih telah merayakan bersama kami.",
    host: "Anda tuan rumahnya? Tetap tampilkan halaman ini",
  },
  limits: {
    title: "Mohon tunggu sebentar",
    responses: (n: number) => `${n} konfirmasi kehadiran`,
    wishes: (n: number) => `${n} ucapan`,
    window: (windowSec: number) =>
      windowSec <= 60
        ? "dalam satu menit terakhir"
        : windowSec <= 3600
          ? "dalam satu jam terakhir"
          : "dalam 24 jam terakhir",
    you: (sent: string, window: string, wait: string) =>
      `Anda telah mengirim ${sent} ${window}. Anda dapat mengirim lagi dalam ${wait}.`,
    network: (wait: string) =>
      `Banyak tamu di jaringan Anda sedang mengirim saat ini. Silakan coba lagi dalam ${wait}.`,
  },
}
