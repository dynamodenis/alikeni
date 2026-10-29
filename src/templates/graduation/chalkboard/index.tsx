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
import { Seal } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { ChalkFrame } from "./ChalkFrame"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type ChalkboardConfig } from "./schema"

/**
 * Chalkboard: a classroom board in deep green and chalk cream.
 *
 * A hand-drawn dashed chalk frame with star and arrow doodles surrounds the
 * cover and the hero; the handwritten "Class of" headline blurs in over
 * chalk-dust grain; the guest book is "Sign my board". No WebGL anywhere,
 * a plain line ornament, near-square corners.
 */
function Chalkboard({
  config,
  mode,
}: {
  config: ChalkboardConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const { graduation } = config
  const year = `'${String(graduation.classOf).slice(-2)}`
  const graduate = config.hosts[0]

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={<Seal label={year} caption="Class of" />}
        decor={<ChalkFrame seed={141} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0}
        />
        <ChalkFrame seed={143} className="m-4 sm:m-8" />
        <Hero
          variant="classic"
          titleEffect={meta.effects.title}
          title={`Class of ${graduation.classOf}`}
          kicker={graduation.school}
          hideMessage
        >
          <p className="mt-6 text-2xl text-inv-primary">
            {graduate.name}
            {graduation.degree && ` · ${graduation.degree}`}
          </p>
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-inv-muted sm:text-xl">
            {config.texts.message}
          </p>
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="spotlight"
                portrait="circle"
                eyebrow="The graduate"
              />
              <Divider />
            </Reveal>
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="Timetable" />
            </Reveal>
          ),
          story: (
            <StoryTimeline
              tone="tint"
              variant="list"
              eyebrow="Lessons learned"
              title="The story so far"
            />
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="grid"
                effect={meta.effects.gallery}
                eyebrow="From the board"
                title="Class photos"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="inline"
              eyebrow="School's out in"
              doneLabel="School's out!"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="The school" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm tone="tint" variant="plain" />
            </Reveal>
          ),
          wishes: <Wishes variant="stream" title="Sign my board" />,
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="banner"
                decor={<ChalkFrame seed={145} className="m-3 sm:m-6" />}
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
  Component: Chalkboard,
  fieldsUi: [
    {
      path: ["graduation", "school"],
      label: "School",
      type: "text",
      placeholder: "Kenya High School",
    },
    {
      path: ["graduation", "degree"],
      label: "Degree / certificate",
      type: "text",
      placeholder: "KCSE · Sciences",
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
