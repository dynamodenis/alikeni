// Blog posts as data: plain blocks rendered by /blog/$slug. To publish a
// post, add it to POSTS (newest first); the blog index, the sitemap and the
// article's search tags all read from here.

export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul" | "ol"; items: Array<string> }
  /** A message to copy and paste, shown as a quote card. */
  | { type: "message"; label: string; text: string }
  | { type: "tip"; text: string }

export type Post = {
  slug: string
  /** H1 and <title> (kept under about 60 characters). */
  title: string
  /** Meta description and the summary on the blog index. */
  description: string
  /** YYYY-MM-DD. */
  date: string
  readMinutes: number
  blocks: Array<Block>
}

export const POSTS: ReadonlyArray<Post> = [
  {
    slug: "whatsapp-invitations-rsvp",
    title: "How to Send Invitations on WhatsApp and Get Real RSVPs",
    description:
      "A simple plan for inviting guests on WhatsApp and getting a clear yes or no from each one, with messages you can copy and a reminder schedule.",
    date: "2026-11-10",
    readMinutes: 6,
    blocks: [
      {
        type: "p",
        text: "Most invitations now travel by WhatsApp. It is fast and free, and everyone already has it. The hard part comes after you press send: half the guests reply with a heart, some say “will confirm”, and two weeks before the day you still do not know how many chairs to hire.",
      },
      {
        type: "p",
        text: "This guide is a simple plan that fixes that. It works for weddings, birthdays, graduations and any other event, whether you are inviting 20 people or 300.",
      },
      { type: "h2", text: "1. Put every detail in one place" },
      {
        type: "p",
        text: "A photo of a card looks nice, but guests cannot tap it. They have to type the venue into a map by hand, and the picture is lost in the chat a day later. Then the questions start: What time? Where exactly? Can I bring someone?",
      },
      {
        type: "p",
        text: "Send one link instead. A good invitation page answers everything a guest will ask:",
      },
      {
        type: "ul",
        items: [
          "Who is celebrating and what the event is",
          "The date and time, with a button to save it to their calendar",
          "The venue on a map, with directions",
          "The dress code or any other note",
          "A way to reply: yes, no or maybe, and how many are coming",
        ],
      },
      { type: "h2", text: "2. Ask one clear question" },
      {
        type: "p",
        text: "“Hope you can make it!” does not ask for anything, so most people answer with an emoji. Tell guests exactly what you need and by when. Keep the message short, and put the link on its own line so it is easy to tap.",
      },
      {
        type: "message",
        label: "Wedding",
        text: "Hi Aunt Grace! Brian and I are getting married on Saturday 14 March. We would love to have you there. All the details are here:\n[your link]\nPlease tap RSVP on the page by 20 February so we can plan seats and food. Thank you!",
      },
      {
        type: "message",
        label: "Birthday",
        text: "Hi Kevin! I am turning 30 and having a party on Friday 8 May at 7 pm. Details and directions:\n[your link]\nLet me know on the page if you are coming, and how many, by 1 May.",
      },
      {
        type: "message",
        label: "Formal or work event",
        text: "Good afternoon Mr Otieno. You are invited to the launch of our new office on Thursday 4 June at 5 pm. The programme and location are here:\n[your link]\nKindly confirm your attendance on the page by 28 May.",
      },
      { type: "h2", text: "3. Send it to each person, not only to a group" },
      {
        type: "p",
        text: "In a group chat, your invitation is buried under 40 replies within an hour, and nobody feels the question was meant for them. A message sent to one person gets an answer far more often.",
      },
      {
        type: "ul",
        items: [
          "Message close family and important guests one by one. Use their name.",
          "For a long list, use a WhatsApp broadcast list. Each person receives it as a private message. Note that it only reaches people who have saved your number.",
          "Post in the family or friends group as well if you like, but treat that as an announcement, not as the invitation.",
        ],
      },
      {
        type: "tip",
        text: "On Alikeni you can create a personal link for each guest. The invitation opens with their name on it, which feels like a card written just for them.",
      },
      { type: "h2", text: "4. Set an RSVP deadline, and say it" },
      {
        type: "p",
        text: "Without a date, “I will confirm” can last forever. Work backwards from the people who need your numbers: the caterer, the venue, the tent and chair hire. Ask them when they need a final count, then set your deadline about a week before that.",
      },
      {
        type: "p",
        text: "For most weddings this means a deadline two to three weeks before the day. For a birthday or a small party, one week is usually enough.",
      },
      { type: "h2", text: "5. Remind people twice, kindly" },
      {
        type: "p",
        text: "People do not ignore invitations on purpose. They read the message on the bus, plan to answer later, and forget. One friendly reminder brings in most of the missing replies.",
      },
      {
        type: "ol",
        items: [
          "Three days before the deadline: remind only the people who have not answered.",
          "The day after the deadline: one last message, then a phone call for close family.",
          "The day before the event: a short note to everyone who said yes, with the time and the map link.",
        ],
      },
      {
        type: "message",
        label: "Reminder",
        text: "Hi Mercy! Just checking that you saw our invitation. We are confirming numbers with the caterer on Friday. Could you tap yes or no here today?\n[your link]",
      },
      { type: "h2", text: "6. Keep one list, not five chats" },
      {
        type: "p",
        text: "If replies arrive by WhatsApp, phone calls and word of mouth, you end up counting on paper at midnight. When guests reply on the invitation page, every answer lands in one list: who is coming, who is not, who is undecided, and the total number of people.",
      },
      {
        type: "p",
        text: "Remember to ask for the party size, not only yes or no. “Yes” from a family of five is not the same as “yes” from one colleague.",
      },
      { type: "h2", text: "A quick checklist" },
      {
        type: "ul",
        items: [
          "One link with the date, time, map and RSVP",
          "A short message with a clear question and a deadline",
          "Sent to each guest by name",
          "A reminder three days before the deadline",
          "A final note to confirmed guests the day before",
        ],
      },
      {
        type: "p",
        text: "Do these five things and you will know your numbers on time, without chasing anyone.",
      },
    ],
  },
]

export const getPost = (slug: string): Post | undefined =>
  POSTS.find((post) => post.slug === slug)

/** "10 November 2026". */
export const formatPostDate = (date: string): string =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`))
