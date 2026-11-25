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
  /** The short lead under the H1. */
  intro: string
  /**
   * Short paragraphs under the templates. The first is shown; the rest open
   * with "Read more". May link to pages of this site as `[label](/path)`.
   */
  about: Array<string>
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
    about: [
      "Every wedding template is a full page, not a picture of a card. Guests see your names, the date with a live countdown, and each part of the day with its own time and venue. A map gives directions in Google Maps, Waze or Apple Maps, and one tap saves the date to their calendar.",
      "The RSVP form asks whether they are coming and how many, so your guest list fills itself in. If you add your guests first, each one gets a personal link that greets them by name, and you can see who has opened it.",
      "The designs run from classic stationery to beach, rustic, minimal, Islamic and Javanese styles. Each can be recoloured and reworded, and you can add your story, a photo gallery and a song. Share the link on WhatsApp, by email or as a QR code on a printed card. Our guide shows [how to make and send a WhatsApp wedding invitation](/blog/whatsapp-wedding-invitation).",
    ],
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
      {
        q: "Is an online wedding invitation free?",
        a: "Yes. You can create, publish and share a wedding invitation for free. A one-time Premium upgrade for that invitation accepts more RSVPs, adds a gift section and keeps the page online after the wedding.",
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
    about: [
      "A birthday invitation here is a small page of its own. It shows whose birthday it is, the date with a countdown, the place on a map and a form for guests to say whether they are coming.",
      "For children there are dinosaurs, a princess castle, a retro arcade and a burst of confetti. For teens and adults there are a neon night, a garden tea party, a sweet seventeen and a golden milestone design for the big birthdays.",
      "Change the colours, fonts and wording, add photos and a song, and switch off any section you do not need. Then share the link in the family group, send it to each guest, or print the QR code on a card. To get a clear answer from everyone, read [how to collect RSVPs without an app or a spreadsheet](/blog/collect-rsvps-without-an-app).",
    ],
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
      {
        q: "Can I send a birthday invitation on WhatsApp?",
        a: "Yes. Publish the invitation and send its link in a message. Guests tap it, see the details and reply on the page, without installing anything.",
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
    about: [
      "A graduation invitation has two jobs: to announce the achievement and to bring people to the party. Each template has places for the school, the degree or course and the class year, which you fill in yourself.",
      "List the ceremony and the celebration as separate events, each with its own time and venue, and guests can save both to their calendar. A photo gallery holds pictures from the years of study, and the wishes wall collects messages for the graduate.",
      "The designs cover a formal navy and gold, a classroom chalkboard, a varsity jacket, a terminal for tech graduates, a starry sky and a wall of Polaroids. For help with the words, see our [graduation invitation wording examples](/blog/graduation-invitation-wording).",
    ],
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
      {
        q: "Can I add photos from the school years?",
        a: "Yes. Every graduation template has a photo gallery, and you can add up to 30 photos.",
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
    about: [
      "A baby shower invitation tells guests when and where, and gives them a way to answer. Each template shows the date with a countdown, the venue on a map with directions, and an RSVP form that counts who is coming.",
      "The designs are soft clouds, a little safari, a teddy bears' picnic, twinkling stars, botanical sage and a gender reveal. Every one can be recoloured, so the same design works for a boy, a girl or a surprise.",
      "Guests can leave a message for the parents-to-be on the wishes wall, and you choose which messages are shown. With Premium you can add registry links in a gifts section. It is often a friend or relative who hosts, and anyone can create the invitation and share the link.",
    ],
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
      {
        q: "How do guests find the venue?",
        a: "The invitation shows the venue on a map with buttons that open directions in Google Maps, Waze or Apple Maps.",
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
    about: [
      "An anniversary invitation looks back as much as forward. Each template has a timeline for your story, a gallery for photos from then and now, and room for a message to the people who shared those years with you.",
      "Silver Jubilee and Golden Years are made for the twenty-fifth and the fiftieth. Love Letter, Then and Now and Vinyl Love Song suit any year. All of them can be recoloured and reworded, and you can play a song when the invitation opens.",
      "Guests see the date with a countdown, the venue on a map and an RSVP form, so you know how many to seat. Children planning a party for their parents can create the invitation themselves and share the link only with the guests; invitation pages are kept out of search engines.",
    ],
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
      {
        q: "How do guests reply?",
        a: "They answer yes, no or maybe on the invitation and add how many are coming. They do not need an account or an app, and you see every reply on your dashboard.",
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
    about: [
      "A work event needs a clear page more than a pretty card. Each template sets out what the event is, who is hosting, the agenda with times, and the venue on a map with directions.",
      "Guests reply on the page, and every response lands on your dashboard with the number attending and the contact details they gave. Export the list as a CSV file for the front desk or the caterer. An add-to-calendar button puts the event in Google Calendar, Outlook or Apple Calendar.",
      "There are designs for a product launch, a black-tie gala, a conference, a team offsite, a holiday party and a webinar. With Premium you can also list ticket types and show your sponsors. Use your own colours and wording so the page matches your brand.",
    ],
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
      {
        q: "Can I show ticket prices or sponsors?",
        a: "Yes. With Premium you can list ticket types with their prices and a link to buy, and show your sponsors' names and logos.",
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
    about: [
      "Not every celebration fits a category. These templates are made for particular occasions, each with wording and details that suit it.",
      "For the start of a marriage there are an engagement and a bridal shower design. For home and family there are a housewarming, a class reunion and a retirement party. For religious and seasonal gatherings there are an Eid open house, a Christmas dinner, aqiqah and khitanan.",
      "All of them include the same tools: the date with a countdown, the venue on a map, an RSVP form and a wishes wall. If your occasion is not here, start from the design you like best and change the title, the wording and the colours. Any template can become an invitation for a farewell, a naming ceremony or a memorial.",
    ],
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
      {
        q: "Can I write the invitation in my own language?",
        a: "Yes. You can type your own wording in any language. The built-in buttons and labels are available in English and Indonesian.",
      },
    ],
  },
}
