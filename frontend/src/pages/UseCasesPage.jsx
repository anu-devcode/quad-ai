import { Link } from 'react-router-dom'
import { PremiumButton, SectionHeading, SurfaceCard } from '../components/ui'

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
        <header className="mb-32">
          <div className="max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-10 underline decoration-primary/20 italic">[ The Frontier Scenarios ]</p>
            <h1 className="font-display text-5xl font-black leading-tight text-white mb-10 sm:text-7xl lg:text-9xl tracking-tighter leading-[1.05] italic uppercase underline decoration-white/5">
               Infrastructure For <br />
               <span className="text-gradient">Every Horizon</span>
            </h1>
            <p className="text-2xl text-on-surface-variant font-light max-w-2xl leading-relaxed lg:text-3xl italic">
               Quirass enables true financial inclusion by allowing any financial operator to build trust from real-world evidence.
            </p>
          </div>
        </header>

        <section className="grid gap-12 lg:grid-cols-2">
           {useCases.map(uc => (
              <SurfaceCard key={uc.title} level="lowest" className="glass-surface p-14 group hover:border-primary/50 transition-all border-white/5 shadow-2xl relative overflow-hidden">
                 <div className="flex flex-col gap-8 relative z-10">
                    <div className="text-6xl mb-4 grayscale group-hover:grayscale-0 transition-all group-hover:scale-110 duration-500 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">{uc.icon}</div>
                    <h3 className="font-display text-4xl font-black text-white group-hover:text-primary transition-colors italic uppercase tracking-tighter">{uc.title}</h3>
                    <p className="text-xl text-on-surface-variant leading-relaxed font-light italic">
                       {uc.desc}
                    </p>
                    <div className="mt-10 flex gap-6">
                       <Link to="/demo">
                          <PremiumButton variant="primary" className="px-8 py-3 text-sm font-black bg-primary hover:brightness-110 italic shadow-premium">Launch Demo</PremiumButton>
                       </Link>
                       <Link to="/features">
                          <PremiumButton variant="secondary" className="px-8 py-3 text-sm font-black bg-white/5 text-white border border-white/10 hover:bg-white/10 italic">Evidence Logic →</PremiumButton>
                       </Link>
                    </div>
                 </div>
                 <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </SurfaceCard>
           ))}
        </section>

        {/* DATA DIAGRAM PLACEHOLDER (New!) */}
        <section className="mt-40 rounded-[4rem] bg-surface-container p-16 md:p-24 border border-white/10 relative overflow-hidden group shadow-3xl">
           <div className="relative z-10 max-w-5xl mx-auto text-center">
              <h2 className="font-display text-4xl font-black text-white mb-10 sm:text-6xl tracking-tighter italic uppercase underline decoration-primary/20">The Lending Lifecycle</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/10">Evidence 📄</div>
                 <span className="text-primary animate-pulse">➔</span>
                 <div className="p-6 rounded-2xl bg-primary/20 border border-primary/40 text-primary font-black italic">Quirass Scoring 🧠</div>
                 <span className="text-primary animate-pulse">➔</span>
                 <div className="p-6 rounded-2xl bg-tertiary/20 border border-tertiary/40 text-tertiary font-black italic">Approval ✅</div>
              </div>
              <p className="mt-16 text-xl text-on-surface-variant font-light italic px-12">
                 Transforming the approved user experience from multi-day bureaucratic paperwork into a sub-second neural decision flow.
              </p>
           </div>
        </section>

        <section className="mt-40 mb-20 text-center max-w-5xl mx-auto">
           <h2 className="font-display text-4xl font-black text-white mb-10 sm:text-7xl tracking-tighter italic uppercase underline decoration-white/5 leading-none">Empowering the Unbanked</h2>
           <PremiumButton variant="primary" className="px-16 py-6 text-2xl font-black bg-primary rounded-[2.5rem] hover:brightness-110 italic shadow-premium active:scale-95 transition-all">Start Your Simulation</PremiumButton>
        </section>
      </main>
    </div>
  )
}

export default UseCasesPage
