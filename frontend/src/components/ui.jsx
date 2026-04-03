export function SurfaceCard({ className = '', children }) {
  return (
    <article
      className={`rounded-3xl border border-white/50 bg-white/85 p-5 shadow-soft backdrop-blur transition duration-300 hover:shadow-float ${className}`}
    >
      {children}
    </article>
  )
}

export function TokenPill({ tone = 'neutral', children }) {
  const toneMap = {
    neutral: 'bg-slate-100 text-slate-700',
    good: 'bg-emerald-100 text-emerald-800',
    warn: 'bg-amber-100 text-amber-800',
    bad: 'bg-rose-100 text-rose-700',
    info: 'bg-indigo-100 text-indigo-700',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${toneMap[tone]}`}
    >
      {children}
    </span>
  )
}

export function SectionHeading({ overline, title, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        {overline && <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{overline}</p>}
        <h2 className="mt-1 font-display text-xl font-semibold text-slate-900">{title}</h2>
      </div>
      {action}
    </div>
  )
}

export function ProgressTrack({ value }) {
  return (
    <div className="h-2 w-full rounded-full bg-white/30">
      <div className="h-2 rounded-full bg-white" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

export function ScoreRing({ score, max = 850 }) {
  const radius = 58
  const stroke = 9
  const normalized = radius - stroke / 2
  const circumference = normalized * 2 * Math.PI
  const pct = Math.min(1, Math.max(0, score / max))
  const dash = circumference * pct

  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={normalized} fill="none" stroke="#E4E7EC" strokeWidth={stroke} />
        <circle
          cx="64"
          cy="64"
          r={normalized}
          fill="none"
          stroke="url(#trustRingGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circumference - dash}`}
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="trustRingGradient" x1="0" y1="0" x2="128" y2="128">
            <stop stopColor="#3A2EDB" />
            <stop offset="1" stopColor="#6A5CFF" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-[3rem] font-semibold leading-none text-slate-900">{score}</p>
          <p className="text-sm text-slate-400">/ {max}</p>
        </div>
      </div>
    </div>
  )
}
