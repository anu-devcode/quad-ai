import { SurfaceCard } from '../../../components/ui'
import { useVerification } from '../../../context/VerificationContext'
import { LiveDot, MiniBarTrend, RadialGauge, Sparkline, StatusBadge, TooltipHint } from '../../../components/dashboard/AdminVisuals'
import { useAdminOps } from '../../../context/AdminOpsContext'
import { useAuth } from '../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'

function AdminOverview() {
   const navigate = useNavigate()
   const { user } = useAuth()
   const { queueStats, decisionEvents, loanRequests } = useVerification()
   const { activityLog, riskCases, riskSummary, policy, modelSummary, updateRiskCaseStatus } = useAdminOps()
   const [message, setMessage] = useState('')

   const kpis = [
      { label: 'Active Verifications', value: queueStats.pending + queueStats.pendingLoanRequests, delta: '+14.2%', tone: 'warn', trend: [12, 15, 18, 21, 20, 24, 27] },
      { label: 'High Risk Cases', value: riskSummary.high, delta: `${policy.riskThreshold}% threshold`, tone: riskSummary.high > 1 ? 'bad' : 'warn', trend: [9, 8, 7, 7, 6, 5, riskSummary.high] },
      { label: 'Approval Throughput', value: queueStats.approved, delta: '+8.1%', tone: 'good', trend: [9, 10, 12, 15, 14, 17, 19] },
      { label: 'Models Calibrating', value: modelSummary.calibrating, delta: `${modelSummary.active} active`, tone: 'info', trend: [1, 1, 2, 1, 1, 2, modelSummary.calibrating] },
   ]

   const queueLoad = queueStats.total === 0 ? 0 : ((queueStats.pending + queueStats.pendingLoanRequests) / Math.max(1, queueStats.total)) * 100

   const latestFeed = useMemo(() => {
      const decisionFeed = decisionEvents.map((event) => ({
         id: event.id,
         title: `${event.ownerName} ${event.decision.toLowerCase()}`,
         note: event.note || 'No note provided.',
         createdAt: event.createdAt,
         tone: event.decision === 'Approved' ? 'good' : 'bad',
      }))

      const activityFeed = activityLog.map((event) => ({
         id: event.id,
         title: event.title,
         note: event.description,
         createdAt: event.createdAt,
         tone: event.kind === 'risk' || event.kind === 'user' ? 'warn' : event.kind === 'model' ? 'info' : 'neutral',
      }))

      return [...decisionFeed, ...activityFeed]
         .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt))
         .slice(0, 5)
   }, [decisionEvents, activityLog])

   const actor = user?.name || 'System Admin'

   const priorityCards = [
      { label: 'Open risk cases', value: riskSummary.open, tone: 'warn' },
      { label: 'Escalated now', value: riskSummary.escalated, tone: 'bad' },
      { label: 'Policy threshold', value: `${policy.riskThreshold}%`, tone: 'info' },
   ]

   const handleEscalateRiskBatch = () => {
      const openCase = riskCases.find((entry) => entry.status === 'Open')
      if (!openCase) {
         setMessage('No open cases available for escalation.')
         return
      }
      updateRiskCaseStatus(openCase.id, 'Escalated', actor)
      setMessage(`Escalated ${openCase.user} from Control Center.`)
   }

   return (
      <div className="mx-auto max-w-7xl space-y-8 animate-enter">
         <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
               <p className="section-kicker">AI Financial Control Center</p>
               <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Control Center</h1>
               <p className="mt-2 text-sm text-on-surface-variant">Command every trust decision from one action-first workspace.</p>
            </div>
            <div className="flex items-center gap-3">
               <LiveDot label="Live telemetry" />
               <StatusBadge tone="info">Latency 14ms</StatusBadge>
            </div>
         </header>
         {message ? <p className="text-sm text-tertiary">{message}</p> : null}

         <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {kpis.map((kpi) => (
               <SurfaceCard key={kpi.label} className="glass-surface border-white/10 p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                     <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">{kpi.label}</p>
                     <StatusBadge tone={kpi.tone}>{kpi.delta}</StatusBadge>
                  </div>
                  <p className="mt-3 text-3xl font-bold text-white">{kpi.value}</p>
                  <div className="mt-3">
                     <Sparkline values={kpi.trend} />
                  </div>
               </SurfaceCard>
            ))}
         </div>

         <div className="grid gap-4 sm:grid-cols-3">
            {priorityCards.map((card) => (
               <SurfaceCard key={card.label} className="glass-surface border-white/10 p-4">
                  <div className="flex items-center justify-between gap-3">
                     <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">{card.label}</p>
                     <StatusBadge tone={card.tone}>{card.label.split(' ')[0]}</StatusBadge>
                  </div>
                  <p className="mt-3 text-2xl font-bold text-white">{card.value}</p>
               </SurfaceCard>
            ))}
         </div>

         <div className="grid gap-6 lg:grid-cols-12">
            <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-8">
               <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-white">Decision Throughput Story</h2>
                  <TooltipHint text="Real-time blend of proof queue and loan review flow." />
               </div>
               <div className="mt-6 grid gap-5 md:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-surface-low/50 p-4">
                     <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Queue Load</p>
                     <div className="mt-4 flex justify-center">
                        <RadialGauge value={queueLoad} max={100} tone={queueLoad > 70 ? 'error' : 'primary'} size={130} />
                     </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-surface-low/50 p-4">
                     <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Hourly Reviews</p>
                     <div className="mt-4">
                        <MiniBarTrend values={[5, 7, 6, 10, 12, 11, 14, 16]} colorClass="bg-primary/70" />
                     </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-surface-low/50 p-4">
                     <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Loan Approvals</p>
                     <div className="mt-4">
                        <MiniBarTrend values={[4, 5, 5, 6, 7, 8, 8, 9]} colorClass="bg-tertiary/70" />
                     </div>
                  </div>
               </div>
            </SurfaceCard>

            <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-4">
               <h2 className="font-display text-xl font-semibold text-white">Action Console</h2>
               <p className="mt-2 text-sm text-on-surface-variant">Route teams directly into the highest-impact tasks.</p>
               <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                  <button onClick={() => navigate('/admin/review')} className="w-full rounded-xl bg-primary/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-primary">Open Evidence Lab</button>
                  <button onClick={handleEscalateRiskBatch} className="w-full rounded-xl bg-error/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-error">Escalate Risk Batch</button>
                  <button onClick={() => navigate('/admin/config')} className="w-full rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface sm:col-span-2 lg:col-span-1">Sync Policy Thresholds</button>
               </div>
            </SurfaceCard>
         </div>

         <div className="grid gap-6 lg:grid-cols-12">
            <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-7">
               <div className="flex items-center justify-between">
                  <h2 className="font-display text-xl font-semibold text-white">Live Operations Feed</h2>
                  <StatusBadge tone="neutral">{decisionEvents.length + activityLog.length} total</StatusBadge>
               </div>
               <div className="mt-4 space-y-3">
                  {latestFeed.length === 0 && <p className="text-sm text-on-surface-variant">No decisions recorded yet.</p>}
                  {latestFeed.map((event) => (
                     <div key={event.id} className="rounded-xl border border-white/10 bg-surface-low/50 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                           <p className="text-sm font-semibold text-on-surface sm:max-w-[70%]">{event.title}</p>
                           <StatusBadge tone={event.tone}>Event</StatusBadge>
                        </div>
                        <p className="mt-1 text-xs text-on-surface-variant">{event.note}</p>
                     </div>
                  ))}
               </div>
            </SurfaceCard>

            <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-5">
               <h2 className="font-display text-xl font-semibold text-white">Loan Signal Snapshot</h2>
               <div className="mt-4 grid gap-3">
                  {loanRequests.slice(0, 5).map((loan) => (
                     <div key={loan.id} className="rounded-xl border border-white/10 bg-surface-low/50 px-4 py-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                           <div>
                              <p className="text-sm font-semibold text-on-surface">{loan.ownerName}</p>
                              <p className="text-xs text-on-surface-variant">${loan.requestedAmount.toLocaleString()}</p>
                           </div>
                           <StatusBadge tone={loan.status === 'Approved' ? 'good' : loan.status === 'Rejected' ? 'bad' : 'warn'}>{loan.status}</StatusBadge>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-on-surface-variant">
                           <span>Base ${loan.baseCeiling.toLocaleString()}</span>
                           <span>•</span>
                           <span>Adj ${loan.adjustedCeiling.toLocaleString()}</span>
                        </div>
                     </div>
                  ))}
                  {loanRequests.length === 0 ? <p className="text-sm text-on-surface-variant">No recent loan requests.</p> : null}
               </div>
            </SurfaceCard>
         </div>
      </div>
   )
}

export default AdminOverview
