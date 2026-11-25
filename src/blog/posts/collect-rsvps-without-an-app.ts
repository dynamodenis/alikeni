import { FREE_PUBLISHED_LIMIT, FREE_RSVP_LIMIT } from "@/lib/plans"
import type { Post } from "../types"

export const collectRsvpsWithoutAnApp: Post = {
  slug: "collect-rsvps-without-an-app",
  title: "How to Collect RSVPs Without an App or a Spreadsheet",
  description:
    "Four ways to collect RSVPs for a wedding, birthday or any event, what to ask each guest, and how to get a final headcount without typing up a list.",
  date: "2026-11-25",
  readMinutes: 7,
  category: "birthday",
  related: ["whatsapp-invitations-rsvp", "whatsapp-wedding-invitation"],
  blocks: [
    {
      type: "p",
      text: "Every host needs the same number: how many people are coming. The caterer wants it, the venue wants it, and so does whoever is hiring the tent and the chairs. Getting that number is harder than it should be, because replies arrive in ten different places and half of them say “will confirm”.",
    },
    {
      type: "p",
      text: "You do not need a special app to fix this, and you do not need to become good at spreadsheets. You need one place where guests answer, and a list that adds itself up.",
    },
    { type: "h2", text: "What an RSVP has to tell you" },
    {
      type: "p",
      text: "Before choosing a method, decide what you need from each guest. For most events it is four things:",
    },
    {
      type: "ul",
      items: [
        "Their name, so you know who answered",
        "Yes, no or not sure yet",
        "How many people are coming with them",
        "Anything you should know: a late arrival, a child, a food allergy",
      ],
    },
    {
      type: "p",
      text: "The third one is where counts go wrong. A “yes” from a family of five is not the same as a “yes” from one colleague, and a method that only records yes or no will leave you short of chairs.",
    },
    { type: "h2", text: "Four ways to collect RSVPs" },
    {
      type: "p",
      text: "Here are the usual options, with what each is good and bad at.",
    },
    {
      type: "ul",
      items: [
        "Replies in WhatsApp. Nothing to set up, and it suits a dinner for ten. Beyond that, answers are scattered across private chats and groups, a thumbs-up could mean anything, and you count by scrolling.",
        "Phone calls. Personal, and the right choice for elders. It is slow for a long list, and you still have to write every answer down somewhere.",
        "An online form. It collects answers in one sheet. It is also a separate link from the invitation, it looks like a survey, and you have to build the form and read the sheet yourself.",
        "An invitation page with RSVP built in. The invitation and the reply are the same link. Guests read the details and answer in one visit, and the answers arrive already counted.",
      ],
    },
    {
      type: "p",
      text: "The fourth option is the least work for you and for your guests. The fewer steps between reading the invitation and answering it, the fewer people put it off.",
    },
    { type: "h2", text: "Set it up in four steps" },
    {
      type: "ol",
      items: [
        "Choose a design. There are templates for [weddings](/templates/wedding), [birthdays](/templates/birthday), [graduations](/templates/graduation), [baby showers](/templates/baby_shower) and [work events](/templates/corporate).",
        "Fill in the event: who, when and where. Keep the RSVP section switched on.",
        "Set the date you need replies by. When it passes, the form closes, so late answers do not change your numbers without you knowing.",
        "Publish and share your link by WhatsApp, SMS or email, or print its QR code on a card.",
      ],
    },
    {
      type: "image",
      src: "/blog/collect-rsvps-without-an-app/countdown.webp",
      alt: "A countdown to the event on a birthday invitation",
      caption:
        "The same page counts down to the day, from the Golden Milestone sample.",
      shot: { template: "birthday/golden-milestone", section: "countdown" },
    },
    {
      type: "p",
      text: "Guests open the link in their phone browser. They tap yes, no or maybe, enter the number of guests and can add a message. They do not create an account and they do not install anything.",
    },
    {
      type: "image",
      src: "/blog/collect-rsvps-without-an-app/rsvp-form.webp",
      alt: "An RSVP form on a birthday invitation with a name field, attendance choices and number of guests",
      caption: "The RSVP form on the Golden Milestone birthday template.",
      shot: { template: "birthday/golden-milestone", section: "rsvp" },
    },
    { type: "h2", text: "Ask in a way that gets an answer" },
    {
      type: "p",
      text: "The tool only works if guests use it. Three habits make the difference: ask a direct question, give a date, and say why you need it. People answer faster when they understand that a caterer is waiting.",
    },
    {
      type: "message",
      label: "First message",
      text: "Hi Anna! We are celebrating Mum's 60th birthday on Saturday 6 March. The details are here:\n[your link]\nPlease tap RSVP on the page by 20 February and tell us how many of you are coming. We give the caterer our numbers that week.",
    },
    {
      type: "message",
      label: "Reminder",
      text: "Hi Anna, a quick reminder about Mum's birthday. We are closing the list on Friday. Could you answer yes or no here today?\n[your link]",
    },
    {
      type: "tip",
      text: "Remind only the people who have not answered. A reminder sent to everyone annoys the guests who replied on the first day.",
    },
    { type: "h2", text: "Follow up on the “maybe” answers" },
    {
      type: "p",
      text: "A “maybe” is useful: it tells you who to follow up with. A week before your deadline, message those guests directly and ask what would help them decide. Often it is one small thing, such as transport or whether children are welcome.",
    },
    {
      type: "p",
      text: "When the deadline passes, make a decision for anyone still undecided. For a seated meal, count them as not coming and tell them kindly that the list is closed. For an open-house event, add a small margin to your numbers.",
    },
    { type: "h2", text: "From replies to a final headcount" },
    {
      type: "p",
      text: "With replies on the invitation page, your dashboard shows who is coming, who is not and who is undecided, with party sizes added up. You can read it on your phone at any time, without counting anything yourself.",
    },
    {
      type: "p",
      text: "When someone else needs the list, such as the caterer, the usher at the door or a family member, export it as a CSV file. It opens in Excel or Google Sheets. That is the only time a spreadsheet appears, and you did not have to type it.",
    },
    {
      type: "tip",
      text: "For a wedding or a formal event you can add your guest list first and give each guest a personal link. The invitation greets them by name and you can see who has opened it. More on that in [how to send invitations on WhatsApp and get real RSVPs](/blog/whatsapp-invitations-rsvp).",
    },
    { type: "h2", text: "What it costs" },
    {
      type: "p",
      text: `Creating and publishing an invitation on Alikeni is free. A free invitation accepts up to ${FREE_RSVP_LIMIT} RSVPs and stays online until the day after the event, and one account can publish ${FREE_PUBLISHED_LIMIT} free invitations. An RSVP is one reply, so a family of five that answers together uses one of them. If you expect more replies than that, a one-time Premium upgrade for that invitation removes the limit.`,
    },
    { type: "h2", text: "Questions about collecting RSVPs" },
    {
      type: "faq",
      items: [
        {
          q: "Do guests need an app or an account to RSVP?",
          a: "No. The invitation opens in any phone browser. Guests tap yes, no or maybe, add how many are coming and send.",
        },
        {
          q: "What does RSVP mean?",
          a: "It comes from the French for “please reply”. On an invitation it means the host needs to know whether you are coming, usually by a certain date.",
        },
        {
          q: "When should the RSVP deadline be?",
          a: "Ask your caterer and venue when they need a final number, then set your deadline about a week before that. For most weddings this is two to three weeks before the day; for a small party, one week is usually enough.",
        },
        {
          q: "Can I get the guest list as a spreadsheet?",
          a: "Yes. You can export your RSVPs as a CSV file, which opens in Excel and Google Sheets.",
        },
      ],
    },
    {
      type: "p",
      text: "Planning a wedding? Read [how to make and send a WhatsApp wedding invitation](/blog/whatsapp-wedding-invitation) next.",
    },
  ],
}
