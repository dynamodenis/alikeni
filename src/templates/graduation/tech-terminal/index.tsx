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
import { TerminalCard } from "./TerminalCard"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type TechTerminalConfig } from "./schema"

/**
 * Tech Terminal: phosphor green on black, a shell session as the invitation.
 *
 * A terminal window card (three dots, `$ graduate` commands, blinking block
 * cursor) is the cover crest and sits under a monospace `class_of_2027`
 * editorial headline; WebGL particles drift as matrix dust; every section
 * is named like a file or command and the page ends on `exit 0`.
 */
function TechTerminal({
  config,
  mode,
}: {
  config: TechTerminalConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const { graduation } = config
  const graduate = config.hosts[0]
  const session = [
    `$ graduate --school "${graduation.school}"`,
    ...(graduation.degree
      ? [`$ graduate --degree "${graduation.degree}"`]
      : []),
    "> commencement scheduled ✓",
  ]

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={<TerminalCard lines={["$ whoami", graduate.name]} compact />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.3}
        />
        <Hero
          variant="editorial"
          titleEffect={meta.effects.title}
          title={`class_of_${graduation.classOf}`}
          titleClassName="font-mono tracking-tight"
          kicker="// commencement"
          hideMessage
        >
          <TerminalCard lines={session} className="mt-8" />
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
              <Hosts
                variant="spotlight"
                portrait="square"
                eyebrow="// graduate"
              />
              <Divider />
            </Reveal>
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="schedule.log" />
            </Reveal>
          ),
          story: (
            <StoryTimeline
              tone="tint"
              variant="list"
              eyebrow="git log --oneline"
              title="Commit history"
            />
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="grid"
                effect={meta.effects.gallery}
                eyebrow="ls"
                title="screenshots/"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="inline"
              eyebrow="T-minus"
              doneLabel="Build succeeded. Congratulations!"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="location.json" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm tone="tint" variant="plain" title="rsvp --yes" />
            </Reveal>
          ),
          wishes: <Wishes variant="stream" title="comments" />,
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing variant="banner">
                <p className="mt-12 font-mono text-3xl text-inv-primary">
                  exit 0
                </p>
              </Closing>
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
  Component: TechTerminal,
  fieldsUi: [
    {
      path: ["graduation", "school"],
      label: "School",
      type: "text",
      placeholder: "Strathmore University",
    },
    {
      path: ["graduation", "degree"],
      label: "Degree",
      type: "text",
      placeholder: "BSc Computer Science",
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
