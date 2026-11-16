/**
 * English strings for the shared invitation blocks. This object defines the
 * shape (`Messages`); every other locale must provide the same keys.
 * Template-specific eyebrows and titles stay with the template.
 */
export const en = {
  common: {
    previewMode: "Preview mode",
    oneMoment: "One moment",
    robotCheck: "We are checking you are not a robot. Try again shortly.",
    tryAgain: "Please try again.",
    optional: "(optional)",
    sending: "Sending…",
    opensInNewTab: "(opens in a new tab)",
  },
  cover: {
    dear: "Dear",
    open: "Open invitation",
  },
  hosts: {
    bride: "The Bride",
    groom: "The Groom",
    host: "Your Host",
    graduate: "The Graduate",
    celebrant: "The Celebrant",
    baby: "The Little One",
    company: "Hosted by",
    other: "",
  },
  countdown: {
    eyebrow: "Counting down",
    done: "The day is here",
    days: "days",
    hours: "hours",
    minutes: "minutes",
    seconds: "seconds",
    daysToGo: (days: number) =>
      days === 1 ? "1 day to go." : `${days} days to go.`,
    starts: (date: string) => `Starts ${date}.`,
  },
  event: {
    eyebrow: "The details",
    date: "Date",
    time: "Time",
    venue: "Venue",
    dressCode: "Dress code:",
    dressInspiration: "Dress code inspiration",
  },
  map: {
    eyebrow: "Where",
    directions: "Directions",
    directionsWith: (app: string) => `Directions with ${app}`,
  },
  story: {
    eyebrow: "Our story",
    title: "How we got here",
  },
  gallery: {
    eyebrow: "Moments",
    title: "Gallery",
    openPhoto: (alt: string) => `Open photo: ${alt}`,
    openPhotoN: (n: number, count: number) => `Open photo ${n} of ${count}`,
    photoN: (n: number, count: number) => `Photo ${n} of ${count}`,
    help: "Use the left and right arrow keys to browse. Press Escape to close.",
    previous: "Previous photo",
    next: "Next photo",
    close: "Close",
  },
  rsvp: {
    eyebrow: "RSVP",
    title: "Will you join us?",
    name: "Your name",
    attending: "Will you attend?",
    yes: "Joyfully accept",
    no: "Regretfully decline",
    maybe: "Not sure yet",
    partySize: "Number of guests",
    contact: "Phone or email",
    note: "A note for us",
    send: "Send RSVP",
    sent: "Thank you, we have your response.",
    hostPrompt: "Planning an event of your own?",
    replyBy: (date: string) => `Please reply by ${date}`,
    previewNote: "Preview: responses are not recorded.",
    previewToast: "RSVPs are disabled while previewing.",
    thanksToast: "Thank you!",
    thanksToastBody: "Your response has been recorded.",
    errorToast: "Could not send your RSVP",
  },
  wishes: {
    eyebrow: "Wishes",
    title: "Leave a message",
    name: "Your name",
    message: "Your message",
    placeholder: "Write your wishes…",
    send: "Send wishes",
    previewNote: "Preview: wishes are not recorded.",
    previewToast: "Wishes are disabled while previewing.",
    thanksToast: "Thank you for your wishes!",
    errorToast: "Could not send your wish",
  },
  gifts: {
    eyebrow: "Gifts",
    title: "A gift of love",
    intro:
      "Your presence is enough. If you wish to send a gift, here are a few ways.",
    open: "Open envelope",
    copyNumber: "Copy number",
    copied: "Copied",
    copyFailed: "Could not copy. Please copy it manually.",
    qrAlt: "Payment QR code",
    qrCaption: "Scan to send a gift",
  },
  calendar: {
    heading: "Add to calendar",
    google: "Google Calendar",
    ics: "Apple / Outlook (.ics)",
  },
  music: {
    play: "Play music",
    pause: "Pause music",
    playing: "Playing",
    tapToPlay: "Tap to play",
    music: "Music",
    nowPlaying: "Now playing",
    tapWidget: "Tap ▶ below for music",
    minimize: "Minimize and pause music",
    creditPrefix: "Music:",
    by: "by",
    onSoundCloud: "on SoundCloud",
    widgetTitle: (title: string, artist: string) =>
      `${title} by ${artist} on SoundCloud`,
  },
  closing: {
    signOff: "With love",
    madeWith: "Made with",
    createYours: "Create your own invitation, free",
    album: "Photos & videos from the event",
  },
  album: {
    eyebrow: "Album",
    back: "Back to the invitation",
    count: (n: number) =>
      n === 1 ? "1 photo or video" : `${n} photos and videos`,
    empty: "No photos yet.",
    emptyOpen: "Be the first to add one.",
    loadMore: "Show more",
    loadFailed: "Could not load the album. Please try again.",
    retry: "Try again",
    pinTitle: "This album is private",
    pinBody: "Enter the PIN the host shared with you.",
    pinLabel: "PIN",
    pinSubmit: "Open album",
    add: "Add photos & videos",
    choose: "Choose photos or videos",
    folder: "Choose a folder",
    zip: "Upload a .zip file",
    limits:
      "Photos: JPEG, PNG, WebP or AVIF, up to 25 MB each. Videos: MP4, MOV or WebM, up to 95 MB each. Up to 500 files at a time.",
    reading: (n: number) => `Reading files… ${n} found`,
    name: "Your name",
    ready: (n: number) => (n === 1 ? "1 file ready" : `${n} files ready`),
    more: (n: number) => `+${n} more`,
    skipped: (n: number) =>
      n === 1 ? "1 file left out" : `${n} files left out`,
    nothing: "None of those files are photos or videos we can accept.",
    approval: (n: number) =>
      `Uploads of more than ${n} files appear after the host approves them.`,
    send: (n: number) => (n === 1 ? "Upload 1 file" : `Upload ${n} files`),
    cancel: "Cancel",
    uploading: (done: number, total: number) => `Uploading ${done} of ${total}`,
    keepOpen: "Keep this page open until it finishes.",
    done: (n: number) =>
      n === 1 ? "1 file added to the album" : `${n} files added to the album`,
    sentForApproval: (n: number) =>
      `${n} files sent. They appear once the host approves them.`,
    failed: (n: number) =>
      n === 1
        ? "1 file could not be uploaded"
        : `${n} files could not be uploaded`,
    again: "Add more",
    uploadFailed: "The upload could not start",
    notYet: (date: string) =>
      `Guests can add photos and videos here from ${date}, the day of the event.`,
    hostHint:
      "Hosting this event? You can add photos at any time from your dashboard.",
    hostLink: "Open my dashboard",
    preview: (name: string) => `Preview ${name}`,
    closed: "Uploads are closed for this album.",
    until: (date: string) => `Guests can add photos until ${date}.`,
    download: "Download",
    downloadAll: "Download all",
    downloadSome: (n: number) => (n === 0 ? "Download" : `Download ${n}`),
    select: "Select",
    selectAll: "Select all",
    selectHint: "Tap the photos and videos you want.",
    preparing: (done: number, total: number) => `Preparing ${done} of ${total}`,
    missed: (n: number) =>
      n === 1
        ? "1 file could not be downloaded"
        : `${n} files could not be downloaded`,
    share: "Share",
    linkCopied: "Link copied",
    video: "Video",
    by: (name: string) => `Added by ${name}`,
    open: (n: number, total: number) => `Open ${n} of ${total}`,
    previous: "Previous",
    next: "Next",
    close: "Close",
  },
  share: {
    label: "Share this invitation",
    share: "Share invitation",
    copy: "Copy link",
    copied: "Link copied",
    copyFailed: "Could not copy the link",
  },
  ended: {
    title: "This invitation has ended",
    body: "Thank you for celebrating with us.",
    host: "Hosting this event? Keep the page online",
  },
  limits: {
    title: "Please wait a little",
    responses: (n: number) => (n === 1 ? "1 response" : `${n} responses`),
    wishes: (n: number) => (n === 1 ? "1 wish" : `${n} wishes`),
    window: (windowSec: number): string =>
      windowSec <= 60
        ? "in the last minute"
        : windowSec <= 3600
          ? "in the last hour"
          : "in the last 24 hours",
    you: (sent: string, window: string, wait: string) =>
      `You have sent ${sent} ${window}. You can send another in ${wait}.`,
    network: (wait: string) =>
      `Many guests on your network are sending right now. Please try again in ${wait}.`,
  },
}

export type Messages = typeof en
