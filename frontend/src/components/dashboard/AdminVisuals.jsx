import { useMemo } from 'react'

export function StatusBadge({ tone = 'neutral', children }) {
  const tones = {
    good: 'bg-tertiary/15 text-tertiary border-tertiary/30',
    warn: 'bg-yellow-400/15 text-yellow-400 border-yellow-400/30',
    bad: 'bg-error/15 text-error border-error/30',
    info: 'bg-primary/15 text-primary border-primary/30',
    neutral: 'bg-white/10 text-on-surface-variant border-white/15',
  }

  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function LiveDot({ label = 'Live' }) {
  return (
    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-tertiary">
      <span className="h-2 w-2 rounded-full bg-tertiary animate-pulse" />
      {label}
    </span>
  )
}

export function Sparkline({ values, color = 'var(--primary)' }) {
  const points = useMemo(() => {
    if (!values?.length) return ''
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1
    return values
      .map((value, idx) => {
        const x = (idx / (values.length - 1 || 1)) * 100
        const y = 100 - ((value - min) / range) * 100
        return `${x},${y}`
      })
      .join(' ')
  }, [values])

  return (
    <svg viewBox="0 0 100 100" className="h-10 w-full">
      <polyline fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" points={points} />
    </svg>
  )
}

export function MiniBarTrend({ values, colorClass = 'bg-primary/70' }) {
  const max = Math.max(...values, 1)
  return (
    <div className="flex h-10 items-end gap-1">
      {values.map((v, i) => (
        <div key={i} className={`flex-1 rounded-t ${colorClass}`} style={{ height: `${(v / max) * 100}%` }} />
      ))}
    </div>
  )
}

export function RadialGauge({ value = 0, max = 100, tone = 'primary', size = 120 }) {
  const pct = Math.max(0, Math.min(1, value / max))
  const radius = 44
  const circumference = 2 * Math.PI * radius
  const dash = circumference * pct
  const toneColor = tone === 'error' ? 'var(--error)' : tone === 'tertiary' ? 'var(--tertiary)' : 'var(--primary)'

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={toneColor}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circumference - dash}`}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <p className="text-xl font-bold text-white">{Math.round(value)}</p>
      </div>
    </div>
  )
}

export function ScatterChart({ points }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface-low/60 p-4">
      <div className="relative h-56 overflow-hidden rounded-lg bg-surface-lowest/60">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:20%_20%]" />
        {points.map((p) => (
          <span
            key={p.id}
            className={`absolute h-2.5 w-2.5 rounded-full ${p.risk > 70 ? 'bg-error' : p.risk > 40 ? 'bg-yellow-400' : 'bg-tertiary'}`}
            style={{ left: `${p.trust}%`, bottom: `${p.risk}%` }}
            title={`${p.name}: trust ${p.trust}, risk ${p.risk}`}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.15em] text-on-surface-variant">
        <span>Trust</span>
        <span>Risk</span>
      </div>
    </div>
  )
}

export function Histogram({ bins }) {
  const max = Math.max(...bins.map((b) => b.value), 1)
  return (
    <div className="rounded-xl border border-white/10 bg-surface-low/60 p-4">
      <div className="flex h-44 items-end gap-2">
        {bins.map((bin) => (
          <div key={bin.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="w-full rounded-t bg-primary/70" style={{ height: `${(bin.value / max) * 100}%` }} />
            <span className="text-[10px] uppercase tracking-[0.1em] text-on-surface-variant">{bin.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function TooltipHint({ text }) {
  return (
    <span title={text} className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[10px] text-on-surface-variant">
      i
    </span>
  )
}
