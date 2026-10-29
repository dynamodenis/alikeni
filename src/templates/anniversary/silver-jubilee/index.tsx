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
import { Monogram } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { YearsBadge } from "./YearsBadge"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type SilverJubileeConfig } from "./schema"

/**
 * Silver Jubilee: twenty-five in silver.
 *
 * A monogram crest opens a quiet cover; the hero sits in a double hairline
 * frame over soft silver waves with the years in a thin double-ring badge.
 * Arch portraits, alternating chapters, a plain line ornament.
 */
function SilverJubilee({
  config,
  mode,
}: {
  config: SilverJubileeConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <Monogram hosts={config.hosts} />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate variant="minimal" crest={crest} />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.35}
        />
        <div
          aria-hidden="true"
          className="inv-frame [--inv-frame-inset:1.25rem] sm:[--inv-frame-inset:2rem]"
        />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <YearsBadge years={config.years} className="mt-8" />
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts variant="duo" portrait="arch" />
            </Reveal>
          ),
          countdown: <Countdown tone="tint" variant="boxes" />,
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="single" />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline
                tone="tint"
                variant="alternating"
                title="Our chapters"
              />
            </Reveal>
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery variant="grid" effect={meta.effects.gallery} />
            </Reveal>
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection tone="tint" variant="card" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="plain" />
            </Reveal>
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes tone="tint" variant="stream" />
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
  Component: SilverJubilee,
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
