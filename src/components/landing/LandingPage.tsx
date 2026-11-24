import { MotionConfig } from "motion/react"
import type { Currency } from "@/lib/plans"
import { Contact } from "./Contact"
import { Features } from "./Features"
import { FinalCta } from "./FinalCta"
import { Footer } from "./Footer"
import { Hero } from "./Hero"
import { HomeFaq } from "./HomeFaq"
import { HowItWorks } from "./HowItWorks"
import { Marquee } from "./Marquee"
import { Nav } from "./Nav"
import { Numbers } from "./Numbers"
import { Pricing } from "./Pricing"
import { Showcase } from "./Showcase"

export function LandingPage({
  currencies,
}: {
  /** Currencies the visitor sees prices in (`priceCurrencies`). */
  currencies: Array<Currency>
}) {
  return (
    <MotionConfig reducedMotion="user">
      <div className="grain min-h-svh overflow-x-clip bg-ink text-cream selection:bg-gold/30 selection:text-cream">
        <Nav />
        <main>
          <Hero />
          <Marquee />
          <HowItWorks />
          <Features />
          <Numbers />
          <Showcase />
          <Pricing currencies={currencies} />
          <HomeFaq />
          <FinalCta />
          <Contact />
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}
