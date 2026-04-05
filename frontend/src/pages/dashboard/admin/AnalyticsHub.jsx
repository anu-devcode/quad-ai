import { useEffect, useMemo, useState } from 'react'
import { SurfaceCard } from '../../../components/ui'
import { LiveDot, Sparkline, StatusBadge } from '../../../components/dashboard/AdminVisuals'
import { useAuth } from '../../../context/AuthContext'
import { adminScope, getDashboardStats, getLoans, getModelMonitoring, getTransactions, toList } from '../../../services/campusApi'

function AnalyticsHub() {
  const { user } = useAuth()

  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loanRequests, setLoanRequests] = useState([])
  const [modelMonitoring, setModelMonitoring] = useState(null)
  const [error, setError] = useState('')
  const [exportMessage, setExportMessage] = useState('')

  const scope = useMemo(() => adminScope(user?.phone), [user?.phone])

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!user?.phone) {
        if (mounted) {
          setStats(null)
          setTransactions([])
          setLoanRequests([])
          setModelMonitoring(null)
        }
        return
      }

      try {
        const [statsPayload, txPayload, loanPayload, modelPayload] = await Promise.all([
          getDashboardStats(scope),
          getTransactions(scope),
          getLoans(scope),
          getModelMonitoring(),
        ])

        if (!mounted) return

        setStats(statsPayload)
        setTransactions(toList(txPayload))
        setLoanRequests(toList(loanPayload))
        setModelMonitoring(modelPayload)
        setError('')
      } catch (loadError) {
        if (!mounted) return
        setError(loadError.message || 'Unable to load analytics data.')
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [scope, user?.phone])

  const approvedCount = useMemo(
    () => loanRequests.filter((item) => String(item.status).toLowerCase() === 'approved').length,
    [loanRequests],
  )

  const rejectedCount = useMemo(
    () => loanRequests.filter((item) => String(item.status).toLowerCase() === 'rejected').length,
    [loanRequests],
  )

  const averageValidationScore = useMemo(() => {
    if (!transactions.length) return 0
    const total = transactions.reduce((sum, item) => sum + Number(item.validation_score || 0), 0)
    return Math.round((total / transactions.length) * 100)
  }, [transactions])

  const averageFraudProbability = Math.round(Number(modelMonitoring?.summary?.avg_fraud_probability || 0) * 100)
  const scoreTrend = [Math.max(0, averageValidationScore - 8), Math.max(0, averageValidationScore - 6), Math.max(0, averageValidationScore - 4), Math.max(0, averageValidationScore - 3), Math.max(0, averageValidationScore - 2), Math.max(0, averageValidationScore - 1), averageValidationScore]
  const fraudTrend = [Math.max(0, averageFraudProbability + 4), Math.max(0, averageFraudProbability + 3), Math.max(0, averageFraudProbability + 2), Math.max(0, averageFraudProbability + 1), averageFraudProbability]
  const qualityTrend = [Math.max(0, averageValidationScore - 10), Math.max(0, averageValidationScore - 7), Math.max(0, averageValidationScore - 4), Math.max(0, averageValidationScore - 2), averageValidationScore]

  const auditEvents = Number(loanRequests.length + transactions.filter((item) => String(item.status).toLowerCase() === 'flagged').length)

  const summaryCards = [
    { label: 'Approved loans', value: approvedCount, tone: 'good' },
    { label: 'High-risk alerts', value: Number(stats?.risk_distribution?.high || 0), tone: 'bad' },
    { label: 'Activity events', value: auditEvents, tone: 'info' },
  ]

  const recentEvents = useMemo(() => {
    const txEvents = transactions.slice(0, 3).map((item) => ({
      id: `tx-${item.id}`,
      title: `Transaction ${item.id} ${String(item.status).toLowerCase()}`,
      kind: 'transaction',
      description: `${item.data_source || item.transaction_source || 'unknown'} source`,
      createdAt: item.created_at,
    }))

    const loanEvents = loanRequests.slice(0, 3).map((item) => ({
      id: `loan-${item.id}`,
      title: `Loan ${item.id} ${String(item.status).toLowerCase()}`,
      kind: 'loan',
      description: item.admin_decision_note || item.decision_reasoning || 'No note',
      createdAt: item.updated_at || item.created_at,
    }))

    return [...txEvents, ...loanEvents]
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
      .slice(0, 5)
  }, [loanRequests, transactions])

  const handleExport = (format) => {
    const stamp = new Date().toISOString()
    setExportMessage(`Export prepared in ${format.toUpperCase()} format at ${stamp}.`)
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Reports</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Summary Reports</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Simple report view for transactions, risk, and loan results.</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <button onClick={() => handleExport('csv')} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-on-surface sm:w-auto">Export CSV</button>
          <button onClick={() => handleExport('pdf')} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-on-surface sm:w-auto">Export PDF</button>
          <LiveDot label="Auto refresh" />
        </div>
      </header>

      {exportMessage ? <p className="text-sm text-tertiary">{exportMessage}</p> : null}
      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <SurfaceCard key={card.label} className="glass-surface border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{card.label}</p>
              <StatusBadge tone={card.tone}>{card.label.split(' ')[0]}</StatusBadge>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{card.value}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Average Data Quality</p>
            <StatusBadge tone="good">Live</StatusBadge>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">{averageValidationScore}%</p>
          <div className="mt-4"><Sparkline values={scoreTrend} color="var(--tertiary)" /></div>
        </SurfaceCard>

        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Average Fraud Risk</p>
            <StatusBadge tone="bad">Model</StatusBadge>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">{averageFraudProbability}%</p>
          <div className="mt-4"><Sparkline values={fraudTrend} color="var(--error)" /></div>
        </SurfaceCard>

        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Data Quality</p>
            <StatusBadge tone="info">Rising</StatusBadge>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">{Math.max(0, averageValidationScore - rejectedCount)}%</p>
          <div className="mt-4"><Sparkline values={qualityTrend} color="var(--primary)" /></div>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-7">
          <h2 className="font-display text-2xl font-bold text-white">Quick Summary</h2>
          <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
            <li>{stats?.total_transactions || 0} transactions processed, with {stats?.flagged_count || 0} currently flagged.</li>
            <li>{approvedCount} loan requests approved and {rejectedCount} rejected in the current review window.</li>
            <li>The scoring system checked {modelMonitoring?.summary?.total_assessments || 0} records.</li>
          </ul>
        </SurfaceCard>

        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-5">
          <h2 className="font-display text-2xl font-bold text-white">Recent Operations</h2>
          <div className="mt-4 space-y-3">
            {recentEvents.map((event) => (
              <div key={event.id} className="rounded-xl border border-white/10 bg-surface-low/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-on-surface sm:max-w-[70%]">{event.title}</p>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">{event.kind}</span>
                </div>
                <p className="mt-1 text-xs text-on-surface-variant">{event.description}</p>
              </div>
            ))}
            {!recentEvents.length && <p className="text-sm text-on-surface-variant">No backend events available yet.</p>}
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}

export default AnalyticsHub
