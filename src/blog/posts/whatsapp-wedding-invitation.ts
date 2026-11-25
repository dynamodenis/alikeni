import { FREE_RSVP_LIMIT } from "@/lib/plans"
import type { Post } from "../types"

export const whatsappWeddingInvitation: Post = {
  slug: "whatsapp-wedding-invitation",
  title: "WhatsApp Wedding Invitations: How to Make and Send One",
  description:
    "How to make a wedding invitation for WhatsApp: image, PDF, video or link, what to include, wording you can copy and when to send it to your guests.",
  date: "2026-11-25",
  readMinutes: 7,
  category: "wedding",
  related: ["whatsapp-invitations-rsvp", "collect-rsvps-without-an-app"],
  blocks: [
    {
      type: "p",
      text: "Most wedding guests will first see your invitation on their phone, in a WhatsApp chat. That is good news: it costs nothing to send, it arrives in seconds and nobody has to deliver cards across town or to another city. But a wedding invitation carries more than a date. It sets the tone of the day, and it has to answer every practical question a guest has.",
    },
    {
      type: "p",
      text: "This guide covers the kinds of WhatsApp wedding invitation you can send, what to put on one, wording you can copy and how to send it so that guests reply.",
    },
    { type: "h2", text: "The four kinds of WhatsApp wedding invitation" },
    {
      type: "p",
      text: "When people say “WhatsApp wedding invitation” they mean one of four things. Each has its place.",
    },
    {
      type: "ul",
      items: [
        "An image of a card. Easy to make and it looks like a traditional card. Guests cannot tap anything on it, WhatsApp shrinks the picture so small text becomes hard to read, and you still collect replies by hand.",
        "A PDF. It keeps the print quality, but guests have to download and open a file, and many never do.",
        "A video. It is lovely to watch and it gets shared. It uses data, the details pass by quickly and guests have to pause it to copy the venue.",
        "A link to an invitation page. Guests tap once and see everything: the date with a countdown, the venue on a map, the programme and a button to RSVP. It needs an internet connection to open.",
      ],
    },
    { type: "h2", text: "Which one should you send?" },
    {
      type: "p",
      text: "If you only send one thing, send the link. It is the only format where a guest can get directions, save the date to their calendar and tell you whether they are coming, all without leaving the page. It is also the only one you can correct. If the reception venue changes, you update the page and every guest sees the new details. An image you sent last month cannot be taken back.",
    },
    {
      type: "p",
      text: "You do not have to choose only one. Many couples send a card image or a short video for the feeling, with the link underneath for the details and the RSVP.",
    },
    {
      type: "image",
      src: "/blog/whatsapp-wedding-invitation/cover.webp",
      alt: "A wedding invitation page open on a phone, showing the couple's names and an Open invitation button",
      caption:
        "What guests see when they tap the link: the cover of the Ivory Garden template, with sample names.",
      shot: { template: "wedding/ivory-garden", section: "cover" },
    },
    { type: "h2", text: "What to put on a wedding invitation" },
    {
      type: "ul",
      items: [
        "Both names, written the way your families know you",
        "Who is inviting: the couple, or the two families",
        "The date and the starting time of each part of the day",
        "The venue of the ceremony and of the reception, if they differ",
        "The dress code or colour theme, if you have one",
        "Whether the invitation is for one person, a couple or the family",
        "How to reply, and the date you need the reply by",
        "A phone number for questions, usually a family member or the planner",
      ],
    },
    {
      type: "tip",
      text: "Give the time guests should arrive, not the time you hope to start. If the service begins at 10 am, say so plainly and keep the same time on every version of the invitation.",
    },
    { type: "h2", text: "How to make one in a few minutes" },
    {
      type: "ol",
      items: [
        "Pick a design from the [wedding invitation templates](/templates/wedding). [Ivory Garden](/templates/wedding/ivory-garden) suits a church or garden wedding, [Royal Islamic](/templates/wedding/royal-islamic) is made for a nikah and walima, and [Minimal Mono](/templates/wedding/minimal-mono) keeps everything black and white.",
        "Add your names, the date and the venue. List the ceremony and the reception as separate events, each with its own time and place.",
        "Add photos and a song if you want them. Both are optional.",
        "Keep the RSVP form switched on and set the date you need replies by. After that date the form closes.",
        "Publish, copy your link and send it.",
      ],
    },
    {
      type: "image",
      src: "/blog/whatsapp-wedding-invitation/events.webp",
      alt: "The ceremony and the reception listed as two events, each with a time and a venue",
      caption:
        "The ceremony and the reception as separate events, from the Ivory Garden sample.",
      shot: { template: "wedding/ivory-garden", section: "event" },
    },
    { type: "h2", text: "Wedding invitation messages you can copy" },
    {
      type: "p",
      text: "The link carries the details, so the message itself can be short. Put the link on its own line so that it is easy to tap and WhatsApp shows the preview.",
    },
    {
      type: "message",
      label: "From the families",
      text: "Greetings! The families of Mr and Mrs Bennett and Mr and Mrs Rivera joyfully invite you to the wedding of their children, Sarah and Daniel, on Saturday 12 December. The full invitation is here:\n[your link]\nKindly confirm your attendance on the page by 28 November.",
    },
    {
      type: "message",
      label: "From the couple",
      text: "Hi Maya! We are getting married on Saturday 12 December and we would love you to be there. Everything you need is here:\n[your link]\nPlease tap RSVP by 28 November so we can save you a seat.",
    },
    {
      type: "message",
      label: "Evening reception only",
      text: "Hi Peter! Daniel and I are getting married on 12 December. The ceremony is for family, and we would love you to join us for the reception from 4 pm. Details and directions:\n[your link]\nLet us know on the page if you can make it.",
    },
    {
      type: "message",
      label: "Save the date",
      text: "Save the date! Sarah and Daniel are getting married on Saturday 12 December in London. The invitation with all the details will follow. Please keep the day free.",
    },
    { type: "h2", text: "When to send it" },
    {
      type: "ul",
      items: [
        "Send a save-the-date as soon as the date and the town are fixed, especially if guests will travel or need to ask for leave.",
        "Send the invitation once the venues and times are confirmed. Six to eight weeks before the day gives most guests enough notice.",
        "Set the RSVP date two to three weeks before the wedding, so you can give the caterer a number.",
        "Remind the guests who have not answered a few days before the RSVP date.",
      ],
    },
    { type: "h2", text: "How to send it so guests reply" },
    {
      type: "p",
      text: "Send it to each guest in a private message and use their name. An invitation dropped into a group feels like an announcement, and it is buried under replies within the hour. Post it in the family and friends groups as well, but do not rely on them.",
    },
    {
      type: "image",
      src: "/blog/whatsapp-wedding-invitation/rsvp.webp",
      alt: "An RSVP form on a wedding invitation with a name field, attendance choices and number of guests",
      caption: "The RSVP form guests fill in, from the Ivory Garden sample.",
      shot: { template: "wedding/ivory-garden", section: "rsvp" },
    },
    {
      type: "p",
      text: "Some guests deserve more than a message. Call your elders, or visit, and then send the link so they have the details. If you want a few printed cards for parents and grandparents, add the invitation's QR code to the card so that anyone can scan it and reach the map and the RSVP.",
    },
    {
      type: "tip",
      text: "On Alikeni you can add your guest list and create a personal link for each guest. The invitation greets them by name, and each guest has a button to send their link on WhatsApp. For the follow-up messages, see [how to send invitations on WhatsApp and get real RSVPs](/blog/whatsapp-invitations-rsvp).",
    },
    { type: "h2", text: "Mistakes to avoid" },
    {
      type: "ul",
      items: [
        "Sending only a picture, then answering the same questions about time and place for weeks",
        "Leaving out the RSVP date, so that “I will confirm” never ends",
        "Not saying who is invited, which leads to surprise extra guests",
        "Giving different times in the card, the message and the group",
        "Sending it so late that guests have already made other plans",
      ],
    },
    { type: "h2", text: "Questions about WhatsApp wedding invitations" },
    {
      type: "faq",
      items: [
        {
          q: "Is it acceptable to send a wedding invitation on WhatsApp?",
          a: "Yes. It is now a common way to invite guests, and most of them will read it sooner than a printed card. For elders and guests of honour, pair it with a phone call, a visit or a printed card.",
        },
        {
          q: "Can guests RSVP from WhatsApp?",
          a: "WhatsApp has no RSVP button for invitations. When you send a link to an invitation page, guests tap it, answer yes, no or maybe and add how many are coming. They do not need an account or an app.",
        },
        {
          q: "Is a WhatsApp wedding invitation free?",
          a: `Sending it is free. On Alikeni, creating and publishing the invitation is free too: a free invitation takes up to ${FREE_RSVP_LIMIT} RSVPs and stays online until the day after the wedding. A one-time Premium upgrade for that invitation removes those limits and adds a gift section.`,
        },
        {
          q: "Can I still print cards?",
          a: "Yes. Print as many as you need for the people who expect one, and put the invitation's QR code on them. Everyone ends up on the same page with the same details.",
        },
      ],
    },
    {
      type: "p",
      text: "Ready to start? Browse the [wedding invitation templates](/templates/wedding), or read [how to collect RSVPs without an app or a spreadsheet](/blog/collect-rsvps-without-an-app).",
    },
  ],
}
