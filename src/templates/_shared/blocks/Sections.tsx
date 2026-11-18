import { Fragment } from "react"
import type { ReactNode } from "react"
import type { Features, InvitationConfigBase, SectionId } from "../schema"
import { Admission } from "./Admission"
import { Sponsors } from "./Sponsors"

/** Sections that only render when their feature flag is on. */
export const FEATURE_FOR: Partial<Record<SectionId, keyof Features>> = {
  countdown: "countdown",
  story: "story",
  gallery: "gallery",
  map: "map",
  rsvp: "rsvp",
  wishes: "wishes",
  gifts: "gifts",
  calendar: "calendar",
}

export function isSectionEnabled(
  id: SectionId,
  // The editor passes drafts as stored: ones saved before tickets and
  // sponsors existed have neither key.
  config: Pick<
    InvitationConfigBase,
    "features" | "gallery" | "story" | "gifts"
  > &
    Partial<Pick<InvitationConfigBase, "admission" | "sponsors">>
): boolean {
  const flag = FEATURE_FOR[id]
  if (flag && !config.features[flag]) return false
  if (id === "gallery" && config.gallery.length === 0) return false
  if (id === "story" && config.story.length === 0) return false
  if (id === "gifts" && !config.gifts.enabled) return false
  if (id === "admission")
    return (config.admission?.tiers.length ?? 0) > 0 || !!config.admission?.url
  if (id === "sponsors") return (config.sponsors?.items.length ?? 0) > 0
  return true
}

export type SectionMap = Partial<Record<SectionId, ReactNode>>

/**
 * Renders a template's section map in the invitation's `sectionsOrder`,
 * skipping disabled features and empty content. Templates stay declarative.
 * Tickets and sponsors have a shared default, so every template shows them
 * without listing them; a template can still pass its own.
 */
export function Sections({
  config,
  sections,
}: {
  config: InvitationConfigBase
  sections: SectionMap
}) {
  const all: SectionMap = {
    admission: <Admission tone="tint" />,
    sponsors: <Sponsors />,
    ...sections,
  }
  return (
    <>
      {config.sectionsOrder
        .filter((id) => isSectionEnabled(id, config) && all[id])
        .map((id) => (
          <Fragment key={id}>{all[id]}</Fragment>
        ))}
    </>
  )
}
