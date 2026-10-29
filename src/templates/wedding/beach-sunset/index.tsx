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
import { WaveLines } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type BeachSunsetConfig } from "./schema"

/**
 * Beach Sunset: a horizon at golden hour.
 *
 * Seeded swell lines drift across the cover and hero while bold WebGL waves
 * roll behind the headline; a ring counts down to sunset, beach photos swipe
 * past in a carousel, and every card wears soft rounded corners.
 */
function BeachSunset({
  config,
  mode,
}: {
  config: BeachSunsetConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const cover = config.gallery.at(0)
  const place = config.venue.placeName ?? config.venue.name

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="split"
        imageUrl={cover?.url}
        imageAlt={cover?.alt}
        decor={<WaveLines seed={61} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.6}
        />
        <WaveLines rows={7} seed={67} className="opacity-70" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
          <p className="text-xs tracking-[0.35em] text-inv-muted uppercase">
            Ceremony at sunset · {place}
          </p>
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
                eyebrow="Together with their families"
                title="The couple"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="ring" eyebrow="Until sunset" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="single" eyebrow="The day" />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline
                tone="tint"
                variant="alternating"
                eyebrow="Our story"
                title="Tides that brought us here"
              />
            </Reveal>
          ),
          gallery: (
            <Gallery
              variant="carousel"
              effect={meta.effects.gallery}
              eyebrow="Postcards"
              title="From the shore"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection
                tone="tint"
                variant="embed"
                eyebrow="Find the beach"
              />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="plain" title="Will you be there?" />
            </Reveal>
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes tone="tint" variant="stream" title="Notes in a bottle" />
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
                decor={<WaveLines rows={6} seed={71} className="opacity-60" />}
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
  Component: BeachSunset,
})
