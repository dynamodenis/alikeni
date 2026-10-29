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
import { PetalField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { BohoSun } from "./BohoSun"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type BohoTerracottaConfig } from "./schema"

/**
 * Boho Terracotta: desert boho in clay and sand.
 *
 * A slowly turning sun (rays over a half-disc) is the crest on the cover,
 * under the hero headline and above the closing; portraits sit in arches;
 * corners are very round; an iridescent shimmer runs behind the script
 * headline; the gallery is a swipeable carousel and the ornament a wave.
 */
function BohoTerracotta({
  config,
  mode,
}: {
  config: BohoTerracottaConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={<BohoSun className="size-24" />}
        decor={
          <PetalField
            shape="leaf"
            seed={51}
            count={18}
            className="opacity-50"
          />
        }
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.45}
        />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <BohoSun className="mt-8 size-16" />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="spotlight"
                portrait="arch"
                eyebrow="Together with their families"
                title="The couple"
              />
              <Divider />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="ring" eyebrow="Until we say yes" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The day" />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline
                tone="tint"
                variant="milestones"
                eyebrow="Our chapters"
                title="How we got here"
              />
            </Reveal>
          ),
          gallery: (
            <Gallery
              variant="carousel"
              effect={meta.effects.gallery}
              eyebrow="Moments"
              title="Sun, sand and us"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection tone="tint" variant="card" eyebrow="Find the creek" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="plain" />
            </Reveal>
          ),
          wishes: <Wishes tone="tint" variant="stream" title="Words for us" />,
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
                crest={<BohoSun className="size-20" />}
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
  Component: BohoTerracotta,
})
