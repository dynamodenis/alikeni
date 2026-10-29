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
import { PetalField, Seal } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type RusticBarnConfig } from "./schema"

/**
 * Rustic Barn: kraft paper and barn wood.
 *
 * Leaves drift over a kraft-toned hero held inside a double hairline frame;
 * a seal crest reads the year on the cover and in the closing; warm, rounded
 * cards alternate with tinted bands; the masonry gallery tilts its photos
 * like prints pinned to a board. The ornament is a leaf.
 */
function RusticBarn({
  config,
  mode,
}: {
  config: RusticBarnConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = <Seal label="'27" caption="Est." />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={crest}
        decor={<PetalField shape="leaf" seed={41} count={24} />}
      />

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
          className="inv-frame [--inv-frame-inset:1rem] sm:[--inv-frame-inset:1.75rem]"
        />
        <PetalField shape="leaf" seed={43} className="opacity-60" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="duo"
                portrait="circle"
                eyebrow="With their families"
                title="The couple"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="boxes"
              eyebrow="Counting the days"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="The day" />
              <Divider />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline
                variant="alternating"
                eyebrow="Our story"
                title="How we got here"
              />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="masonry"
              effect={meta.effects.gallery}
              eyebrow="Moments"
              title="From the farm"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="split" eyebrow="Finding the barn" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title="Leave us a note" />
            </Reveal>
          ),
          gifts: (
            <Reveal motion={motion}>
              <GiftEnvelope variant="envelope" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={crest}
                decor={
                  <PetalField
                    shape="leaf"
                    seed={47}
                    count={18}
                    className="opacity-50"
                  />
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
  Component: RusticBarn,
})
