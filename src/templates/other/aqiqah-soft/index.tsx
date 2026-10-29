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
  Wishes,
} from "../../_shared/blocks"
import { useInvitation } from "../../_shared/context"
import {
  GeoLattice,
  monogramLetters,
  PetalField,
  Seal,
} from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type AqiqahSoftConfig } from "./schema"

/**
 * Aqiqah Soft: a gentle aqiqah.
 *
 * A faint geometric lattice behind the cover and closing, leaves drifting
 * over soft mint silk, a seal crest with the baby's initial captioned
 * "Aqiqah", and the family (parents and baby) introduced as a list.
 */
function AqiqahSoft({
  config,
  mode,
}: {
  config: AqiqahSoftConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const baby = config.hosts.filter((h) => h.role === "baby")
  const babyInitial =
    monogramLetters(baby.length ? baby : config.hosts).at(0) ?? ""
  const crest = <Seal label={babyInitial} caption="Aqiqah" />

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="minimal"
        crest={crest}
        decor={<GeoLattice className="opacity-20" />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.4}
        />
        <PetalField shape="leaf" seed={301} count={16} className="opacity-50" />
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
                variant="list"
                portrait="circle"
                eyebrow="Keluarga"
                title="Dengan penuh syukur"
              />
            </Reveal>
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="single" eyebrow="Waktu & tempat" />
            </Reveal>
          ),
          countdown: (
            <Countdown tone="tint" variant="inline" eyebrow="Menuju hari" />
          ),
          gallery: (
            <Reveal motion={motion}>
              <Gallery
                variant="grid"
                effect={meta.effects.gallery}
                eyebrow="Galeri"
                title="Si kecil"
              />
            </Reveal>
          ),
          map: <MapSection tone="tint" variant="card" eyebrow="Lokasi" />,
          rsvp: (
            <Reveal motion={motion}>
              <RsvpForm variant="plain" title="Konfirmasi kehadiran" />
            </Reveal>
          ),
          wishes: (
            <Wishes tone="tint" variant="cards" title="Doa untuk si kecil" />
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={crest}
                decor={<GeoLattice className="opacity-20" />}
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
  Component: AqiqahSoft,
})
