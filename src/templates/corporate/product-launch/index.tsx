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
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type ProductLaunchConfig } from "./schema"

/**
 * Product Launch: T-minus.
 *
 * A bold aurora behind an uppercase poster headline with a shiny sweep, the
 * countdown boxes straight after the hero, an "Agenda" timeline, the company
 * in a square spotlight and a "Sneak peek" grid. Line ornament, no decor.
 */
function ProductLaunch({
  config,
  mode,
}: {
  config: ProductLaunchConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate variant="minimal" />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.5}
        />
        <Hero
          variant="poster"
          titleEffect={meta.effects.title}
          kicker="Launching"
        >
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          countdown: (
            <Countdown
              tone="tint"
              variant="boxes"
              eyebrow="T-minus"
              doneLabel="We're live!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails
                variant="timeline"
                title="Agenda"
                eyebrow="The morning"
              />
            </Reveal>
          ),
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="spotlight"
                portrait="square"
                title="Presented by"
              />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="grid"
              effect={meta.effects.gallery}
              eyebrow="First look"
              title="Sneak peek"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Where" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" title="Reserve a seat" />,
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing variant="banner" />
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
  Component: ProductLaunch,
})
