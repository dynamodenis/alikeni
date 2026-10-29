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
import { schema, type GoldenMilestoneConfig } from "./schema"

/**
 * Golden Milestone: a formal milestone birthday in navy and gold.
 *
 * A rosette seal carries the age on the cover and the closing; the foil
 * poster headline sits over bold silk and a seeded star field; the hosts
 * block spotlights the celebrant, the story reads as decade milestones and
 * the gallery is a tilted mosaic. Diamond ornament, sharp corners, no grain.
 */
function GoldenMilestone({
  config,
  mode,
}: {
  config: GoldenMilestoneConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <Seal label={String(config.age)} caption="Years" />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={crest}
        decor={<StarField seed={121} className="opacity-70" />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.45}
        />
        <StarField seed={123} count={50} sparkles={5} className="opacity-50" />
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
              <Hosts
                variant="spotlight"
                portrait="circle"
                eyebrow="Celebrating"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="inline"
              eyebrow="The celebration begins in"
              doneLabel="Raise a glass!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The evening" />
              <Divider />
            </Reveal>
          ),
          story: (
            <StoryTimeline
              tone="tint"
              variant="milestones"
              eyebrow="Six decades"
              title="A life well lived"
            />
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="mosaic"
                effect={meta.effects.gallery}
                eyebrow="Moments"
                title="Through the years"
              />
            </Reveal>
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection tone="tint" variant="split" eyebrow="The ballroom" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="card" />
            </Reveal>
          ),
          wishes: (
            <Wishes tone="tint" variant="cards" title="Toasts & tributes" />
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={crest}
                decor={
                  <StarField seed={127} count={40} className="opacity-50" />
                }
              />
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
  Component: GoldenMilestone,
  fieldsUi: [
    {
      path: ["age"],
      label: "Age being celebrated",
      type: "number",
      min: 1,
      max: 150,
      help: "Shown inside the seal.",
    },
  ],
})
