import { Link } from 'react-router-dom'
import { PremiumButton, SurfaceCard } from '../components/ui'

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
          <div className="mb-8 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 backdrop-blur-md">
            <span className="section-kicker">Operational Tiers</span>
          </div>
          <h1 className="landing-title mt-6 mb-10 font-display text-5xl font-extrabold text-white sm:text-7xl lg:text-8xl">
             Build Trust <br />
             <span className="text-gradient">at Any Scale</span>
          </h1>
          <p className="body-muted mx-auto mt-10 max-w-3xl text-xl md:text-2xl">
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
                <div className="absolute right-10 top-0 -translate-y-1/2 rounded-full bg-primary px-5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white">
                  Most Deployed
                </div>
              )}
              <div className="mb-12">
                <h3 className="font-display text-3xl font-bold text-white mb-4 group-hover:text-primary transition-colors">{plan.name}</h3>
                <p className="body-muted text-lg">{plan.desc}</p>
              </div>
              <div className="mb-12">
                <p className="text-5xl font-extrabold text-white">{plan.price}</p>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">Per Scaling Unit</p>
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
                <PremiumButton variant={plan.popular ? 'primary' : 'secondary'} className={`w-full rounded-xl py-4 text-lg font-semibold ${plan.popular ? 'bg-primary' : 'bg-white/10 text-white border border-white/10 hover:bg-white/10'}`}>
                  {plan.cta}
                </PremiumButton>
              </Link>
            </SurfaceCard>
          ))}
        </section>

        <section className="mx-auto mt-40 max-w-4xl text-center">
          <h2 className="landing-title mb-12 font-display text-4xl font-bold text-white sm:text-5xl">Institutional Commitments</h2>
          <div className="grid gap-8 md:grid-cols-2 text-left">
            <div className="p-8 rounded-[2rem] bg-surface-container-low border border-white/5">
              <h4 className="mb-4 text-xl font-bold text-white">Dynamic Determination</h4>
              <p className="body-muted text-lg">
                 We determine custom Pro and Enterprise rates based on your monthly evidence ingestion volume and required trust inference latency.
              </p>
            </div>
            <div className="p-8 rounded-[2rem] bg-surface-container-low border border-white/5">
              <h4 className="mb-4 text-xl font-bold text-white">Scaling Units</h4>
              <p className="body-muted text-lg">
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
