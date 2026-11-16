// A small confirmation popup in the app's own style, used instead of the
// browser's `confirm()`:
//
//   const [confirm, confirmDialog] = useConfirm()
//   if (!(await confirm({ title: "Delete 3 files?", action: "Delete" }))) return
//   …
//   return <>{confirmDialog}</>
import { AlertDialog } from "radix-ui"
import { useCallback, useRef, useState, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

export type ConfirmOptions = {
  title: string
  body?: string
  /** The button that goes ahead, e.g. "Delete". */
  action: string
  cancel?: string
  /** Red action button, for things that cannot be undone. */
  destructive?: boolean
}

export function useConfirm(): [
  (options: ConfirmOptions) => Promise<boolean>,
  ReactNode,
] {
  const [options, setOptions] = useState<ConfirmOptions>()
  const [open, setOpen] = useState(false)
  const answer = useRef<(value: boolean) => void>(undefined)

  const settle = useCallback((value: boolean) => {
    answer.current?.(value)
    answer.current = undefined
    setOpen(false)
  }, [])

  const confirm = useCallback((next: ConfirmOptions) => {
    // A question still open is answered "no" by the next one.
    answer.current?.(false)
    setOptions(next)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      answer.current = resolve
    })
  }, [])

  const dialog = (
    <AlertDialog.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) settle(false)
      }}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-[60] bg-black/40 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 supports-backdrop-filter:backdrop-blur-xs" />
        <AlertDialog.Content
          aria-describedby={options?.body ? undefined : ""}
          className="fixed top-1/2 left-1/2 z-[60] flex w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-2xl bg-popover p-5 text-popover-foreground shadow-xl ring-1 ring-foreground/10 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-sm"
        >
          <div className="flex flex-col gap-1.5">
            <AlertDialog.Title className="font-display text-xl text-balance">
              {options?.title}
            </AlertDialog.Title>
            {options?.body && (
              <AlertDialog.Description className="text-sm text-muted-foreground">
                {options.body}
              </AlertDialog.Description>
            )}
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <AlertDialog.Cancel asChild>
              <Button type="button" variant="outline">
                {options?.cancel ?? "Cancel"}
              </Button>
            </AlertDialog.Cancel>
            <Button
              type="button"
              variant={options?.destructive ? "destructive" : "default"}
              onClick={() => settle(true)}
            >
              {options?.action}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )

  return [confirm, dialog]
}
