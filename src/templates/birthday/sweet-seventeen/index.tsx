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
  MapSection,
  MusicPlayer,
  RsvpForm,
  Sections,
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { PetalField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type SweetSeventeenConfig } from "./schema"

/**
 * Sweet Seventeen: a soft glow-up in dusty rose.
 *
 * Petals drift over a split cover that carries the celebrant's portrait; the
 * hero floats on an iridescent wash and wears a "Turning 17" pill; the
 * countdown is a ring, the photos a swipeable carousel, the cards pillowy.
 * Wave ornament, no grain.
 */
function SweetSeventeen({
  config,
  mode,
}: {
  config: SweetSeventeenConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const lead = config.hosts[0]
  const name = lead.shortName ?? lead.name

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="split"
        imageUrl={lead.photo?.url}
        imageAlt={lead.photo?.alt ?? lead.name}
        decor={<PetalField seed={131} count={30} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.4}
        />
        <PetalField seed={133} className="opacity-50" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <p className="mt-6 rounded-full bg-inv-accent px-5 py-2 font-inv-body text-sm font-semibold tracking-[0.2em] text-inv-bg uppercase">
            Turning {config.age}
          </p>
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          countdown: (
            <Countdown
              tone="tint"
              variant="ring"
              eyebrow="Party in"
              doneLabel="It's time to glow!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="single" eyebrow="The evening" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="carousel"
              effect={meta.effects.gallery}
              eyebrow="Little moments"
              title="Seventeen so far"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Find the rooftop" />
            </Reveal>
          ),
          rsvp: (
            <RsvpForm tone="tint" variant="plain" title="Save me a seat?" />
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="stream" title={`Notes for ${name}`} />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="banner"
                decor={
                  <PetalField seed={137} count={24} className="opacity-60" />
                }
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
  Component: SweetSeventeen,
  fieldsUi: [
    {
      path: ["age"],
      label: "Age being celebrated",
      type: "number",
      min: 1,
      max: 150,
      help: "Shown in the pill under the headline.",
    },
  ],
})
