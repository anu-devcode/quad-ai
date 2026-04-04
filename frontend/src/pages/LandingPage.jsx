import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PremiumButton, SurfaceCard } from '../components/ui'

function LandingPage() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    { title: 'Readiness', icon: '✅', desc: 'Check whether the OCR, scoring, and persistence layers are available.' },
    { title: 'Intake', icon: '📥', desc: 'Submit SMS, screenshots, PDFs, or structured transactions.' },
    { title: 'Scoring', icon: '🧮', desc: 'Blend local validation with the FastAPI model output.' },
    { title: 'Review', icon: '🧾', desc: 'Move cases into trust, fraud, or loan decision workflows.' }
  ]

  return (
    <div className="landing-animated-shell relative overflow-hidden bg-transparent text-on-surface">

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden px-4 pb-32 pt-20 sm:px-8 sm:pt-32 lg:px-12">
        {/* Subtle Background Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <div className="h-[800px] w-[800px] rounded-full bg-primary/30 blur-[140px] animate-pulse" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <div className="mb-8 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-md animate-enter">
            <span className="section-kicker">Workflow Console</span>
          </div>
          <h1 className="landing-title animate-fade-in stagger-1 font-display text-5xl font-extrabold text-white sm:text-7xl lg:text-8xl">
            Intake, score, and review <br />
            <span className="text-gradient">transaction evidence</span>
          </h1>
          <p className="body-muted mx-auto mt-10 max-w-3xl text-lg sm:text-2xl animate-fade-in stagger-2">
            This console mirrors the backend flow: readiness checks, evidence ingestion, scoring, and case review.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in stagger-3">
            <Link to="/dashboard">
              <PremiumButton variant="primary" className="px-10 py-5 text-lg font-bold shadow-premium">
                Open Console
              </PremiumButton>
            </Link>
            <a href="#how-it-works">
              <PremiumButton variant="secondary" className="px-10 py-5 text-lg font-bold bg-white/5 text-white backdrop-blur-xl border border-white/10">
                See Workflow
              </PremiumButton>
            </a>
          </div>

          {/* INTERACTIVE PIPELINE */}
              <div className="group relative mx-auto mt-32 max-w-5xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-surface-container-low p-8 shadow-2xl sm:p-12 animate-slide-up stagger-4">
             <div className="relative z-10">
                <p className="section-kicker mb-12">The Workflow</p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16 relative">
                   <div className="hidden lg:block absolute top-[40px] left-[10%] right-[10%] h-0.5 pointer-events-none">
                      <div className="h-full bg-gradient-to-r from-primary/10 via-primary to-primary/10 animate-shimmer" />
                   </div>

                   {steps.map((step, i) => (
                      <button 
                         key={i} 
                         onClick={() => setActiveStep(i)}
                         className={`flex flex-col items-center group transition-all duration-500 ${activeStep === i ? 'scale-110' : 'opacity-40 grayscale hover:opacity-100 hover:grayscale-0'}`}
                      >
                         <div className={`h-20 w-20 rounded-[2rem] flex items-center justify-center text-4xl mb-6 border-2 transition-all duration-500 ${activeStep === i ? 'bg-primary/20 border-primary shadow-[0_0_40px_rgba(99,102,241,0.3)]' : 'bg-white/5 border-white/10'}`}>
                            {step.icon}
                         </div>
                         <p className={`text-xs font-semibold uppercase tracking-[0.15em] transition-colors duration-500 ${activeStep === i ? 'text-primary' : 'text-on-surface-variant'}`}>{step.title}</p>
                      </button>
                   ))}
                </div>

                <div className="mx-auto max-w-2xl text-center bg-white/5 rounded-3xl p-10 border border-white/5 backdrop-blur-md animate-fade-in" key={activeStep}>
                     <h3 className="mb-6 font-display text-3xl font-bold leading-tight text-white">{steps[activeStep].title}</h3>
                     <p className="body-muted mb-8 text-xl">{steps[activeStep].desc}</p>
                   <div className="flex justify-center gap-6">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-tertiary bg-tertiary/10 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                         Ready Check ✅
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse delay-75">
                         Backend Aligned 🛡️
                      </div>
                   </div>
                </div>
             </div>
             <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
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
  )
}

export default LandingPage
