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
import { GeoLattice, Seal, monogramLetters } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type RoyalIslamicConfig } from "./schema"

/**
 * Royal Islamic: emerald and gold girih.
 *
 * An eight-point star lattice sits behind the cover and the closing; the
 * poster headline is foil, opened by a Bismillah kicker; portraits are
 * mihrab arches; a seal crest carries the couple's initials captioned
 * "Nikah". Four-point star ornament, no grain.
 */
function RoyalIslamic({
  config,
  mode,
}: {
  config: RoyalIslamicConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const crest = (
    <Seal label={monogramLetters(config.hosts).join("")} caption="Nikah" />
  )

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={crest}
        decor={<GeoLattice className="opacity-40" />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="bold"
          opacity={0.5}
        />
        <GeoLattice density={96} className="opacity-25" />
        <Hero
          variant="poster"
          titleEffect={meta.effects.title}
          titleClassName="inv-foil tracking-[0.06em]"
          kicker="Bismillahir Rahmanir Rahim"
        >
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
                portrait="arch"
                eyebrow="With the blessings of their families"
                title="The couple"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="boxes" eyebrow="Until the Nikah" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="Nikah & Walima" />
              <Divider />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline
                tone="tint"
                variant="list"
                eyebrow="Our story"
                title="Written for each other"
              />
            </Reveal>
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="grid"
                effect={meta.effects.gallery}
                eyebrow="Moments"
                title="Blessed beginnings"
              />
            </Reveal>
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection tone="tint" variant="split" eyebrow="The venue" />
            </Reveal>
          ),
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="card" />
            </Reveal>
          ),
          wishes: (
            <Wishes tone="tint" variant="cards" title="Du'as for the couple" />
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
                decor={<GeoLattice className="opacity-30" />}
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
  Component: RoyalIslamic,
})
