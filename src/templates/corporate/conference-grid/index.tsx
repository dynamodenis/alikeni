import {
  AddToCalendar,
  Closing,
  Countdown,
  CoverGate,
  Divider,
  EventDetails,
  Footer,
  Gallery,
  Hero,
  Hosts,
  MapSection,
  MusicPlayer,
  RsvpForm,
  Sections,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { GridLines } from "./GridLines"
import { meta } from "./meta"
import { schema, type ConferenceGridConfig } from "./schema"

/**
 * Conference Grid: graph paper.
 *
 * Hairline GridLines behind the cover and an editorial, left-aligned hero,
 * the "Schedule" timeline in a tint band, speakers as a square-portrait list
 * and square corners everywhere. No effects; a line ornament.
 */
function ConferenceGrid({
  config,
  mode,
}: {
  config: ConferenceGridConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate variant="minimal" decor={<GridLines />} />

      <div className="relative isolate border-b border-inv-line">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          opacity={0}
        />
        <GridLines className="opacity-60" />
        <Hero
          variant="editorial"
          titleEffect={meta.effects.title}
          kicker="Conference · 2027"
        >
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          event: (
            <EventDetails
              tone="tint"
              variant="timeline"
              eyebrow="13 May"
              title="Schedule"
            />
          ),
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="list"
                portrait="square"
                eyebrow="On stage"
                title="Speakers"
              />
            </Reveal>
          ),
          countdown: <Countdown variant="boxes" eyebrow="Doors open in" />,
          gallery: (
            <Gallery
              tone="tint"
              variant="grid"
              effect={meta.effects.gallery}
              eyebrow="2026"
              title="Previous edition"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" title="Venue" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="plain" title="Register" />,
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing variant="banner" />
              <Footer />
            </>
          ),
        }}
      />

      <MusicPlayer />
    </div>
  )
}

export default defineTemplate({
  meta,
  schema,
  defaults,
  Component: ConferenceGrid,
})
