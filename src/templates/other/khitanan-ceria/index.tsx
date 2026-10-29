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
import {
  Bunting,
  ConfettiField,
  monogramLetters,
  Seal,
} from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type KhitananCeriaConfig } from "./schema"

/**
 * Khitanan Ceria: a joyful khitanan (Indonesian circumcision celebration).
 *
 * Bunting strung across the cover and hero, seeded confetti with confetti
 * particles falling over it, a seal crest with the boy's initial captioned
 * "Khitanan", and Indonesian copy from the cover to the digital envelope.
 */
function KhitananCeria({
  config,
  mode,
}: {
  config: KhitananCeriaConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const initial = monogramLetters(config.hosts).at(0) ?? ""
  const crest = <Seal label={initial} caption="Khitanan" />
  const bunting = (seed: number) => (
    <div className="absolute inset-x-0 top-0">
      <Bunting seed={seed} />
    </div>
  )

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="curtain"
        crest={crest}
        decor={
          <>
            {bunting(291)}
            <ConfettiField seed={293} count={30} />
          </>
        }
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="confetti"
          opacity={0.7}
        />
        {bunting(295)}
        <Hero
          variant="classic"
          titleEffect={meta.effects.title}
          titleClassName="font-extrabold tracking-tight"
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
                variant="spotlight"
                portrait="circle"
                eyebrow="Ananda"
                title="Sang jagoan kecil"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="boxes"
              eyebrow="Menuju acara"
              doneLabel="Acara dimulai!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="timeline" eyebrow="Susunan acara" />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="grid"
              effect={meta.effects.gallery}
              eyebrow="Galeri"
              title="Momen ceria"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="card" eyebrow="Lokasi" />
            </Reveal>
          ),
          rsvp: (
            <RsvpForm tone="tint" variant="card" title="Konfirmasi kehadiran" />
          ),
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
                variant="banner"
                decor={
                  <ConfettiField seed={297} count={30} className="opacity-60" />
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
  Component: KhitananCeria,
})
