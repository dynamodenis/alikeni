import { Globe } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LOCALES, LOCALE_NAMES, isLocale } from "@/lib/i18n/locales"
import { getIn } from "@/lib/set-in"
import { useEditor } from "./EditorContext"

const PATH = ["locale"]

/**
 * Globe button in the editor's top bar: the language of the buttons, labels
 * and dates guests see. The same setting as "Invitation language" in Basics.
 */
export function LanguageMenu() {
  const { config, set, canEdit } = useEditor()
  // Drafts saved before the field existed have no locale: that is English.
  const stored = getIn(config, PATH)
  const locale = isLocale(stored) ? stored : "en"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={!canEdit(PATH)}
        aria-label={`Invitation language: ${LOCALE_NAMES[locale]}`}
        title="Invitation language"
        className="grid size-8 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50 data-[state=open]:text-foreground"
      >
        <Globe className="size-4" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          Invitation language
          <span className="text-xs font-normal text-muted-foreground">
            Buttons, labels and dates guests see
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          value={locale}
          onValueChange={(value) => set(PATH, value)}
        >
          {LOCALES.map((value) => (
            <DropdownMenuRadioItem key={value} value={value}>
              {LOCALE_NAMES[value]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
