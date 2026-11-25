// Collections: landing pages that gather templates from several categories
// under what people search for (/templates/islamic). They use the same page
// as an occasion (`category-pages.ts`) and pick their templates by tag, so a
// new template with the tag joins the page as soon as it ships.
import type { CategoryPage } from "./category-pages"

export const COLLECTIONS = ["islamic"] as const
export type Collection = (typeof COLLECTIONS)[number]

export const isCollection = (value: string): value is Collection =>
  (COLLECTIONS as ReadonlyArray<string>).includes(value)

export type CollectionPage = CategoryPage & {
  /** Short name in breadcrumbs and headings ("Islamic"). */
  label: string
  /** Templates carrying this tag (meta.tags) are listed. */
  tag: string
}

export const COLLECTION_PAGES: Record<Collection, CollectionPage> = {
  islamic: {
    label: "Islamic",
    tag: "islamic",
    title: "Islamic Invitations: Nikah, Walima, Eid & Aqiqah · Alikeni",
    description:
      "Online Islamic invitation templates for a nikah, walima, Eid open house, aqiqah or khitanan, with RSVP, countdown and venue map. Share by link or WhatsApp.",
    lead: "Islamic",
    accent: "invitations online",
    intro:
      "Invitations for a nikah and walima, an Eid open house, an aqiqah or a khitanan: designs with geometric patterns, crescents and lanterns, the venue on a map and an RSVP form. Pick one, change the words and share a single link.",
    about: [
      "These designs are made for Muslim celebrations. Each shows the hosts and their families, the date with a countdown, the venue on a map with directions and an RSVP form.",
      "Royal Islamic is for a nikah and walima, in emerald and gold with geometric star patterns, a Bismillah line above the names and portraits in mihrab arches. List the nikah and the walima as separate events, each with its own time and venue, and guests can save both to their calendar.",
      "Eid Open House invites family, friends and neighbours for Eid al-Fitr or Eid al-Adha, with one time window and your address. Aqiqah Soft welcomes a new baby, and Khitanan Ceria is for a khitanan thanksgiving. The samples for those two are written in Bahasa Indonesia; switch the invitation language to English in the editor and write your own words.",
    ],
    linkLabel: "Islamic invitations",
    questions: [
      {
        q: "Is there a nikah invitation template?",
        a: "Yes. Royal Islamic is made for a nikah and walima. The headline opens with a Bismillah line and the seal is captioned Nikah.",
      },
      {
        q: "Can the nikah and the walima have separate times and venues?",
        a: "Yes. Add each as its own event with a time and a venue. Guests see both and can save them to their calendar.",
      },
      {
        q: "Is there an invitation for Eid?",
        a: "Yes. Eid Open House is made for an open house on Eid al-Fitr or Eid al-Adha. Guests see the time window and the address, and the RSVP tells you how many to cook for.",
      },
      {
        q: "Is it free?",
        a: "Yes. You can create, publish and share an invitation for free. A one-time Premium upgrade per invitation adds more responses, gift details and a page that stays online.",
      },
    ],
  },
}
