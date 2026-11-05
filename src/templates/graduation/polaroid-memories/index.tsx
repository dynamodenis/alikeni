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
import { ConfettiField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { Polaroid } from "./Polaroid"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type PolaroidMemoriesConfig } from "./schema"

/**
 * Polaroid Memories: a photo wall on matte paper.
 *
 * The graduate's portrait hangs in the hero as a tilted instant print that
 * swings from its tape, with a handwritten caption; light confetti drifts over
 * the cover and the closing. Round dials turn slowly like a lens focus ring:
 * one around the graduate's circle portrait and one inside each countdown
 * ring. The gallery is a wall of tilted prints that sway and straighten on
 * hover. Paper grain
 * on, wave ornament, soft 0.5rem corners, no WebGL background.
 */
function PolaroidMemories({
  config,
  mode,
}: {
  config: PolaroidMemoriesConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const { graduation, hosts, texts } = config
  const graduate = hosts[0]

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        decor={<ConfettiField seed={161} count={24} className="opacity-60" />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0}
        />
        <Hero
          variant="classic"
          titleEffect={meta.effects.title}
          title={`Class of ${graduation.classOf}`}
          kicker={graduation.school}
          hideMessage
        >
          <Polaroid
            photo={graduate.photo}
            caption={`${graduate.shortName ?? graduate.name} · ${graduation.classOf}`}
            tilt={-3}
            className="mt-8"
          />
          {graduation.degree && (
            <p className="mt-4 text-sm tracking-[0.3em] text-inv-primary uppercase">
              {graduation.degree}
            </p>
          )}
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-inv-muted sm:text-xl">
            {texts.message}
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
                outline="orbit"
                eyebrow="The graduate"
              />
              <Divider />
            </Reveal>
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="The day" />
            </Reveal>
          ),
          story: (
            <StoryTimeline
              tone="tint"
              variant="milestones"
              eyebrow="Snapshots in time"
              title="Four years in frames"
            />
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="polaroid"
                effect={meta.effects.gallery}
                eyebrow="Pinned up"
                title="The wall"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="ring"
              spin
              eyebrow="Caps fly in"
              doneLabel="Caps are flying!"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Where to find us" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm tone="tint" variant="card" title="Save me a frame?" />
            </Reveal>
          ),
          wishes: <Wishes variant="stream" title="Write on the wall" />,
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="banner"
                decor={
                  <ConfettiField seed={163} count={20} className="opacity-50" />
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
  Component: PolaroidMemories,
  fieldsUi: [
    {
      path: ["graduation", "school"],
      label: "School",
      type: "text",
      placeholder: "Kenyatta University",
    },
    {
      path: ["graduation", "degree"],
      label: "Degree",
      type: "text",
      placeholder: "Bachelor of Education (Arts)",
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
