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
import { StarField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { Constellation } from "./Constellation"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type StarryFutureConfig } from "./schema"

/**
 * Starry Future: the road ahead under stars.
 *
 * A seeded constellation (dots joined by hairlines, twinkling) is the crest
 * on the cover and the closing; a star field sits under a bold aurora behind
 * a foil "Class of" headline; the story runs as an alternating "journey".
 * Four-point star ornament, soft 1rem corners, no grain.
 */
function StarryFuture({
  config,
  mode,
}: {
  config: StarryFutureConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const { graduation, hosts, texts } = config

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={<Constellation seed={7} className="size-28" />}
        decor={<StarField seed={151} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.5}
        />
        <StarField seed={153} className="opacity-70" />
        <Hero
          variant="classic"
          titleEffect={meta.effects.title}
          title={`Class of ${graduation.classOf}`}
          titleClassName="inv-foil"
          kicker={graduation.school}
          hideMessage
        >
          <p className="mt-2 font-inv-display text-2xl text-inv-primary sm:text-3xl">
            {hosts[0].name}
            {graduation.degree && (
              <span className="mt-1 block text-sm tracking-[0.3em] text-inv-muted uppercase">
                {graduation.degree}
              </span>
            )}
          </p>
          <p className="max-w-xl text-lg leading-relaxed text-pretty text-inv-muted sm:text-xl">
            {texts.message}
          </p>
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts variant="spotlight" portrait="circle" eyebrow="Shining" />
            </Reveal>
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The ceremony" />
            </Reveal>
          ),
          story: (
            <StoryTimeline
              tone="tint"
              variant="alternating"
              eyebrow="The journey"
              title="Every step, a star"
            />
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="masonry"
                effect={meta.effects.gallery}
                eyebrow="Snapshots"
                title="Constellations of memories"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="boxes"
              eyebrow="Launch in"
              doneLabel="Lift-off, graduate!"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="split" eyebrow="Where to find us" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm tone="tint" variant="card" title="Will you be there?" />
            </Reveal>
          ),
          wishes: <Wishes variant="cards" title="Wishes for the road ahead" />,
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={<Constellation seed={7} className="size-24" />}
                decor={
                  <StarField seed={157} count={40} className="opacity-60" />
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
  Component: StarryFuture,
  fieldsUi: [
    {
      path: ["graduation", "school"],
      label: "School",
      type: "text",
      placeholder: "Moi University",
    },
    {
      path: ["graduation", "degree"],
      label: "Degree",
      type: "text",
      placeholder: "Bachelor of Medicine & Surgery",
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
