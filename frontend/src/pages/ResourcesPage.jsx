import { Link } from 'react-router-dom'
import { PremiumButton, SectionHeading, SurfaceCard } from '../components/ui'

function ResourcesPage() {
  const resourceCategories = [
    { title: 'API Documentation', icon: '📖', desc: 'Detailed reference and integration guides for the Evidence Engine and Inference API.', link: '#' },
    { title: 'Developer SDKs', icon: '📦', desc: 'Client-side SDKs for instant OCR and SMS extraction on web, mobile, and desktop.', link: '#' },
    { title: 'The Trust Blog', icon: '📝', desc: 'Research from our data scientists on financial inclusion and alternative credit scoring.', link: '#' },
    { title: 'Legal & Compliance', icon: '🛡️', desc: 'Understanding data sovereignty, privacy, and regulatory framework positioning.', link: '#' }
  ]

  const technicalPapers = [
    {
       title: 'Beyond the Bureau: Behavioral Credit Scoring',
       type: 'Whitepaper',
       time: '18 min read',
       link: '#'
    },
    {
       title: 'Deep OCR for Low-Res Financial Evidence',
       type: 'Technical Guide',
       time: '12 min read',
       link: '#'
    },
    {
       title: 'SMS Metadata Proofs vs Fake Data',
       type: 'Security Analysis',
       time: '24 min read',
       link: '#'
    }
  ]

  return (
    <div className="relative overflow-hidden bg-background px-4 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12 text-on-surface">
      <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <main className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-24">
          <div className="max-w-4xl">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-10 underline">Knowledge Center</p>
            <h1 className="font-display text-5xl font-extrabold leading-tight text-white mb-10 sm:text-7xl lg:text-8xl tracking-tight leading-[1.05]">
               Knowledge for <br />
               <span className="text-gradient">Integrity Builders</span>
            </h1>
            <p className="text-2xl text-on-surface-variant font-light max-w-2xl leading-relaxed lg:text-3xl">
               Everything you need to integrate and master alternative financial trust data.
            </p>
          </div>
        </header>

        <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 mb-32">
          {resourceCategories.map((rc) => (
            <SurfaceCard key={rc.title} level="lowest" className="glass-surface p-10 hover:border-primary/50 transition-all border-white/5 cursor-pointer flex flex-col items-center text-center">
              <div className="text-5xl mb-6">{rc.icon}</div>
              <h3 className="font-display text-xl font-bold text-white mb-4 italic">{rc.title}</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed font-light">{rc.desc}</p>
            </SurfaceCard>
          ))}
        </section>

        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-4 italic">[ Curated Content ]</p>
              <h2 className="font-display text-4xl font-bold text-white sm:text-6xl tracking-tight leading-tight">Featured Research</h2>
           </div>
           <button className="text-sm font-bold text-white/40 hover:text-primary transition-colors underline decoration-white/20">View All Archive →</button>
        </div>

        <section className="grid gap-10 lg:grid-cols-3">
          {technicalPapers.map((paper) => (
            <SurfaceCard key={paper.title} level="lowest" className="glass-surface p-10 group flex flex-col justify-between border-white/5 hover:bg-white/5 transition-all">
               <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-6 block italic">{paper.type}</span>
                  <h3 className="font-display text-3xl font-bold text-white group-hover:text-primary transition-colors leading-tight mb-8">
                     {paper.title}
                  </h3>
               </div>
               <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant italic opacity-60 font-mono">{paper.time}</span>
                  <button className="text-sm font-black text-white hover:text-primary transition-all flex items-center gap-3">
                     Explore Content
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 translate-x-0 group-hover:translate-x-2 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                     </svg>
                  </button>
               </div>
            </SurfaceCard>
          ))}
        </section>

        <section className="mt-40 mb-20 p-2 rounded-[3.5rem] bg-surface-container shadow-2xl relative overflow-hidden group">
           <div className="p-16 md:p-24 rounded-[3rem] bg-background border border-white/10 relative z-10 flex flex-col items-center text-center">
              <h2 className="font-display text-5xl font-extrabold text-white mb-8 sm:text-7xl lg:text-8xl tracking-tighter leading-none italic">Need Custom Help?</h2>
              <p className="text-xl text-on-surface-variant mb-14 max-w-3xl font-light lg:text-2xl leading-relaxed">
                 Our technical solutions team is available for deep architectural consulting and custom operational unit planning.
              </p>
              <PremiumButton variant="primary" className="px-16 py-6 text-2xl font-black bg-primary rounded-[2rem] hover:brightness-110 shadow-premium">Talk to a Scientist</PremiumButton>
           </div>
           <div className="absolute inset-0 bg-primary/20 animate-pulse pointer-events-none" />
        </section>
      </main>
    </div>
  )
}

export default ResourcesPage
