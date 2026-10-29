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
  Hosts,
  MapSection,
  MusicPlayer,
  RsvpForm,
  Sections,
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { GeoLattice } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { Crescent } from "./Crescent"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type EidOpenHouseConfig } from "./schema"

/**
 * Eid Open House: Eid Mubarak.
 *
 * A crescent moon with a hanging lantern is the crest; an eight-point star
 * lattice covers the cover and the closing; the headline is foil over soft
 * silk; one "Open house hours" card and a split map. Star ornament.
 */
function EidOpenHouse({
  config,
  mode,
}: {
  config: EidOpenHouseConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <Crescent className="size-24" />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={crest}
        decor={<GeoLattice className="opacity-30" />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.4}
        />
        <GeoLattice density={96} className="opacity-20" />
        <Hero
          variant="classic"
          titleEffect={meta.effects.title}
          titleClassName="inv-foil"
        >
          <Divider />
          <p className="text-xs tracking-[0.35em] text-inv-muted uppercase">
            {config.event.title}
          </p>
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
                eyebrow="With warm wishes"
                title="Your hosts"
              />
            </Reveal>
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails
                tone="tint"
                variant="single"
                eyebrow="Drop in any time"
                title="Open house hours"
              />
            </Reveal>
          ),
          countdown: <Countdown variant="boxes" eyebrow="Eid begins in" />,
          gallery: (
            <Gallery
              tone="tint"
              variant="grid"
              effect={meta.effects.gallery}
              eyebrow="Memories"
              title="Last Eid"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="split" eyebrow="Find us" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="plain" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title="Eid greetings" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={crest}
                decor={<GeoLattice className="opacity-20" />}
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
  Component: EidOpenHouse,
})
