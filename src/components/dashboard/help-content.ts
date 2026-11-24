// The words of the in-app guide (`/dashboard/help`): every editor tab and
// every section of an invitation, in the order the editor shows them. Kept
// apart from the page so a test can hold it against the editor: a new tab
// or section without an entry here fails `help-content.test.ts`.
import { FREE_PUBLISHED_LIMIT, FREE_RSVP_LIMIT, type Plan } from "@/lib/plans"
import { MAX_GALLERY, type SectionId } from "@/templates/_shared/schema"

export type HelpStep = { title: string; body: string }

export const HELP_STEPS: Array<HelpStep> = [
  {
    title: "Pick a template",
    body: "Open Templates, look at a few designs on the phone preview and press “Use this template”. That creates a draft only you can see. The template decides the look; every word, photo and colour in it can be changed.",
  },
  {
    title: "Fill in the tabs from left to right",
    body: "The editor has a row of tabs. They are in the order most people think: what and when, who, where, the words, then the look, photos and extras. You do not have to fill everything. A tab you leave empty simply does not show.",
  },
  {
    title: "Watch the preview",
    body: "The right side (or the Preview button on a phone) shows the invitation exactly as guests will see it. It changes as you type. Switch between Phone, Tablet and Desktop above it. Most guests open the link on a phone, so check that one first.",
  },
  {
    title: "Publish",
    body: "In the Sharing tab, choose the link for your invitation and press “Publish invitation”. From that moment the link works for anyone who has it.",
  },
  {
    title: "Share and follow the replies",
    body: "Send the link on WhatsApp, by email or as a QR code on a printed card. Replies and wishes arrive on your dashboard as guests send them.",
  },
]

export type HelpTab = {
  /** The tab's name exactly as the editor shows it. */
  name: string
  /** One line: what this tab is for. */
  summary: string
  /** What you fill in, field by field. */
  fields: Array<{ name: string; body: string }>
  /** Where the result appears on the invitation. */
  shows: string
  /** A good-to-know, when there is one. */
  tip?: string
  plan?: Plan
}

