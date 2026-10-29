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
import { Flourishes, PetalField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type BridalShowerBlushConfig } from "./schema"

/**
 * Bridal Shower Blush: the bride-to-be.
 *
 * Her portrait opens a split cover under drifting petals, botanical
 * flourishes frame the corners over an iridescent blush wash, she takes an
 * arch spotlight, the countdown is a ring and the photos tilt in masonry.
 */
function BridalShowerBlush({
  config,
  mode,
}: {
  config: BridalShowerBlushConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const cover = config.hosts.at(0)?.photo ?? config.gallery.at(0)

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="split"
        imageUrl={cover?.url}
        imageAlt={cover?.alt}
        decor={<PetalField seed={311} count={26} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.35}
        />
        <Flourishes className="m-4 size-20 opacity-60 sm:m-8 sm:size-28" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
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
                eyebrow="The bride-to-be"
                title="Guest of honour"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="ring" eyebrow="Showering her in" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The afternoon" />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="masonry"
              effect={meta.effects.gallery}
              eyebrow="Moments"
              title="Our girl"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="The garden" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title="Advice for the bride" />
            </Reveal>
          ),
          gifts: (
            <Reveal motion={motion}>
              <GiftEnvelope
                variant="cards"
                eyebrow="Registry"
                title="Spoil the bride"
              />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                decor={<Flourishes className="opacity-50" />}
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
  Component: BridalShowerBlush,
})
