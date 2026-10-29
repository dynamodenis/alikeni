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
import { VinylRecord } from "./VinylRecord"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type VinylLoveSongConfig } from "./schema"

/**
 * Vinyl Love Song: a record.
 *
 * A slowly spinning vinyl carries the years on its Side A label, on the
 * cover and under a "Now playing" poster headline; dust drifts as particles.
 * The schedule is a tracklist, the story liner notes, the countdown a needle drop.
 */
function VinylLoveSong({
  config,
  mode,
}: {
  config: VinylLoveSongConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={<VinylRecord years={config.years} className="size-24" />}
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
          kicker="Now playing"
        >
          <VinylRecord years={config.years} className="mt-8 size-40" />
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts variant="duo" portrait="circle" title="The duet" />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="inline" eyebrow="Needle drops in" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="Tracklist" />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline tone="tint" variant="list" title="Liner notes" />
            </Reveal>
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="masonry"
                effect={meta.effects.gallery}
                title="Album art"
              />
            </Reveal>
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection tone="tint" variant="card" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="plain" title="Save my seat" />
            </Reveal>
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes tone="tint" variant="stream" title="Requests" />
            </Reveal>
          ),
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
  Component: VinylLoveSong,
  fieldsUi: [
    {
      path: ["years"],
      label: "Years together",
      type: "number",
      min: 1,
      max: 100,
      help: "Shown as the big number",
    },
  ],
})
