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
import { Bunting, PetalField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { SafariBadge } from "./SafariBadge"
import { schema, type LittleSafariConfig } from "./schema"

/**
 * Little Safari: a safari nursery.
 *
 * Bunting strung across the top of the cover and hero, drifting leaves on
 * kraft-paper grain, and a round badge (sun disc over an acacia on the
 * horizon) as the crest on the cover and closing banner.
 */
function LittleSafari({
  config,
  mode,
}: {
  config: LittleSafariConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <SafariBadge className="size-24" />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={crest}
        decor={
          <>
            <div className="absolute inset-x-0 top-0">
              <Bunting seed={181} />
            </div>
            <PetalField
              shape="leaf"
              seed={183}
              count={18}
              className="opacity-60"
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
          opacity={0}
        />
        <div className="absolute inset-x-0 top-0">
          <Bunting seed={185} />
        </div>
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
                variant="list"
                portrait="circle"
                title="The expedition leaders"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="inline"
              eyebrow="Adventure begins in"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="Itinerary" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="masonry"
              effect={meta.effects.gallery}
              eyebrow="Field notes"
              title="Spotted so far"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Base camp" />
            </Reveal>
          ),
          rsvp: (
            <RsvpForm tone="tint" variant="plain" title="Joining the safari?" />
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="stream" title="Notes for the cub" />
            </Reveal>
          ),
          gifts: (
            <Reveal motion={motion}>
              <GiftEnvelope variant="cards" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing variant="banner" crest={crest} />
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
  Component: LittleSafari,
})
