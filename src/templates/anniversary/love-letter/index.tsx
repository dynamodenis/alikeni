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
import { PetalField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { LetterCard } from "./LetterCard"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type LoveLetterConfig } from "./schema"

/**
 * Love Letter: a handwritten letter.
 *
 * The hero hides its message and lays a tilted paper card on the table
 * instead: "Dearest …", the invitation in the script face, the years and a
 * signature. Petals drift around it over an iridescent wash; paper grain.
 */
function LoveLetter({
  config,
  mode,
}: {
  config: LoveLetterConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        decor={<PetalField seed={241} count={28} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.35}
        />
        <PetalField seed={243} className="opacity-50" />
        <Hero variant="classic" titleEffect={meta.effects.title} hideMessage>
          <LetterCard
            hosts={config.hosts}
            message={config.texts.message}
            years={config.years}
            className="mt-10"
          />
          <Divider />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts variant="duo" portrait="circle" title="With love" />
            </Reveal>
          ),
          countdown: <Countdown tone="tint" variant="inline" />,
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="single" />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline tone="tint" variant="list" title="Our letters" />
            </Reveal>
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery variant="masonry" effect={meta.effects.gallery} />
            </Reveal>
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection tone="tint" variant="card" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="card" />
            </Reveal>
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes tone="tint" variant="cards" title="Write us a line" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                decor={<PetalField seed={247} count={20} />}
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
  Component: LoveLetter,
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
