import { SurfaceCard } from '../../../components/ui'
import { useVerification } from '../../../context/VerificationContext'
import { StatusBadge } from '../../../components/dashboard/AdminVisuals'
import { useAdminOps } from '../../../context/AdminOpsContext'
import { useAuth } from '../../../context/AuthContext'
import { useMemo, useState } from 'react'

function AuditTrail() {
  const { decisionEvents } = useVerification()
  const { activityLog, exportAnalytics } = useAdminOps()
  const { user } = useAuth()
  const [message, setMessage] = useState('')
  const [filter, setFilter] = useState('all')

  const combinedEvents = useMemo(() => [...decisionEvents.map((event) => ({
    ...event,
    source: 'verification',
    title: `${event.ownerName} ${event.decision.toLowerCase()}`,
    description: event.note || 'No decision note.',
  })), ...activityLog.map((event) => ({
    ...event,
    source: 'admin-ops',
  }))].sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt)), [decisionEvents, activityLog])

  const visibleEvents = useMemo(() => {
    if (filter === 'all') return combinedEvents
    if (filter === 'verification') return combinedEvents.filter((event) => event.source === 'verification')
    return combinedEvents.filter((event) => event.source === 'admin-ops')
  }, [combinedEvents, filter])

  const summaryCards = [
    { label: 'Verification', value: decisionEvents.length, tone: 'good' },
    { label: 'Admin ops', value: activityLog.length, tone: 'info' },
    { label: 'Visible now', value: visibleEvents.length, tone: 'neutral' },
  ]

  const handleExport = () => {
    const reportId = exportAnalytics('json', user?.name || 'System Admin')
    setMessage(`Generated audit export ${reportId}.`)
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Governance Records</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Audit Trail</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Immutable timeline of admin decisions, optional layer usage, and reviewer notes.</p>
        </div>
        <button onClick={handleExport} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface sm:w-auto">Export Log</button>
      </header>
      {message ? <p className="text-sm text-tertiary">{message}</p> : null}

      <div className="grid gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <SurfaceCard key={card.label} className="glass-surface border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{card.label}</p>
              <StatusBadge tone={card.tone}>{card.label}</StatusBadge>
            </div>
            <p className="mt-3 text-2xl font-bold text-white">{card.value}</p>
          </SurfaceCard>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {[
          { id: 'all', label: 'All events' },
          { id: 'verification', label: 'Verification' },
          { id: 'admin', label: 'Admin ops' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] ${filter === item.id ? 'bg-primary/20 text-primary ring-1 ring-primary/30' : 'bg-white/5 text-on-surface-variant'}`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6">
        <div className="space-y-3">
          {visibleEvents.length === 0 && (
            <p className="text-sm text-on-surface-variant">No audit events yet.</p>
          )}
          {visibleEvents.map((event) => (
            <div key={event.id} className="rounded-xl border border-white/10 bg-surface-low/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-on-surface sm:max-w-[75%]">{event.title || `${event.ownerName} • ${event.decision}`}</p>
                <StatusBadge tone={event.source === 'verification' ? event.decision === 'Approved' ? 'good' : 'bad' : event.kind === 'risk' || event.kind === 'user' ? 'warn' : event.kind === 'model' ? 'info' : 'neutral'}>{event.source === 'verification' ? event.decision : event.kind}</StatusBadge>
              </div>
              {event.source === 'verification' ? (
                <>
                  <p className="mt-2 text-xs text-on-surface-variant">Request: {event.requestId} • Reviewer: {event.reviewerName}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">Verification Layer: {event.applyVerificationLayer ? 'Applied' : 'Ignored'}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{event.note || 'No decision note.'}</p>
                </>
              ) : (
                <>
                  <p className="mt-2 text-xs text-on-surface-variant">Actor: {event.actor}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{event.description}</p>
                </>
              )}
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  )
}

export default AuditTrail
