import { formatLongDate } from "@/lib/format-date"
import {
  AddToCalendar,
  Closing,
  Countdown,
  CoverGate,
  Divider,
  EventDetails,
  Footer,
  Gallery,
  GiftEnvelope,
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
import { BackgroundFx } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type MinimalMonoConfig } from "./schema"

/**
 * Minimal Mono: pure typography in black and white.
 *
 * No background effect, no decor, no title effect and no scroll reveals: an
 * oversized light editorial headline sits left-aligned over a hairline rule,
 * every corner is square, bands alternate plain and surface, and the only
 * ornament is a line.
 */
function MinimalMono({
  config,
  mode,
}: {
  config: MinimalMonoConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const { start, timezone } = config.datetime

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
          titleClassName="font-light tracking-[-0.03em]"
        >
          <p className="text-inv-muted">{formatLongDate(start, timezone)}</p>
          <hr className="mt-10 w-24 border-inv-fg" />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Hosts
              variant="list"
              portrait="square"
              eyebrow="the two of us"
              title="Noor & Jonas"
            />
          ),
          countdown: <Countdown variant="inline" eyebrow="until then" />,
          event: (
            <>
              <EventDetails tone="surface" variant="single" eyebrow="the day" />
              <Divider />
            </>
          ),
          story: (
            <StoryTimeline variant="list" eyebrow="so far" title="our story" />
          ),
          gallery: (
            <Gallery
              variant="grid"
              effect={meta.effects.gallery}
              eyebrow="pictures"
              title="a few frames"
            />
          ),
          map: <MapSection tone="surface" variant="card" eyebrow="where" />,
          rsvp: <RsvpForm variant="plain" eyebrow="rsvp" />,
          wishes: (
            <Wishes tone="surface" variant="stream" title="leave a note" />
          ),
          gifts: <GiftEnvelope variant="cards" eyebrow="gifts" />,
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
  Component: MinimalMono,
})
