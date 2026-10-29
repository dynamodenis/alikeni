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
import { PetalField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type PastelPetalsConfig } from "./schema"

/**
 * Pastel Petals: blush petals drifting over a soft garden wedding.
 *
 * Seeded petal fields float on the cover, the hero and the closing; the
 * script headline sits on a soft iridescent wash with a dotted divider;
 * portraits are round, grid photos tilt, and every card has pillowy corners.
 */
function PastelPetals({
  config,
  mode,
}: {
  config: PastelPetalsConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        decor={<PetalField seed={71} count={34} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.35}
        />
        <PetalField seed={73} count={22} className="opacity-70" />
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
                eyebrow="Together with their families"
                title="The couple"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="boxes"
              eyebrow="Until the petals fall"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="When & where" />
              <Divider />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline
                tone="tint"
                variant="alternating"
                eyebrow="Our story"
                title="How we blossomed"
              />
            </Reveal>
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="grid"
                effect={meta.effects.gallery}
                eyebrow="Moments"
                title="Picked from the garden"
              />
            </Reveal>
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection
                tone="tint"
                variant="card"
                eyebrow="Finding the garden"
              />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="card" />
            </Reveal>
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes
                tone="tint"
                variant="cards"
                title="Wishes for the couple"
              />
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
                decor={
                  <PetalField seed={79} count={26} className="opacity-60" />
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
  Component: PastelPetals,
})
