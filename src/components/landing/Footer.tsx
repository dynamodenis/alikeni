import { CONTACT_EMAIL } from "@/lib/social"
import { Logo, NAV_LINKS } from "./Nav"
import { SocialLinks } from "./SocialLinks"

export function Footer() {
  return (
    <footer className="border-t border-gold/10 px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 md:flex-row">
        <Logo />
        <ul className="flex flex-wrap items-center justify-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="link">
                {link.label}
              </a>
            </li>
          ))}
          <li>
            <a href="/#contact" className="link">
              Contact
            </a>
          </li>
          <li>
            <a href={`mailto:${CONTACT_EMAIL}`} className="link">
              {CONTACT_EMAIL}
            </a>
          </li>
        </ul>
        <div className="flex flex-col items-center gap-4 md:items-end">
          <SocialLinks />
          <p className="text-sm text-sand">
            © <span className="nums">{new Date().getFullYear()}</span> Alikeni
          </p>
        </div>
      </div>
    </footer>
  )
}
