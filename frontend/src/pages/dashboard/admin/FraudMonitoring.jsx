import { SurfaceCard } from '../../../components/ui'
import { StatusBadge, TooltipHint } from '../../../components/dashboard/AdminVisuals'
import { useEffect, useMemo, useState } from 'react'
import { useAdminOps } from '../../../context/AdminOpsContext'
import { useAuth } from '../../../context/AuthContext'

function FraudMonitoring() {
  const { riskCases, updateRiskCaseStatus, policy, riskSummary } = useAdminOps()
  const { user } = useAuth()
  const [activeFlag, setActiveFlag] = useState(riskCases[0] || null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!activeFlag && riskCases[0]) {
      setActiveFlag(riskCases[0])
      return
    }

    if (activeFlag) {
      const next = riskCases.find((item) => item.id === activeFlag.id)
      if (next) setActiveFlag(next)
    }
  }, [riskCases, activeFlag])

  const matrix = useMemo(() => {
    const base = Math.round((policy.riskThreshold + policy.alertSensitivity) / 4)
    return [
      [base - 12, base - 8, base - 3, base + 4, base + 10, base + 16],
      [base - 15, base - 6, base + 1, base + 9, base + 17, base + 24],
      [base - 18, base - 11, base - 2, base + 5, base + 13, base + 21],
      [base - 20, base - 15, base - 8, base + 1, base + 9, base + 17],
    ]
  }, [policy])

  const actor = user?.name || 'System Admin'

  const handleCaseAction = (status) => {
    if (!activeFlag) return
    updateRiskCaseStatus(activeFlag.id, status, actor)
    setMessage(`${activeFlag.user} case marked ${status.toLowerCase()}.`)
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-enter">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Threat Intelligence</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">Risk Engine</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Map, prioritize, and resolve suspicious activity with a command-center workflow.</p>
        </div>
        <StatusBadge tone={riskSummary.high > 1 ? 'bad' : 'warn'}>Threat Level: {riskSummary.high > 1 ? 'Critical' : 'Elevated'}</StatusBadge>
      </header>
      {message ? <p className="text-sm text-tertiary">{message}</p> : null}

      <div className="grid gap-4 sm:grid-cols-4">
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Open</p>
          <p className="mt-2 text-2xl font-bold text-white">{riskSummary.open}</p>
        </SurfaceCard>
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Escalated</p>
          <p className="mt-2 text-2xl font-bold text-white">{riskSummary.escalated}</p>
        </SurfaceCard>
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Resolved</p>
          <p className="mt-2 text-2xl font-bold text-white">{riskSummary.resolved}</p>
        </SurfaceCard>
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Whitelisted</p>
          <p className="mt-2 text-2xl font-bold text-white">{riskSummary.whitelisted}</p>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-7">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold text-white">Risk Heat Grid</h2>
            <TooltipHint text="Rows: channels, columns: velocity windows." />
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
          <h2 className="font-display text-xl font-semibold text-white">Case Insight Drawer</h2>
          {activeFlag ? (
            <>
              <div className="mt-4 rounded-xl border border-white/10 bg-surface-low/50 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Selected case</p>
                <p className="mt-2 text-lg font-semibold text-white">{activeFlag.user}</p>
                <p className="text-sm text-on-surface-variant">{activeFlag.type}</p>
                <div className="mt-3 flex items-center gap-2">
                  <StatusBadge tone={activeFlag.risk === 'High' ? 'bad' : activeFlag.risk === 'Medium' ? 'warn' : 'good'}>{activeFlag.risk}</StatusBadge>
                  <StatusBadge tone={activeFlag.status === 'Escalated' ? 'bad' : activeFlag.status === 'Whitelisted' ? 'good' : activeFlag.status === 'Resolved' ? 'info' : 'neutral'}>{activeFlag.status}</StatusBadge>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
                <p>Phone: {activeFlag.phone}</p>
                <p>Detected: {activeFlag.date}</p>
                <p>Case ID: {activeFlag.id}</p>
                <p>Cluster: {activeFlag.cluster}</p>
                <p>Channel: {activeFlag.channel}</p>
                <p>Score: {activeFlag.score}/850</p>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <button onClick={() => handleCaseAction('Escalated')} className="rounded-xl bg-error/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-error">Escalate</button>
                <button onClick={() => handleCaseAction('Whitelisted')} className="rounded-xl bg-tertiary/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">Whitelist</button>
                <button onClick={() => handleCaseAction('Resolved')} className="rounded-xl bg-primary/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">Resolve</button>
              </div>
            </>
          ) : (
            <p className="mt-4 text-sm text-on-surface-variant">No active case selected.</p>
          )}
        </SurfaceCard>
      </div>

      <SurfaceCard className="glass-surface border-white/10 p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="font-display text-xl font-semibold text-white">Prioritized Risk Cases</h2>
          <span className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">{riskCases.length} tracked</span>
        </div>
        <div className="grid gap-3 p-4 md:hidden">
          {riskCases.map((flag) => (
            <button
              key={flag.id}
              type="button"
              onClick={() => setActiveFlag(flag)}
              className={`rounded-2xl border p-4 text-left ${activeFlag?.id === flag.id ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-surface-low/40'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-on-surface">{flag.user}</p>
                  <p className="mt-1 text-xs text-on-surface-variant">{flag.type}</p>
                </div>
                <StatusBadge tone={flag.risk === 'High' ? 'bad' : flag.risk === 'Medium' ? 'warn' : 'good'}>{flag.risk}</StatusBadge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <StatusBadge tone={flag.status === 'Escalated' ? 'bad' : flag.status === 'Whitelisted' ? 'good' : flag.status === 'Resolved' ? 'info' : 'neutral'}>{flag.status}</StatusBadge>
                <span className="text-xs text-on-surface-variant">{flag.date}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-low/50 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
              <tr>
                <th className="px-6 py-3">Identity</th>
                <th className="px-6 py-3">Signal</th>
                <th className="px-6 py-3">Risk</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Time</th>
                <th className="px-6 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {riskCases.map((flag) => (
                <tr key={flag.id} className="cursor-pointer bg-transparent hover:bg-white/5" onClick={() => setActiveFlag(flag)}>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-on-surface">{flag.user}</p>
                    <p className="text-xs text-on-surface-variant">{flag.phone}</p>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{flag.type}</td>
                  <td className="px-6 py-4">
                    <StatusBadge tone={flag.risk === 'High' ? 'bad' : flag.risk === 'Medium' ? 'warn' : 'good'}>{flag.risk}</StatusBadge>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge tone={flag.status === 'Escalated' ? 'bad' : flag.status === 'Whitelisted' ? 'good' : flag.status === 'Resolved' ? 'info' : 'neutral'}>{flag.status}</StatusBadge>
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">{flag.date}</td>
                  <td className="px-6 py-4">
                    <button className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-on-surface">Open</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>
    </div>
  )
}

export default FraudMonitoring
