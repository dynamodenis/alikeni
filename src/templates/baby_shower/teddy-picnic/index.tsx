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
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import { Bunting } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { Gingham } from "./Gingham"
import { Teddy } from "./Teddy"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type TeddyPicnicConfig } from "./schema"

/**
 * Teddy Picnic: a teddy bears' picnic on a gingham blanket.
 *
 * A stitched bear-face crest, bunting strung across the cover and hero, a
 * checked picnic-blanket strip under the hero and a ring countdown.
 */
function TeddyPicnic({
  config,
  mode,
}: {
  config: TeddyPicnicConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const cover = config.hosts.at(0)?.photo ?? config.gallery.at(0)

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="split"
        imageUrl={cover?.url}
        imageAlt={cover?.alt}
        crest={<Teddy className="size-20" />}
        decor={
          <div className="absolute inset-x-0 top-0">
            <Bunting seed={221} />
          </div>
        }
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0}
        />
        <div className="absolute inset-x-0 top-0">
          <Bunting seed={223} />
        </div>
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
        </Hero>
      </div>
      <Gingham className="h-10" />

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="list"
                portrait="circle"
                eyebrow="Bears-to-be"
                title="Picnic hosts"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="ring"
              eyebrow="Picnic in"
              doneLabel="Blankets down!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="The picnic plan" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="grid"
              effect={meta.effects.gallery}
              eyebrow="Getting ready"
              title="From the basket"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="The blanket is at" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="stream" title="Notes for the little bear" />
            </Reveal>
          ),
          gifts: (
            <Reveal motion={motion}>
              <GiftEnvelope variant="cards" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing variant="banner" crest={<Teddy className="size-20" />} />
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
  Component: TeddyPicnic,
})
