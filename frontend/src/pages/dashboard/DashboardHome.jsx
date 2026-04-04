import { Link } from 'react-router-dom'
import { PremiumButton, ProgressTrack, ScoreRing, SectionHeading, SurfaceCard, TokenPill } from '../../components/ui'
import { userProfile, userTransactions } from '../../data/mockData'

function txPill(status) {
  if (status === 'Completed') return 'good'
  if (status === 'Pending') return 'warn'
  return 'neutral'
}

function amountText(amount) {
  const sign = amount > 0 ? '+' : '-'
  return `${sign}$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function DashboardHome() {
  return (
    <section className="space-y-6">
      {/* Primary Balance Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        <SurfaceCard level="lowest" className="lg:col-span-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
            Aggregate Liquidity
          </p>
          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-5xl font-bold tracking-tight text-on-surface sm:text-6xl">
              ${userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
            <div className="mb-2">
              <TokenPill tone="good">+{userProfile.monthlyGain}% Periodic Growth</TokenPill>
            </div>
          </div>
          <div className="mt-8 flex gap-3">
            <Link to="/dashboard/send" className="flex-1">
              <PremiumButton variant="primary" className="w-full">Send Assets</PremiumButton>
            </Link>
            <Link to="/dashboard/loan" className="flex-1">
              <PremiumButton variant="secondary" className="w-full">Request Credit</PremiumButton>
            </Link>
          </div>
        </SurfaceCard>

        <SurfaceCard level="highest" className="flex flex-col justify-center border-l-2 border-primary/20">
          <SectionHeading overline="Trust Engine" title="Sovereign Compliance" />
          <p className="text-sm leading-relaxed text-on-surface-variant">
            Activity is <span className="font-bold text-on-surface">optimal</span>.
            Eligible for <span className="font-bold text-primary">15% expansion</span> based on fiduciary history.
          </p>
          <button className="mt-4 self-start text-[11px] font-bold uppercase tracking-[0.05em] text-primary hover:underline">
            View Analysis →
          </button>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 md:grid-cols-5">
        <SurfaceCard level="default" className="md:col-span-3">
          <SectionHeading
            overline="Journal Entry"
            title="Recent Activity"
            action={<Link to="/dashboard/history" className="text-[11px] font-bold uppercase tracking-[0.05em] text-primary">View Ledger</Link>}
          />
          <div className="space-y-1">
            {userTransactions.slice(0, 4).map((tx) => (
              <div
                key={tx.id}
                className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-background/50"
              >
                <div className="grid h-10 w-10 place-items-center rounded bg-surface-highest text-[10px] font-bold text-on-surface-variant group-hover:bg-surface-lowest transition-colors">
                  TX
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-on-surface">{tx.merchant}</p>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">{tx.category} • {tx.age}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.amount > 0 ? 'text-primary' : 'text-on-surface'}`}>
                    {amountText(tx.amount)}
                  </p>
                  <div className="mt-0.5">
                    <TokenPill tone={txPill(tx.status)}>{tx.status}</TokenPill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard level="lowest" className="md:col-span-2">
          <p className="text-center text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
            Fiduciary Credit Rating
          </p>
          <div className="mt-6">
            <ScoreRing score={userProfile.creditScore} />
          </div>
          <div className="mt-6 text-center">
            <TokenPill tone="info">High Confidence Integrity</TokenPill>
            <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-on-surface-variant">
              Score improved by <span className="font-bold text-on-surface">12 points</span> in the current verification cycle.
            </p>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard level="high" className="premium-gradient relative overflow-hidden text-white">
        <div className="relative z-10">
          <h3 className="font-display text-2xl font-bold sm:text-3xl">Integrity Insight Report</h3>
          <p className="mt-3 max-w-xl text-sm leading-relaxed opacity-90">
            Current debt-to-income ratio is in calculations. Top 5 percentile of institutional participants.
            Maintain current velocity to unlock Sovereign Tier.
          </p>
          <div className="mt-8 max-w-md rounded-xl bg-white/10 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.1em]">
              <span>Emergency Liquidity Pool</span>
              <span>85% Funded</span>
            </div>
            <ProgressTrack value={85} />
          </div>
        </div>
        <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </SurfaceCard>
    </section>
  )
}

export default DashboardHome
