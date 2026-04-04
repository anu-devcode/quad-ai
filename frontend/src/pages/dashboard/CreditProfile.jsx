import { SurfaceCard } from '../../components/ui'

function CreditProfile() {
  const profileMetrics = [
    { title: 'Account Age', value: '3y 2m', level: 'Institutional', desc: 'Verified through historical mobile wallet metadata.' },
    { title: 'Frequency', value: 'High', level: 'Sub-second', desc: 'Highly consistent daily transaction velocity detected.' },
    { title: 'Consistency', value: '98%', level: 'Verified', desc: 'Predictable spending patterns across core utilities.' },
    { title: 'Behavioral Score', value: '842', level: 'Tier 1', desc: 'Neural analysis of data integrity and reliability.' }
  ]

  const recommendations = [
    { text: 'Upload March SMS Proof', reason: 'Increase current month data signal strength.' },
    { text: 'Verify Bank Statement', reason: 'Bridge the gap between wallet and traditional bank data.' },
    { text: 'Increase Consistency', reason: 'Avoid irregular large-value outbound spikes.' }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="mb-16">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 italic underline decoration-primary/20">[ Intelligence Hub ]</p>
         <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tighter italic uppercase underline decoration-white/5">
            Credit <span className="text-gradient">Intelligence</span>
         </h1>
         <p className="text-xl text-on-surface-variant font-light mt-4 italic">Understand the underlying behavioral neural vectors that define your institutional trust status.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* PILLARS OF TRUST */}
        <div className="lg:col-span-8 flex flex-col gap-6">
           <div className="grid gap-6 md:grid-cols-2">
              {profileMetrics.map((p, i) => (
                 <SurfaceCard key={i} className="p-8 border-white/5 hover:bg-white/5 transition-all group overflow-hidden relative">
                    <div className="relative z-10 flex flex-col">
                       <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-widest italic mb-6 opacity-60 underline decoration-primary/20">{p.title}</span>
                       <div className="flex items-center gap-4 mb-4">
                          <p className="text-4xl font-black text-white italic tracking-tighter uppercase">{p.value}</p>
                          <span className="px-3 py-1 rounded bg-primary/10 border border-primary/20 text-[10px] font-black uppercase text-primary italic shadow-premium">{p.level}</span>
                       </div>
                       <p className="text-sm text-on-surface-variant italic font-light leading-relaxed">{p.desc}</p>
                    </div>
                    <div className="absolute top-[-10px] right-[-10px] h-32 w-32 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                 </SurfaceCard>
              ))}
           </div>

           {/* WHY YOUR SCORE IS X */}
           <SurfaceCard className="glass-surface p-12 border-white/5 overflow-hidden">
              <h3 className="font-display text-2xl font-black text-white mb-8 italic uppercase underline decoration-primary/20 tracking-tighter">"Why Your Score is 742"</h3>
              <div className="prose prose-invert max-w-none italic font-light text-on-surface-variant leading-loose space-y-6">
                 <p>
                    Your current operational profile is anchored by a <span className="font-black text-white underline decoration-tertiary/20">98% Data Consistency Matrix</span>. 
                    The inference models have identified that over 70% of your outgoings are directed towards verified merchant endpoints, which are categorized as low-volatility entities (Rent, Utilities, Insurance).
                 </p>
                 <p>
                    However, the models detected a <span className="font-black text-error/80 underline decoration-error/20">risk flag in February 2026</span> due to a missing evidence payload for a high-value transaction of $4,000. Resolving this orphan event will likely unlock a +25 point delta in your next trust recalculation.
                 </p>
                 <div className="p-6 rounded-2xl bg-white/5 border border-white/5 mt-8">
                    <h4 className="text-xs font-black text-white uppercase italic tracking-widest mb-2">Neural Vector Sensitivity</h4>
                    <div className="flex gap-1 h-2 w-full overflow-hidden rounded-full bg-white/5">
                       <div className="w-[45%] bg-primary h-full" />
                       <div className="w-[30%] bg-tertiary h-full" />
                       <div className="w-[15%] bg-yellow-400 h-full" />
                       <div className="w-[10%] bg-error h-full" />
                    </div>
                 </div>
              </div>
           </SurfaceCard>
        </div>

        {/* RECO HUB SIDEBAR */}
        <div className="lg:col-span-4 h-full">
           <SurfaceCard className="glass-surface p-10 h-full border-white/5 flex flex-col items-center text-center">
              <div className="text-5xl mb-8 grayscale opacity-50 group-hover:grayscale-0 transition-all group-hover:scale-110 duration-700 decoration-primary/20 underline">🧠</div>
              <h2 className="font-display text-xl font-black text-white italic uppercase underline decoration-primary/20 mb-10">AI Recommendations</h2>
              
              <div className="space-y-6 w-full text-left">
                 {recommendations.map((r, i) => (
                    <div key={i} className="group p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-default">
                       <p className="text-xs font-black text-white group-hover:text-primary transition-colors underline decoration-white/10 uppercase italic">{r.text}</p>
                       <p className="text-[10px] text-on-surface-variant font-light italic mt-3 leading-relaxed">{r.reason}</p>
                    </div>
                 ))}
              </div>

              <div className="mt-12 w-full pt-8 border-t border-white/5">
                 <p className="text-[10px] font-black uppercase text-on-surface-variant mb-6 italic opacity-40">Your Trust Roadmap</p>
                 <button className="w-full py-4 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-premium hover:brightness-110">Launch Strategic Hub</button>
              </div>
           </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

export default CreditProfile
