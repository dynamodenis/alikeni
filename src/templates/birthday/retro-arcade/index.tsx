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
import { PixelField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { ScoreBoard } from "./ScoreBoard"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type RetroArcadeConfig } from "./schema"

/**
 * Retro Arcade: an 8-bit birthday.
 *
 * Seeded pixel blocks twinkle behind the cover and the hero; the age is a
 * zero-padded HI-SCORE on a dotted scoreboard that blinks INSERT COIN; the
 * poster headline splits in letter by letter. Square corners, dot dividers,
 * levels for a schedule and "Continue? Always." to close.
 */
function RetroArcade({
  config,
  mode,
}: {
  config: RetroArcadeConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={<ScoreBoard age={config.age} compact />}
        decor={<PixelField seed={111} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0}
        />
        <PixelField seed={113} className="opacity-60" />
        <Hero
          variant="poster"
          titleEffect={meta.effects.title}
          titleClassName="tracking-[0.06em]"
          kicker="Player 1 ready"
        >
          <ScoreBoard age={config.age} className="mt-8" />
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
              variant="boxes"
              eyebrow="Game starts in"
              doneLabel="Press start!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="Levels" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="grid"
              effect={meta.effects.gallery}
              eyebrow="Save file"
              title="Replay"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="The arcade" />
            </Reveal>
          ),
          rsvp: (
            <RsvpForm tone="tint" variant="card" title="Insert coin to join" />
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title="High scores" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="banner"
                decor={
                  <PixelField seed={115} count={40} className="opacity-50" />
                }
              >
                <p className="font-inv-display text-4xl tracking-[0.2em] uppercase">
                  Continue? Always.
                </p>
              </Closing>
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
  Component: RetroArcade,
  fieldsUi: [
    {
      path: ["age"],
      label: "Age being celebrated",
      type: "number",
      min: 1,
      max: 150,
      help: "Shown as the zero-padded high score.",
    },
  ],
})
