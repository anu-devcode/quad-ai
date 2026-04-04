import { Link } from 'react-router-dom'
import { PremiumButton, SectionHeading, SurfaceCard } from '../components/ui'

function PricingPage() {
  const plans = [
    {
      name: 'Core',
      price: 'Custom',
      desc: 'Essential risk synthesis for growing institutional units.',
      features: ['Real-time Fraud Guard', 'Basic Trust Synthesis', 'Standard Support', '500 TX/sec Capacity'],
      cta: 'Request Quote',
      popular: false
    },
    {
      name: 'Pro',
      price: 'Custom',
      desc: 'Advanced neural modeling for high-velocity operations.',
      features: ['Deep Reasoning Engine', 'Full Forensic API', '24/7 Priority Ops', '10k TX/sec Capacity', 'Regulatory Reporting'],
      cta: 'Start Pro Trial',
      popular: true
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      desc: 'Complete metabolic control for global financial systems.',
      features: ['Dedicated Neural Cluster', 'Hardware Keystore Integration', 'Direct Scientist Access', 'Infinite Capacity', 'Custom Compliance Rules'],
      cta: 'Contact Sales',
      popular: false
    }
  ]

  return (
    <div className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12">
      <div className="absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-[150px]" />

      <main className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-20 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Investment Tiers</p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
            Pricing for <br />
            <span className="text-gradient">Sovereign Control</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-xl text-on-surface-variant">
            Choose the operational tier that matches your institution's velocity and risk profile.
          </p>
        </header>

        <section className="grid gap-8 lg:grid-cols-3">
          {plans.map((plan) => (
            <SurfaceCard 
              key={plan.name} 
              level="lowest" 
              className={`glass-surface p-8 flex flex-col relative ${plan.popular ? 'border-primary/50 shadow-[0_0_40px_rgba(99,102,241,0.1)]' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-primary px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
                  Most Deployed
                </div>
              )}
              <div className="mb-10">
                <h3 className="font-display text-3xl font-bold text-white">{plan.name}</h3>
                <p className="mt-4 text-on-surface-variant leading-relaxed">{plan.desc}</p>
              </div>
              <div className="mb-10">
                <p className="text-4xl font-bold text-white">{plan.price}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mt-2">Per Operational Cycle</p>
              </div>
              <ul className="space-y-4 mb-12 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-on-surface-variant">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/auth">
                <PremiumButton variant={plan.popular ? 'primary' : 'secondary'} className="w-full">
                  {plan.cta}
                </PremiumButton>
              </Link>
            </SurfaceCard>
          ))}
        </section>

        <section className="mt-32 text-center">
          <h2 className="font-display text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto text-left">
            <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant">
              <h4 className="font-bold text-white mb-3">How is "Custom" pricing determined?</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                We analyze your average transactional volume, risk exposure, and required support latency to build a custom metabolic tier.
              </p>
            </div>
            <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant">
              <h4 className="font-bold text-white mb-3">Can we switch tiers mid-cycle?</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Yes, our system scales automatically. If you exceed your current tier's capacity, you'll be transitioned seamlessly.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default PricingPage
