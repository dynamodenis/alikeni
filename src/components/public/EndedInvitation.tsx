// What guests see at /i/<slug> once a free invitation's page has gone offline
// (the day after the event; see src/lib/plans.ts). Worded in the invitation's
// language, with a quiet link for the host to bring it back with Premium.
import { Logo } from "@/components/landing/Nav"
import { INTL_LOCALE, getMessages, type Locale } from "@/lib/i18n"

export function EndedInvitation({
  title,
  locale,
}: {
  title: string
  locale: Locale
}) {
  const t = getMessages(locale).ended
  return (
    <main
      lang={INTL_LOCALE[locale]}
      className="theme-festly grain flex min-h-svh flex-col items-center justify-center bg-ink px-4 py-10 text-center text-cream"
    >
      <div className="w-full max-w-sm rounded-2xl border border-gold/15 bg-[#1a120c]/80 p-6 sm:p-8">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <h1 className="mt-2 font-display text-3xl">{t.title}</h1>
        <p className="mt-3 text-muted-foreground">{t.body}</p>
      </div>
      <a
        href="/dashboard"
        className="mt-6 rounded-sm text-sm text-muted-foreground underline-offset-4 hover:text-cream hover:underline focus-visible:ring-2 focus-visible:ring-gold-soft focus-visible:outline-none"
      >
        {t.host}
      </a>
    </main>
  )
}
