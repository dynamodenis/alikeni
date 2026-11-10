// Copy for the occasion landing pages (/templates/<category>): what people
// search for, said plainly. Each page lists that category's templates under
// its own title, intro and questions, so it is a real page about one
// occasion, not a filtered copy of the gallery.
import type { TemplateCategory } from "./types"

export type CategoryPage = {
  /** <title>, main phrase first (about 50–60 characters with the brand). */
  title: string
  /** Meta description, about 120–155 characters. */
  description: string
  /** H1: `lead` in cream, `accent` in gold italics. */
  lead: string
  accent: string
  intro: string
  /** Link text used across the site ("Wedding invitations"). */
  linkLabel: string
  questions: Array<{ q: string; a: string }>
}

export const CATEGORY_PAGES: Record<TemplateCategory, CategoryPage> = {
  wedding: {
    title: "Online Wedding Invitations with RSVP · Alikeni",
    description:
      "Create a digital wedding invitation website in minutes: RSVP tracking, countdown, venue map, music, gallery and guest wishes. Share it by link or WhatsApp.",
    lead: "Online wedding",
    accent: "invitations",
    intro:
      "A wedding invitation your guests open on their phone: your names, your story, the date counting down, the venue on a map and an RSVP form that fills your guest list for you. Pick a design, change the words, colours and photos, and share one link.",
    linkLabel: "Wedding invitations",
    questions: [
      {
        q: "Can guests RSVP on the wedding invitation?",
        a: "Yes. Every wedding template has an RSVP form. Guests answer yes, no or maybe and add their party size and a message. You see every response on your dashboard and can export the list.",
      },
      {
        q: "How do I send a digital wedding invitation?",
        a: "Publish your invitation and share its link by WhatsApp, SMS, email or a QR code on a printed card. You can also create a personal link for each guest so the invitation greets them by name.",
      },
      {
        q: "Can one invitation cover the ceremony and the reception?",
        a: "Yes. Add each part of the day as its own event with a time and a venue, and guests can save all of them to their calendar.",
      },
    ],
  },
  birthday: {
    title: "Online Birthday Invitations with RSVP · Alikeni",
    description:
      "Make a birthday invitation website for kids, teens and milestone birthdays. Countdown, map, photos, music and RSVP built in. Share it by link or WhatsApp.",
    lead: "Online birthday",
    accent: "invitations",
    intro:
      "From a first birthday to a fiftieth: a birthday invitation with a live countdown, the party location on a map, photos, a song and an RSVP form, so you know how many are coming before you order the cake.",
    linkLabel: "Birthday invitations",
    questions: [
      {
        q: "Are there birthday invitations for children and for adults?",
        a: "Yes. The designs range from dinosaurs, princesses and arcade games for children to neon party, garden tea and golden milestone designs for adults.",
      },
      {
        q: "How do I know how many guests are coming?",
        a: "Guests reply on the invitation with their party size. Your dashboard adds up who is coming, who is not and who is undecided.",
      },
      {
        q: "Can I change the colours and the text?",
        a: "Yes. Every template lets you change the wording, colour palette, fonts, photos and music, and switch sections on or off.",
      },
    ],
  },
  graduation: {
    title: "Graduation Invitations Online with RSVP · Alikeni",
    description:
      "Create a graduation party invitation website: school, degree and class year, countdown, venue map, photo gallery and RSVP. Share it with one link.",
    lead: "Graduation",
    accent: "invitations online",
    intro:
      "Announce the graduate and invite everyone to the celebration. Add the school, the degree and the class year, a gallery of the journey, the venue on a map and an RSVP form so family and friends can confirm.",
    linkLabel: "Graduation invitations",
    questions: [
      {
        q: "What can I put on a graduation invitation?",
        a: "The graduate's name and photo, school, degree and class year, the ceremony and party details, a photo gallery, a map with directions and an RSVP form.",
      },
      {
        q: "Can I invite guests to both the ceremony and the party?",
        a: "Yes. List the ceremony and the party as separate events with their own time and place.",
      },
      {
        q: "How do guests receive the invitation?",
        a: "You share a link by WhatsApp, SMS or email. It opens in any phone browser; guests do not install anything.",
      },
    ],
  },
  baby_shower: {
    title: "Baby Shower Invitations Online with RSVP · Alikeni",
    description:
      "Design a baby shower or gender reveal invitation website with countdown, map, gift registry links, guest wishes and RSVP. Share it by link or WhatsApp.",
    lead: "Baby shower",
    accent: "invitations online",
    intro:
      "Soft clouds, safari friends, teddy bears or a gender reveal: a baby shower invitation with the date, the place, a wishes wall for the parents-to-be and an RSVP form. Share one link and watch the replies come in.",
    linkLabel: "Baby shower invitations",
    questions: [
      {
        q: "Is there a gender reveal invitation?",
        a: "Yes. The Gender Reveal template is made for it, and any baby shower template can be restyled in your own colours.",
      },
      {
        q: "Can I add a gift registry?",
        a: "Yes. With Premium you can add registry links and gift details to the invitation. Guests see them in a discreet gifts section.",
      },
      {
        q: "Can guests leave messages for the parents?",
        a: "Yes. The wishes wall lets guests write a message on the invitation, and you can hide any message from your dashboard.",
      },
    ],
  },
  anniversary: {
    title: "Anniversary Invitations Online with RSVP · Alikeni",
    description:
      "Create an anniversary invitation website for a silver, golden or any wedding anniversary: your story, photos then and now, countdown, map and RSVP.",
    lead: "Anniversary",
    accent: "invitations online",
    intro:
      "Twenty-five years, fifty, or simply another year worth a party. Tell your story on a timeline, show photos from then and now, play your song and let guests confirm with an RSVP.",
    linkLabel: "Anniversary invitations",
    questions: [
      {
        q: "Can I show our story and old photos?",
        a: "Yes. Add a timeline of your years together and a gallery of up to 30 photos.",
      },
      {
        q: "Are there designs for silver and golden anniversaries?",
        a: "Yes. Silver Jubilee and Golden Years are made for the 25th and 50th, and every design can be recoloured.",
      },
      {
        q: "Can we play our song on the invitation?",
        a: "Yes. Choose a track from the library or add your own; it starts when the guest opens the invitation.",
      },
    ],
  },
  corporate: {
    title: "Corporate Event Invitations Online with RSVP · Alikeni",
    description:
      "Send professional event invitations for launches, galas, conferences, offsites and webinars. An event page with agenda, map and RSVP tracking in one link.",
    lead: "Corporate event",
    accent: "invitations",
    intro:
      "A product launch, a gala dinner, a conference, a team offsite or a webinar: an event page with the agenda, the venue on a map, add-to-calendar and an RSVP form that gives you a clean attendee list.",
    linkLabel: "Corporate event invitations",
    questions: [
      {
        q: "Can I track who is attending?",
        a: "Yes. Every response is on your dashboard with party size and contact details, and you can export the list as a spreadsheet.",
      },
      {
        q: "Can guests add the event to their calendar?",
        a: "Yes. The invitation has an add-to-calendar button for Google Calendar and a calendar file for Outlook and Apple Calendar.",
      },
      {
        q: "Does it work for online events?",
        a: "Yes. The Webinar Minimal template is made for online events.",
      },
    ],
  },
  other: {
    title: "Party & Event Invitations Online with RSVP · Alikeni",
    description:
      "Online invitations for engagements, bridal showers, housewarmings, reunions, retirements, Eid, Christmas, aqiqah and more, with RSVP, map and countdown.",
    lead: "Invitations for",
    accent: "every celebration",
    intro:
      "Engagement parties, bridal showers, housewarmings, class reunions, retirements, Eid open houses, Christmas dinners, aqiqah and khitanan: each with its own design, a countdown, a map and an RSVP form.",
    linkLabel: "Party and event invitations",
    questions: [
      {
        q: "Which occasions are covered?",
        a: "Engagements, bridal showers, housewarmings, class reunions, retirements, Eid open houses, Christmas dinners, aqiqah and khitanan, alongside weddings, birthdays, graduations, baby showers, anniversaries and corporate events.",
      },
      {
        q: "My occasion is not listed. Can I still make an invitation?",
        a: "Yes. Pick the design you like and change the title, wording, colours and sections to fit your event.",
      },
      {
        q: "Is it free?",
        a: "Yes. You can create, publish and share an invitation for free. A one-time Premium upgrade per invitation adds more responses, gift details and a page that stays online.",
      },
    ],
  },
}
