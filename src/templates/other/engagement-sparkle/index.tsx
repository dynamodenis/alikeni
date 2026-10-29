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
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { Monogram, StarField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type EngagementSparkleConfig } from "./schema"

/**
 * Engagement Sparkle: she said yes.
 *
 * StarField sparkles drift over an iridescent lavender wash, the couple's
 * monogram is the crest on the cover and the closing, the countdown is a
 * ring, and the proposal photos turn in a carousel.
 */
function EngagementSparkle({
  config,
  mode,
}: {
  config: EngagementSparkleConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <Monogram hosts={config.hosts} />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={crest}
        decor={<StarField seed={281} sparkles={14} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.45}
        />
        <StarField seed={283} className="opacity-60" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="duo"
                portrait="circle"
                eyebrow="She said yes"
                title="The happy couple"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="ring" eyebrow="Celebrating in" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The evening" />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="carousel"
              effect={meta.effects.gallery}
              eyebrow="The proposal"
              title="The moment it happened"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Find us" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="stream" title="Congratulations" />
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
  Component: EngagementSparkle,
})
