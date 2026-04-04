import { Link } from 'react-router-dom'
import { PremiumButton, SurfaceCard } from '../components/ui'

function UseCasesPage() {
  const useCases = [
    {
      title: 'Micro-lending Platforms',
      desc: 'Unlock millions of users who lack traditional bank data. Use transaction screenshots and SMS history to approve loans instantly.',
      icon: '💸'
    },
    {
      title: 'Fintech Startups',
      desc: 'Launch credit-based financial products in days, not months. Skip the long bank API integrations and go straight to the users.',
      icon: '🚀'
    },
    {
      title: 'Digital Banks',
      desc: 'Build robust profiles for unbanked and underbanked users by transforming their mobile money activity into institutional trust.',
      icon: '🏦'
    },
    {
      title: 'Institutional Scenarios',
      desc: 'Deploy high-precision scores that handle everything from M-Pesa patterns to MTN and Airtel mobile wallet behavioral data.',
      icon: '🏛️'
    }
  ]

  return (
    <div className="relative overflow-hidden bg-background px-4 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12 text-on-surface">
      {/* Background Orbs */}
      <div className="absolute right-1/2 top-0 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute left-1/4 top-1/2 h-[600px] w-[600px] -translate-y-1/2 rounded-full bg-primary/10 blur-[150px] pointer-events-none" />

      <main className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-28">
          <div className="max-w-4xl">
            <p className="section-kicker mb-8">The Frontier Scenarios</p>
            <h1 className="landing-title mb-10 font-display text-5xl font-black text-white sm:text-7xl lg:text-8xl">
               Infrastructure For <br />
               <span className="text-gradient">Every Horizon</span>
            </h1>
            <p className="body-muted max-w-2xl text-2xl lg:text-3xl">
               Quirass enables true financial inclusion by allowing any financial operator to build trust from real-world evidence.
            </p>
          </div>
        </header>

        <section className="grid gap-12 lg:grid-cols-2">
           {useCases.map(uc => (
              <SurfaceCard key={uc.title} level="lowest" className="glass-surface p-14 group hover:border-primary/50 transition-all border-white/5 shadow-2xl relative overflow-hidden">
                 <div className="flex flex-col gap-8 relative z-10">
                    <div className="text-6xl mb-4 grayscale group-hover:grayscale-0 transition-all group-hover:scale-110 duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{uc.icon}</div>
                    <h3 className="font-display text-4xl font-bold tracking-tight text-white transition-colors group-hover:text-primary">{uc.title}</h3>
                    <p className="body-muted text-xl">
                       {uc.desc}
                    </p>
                    <div className="mt-10 flex gap-6">
                       <Link to="/demo">
                          <PremiumButton variant="primary" className="px-8 py-3 text-sm font-semibold bg-primary hover:brightness-110 shadow-premium">Launch Demo</PremiumButton>
                       </Link>
                       <Link to="/features">
                          <PremiumButton variant="secondary" className="px-8 py-3 text-sm font-semibold bg-white/5 text-white border border-white/10 hover:bg-white/10">Evidence Logic →</PremiumButton>
                       </Link>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </SurfaceCard>
           ))}
        </section>

        {/* DATA DIAGRAM PLACEHOLDER (New!) */}
        <section className="relative mt-36 overflow-hidden rounded-[3rem] border border-white/10 bg-surface-container p-12 shadow-3xl md:p-20">
           <div className="relative z-10 max-w-5xl mx-auto text-center">
           <h2 className="landing-title mb-10 font-display text-4xl font-black text-white sm:text-6xl">The Lending Lifecycle</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/10">Evidence 📄</div>
                 <span className="text-primary animate-pulse">➔</span>
                 <div className="rounded-2xl border border-primary/40 bg-primary/20 p-6 font-semibold text-primary">Quirass Scoring 🧠</div>
                 <span className="text-primary animate-pulse">➔</span>
                 <div className="rounded-2xl border border-tertiary/40 bg-tertiary/20 p-6 font-semibold text-tertiary">Approval ✅</div>
              </div>
              <p className="body-muted mt-14 px-6 text-xl md:px-12">
                 Transforming the approved user experience from multi-day bureaucratic paperwork into a sub-second neural decision flow.
              </p>
           </div>
        </section>

        <section className="mx-auto mt-36 mb-20 max-w-5xl text-center">
           <h2 className="landing-title mb-10 font-display text-4xl font-black leading-none text-white sm:text-7xl">Empowering the Unbanked</h2>
           <PremiumButton variant="primary" className="rounded-[2.5rem] bg-primary px-16 py-6 text-2xl font-semibold shadow-premium transition-all hover:brightness-110 active:scale-95">Start Your Simulation</PremiumButton>
        </section>
      </main>
    </div>
  )
}

export default UseCasesPage
