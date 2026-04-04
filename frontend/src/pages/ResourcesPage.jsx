import { Link } from 'react-router-dom'
import { PremiumButton, SectionHeading, SurfaceCard } from '../components/ui'

function ResourcesPage() {
  const categories = [
    { title: 'Documentation', icon: '📄', count: '142 Articles' },
    { title: 'API Reference', icon: '🔌', count: '24 Endpoints' },
    { title: 'Case Studies', icon: '📊', count: '12 Stories' },
    { title: 'Security Audits', icon: '🛡️', count: 'Quarterly' },
  ]

  const featuredResources = [
    {
      title: 'Institutional Transition Guide',
      desc: 'How legacy institutions are migrating to AI-verified ledgers.',
      type: 'Guide',
      time: '12 min read'
    },
    {
      title: 'Neural Risk Modeling v4.2',
      desc: 'Technical whitepaper on our latest inference engine architecture.',
      type: 'Whitepaper',
      time: '45 page PDF'
    },
    {
      title: 'API Integration patterns',
      desc: 'Best practices for high-velocity transactional integration.',
      type: 'Technical',
      time: '8 min read'
    }
  ]

  return (
    <div className="relative overflow-hidden px-4 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12">
      <div className="absolute right-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />

      <main className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-20">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Knowledge Center</p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
            Resources for <br />
            <span className="text-gradient">Innovators</span>
          </h1>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-20">
          {categories.map((cat) => (
            <SurfaceCard key={cat.title} level="lowest" className="glass-surface p-6 hover:bg-white/5 transition-colors cursor-pointer text-center">
              <div className="text-4xl mb-4">{cat.icon}</div>
              <h3 className="font-display text-lg font-bold text-white">{cat.title}</h3>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">{cat.count}</p>
            </SurfaceCard>
          ))}
        </section>

        <SectionHeading overline="Featured Content" title="Insights & Research" />
        <div className="grid gap-8 lg:grid-cols-3">
          {featuredResources.map((res) => (
            <SurfaceCard key={res.title} level="lowest" className="glass-surface p-8 group flex flex-col justify-between h-full">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-4 block">{res.type}</span>
                <h3 className="font-display text-2xl font-bold text-white group-hover:text-primary transition-colors">{res.title}</h3>
                <p className="mt-4 text-on-surface-variant leading-relaxed">
                  {res.desc}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-outline-variant flex items-center justify-between">
                <span className="text-xs font-medium text-on-surface-variant">{res.time}</span>
                <button className="text-sm font-bold text-white hover:text-primary transition-colors flex items-center gap-2">
                  Read More
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </SurfaceCard>
          ))}
        </div>

        <section className="mt-32 rounded-[2rem] premium-gradient p-12 text-center text-white">
          <h2 className="font-display text-4xl font-bold mb-6">Need Custom Support?</h2>
          <p className="mx-auto max-w-2xl text-lg opacity-90 mb-10">
            Our technical solutions team is available for deep architectural consulting and customized integration planning.
          </p>
          <PremiumButton variant="secondary" className="bg-white text-primary hover:bg-white/90 px-10">Talk to a Scientist</PremiumButton>
        </section>
      </main>
    </div>
  )
}

export default ResourcesPage
