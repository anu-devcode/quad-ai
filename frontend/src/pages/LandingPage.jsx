import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { SurfaceCard } from '../components/ui'
import { landingHighlights } from '../data/mockData'

function LandingPage() {
  return (
    <div className="relative px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      <SiteHeader />

      <main className="mx-auto mt-6 max-w-6xl">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <SurfaceCard className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-900 p-8 text-white">
            <p className="text-xs uppercase tracking-[0.26em] text-indigo-200">Financial Intelligence Platform</p>
            <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
              Trusted money movement for users and risk teams.
            </h1>
            <p className="mt-4 max-w-xl text-sm text-indigo-100/90 sm:text-base">
              A unified product experience for member banking, AI-powered credit progression, and institutional fraud control.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/auth" className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900">
                Start Secure Session
              </Link>
              <Link to="/dashboard" className="rounded-full border border-white/40 px-5 py-2.5 text-sm font-semibold text-white">
                View User Dashboard
              </Link>
            </div>
          </SurfaceCard>

          <SurfaceCard className="p-7">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Live Confidence Layer</p>
            <div className="mt-4 space-y-4">
              {landingHighlights.map((item) => (
                <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                  <h3 className="font-display text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{item.text}</p>
                </div>
              ))}
            </div>
          </SurfaceCard>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <SurfaceCard>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">User Wallet</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">Elegant daily banking</h3>
            <p className="mt-2 text-sm text-slate-600">A mobile-first workspace for balances, transactions, trust score, and advisor actions.</p>
          </SurfaceCard>
          <SurfaceCard>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Operations Console</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">Control center for analysts</h3>
            <p className="mt-2 text-sm text-slate-600">Monitor anomalies, process flagged users, and review model decisions with full context.</p>
          </SurfaceCard>
          <SurfaceCard>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Secure Auth</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-slate-900">Unified sign in and onboarding</h3>
            <p className="mt-2 text-sm text-slate-600">Fast access with professional UI language and intentional transitions across every surface.</p>
          </SurfaceCard>
        </section>
      </main>
    </div>
  )
}

export default LandingPage
