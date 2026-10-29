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
import { BatikBand, Seal, monogramLetters } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type JavaneseHeritageConfig } from "./schema"

/**
 * Javanese Heritage: sogan-brown batik for an akad and resepsi.
 *
 * Kawung batik bands border the cover panel, the hero and the closing; a
 * wax-seal crest carries the couple's initials and reads "Pernikahan"; silk
 * drifts behind a classic serif headline on grained paper, and the copy
 * speaks Bahasa Indonesia where a Javanese family would.
 */
function JavaneseHeritage({
  config,
  mode,
}: {
  config: JavaneseHeritageConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const cover = config.hosts.at(0)?.photo ?? config.gallery.at(0)
  const crest = (
    <Seal
      label={monogramLetters(config.hosts).join(" ")}
      caption="Pernikahan"
    />
  )
  const bands = (
    <>
      <div className="absolute inset-x-0 top-0">
        <BatikBand />
      </div>
      <div className="absolute inset-x-0 bottom-0">
        <BatikBand flip />
      </div>
    </>
  )

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="split"
        imageUrl={cover?.url}
        imageAlt={cover?.alt}
        crest={crest}
        decor={bands}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.4}
        />
        <BatikBand className="absolute inset-x-0 top-0 opacity-70" />
        <BatikBand flip className="absolute inset-x-0 bottom-0 opacity-70" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
          <p className="text-xs tracking-[0.35em] text-inv-muted uppercase">
            {config.venue.placeName ?? config.venue.name}
          </p>
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="list"
                portrait="circle"
                eyebrow="Dengan hormat"
                title="The couple"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="boxes"
              eyebrow="Menuju hari bahagia"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="Akad & Resepsi" />
            </Reveal>
          ),
          story: (
            <Reveal motion={motion}>
              <StoryTimeline
                variant="list"
                eyebrow="Perjalanan kami"
                title="Our story"
              />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="grid"
              effect={meta.effects.gallery}
              eyebrow="Galeri"
              title="Potret kebersamaan"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="embed" eyebrow="Lokasi acara" />
            </Reveal>
          ),
          rsvp: <RsvpForm tone="tint" variant="card" eyebrow="Konfirmasi" />,
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title="Doa & ucapan" />
            </Reveal>
          ),
          gifts: (
            <Reveal motion={motion}>
              <GiftEnvelope variant="envelope" title="Amplop digital" />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={crest}
                decor={
                  <div className="absolute inset-x-0 bottom-0">
                    <BatikBand flip />
                  </div>
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
  Component: JavaneseHeritage,
})
