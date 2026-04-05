import { useEffect, useMemo, useState } from 'react'
import { SurfaceCard } from '../../../components/ui'
import { StatusBadge } from '../../../components/dashboard/AdminVisuals'
import { useAuth } from '../../../context/AuthContext'
import {
  adminScope,
  approveLoanRequest,
  evaluateLoanRequest,
  getLoans,
  getTransactions,
  rejectLoanRequest,
  toList,
} from '../../../services/campusApi'

function factorTone(severity, triggered) {
  if (!triggered) return 'border-white/10 text-on-surface-variant bg-white/5'
  if (severity === 'high') return 'border-error/30 text-error bg-error/10'
  if (severity === 'medium') return 'border-yellow-400/30 text-yellow-300 bg-yellow-400/10'
  return 'border-tertiary/30 text-tertiary bg-tertiary/10'
}

function DataReview() {
  const { user } = useAuth()

  const [transactions, setTransactions] = useState([])
  const [loanRequests, setLoanRequests] = useState([])
  const [selectedLoanId, setSelectedLoanId] = useState(null)
  const [reviewerNote, setReviewerNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

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

      setLoading(true)
      try {
        const [txPayload, loanPayload] = await Promise.all([
          getTransactions(scope),
          getLoans(scope),
        ])

        if (!mounted) return

        const txRows = toList(txPayload)
        const loanRows = toList(loanPayload)
        setTransactions(txRows)
        setLoanRequests(loanRows)
        setError('')

      } catch (loadError) {
        if (!mounted) return
        setError(loadError.message || 'Unable to load review queues.')
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [scope, user?.phone])

  useEffect(() => {
    if (!selectedLoanId && loanRequests[0]) {
      setSelectedLoanId(loanRequests[0].id)
    }
  }, [selectedLoanId, loanRequests])

  const selectedLoan = useMemo(
    () => loanRequests.find((item) => item.id === selectedLoanId) || loanRequests[0] || null,
    [loanRequests, selectedLoanId],
  )

  const decisionStats = selectedLoan?.decision_stats || null
  const decisionMetrics = decisionStats?.metrics || {}
  const triggeredFactors = (decisionStats?.factors || []).filter((factor) => factor.triggered)
  const scorePercent = Number.isFinite(Number(decisionMetrics.risk_score_percent))
    ? Math.max(0, Math.min(100, Number(decisionMetrics.risk_score_percent)))
    : 0
  const rejectThresholdPercent = Number.isFinite(Number(decisionMetrics.reject_threshold_percent))
    ? Math.max(0, Math.min(100, Number(decisionMetrics.reject_threshold_percent)))
    : 50

  const queueStats = useMemo(() => {
    const pendingEvidence = transactions.filter((item) => String(item.status).toLowerCase() === 'pending').length
    const flaggedEvidence = transactions.filter((item) => String(item.status).toLowerCase() === 'flagged').length
    const resolvedEvidence = transactions.filter((item) => String(item.status).toLowerCase() === 'completed').length

    const pendingLoans = loanRequests.filter((item) => {
      const status = String(item.status).toLowerCase()
      return status === 'submitted' || status === 'evaluating' || status === 'evaluated'
    }).length

    const approvedLoans = loanRequests.filter((item) => String(item.status).toLowerCase() === 'approved').length
    const rejectedLoans = loanRequests.filter((item) => String(item.status).toLowerCase() === 'rejected').length

    return {
      pendingEvidence,
      flaggedEvidence,
      resolvedEvidence,
      pendingLoans,
      approvedLoans,
      rejectedLoans,
    }
  }, [transactions, loanRequests])

  const decisionFeed = useMemo(() => {
    const loanEvents = loanRequests
      .filter((item) => item.decided_at || item.evaluated_at)
      .map((item) => ({
        id: `loan-${item.id}`,
        kind: 'loan',
        title: `Loan ${item.id} ${String(item.status).toLowerCase()}`,
        subtitle: item?.user?.full_name || item?.user?.username || 'Unknown user',
        note: item.admin_decision_note || item.decision_summary || item.decision_reasoning || 'No note provided.',
        createdAt: item.decided_at || item.evaluated_at || item.updated_at || item.created_at,
        tone:
          String(item.status).toLowerCase() === 'approved'
            ? 'good'
            : String(item.status).toLowerCase() === 'rejected'
            ? 'bad'
            : 'warn',
      }))

    const txEvents = transactions
      .filter((item) => String(item.status).toLowerCase() === 'flagged')
      .slice(0, 8)
      .map((item) => ({
        id: `txn-${item.id}`,
        kind: 'evidence',
        title: `Transaction ${item.id} flagged`,
        subtitle: item?.user?.full_name || item?.user?.username || 'Unknown user',
        note: `Source ${item.data_source || item.transaction_source || 'unknown'} • Validation ${Number(item.validation_score || 0).toFixed(2)}`,
        createdAt: item.created_at,
        tone: 'bad',
      }))

    return [...loanEvents, ...txEvents]
      .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0))
      .slice(0, 10)
  }, [loanRequests, transactions])

  async function refreshQueues() {
    const [txPayload, loanPayload] = await Promise.all([
      getTransactions(scope),
      getLoans(scope),
    ])
    setTransactions(toList(txPayload))
    setLoanRequests(toList(loanPayload))
  }

  async function handleEvaluate(loanId) {
    try {
      setLoading(true)
      await evaluateLoanRequest(loanId, {
        ip_address: '127.0.0.1',
        params: scope,
      })
      await refreshQueues()
      setMessage(`Loan ${loanId} evaluated.`)
      setError('')
    } catch (actionError) {
      setError(actionError.message || 'Unable to evaluate loan.')
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(loanId) {
    try {
      setLoading(true)
      await approveLoanRequest(loanId, {
        note: reviewerNote.trim() || 'Approved by admin reviewer.',
        params: scope,
      })
      await refreshQueues()
      setReviewerNote('')
      setMessage(`Loan ${loanId} approved.`)
      setError('')
    } catch (actionError) {
      setError(actionError.message || 'Unable to approve loan.')
    } finally {
      setLoading(false)
    }
  }

  async function handleReject(loanId) {
    try {
      setLoading(true)
      await rejectLoanRequest(loanId, {
        note: reviewerNote.trim() || 'Rejected by admin reviewer.',
        params: scope,
      })
      await refreshQueues()
      setReviewerNote('')
      setMessage(`Loan ${loanId} rejected.`)
      setError('')
    } catch (actionError) {
      setError(actionError.message || 'Unable to reject loan.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Reviews</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Review Center</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Check uploaded transactions and review loan decisions.</p>
        </div>
        <StatusBadge tone="info">Reviewer: {user?.name || 'Admin Reviewer'}</StatusBadge>
      </header>

      {message ? <p className="text-sm text-tertiary">{message}</p> : null}
      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="grid gap-4 md:grid-cols-6">
        <SurfaceCard className="bg-yellow-400/10 border-yellow-400/20 p-4"><p className="text-xs uppercase tracking-[0.14em] text-yellow-400">Pending evidence</p><p className="mt-2 text-2xl font-bold text-yellow-400">{queueStats.pendingEvidence}</p></SurfaceCard>
        <SurfaceCard className="bg-error/10 border-error/20 p-4"><p className="text-xs uppercase tracking-[0.14em] text-error">Flagged evidence</p><p className="mt-2 text-2xl font-bold text-error">{queueStats.flaggedEvidence}</p></SurfaceCard>
        <SurfaceCard className="bg-tertiary/10 border-tertiary/20 p-4"><p className="text-xs uppercase tracking-[0.14em] text-tertiary">Resolved evidence</p><p className="mt-2 text-2xl font-bold text-tertiary">{queueStats.resolvedEvidence}</p></SurfaceCard>
        <SurfaceCard className="bg-primary/10 border-primary/20 p-4"><p className="text-xs uppercase tracking-[0.14em] text-primary">Pending loans</p><p className="mt-2 text-2xl font-bold text-primary">{queueStats.pendingLoans}</p></SurfaceCard>
        <SurfaceCard className="bg-tertiary/10 border-tertiary/20 p-4"><p className="text-xs uppercase tracking-[0.14em] text-tertiary">Approved loans</p><p className="mt-2 text-2xl font-bold text-tertiary">{queueStats.approvedLoans}</p></SurfaceCard>
        <SurfaceCard className="bg-error/10 border-error/20 p-4"><p className="text-xs uppercase tracking-[0.14em] text-error">Rejected loans</p><p className="mt-2 text-2xl font-bold text-error">{queueStats.rejectedLoans}</p></SurfaceCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-7">
          <h2 className="font-display text-xl font-semibold text-white">Transaction Queue</h2>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-low/60 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Transaction</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 bg-surface-low/40">
                {transactions.slice(0, 12).map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-on-surface">{item?.user?.full_name || item?.user?.username || 'Unknown user'}</p>
                      <p className="text-xs text-on-surface-variant">{item?.user?.student_id || '-'}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-on-surface">#{item.id}</p>
                      <p className="text-xs text-on-surface-variant">${Number(item.amount || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4 text-xs text-on-surface-variant">{item.data_source || item.transaction_source || 'unknown'}</td>
                    <td className="px-4 py-4">
                      <StatusBadge tone={String(item.status).toLowerCase() === 'completed' ? 'good' : String(item.status).toLowerCase() === 'flagged' ? 'bad' : 'warn'}>
                        {item.status}
                      </StatusBadge>
                    </td>
                  </tr>
                ))}
                {!transactions.length && (
                  <tr>
                    <td className="px-4 py-4 text-on-surface-variant" colSpan={4}>{loading ? 'Loading queue...' : 'No evidence records available.'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SurfaceCard>

        <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-5">
          <h2 className="font-display text-xl font-semibold text-white">Loan Decision Panel</h2>
          <div className="mt-4 space-y-3">
            {loanRequests.slice(0, 8).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedLoanId(item.id)}
                className={`w-full rounded-xl border p-4 text-left ${selectedLoan?.id === item.id ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-surface-low/50'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-on-surface">{item?.user?.full_name || item?.user?.username || 'Unknown user'}</p>
                    <p className="text-xs text-on-surface-variant">Loan #{item.id} • ${Number(item.requested_amount || 0).toLocaleString()}</p>
                  </div>
                  <StatusBadge tone={String(item.status).toLowerCase() === 'approved' ? 'good' : String(item.status).toLowerCase() === 'rejected' ? 'bad' : 'warn'}>{item.status}</StatusBadge>
                </div>
              </button>
            ))}
            {!loanRequests.length && <p className="text-sm text-on-surface-variant">{loading ? 'Loading loans...' : 'No loan requests available.'}</p>}
          </div>

          {selectedLoan && (
            <div className="mt-5 rounded-xl border border-white/10 bg-surface-low/50 p-4">
              <p className="text-sm font-semibold text-on-surface">Selected loan #{selectedLoan.id}</p>
              <p className="mt-1 text-xs text-on-surface-variant">Current status: {selectedLoan.status}</p>
              <p className="mt-1 text-xs text-on-surface-variant">AI recommendation: {selectedLoan.ai_recommendation || 'pending'}</p>

              {decisionStats ? (
                <div className="mt-4 space-y-3 rounded-lg border border-white/10 bg-surface-low/70 p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Decision summary</p>
                  <p className="text-sm text-on-surface">{decisionStats.summary}</p>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-[11px] uppercase tracking-[0.12em] text-on-surface-variant">
                      <span>Risk score</span>
                      <span>{Number.isFinite(Number(decisionMetrics.risk_score_percent)) ? `${Number(decisionMetrics.risk_score_percent).toFixed(1)}%` : 'Pending'}</span>
                    </div>
                    <div className="relative h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-error/80 transition-all" style={{ width: `${scorePercent}%` }} />
                      <div className="pointer-events-none absolute bottom-0 top-0 w-px bg-yellow-300/90" style={{ left: `${rejectThresholdPercent}%` }} />
                    </div>
                    <p className="mt-1 text-[11px] text-on-surface-variant">Reject threshold marker: {rejectThresholdPercent.toFixed(1)}%</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg border border-white/10 bg-surface-low p-2">
                      <p className="text-on-surface-variant">Debt ratio</p>
                      <p className="mt-1 font-semibold text-on-surface">{Number.isFinite(Number(decisionMetrics.debt_ratio_percent)) ? `${Number(decisionMetrics.debt_ratio_percent).toFixed(1)}%` : '--'}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-surface-low p-2">
                      <p className="text-on-surface-variant">Flagged rate</p>
                      <p className="mt-1 font-semibold text-on-surface">{Number.isFinite(Number(decisionMetrics.flagged_rate_percent)) ? `${Number(decisionMetrics.flagged_rate_percent).toFixed(1)}%` : '--'}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-surface-low p-2">
                      <p className="text-on-surface-variant">History transactions</p>
                      <p className="mt-1 font-semibold text-on-surface">{decisionMetrics.transaction_count ?? '--'}</p>
                    </div>
                    <div className="rounded-lg border border-white/10 bg-surface-low p-2">
                      <p className="text-on-surface-variant">Amount vs avg history</p>
                      <p className="mt-1 font-semibold text-on-surface">
                        {Number.isFinite(Number(decisionMetrics.amount_vs_average_ratio))
                          ? `${Number(decisionMetrics.amount_vs_average_ratio).toFixed(2)}x`
                          : 'No history'}
                      </p>
                    </div>
                  </div>

                  {!!triggeredFactors.length && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Top rejection factors</p>
                      <div className="space-y-2">
                        {triggeredFactors.slice(0, 4).map((factor) => (
                          <div key={factor.key} className={`rounded-lg border px-3 py-2 text-xs ${factorTone(factor.severity, factor.triggered)}`}>
                            <p className="font-semibold">{factor.label}</p>
                            <p className="mt-1 opacity-90">{factor.formatted_value} vs threshold {factor.formatted_threshold}</p>
                            <p className="mt-1 opacity-90">{factor.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <label className="mt-4 block">
                <span className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Reviewer note</span>
                <textarea
                  rows={3}
                  value={reviewerNote}
                  onChange={(event) => setReviewerNote(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/15 bg-surface-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/50"
                  placeholder="Reasoning for the decision"
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => handleEvaluate(selectedLoan.id)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold uppercase text-on-surface" disabled={loading}>Evaluate</button>
                <button type="button" onClick={() => handleApprove(selectedLoan.id)} className="rounded-lg bg-tertiary/20 px-3 py-2 text-xs font-semibold uppercase text-tertiary" disabled={loading}>Approve</button>
                <button type="button" onClick={() => handleReject(selectedLoan.id)} className="rounded-lg bg-error/20 px-3 py-2 text-xs font-semibold uppercase text-error" disabled={loading}>Reject</button>
              </div>
            </div>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard className="glass-surface border-white/10 p-6">
        <h2 className="font-display text-xl font-semibold text-white">Decision History</h2>
        <div className="mt-4 space-y-3">
          {decisionFeed.map((event) => (
            <div key={event.id} className="rounded-xl border border-white/10 bg-surface-low/50 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-on-surface">{event.title}</p>
                <StatusBadge tone={event.tone}>{event.kind}</StatusBadge>
              </div>
              <p className="mt-1 text-xs text-on-surface-variant">{event.subtitle}</p>
              <p className="mt-1 text-xs text-on-surface-variant">{event.note}</p>
            </div>
          ))}
          {!decisionFeed.length && <p className="text-sm text-on-surface-variant">No decision events recorded yet.</p>}
        </div>
      </SurfaceCard>
    </div>
  )
}

export default DataReview
