import { FREE_RSVP_LIMIT } from "@/lib/plans"
import { Faq, type FaqItem } from "./Faq"
import { OccasionLinks } from "./OccasionLinks"
import { SectionHeading } from "./SectionHeading"

const QUESTIONS: Array<FaqItem> = [
  {
    q: "What is Alikeni?",
    a: "Alikeni is an online invitation maker. You pick a design, add your event details, photos and music, and get an invitation website to share with one link. Guests open it on their phone and RSVP right there.",
  },
  {
    q: "Is it free to create an invitation?",
    a: `Yes. Creating, publishing and sharing an invitation is free. A free invitation takes up to ${FREE_RSVP_LIMIT} RSVPs and stays online until the day after the event. A one-time Premium upgrade for that invitation removes both limits and adds a gift section.`,
  },
  {
    q: "How do guests RSVP?",
    a: "They tap yes, no or maybe on the invitation, add their party size and an optional message. No account and no app. You see every response on your dashboard and can export the guest list as a spreadsheet.",
  },
  {
    q: "How do I send the invitation?",
    a: "Share the link anywhere: WhatsApp, SMS, email or social media, or print its QR code on a card. You can also give each guest a personal link that greets them by name.",
  },
  {
    q: "Which events can I make an invitation for?",
    a: "Weddings, birthdays, graduations, baby showers, anniversaries, corporate events, engagements, housewarmings, reunions, religious and holiday gatherings. Any design can be reworded for your own occasion.",
  },
  {
    q: "Do I need design skills?",
    a: "No. Every template is ready to use. You change the words, colours, fonts, photos and music in a simple editor and see the result as you type.",
  },
]

/** Plain-text answers to what people ask before they start, plus occasion links. */
export function HomeFaq() {
  return (
    <section id="faq" className="scroll-mt-24 px-4 py-28 sm:px-6">
      <SectionHeading
        eyebrow="Questions"
        title="Online invitations,"
        accent="explained"
        description="What Alikeni is, what it costs and how your guests reply."
      />
      <div className="mt-14">
        <Faq items={QUESTIONS} />
      </div>
      <h3 className="mt-20 text-center heading-3">
        Find an invitation for your occasion
      </h3>
      <OccasionLinks className="mt-8" />
    </section>
  )
}
