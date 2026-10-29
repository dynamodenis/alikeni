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
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { HouseKey } from "./HouseKey"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type HousewarmingKeysConfig } from "./schema"

/**
 * Housewarming Keys: new keys.
 *
 * A house-and-key crest on the cover and the closing, a double hairline
 * frame around the hero, the map straight after the details ("Find our
 * door") and a registry of things the new home still needs.
 */
function HousewarmingKeys({
  config,
  mode,
}: {
  config: HousewarmingKeysConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <HouseKey className="size-20" />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate variant="curtain" crest={crest} />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          opacity={0}
        />
        <div
          aria-hidden="true"
          className="inv-frame [--inv-frame-inset:1.25rem] sm:[--inv-frame-inset:2rem]"
        />
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
                portrait="circle"
                eyebrow="Your new neighbours"
                title="The keyholders"
              />
            </Reveal>
          ),
          event: (
            <EventDetails tone="tint" variant="single" eyebrow="Open house" />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="split" eyebrow="Find our door" />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="inline" eyebrow="Doors open in" />
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="grid"
                effect={meta.effects.gallery}
                eyebrow="The before photos"
                title="Where we started"
              />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="stream" title="Housewarming wishes" />
            </Reveal>
          ),
          gifts: (
            <Reveal motion={motion}>
              <GiftEnvelope
                variant="cards"
                eyebrow="Registry"
                title="For the new home"
              />
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
  Component: HousewarmingKeys,
})
