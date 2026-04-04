export function SurfaceCard({ className = '', children, level = 'default' }) {
  const levels = {
    default: 'bg-surface',
    low: 'bg-surface-low',
    lowest: 'bg-surface-lowest shadow-premium',
    high: 'bg-surface-high',
    highest: 'bg-surface-highest'
  }

  return (
    <article
      className={`animate-enter rounded-2xl p-6 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-premium-hover ${levels[level]} ${className}`}
    >
      {children}
    </article>
  )
}

export function TokenPill({ tone = 'neutral', children }) {
  const toneMap = {
    neutral: 'bg-surface-highest text-on-surface-variant',
    good: 'bg-tertiary-container text-tertiary',
    warn: 'bg-secondary-container text-on-secondary-container',
    bad: 'bg-error-container text-error',
    info: 'bg-primary/10 text-primary',
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.05em] ${toneMap[tone]}`}
    >
      {children}
    </span>
  )
}

export function SectionHeading({ overline, title, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        {overline && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary/85">
            {overline}
          </p>
        )}
        <h2 className="mt-2 font-display text-xl font-bold text-on-surface sm:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  )
}

export function PremiumButton({ variant = 'primary', children, className = '', ...props }) {
  const variants = {
    primary: 'premium-gradient text-white shadow-premium hover:brightness-110 active:scale-95',
    secondary: 'bg-surface-highest text-on-surface border border-white/10 hover:bg-surface-high active:scale-95',
    tertiary: 'bg-transparent text-on-surface hover:bg-on-surface/5 active:scale-95',
  }

  return (
    <button
      className={`group relative inline-flex items-center justify-center overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold tracking-wide transition-all duration-300 ${variants[variant]} ${className}`}
      {...props}
    >
      {/* Interactive Shimmer Overlay */}
      <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:animate-shimmer pointer-events-none" />
      
      <span className="relative z-10">{children}</span>
    </button>
  )
}

export function ProgressTrack({ value }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-highest">
      <div 
        className="premium-gradient h-full rounded-full transition-all duration-500" 
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }} 
      />
    </div>
  )
}

export function ScoreRing({ score, max = 850 }) {
  const radius = 58
  const stroke = 8
  const normalized = radius - stroke / 2
  const circumference = normalized * 2 * Math.PI
  const pct = Math.min(1, Math.max(0, score / max))
  const dash = circumference * pct

  return (
    <div className="relative mx-auto h-36 w-36 sm:h-44 sm:w-44">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={normalized} fill="none" stroke="var(--surface-highest)" strokeWidth={stroke} />
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
            <stop stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--primary-dim)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-[3.5rem] font-bold leading-none text-on-surface">{score}</p>
          <p className="mt-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">/ {max}</p>
        </div>
      </div>
    </div>
  )
}
