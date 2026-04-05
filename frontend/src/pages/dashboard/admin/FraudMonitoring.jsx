import { SurfaceCard } from '../../../components/ui'
import { StatusBadge, TooltipHint } from '../../../components/dashboard/AdminVisuals'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import {
  adminScope,
  getFraudFeedback,
  getRiskAlerts,
  resolveRiskAlert,
  setFraudFeedbackActualOutcome,
  toList,
} from '../../../services/campusApi'

function FraudMonitoring() {
  const { user } = useAuth()
  const [riskCases, setRiskCases] = useState([])
  const [activeFlagId, setActiveFlagId] = useState(null)
  const [feedbackRecords, setFeedbackRecords] = useState([])
  const [activeFeedbackId, setActiveFeedbackId] = useState(null)
  const [feedbackNote, setFeedbackNote] = useState('')
  const [feedbackSaving, setFeedbackSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!user?.phone) {
        if (mounted) {
          setRiskCases([])
          setActiveFlagId(null)
          setFeedbackRecords([])
          setActiveFeedbackId(null)
        }
        return
      }

      setLoading(true)
      try {
        const scope = adminScope(user.phone)
        const [riskPayload, feedbackPayload] = await Promise.all([
          getRiskAlerts(scope),
          getFraudFeedback(scope),
        ])
        if (!mounted) return

        const alertRows = toList(riskPayload)
        const feedbackRows = toList(feedbackPayload)

        setRiskCases(alertRows)
        setFeedbackRecords(feedbackRows)

        if (!activeFlagId && alertRows[0]) {
          setActiveFlagId(alertRows[0].id)
        }
        if (!activeFeedbackId && feedbackRows[0]) {
          setActiveFeedbackId(feedbackRows[0].id)
        }
        setError('')
      } catch (loadError) {
        if (!mounted) return
        setError(loadError.message || 'Unable to load risk alerts.')
      } finally {
        if (mounted) setLoading(false)
      }
    }

    load()

    return () => {
      mounted = false
    }
  }, [user?.phone])

  useEffect(() => {
    if (!riskCases.length) {
      setActiveFlagId(null)
      return
    }

    if (!activeFlagId || !riskCases.some((item) => item.id === activeFlagId)) {
      setActiveFlagId(riskCases[0].id)
    }
  }, [activeFlagId, riskCases])

  useEffect(() => {
    if (!feedbackRecords.length) {
      setActiveFeedbackId(null)
      return
    }

    if (!activeFeedbackId || !feedbackRecords.some((item) => item.id === activeFeedbackId)) {
      setActiveFeedbackId(feedbackRecords[0].id)
    }
  }, [activeFeedbackId, feedbackRecords])

  const activeFlag = useMemo(
    () => riskCases.find((item) => item.id === activeFlagId) || riskCases[0] || null,
    [activeFlagId, riskCases],
  )

  const activeFeedback = useMemo(
    () => feedbackRecords.find((item) => item.id === activeFeedbackId) || feedbackRecords[0] || null,
    [activeFeedbackId, feedbackRecords],
  )

  const riskSummary = useMemo(() => {
    const open = riskCases.filter((item) => String(item.status).toLowerCase() === 'open').length
    const resolved = riskCases.filter((item) => String(item.status).toLowerCase() === 'resolved').length
    const dismissed = riskCases.filter((item) => String(item.status).toLowerCase() === 'dismissed').length
    const high = riskCases.filter((item) => ['high', 'critical'].includes(String(item.severity).toLowerCase())).length

    return {
      open,
      escalated: high,
      resolved,
      whitelisted: dismissed,
      high,
    }
  }, [riskCases])

  const matrix = useMemo(() => {
    const base = Math.min(85, 18 + riskSummary.open * 6 + riskSummary.high * 8)
    return [
      [base - 12, base - 8, base - 3, base + 4, base + 10, base + 16],
      [base - 15, base - 6, base + 1, base + 9, base + 17, base + 24],
      [base - 18, base - 11, base - 2, base + 5, base + 13, base + 21],
      [base - 20, base - 15, base - 8, base + 1, base + 9, base + 17],
    ]
  }, [riskSummary.high, riskSummary.open])

  const feedbackSummary = useMemo(() => {
    const fraud = feedbackRecords.filter((item) => String(item.actual_outcome).toLowerCase() === 'fraud').length
    const legitimate = feedbackRecords.filter((item) => String(item.actual_outcome).toLowerCase() === 'legitimate').length
    const unconfirmed = feedbackRecords.filter((item) => String(item.actual_outcome).toLowerCase() === 'unconfirmed').length

    return {
      fraud,
      legitimate,
      unconfirmed,
      total: feedbackRecords.length,
    }
  }, [feedbackRecords])

  const handleResolve = async () => {
    if (!activeFlag) return
    if (!user?.phone) return

    try {
      await resolveRiskAlert(activeFlag.id, adminScope(user.phone))
      setRiskCases((prev) =>
        prev.map((item) =>
          item.id === activeFlag.id
            ? {
                ...item,
                status: 'resolved',
                resolved_at: new Date().toISOString(),
              }
            : item,
        ),
      )
      setMessage(`Alert ${activeFlag.id} marked resolved.`)
      setError('')
    } catch (resolveError) {
      setError(resolveError.message || 'Unable to resolve this alert.')
    }
  }

  const handleFeedbackOutcome = async (outcome) => {
    if (!activeFeedback) return
    if (!user?.phone) return

    setFeedbackSaving(true)
    try {
      await setFraudFeedbackActualOutcome(activeFeedback.id, {
        actual_outcome: outcome,
        note: feedbackNote,
        params: adminScope(user.phone),
      })

      setFeedbackRecords((prev) =>
        prev.map((item) =>
          item.id === activeFeedback.id
            ? {
                ...item,
                actual_outcome: outcome,
                note: feedbackNote,
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      )

      setMessage(`Feedback ${activeFeedback.id} updated to ${outcome}.`)
      setError('')
      setFeedbackNote('')
    } catch (updateError) {
      setError(updateError.message || 'Unable to update feedback outcome.')
    } finally {
      setFeedbackSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-enter">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Risk Alerts</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Risk Alerts</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Review flagged activity and close alerts after checking details.</p>
        </div>
        <StatusBadge tone={riskSummary.high > 1 ? 'bad' : 'warn'}>Risk Level: {riskSummary.high > 1 ? 'High' : 'Medium'}</StatusBadge>
      </header>
      {message ? <p className="text-sm text-tertiary">{message}</p> : null}
      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="grid gap-4 sm:grid-cols-5">
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Open</p>
          <p className="mt-2 text-2xl font-bold text-white">{riskSummary.open}</p>
        </SurfaceCard>
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">High Severity</p>
          <p className="mt-2 text-2xl font-bold text-white">{riskSummary.escalated}</p>
        </SurfaceCard>
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Resolved</p>
          <p className="mt-2 text-2xl font-bold text-white">{riskSummary.resolved}</p>
        </SurfaceCard>
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Dismissed</p>
          <p className="mt-2 text-2xl font-bold text-white">{riskSummary.whitelisted}</p>
        </SurfaceCard>
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Confirmed Fraud</p>
          <p className="mt-2 text-2xl font-bold text-white">{feedbackSummary.fraud}</p>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-white">Risk Overview Grid</h2>
            <TooltipHint text="Quick visual view of overall risk levels." />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {matrix.flatMap((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const tone = cell > 55 ? 'bg-error/80' : cell > 35 ? 'bg-yellow-400/70' : 'bg-tertiary/60'
                return (
                  <div key={`${rowIndex}-${colIndex}`} className="rounded-lg border border-white/10 p-3 text-center">
                    <div className={`mx-auto h-8 w-full rounded sm:h-10 ${tone}`} />
                    <p className="mt-2 text-[10px] text-on-surface-variant">{cell}%</p>
                  </div>
                )
              }),
            )}
          </div>
        </SurfaceCard>

        <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-5">
          <h2 className="font-display text-xl font-semibold text-white">Alert Details</h2>
          {activeFlag ? (
            <>
              <div className="mt-4 rounded-xl border border-white/10 bg-surface-low/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Selected alert</p>
                <p className="mt-2 text-lg font-semibold text-white">{activeFlag?.user?.full_name || activeFlag?.user?.username || 'Unknown user'}</p>
                <p className="text-sm text-on-surface-variant">{activeFlag.alert_type}</p>
                <div className="mt-3 flex items-center gap-2">
                  <StatusBadge tone={String(activeFlag.severity).toLowerCase() === 'critical' || String(activeFlag.severity).toLowerCase() === 'high' ? 'bad' : String(activeFlag.severity).toLowerCase() === 'medium' ? 'warn' : 'good'}>{activeFlag.severity}</StatusBadge>
                  <StatusBadge tone={String(activeFlag.status).toLowerCase() === 'resolved' ? 'info' : String(activeFlag.status).toLowerCase() === 'dismissed' ? 'good' : 'neutral'}>{activeFlag.status}</StatusBadge>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
                <p>Phone: {activeFlag?.user?.username || '-'}</p>
                <p>Detected: {activeFlag.detected_at ? new Date(activeFlag.detected_at).toLocaleString() : 'No time'}</p>
                <p>Case ID: {activeFlag.id}</p>
                <p>Pattern: {activeFlag.pattern_key}</p>
                <p>Transaction: {activeFlag.transaction || 'N/A'}</p>
                <p>Status: {activeFlag.status}</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <button onClick={handleResolve} className="rounded-xl bg-primary/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary" disabled={String(activeFlag.status).toLowerCase() !== 'open'}>Resolve</button>
                <button onClick={() => setMessage(`Opened alert ${activeFlag.id} details.`)} className="rounded-xl bg-white/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface">Open</button>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-on-surface-variant">{loading ? 'Loading risk cases...' : 'No active case selected.'}</p>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard className="glass-surface border-white/10 p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-white">Risk Alert List</h2>
          <span className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">{riskCases.length} tracked</span>
        </div>
        <div className="grid gap-3 p-4 md:hidden">
          {riskCases.map((flag) => (
            <button
              key={flag.id}
              type="button"
              onClick={() => setActiveFlagId(flag.id)}
              className={`rounded-2xl border p-4 text-left ${activeFlag?.id === flag.id ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-surface-low/40'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-on-surface">{flag?.user?.full_name || flag?.user?.username || 'Unknown user'}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{flag.alert_type}</p>
                </div>
                <StatusBadge tone={String(flag.severity).toLowerCase() === 'critical' || String(flag.severity).toLowerCase() === 'high' ? 'bad' : String(flag.severity).toLowerCase() === 'medium' ? 'warn' : 'good'}>{flag.severity}</StatusBadge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge tone={String(flag.status).toLowerCase() === 'resolved' ? 'info' : String(flag.status).toLowerCase() === 'dismissed' ? 'good' : 'neutral'}>{flag.status}</StatusBadge>
                <span className="text-xs text-on-surface-variant">{flag.detected_at ? new Date(flag.detected_at).toLocaleDateString() : 'Unknown time'}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low/50 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Alert</th>
                <th className="px-6 py-3">Risk</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {riskCases.map((flag) => (
                <tr key={flag.id} className="cursor-pointer bg-transparent hover:bg-white/5" onClick={() => setActiveFlagId(flag.id)}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-on-surface">{flag?.user?.full_name || flag?.user?.username || 'Unknown user'}</p>
                    <p className="text-xs text-on-surface-variant">{flag?.user?.student_id || '-'}</p>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{flag.alert_type}</td>
                  <td className="px-6 py-4">
                    <StatusBadge tone={String(flag.severity).toLowerCase() === 'critical' || String(flag.severity).toLowerCase() === 'high' ? 'bad' : String(flag.severity).toLowerCase() === 'medium' ? 'warn' : 'good'}>{flag.severity}</StatusBadge>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge tone={String(flag.status).toLowerCase() === 'resolved' ? 'info' : String(flag.status).toLowerCase() === 'dismissed' ? 'good' : 'neutral'}>{flag.status}</StatusBadge>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{flag.detected_at ? new Date(flag.detected_at).toLocaleString() : 'Unknown time'}</td>
                  <td className="px-6 py-4">
                    <button className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-on-surface">Open</button>
                  </td>
                </tr>
              ))}
              {!riskCases.length && (
                <tr>
                  <td className="px-6 py-4 text-on-surface-variant" colSpan={6}>{loading ? 'Loading risk alerts...' : 'No risk alerts yet.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      <div className="grid gap-6 lg:grid-cols-12">
        <SurfaceCard className="glass-surface border-white/10 p-0 overflow-hidden lg:col-span-7">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
            <h2 className="font-display text-xl font-semibold text-white">Model Feedback</h2>
            <span className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">{feedbackSummary.total} records</span>
          </div>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-surface-low/50 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
                <tr>
                  <th className="px-6 py-3">Record</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3">Prediction</th>
                  <th className="px-6 py-3">Probability</th>
                  <th className="px-6 py-3">Actual</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {feedbackRecords.map((item) => (
                  <tr
                    key={item.id}
                    className={`cursor-pointer bg-transparent hover:bg-white/5 ${activeFeedback?.id === item.id ? 'bg-white/5' : ''}`}
                    onClick={() => setActiveFeedbackId(item.id)}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-on-surface">#{item.id}</p>
                      <p className="text-xs text-on-surface-variant">{item?.user?.full_name || item?.user?.username || 'User not available'}</p>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{item.source}</td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={item.predicted_label ? 'bad' : 'good'}>{item.predicted_label ? 'Fraud' : 'Normal'}</StatusBadge>
                    </td>
                    <td className="px-6 py-4 text-on-surface-variant">{Number(item.predicted_probability || 0).toFixed(4)}</td>
                    <td className="px-6 py-4">
                      <StatusBadge tone={String(item.actual_outcome).toLowerCase() === 'fraud' ? 'bad' : String(item.actual_outcome).toLowerCase() === 'legitimate' ? 'good' : 'warn'}>{item.actual_outcome}</StatusBadge>
                    </td>
                  </tr>
                ))}
                {!feedbackRecords.length && (
                  <tr>
                    <td className="px-6 py-4 text-on-surface-variant" colSpan={5}>{loading ? 'Loading feedback records...' : 'No feedback records yet.'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="grid gap-3 p-4 md:hidden">
            {feedbackRecords.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveFeedbackId(item.id)}
                className={`rounded-2xl border p-4 text-left ${activeFeedback?.id === item.id ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-surface-low/40'}`}
              >
                <p className="font-semibold text-on-surface">#{item.id} • {item.source}</p>
                <p className="mt-1 text-xs text-on-surface-variant">{item?.user?.full_name || item?.user?.username || 'User not available'}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusBadge tone={item.predicted_label ? 'bad' : 'good'}>{item.predicted_label ? 'Predicted Fraud' : 'Predicted Normal'}</StatusBadge>
                  <StatusBadge tone={String(item.actual_outcome).toLowerCase() === 'fraud' ? 'bad' : String(item.actual_outcome).toLowerCase() === 'legitimate' ? 'good' : 'warn'}>{item.actual_outcome}</StatusBadge>
                </div>
              </button>
            ))}
          </div>
        </SurfaceCard>

        <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-5">
          <h2 className="font-display text-xl font-semibold text-white">Set Actual Result</h2>
          {activeFeedback ? (
            <>
              <div className="mt-4 rounded-xl border border-white/10 bg-surface-low/50 p-4 text-sm text-on-surface-variant">
                <p>Record: <span className="text-on-surface">#{activeFeedback.id}</span></p>
                <p className="mt-1">Source: <span className="text-on-surface">{activeFeedback.source}</span></p>
                <p className="mt-1">Predicted: <span className="text-on-surface">{activeFeedback.predicted_label ? 'Fraud' : 'Legitimate'}</span></p>
                <p className="mt-1">Probability: <span className="text-on-surface">{Number(activeFeedback.predicted_probability || 0).toFixed(4)}</span></p>
                <p className="mt-1">Current actual outcome: <span className="text-on-surface">{activeFeedback.actual_outcome}</span></p>
              </div>

              <label className="mt-4 block">
                <span className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Feedback note</span>
                <textarea
                  rows={3}
                  value={feedbackNote}
                  onChange={(event) => setFeedbackNote(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-white/15 bg-surface-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary/50"
                  placeholder="Add a short reason for your decision"
                />
              </label>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button
                  onClick={() => handleFeedbackOutcome('fraud')}
                  className="rounded-xl bg-error/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-error"
                  disabled={feedbackSaving || String(activeFeedback.actual_outcome).toLowerCase() === 'fraud'}
                >
                  Confirm Fraud
                </button>
                <button
                  onClick={() => handleFeedbackOutcome('legitimate')}
                  className="rounded-xl bg-tertiary/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-tertiary"
                  disabled={feedbackSaving || String(activeFeedback.actual_outcome).toLowerCase() === 'legitimate'}
                >
                  Mark Normal
                </button>
                <button
                  onClick={() => handleFeedbackOutcome('unconfirmed')}
                  className="rounded-xl bg-yellow-400/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-300"
                  disabled={feedbackSaving || String(activeFeedback.actual_outcome).toLowerCase() === 'unconfirmed'}
                >
                  Mark Unknown
                </button>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-on-surface-variant">{loading ? 'Loading feedback records...' : 'No feedback record selected.'}</p>
          )}
        </SurfaceCard>
      </div>
    </div>
  )
}

export default FraudMonitoring
