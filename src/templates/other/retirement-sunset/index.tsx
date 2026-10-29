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
import { WaveLines } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { Horizon } from "./Horizon"
import { meta } from "./meta"
import { schema, type RetirementSunsetConfig } from "./schema"

/**
 * Retirement Sunset: a career's golden hour.
 *
 * A half sun setting on the horizon is the crest, wave lines roll beneath
 * the cover and hero, the story becomes "Career highlights" milestones and
 * the photos sit in a mosaic. Terracotta, wave ornament, no grain.
 */
function RetirementSunset({
  config,
  mode,
}: {
  config: RetirementSunsetConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <Horizon className="size-24" />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={crest}
        decor={<WaveLines seed={321} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.4}
        />
        <WaveLines rows={6} seed={323} className="opacity-60" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
          <p className="text-xs tracking-[0.35em] text-inv-muted uppercase">
            {config.event.title}
          </p>
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
                eyebrow="With gratitude"
                title="Honouring"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="inline" eyebrow="The sun sets in" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The evening" />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline
                tone="tint"
                variant="milestones"
                eyebrow="Thirty-five years"
                title="Career highlights"
              />
            </Reveal>
          ),
          gallery: (
            <Gallery
              variant="mosaic"
              effect={meta.effects.gallery}
              eyebrow="Over the years"
              title="Snapshots from the wards"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection tone="tint" variant="card" eyebrow="Getting there" />
            </Reveal>
          ),
          rsvp: <RsvpForm variant="card" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes tone="tint" variant="cards" title="Farewell notes" />
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
  Component: RetirementSunset,
})