export const HELP_TABS: Array<HelpTab> = [
  {
    name: "Basics",
    summary: "What the event is and when it happens.",
    fields: [
      {
        name: "Type of event, title and subtitle",
        body: "The title is the name of your event as guests read it. The subtitle is a short line under it.",
      },
      {
        name: "Invitation language",
        body: "The language of the buttons, form labels and dates. Your own words stay exactly as you write them.",
      },
      {
        name: "Date, time and time zone",
        body: "When the event starts and ends, in the time zone of the place where it happens. Guests elsewhere still see the event’s own time.",
      },
      {
        name: "Template details",
        body: "Some templates have a field of their own, for example the age on a birthday design. It appears here when the template has one.",
      },
    ],
    shows:
      "The opening of the invitation, the countdown, the programme, the “Add to calendar” button and the link preview all read from this tab.",
    tip: "Set the date first. The countdown, the calendar file and the day the page goes offline on the free plan all follow it.",
  },
  {
    name: "People",
    summary: "Who is hosting or being celebrated.",
    fields: [
      {
        name: "Full name and short name",
        body: "The full name is shown in the People section. The short name is used in headlines and on the cover.",
      },
      {
        name: "Role",
        body: "Who this person is at the event, for example a host, a celebrant or a speaker. The roles on offer depend on the kind of template.",
      },
      {
        name: "Line under the name and portrait",
        body: "A few words about the person and, if you like, a photo of them.",
      },
    ],
    shows: "The People section, the cover and the headline of the invitation.",
    tip: "The order here is the order guests see. Drag a person to move them.",
  },
  {
    name: "Event & Venue",
    summary: "Where it happens and what the day looks like.",
    fields: [
      {
        name: "Venue",
        body: "The name of the place, its address and any notes for guests, such as parking or which gate to use.",
      },
      {
        name: "Location",
        body: "Search for the place and pick it from the list. That gives guests an exact pin and directions. Without a pin the map has nothing to point at.",
      },
      {
        name: "Programme",
        body: "The parts of the day in order, each with its own time, and its own venue if it is somewhere else. Leave it empty to show only the main event.",
      },
    ],
    shows: "The Programme section and the Map section.",
  },
  {
    name: "Texts",
    summary: "The words on the invitation that are yours to write.",
    fields: [
      {
        name: "Cover",
        body: "The line guests read before they open the invitation, and the wording of the button they tap.",
      },
      {
        name: "Main words",
        body: "The headline, your message to guests and the dress code. You can add photos of outfit ideas or colours.",
      },
      {
        name: "RSVP",
        body: "The question above the reply form, and the date you would like replies by.",
      },
      {
        name: "Ending",
        body: "Your closing words and a small footer note.",
      },
      {
        name: "Link preview",
        body: "The title and description that appear when the link is shared on WhatsApp and social apps.",
      },
    ],
    shows:
      "The cover, the opening, the RSVP section and the closing of the invitation.",
  },
  {
    name: "Design",
    summary: "Colours, fonts and how the invitation opens.",
    fields: [
      {
        name: "Colours",
        body: "Choose a ready-made palette, then fine-tune single colours if you need to.",
      },
      { name: "Fonts", body: "A matching pair for headings and body text." },
      {
        name: "Motion",
        body: "How much the page animates. Guests who have asked their phone for less motion always get a calm version.",
      },
      {
        name: "Opening and ornament",
        body: "Whether the invitation opens like an envelope or slides up, and the style of the seal and decorations.",
      },
    ],
    shows: "Everywhere. These choices apply to the whole invitation.",
  },
  {
    name: "Gallery",
    summary: "Your photos.",
    fields: [
      {
        name: "Photos",
        body: `Up to ${MAX_GALLERY} photos. Drag them into the order you want; the first one leads.`,
      },
      {
        name: "Show gallery",
        body: "Switch the whole gallery off without deleting the photos.",
      },
    ],
    shows: "The Gallery section.",
  },
  {
    name: "Story",
    summary: "A timeline of moments, for example how a couple met.",
    fields: [
      {
        name: "Moments",
        body: "Each one has a date, a title, a few sentences and an optional photo. Add them in the order they happened.",
      },
    ],
    shows: "The Story section.",
  },
  {
    name: "Music",
    summary: "A song that plays while guests read.",
    fields: [
      {
        name: "Source",
        body: "Pick a track from the Alikeni library, upload a song of your own, or paste a SoundCloud link.",
      },
      {
        name: "Playback",
        body: "The second the song starts at, and whether it repeats.",
      },
    ],
    shows:
      "The music starts when a guest taps the cover button. A small player stays on screen so they can pause it.",
    tip: "Phones do not allow sound before a tap, which is why the music waits for the cover button.",
  },
  {
    name: "Gifts",
    summary: "How guests can send a gift, shown discreetly.",
    plan: "premium",
    fields: [
      {
        name: "Bank accounts, mobile money and wallets",
        body: "The details guests need to send money. They can copy a number with one tap.",
      },
      {
        name: "Registry links and payment QR code",
        body: "Links to a gift list, and a picture of your payment QR code.",
      },
    ],
    shows:
      "The Gifts section, behind an “Open envelope” button so the details are not the first thing guests see.",
    tip: "You can fill this in on the free plan, but guests only see it once the invitation is Premium.",
  },
  {
    name: "Tickets & Sponsors",
    summary: "For events guests pay or book for, and for crediting partners.",
    plan: "premium",
    fields: [
      {
        name: "Tickets",
        body: "Each ticket has a name, a price written the way guests should read it, and what it includes. Add a link and guests get a “Get tickets” button. Nothing is charged through the invitation.",
      },
      {
        name: "Sponsors and vendors",
        body: "A name, a website and a logo for each sponsor, vendor or person you want to thank.",
      },
    ],
    shows: "The Tickets section and the Sponsors section.",
    tip: "You can fill this in on the free plan, but guests only see tickets and sponsors once the invitation is Premium.",
  },
  {
    name: "Album",
    summary: "A shared album for the photos and videos of the day.",
    plan: "premium",
    fields: [
      {
        name: "Album settings",
        body: "Switch the album on, and decide whether guests may add their own photos and videos and whether they may download and share them. These settings apply straight away, without publishing again.",
      },
    ],
    shows:
      "A link at the end of the invitation opens the album. You add and manage photos from the Album page of the invitation.",
  },
  {
    name: "Sections",
    summary: "Which parts of the invitation show, and in what order.",
    fields: [
      {
        name: "Order & visibility",
        body: "Drag a section up or down to move it. Use the switch to hide one you do not need.",
      },
    ],
    shows: "The whole invitation follows this order.",
    tip: "“On, but empty” means the section is switched on but has nothing to show yet. Add its content in the matching tab and it appears.",
  },
  {
    name: "Sharing",
    summary: "Publish the invitation and send it.",
    fields: [
      {
        name: "Web address",
        body: "The end of your link. Lowercase letters, numbers and dashes. It must be free; the editor checks as you type.",
      },
      {
        name: "Publish",
        body: "Makes the invitation public at that link. After a later edit the button reads “Publish changes”: guests keep seeing the old version until you press it. “Discard changes” puts the draft back to what guests see now.",
      },
      {
        name: "Share",
        body: "Copy the link, open it, send it on WhatsApp or download the QR code for printed cards.",
      },
    ],
    shows: "Nothing on the invitation itself. This tab is where it goes live.",
  },
]

export type HelpSection = {
  /** The section's name exactly as the Sections tab shows it. */
  name: string
  /** What guests see. */
  guests: string
  /** The editor tab (by name) its content comes from. */
  tab: string
  /** What must be there for it to appear, when it can be empty. */
  needs?: string
  plan?: Plan
}

