// The editor's wording per template category. Every template shares one
// config (hosts, programme, story, texts), so the fields are the same; only
// the labels, hints and examples change, so a conference host is not asked
// for a "family line" or a "ceremony".
import type { Host } from "@/templates/_shared/schema"
import type { TemplateCategory } from "@/templates/types"

type Role = Host["role"]

export type EditorCopy = {
  titlePlaceholder: string
  subtitlePlaceholder: string
  peopleTitle: string
  peopleDescription: string
  /** Singular noun for one entry in the people list: "Add speaker". */
  person: string
  /** Roles offered for this category, in order. */
  roles: ReadonlyArray<Role>
  /** Role a newly added person starts with. */
  newRole: Role
  roleLabels: Partial<Record<Role, string>>
  shortNameHelp: string
  /** The line under a person's name (`parentsLine`). */
  lineLabel: string
  linePlaceholder: string
  /** What the person presents (`topic`); null hides the field. */
  topicLabel: string | null
  topicPlaceholder: string
  ticketsDescription: string
  tierPlaceholder: string
  sponsorsTitle: string
  sponsorsDescription: string
  sponsorsHeadingPlaceholder: string
  /** Singular noun for one sponsor entry: "Add vendor". */
  sponsor: string
  programmeDescription: string
  storyDescription: string
  storyTitlePlaceholder: string
  venueNotesPlaceholder: string
  dressCodePlaceholder: string
}

const ROLE_LABELS: Record<Role, string> = {
  bride: "Bride",
  groom: "Groom",
  host: "Host",
  graduate: "Graduate",
  celebrant: "Celebrant",
  baby: "Baby",
  company: "Company",
  other: "Other",
}

const ALL_ROLES = Object.keys(ROLE_LABELS) as Array<Role>

const BASE: EditorCopy = {
  titlePlaceholder: "A Dinner with Amara & Kofi",
  subtitlePlaceholder: "An evening with friends and family",
  peopleTitle: "Who is hosting",
  peopleDescription: "The people guests are invited by or are celebrating.",
  person: "person",
  roles: ALL_ROLES,
  newRole: "host",
  roleLabels: {},
  shortNameHelp: "Used in headlines, e.g. “Amara”.",
  lineLabel: "Line under the name",
  linePlaceholder: "A few words about this person",
  topicLabel: null,
  topicPlaceholder: "",
  ticketsDescription:
    "Only if guests pay or book to attend. Prices are shown as you type them; nothing is charged through the invitation.",
  tierPlaceholder: "Per person",
  sponsorsTitle: "Vendors, sponsors & thanks",
  sponsorsDescription:
    "Optional: sponsors, the planner, caterer, photographer or anyone you want to credit. A logo, or just the name.",
  sponsorsHeadingPlaceholder: "With thanks to",
  sponsor: "vendor",
  programmeDescription:
    "The parts of the day, in order. Leave empty to show just the main event.",
  storyDescription: "Moments in order, each with a date, a title and a photo.",
  storyTitlePlaceholder: "How it began",
  venueNotesPlaceholder: "Parking is available at the main gate.",
  dressCodePlaceholder: "Smart casual",
}

