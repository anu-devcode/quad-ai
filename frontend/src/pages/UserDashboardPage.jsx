import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import BottomNav from '../components/dashboard/BottomNav'
import { ScoreRing, SectionHeading, SurfaceCard, TokenPill } from '../components/ui'
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
    <header className="mb-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-soft">
          <span className="text-sm font-semibold text-indigo-700">AM</span>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Welcome back</p>
          <h1 className="font-display text-2xl font-semibold text-indigo-800">{tabLabels[activeTab]}</h1>
        </div>
      </div>
      <button className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.15em] text-slate-700 shadow-soft">
        Alerts
      </button>
    </header>
  )
}

function HomeView() {
  return (
    <section className="space-y-4">
      <SurfaceCard className="p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Available Balance</p>
        <div className="mt-2 flex items-end justify-between gap-3">
          <h2 className="font-display text-5xl font-semibold tracking-tight text-slate-900">
            ${userProfile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <p className="text-sm font-semibold text-indigo-700">+{userProfile.monthlyGain}% this month</p>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <Link to="/dashboard/send" className="rounded-2xl bg-indigo-700 px-3 py-4 text-center text-sm font-semibold text-white">
            Send Money
          </Link>
          <Link to="/dashboard/loan" className="rounded-2xl px-3 py-4 text-center text-sm font-semibold text-slate-800">
            Request Loan
          </Link>
        </div>
      </SurfaceCard>

      <SurfaceCard className="border-l-2 border-l-red-700 p-6">
        <SectionHeading overline="AI Insights" title="Your activity is consistent" />
        <p className="text-sm text-slate-600">
          You are eligible for a <span className="font-semibold text-red-700">15% credit limit increase</span> based on your last three months of fiduciary compliance.
        </p>
        <button className="mt-4 text-sm font-semibold text-indigo-700">View Full Analysis →</button>
      </SurfaceCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <SurfaceCard className="p-5">
          <SectionHeading
            overline="Recent Transactions"
            title="Latest Activity"
            action={<Link to="/dashboard/history" className="text-sm font-semibold text-indigo-700">View All</Link>}
          />
          <div className="space-y-3">
            {userTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-600">TX</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-slate-900">{tx.merchant}</p>
                  <p className="text-xs text-slate-500">{tx.category} • {tx.age}</p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${tx.amount > 0 ? 'text-indigo-700' : 'text-slate-900'}`}>{amountText(tx.amount)}</p>
                  <div className="mt-1">
                    <TokenPill tone={txPill(tx.status)}>{tx.status}</TokenPill>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-6">
          <p className="text-center text-xs uppercase tracking-[0.2em] text-slate-400">Fiduciary Credit Score</p>
          <div className="mt-4">
            <ScoreRing score={userProfile.creditScore} />
          </div>
          <div className="mt-4 text-center">
            <TokenPill tone="info">High Trust / Low Risk</TokenPill>
            <p className="mx-auto mt-3 max-w-xs text-sm text-slate-600">
              Your score improved by 12 points since your last verification cycle.
            </p>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard className="bg-gradient-to-br from-indigo-700 to-indigo-800 p-6 text-white">
        <h3 className="font-display text-3xl font-semibold">Financial Health Report</h3>
        <p className="mt-3 text-sm text-indigo-100">
          Your debt-to-income ratio is in the top 5% of our users. Maintain current spending habits to unlock Premium Tier features.
        </p>
        <div className="mt-4 rounded-2xl bg-white/10 p-4">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.15em] text-indigo-100">
            <span>Goal: Emergency Fund</span>
            <span>85%</span>
          </div>
          <div className="h-2 rounded-full bg-white/25">
            <div className="h-2 w-[85%] rounded-full bg-white" />
          </div>
        </div>
      </SurfaceCard>
    </section>
  )
}

function HistoryView() {
  return (
    <SurfaceCard className="p-5">
      <SectionHeading overline="Recent Transactions" title="Complete Activity Ledger" />
      <div className="space-y-3">
        {userTransactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-600">TX</div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-slate-900">{tx.merchant}</p>
              <p className="text-xs text-slate-500">{tx.category} • {tx.age}</p>
            </div>
            <div className="text-right">
              <p className={`font-semibold ${tx.amount > 0 ? 'text-indigo-700' : 'text-slate-900'}`}>{amountText(tx.amount)}</p>
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
    <SurfaceCard className="p-6">
      <SectionHeading overline="Transfer" title="Send Money Securely" />
      <form className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-700">
          Recipient
          <input
            value={receiver}
            onChange={(event) => setReceiver(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500"
          />
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Amount
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500"
          />
        </label>
      </form>
      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        AI will run recipient trust, amount behavior, and anomaly checks before approving this transfer.
      </div>
      <button
        disabled={!canSend}
        className="mt-4 rounded-xl bg-indigo-700 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Continue Transfer
      </button>
    </SurfaceCard>
  )
}

function LoanView() {
  const [amount, setAmount] = useState('')
  const eligible = useMemo(() => Math.round((userProfile.creditScore / 850) * 8000), [])

  return (
    <SurfaceCard className="p-6">
      <SectionHeading overline="Credit Access" title="Request Loan" />
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Score</p>
          <p className="mt-1 font-display text-3xl font-semibold text-slate-900">{userProfile.creditScore}</p>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Instant Eligible Amount</p>
          <p className="mt-1 font-display text-3xl font-semibold text-indigo-700">${eligible.toLocaleString()}</p>
        </div>
      </div>
      <label className="mt-4 block text-sm font-semibold text-slate-700">
        Requested Amount
        <input
          type="number"
          min="100"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500"
        />
      </label>
      <button className="mt-4 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Check Eligibility</button>
    </SurfaceCard>
  )
}

function UserDashboardPage() {
  const { tab } = useParams()
  const activeTab = tab && tabLabels[tab] ? tab : 'home'

  return (
    <div className="relative mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:pt-10">
      <DashboardHeader activeTab={activeTab} />

      {activeTab === 'home' && <HomeView />}
      {activeTab === 'history' && <HistoryView />}
      {activeTab === 'send' && <SendView />}
      {activeTab === 'loan' && <LoanView />}

      <BottomNav />
    </div>
  )
}

export default UserDashboardPage
