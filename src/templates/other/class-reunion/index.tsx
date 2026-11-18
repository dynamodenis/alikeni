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
import { dateParts } from "@/lib/format-date"
import { useInvitation } from "../../_shared/context"
import { ConfettiField, Seal } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type ClassReunionConfig } from "./schema"
import { YearsRibbon } from "./YearsRibbon"

/**
 * Class Reunion: years later.
 *
 * A "Class of" seal with the class year is the crest, a notched ribbon with the
 * years since hangs under
 * the poster headline, light confetti and soft particles drift behind, and a
 * "Then" masonry of old photos leads into a stream of "Memories".
 */
function ClassReunion({
  config,
  mode,
}: {
  config: ClassReunionConfig
  mode: TemplateMode
}) {
  const { motion, palette, locale } = useInvitation()
  // Seal: the class year. Ribbon: years from it to the event's date.
  const date = dateParts(
    config.datetime.start,
    config.datetime.timezone,
    locale
  )
  const yearsSince = Number(date.year) - config.classOf
  const crest = (
    <Seal label={`'${String(config.classOf).slice(-2)}`} caption="Class of" />
  )

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={crest}
        decor={<ConfettiField seed={341} count={24} className="opacity-50" />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.3}
        />
        <Hero
          variant="poster"
          titleEffect={meta.effects.title}
          kicker={config.event.subtitle}
        >
          {yearsSince > 0 && (
            <YearsRibbon label={`${yearsSince} years`} className="mt-6" />
          )}
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
                eyebrow="Brought to you by"
                title="Organising committee"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="inline"
              eyebrow="The bell rings in"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails
                variant="timeline"
                eyebrow="Running order"
                title="The night"
              />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="masonry"
              effect={meta.effects.gallery}
              eyebrow="Throwback"
              title="Then"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Back to school" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="stream" title="Memories" />
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
  Component: ClassReunion,
  fieldsUi: [
    {
      path: ["classOf"],
      label: "Class of",
      type: "number",
      min: 1900,
      max: 2200,
      help: "The year you graduated. The ribbon counts the years since.",
    },
  ],
})