const BY_CATEGORY: Record<TemplateCategory, Partial<EditorCopy>> = {
  wedding: {
    titlePlaceholder: "The Wedding of Amara & Kofi",
    subtitlePlaceholder: "Together with their families",
    peopleTitle: "The couple",
    peopleDescription: "The two of you, and anyone else hosting.",
    roles: ["bride", "groom", "host", "other"],
    lineLabel: "Family line",
    linePlaceholder: "Daughter of Mr. & Mrs. Kamau",
    programmeDescription:
      "Ceremony, reception, cake… Leave empty to show just the main event.",
    storyDescription: "Milestones in order: how you met, the proposal.",
    storyTitlePlaceholder: "How we met",
    dressCodePlaceholder: "Formal, in shades of green",
  },
  anniversary: {
    titlePlaceholder: "Amara & Kofi: 25 Years",
    subtitlePlaceholder: "Celebrating a quarter century together",
    peopleTitle: "The couple",
    peopleDescription: "The two celebrating, and anyone else hosting.",
    roles: ["host", "bride", "groom", "celebrant", "other"],
    linePlaceholder: "Married in Nairobi, June 2002",
    programmeDescription:
      "Dinner, speeches, dancing… Leave empty to show just the main event.",
    storyDescription:
      "Your years together: the wedding, the moves, the family.",
    storyTitlePlaceholder: "The day we married",
  },
  birthday: {
    titlePlaceholder: "Amara Turns 30",
    subtitlePlaceholder: "Dinner, dancing and cake",
    peopleTitle: "Who is celebrating",
    peopleDescription: "The birthday star, and anyone hosting the party.",
    roles: ["celebrant", "host", "other"],
    newRole: "celebrant",
    linePlaceholder: "Thirty, flirty and thriving",
    programmeDescription:
      "Arrival, dinner, cake… Leave empty to show just the main event.",
    storyDescription: "Highlights through the years.",
    storyTitlePlaceholder: "The early years",
  },
  graduation: {
    titlePlaceholder: "Amara's Graduation",
    subtitlePlaceholder: "Bachelor of Science, Class of 2027",
    peopleTitle: "The graduate",
    peopleDescription: "The graduate, and the family or friends hosting.",
    roles: ["graduate", "host", "other"],
    newRole: "graduate",
    lineLabel: "Degree or family line",
    linePlaceholder: "BSc Computer Science, University of Nairobi",
    programmeDescription:
      "Ceremony, photos, lunch… Leave empty to show just the main event.",
    storyDescription: "The journey: first day, the thesis, the finish line.",
    storyTitlePlaceholder: "First day on campus",
  },
  baby_shower: {
    titlePlaceholder: "A Baby Shower for Amara",
    subtitlePlaceholder: "Join us to welcome the little one",
    peopleTitle: "Parents and baby",
    peopleDescription: "The parents-to-be, the baby, and anyone hosting.",
    roles: ["host", "baby", "other"],
    roleLabels: { host: "Parent or host" },
    linePlaceholder: "Expecting in March",
    programmeDescription:
      "Games, gifts, lunch… Leave empty to show just the main event.",
    storyDescription: "The journey so far.",
    storyTitlePlaceholder: "The big news",
  },
  corporate: {
    titlePlaceholder: "Build East Africa 2027",
    subtitlePlaceholder: "One day for the people building the region",
    peopleTitle: "Organiser and speakers",
    peopleDescription:
      "The company hosting, plus speakers, panellists or guests of honour.",
    person: "speaker",
    roles: ["company", "host", "other"],
    newRole: "other",
    roleLabels: {
      company: "Company / organiser (shown as “Hosted by”)",
      host: "Host (shown as “Your Host”)",
      other: "Speaker or guest (not in the closing signature)",
    },
    shortNameHelp: "Used in headlines, e.g. “Wambui” or the company name.",
    lineLabel: "Job title and company",
    linePlaceholder: "CTO, Kilimo Data",
    topicLabel: "Talk or topic",
    topicPlaceholder: "Opening keynote: building for low bandwidth",
    ticketsDescription:
      "Ticket types and prices, with a link to where guests register or pay. Prices are shown as you type them; nothing is charged through the invitation.",
    tierPlaceholder: "Early bird",
    sponsorsTitle: "Sponsors & partners",
    sponsorsDescription:
      "The organisations backing the event. A logo, or just the name.",
    sponsorsHeadingPlaceholder: "Sponsors & partners",
    sponsor: "sponsor",
    programmeDescription:
      "Registration, keynote, sessions, networking… Leave empty to show just the main event.",
    storyDescription:
      "Optional. About the organisation or the event's history, in order.",
    storyTitlePlaceholder: "Our first edition",
    venueNotesPlaceholder:
      "Enter through Gate B; badges are at the front desk.",
    dressCodePlaceholder: "Business casual",
  },
  other: {
    topicLabel: "Talk, topic or part in the event",
    topicPlaceholder: "Master of ceremonies",
    sponsorsTitle: "Sponsors & partners",
    sponsorsDescription:
      "Sponsors, partners or vendors you want to credit. A logo, or just the name.",
    sponsorsHeadingPlaceholder: "Sponsors & partners",
    sponsor: "sponsor",
  },
}

export function editorCopy(category: TemplateCategory): EditorCopy {
  return { ...BASE, ...BY_CATEGORY[category] }
}

/**
 * Role choices for one person: the category's roles, plus the role already
 * saved when it is not among them (it must stay selectable).
 */
export function roleOptions(
  copy: EditorCopy,
  current: Role | undefined
): Array<{ value: Role; label: string }> {
  const roles =
    current && !copy.roles.includes(current)
      ? [...copy.roles, current]
      : copy.roles
  return roles.map((value) => ({
    value,
    label: copy.roleLabels[value] ?? ROLE_LABELS[value],
  }))
}
