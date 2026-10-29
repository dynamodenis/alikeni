import {
  AddToCalendar,
  Closing,
  Countdown,
  CoverGate,
  Divider,
  EventDetails,
  Footer,
  Hero,
  Hosts,
  MusicPlayer,
  RsvpForm,
  Sections,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { BackgroundFx } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type WebinarMinimalConfig } from "./schema"

/**
 * Webinar Minimal: an online event.
 *
 * A typographic, left-aligned hero with no effects or decor, a single event
 * card with add-to-calendar right after it, a square-portrait speakers list,
 * an inline countdown and a "Register" form. No gallery, map or music.
 */
function WebinarMinimal({
  config,
  mode,
}: {
  config: WebinarMinimalConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate variant="minimal" />

      <div className="relative isolate border-b border-inv-line">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          opacity={0}
        />
        <Hero
          variant="editorial"
          titleEffect={meta.effects.title}
          kicker="Live webinar"
        >
          <Divider />
          <p className="text-xs tracking-[0.3em] text-inv-primary uppercase">
            {config.venue.name} · {config.venue.address}
          </p>
          {config.venue.notes && (
            <p className="mt-3 max-w-md text-sm text-inv-muted">
              {config.venue.notes}
            </p>
          )}
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          event: (
            <EventDetails
              tone="tint"
              variant="single"
              eyebrow={config.venue.name}
              title="Session details"
            />
          ),
          calendar: <AddToCalendar />,
          hosts: (
            <Hosts
              variant="list"
              portrait="square"
              eyebrow="Who you'll hear from"
              title="Speakers"
            />
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="inline"
              eyebrow="We go live in"
              doneLabel="We're live"
            />
          ),
          rsvp: <RsvpForm variant="plain" title="Register" />,
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
  Component: WebinarMinimal,
})
