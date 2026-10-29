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
import { Flourishes, PetalField, Seal, StarField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type ChristmasDinnerConfig } from "./schema"

/**
 * Christmas Dinner: a candlelit table.
 *
 * Twinkle-light stars and holly leaves drift over the cover, a seal reads
 * "25 December", botanical flourishes frame the hero, one "Dinner is served"
 * card holds the details and a carousel replays last year. Warm grain.
 */
function ChristmasDinner({
  config,
  mode,
}: {
  config: ChristmasDinnerConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <Seal label="25" caption="December" />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={crest}
        decor={
          <>
            <StarField seed={331} className="opacity-60" />
            <PetalField
              shape="leaf"
              seed={333}
              count={16}
              className="opacity-50"
            />
          </>
        }
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.35}
        />
        <Flourishes className="m-4 size-20 opacity-50 sm:m-8 sm:size-28" />
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
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="duo"
                portrait="circle"
                eyebrow="Your hosts"
                title="Hosted by"
              />
            </Reveal>
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails
                tone="tint"
                variant="single"
                eyebrow="Christmas Day"
                title="Dinner is served"
              />
            </Reveal>
          ),
          countdown: <Countdown variant="boxes" eyebrow="Christmas in" />,
          gallery: (
            <Gallery
              tone="tint"
              variant="carousel"
              effect={meta.effects.gallery}
              eyebrow="Last Christmas"
              title="Around the table"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Find our door" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title="Season's wishes" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={crest}
                decor={<StarField seed={335} className="opacity-60" />}
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
  Component: ChristmasDinner,
})
