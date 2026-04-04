import { Link } from 'react-router-dom'
import { PremiumButton, SurfaceCard } from '../components/ui'

function FeaturesPage() {
  const coreFeatures = [
    {
      title: 'OCR Engine',
      desc: 'Proprietary computer vision refined on millions of real-world mobile transaction screenshots. Extracts dates, amounts, and merchant data from messy, low-light, or fragmented inputs.',
      icon: '📷'
    },
    {
      title: 'SMS Parsing',
      desc: 'Direct extraction from operator-specific SMS formats (M-Pesa, MTN, Airtel). We parse incoming value notifications in real-time to build an immediate behavioral profile.',
      icon: '💬'
    },
    {
      title: 'AI Risk Scoring',
      desc: 'Proprietary credit scoring that analyzes transactional velocity, frequency of use, and merchant profiles to assign a trust score without traditional bureau data.',
      icon: '🧠'
    },
    {
      title: 'Confidence Layer',
      desc: 'Every piece of data is verified against its source. We assign a metadata reliability score to ensure decisions are backed by authentic financial evidence.',
      icon: '🛡️'
    }
  ]

  return (
    <div className="relative overflow-hidden bg-background px-4 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12">
      {/* Background Orbs */}
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] translate-x-1/2 translate-y-1/2 rounded-full bg-primary-dim/10 blur-[100px]" />

      <main className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-20 text-center">
          <div className="mb-8 inline-block rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 backdrop-blur-md">
            <span className="section-kicker">Technical Features</span>
          </div>
          <h1 className="landing-title mt-6 font-display text-4xl font-bold text-white sm:text-6xl lg:text-7xl">
            Deep Tech for <br />
            <span className="text-gradient">Real Evidence</span>
          </h1>
          <p className="body-muted mx-auto mt-10 max-w-2xl text-xl">
             Our core infrastructure is built around four specialized pillars designed to turn raw screenshots and messages into definitive financial signals.
          </p>
        </header>

        <section className="grid gap-12 lg:grid-cols-2">
           {coreFeatures.map(feat => (
              <SurfaceCard key={feat.title} level="lowest" className="glass-surface p-12 group hover:border-primary/30 transition-all">
                 <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="h-20 w-20 flex-shrink-0 bg-primary/20 rounded-[2rem] flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                       {feat.icon}
                    </div>
                    <div>
                       <h3 className="font-display text-3xl font-bold text-white mb-6 group-hover:text-primary transition-colors">{feat.title}</h3>
                       <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
                          {feat.desc}
                       </p>
                    </div>
                 </div>
              </SurfaceCard>
           ))}
        </section>

        <section className="mt-32 rounded-[2rem] bg-surface-container-high p-8 md:p-16 lg:p-24 overflow-hidden relative border border-white/10 shadow-2xl">
          <div className="relative z-10 grid gap-12 lg:grid-cols-2 items-center">
            <div>
              <p className="section-kicker">Integration</p>
              <h2 className="landing-title mt-6 font-display text-4xl font-bold text-white sm:text-5xl">
                Works with your <br /> existing app
              </h2>
              <p className="body-muted mt-8 text-xl">
                 You don't need to rebuild your login flow. Simply add our SDK to allow users to upload their transaction proof and receive instant scoring.
              </p>
              <div className="mt-12">
                <Link to="/auth">
                  <PremiumButton variant="primary" className="px-10 py-4">Get Started Now</PremiumButton>
                </Link>
              </div>
            </div>
            <div className="relative p-8 rounded-2xl bg-surface-container-lowest/50 border border-outline-variant shadow-inner">
               <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-surface-container-low border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">📷</div>
                  <div className="flex-1 h-3 bg-white/10 rounded-full" />
                  <div className="w-12 h-6 rounded-full bg-primary/40 animate-pulse" />
               </div>
               <div className="flex items-center gap-3 mb-6 p-3 rounded-lg bg-surface-container-low border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">💬</div>
                  <div className="flex-1 h-3 bg-white/10 rounded-full" />
                  <div className="w-12 h-6 rounded-full bg-primary/40 animate-pulse" />
               </div>
               <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">🎯</div>
                  <div className="flex-1">
                     <div className="h-2 w-1/2 bg-primary/30 rounded-full mb-2" />
                     <div className="h-2 w-1/4 bg-primary/30 rounded-full" />
                  </div>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default FeaturesPage
