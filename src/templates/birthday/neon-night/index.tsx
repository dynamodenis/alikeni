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
  MapSection,
  MusicPlayer,
  RsvpForm,
  Sections,
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { StarField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { NeonSign } from "./NeonSign"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type NeonNightConfig } from "./schema"

/**
 * Neon Night: neon tubes after dark.
 *
 * The age is a glowing, flickering neon sign on the cover and again under a
 * poster headline; a bold aurora rolls behind it with a city haze of stars
 * on top. Hairline dividers, sharp corners, dark palette; the schedule reads
 * as a lineup and the gallery is last year's blur.
 */
function NeonNight({
  config,
  mode,
}: {
  config: NeonNightConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={<NeonSign text={String(config.age)} size="sm" />}
        decor={<StarField seed={101} count={50} sparkles={4} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.5}
        />
        <StarField seed={103} count={40} sparkles={0} className="opacity-50" />
        <Hero
          variant="poster"
          titleEffect={meta.effects.title}
          kicker="Doors open late"
        >
          <NeonSign text={`${config.age} tonight`} className="mt-6" />
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-inv-muted">
            {config.texts.message}
          </p>
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          countdown: (
            <Countdown
              tone="tint"
              variant="inline"
              eyebrow="Lights on in"
              doneLabel="Lights on!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="Lineup" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="masonry"
              effect={meta.effects.gallery}
              eyebrow="Flashback"
              title="Last year's blur"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="The venue" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="plain" title="On the list?" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="stream" title="Shout-outs" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="banner"
                decor={
                  <StarField
                    seed={105}
                    count={40}
                    sparkles={3}
                    className="opacity-60"
                  />
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
  Component: NeonNight,
  fieldsUi: [
    {
      path: ["age"],
      label: "Age being celebrated",
      type: "number",
      min: 1,
      max: 150,
      help: "Lit up as the neon sign.",
    },
  ],
})
