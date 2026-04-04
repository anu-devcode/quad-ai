import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BottomNav from '../components/dashboard/BottomNav'
import { PremiumButton, ProgressTrack, ScoreRing, SectionHeading, SurfaceCard, TokenPill } from '../components/ui'
import { userProfile, userTransactions } from '../data/mockData'

function txPill(status) {
  if (status === 'Completed') return 'good'
  if (status === 'Pending') return 'warn'
  return 'neutral'
}

function amountText(amount) {
  const sign = amount > 0 ? '+' : '-'
  return `${sign}$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const tabLabels = {
  home: 'Home',
  history: 'History',
  send: 'Send Money',
  loan: 'Loan Request',
}

function DashboardHeader({ activeTab }) {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="grid h-12 w-12 place-items-center rounded-full bg-surface-highest text-on-surface shadow-premium">
          <span className="text-sm font-bold">AM</span>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.05em] text-on-surface-variant">
            Institutional Ledger
          </p>
          <h1 className="mt-0.5 font-display text-2xl font-semibold text-on-surface">
            {tabLabels[activeTab]}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <PremiumButton variant="secondary" className="px-4 py-2 text-[11px] font-bold uppercase tracking-[0.05em]">
          Alerts
        </PremiumButton>
      </div>
    </header>
  )
}

function HomeView() {
  return (
    <section className="space-y-6">
      {/* Primary Balance Section - Intentional Asymmetry */}
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
            <PremiumButton variant="primary" className="flex-1">Send Assets</PremiumButton>
            <PremiumButton variant="secondary" className="flex-1">Request Credit</PremiumButton>
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
        {/* Subtle background element */}
        <div className="absolute -bottom-12 -right-12 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      </SurfaceCard>
    </section>
  )
}

function HistoryView() {
  return (
    <SurfaceCard level="default">
      <SectionHeading overline="Complete Ledger" title="Transaction Integrity Log" />
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {userTransactions.map((tx) => (
          <div 
            key={tx.id} 
            className="flex items-center gap-4 rounded-lg bg-surface-low/50 p-4 transition-all hover:bg-surface-low"
          >
            <div className="grid h-10 w-10 place-items-center rounded bg-surface-lowest text-[10px] font-bold text-on-surface-variant">
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
              <div className="mt-1">
                <TokenPill tone={txPill(tx.status)}>{tx.status}</TokenPill>
              </div>
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  )
}

function SendView() {
  const [receiver, setReceiver] = useState('Sam A.')
  const [amount, setAmount] = useState('')
  const canSend = Number(amount) > 0

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SurfaceCard level="lowest" className="lg:col-span-2">
        <SectionHeading overline="Asset Transfer" title="Secure Dispatch" />
        <form className="mt-6 grid gap-6 sm:grid-cols-2">
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Recipient Unit</span>
            <input
              value={receiver}
              onChange={(event) => setReceiver(event.target.value)}
              className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-sm font-medium outline-none transition focus:ring-1 focus:ring-primary/40"
            />
          </label>
          <label className="block">
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Asset Quantity</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-sm font-medium outline-none transition focus:ring-1 focus:ring-primary/40"
            />
          </label>
        </form>
        <div className="mt-8">
          <PremiumButton
            disabled={!canSend}
            className="w-full sm:w-auto"
          >
            Authorize Transfer
          </PremiumButton>
        </div>
      </SurfaceCard>

      <SurfaceCard level="highest" className="flex items-center border-l-2 border-primary/20">
        <div>
          <SectionHeading overline="Verification" title="Institutional Audit" />
          <p className="text-sm leading-relaxed text-on-surface-variant">
            Every transaction undergoes rigorous <span className="font-bold text-on-surface">behavioral trust analysis</span> and anomaly detection before protocol approval.
          </p>
        </div>
      </SurfaceCard>
    </div>
  )
}

function LoanView() {
  const [amount, setAmount] = useState('')
  const eligible = useMemo(() => Math.round((userProfile.creditScore / 850) * 8000), [])

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <SurfaceCard level="lowest" className="lg:col-span-2">
        <SectionHeading overline="Liquidity Request" title="Institutional Credit Expansion" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-surface-low p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Rating Score</p>
            <p className="mt-2 font-display text-4xl font-bold text-on-surface">{userProfile.creditScore}</p>
          </div>
          <div className="rounded-lg bg-surface-highest p-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Available Ceiling</p>
            <p className="mt-2 font-display text-4xl font-bold text-primary">${eligible.toLocaleString()}</p>
          </div>
        </div>
        <label className="mt-8 block">
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Requested Allocation</span>
          <input
            type="number"
            min="100"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-sm font-medium outline-none transition focus:ring-1 focus:ring-primary/40"
          />
        </label>
        <div className="mt-8">
          <PremiumButton className="w-full sm:w-auto">Request Eligibility Audit</PremiumButton>
        </div>
      </SurfaceCard>

      <SurfaceCard level="highest" className="flex items-center border-l-2 border-secondary-container">
        <div>
          <SectionHeading overline="Compliance" title="Regulatory Buffer" />
          <p className="text-sm leading-relaxed text-on-surface-variant">
            Allocation is determined by cryptographic proof of history and <span className="font-bold text-on-surface">Sovereign Compliance</span> metrics.
          </p>
        </div>
      </SurfaceCard>
    </div>
  )
}

function UserDashboardPage() {
  const { tab } = useParams()
  const activeTab = tab && tabLabels[tab] ? tab : 'home'

  return (
    <div className="relative mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-8 sm:pt-8 lg:pb-12 lg:pt-12">
      <DashboardHeader activeTab={activeTab} />

      <main className="animate-enter">
        {activeTab === 'home' && <HomeView />}
        {activeTab === 'history' && <HistoryView />}
        {activeTab === 'send' && <SendView />}
        {activeTab === 'loan' && <LoanView />}
      </main>

      <BottomNav />
    </div>
  )
}

export default UserDashboardPage
