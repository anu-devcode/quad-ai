import { useState } from 'react'
import { Link } from 'react-router-dom'
import { PremiumButton, SurfaceCard } from '../components/ui'

function LandingPage() {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    { title: 'Evidence Ingestion', icon: '📥', desc: 'Accept metadata-rich evidence from SMS, screenshots, or PDFs.' },
    { title: 'Neural Extraction', icon: '🔍', desc: 'OCR parsing specifically tuned for messy, low-res financial metadata.' },
    { title: 'Inference Engine', icon: '🧠', desc: 'Real-time scoring based on multi-vector behavioral patterns.' },
    { title: 'Trust Output', icon: '🎯', desc: 'Actionable credit scores and exhaustive risk flags.' }
  ]

  return (
    <div className="relative overflow-hidden bg-background text-on-surface">
      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden px-4 pb-32 pt-20 sm:px-8 sm:pt-32 lg:px-12">
        {/* Subtle Background Glow */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20 pointer-events-none">
          <div className="h-[800px] w-[800px] rounded-full bg-primary/30 blur-[140px] animate-pulse" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl text-center">
          <div className="mb-8 inline-block rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 backdrop-blur-md animate-enter">
            <span className="section-kicker">Financial Trust Infrastructure</span>
          </div>
          <h1 className="landing-title animate-fade-in stagger-1 font-display text-5xl font-extrabold text-white sm:text-7xl lg:text-8xl">
            Build Credit & Detect Fraud <br />
            Using <span className="text-gradient">Real Evidence</span>
          </h1>
          <p className="body-muted mx-auto mt-10 max-w-3xl text-lg sm:text-2xl animate-fade-in stagger-2">
            We transform SMS, transaction screenshots, and financial statements into trusted data for AI-score-driven credit and fraud protection.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-4 animate-fade-in stagger-3">
            <Link to="/demo">
              <PremiumButton variant="primary" className="px-10 py-5 text-lg font-bold shadow-premium">
                Try Live Demo
              </PremiumButton>
            </Link>
            <a href="#how-it-works">
              <PremiumButton variant="secondary" className="px-10 py-5 text-lg font-bold bg-white/5 text-white backdrop-blur-xl border border-white/10">
                See How It Works
              </PremiumButton>
            </a>
          </div>

          {/* INTERACTIVE PIPELINE */}
              <div className="group relative mx-auto mt-32 max-w-5xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-surface-container-low p-8 shadow-2xl sm:p-12 animate-slide-up stagger-4">
             <div className="relative z-10">
                <p className="section-kicker mb-12">The Interactive Pipeline</p>
                
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
                         Verified Proof ✅
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse delay-75">
                         AI Synthetic Control 🛡️
                      </div>
                   </div>
                </div>
             </div>
             <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/10 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" />
          </div>
        </div>
      </section>

      {/* ─── How It Works (3-Step Feature Grid) ─── */}
      <section id="how-it-works" className="relative px-4 py-40 sm:px-8 lg:px-12 bg-surface-container-lowest/30">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-24 animate-slide-up">
            <p className="section-kicker mb-6">The Flow</p>
            <h2 className="landing-title font-display text-4xl font-bold text-white sm:text-6xl">Evidence-Driven <span className="text-gradient">Trust</span></h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
             {[
                { icon: '📥', title: '01. Collect', desc: 'Ingest transaction SMS payloads, screenshots, or PDF statements directly from any source.', features: ['M-Pesa / Bank SMS', 'App Screenshots', 'PDF Statements'] },
                { icon: '⚙️', title: '02. Extract', desc: 'Deploy multi-vector OCR and parsing tuned for messy, low-res financial metadata across all providers.', features: ['OCR Parsing Layer', 'Structured Data Output', 'Metadata Validation'] },
                { icon: '🎯', title: '03. Score', desc: 'Generate alternative credit scores and fraud risk summaries backed by behavioral pattern recognition.', features: ['Credit Scoring Engine', 'Fraud Risk Summary', 'Data Confidence Level'] }
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
      <section className="relative px-4 py-40 sm:px-8 lg:px-12 bg-background overflow-hidden">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-24 animate-fade-in">
             <p className="section-kicker mb-6">The Competitive Edge</p>
             <h2 className="landing-title font-display text-5xl font-extrabold text-white sm:text-6xl">Why Not <span className="text-gradient">Banks?</span></h2>
          </div>

          <div className="overflow-hidden rounded-[3rem] border border-white/10 bg-surface-container-low shadow-3xl animate-enter">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-10 py-8 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">Feature</th>
                  <th className="px-10 py-8 text-xs font-semibold uppercase tracking-widest text-error/70">Traditional Silos</th>
                  <th className="px-10 py-8 text-xs font-semibold uppercase tracking-widest text-tertiary">Quirass Ecosystem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                   { label: 'Evidence Link', old: 'Require Bank APIs ❌', new: 'No API needed ✅' },
                   { label: 'Data Depth', old: 'Limited KYC Data ❌', new: 'Full Behavior Analytics ✅' },
                   { label: 'Latency', old: '3-5 Day Approval ❌', new: 'Sub-Second Scoring ✅' }
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
      <section className="relative bg-surface-lowest px-4 py-44 text-center sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl relative z-10 animate-scale-in">
          <h1 className="landing-title mb-12 font-display text-6xl font-black leading-none text-white sm:text-8xl">
            Scale Trust <br />
            Everywhere
          </h1>
          <p className="body-muted mx-auto mb-16 max-w-2xl text-2xl">
             Deployment ready. API independent. The new standard for financial verification.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/auth">
              <PremiumButton variant="primary" className="px-12 py-5 text-xl font-bold shadow-premium">
                Launch Prototype
              </PremiumButton>
            </Link>
            <Link to="/demo">
              <PremiumButton variant="secondary" className="px-12 py-5 text-xl font-bold bg-white/10 text-white border-white/10">
                Try Demo Portal →
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
