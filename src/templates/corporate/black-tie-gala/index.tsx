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
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { Seal, StarField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type BlackTieGalaConfig } from "./schema"

/**
 * Black Tie Gala: an evening in foil and starlight.
 *
 * A "Gala" seal crest on the cover and in the closing, a foil headline over
 * bold silk and a StarField, a "Programme" of cards, a tilting mosaic of last
 * year and formal copy throughout. Diamond ornament, nearly square corners.
 */
function BlackTieGala({
  config,
  mode,
}: {
  config: BlackTieGalaConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <Seal label="2027" caption="Gala" />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={crest}
        decor={<StarField seed={251} className="opacity-70" />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.45}
        />
        <StarField seed={253} className="opacity-60" />
        <Hero
          variant="classic"
          titleEffect={meta.effects.title}
          titleClassName="inv-foil tracking-[0.05em]"
        >
          <Divider />
          <p className="text-xs tracking-[0.35em] text-inv-muted uppercase">
            {config.texts.dressCode ?? "Black tie"}
          </p>
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts variant="spotlight" portrait="circle" title="Hosted by" />
            </Reveal>
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails
                tone="tint"
                variant="cards"
                eyebrow="The evening"
                title="Programme"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown variant="inline" eyebrow="The evening begins in" />
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="mosaic"
              effect={meta.effects.gallery}
              eyebrow="A night to remember"
              title="Last year"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="split" eyebrow="The venue" />
            </Reveal>
          ),
          rsvp: (
            <RsvpForm tone="tint" variant="card" title="Confirm attendance" />
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={crest}
                decor={<StarField seed={255} className="opacity-50" />}
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
  Component: BlackTieGala,
})
