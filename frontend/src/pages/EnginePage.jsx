import { Link } from 'react-router-dom'
import { PremiumButton, SectionHeading, SurfaceCard } from '../components/ui'

function EnginePage() {
  return (
    <div className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12">
      {/* Matrix-like Background */}
      <div className="absolute inset-0 z-0 opacity-20" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      <div className="absolute left-1/4 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-primary/10 blur-[150px]" />

      <main className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-20 flex flex-col items-center text-center">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20 mb-8">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">The Reasoning Layer</span>
          </div>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-7xl">
            Meet the <br />
            <span className="text-gradient">Sovereign Engine</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-xl text-on-surface-variant leading-relaxed">
            A high-performance neural engine designed for real-time risk synthesis and cryptographic verification.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
          <SurfaceCard level="lowest" className="glass-surface p-8 overflow-hidden group">
            <SectionHeading overline="Neural Core" title="Real-time Reasoning" />
            <p className="mt-6 text-on-surface-variant leading-relaxed">
              Unlike traditional rule-based systems, our engine uses a dynamic reasoning layer 
              that understands intent and context. It doesn't just block; it learns the patterns 
              of legitimate institutional behavior.
            </p>
            <div className="mt-12 p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Active Analysis</span>
              </div>
              <div className="space-y-3">
                <div className="h-1 w-full rounded bg-surface-highest overflow-hidden">
                  <div className="h-full bg-primary w-2/3" />
                </div>
                <div className="h-1 w-full rounded bg-surface-highest overflow-hidden">
                  <div className="h-full bg-tertiary w-1/2" />
                </div>
                <div className="h-1 w-full rounded bg-surface-highest overflow-hidden">
                  <div className="h-full bg-primary-dim w-3/4" />
                </div>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard level="lowest" className="glass-surface p-8 overflow-hidden group">
            <SectionHeading overline="Verification" title="Cryptographic Proof" />
            <p className="mt-6 text-on-surface-variant leading-relaxed">
              Every decision made by the engine is accompanied by a cryptographic proof-of-validity. 
              This ensures that every action taken is auditable, repeatable, and mathematically sound.
            </p>
            <div className="mt-12 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant text-center">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-2">Hash Rate</p>
                <p className="text-2xl font-bold text-white">4.2 EH/s</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-container-high border border-outline-variant text-center">
                <p className="text-[10px] font-bold uppercase text-on-surface-variant mb-2">Proof Time</p>
                <p className="text-2xl font-bold text-white">&lt; 5ms</p>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <section className="mt-32 text-center max-w-4xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-white mb-8">Performance Metrics</h2>
          <div className="grid gap-8 sm:grid-cols-3">
            <div>
              <p className="text-5xl font-bold text-primary mb-2">99.9%</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Accuracy Rate</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-tertiary mb-2">12ms</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Avg Latency</p>
            </div>
            <div>
              <p className="text-5xl font-bold text-primary-dim mb-2">10M+</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Dps Audited</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default EnginePage
