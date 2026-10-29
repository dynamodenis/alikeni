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
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type HolidayPartyConfig } from "./schema"
import { Snow } from "./Snow"

/**
 * Holiday Party: snow.
 *
 * Seeded Snow drifting over the curtain cover, the hero and the closing,
 * soft particles behind a blur-in headline, a "Last December" carousel and
 * a wall of "Season's greetings". Star ornament, rounded corners.
 */
function HolidayParty({
  config,
  mode,
}: {
  config: HolidayPartyConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate variant="curtain" decor={<Snow seed={261} />} />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.4}
        />
        <Snow seed={263} className="opacity-70" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
          <p className="text-xs tracking-[0.35em] text-inv-muted uppercase">
            Dress code · {config.texts.dressCode ?? "Festive"}
          </p>
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts variant="spotlight" portrait="circle" title="Hosted by" />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="boxes" eyebrow="Festivities in" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The night" />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="carousel"
              effect={meta.effects.gallery}
              eyebrow="Memories"
              title="Last December"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Find the party" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title="Season's greetings" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="banner"
                decor={<Snow seed={265} className="opacity-60" />}
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
  Component: HolidayParty,
})
