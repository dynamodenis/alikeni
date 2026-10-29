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
  StoryTimeline,
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { BackgroundFx } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { ThenNow } from "./ThenNow"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type ThenAndNowConfig } from "./schema"

/**
 * Then and Now: two photos, two dates.
 *
 * A light editorial headline over a then-and-now pair of square photos,
 * each captioned with its year. Hairline grid, no effects, no reveals; bands
 * alternate plain and surface and the years add up in a milestones story.
 */
function ThenAndNow({
  config,
  mode,
}: {
  config: ThenAndNowConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate variant="minimal" />

      <div className="relative isolate border-b border-inv-line">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          opacity={0}
        />
        <Hero
          variant="editorial"
          titleEffect={meta.effects.title}
          titleClassName="font-light tracking-[-0.03em]"
        >
          <ThenNow
            hosts={config.hosts}
            years={config.years}
            start={config.datetime.start}
            className="mt-10"
          />
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: <Hosts variant="list" portrait="square" />,
          countdown: <Countdown variant="inline" />,
          event: <EventDetails tone="surface" variant="single" />,
          story: (
            <StoryTimeline
              variant="milestones"
              eyebrow={`${config.years} years`}
              title="Years in numbers"
            />
          ),
          gallery: (
            <Gallery
              tone="surface"
              variant="grid"
              effect={meta.effects.gallery}
            />
          ),
          map: <MapSection variant="card" />,
          rsvp: <RsvpForm tone="surface" variant="plain" />,
          wishes: <Wishes variant="stream" />,
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
  Component: ThenAndNow,
  fieldsUi: [
    {
      path: ["years"],
      label: "Years together",
      type: "number",
      min: 1,
      max: 100,
      help: "Shown as the big number",
    },
  ],
})