/** Keyed by section id so a new section cannot be left out. */
export const HELP_SECTIONS: Record<SectionId, HelpSection> = {
  hero: {
    name: "Opening",
    guests:
      "The first screen after the cover: the title, the names, the date and your headline.",
    tab: "Basics, People and Texts",
  },
  hosts: {
    name: "People",
    guests:
      "The hosts or the people being celebrated, with their portraits and the line under each name.",
    tab: "People",
  },
  event: {
    name: "Programme",
    guests:
      "The date and time, the venue and its address, and each part of the day if you added a programme.",
    tab: "Basics and Event & Venue",
  },
  countdown: {
    name: "Countdown",
    guests: "The days, hours and minutes left until the event starts.",
    tab: "Basics (the start date)",
  },
  story: {
    name: "Story",
    guests: "A timeline of moments with dates and photos.",
    tab: "Story",
    needs: "At least one moment.",
  },
  gallery: {
    name: "Gallery",
    guests: "Your photos. A tap opens one full screen.",
    tab: "Gallery",
    needs: "At least one photo.",
  },
  map: {
    name: "Map",
    guests:
      "The venue on a map, with buttons that open directions in the guest’s own maps app.",
    tab: "Event & Venue (the location)",
  },
  rsvp: {
    name: "RSVP",
    guests:
      "The reply form: yes, no or maybe, how many are coming and an optional message. No account and no app.",
    tab: "Texts (the prompt and the reply-by date)",
  },
  wishes: {
    name: "Wishes",
    guests:
      "A wall of messages from guests. You can hide any wish from the Responses page.",
    tab: "Nothing to fill in; guests write them",
  },
  gifts: {
    name: "Gifts",
    guests:
      "An “Open envelope” button that reveals your bank, mobile money, registry and QR details.",
    tab: "Gifts",
    needs: "“Show gift details” switched on.",
    plan: "premium",
  },
  admission: {
    name: "Tickets",
    guests: "Ticket types with prices, and a “Get tickets” button.",
    tab: "Tickets & Sponsors",
    needs: "At least one ticket or a ticket link.",
    plan: "premium",
  },
  sponsors: {
    name: "Sponsors",
    guests: "The logos or names of sponsors, vendors and people you thank.",
    tab: "Tickets & Sponsors",
    needs: "At least one entry.",
    plan: "premium",
  },
  calendar: {
    name: "Add to calendar",
    guests:
      "A button that saves the event to the guest’s phone calendar with the date, time and place filled in.",
    tab: "Basics and Event & Venue",
  },
  closing: {
    name: "Closing & footer",
    guests: "Your closing words and the footer note at the very end.",
    tab: "Texts (Ending)",
  },
}

export type HelpTopic = { title: string; body: string }

export const HELP_AFTER: Array<HelpTopic> = [
  {
    title: "Guest list and personal links",
    body: "From an invitation’s menu on the dashboard, open Guests and add the people you are inviting. Each guest gets a personal link that opens the invitation with their name on the cover. The links work once the invitation is published.",
  },
  {
    title: "Responses",
    body: "The Responses page lists every RSVP with the party size and message, and every wish. Hide a wish you do not want on the wall, and download the guest list as a CSV file to open in Excel or Google Sheets.",
  },
  {
    title: "Changing something after publishing",
    body: "Edit as usual. Your changes are saved to the draft straight away, but guests only see them after you press “Publish changes” in the Sharing tab. The link stays the same.",
  },
  {
    title: "Duplicate, archive and delete",
    body: "Duplicate makes a new draft with the same content, handy for a second event. Archive takes the page offline without losing anything; unarchive puts it back. Delete removes the invitation with its RSVPs and wishes for good.",
  },
  {
    title: "After the event",
    body: "From the day after the event, an invitation is locked: only the gallery photos, the album and the closing words can still be changed. The date, names and venue stay as guests saw them.",
  },
]

export const HELP_PLANS: { free: Array<string>; premium: Array<string> } = {
  free: [
    "Every template and every tab in the editor",
    `Up to ${FREE_RSVP_LIMIT} RSVPs`,
    "The page is online until the day after the event",
    `${FREE_PUBLISHED_LIMIT} free invitations can be published per account`,
    "No gift section, tickets, sponsors or event album",
  ],
  premium: [
    "Unlimited RSVPs",
    "The page stays online after the event",
    "The gift section is shown to guests",
    "Tickets with a “Get tickets” button, and your sponsors’ logos",
    "The event album, with photos hosted for you",
    "Paid once for one invitation, before or after publishing",
  ],
}

export const HELP_FIXES: Array<HelpTopic> = [
  {
    title: "A section does not show on the invitation",
    body: "Open the Sections tab. If it says “On, but empty”, add its content in the matching tab. If the switch is off, turn it on. If the section is missing from the list, add it back under “Add a section”.",
  },
  {
    title: "Guests still see the old version",
    body: "You have edits that are saved but not published. Open the Sharing tab and press “Publish changes”.",
  },
  {
    title: "The Publish button is greyed out",
    body: "Either a field needs attention (its tab carries a badge; open it and fix the highlighted field), or the web address is taken or not valid yet.",
  },
  {
    title: "The music does not start",
    body: "Music starts when the guest taps the cover button, never before. Check that “Play music” is on in the Music tab and that a track is chosen.",
  },
  {
    title: "The map shows the wrong place",
    body: "In Event & Venue, search for the place again and pick the right match, so the pin is exact.",
  },
]
