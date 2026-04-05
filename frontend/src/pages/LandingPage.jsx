import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PremiumButton, SurfaceCard } from '../components/ui'

function LandingPage() {
  const [activeStep, setActiveStep] = useState(0)

  const streamBands = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    top: 8 + i * 11,
    delay: `${(i * 0.45).toFixed(2)}s`,
    duration: `${14 + (i % 4) * 2}s`,
  }))

  const backgroundParticles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    x: 6 + (i * 11) % 92,
    y: 10 + (i * 17) % 78,
    delay: `${(i * 0.55).toFixed(2)}s`,
    duration: `${7 + (i % 5) * 1.6}s`,
  }))

  const signalNodes = [
    { id: 'wallet', x: 14, y: 22, tone: 'info', delay: '0s' },
    { id: 'ocr', x: 28, y: 46, tone: 'primary', delay: '0.5s' },
    { id: 'risk', x: 52, y: 34, tone: 'warning', delay: '1s' },
    { id: 'trust', x: 74, y: 20, tone: 'safe', delay: '1.4s' },
    { id: 'alert', x: 82, y: 52, tone: 'risk', delay: '1.8s' },
    { id: 'ledger', x: 62, y: 68, tone: 'info', delay: '2.2s' },
    { id: 'sms', x: 34, y: 72, tone: 'primary', delay: '2.6s' },
    { id: 'review', x: 18, y: 58, tone: 'warning', delay: '3s' },
  ]

  const nodeMap = signalNodes.reduce((acc, node) => {
    acc[node.id] = node
    return acc
  }, {})

  const signalLinks = [
    ['wallet', 'ocr'],
    ['ocr', 'risk'],
    ['risk', 'trust'],
    ['risk', 'alert'],
    ['ocr', 'sms'],
    ['sms', 'ledger'],
    ['ledger', 'alert'],
    ['review', 'ocr'],
    ['review', 'risk'],
    ['trust', 'alert'],
  ]

  const steps = [
    { title: 'Signal Intake', icon: '📥', desc: 'Capture screenshots, statements, SMS logs, or manual entries in one pipeline.' },
    { title: 'Parsing Layer', icon: '🧠', desc: 'Extract transaction fields, quality checks, and confidence markers in real time.' },
    { title: 'Risk Decisioning', icon: '⚡', desc: 'Blend model scoring and behavioral rules to produce explainable risk decisions.' },
    { title: 'Operator Action', icon: '🛡️', desc: 'Escalate high-risk events and publish trust outcomes to the dashboard instantly.' }
  ]

  return (
    <div className="landing-animated-shell relative overflow-hidden bg-transparent text-on-surface">
      <div className="landing-premium-bg" aria-hidden="true">
        <div className="landing-premium-gradient" />
        <div className="landing-premium-grid" />
        <div className="landing-premium-streams">
          {streamBands.map((band) => (
            <span
              key={band.id}
              className="landing-premium-stream"
              style={{
                top: `${band.top}%`,
                animationDelay: band.delay,
                animationDuration: band.duration,
              }}
            />
          ))}
        </div>
        <div className="landing-premium-particles">
          {backgroundParticles.map((particle) => (
            <span
              key={particle.id}
              className="landing-premium-particle"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                animationDelay: particle.delay,
                animationDuration: particle.duration,
              }}
            />
          ))}
        </div>
        <div className="landing-premium-vignette" />
      </div>

      <div className="relative z-10">

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden px-4 pb-24 pt-20 sm:px-8 sm:pt-28 lg:px-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 ai-signal-base" />
          <div className="absolute inset-0 ai-signal-grid" />
          <div className="ai-signal-orb ai-signal-orb-a" />
          <div className="ai-signal-orb ai-signal-orb-b" />
          <div className="ai-signal-orb ai-signal-orb-c" />
          <div className="absolute inset-x-0 top-16 mx-auto h-[26rem] w-[92%] max-w-6xl rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-sm">
            {signalLinks.map(([fromId, toId], index) => {
              const from = nodeMap[fromId]
              const to = nodeMap[toId]
              if (!from || !to) return null

              const dx = to.x - from.x
              const dy = to.y - from.y
              const length = Math.sqrt(dx * dx + dy * dy)
              const angle = (Math.atan2(dy, dx) * 180) / Math.PI

              return (
                <span
                  key={`${fromId}-${toId}`}
                  className="ai-signal-link"
                  style={{
                    left: `${from.x}%`,
                    top: `${from.y}%`,
                    width: `${length}%`,
                    transform: `rotate(${angle}deg)`,
                    animationDelay: `${index * 0.3}s`,
                  }}
                />
              )
            })}

            {signalNodes.map((node) => (
              <span
                key={node.id}
                className={`ai-signal-node ai-tone-${node.tone}`}
                style={{ left: `${node.x}%`, top: `${node.y}%`, animationDelay: node.delay }}
              >
                <span className="ai-signal-pulse" />
              </span>
            ))}
          </div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <div className="mb-8 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md animate-enter">
            <span className="section-kicker">Realtime Risk Infrastructure</span>
          </div>
          <h1 className="landing-title animate-fade-in stagger-1 font-display text-5xl font-extrabold text-white sm:text-7xl lg:text-8xl">
            AI-Powered Transaction <br />
            <span className="text-gradient">Intelligence &amp; Risk Decisioning</span>
          </h1>
          <p className="body-muted mx-auto mt-10 max-w-3xl text-lg sm:text-2xl animate-fade-in stagger-2">
            Ingest, analyze, and act on financial signals with real-time fraud detection and trust scoring.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in stagger-3">
            <Link to="/auth">
              <PremiumButton variant="primary" className="px-10 py-5 text-lg font-bold shadow-premium">
                🚀 Start Analysis
              </PremiumButton>
            </Link>
            <Link to="/demo">
              <PremiumButton variant="secondary" className="px-10 py-5 text-lg font-bold bg-white/5 text-white backdrop-blur-xl border border-white/10">
                🎥 Watch Demo
              </PremiumButton>
            </Link>
          </div>

          <div className="mx-auto mt-16 flex max-w-4xl flex-wrap items-center justify-center gap-4 rounded-2xl border border-white/10 bg-surface-container-low/70 px-6 py-4 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-on-surface-variant">Trusted by financial operators</p>
            {['Abyssinia Ops', 'Nile Switch', 'Ethio Ledger', 'Horizon Pay'].map((name) => (
              <div key={name} className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
                {name}
              </div>
            ))}
          </div>

          <div className="mx-auto mt-8 grid max-w-5xl gap-4 text-left sm:grid-cols-3">
            <SurfaceCard className="glass-surface border-white/10 p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-tertiary">⚡ &lt; 2s scoring latency</p>
              <p className="mt-3 text-sm text-on-surface-variant">Rapid model responses for evidence triage and operational decisioning.</p>
            </SurfaceCard>
            <SurfaceCard className="glass-surface border-white/10 p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-warning">📊 95% fraud detection accuracy</p>
              <p className="mt-3 text-sm text-on-surface-variant">Signal fusion catches high-risk movement while reducing review noise.</p>
            </SurfaceCard>
            <SurfaceCard className="glass-surface border-white/10 p-6">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-info">🔐 Enterprise-grade security</p>
              <p className="mt-3 text-sm text-on-surface-variant">Operator sessions, audit logs, and secure ingestion across every workflow.</p>
            </SurfaceCard>
          </div>

          {/* INTERACTIVE PIPELINE */}
          <div className="group relative mx-auto mt-20 max-w-5xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-surface-container-low p-8 shadow-2xl sm:p-12 animate-slide-up stagger-4">
            <div className="relative z-10">
              <p className="section-kicker mb-12">The Workflow</p>

              <div className="relative mb-16 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="pointer-events-none absolute left-[10%] right-[10%] top-[40px] hidden h-0.5 lg:block">
                  <div className="h-full bg-gradient-to-r from-primary/10 via-primary to-primary/10 animate-shimmer" />
                </div>

                {steps.map((step, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveStep(i)}
                    className={`group flex flex-col items-center transition-all duration-500 ${activeStep === i ? 'scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                  >
                    <div className={`mb-6 flex h-20 w-20 items-center justify-center rounded-[2rem] border-2 text-4xl transition-all duration-500 ${activeStep === i ? 'border-primary bg-primary/20 shadow-[0_0_40px_rgba(99,102,241,0.3)]' : 'border-white/10 bg-white/5'}`}>
                      {step.icon}
                    </div>
                    <p className={`text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-500 ${activeStep === i ? 'text-primary' : 'text-on-surface-variant'}`}>{step.title}</p>
                  </button>
                ))}
              </div>

              <div className="mx-auto max-w-2xl rounded-3xl border border-white/5 bg-white/5 p-10 text-center backdrop-blur-md animate-fade-in" key={activeStep}>
                <h3 className="mb-6 font-display text-3xl font-bold leading-tight text-white">{steps[activeStep].title}</h3>
                <p className="body-muted mb-8 text-xl">{steps[activeStep].desc}</p>
                <div className="flex justify-center gap-6">
                  <div className="animate-pulse rounded-full bg-tertiary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-tertiary">
                    Live Signals ✅
                  </div>
                  <div className="animate-pulse delay-75 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Fraud Pulse 🛡️
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-20 transition-opacity group-hover:opacity-40" />
          </div>
        </div>
      </section>

      {/* ─── How It Works (3-Step Feature Grid) ─── */}
      <section id="how-it-works" className="relative px-4 py-40 sm:px-8 lg:px-12 bg-transparent">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-24 animate-slide-up">
            <p className="section-kicker mb-6">The Flow</p>
            <h2 className="landing-title font-display text-4xl font-bold text-white sm:text-6xl">Evidence-Driven <span className="text-gradient">Operations</span></h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
             {[
                { icon: '📥', title: '01. Intake', desc: 'Ingest transaction SMS payloads, screenshots, PDFs, or structured forms.', features: ['Source typing', 'OCR parsing', 'Request validation'] },
                { icon: '⚙️', title: '02. Normalize', desc: 'Shape raw evidence into the payload that the scoring pipeline expects.', features: ['Canonical schema', 'Location/IP handling', 'Confidence extraction'] },
                { icon: '🎯', title: '03. Review', desc: 'Route the result into trust, fraud, or loan workflows for operator action.', features: ['Risk summary', 'Admin queue', 'Loan outcome'] }
             ].map((item, i) => (
                <SurfaceCard key={i} className={`glass-surface p-12 h-full border-white/5 group hover:border-primary/20 transition-all hover:bg-white/5 animate-slide-up stagger-${i+1}`}>
                   <div className="text-5xl mb-8 group-hover:scale-110 transition-transform bg-primary/10 h-20 w-20 rounded-2xl flex items-center justify-center">
                      {item.icon}
                   </div>
                   <h3 className="mb-6 font-display text-2xl font-bold tracking-tight text-white">{item.title}</h3>
                   <p className="body-muted mb-8 text-lg">{item.desc}</p>
                   <div className="mt-auto space-y-3">
                      {item.features.map(f => (
                       <div key={f} className="flex items-center gap-3 text-xs font-medium text-on-surface-variant">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary group-hover:scale-150 transition-transform" /> {f}
                         </div>
                      ))}
                   </div>
                </SurfaceCard>
             ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison ─── */}
      <section className="relative px-4 py-40 sm:px-8 lg:px-12 bg-transparent overflow-hidden">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-24 animate-fade-in">
             <p className="section-kicker mb-6">The Competitive Edge</p>
             <h2 className="landing-title font-display text-5xl font-extrabold text-white sm:text-6xl">Why the <span className="text-gradient">Console</span> Flow?</h2>
          </div>

          <div className="overflow-hidden rounded-[3rem] border border-white/10 bg-surface-container-low shadow-3xl animate-enter">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-10 py-8 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Stage</th>
                  <th className="px-10 py-8 text-xs font-semibold uppercase tracking-widest text-error/70">Generic App</th>
                  <th className="px-10 py-8 text-xs font-semibold uppercase tracking-widest text-tertiary">Workflow Console</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                   { label: 'Readiness', old: 'Unclear setup state ❌', new: 'Visible service health ✅' },
                   { label: 'Intake', old: 'Manual copy-paste forms ❌', new: 'Structured source upload ✅' },
                   { label: 'Review', old: 'Hidden decisioning ❌', new: 'Traceable queue actions ✅' }
                ].map((row, i) => (
                   <tr key={i} className="group hover:bg-white/5 transition-colors animate-fade-in" style={{ animationDelay: `${(i+1)*100}ms` }}>
                       <td className="px-10 py-8 text-base font-semibold text-white">{row.label}</td>
                       <td className="px-10 py-8 text-sm text-on-surface-variant">{row.old}</td>
                       <td className="bg-primary/5 px-10 py-8 text-base font-semibold text-white transition-colors group-hover:bg-primary/10">{row.new}</td>
                   </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative bg-transparent px-4 py-44 text-center sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl relative z-10 animate-scale-in">
          <h1 className="landing-title mb-12 font-display text-6xl font-black leading-none text-white sm:text-8xl">
            Operate Trust <br />
            From One Console
          </h1>
          <p className="body-muted mx-auto mb-16 max-w-2xl text-2xl">
             Backend-first workflow pages, ready for API wiring.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/auth">
              <PremiumButton variant="primary" className="px-12 py-5 text-xl font-bold shadow-premium">
                Sign In
              </PremiumButton>
            </Link>
            <Link to="/dashboard">
              <PremiumButton variant="secondary" className="px-12 py-5 text-xl font-bold bg-white/10 text-white border-white/10">
                Open Dashboard →
              </PremiumButton>
            </Link>
          </div>
        </div>
        <div className="absolute inset-0 z-0 bg-primary/5 blur-[200px]" />
      </section>
      </div>
    </div>
  )
}

export default LandingPage
