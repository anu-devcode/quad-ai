import { SurfaceCard } from '../../../components/ui'
import { LiveDot, Sparkline, StatusBadge } from '../../../components/dashboard/AdminVisuals'
import { useAdminOps } from '../../../context/AdminOpsContext'
import { useVerification } from '../../../context/VerificationContext'
import { useAuth } from '../../../context/AuthContext'
import { useState } from 'react'

function AnalyticsHub() {
  const { users, riskSummary, activityLog, exportAnalytics, policy } = useAdminOps()
  const { queueStats, decisionEvents } = useVerification()
  const { user } = useAuth()
  const [exportMessage, setExportMessage] = useState('')

  const averageScore = Math.round(users.reduce((sum, entry) => sum + entry.score, 0) / users.length)
  const scoreTrend = [averageScore - 18, averageScore - 12, averageScore - 10, averageScore - 6, averageScore - 4, averageScore - 2, averageScore - 1, averageScore]
  const fraudRate = Math.round((riskSummary.high / Math.max(1, riskSummary.total)) * 100)
  const fraudTrend = [fraudRate + 4, fraudRate + 3, fraudRate + 3, fraudRate + 2, fraudRate + 1, fraudRate + 1, fraudRate, fraudRate]
  const qualityBase = Math.min(98, Math.max(72, policy.confidenceThreshold + queueStats.approved - queueStats.pending))
  const qualityTrend = [qualityBase - 8, qualityBase - 6, qualityBase - 5, qualityBase - 4, qualityBase - 2, qualityBase - 1, qualityBase, qualityBase]

  const handleExport = (format) => {
    const reportId = exportAnalytics(format, user?.name || 'System Admin')
    setExportMessage(`Generated ${format.toUpperCase()} report ${reportId}.`)
  }

  const summaryCards = [
    { label: 'Approved reviews', value: queueStats.approved, tone: 'good' },
    { label: 'High-risk cases', value: riskSummary.high, tone: 'bad' },
    { label: 'Audit events', value: decisionEvents.length + activityLog.length, tone: 'info' },
  ]

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Business Intelligence</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Analytics Hub</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Score, fraud, and data quality storytelling with export-ready insights.</p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <button onClick={() => handleExport('csv')} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-on-surface sm:w-auto">Export CSV</button>
          <button onClick={() => handleExport('pdf')} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-on-surface sm:w-auto">Export PDF</button>
          <LiveDot label="Auto Refresh" />
        </div>
      </header>
      {exportMessage ? <p className="text-sm text-tertiary">{exportMessage}</p> : null}

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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Average Score Trend</p>
            <StatusBadge tone="good">+2.4%</StatusBadge>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">{averageScore}</p>
          <div className="mt-4"><Sparkline values={scoreTrend} color="var(--tertiary)" /></div>
        </SurfaceCard>

        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Fraud Rate Evolution</p>
            <StatusBadge tone="bad">-0.5%</StatusBadge>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">{fraudRate}%</p>
          <div className="mt-4"><Sparkline values={fraudTrend} color="var(--error)" /></div>
        </SurfaceCard>

        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Data Quality</p>
            <StatusBadge tone="info">Rising</StatusBadge>
          </div>
          <p className="mt-4 text-4xl font-bold text-white">{qualityBase}%</p>
          <div className="mt-4"><Sparkline values={qualityTrend} color="var(--primary)" /></div>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-7">
          <h2 className="font-display text-2xl font-bold text-white">Executive Narrative</h2>
          <ul className="mt-4 space-y-3 text-sm text-on-surface-variant">
            <li>Average score is {averageScore}, driven by {queueStats.approved} approved verification-backed decisions.</li>
            <li>{riskSummary.high} high-risk cases remain in the risk engine and {riskSummary.escalated} are escalated.</li>
            <li>{decisionEvents.length} loan decision events are available for audit and post-decision review.</li>
          </ul>
        </SurfaceCard>

        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-5">
          <h2 className="font-display text-2xl font-bold text-white">Recent Export / Ops Activity</h2>
          <div className="mt-4 space-y-3">
            {activityLog.slice(0, 5).map((event) => (
              <div key={event.id} className="rounded-xl border border-white/10 bg-surface-low/50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-on-surface sm:max-w-[70%]">{event.title}</p>
                  <span className="text-[10px] uppercase tracking-[0.14em] text-on-surface-variant">{event.kind}</span>
                </div>
                <p className="mt-1 text-xs text-on-surface-variant">{event.description}</p>
              </div>
            ))}
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}

export default AnalyticsHub
