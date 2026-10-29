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
import { schema, type BotanicalSageConfig } from "./schema"

/**
 * Botanical Sage: a greenhouse baby shower.
 *
 * Drifting leaves and botanical corner flourishes inside a double hairline
 * frame over a silk wash, arch-framed parents, and a mosaic of tilting photos.
 */
function BotanicalSage({
  config,
  mode,
}: {
  config: BotanicalSageConfig
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
        decor={<Flourishes className="opacity-70" />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.4}
        />
        <div
          aria-hidden="true"
          className="inv-frame [--inv-frame-inset:1.25rem] sm:[--inv-frame-inset:2rem]"
        />
        <PetalField shape="leaf" seed={211} count={20} className="opacity-60" />
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
                variant="duo"
                portrait="arch"
                eyebrow="The parents-to-be"
                title="Growing our family"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="boxes" eyebrow="Blooming in" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The afternoon" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="mosaic"
              effect={meta.effects.gallery}
              eyebrow="Little by little"
              title="Sprouting"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Getting there" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title="Wishes for baby" />
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
  Component: BotanicalSage,
})
