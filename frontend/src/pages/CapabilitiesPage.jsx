import { Link } from 'react-router-dom'
import { PremiumButton, SectionHeading, SurfaceCard } from '../components/ui'

function CapabilitiesPage() {
  return (
    <div className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12">
      {/* Dynamic Background */}
      <div className="absolute left-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute right-0 top-1/4 h-[600px] w-[600px] translate-x-1/2 rounded-full bg-primary/5 blur-[120px]" />

      <main className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-20">
          <div className="max-w-3xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">System Capabilities</p>
            <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-6xl lg:text-7xl">
              Engineered for <br />
              <span className="text-gradient">Absolute Scale</span>
            </h1>
            <p className="mt-8 text-xl text-on-surface-variant">
              The Sovereign Intelligence infrastructure is built to handle high-velocity institutional movement 
              without compromising on security or auditability.
            </p>
          </div>
        </header>

        <section className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-12">
            <div className="group">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-highest border border-outline-variant text-primary group-hover:bg-primary/10 transition-colors">
                <span className="font-bold text-lg">01</span>
              </div>
              <h3 className="font-display text-3xl font-bold text-white">Massive Throughput</h3>
              <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
                Process over 50,000 transactions per second with sub-centisecond latency. 
                Our distributed ledger architecture ensures that scale is never a bottleneck for your institution.
              </p>
            </div>

            <div className="group">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-highest border border-outline-variant text-primary group-hover:bg-primary/10 transition-colors">
                <span className="font-bold text-lg">02</span>
              </div>
              <h3 className="font-display text-3xl font-bold text-white">Institutional Security</h3>
              <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
                Military-grade encryption and hardware-secured keys protect every asset. 
                Our multi-party computation (MPC) protocols ensure that no single point of failure exists.
              </p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="group">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-highest border border-outline-variant text-primary group-hover:bg-primary/10 transition-colors">
                <span className="font-bold text-lg">03</span>
              </div>
              <h3 className="font-display text-3xl font-bold text-white">Regulatory Ready</h3>
              <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
                Built-in compliance modules for KYC, AML, and FATF requirements. 
                Real-time reporting and automated filing ensure that you are always audit-ready across all jurisdictions.
              </p>
            </div>

            <div className="group">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-highest border border-outline-variant text-primary group-hover:bg-primary/10 transition-colors">
                <span className="font-bold text-lg">04</span>
              </div>
              <h3 className="font-display text-3xl font-bold text-white">Global Reach</h3>
              <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
                Unified settlement layers that bridge traditional finance and digital assets. 
                Move value across borders with the ease of an email, backed by institutional trust.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-32">
          <SurfaceCard level="lowest" className="glass-surface p-12 text-center border-primary/20">
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl text-gradient">
              Ready to Expand Your Reach?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-on-surface-variant">
              Join the network of forward-thinking institutions leveraging Sovereign Intelligence to 
              define the future of digital value movement.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <PremiumButton variant="primary" className="px-10">Start Integration</PremiumButton>
              </Link>
              <Link to="/pricing">
                <PremiumButton variant="secondary">View Pricing</PremiumButton>
              </Link>
            </div>
          </SurfaceCard>
        </section>
      </main>
    </div>
  )
}

export default CapabilitiesPage
