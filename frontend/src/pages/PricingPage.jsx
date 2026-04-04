import { Link } from 'react-router-dom'
import { PremiumButton, SectionHeading, SurfaceCard } from '../components/ui'

function PricingPage() {
  const plans = [
    {
       name: 'Developer Demo',
       price: 'Free',
       desc: 'For builders and hackathons. Experience the engine in real-time.',
       features: ['No-Code Dashboard', 'OCR Data Extraction', 'Instant Trust Scoring (Fixed Data)', 'Community Support', 'No API Access'],
       cta: 'Start Demo',
       popular: false
    },
    {
       name: 'Pro Tier',
       price: 'Custom',
       desc: 'Production-ready API access for your fintech startup.',
       features: ['Full API Integration', 'Advanced SMS Parsing', 'Custom Evidence Engines', '24/7 Priority Tickets', 'OCR Metadata Proofs'],
       cta: 'Start Pro Trial',
       popular: true
    },
    {
       name: 'Enterprise Hub',
       price: 'Custom',
       desc: 'For high-scale institutional financial trust management.',
       features: ['Dedicated Inference Cluster', 'Custom Regulatory Modules', 'Scientific Architecture Access', 'Institutional SLA', 'On-Premise Deployment'],
       cta: 'Contact Sales',
       popular: false
    }
  ]

  return (
    <div className="relative overflow-hidden bg-background px-4 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12 text-on-surface">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px] pointer-events-none" />

      <main className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-24 text-center">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20 mb-8 backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary italic">[ Operational Tiers ]</span>
          </div>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight text-white mb-10 sm:text-7xl lg:text-8xl tracking-tight leading-[1.05]">
             Build Trust <br />
             <span className="text-gradient">at Any Scale</span>
          </h1>
          <p className="mx-auto mt-10 max-w-3xl text-xl text-on-surface-variant font-light md:text-2xl leading-relaxed">
             From individual developer experiments to global institutional fraud defense. Choose the tier that matches your operational velocity.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <SurfaceCard 
              key={plan.name} 
              level="lowest" 
              className={`glass-surface p-10 flex flex-col relative ${plan.popular ? 'border-primary/50 shadow-[0_0_60px_rgba(99,102,241,0.1)] scale-105 z-10' : 'border-white/5 opacity-80'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary px-5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] text-white">
                  Most Deployed
                </div>
              )}
              <div className="mb-12">
                <h3 className="font-display text-3xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{plan.name}</h3>
                <p className="text-lg text-on-surface-variant leading-relaxed font-light">{plan.desc}</p>
              </div>
              <div className="mb-12">
                <p className="text-5xl font-extrabold text-white">{plan.price}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-3 italic">Per Scaling Unit</p>
              </div>
              <ul className="space-y-5 mb-14 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-4 text-sm text-on-surface">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <PremiumButton variant={plan.popular ? 'primary' : 'secondary'} className={`w-full py-4 text-lg font-bold rounded-xl ${plan.popular ? 'bg-primary' : 'bg-white/10 text-white border border-white/10 hover:bg-white/10'}`}>
                  {plan.cta}
                </PremiumButton>
              </Link>
            </SurfaceCard>
          ))}
        </section>

        <section className="mt-40 text-center max-w-4xl mx-auto">
          <h2 className="font-display text-4xl font-bold text-white mb-12 sm:text-5xl tracking-tight leading-tight">Institutional Commitments</h2>
          <div className="grid gap-8 md:grid-cols-2 text-left">
            <div className="p-8 rounded-[2rem] bg-surface-container-low border border-white/5">
              <h4 className="font-extrabold text-white text-xl mb-4 italic underline decoration-primary">Dynamic Determination</h4>
              <p className="text-lg text-on-surface-variant font-light leading-relaxed">
                 We determine custom Pro and Enterprise rates based on your monthly evidence ingestion volume and required trust inference latency.
              </p>
            </div>
            <div className="p-8 rounded-[2rem] bg-surface-container-low border border-white/5">
              <h4 className="font-extrabold text-white text-xl mb-4 italic underline decoration-primary">Scaling Units</h4>
              <p className="text-lg text-on-surface-variant font-light leading-relaxed">
                 Our system scales effortlessly from 1 to 1M evidence events per day with guaranteed sub-second response times across all operational tiers.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PricingPage
