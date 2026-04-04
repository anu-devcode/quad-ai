import { Link } from 'react-router-dom'
import BottomNav from '../components/dashboard/BottomNav'
import { PremiumButton, SectionHeading, SurfaceCard, TokenPill } from '../components/ui'
import { adminStats, decisionFeed, flaggedUsers } from '../data/mockData'

function riskTone(risk) {
  if (risk === 'High') return 'bad'
  if (risk === 'Medium') return 'warn'
  return 'good'
}

function AdminDashboardPage() {
  return (
    <div className="relative px-4 pb-32 pt-6 sm:px-8 sm:pt-8 lg:px-12 lg:pb-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
              Risk Operations Command
            </p>
            <h1 className="mt-1 font-display text-3xl font-bold text-on-surface sm:text-4xl">
              Sovereign Console
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/auth">
              <PremiumButton variant="secondary" className="text-[11px] font-bold uppercase tracking-[0.05em]">
                Switch Unit
              </PremiumButton>
            </Link>
            <PremiumButton variant="primary" className="text-[11px] font-bold uppercase tracking-[0.05em]">
              Export Audit Log
            </PremiumButton>
          </div>
        </header>

        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {adminStats.map((stat) => (
            <SurfaceCard key={stat.label} level="lowest">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                {stat.label}
              </p>
              <div className="mt-4 flex items-baseline justify-between">
                <p className="font-display text-3xl font-bold text-on-surface">{stat.value}</p>
                <p className="text-xs font-bold text-tertiary">{stat.change}</p>
              </div>
            </SurfaceCard>
          ))}
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
          <SurfaceCard level="default" className="overflow-hidden">
            <SectionHeading overline="Protocol Deviations" title="Queue for Human Audit" />

            {/* Mobile View */}
            <div className="space-y-4 md:hidden">
              {flaggedUsers.map((user) => (
                <article key={user.id} className="rounded-lg bg-surface-low p-5">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-on-surface">{user.name}</p>
                      <p className="text-[10px] font-medium text-on-surface-variant">{user.id}</p>
                    </div>
                    <TokenPill tone={riskTone(user.risk)}>{user.risk}</TokenPill>
                  </div>
                  <p className="text-sm leading-relaxed text-on-surface-variant">{user.reason}</p>
                  <PremiumButton variant="secondary" className="mt-4 w-full text-xs">
                    {user.action}
                  </PremiumButton>
                </article>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-outline-variant/30 text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                    <th className="pb-4 pt-0 px-2 font-bold">Unit Identifier</th>
                    <th className="pb-4 pt-0 px-2 font-bold">Deviation Factor</th>
                    <th className="pb-4 pt-0 px-2 font-bold">Risk Weight</th>
                    <th className="pb-4 pt-0 px-2 font-bold text-right">Protocol</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {flaggedUsers.map((user) => (
                    <tr key={user.id} className="group transition-colors hover:bg-surface-high/30">
                      <td className="px-2 py-4">
                        <p className="font-semibold text-on-surface">{user.name}</p>
                        <p className="text-[10px] font-medium text-on-surface-variant">{user.id}</p>
                      </td>
                      <td className="px-2 py-4 text-on-surface-variant leading-relaxed">{user.reason}</td>
                      <td className="px-2 py-4">
                        <TokenPill tone={riskTone(user.risk)}>{user.risk}</TokenPill>
                      </td>
                      <td className="px-2 py-4 text-right">
                        <button className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary hover:underline">
                          {user.action}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>

          <SurfaceCard className="premium-gradient flex flex-col text-white">
            <SectionHeading
              overline="Neural Insights"
              title="Real-time Engine Logs"
              action={<TokenPill tone="good">SyncActive</TokenPill>}
            />
            <div className="mt-4 flex-1 space-y-3">
              {decisionFeed.map((item) => (
                <div key={item.id} className="rounded-lg bg-white/10 p-4 transition-transform hover:scale-[1.02]">
                  <p className="text-sm font-bold text-white">{item.event}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px] font-medium text-white/70">
                    <span>{item.actor}</span>
                    <span>{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
            <PremiumButton variant="secondary" className="mt-8 w-full bg-white/20 text-white hover:bg-white/30">
              Open Complete Audit Trail
            </PremiumButton>
          </SurfaceCard>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

export default AdminDashboardPage
