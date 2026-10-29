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
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { StarField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { MoonStar } from "./MoonStar"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type TwinkleStarConfig } from "./schema"

/**
 * Twinkle Star: twinkle, twinkle, little star.
 *
 * A star-field night sky under a slow aurora, a crescent moon crest with a
 * star hanging from a thread, a gold foil headline and star dividers.
 */
function TwinkleStar({
  config,
  mode,
}: {
  config: TwinkleStarConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={<MoonStar className="size-24" />}
        decor={<StarField seed={201} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.45}
        />
        <StarField seed={203} className="opacity-70" />
        <Hero
          variant="classic"
          titleEffect={meta.effects.title}
          titleClassName="inv-foil"
        >
          <Divider />
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
                eyebrow="The parents-to-be"
                title="Over the moon"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="inline"
              eyebrow="Counting the stars"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="single" eyebrow="When & where" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="grid"
              effect={meta.effects.gallery}
              eyebrow="Waiting for baby"
              title="Little moments"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="split" eyebrow="Getting there" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="plain" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title="Wishes upon a star" />
            </Reveal>
          ),
          gifts: (
            <Reveal motion={motion}>
              <GiftEnvelope variant="envelope" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={<MoonStar className="size-20" />}
                decor={<StarField seed={205} className="opacity-60" />}
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
  Component: TwinkleStar,
})
