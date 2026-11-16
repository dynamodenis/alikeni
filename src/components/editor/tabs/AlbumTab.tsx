import { Link } from "@tanstack/react-router"
import { useServerFn } from "@tanstack/react-start"
import { Images, LoaderCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { AlbumSettingsForm } from "@/components/album/AlbumSettingsForm"
import { Button } from "@/components/ui/button"
import { getOwnerAlbumFn } from "@/server/album/album.functions"
import type { AlbumSettings } from "@/server/album/album.server"
import { useEditor } from "../EditorContext"
import { Group } from "../fields"

/**
 * Album switches (on/off, guest uploads, downloads, PIN). Unlike the other
 * tabs these are not part of the draft: they apply as soon as they change.
 * Photos themselves are managed on the dashboard album page.
 */
export function AlbumTab() {
  const { invitationId } = useEditor()
  const load = useServerFn(getOwnerAlbumFn)
  const [settings, setSettings] = useState<AlbumSettings>()
  const [available, setAvailable] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    load({ data: { id: invitationId } }).then(
      (album) => {
        if (cancelled || !album) return
        setAvailable(album.invitation.albumAvailable)
        setSettings(album.settings)
      },
      () => {
        if (!cancelled) setFailed(true)
      }
    )
    return () => {
      cancelled = true
    }
  }, [load, invitationId])

  return (
    <Group
      title="Event album"
      description="A shared album for the photos and videos of the day. Guests open it from a link at the end of your invitation."
    >
      {!available ? (
        <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
          The album is part of Premium.{" "}
          <Link
            to="/dashboard/$invitationId/upgrade"
            params={{ invitationId }}
            className="font-medium underline underline-offset-4"
          >
            Upgrade
          </Link>{" "}
          to switch it on.
        </p>
      ) : failed ? (
        <p role="alert" className="text-sm text-destructive">
          Could not load the album settings. Reload the page to try again.
        </p>
      ) : !settings ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Loading…
        </p>
      ) : (
        <>
          <AlbumSettingsForm
            invitationId={invitationId}
            settings={settings}
            onChange={setSettings}
          />
          <p className="text-xs text-muted-foreground">
            These settings apply straight away; you do not need to publish
            again.
          </p>
          <div>
            <Button asChild variant="outline">
              <Link
                to="/dashboard/$invitationId/album"
                params={{ invitationId }}
              >
                <Images aria-hidden="true" /> Add and manage photos
              </Link>
            </Button>
          </div>
        </>
      )}
    </Group>
  )
}
