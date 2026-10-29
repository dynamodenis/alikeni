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
import { ConfettiField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { RevealBadge } from "./RevealBadge"
import { schema, type GenderRevealConfig } from "./schema"

/**
 * Gender Reveal: pink or blue?
 *
 * A disc split into pink and blue halves with a big "?" crowns the cover and
 * the poster hero, seeded confetti plus WebGL confetti particles fill the
 * screen, and a ring counts down to the reveal. Very round 2rem corners.
 */
function GenderReveal({
  config,
  mode,
}: {
  config: GenderRevealConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={<RevealBadge className="size-24" />}
        decor={<ConfettiField seed={191} count={40} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="confetti"
          opacity={0.7}
        />
        <Hero
          variant="poster"
          titleEffect={meta.effects.title}
          kicker="Pink or blue?"
        >
          <RevealBadge className="mt-8 size-32" />
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
              eyebrow="Reveal in"
              doneLabel="It's time!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The big day" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="carousel"
              effect={meta.effects.gallery}
              eyebrow="Waiting game"
              title="Bump & clues"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" />
            </Reveal>
          ),
          rsvp: (
            <RsvpForm
              tone="tint"
              variant="card"
              title="Team pink or team blue?"
            />
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="stream" title="Your guess" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="banner"
                decor={
                  <ConfettiField seed={193} count={30} className="opacity-60" />
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
  Component: GenderReveal,
})
