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
import { Seal, StarField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type GoldenYearsConfig } from "./schema"

/**
 * Golden Years: fifty golden years.
 *
 * A foil seal carries the years as the crest; the poster headline is foil
 * over bold silk with a faint star shimmer; the story reads as five decades
 * of milestones and the photos fall into a tilting mosaic. Diamond ornament.
 */
function GoldenYears({
  config,
  mode,
}: {
  config: GoldenYearsConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <Seal label={String(config.years)} caption="Years" />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={crest}
        decor={<StarField seed={231} className="opacity-50" />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.45}
        />
        <Hero
          variant="poster"
          titleEffect={meta.effects.title}
          titleClassName="inv-foil tracking-[0.05em]"
          kicker={config.event.subtitle}
        >
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts variant="duo" portrait="circle" title="Still us" />
            </Reveal>
          ),
          countdown: <Countdown tone="tint" variant="inline" />,
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The celebration" />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline
                tone="tint"
                variant="milestones"
                eyebrow={`${config.years} years`}
                title="Five decades"
              />
            </Reveal>
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="mosaic"
                effect={meta.effects.gallery}
                title="Through the years"
              />
            </Reveal>
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection tone="tint" variant="split" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="card" />
            </Reveal>
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes tone="tint" variant="cards" title="Toasts" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing variant="signature" crest={crest} />
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
  Component: GoldenYears,
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
