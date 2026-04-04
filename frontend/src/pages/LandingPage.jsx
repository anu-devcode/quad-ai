import { Link } from 'react-router-dom'
import { PremiumButton, SectionHeading, SurfaceCard } from '../components/ui'

const clients = ['Santander', 'Volkswagen', 'TotalEnergies', 'Allianz', 'Mercedes-Benz']

function LandingPage() {
  return (
    <div className="relative overflow-hidden bg-background text-on-surface">
      {/* ─── Hero Section ─── */}
      <section className="relative px-4 pb-32 pt-20 sm:px-8 sm:pt-32 lg:px-12">
        {/* Subtle Background Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <div className="h-[800px] w-[800px] rounded-full bg-primary/30 blur-[140px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <div className="inline-block rounded-full bg-white/5 px-4 py-1.5 border border-white/10 mb-8 backdrop-blur-md animate-enter">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant italic">Next Gen AI Defense</span>
          </div>
          <h1 className="font-display text-5xl font-extrabold leading-[1.05] text-white sm:text-7xl lg:text-8xl tracking-tight">
            Detect Fraud Before It <br />
            <span className="text-gradient">Becomes a Cost</span>
          </h1>
          <p className="mx-auto mt-10 max-w-2xl text-lg text-on-surface-variant leading-relaxed sm:text-xl">
            AI-powered fraud and scam detection for modern financial teams. 
            Real-time signals. Clear decisions. <span className="text-white font-medium">Minimal friction.</span>
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Link to="/auth">
              <PremiumButton variant="primary" className="px-8 py-4 text-base">Get Started</PremiumButton>
            </Link>
            <Link to="/resources">
              <PremiumButton variant="secondary" className="px-8 py-4 text-base bg-white/10 text-white backdrop-blur-xl border border-white/10 hover:bg-white/20">
                Request a Demo →
              </PremiumButton>
            </Link>
          </div>

          {/* Trusted By */}
          <div className="mt-32">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant/60 mb-12 italic">
              Trusted by teams operating in high-risk financial environments
            </p>
            <div className="flex flex-wrap items-center justify-center gap-12 opacity-40 grayscale">
              {clients.map(client => (
                <span key={client} className="font-display text-xl font-bold tracking-tighter text-white sm:text-2xl">{client}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── The Challenge Section ─── */}
      <section className="relative px-4 py-32 sm:px-8 lg:px-12 bg-surface-container-lowest/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary italic mb-6">[ The Challenge ]</p>
            <h2 className="font-display text-4xl font-bold text-white sm:text-5xl lg:text-6xl tracking-tight leading-tight">
              Fraud Evolves Faster Than <br />
              Financial Systems
            </h2>
            <p className="mt-6 text-lg text-on-surface-variant">Real-time AI detection enables faster, more confident decisions.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <SurfaceCard level="lowest" className="glass-surface p-10 border-white/5 hover:border-primary/30 transition-all group h-full">
              <h3 className="font-display text-xl font-bold text-white mb-4">Static Rules Fail</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Rule-based systems can't adapt to new scam patterns, leaving teams reacting after losses occur.
              </p>
              <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="mt-8 flex gap-1 items-end h-16">
                {[40, 20, 60, 30, 80, 50].map((h, i) => (
                  <div key={i} className="flex-1 bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-all" style={{ height: `${h}%` }} />
                ))}
              </div>
            </SurfaceCard>

            <SurfaceCard level="lowest" className="glass-surface p-10 border-white/5 hover:border-primary/30 transition-all group h-full">
              <h3 className="font-display text-xl font-bold text-white mb-4">Manual Reviews Slow</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Human checks don't scale with transaction volume, creating delays and operational bottlenecks.
              </p>
              <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="mt-8 space-y-2">
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/40 w-full animate-pulse" />
                </div>
                <div className="h-1 w-1/2 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/40 w-full" />
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard level="lowest" className="glass-surface p-10 border-white/5 hover:border-primary/30 transition-all group h-full">
              <h3 className="font-display text-xl font-bold text-white mb-4">False Positives Hurt</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Overblocking legitimate activity creates avoidable friction for customers and interrupts normal operations.
              </p>
              <div className="mt-12 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="h-12 rounded-lg border border-white/5 bg-white/5" />
                <div className="h-12 rounded-lg border border-white/5 bg-white/5" />
              </div>
            </SurfaceCard>
          </div>
        </div>
      </section>

      {/* ─── Social Proof / Testimonials ─── */}
      <section className="relative px-4 py-32 sm:px-8 lg:px-12 overflow-hidden">
        <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-tertiary/5 blur-[120px] pointer-events-none" />
        
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-on-surface-variant mb-6">[ Testimonials ]</p>
          <h2 className="font-display text-4xl font-bold text-white mb-16">Trusted By Teams Managing Real Financial Risk</h2>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
            <SurfaceCard className="glass-surface p-8">
              <p className="text-on-surface text-lg leading-relaxed italic mb-8 italic">
                "Detect complex fraud patterns sooner without slowing legitimate activity."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20" />
                <div>
                  <p className="text-sm font-bold text-white">Liam O'Connor</p>
                  <p className="text-[10px] uppercase text-on-surface-variant tracking-wider">Director of Risk Management</p>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="glass-surface p-8">
              <p className="text-on-surface text-lg leading-relaxed italic mb-8 italic">
                "Fraud decisions become clearer, faster, and easier to align across teams."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-tertiary/20" />
                <div>
                  <p className="text-sm font-bold text-white">Sofia Martinez</p>
                  <p className="text-[10px] uppercase text-on-surface-variant tracking-wider">Compliance Lead</p>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="glass-surface p-8">
              <p className="text-on-surface text-lg leading-relaxed italic mb-8 italic">
                "Real-time monitoring feels more controlled without overwhelming our operations."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary-dim/20" />
                <div>
                  <p className="text-sm font-bold text-white">Jonathan Lee</p>
                  <p className="text-[10px] uppercase text-on-surface-variant tracking-wider">Head of Financial Compliance</p>
                </div>
              </div>
            </SurfaceCard>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative px-4 py-40 sm:px-8 lg:px-12 text-center overflow-hidden">
        <div className="absolute inset-0 z-0 bg-primary/5 backdrop-blur-3xl" />
        <div className="relative z-10 max-w-4xl mx-auto">
          <h2 className="font-display text-5xl font-extrabold text-white mb-10 tracking-tight sm:text-7xl">
            Stop Fraud Before It <br />
            Impacts Your Business
          </h2>
          <p className="text-xl text-on-surface-variant mb-12">See how AI-driven fraud detection fits into your financial operations.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <PremiumButton variant="primary" className="px-10">Talk To Sales</PremiumButton>
            <Link to="/auth">
              <PremiumButton variant="secondary" className="px-10 bg-white/10 text-white border-white/10 hover:bg-white/20">Request a Demo →</PremiumButton>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-white/5 py-20 px-4 sm:px-8 lg:px-12 bg-surface-container-lowest">
        <div className="mx-auto max-w-7xl grid gap-12 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="grid h-8 w-8 place-items-center rounded-lg premium-gradient text-[10px] font-bold text-white shadow-premium">Q</div>
              <p className="font-display text-xl font-bold text-white">Quirass</p>
            </div>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Leading the next generation of financial integrity through autonomous reasoning.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-[0.2em]">Product</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li><Link to="/features" className="hover:text-primary transition-colors">Overview</Link></li>
              <li><Link to="/engine" className="hover:text-primary transition-colors">Risk Scoring</Link></li>
              <li><Link to="/capabilities" className="hover:text-primary transition-colors">Capabilities</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-[0.2em]">Solutions</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li><a href="#" className="hover:text-primary transition-colors">Retail Banking</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Institutional</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Exchanges</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Wallets</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 text-sm uppercase tracking-[0.2em]">Resources</h4>
            <ul className="space-y-4 text-sm text-on-surface-variant">
              <li><Link to="/resources" className="hover:text-primary transition-colors">Knowledge Base</Link></li>
              <li><Link to="/resources" className="hover:text-primary transition-colors">Whitepaper</Link></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Support</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-7xl mt-20 pt-10 border-t border-white/5 flex flex-wrap justify-between items-center gap-6">
          <p className="text-xs text-on-surface-variant/40">© 2026 Quirass. All rights reserved.</p>
          <div className="flex gap-8 text-xs text-on-surface-variant/40">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
