import { useEffect, useMemo, useState } from 'react'
import { SurfaceCard } from '../../../components/ui'
import { StatusBadge } from '../../../components/dashboard/AdminVisuals'
import { useAuth } from '../../../context/AuthContext'
import { adminScope, getLoans, getTransactions, toList } from '../../../services/campusApi'

function AuditTrail() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loanRequests, setLoanRequests] = useState([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')

  const scope = useMemo(() => adminScope(user?.phone), [user?.phone])

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!user?.phone) {
        if (mounted) {
          setTransactions([])
          setLoanRequests([])
        }
        return
      }

      try {
        const [txPayload, loanPayload] = await Promise.all([
          getTransactions(scope),
          getLoans(scope),
        ])

        if (!mounted) return

        setTransactions(toList(txPayload))
        setLoanRequests(toList(loanPayload))
        setError('')
      } catch (loadError) {
        if (!mounted) return
        setError(loadError.message || 'Unable to load audit timeline.')
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [scope, user?.phone])

  const combinedEvents = useMemo(() => {
    const loanEvents = loanRequests.map((event) => ({
      id: `loan-${event.id}`,
      source: 'loan',
      title: `Loan ${event.id} ${String(event.status).toLowerCase()}`,
      description: event.admin_decision_note || event.decision_reasoning || 'No note provided.',
      reviewer: event?.decided_by?.full_name || event?.decided_by?.username || 'system',
      state: String(event.status).toLowerCase(),
      createdAt: event.decided_at || event.evaluated_at || event.updated_at || event.created_at,
    }))

    const txEvents = transactions.map((event) => ({
      id: `tx-${event.id}`,
      source: 'transaction',
      title: `Transaction ${event.id} ${String(event.status).toLowerCase()}`,
      description: `${event.data_source || event.transaction_source || 'unknown'} source • validation ${Number(event.validation_score || 0).toFixed(2)}`,
      reviewer: event?.user?.full_name || event?.user?.username || 'system',
      state: String(event.status).toLowerCase(),
      createdAt: event.created_at,
    }))

    return [...loanEvents, ...txEvents].sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
  }, [loanRequests, transactions])

  const visibleEvents = useMemo(() => {
    if (filter === 'all') return combinedEvents
    if (filter === 'loan') return combinedEvents.filter((event) => event.source === 'loan')
    return combinedEvents.filter((event) => event.source === 'transaction')
  }, [combinedEvents, filter])

  const summaryCards = [
    { label: 'Loan events', value: combinedEvents.filter((item) => item.source === 'loan').length, tone: 'good' },
    { label: 'Transaction events', value: combinedEvents.filter((item) => item.source === 'transaction').length, tone: 'info' },
    { label: 'Visible now', value: visibleEvents.length, tone: 'neutral' },
  ]

  const handleExport = () => {
    setMessage(`Audit snapshot prepared at ${new Date().toISOString()}.`)
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Activity Log</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Activity History</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Timeline of loan and transaction activity.</p>
        </div>
        <button onClick={handleExport} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface sm:w-auto">Export Log</button>
      </header>

      {message ? <p className="text-sm text-tertiary">{message}</p> : null}
      {error ? <p className="text-sm text-error">{error}</p> : null}

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
          { id: 'all', label: 'All activity' },
          { id: 'loan', label: 'Loan' },
          { id: 'transaction', label: 'Transaction' },
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
                <p className="text-sm font-semibold text-on-surface sm:max-w-[75%]">{event.title}</p>
                <StatusBadge tone={event.state === 'approved' || event.state === 'completed' ? 'good' : event.state === 'rejected' || event.state === 'flagged' || event.state === 'failed' ? 'bad' : 'warn'}>
                  {event.source}
                </StatusBadge>
              </div>
              <p className="mt-2 text-xs text-on-surface-variant">Actor: {event.reviewer}</p>
              <p className="mt-1 text-xs text-on-surface-variant">{event.description}</p>
              <p className="mt-1 text-xs text-on-surface-variant">{event.createdAt ? new Date(event.createdAt).toLocaleString() : 'unknown time'}</p>
            </div>
          ))}
        </div>
      </SurfaceCard>
    </div>
  )
}

export default AuditTrail
