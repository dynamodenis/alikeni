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
import { FilmStrip } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { TicketStub } from "./TicketStub"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type CinemaReelConfig } from "./schema"

/**
 * Cinema Reel: a premiere night in noir.
 *
 * The couple's names are a poster title card over drifting particles; an
 * admit-one ticket stub with the date sits on the cover; a strip of 35 mm
 * film holds the first three stills above the gallery; the schedule reads as
 * showtimes, the story as scenes, and the page closes on "The End".
 */
function CinemaReel({
  config,
  mode,
}: {
  config: CinemaReelConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const stills = config.gallery.slice(0, 3)

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={
          <TicketStub
            date={config.datetime.start}
            timezone={config.datetime.timezone}
          />
        }
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.35}
        />
        <Hero
          variant="poster"
          titleEffect={meta.effects.title}
          titleClassName="tracking-[0.08em]"
          kicker="A wedding feature presentation"
        />
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="list"
                portrait="square"
                eyebrow="Starring"
                title="The leads"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="inline" eyebrow="Premiere in" />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="Showtimes" />
              <Divider />
            </Reveal>
          ),
          story: (
            <StoryTimeline
              tone="tint"
              variant="milestones"
              eyebrow="Scenes"
              title="The story so far"
            />
          ),
          gallery: (
            <>
              <Reveal motion={motion}>
                <FilmStrip frames={3} className="mx-auto max-w-4xl rounded-inv">
                  {stills.map((photo, i) => (
                    <img
                      key={`${photo.assetKey}-${i}`}
                      src={photo.url}
                      alt={photo.alt}
                      loading="lazy"
                      className="aspect-[3/2] w-full object-cover"
                    />
                  ))}
                </FilmStrip>
              </Reveal>
              <Gallery
                variant="masonry"
                effect={meta.effects.gallery}
                eyebrow="Stills"
                title="Behind the scenes"
              />
            </>
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="The theatre" />
            </Reveal>
          ),
          rsvp: (
            <RsvpForm tone="tint" variant="card" title="Reserve your seat" />
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes
                variant="stream"
                eyebrow="Reviews"
                title="Rave about us"
              />
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
              <Closing variant="banner">
                <p className="mt-14 font-inv-display text-5xl tracking-[0.12em] uppercase sm:text-6xl">
                  The End
                </p>
              </Closing>
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
  Component: CinemaReel,
})
