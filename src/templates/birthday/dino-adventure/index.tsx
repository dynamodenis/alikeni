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
  MapSection,
  MusicPlayer,
  RsvpForm,
  Sections,
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { PetalField } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { DinoEgg } from "./DinoEgg"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type DinoAdventureConfig } from "./schema"

/**
 * Dino Adventure: a jungle expedition for small explorers.
 *
 * Leaves drift over a soft firefly particle wash; the age hatches out of a
 * cracked, spotted dino egg with a footprint trail underneath, on the cover
 * and again in the hero. Bands alternate plain and tint with leaf dividers
 * and every card is a big rounded sticker.
 */
function DinoAdventure({
  config,
  mode,
}: {
  config: DinoAdventureConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={<DinoEgg age={config.age} size="sm" />}
        decor={<PetalField shape="leaf" seed={81} count={26} />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.5}
        />
        <PetalField shape="leaf" seed={83} className="opacity-60" />
        <Hero
          variant="classic"
          titleEffect={meta.effects.title}
          titleClassName="font-extrabold"
        >
          <DinoEgg age={config.age} className="mt-6" />
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          countdown: (
            <Countdown
              tone="tint"
              variant="boxes"
              eyebrow="Roar in"
              doneLabel="It's dino time!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="Expedition plan" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="grid"
              effect={meta.effects.gallery}
              eyebrow="Dig site"
              title="Fossil finds"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Base camp" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" title="Stomping over?" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title="Roars & wishes" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="banner"
                decor={
                  <PetalField
                    shape="leaf"
                    seed={85}
                    count={22}
                    className="opacity-60"
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
  Component: DinoAdventure,
  fieldsUi: [
    {
      path: ["age"],
      label: "Age being celebrated",
      type: "number",
      min: 1,
      max: 150,
      help: "Shown inside the hatching egg.",
    },
  ],
})
