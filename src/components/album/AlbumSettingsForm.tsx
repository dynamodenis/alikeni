// The host's album switches: on/off, guest uploads, downloads and the PIN.
// Shown on the dashboard album page and in the editor's Album tab. Changes
// apply at once (they are not part of the invitation's draft).
import { useServerFn } from "@tanstack/react-start"
import { KeyRound, LoaderCircle } from "lucide-react"
import { useId, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { PIN_PATTERN } from "@/lib/album"
import { updateAlbumSettingsFn } from "@/server/album/album.functions"
import type { AlbumSettings } from "@/server/album/album.server"

type Change = Partial<
  Pick<AlbumSettings, "enabled" | "guestUploads" | "downloads">
> & {
  pin?: string | null
}

function Row({
  label,
  help,
  checked,
  disabled,
  onChange,
}: {
  label: string
  help: string
  checked: boolean
  disabled?: boolean
  onChange: (on: boolean) => void
}) {
  const id = useId()
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card/50 px-4 py-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <p className="mt-0.5 text-xs text-muted-foreground">{help}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={onChange}
      />
    </div>
  )
}

export function AlbumSettingsForm({
  invitationId,
  settings,
  onChange,
}: {
  invitationId: string
  settings: AlbumSettings
  onChange: (settings: AlbumSettings) => void
}) {
  const update = useServerFn(updateAlbumSettingsFn)
  const [busy, setBusy] = useState(false)
  const [pin, setPin] = useState("")
  const pinId = useId()

  const save = async (change: Change, done?: string) => {
    setBusy(true)
    try {
      onChange(await update({ data: { id: invitationId, ...change } }))
      if (done) toast(done)
      return true
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the album"
      )
      return false
    } finally {
      setBusy(false)
    }
  }

  const savePin = async (event: FormEvent) => {
    event.preventDefault()
    if (await save({ pin }, "PIN saved")) setPin("")
  }

  return (
    <div className="flex flex-col gap-3">
      <Row
        label="Album on"
        help="Guests get a link to the album at the end of your invitation."
        checked={settings.enabled}
        disabled={busy}
        onChange={(enabled) => void save({ enabled })}
      />
      <Row
        label="Guests can add photos and videos"
        help="Anyone with the link, from the event day until 7 days after. More than 20 files at once need your approval."
        checked={settings.guestUploads}
        disabled={busy || !settings.enabled}
        onChange={(guestUploads) => void save({ guestUploads })}
      />
      <Row
        label="Guests can download and share"
        help="Shows download and share buttons, and “Download all”."
        checked={settings.downloads}
        disabled={busy || !settings.enabled}
        onChange={(downloads) => void save({ downloads })}
      />

      <form
        onSubmit={savePin}
        className="flex flex-col gap-3 rounded-xl border border-border bg-card/50 px-4 py-3"
      >
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 size-4 text-primary" aria-hidden="true" />
          <div>
            <label htmlFor={pinId} className="text-sm font-medium">
              PIN {settings.hasPin ? "(set)" : "(none)"}
            </label>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {settings.hasPin
                ? "Guests must enter the PIN before they see or add anything. Saving a new PIN signs everyone out of the album."
                : "Without a PIN, anyone with the link sees the album. Add 4 to 8 digits to make it private."}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            id={pinId}
            value={pin}
            onChange={(event) =>
              setPin(event.target.value.replace(/\D/g, "").slice(0, 8))
            }
            inputMode="numeric"
            autoComplete="off"
            placeholder={settings.hasPin ? "New PIN" : "e.g. 4821"}
            className="w-36 tracking-[0.3em]"
          />
          <Button
            type="submit"
            variant="outline"
            disabled={busy || !PIN_PATTERN.test(pin)}
          >
            {busy && (
              <LoaderCircle className="animate-spin" aria-hidden="true" />
            )}
            {settings.hasPin ? "Change PIN" : "Set PIN"}
          </Button>
          {settings.hasPin && (
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => void save({ pin: null }, "PIN removed")}
            >
              Remove PIN
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
