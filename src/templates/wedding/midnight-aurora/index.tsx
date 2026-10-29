import {
  AddToCalendar,
  Closing,
  Countdown,
  CoverGate,
  Divider,
  EventDetails,
  Footer,
  Gallery,
  GiftEnvelope,
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
import { Monogram, StarField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type MidnightAuroraConfig } from "./schema"

/**
 * Midnight Aurora: a night sky for an evening wedding.
 *
 * A seeded star field sits under a bold aurora behind an editorial, foil
 * headline set in a thin modern sans; a small monogram crest opens the cover,
 * the schedule runs as a timeline and the closing banner returns to the stars.
 */
function MidnightAurora({
  config,
  mode,
}: {
  config: MidnightAuroraConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <Monogram hosts={config.hosts} />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={crest}
        decor={<StarField seed={31} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.55}
        />
        <StarField seed={37} className="opacity-80" />
        <Hero
          variant="editorial"
          titleEffect={meta.effects.title}
          titleClassName="inv-foil tracking-tight"
          kicker={config.event.subtitle}
        />
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="duo"
                portrait="circle"
                eyebrow="Together with their families"
                title="The couple"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="inline" eyebrow="Until nightfall" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="The evening" />
              <Divider />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline
                variant="list"
                eyebrow="Constellations"
                title="Our story"
              />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="masonry"
              effect={meta.effects.gallery}
              eyebrow="After dark"
              title="Moments in low light"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Finding the terrace" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="plain" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="stream" title="Wishes for the night" />
            </Reveal>
          ),
          gifts: (
            <Reveal motion={motion}>
              <GiftEnvelope variant="cards" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="banner"
                decor={
                  <StarField seed={41} count={50} className="opacity-70" />
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
  Component: MidnightAurora,
})
