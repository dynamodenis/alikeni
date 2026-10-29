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
import { CastleCrest } from "./CastleCrest"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type PrincessCastleConfig } from "./schema"

/**
 * Princess Castle: a fairytale ball.
 *
 * A three-turret castle with a crown is the crest on the cover and again at
 * the closing; sparkles twinkle over an iridescent wash behind a shiny
 * script headline; the age is a lavender pill, the countdown a ring and the
 * portraits a swipeable carousel. Star dividers, no grain.
 */
function PrincessCastle({
  config,
  mode,
}: {
  config: PrincessCastleConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={<CastleCrest className="size-24" />}
        decor={<StarField seed={91} sparkles={12} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.45}
        />
        <StarField seed={93} className="opacity-60" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <p className="mt-6 rounded-full bg-inv-primary px-5 py-2 font-inv-body text-sm font-semibold tracking-[0.2em] text-inv-bg uppercase">
            Turning {config.age}
          </p>
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          countdown: (
            <Countdown
              tone="tint"
              variant="ring"
              eyebrow="The ball begins in"
              doneLabel="The ball has begun!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="Royal programme" />
            </Reveal>
          ),
          gallery: (
            <Gallery
              variant="carousel"
              effect={meta.effects.gallery}
              eyebrow="The royal album"
              title="Portraits of the princess"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection tone="tint" variant="card" eyebrow="The castle" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="plain" title="Will you attend the ball?" />
            </Reveal>
          ),
          wishes: <Wishes tone="tint" variant="stream" title="Royal wishes" />,
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={<CastleCrest className="size-20" />}
                decor={
                  <StarField seed={95} sparkles={8} className="opacity-60" />
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
  Component: PrincessCastle,
  fieldsUi: [
    {
      path: ["age"],
      label: "Age being celebrated",
      type: "number",
      min: 1,
      max: 150,
      help: 'Shown in the "Turning" pill under the headline.',
    },
  ],
})
