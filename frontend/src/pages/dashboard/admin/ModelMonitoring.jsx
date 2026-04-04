import { SurfaceCard } from '../../../components/ui'
import { Histogram, MiniBarTrend, Sparkline, StatusBadge, TooltipHint } from '../../../components/dashboard/AdminVisuals'
import { useAdminOps } from '../../../context/AdminOpsContext'
import { useAuth } from '../../../context/AuthContext'
import { useMemo, useState } from 'react'

function ModelMonitoring() {
   const { models, recalibrateModel, pauseModel, runCounterfactual, modelSummary } = useAdminOps()
   const { user } = useAuth()
   const [selectedModelName, setSelectedModelName] = useState(models[0]?.name || '')
   const [message, setMessage] = useState('')

   const selectedModel = useMemo(() => models.find((model) => model.name === selectedModelName) || models[0], [models, selectedModelName])

   const featureImpact = [
      { feature: 'Tx velocity', impact: 82 },
      { feature: 'Balance stability', impact: 74 },
      { feature: 'Merchant diversity', impact: 56 },
      { feature: 'Device consistency', impact: 88 },
      { feature: 'Geo drift', impact: 42 },
   ]

   const confidenceBins = [
      { label: '0-20', value: 3 },
      { label: '21-40', value: 8 },
      { label: '41-60', value: 14 },
      { label: '61-80', value: 27 },
      { label: '81-100', value: 48 },
   ]

  const actor = user?.name || 'System Admin'

  const handleRecalibrate = (modelName) => {
    recalibrateModel(modelName, actor)
    setSelectedModelName(modelName)
    setMessage(`${modelName} entered recalibration.`)
  }

  const handlePause = () => {
    if (!selectedModel) return
    pauseModel(selectedModel.name, actor)
    setMessage(`${selectedModel.name} deployment paused.`)
  }

  const handleCounterfactual = () => {
    runCounterfactual(actor)
    setMessage('Counterfactual simulation recorded in the audit log.')
  }

   const summaryCards = [
      { label: 'Active models', value: modelSummary.active, tone: 'good' },
      { label: 'Calibrating', value: modelSummary.calibrating, tone: 'warn' },
      { label: 'Paused', value: modelSummary.paused, tone: 'bad' },
   ]

  return (
      <div className="mx-auto max-w-7xl space-y-8 animate-enter">
         <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
               <p className="section-kicker">Model Governance</p>
               <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">AI Model Insights</h1>
               <p className="mt-2 text-sm text-on-surface-variant">Monitor feature influence, confidence spread, and model health before deployment actions.</p>
            </div>
            <StatusBadge tone="good">Active {modelSummary.active} • Calibrating {modelSummary.calibrating}</StatusBadge>
         </header>
         {message ? <p className="text-sm text-tertiary">{message}</p> : null}

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

         <div className="grid gap-6 lg:grid-cols-12">
            <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-8">
               <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold text-white">Feature Importance Lens</h2>
                  <TooltipHint text="Relative influence on risk/credit outcomes in recent scoring window." />
               </div>
               <div className="mt-5 space-y-4">
                  {featureImpact.map((row) => (
                     <div key={row.feature}>
                        <div className="flex items-center justify-between text-sm">
                           <span className="text-on-surface">{row.feature}</span>
                           <span className="text-on-surface-variant">{row.impact}%</span>
                        </div>
                        <div className="mt-2 h-2 rounded-full bg-white/10">
                           <div className="h-full rounded-full bg-primary" style={{ width: `${row.impact}%` }} />
                        </div>
                     </div>
                  ))}
               </div>
            </SurfaceCard>

            <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-4">
               <h2 className="font-display text-xl font-semibold text-white">Confidence Distribution</h2>
               <div className="mt-4">
                  <Histogram bins={confidenceBins} />
               </div>
            </SurfaceCard>
         </div>

         <div className="grid gap-6 lg:grid-cols-12">
            <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-8">
               <h2 className="font-display text-xl font-semibold text-white">Model Registry</h2>
               <div className="mt-4 space-y-3">
                  {models.map((m) => (
                     <div key={m.name} className={`rounded-xl border bg-surface-low/50 p-4 ${selectedModel?.name === m.name ? 'border-primary/40 ring-1 ring-primary/30' : 'border-white/10'}`}>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                           <div>
                              <p className="text-lg font-semibold text-on-surface">{m.name}</p>
                              <p className="text-xs text-on-surface-variant">v{m.version} - {m.signals} signals/min - depth {m.depth} - deployment {m.deployment}</p>
                           </div>
                           <StatusBadge tone={m.status === 'Stable' ? 'good' : m.status === 'Paused' ? 'bad' : 'warn'}>{m.status}</StatusBadge>
                        </div>
                        <div className="mt-3 grid gap-4 md:grid-cols-2">
                           <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Performance trend</p>
                              <Sparkline values={[56, 62, 65, 67, 66, 70, 72]} />
                           </div>
                           <div>
                              <p className="text-xs uppercase tracking-[0.14em] text-on-surface-variant">Drift trend</p>
                              <MiniBarTrend values={[m.drift + 5, m.drift + 3, m.drift + 2, m.drift + 2, m.drift + 1, m.drift + 1, m.drift]} colorClass="bg-error/60" />
                           </div>
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:flex lg:flex-wrap">
                          <button onClick={() => handleRecalibrate(m.name)} className="rounded-lg bg-primary/20 px-3 py-2 text-xs font-semibold uppercase text-primary">Recalibrate</button>
                          <button onClick={() => setSelectedModelName(m.name)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-semibold uppercase text-on-surface">Inspect</button>
                        </div>
                     </div>
                  ))}
               </div>
            </SurfaceCard>

            <SurfaceCard className="glass-surface border-white/10 p-5 sm:p-6 lg:col-span-4">
               <h2 className="font-display text-xl font-semibold text-white">Scenario Explanation</h2>
               <div className="mt-4 rounded-xl border border-white/10 bg-surface-low/50 p-4 text-sm text-on-surface-variant">
                  {selectedModel ? (
                    <>
                      <p className="text-on-surface">Model: {selectedModel.name}</p>
                      <p className="mt-3">Deployment state: {selectedModel.deployment}. Last sync: {selectedModel.lastSync}.</p>
                      <p className="mt-3">Drift marker: {selectedModel.drift}. Suggested action: {selectedModel.drift > 6 ? 'recalibrate before promotion' : 'keep active with monitoring'}.</p>
                    </>
                  ) : null}
               </div>
                      {selectedModel ? (
                         <div className="mt-4 rounded-xl border border-white/10 bg-surface-low/40 p-4 text-sm text-on-surface-variant">
                            <div className="flex items-center justify-between gap-3">
                               <span>Selected deployment</span>
                               <StatusBadge tone={selectedModel.status === 'Stable' ? 'good' : selectedModel.status === 'Paused' ? 'bad' : 'warn'}>{selectedModel.status}</StatusBadge>
                            </div>
                            <div className="mt-2 flex items-center justify-between gap-3">
                               <span>Drift score</span>
                               <span className="font-semibold text-white">{selectedModel.drift}</span>
                            </div>
                         </div>
                      ) : null}
               <div className="mt-5 space-y-3">
                  <button onClick={handleCounterfactual} className="w-full rounded-xl bg-primary/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">Run counterfactual</button>
                  <button onClick={handlePause} className="w-full rounded-xl bg-error/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-error">Pause deployment</button>
               </div>
            </SurfaceCard>
         </div>
      </div>
  )
}

export default ModelMonitoring
