import { Link } from 'react-router-dom'
import { PremiumButton, SectionHeading, SurfaceCard } from '../components/ui'

function FeaturesPage() {
  return (
    <div className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12">
      {/* Background Orbs */}
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-tertiary/10 blur-[100px]" />

      <main className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-20 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Core Intelligence</p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
            Features Built for <br />
            <span className="text-gradient">Financial Integrity</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-lg text-on-surface-variant">
            Explore the specialized tools engineered to protect institutional assets and verify every transaction cycle.
          </p>
        </header>

        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <SurfaceCard level="lowest" className="glass-surface p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Fraud Guard</h3>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              Real-time anomaly detection using multi-vector behavioral analysis to stop suspicious value movement before it manifests as cost.
            </p>
          </SurfaceCard>

          <SurfaceCard level="lowest" className="glass-surface p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-tertiary/20 text-tertiary">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Trust Synthesis</h3>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              Automated confidence scoring for every entity, maintaining a persistent integrity record that evolves with transactional behavior.
            </p>
          </SurfaceCard>

          <SurfaceCard level="lowest" className="glass-surface p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-dim/20 text-primary-dim">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="font-display text-2xl font-bold text-white">Advanced Ledger</h3>
            <p className="mt-4 leading-relaxed text-on-surface-variant">
              High-precision transactional recording with cryptographic proof-of-state for every balance change.
            </p>
          </SurfaceCard>
        </section>

        <section className="mt-32 rounded-[2rem] bg-surface-container p-8 md:p-16 lg:p-24 overflow-hidden relative">
          <div className="relative z-10 grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Automation</p>
              <h2 className="mt-6 font-display text-4xl font-bold text-white sm:text-5xl">
                Audit at the Speed <br /> of Thought
              </h2>
              <p className="mt-8 text-lg text-on-surface-variant">
                Our neural models perform deep forensic analysis on every transaction in under 20ms, 
                ensuring that audit requirements never slow down your operational velocity.
              </p>
              <div className="mt-12">
                <Link to="/auth">
                  <PremiumButton variant="primary">Deploy Sovereign Unit</PremiumButton>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-2xl bg-surface-container-high border border-outline-variant p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="h-2 w-3/4 rounded bg-primary/20" />
                  <div className="h-2 w-1/2 rounded bg-surface-highest" />
                  <div className="h-2 w-2/3 rounded bg-surface-highest" />
                </div>
                <div className="mt-8 flex items-end justify-between">
                  <div className="h-24 w-8 rounded bg-primary/40" />
                  <div className="h-32 w-8 rounded bg-primary" />
                  <div className="h-16 w-8 rounded bg-primary/20" />
                  <div className="h-40 w-8 rounded bg-primary/60" />
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default FeaturesPage
