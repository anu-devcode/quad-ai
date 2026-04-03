import { Link } from 'react-router-dom'
import BottomNav from '../components/dashboard/BottomNav'
import { SectionHeading, SurfaceCard, TokenPill } from '../components/ui'
import { adminStats, decisionFeed, flaggedUsers } from '../data/mockData'

function riskTone(risk) {
  if (risk === 'High') return 'bad'
  if (risk === 'Medium') return 'warn'
  return 'good'
}

function AdminDashboardPage() {
  return (
    <div className="relative px-4 pb-28 pt-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Risk Operations Console</p>
            <h1 className="font-display text-4xl font-semibold text-slate-900">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/auth" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">
              Switch Account
            </Link>
            <button className="rounded-full bg-indigo-700 px-4 py-2 text-sm font-semibold text-white">Export Daily Report</button>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {adminStats.map((stat) => (
            <SurfaceCard key={stat.label}>
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{stat.label}</p>
              <p className="mt-2 font-display text-3xl font-semibold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">{stat.change}</p>
            </SurfaceCard>
          ))}
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <SurfaceCard>
            <SectionHeading overline="Flagged Accounts" title="Queue Requiring Review" />
            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full border-collapse bg-white text-sm">
                <thead>
                  <tr className="bg-slate-50 text-left text-xs uppercase tracking-[0.16em] text-slate-400">
                    <th className="px-4 py-3">Account</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedUsers.map((user) => (
                    <tr key={user.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.id}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{user.reason}</td>
                      <td className="px-4 py-3">
                        <TokenPill tone={riskTone(user.risk)}>{user.risk}</TokenPill>
                      </td>
                      <td className="px-4 py-3">
                        <button className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">{user.action}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SurfaceCard>

          <SurfaceCard className="bg-gradient-to-br from-slate-900 to-indigo-900 text-white">
            <SectionHeading
              overline="Decision Feed"
              title="Recent Model Actions"
              action={<TokenPill tone="info">Live</TokenPill>}
            />
            <div className="space-y-3">
              {decisionFeed.map((item) => (
                <div key={item.id} className="rounded-2xl border border-white/20 bg-white/5 p-3">
                  <p className="font-semibold text-white">{item.event}</p>
                  <p className="mt-1 text-xs text-indigo-100">{item.actor}</p>
                  <p className="mt-1 text-xs text-indigo-200">{item.timestamp}</p>
                </div>
              ))}
            </div>
            <button className="mt-4 w-full rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900">
              Open Full Audit Trail
            </button>
          </SurfaceCard>
        </section>
      </div>

      <BottomNav />
    </div>
  )
}

export default AdminDashboardPage
