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
import { CloudField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type CloudNineConfig } from "./schema"

/**
 * Cloud Nine: up in the clouds.
 *
 * Seeded clouds drift across the cover, the hero and the closing banner over
 * a soft silk wash; pillowy 1.5rem corners, wave dividers and pale tinted
 * bands keep the whole page light as air.
 */
function CloudNine({
  config,
  mode,
}: {
  config: CloudNineConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate variant="curtain" decor={<CloudField seed={171} />} />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.4}
        />
        <CloudField seed={173} count={7} className="opacity-70" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts variant="duo" portrait="circle" title="Expecting" />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="boxes"
              eyebrow="Baby arrives in"
              doneLabel="It's shower time!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="single" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="grid"
              effect={meta.effects.gallery}
              title="Bump diary"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" />
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
              <GiftEnvelope variant="cards" title="Registry" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="banner"
                decor={<CloudField seed={175} count={6} />}
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
  Component: CloudNine,
})
