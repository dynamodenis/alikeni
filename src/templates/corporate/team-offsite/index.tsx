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
import { PetalField, WaveLines } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type TeamOffsiteConfig } from "./schema"
import { TrailBadge } from "./TrailBadge"

/**
 * Team Offsite: into the hills.
 *
 * WaveLines as rolling hills under drifting leaves, a TrailBadge crest (map
 * pin over a winding dashed path) on the cover and in the closing, an
 * "Itinerary" timeline and a split "Getting there" map. Wave ornament.
 */
function TeamOffsite({
  config,
  mode,
}: {
  config: TeamOffsiteConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <TrailBadge className="size-20" />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={crest}
        decor={<WaveLines seed={271} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.45}
        />
        <WaveLines rows={6} seed={273} className="opacity-60" />
        <PetalField shape="leaf" seed={275} count={14} className="opacity-50" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
          <p className="text-xs tracking-[0.35em] text-inv-muted uppercase">
            {config.venue.placeName ?? config.venue.name}
          </p>
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          countdown: (
            <Countdown tone="tint" variant="inline" eyebrow="We head out in" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails
                variant="timeline"
                eyebrow="Two days"
                title="Itinerary"
              />
            </Reveal>
          ),
          hosts: (
            <Reveal motion={motion}>
              <Hosts variant="list" portrait="circle" title="Your hosts" />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="masonry"
              effect={meta.effects.gallery}
              eyebrow="Memories"
              title="Last retreat"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="split" title="Getting there" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="plain" title="Count me in" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="stream" title="Shout-outs" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing variant="banner" crest={crest} />
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
  Component: TeamOffsite,
})
