import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { PremiumButton, SectionHeading, SurfaceCard } from '../components/ui'
import { landingHighlights } from '../data/mockData'

function LandingPage() {
  return (
    <div className="relative px-4 pb-20 pt-6 sm:px-8 sm:pt-8 lg:px-12">
      <SiteHeader />

      <main className="mx-auto mt-8 max-w-7xl sm:mt-12">
        <section className="grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
          <SurfaceCard level="lowest" className="premium-gradient relative overflow-hidden p-8 text-white sm:p-12">
            <div className="relative z-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-dim">
                Institutional-Grade Ledger
              </p>
              <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold leading-[1.1] sm:mt-6 sm:text-6xl">
                The Sovereign Standard for Digital Assets.
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-relaxed opacity-90 sm:text-lg">
                A unified architecture for high-velocity money movement, 
                AI-driven trust synthesis, and professional-grade risk operations.
              </p>
              <div className="mt-8 flex flex-wrap gap-4 sm:mt-12">
                <Link to="/auth">
                  <PremiumButton variant="secondary" className="bg-white text-on-surface hover:bg-white/90">
                    Initialize Protocol
                  </PremiumButton>
                </Link>
                <Link to="/dashboard/home">
                  <PremiumButton variant="tertiary" className="text-white hover:bg-white/10">
                    Explore Ledger
                  </PremiumButton>
                </Link>
              </div>
            </div>
            {/* Architectural element */}
            <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          </SurfaceCard>

          <SurfaceCard level="highest" className="flex flex-col justify-center p-8">
            <SectionHeading overline="Trust Synthesis" title="Live Confidence Metrics" />
            <div className="mt-6 space-y-4">
              {landingHighlights.map((item) => (
                <div key={item.title} className="rounded-lg bg-surface-low p-4 transition-transform hover:scale-[1.02]">
                  <h3 className="text-sm font-bold text-on-surface">{item.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{item.text}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-3">
          <SurfaceCard level="default">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Sovereign Unit</p>
            <h3 className="mt-3 font-display text-xl font-bold text-on-surface">Technical Precision</h3>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              A high-precision workspace for institutional balances, behavioral trust analysis, and automated audit actions.
            </p>
          </SurfaceCard>
          <SurfaceCard level="default">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Operations Console</p>
            <h3 className="mt-3 font-display text-xl font-bold text-on-surface">Institutional Control</h3>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Monitor real-time protocol deviations and review neural model decisions with comprehensive forensic context.
            </p>
          </SurfaceCard>
          <SurfaceCard level="default">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Auth Protocol</p>
            <h3 className="mt-3 font-display text-xl font-bold text-on-surface">Unified Entry</h3>
            <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
              Secure onboarding and initialization with a professional visual language that conveys absolute stability.
            </p>
          </SurfaceCard>
        </section>
      </main>
    </div>
  )
}

export default LandingPage
