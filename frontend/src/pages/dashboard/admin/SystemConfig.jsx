import { useEffect, useState } from 'react'
import { SurfaceCard } from '../../../components/ui'
import { StatusBadge } from '../../../components/dashboard/AdminVisuals'
import { useAdminOps } from '../../../context/AdminOpsContext'
import { useAuth } from '../../../context/AuthContext'

function Slider({ label, value, onChange, min = 0, max = 100 }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
      />
    </div>
  )
}

function SystemConfig() {
  const { policy, applyPolicyConfig, resetPolicyConfig } = useAdminOps()
  const { user } = useAuth()
  const [riskThreshold, setRiskThreshold] = useState(policy.riskThreshold)
  const [confidenceThreshold, setConfidenceThreshold] = useState(policy.confidenceThreshold)
  const [alertSensitivity, setAlertSensitivity] = useState(policy.alertSensitivity)
  const [banner, setBanner] = useState('')

  useEffect(() => {
    setRiskThreshold(policy.riskThreshold)
    setConfidenceThreshold(policy.confidenceThreshold)
    setAlertSensitivity(policy.alertSensitivity)
  }, [policy])

  const handleApply = () => {
    applyPolicyConfig(
      {
        riskThreshold,
        confidenceThreshold,
        alertSensitivity,
      },
      user?.name || 'System Admin',
    )
    setBanner('Configuration applied across the control center.')
  }

  const handleReset = () => {
    resetPolicyConfig(user?.name || 'System Admin')
    setBanner('Configuration restored to default baseline.')
  }

  const riskMode = riskThreshold >= 75 ? 'Aggressive' : riskThreshold >= 60 ? 'Balanced' : 'Lenient'
  const confidenceMode = confidenceThreshold >= 85 ? 'Strict' : confidenceThreshold >= 70 ? 'Trusted' : 'Exploratory'
  const alertMode = alertSensitivity >= 75 ? 'High signal' : alertSensitivity >= 50 ? 'Measured' : 'Quiet'

  return (
    <div className="space-y-8">
      <header>
        <p className="section-kicker">Runtime Controls</p>
        <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">System Config</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Tune risk and confidence operating thresholds with immediate visual feedback.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Risk posture</p>
          <p className="mt-2 text-2xl font-bold text-white">{riskMode}</p>
          <p className="mt-2 text-sm text-on-surface-variant">Threshold {riskThreshold}%</p>
        </SurfaceCard>
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Confidence gate</p>
          <p className="mt-2 text-2xl font-bold text-white">{confidenceMode}</p>
          <p className="mt-2 text-sm text-on-surface-variant">Floor {confidenceThreshold}%</p>
        </SurfaceCard>
        <SurfaceCard className="glass-surface border-white/10 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Alert tempo</p>
          <p className="mt-2 text-2xl font-bold text-white">{alertMode}</p>
          <p className="mt-2 text-sm text-on-surface-variant">Sensitivity {alertSensitivity}%</p>
        </SurfaceCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-white sm:text-2xl">Decision Policy Controls</h2>
            <StatusBadge tone="info">Editable</StatusBadge>
          </div>
          <div className="space-y-8">
            <Slider label="Risk Threshold" value={riskThreshold} onChange={setRiskThreshold} />
            <Slider label="Confidence Threshold" value={confidenceThreshold} onChange={setConfidenceThreshold} />
            <Slider label="Alert Sensitivity" value={alertSensitivity} onChange={setAlertSensitivity} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button onClick={handleApply} className="w-full rounded-xl bg-primary px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white sm:w-auto">Apply Configuration</button>
            <button onClick={handleReset} className="w-full rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-on-surface sm:w-auto">Restore Default</button>
          </div>
          {banner ? <p className="mt-4 text-sm text-tertiary">{banner}</p> : null}
        </SurfaceCard>

        <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6">
          <h3 className="font-display text-xl font-bold text-white">Config Preview</h3>
          <ul className="mt-4 space-y-2 text-sm text-on-surface-variant">
            <li>High-risk trigger: {riskThreshold}%+</li>
            <li>Minimum confidence: {confidenceThreshold}%</li>
            <li>Alert intensity: {alertSensitivity}%</li>
            <li>Applied: {new Date(policy.appliedAt).toLocaleString()}</li>
          </ul>
          <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-surface-low/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-on-surface-variant">Auto escalation</span>
              <StatusBadge tone={riskThreshold >= 70 ? 'bad' : 'info'}>{riskMode}</StatusBadge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-on-surface-variant">Loan review strictness</span>
              <StatusBadge tone={confidenceThreshold >= 80 ? 'good' : 'warn'}>{confidenceMode}</StatusBadge>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-on-surface-variant">Ops notification volume</span>
              <StatusBadge tone={alertSensitivity >= 75 ? 'bad' : 'neutral'}>{alertMode}</StatusBadge>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </div>
  )
}

export default SystemConfig
