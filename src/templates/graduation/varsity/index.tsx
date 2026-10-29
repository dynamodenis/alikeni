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
  StoryTimeline,
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { VarsityLetter } from "./VarsityLetter"
import { VarsityStripes } from "./VarsityStripes"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type VarsityConfig } from "./schema"

/**
 * Varsity: a letterman jacket in maroon, navy and cream.
 *
 * Three cuff stripes run across the top and bottom of the cover and the
 * hero; the graduate's initial sits on a stitched chenille patch as the
 * crest; the poster headline splits in letter by letter; the schedule is
 * "Game day" and the story "Season highlights". Dots ornament, no grain.
 */
function Varsity({
  config,
  mode,
}: {
  config: VarsityConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const { graduation } = config
  const initial = config.hosts[0].name.trim().charAt(0).toUpperCase()
  const crest = <VarsityLetter letter={initial} year={graduation.classOf} />
  const stripes = (
    <>
      <VarsityStripes className="absolute inset-x-0 top-0" />
      <VarsityStripes className="absolute inset-x-0 bottom-0" />
    </>
  )

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate variant="minimal" crest={crest} decor={stripes} />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0}
        />
        {stripes}
        <Hero
          variant="poster"
          titleEffect={meta.effects.title}
          title={`Class of ${graduation.classOf}`}
          kicker={graduation.school}
          hideMessage
        >
          {graduation.degree && (
            <p className="mt-4 font-inv-display text-3xl tracking-[0.08em] text-inv-accent uppercase sm:text-4xl">
              {graduation.degree}
            </p>
          )}
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-inv-muted sm:text-xl">
            {config.texts.message}
          </p>
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts variant="list" portrait="square" eyebrow="Graduating" />
            </Reveal>
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="Game day" />
              <Divider />
            </Reveal>
          ),
          story: (
            <StoryTimeline
              tone="tint"
              variant="milestones"
              eyebrow="Season highlights"
              title="The road to the stage"
            />
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="grid"
                effect={meta.effects.gallery}
                eyebrow="Highlights"
                title="Team photos"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="boxes"
              eyebrow="Kick-off in"
              doneLabel="Game on, graduate!"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Home ground" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm tone="tint" variant="card" title="Save your seat" />
            </Reveal>
          ),
          wishes: <Wishes variant="cards" title="From the stands" />,
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
  Component: Varsity,
  fieldsUi: [
    {
      path: ["graduation", "school"],
      label: "School",
      type: "text",
      placeholder: "University of Nairobi",
    },
    {
      path: ["graduation", "degree"],
      label: "Degree",
      type: "text",
      placeholder: "BSc Mechanical Engineering",
    },
    {
      path: ["graduation", "classOf"],
      label: "Class of (year)",
      type: "number",
      min: 1900,
      max: 2200,
    },
  ],
})
