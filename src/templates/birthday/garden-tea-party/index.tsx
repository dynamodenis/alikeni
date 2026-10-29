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
import { Flourishes } from "../../_shared/decor"
import { BackgroundFx, Reveal } from "../../_shared/effects"
import { defineTemplate, type TemplateMode } from "../../types"
import { Teacup } from "./Teacup"
import { defaults } from "./defaults"
import { meta } from "./meta"
import { schema, type GardenTeaPartyConfig } from "./schema"

/**
 * Garden Tea Party: afternoon tea in sage on matte paper.
 *
 * A steaming teacup is the crest on the split cover and the closing;
 * botanical flourishes sit in the corners of a double-hairline frame around
 * the hero; portraits are arches, the gallery is tilting masonry and the
 * countdown waits for the kettle. Leaf ornament, soft corners, grain on.
 */
function GardenTeaParty({
  config,
  mode,
}: {
  config: GardenTeaPartyConfig
  mode: TemplateMode
}) {
  const { motion, palette } = useInvitation()
  const lead = config.hosts[0]
  const name = lead.shortName ?? lead.name

  return (
    <div data-template={meta.id} data-mode={mode} className="relative">
      <CoverGate
        variant="split"
        imageUrl={lead.photo?.url}
        imageAlt={lead.photo?.alt ?? lead.name}
        crest={<Teacup className="size-20" />}
        decor={<Flourishes className="opacity-70" />}
      />

      <div className="relative isolate">
        <BackgroundFx
          kind={meta.effects.background ?? "none"}
          palette={palette}
          motion={motion}
          variant="soft"
          opacity={0.4}
        />
        <div
          aria-hidden="true"
          className="inv-frame [--inv-frame-inset:1.25rem] sm:[--inv-frame-inset:2rem]"
        />
        <Flourishes className="m-4 size-20 opacity-60 sm:m-8 sm:size-28" />
        <Hero variant="classic" titleEffect={meta.effects.title}>
          <Divider />
          <p className="text-xs tracking-[0.35em] text-inv-muted uppercase">
            Celebrating {config.age} years
          </p>
        </Hero>
      </div>

      <Sections
        config={config}
        sections={{
          hosts: (
            <Reveal motion={motion}>
              <Hosts
                variant="spotlight"
                portrait="arch"
                eyebrow="In honour of"
              />
            </Reveal>
          ),
          countdown: (
            <Countdown
              tone="tint"
              variant="boxes"
              eyebrow="Kettle on in"
              doneLabel="The kettle's on!"
            />
          ),
          event: (
            <Reveal motion={motion}>
              <EventDetails variant="cards" eyebrow="The afternoon" />
              <Divider />
            </Reveal>
          ),
          gallery: (
            <Gallery
              tone="tint"
              variant="masonry"
              effect={meta.effects.gallery}
              eyebrow="From the album"
              title="Garden moments"
            />
          ),
          map: (
            <Reveal motion={motion}>
              <MapSection variant="split" eyebrow="The garden" />
            </Reveal>
          ),
          rsvp: (
            <RsvpForm tone="tint" variant="card" title="Join us for tea?" />
          ),
          wishes: (
            <Reveal motion={motion}>
              <Wishes variant="cards" title={`Cards for ${name}`} />
            </Reveal>
          ),
          calendar: <AddToCalendar />,
          closing: (
            <>
              <Closing
                variant="signature"
                crest={<Teacup />}
                decor={<Flourishes className="opacity-50" />}
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
  Component: GardenTeaParty,
  fieldsUi: [
    {
      path: ["age"],
      label: "Age being celebrated",
      type: "number",
      min: 1,
      max: 150,
      help: "Used in the invitation copy.",
    },
  ],
})
