// What a template's sample invitation contains, in page order, for the
// "What's inside" list on its template page. Read from the template's own
// defaults, so the list cannot drift from the design. Only `defaults.ts` is
// loaded (data, no components).
import type { InvitationConfigBase } from "./_shared/schema"

const DEFAULTS = import.meta.glob<{ defaults: InvitationConfigBase }>(
  "./*/*/defaults.ts"
)

type SectionId = InvitationConfigBase["sectionsOrder"][number]
type HostRole = InvitationConfigBase["hosts"][number]["role"]

const HOSTS_LABEL: Partial<Record<HostRole, string>> = {
  bride: "The couple",
  groom: "The couple",
  celebrant: "Guest of honour",
  graduate: "The graduate",
  baby: "Parents and baby",
  company: "Organiser and speakers",
}

const SECTION_LABELS: Record<Exclude<SectionId, "hosts">, string> = {
  hero: "Headline",
  countdown: "Countdown",
  event: "Event details and schedule",
  story: "Story timeline",
  gallery: "Photo gallery",
  map: "Map and directions",
  rsvp: "RSVP form",
  wishes: "Guest wishes",
  gifts: "Gifts (Premium)",
  admission: "Tickets and prices",
  sponsors: "Sponsors and partners",
  calendar: "Add to calendar",
  closing: "Closing message",
}

/** Sections switched off in `features` are left out, as on the invitation. */
export function sectionLabels(config: InvitationConfigBase): Array<string> {
  const features: Partial<Record<string, boolean>> = config.features
  const roles = config.hosts.map((host) => host.role)
  const hostsLabel =
    (roles.includes("baby") ? HOSTS_LABEL.baby : HOSTS_LABEL[roles[0]]) ??
    "Hosts"
  const labels = [
    "Opening cover",
    ...config.sectionsOrder
      .filter((section) => features[section] !== false)
      .map((section) =>
        section === "hosts" ? hostsLabel : SECTION_LABELS[section]
      ),
  ]
  if (config.features.music && config.music.enabled) {
    labels.push("Background music")
  }
  return labels
}

export async function loadTemplateSections(id: string): Promise<Array<string>> {
  const load = DEFAULTS[`./${id}/defaults.ts`] as
    (() => Promise<{ defaults: InvitationConfigBase }>) | undefined
  return load ? sectionLabels((await load()).defaults) : []
}
