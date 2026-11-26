import type { Messages } from "./en"

/**
 * Swahili strings for the shared invitation blocks, in standard (sanifu)
 * Swahili so they read naturally in both Kenya and Tanzania. "Faili" is
 * treated as an N-class noun throughout (faili hii, faili hizi).
 */
export const sw: Messages = {
  common: {
    previewMode: "Hali ya onyesho la kukagua",
    oneMoment: "Tafadhali subiri kidogo",
    robotCheck:
      "Tunahakikisha kuwa wewe si roboti. Jaribu tena baada ya muda mfupi.",
    tryAgain: "Tafadhali jaribu tena.",
    optional: "(si lazima)",
    sending: "Inatuma…",
    opensInNewTab: "(inafunguka katika kichupo kipya)",
  },
  cover: {
    dear: "Mpendwa",
    open: "Fungua mwaliko",
  },
  hosts: {
    bride: "Bibi Harusi",
    groom: "Bwana Harusi",
    host: "Mwenyeji Wako",
    graduate: "Mhitimu",
    celebrant: "Mwenye Sherehe",
    baby: "Mtoto",
    company: "Imeandaliwa na",
    other: "",
  },
  countdown: {
    eyebrow: "Muda uliobaki",
    done: "Siku imefika",
    days: "siku",
    hours: "saa",
    minutes: "dakika",
    seconds: "sekunde",
    daysToGo: (days: number) =>
      days === 1 ? "Imebaki siku 1." : `Zimebaki siku ${days}.`,
    starts: (date: string) => `Inaanza ${date}.`,
  },
  event: {
    eyebrow: "Maelezo ya tukio",
    date: "Tarehe",
    time: "Saa",
    venue: "Mahali",
    dressCode: "Mavazi:",
    dressInspiration: "Mifano ya mavazi",
  },
  map: {
    eyebrow: "Ramani",
    directions: "Maelekezo",
    directionsWith: (app: string) => `Maelekezo kwa ${app}`,
  },
  story: {
    eyebrow: "Hadithi yetu",
    title: "Safari yetu",
  },
  gallery: {
    eyebrow: "Kumbukumbu",
    title: "Picha",
    openPhoto: (alt: string) => `Fungua picha: ${alt}`,
    openPhotoN: (n: number, count: number) =>
      `Fungua picha ${n} kati ya ${count}`,
    photoN: (n: number, count: number) => `Picha ${n} kati ya ${count}`,
    help: "Tumia vitufe vya vishale vya kushoto na kulia kupitia picha. Bonyeza Escape kufunga.",
    previous: "Picha iliyotangulia",
    next: "Picha inayofuata",
    close: "Funga",
  },
  rsvp: {
    eyebrow: "RSVP",
    title: "Utajiunga nasi?",
    name: "Jina lako",
    attending: "Utahudhuria?",
    yes: "Ndiyo, nitahudhuria",
    no: "Hapana, sitaweza kuhudhuria",
    maybe: "Bado sina uhakika",
    partySize: "Idadi ya wageni",
    contact: "Simu au barua pepe",
    note: "Ujumbe kwetu",
    send: "Tuma jibu",
    sent: "Asante, tumepokea jibu lako.",
    hostPrompt: "Unapanga tukio lako mwenyewe?",
    replyBy: (date: string) => `Tafadhali jibu kufikia ${date}`,
    previewNote: "Onyesho la kukagua: majibu hayahifadhiwi.",
    previewToast: "Majibu hayapokelewi wakati wa onyesho la kukagua.",
    thanksToast: "Asante!",
    thanksToastBody: "Jibu lako limehifadhiwa.",
    errorToast: "Imeshindwa kutuma jibu lako",
  },
  wishes: {
    eyebrow: "Heri njema",
    title: "Acha ujumbe",
    name: "Jina lako",
    message: "Ujumbe wako",
    placeholder: "Andika ujumbe wako…",
    send: "Tuma ujumbe",
    previewNote: "Onyesho la kukagua: jumbe hazihifadhiwi.",
    previewToast: "Jumbe hazipokelewi wakati wa onyesho la kukagua.",
    thanksToast: "Asante kwa ujumbe wako!",
    errorToast: "Imeshindwa kutuma ujumbe wako",
  },
  gifts: {
    eyebrow: "Zawadi",
    title: "Zawadi ya upendo",
    intro:
      "Uwepo wako unatosha. Ukipenda kutuma zawadi, hizi ni baadhi ya njia.",
    open: "Fungua bahasha",
    copyNumber: "Nakili namba",
    copied: "Imenakiliwa",
    copyFailed: "Imeshindwa kunakili. Tafadhali nakili mwenyewe.",
    qrAlt: "Msimbo wa QR wa malipo",
    qrCaption: "Changanua ili kutuma zawadi",
  },
  admission: {
    eyebrow: "Kiingilio",
    title: "Tiketi",
    cta: "Pata tiketi",
  },
  sponsors: {
    eyebrow: "Shukrani kwa",
    title: "Wadhamini na washirika",
  },
  calendar: {
    heading: "Ongeza kwenye kalenda",
    google: "Google Calendar",
    ics: "Apple / Outlook (.ics)",
  },
  music: {
    play: "Cheza muziki",
    pause: "Sitisha muziki",
    playing: "Unacheza",
    tapToPlay: "Gusa ili kucheza",
    music: "Muziki",
    nowPlaying: "Unaocheza sasa",
    tapWidget: "Gusa ▶ hapa chini kwa muziki",
    minimize: "Punguza kicheza muziki",
    expand: "Onyesha kicheza muziki cha SoundCloud",
    creditPrefix: "Muziki:",
    by: "na",
    onSoundCloud: "kwenye SoundCloud",
    widgetTitle: (title: string, artist: string) =>
      `${title} na ${artist} kwenye SoundCloud`,
  },
  closing: {
    signOff: "Kwa upendo",
    signOffFormal: "Tunatarajia kuwakaribisha",
    madeWith: "Imetengenezwa na Alikeni – tengeneza wako bila malipo",
    createYours: "Tengeneza mwaliko wako, bila malipo",
    album: "Picha na video za tukio",
  },
  album: {
    eyebrow: "Albamu",
    back: "Rudi kwenye mwaliko",
    count: (n: number) =>
      n === 1 ? "Picha au video 1" : `Picha na video ${n}`,
    empty: "Bado hakuna picha.",
    emptyOpen: "Kuwa wa kwanza kuongeza.",
    loadMore: "Onyesha zaidi",
    loadFailed: "Imeshindwa kupakia albamu. Tafadhali jaribu tena.",
    retry: "Jaribu tena",
    pinTitle: "Albamu hii ni ya faragha",
    pinBody: "Weka PIN uliyopewa na mwenyeji.",
    pinLabel: "PIN",
    pinSubmit: "Fungua albamu",
    add: "Ongeza picha na video",
    choose: "Chagua picha au video",
    folder: "Chagua folda",
    zip: "Pakia faili ya .zip",
    limits:
      "Picha: JPEG, PNG, WebP au AVIF, hadi MB 25 kila moja. Video: MP4, MOV au WebM, hadi MB 95 kila moja. Hadi faili 500 kwa wakati mmoja.",
    reading: (n: number) => `Inasoma faili… ${n} zimepatikana`,
    name: "Jina lako",
    ready: (n: number) =>
      n === 1 ? "Faili 1 iko tayari" : `Faili ${n} ziko tayari`,
    more: (n: number) => `+${n} zaidi`,
    skipped: (n: number) =>
      n === 1 ? "Faili 1 imeachwa" : `Faili ${n} zimeachwa`,
    nothing:
      "Hakuna kati ya faili hizo iliyo picha au video tunayoweza kupokea.",
    approval: (n: number) =>
      `Faili zaidi ya ${n} zikipakiwa kwa pamoja, huonekana baada ya mwenyeji kuziidhinisha.`,
    send: (n: number) => (n === 1 ? "Pakia faili 1" : `Pakia faili ${n}`),
    cancel: "Ghairi",
    uploading: (done: number, total: number) =>
      `Inapakia ${done} kati ya ${total}`,
    keepOpen: "Usifunge ukurasa huu hadi upakiaji ukamilike.",
    done: (n: number) =>
      n === 1
        ? "Faili 1 imeongezwa kwenye albamu"
        : `Faili ${n} zimeongezwa kwenye albamu`,
    sentForApproval: (n: number) =>
      `Faili ${n} zimetumwa. Zitaonekana baada ya mwenyeji kuziidhinisha.`,
    failed: (n: number) =>
      n === 1 ? "Faili 1 haikuweza kupakiwa" : `Faili ${n} hazikuweza kupakiwa`,
    again: "Ongeza zaidi",
    uploadFailed: "Upakiaji haukuweza kuanza",
    notYet: (date: string) =>
      `Wageni wataweza kuongeza picha na video hapa kuanzia ${date}, siku ya tukio.`,
    hostHint:
      "Wewe ndiye mwenyeji wa tukio hili? Unaweza kuongeza picha wakati wowote kutoka kwenye dashibodi yako.",
    hostLink: "Fungua dashibodi yangu",
    preview: (name: string) => `Tazama ${name}`,
    closed: "Upakiaji umefungwa kwa albamu hii.",
    until: (date: string) => `Wageni wanaweza kuongeza picha hadi ${date}.`,
    download: "Pakua",
    downloadAll: "Pakua zote",
    downloadSome: (n: number) => (n === 0 ? "Pakua" : `Pakua ${n}`),
    select: "Chagua",
    selectAll: "Chagua zote",
    selectHint: "Gusa picha na video unazotaka.",
    preparing: (done: number, total: number) =>
      `Inaandaa ${done} kati ya ${total}`,
    missed: (n: number) =>
      n === 1
        ? "Faili 1 haikuweza kupakuliwa"
        : `Faili ${n} hazikuweza kupakuliwa`,
    share: "Shiriki",
    linkCopied: "Kiungo kimenakiliwa",
    video: "Video",
    by: (name: string) => `Imeongezwa na ${name}`,
    open: (n: number, total: number) => `Fungua ${n} kati ya ${total}`,
    previous: "Iliyotangulia",
    next: "Inayofuata",
    close: "Funga",
  },
  share: {
    label: "Shiriki mwaliko huu",
    share: "Shiriki mwaliko",
    copy: "Nakili kiungo",
    copied: "Kiungo kimenakiliwa",
    copyFailed: "Imeshindwa kunakili kiungo",
  },
  ended: {
    title: "Mwaliko huu umekwisha",
    body: "Asante kwa kusherehekea pamoja nasi.",
    host: "Wewe ndiye mwenyeji? Endelea kuweka ukurasa huu mtandaoni",
  },
  limits: {
    title: "Tafadhali subiri kidogo",
    responses: (n: number) => (n === 1 ? "jibu 1" : `majibu ${n}`),
    wishes: (n: number) => (n === 1 ? "ujumbe 1" : `jumbe ${n}`),
    window: (windowSec: number): string =>
      windowSec <= 60
        ? "katika dakika moja iliyopita"
        : windowSec <= 3600
          ? "katika saa moja iliyopita"
          : "katika saa 24 zilizopita",
    you: (sent: string, window: string, wait: string) =>
      `Umetuma ${sent} ${window}. Unaweza kutuma tena baada ya ${wait}.`,
    network: (wait: string) =>
      `Wageni wengi kwenye mtandao wako wanatuma sasa hivi. Tafadhali jaribu tena baada ya ${wait}.`,
  },
}
