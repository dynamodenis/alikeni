import { Link } from "@tanstack/react-router"
import { ArrowLeft } from "lucide-react"
import { useEffect, type ReactNode } from "react"
import { toast } from "sonner"
import { UserMenu } from "@/components/auth/UserMenu"
import { Logo } from "@/components/landing/Nav"

/** Brand header + page frame shared by the dashboard pages. */
export function DashboardShell({
  children,
  back,
}: {
  children: ReactNode
  /** Show a "My invitations" back link above the content. */
  back?: boolean
}) {
  // Portalled menus and dialogs render on <body>; give them the brand tokens too.
  useEffect(() => {
    document.body.classList.add("theme-alikeni")
    return () => document.body.classList.remove("theme-alikeni")
  }, [])

  return (
    <div className="theme-alikeni min-h-svh bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo />
          <div className="flex items-center gap-4">
            <Link
              to="/templates"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:block"
            >
              Templates
            </Link>
            <UserMenu />
          </div>
        </div>
      </header>
      <main id="main" className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {back && (
          <Link
            to="/dashboard"
            className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            My invitations
          </Link>
        )}
        {children}
      </main>
    </div>
  )
}

/** Copy text and toast the outcome. */
export function copyToClipboard(text: string, label = "Link copied") {
  return navigator.clipboard.writeText(text).then(
    () => void toast(label),
    () => void toast.error("Copy failed")
  )
}
