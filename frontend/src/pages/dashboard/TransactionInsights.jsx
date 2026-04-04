import { SurfaceCard } from '../../components/ui'

function TransactionInsights() {
  const categories = [
    { name: 'Utilities', amount: 1450.00, color: 'text-primary bg-primary/10' },
    { name: 'Transport', amount: 840.40, color: 'text-tertiary bg-tertiary/10' },
    { name: 'Lifestyle', amount: 2100.20, color: 'text-yellow-400 bg-yellow-400/10' },
    { name: 'Financial', amount: 5000.00, color: 'text-error bg-error/10' }
  ]

  const maxAmount = Math.max(...categories.map(c => c.amount))

  return (
    <div className="space-y-12 max-w-6xl mx-auto">
      <header className="mb-16">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 italic underline decoration-primary/20">[ Analytics Hub ]</p>
         <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tighter italic uppercase underline decoration-white/5">
            Operational <span className="text-gradient">Insights</span>
         </h1>
         <p className="text-xl text-on-surface-variant font-light mt-4 italic">Understand your transaction velocity, category spread, and institutional footprint.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* PIE CHART / BREAKDOWN PANEL */}
        <div className="lg:col-span-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
           {categories.map((c) => (
              <SurfaceCard key={c.name} className={`p-8 border-white/5 hover:bg-white/5 transition-all group cursor-default relative overflow-hidden`}>
                 <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-6 italic">{c.name}</p>
                 <div className="flex items-end gap-3 mb-6">
                    <span className="text-4xl font-black text-white italic tracking-tighter decoration-primary/20 underline">${c.amount}</span>
                 </div>
                 <div className={`h-1.5 w-full bg-white/5 rounded-full overflow-hidden`}>
                    <div className={`h-full ${c.color.split(' ')[1]} transition-all duration-1000 group-hover:scale-x-105`} style={{width: `${(c.amount / maxAmount) * 100}%`}} />
                 </div>
                 <div className="absolute top-0 right-0 h-24 w-24 bg-white/5 blur-2xl rounded-full" />
              </SurfaceCard>
           ))}
        </div>

        {/* MAIN BAR CHART / INCOME VS EXPENSE */}
        <div className="lg:col-span-8 h-full">
           <SurfaceCard className="glass-surface p-12 h-full border-white/5 relative overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-16">
                 <h2 className="font-display text-2xl font-black text-white italic uppercase underline decoration-primary/20">Spending Velocity</h2>
                 <div className="flex gap-4 text-[10px] font-bold text-on-surface-variant">
                    <span className="text-primary italic">● Income ($12.4k)</span>
                    <span className="text-error italic">● Expense ($8.9k)</span>
                 </div>
              </div>

              {/* Dynamic Bar Chart Placeholder */}
              <div className="flex-1 min-h-[300px] flex items-end justify-between px-6 gap-10">
                 {[ 
                   { m: 'Jan', i: 40, e: 30 },
                   { m: 'Feb', i: 55, e: 45 },
                   { m: 'Mar', i: 70, e: 20 },
                   { m: 'Apr', i: 45, e: 60 },
                   { m: 'May', i: 90, e: 40 },
                   { m: 'Jun', i: 80, e: 55 }
                 ].map((d) => (
                    <div key={d.m} className="flex-1 flex items-end gap-2 group relative">
                       <div className="flex-1 bg-primary/40 rounded-t-lg transition-all duration-700 delay-100 group-hover:bg-primary shadow-premium" style={{height: `${d.i}%`}} />
                       <div className="flex-1 bg-error/40 rounded-t-lg transition-all duration-700 delay-200 group-hover:bg-error shadow-premium" style={{height: `${d.e}%`}} />
                       <p className="absolute bottom-[-35px] left-1/2 -translateX-1/2 text-[10px] font-black uppercase text-on-surface-variant italic opacity-40 group-hover:opacity-100 transition-opacity">{d.m}</p>
                    </div>
                 ))}
                 <div className="absolute left-6 right-6 h-px bg-white/10 bottom-[0px] z-0" />
              </div>
              <div className="absolute bottom-4 right-8 text-[11px] font-bold text-on-surface-variant/20 italic">Data Refresh: 24h</div>
           </SurfaceCard>
        </div>

        {/* SIDE MODULE: TIMELINE / LOGS */}
        <div className="lg:col-span-4 h-full">
           <SurfaceCard className="glass-surface p-10 h-full border-white/5">
              <h2 className="font-display text-xl font-black text-white italic uppercase underline decoration-primary/20 mb-10">Timeline Audit</h2>
              <div className="space-y-6">
                 {[ 
                   { date: 'Apr 12', desc: 'Inflow from Mobile Wallet', amount: '+$1,450', color: 'text-tertiary' },
                   { date: 'Apr 09', desc: 'Outflow to Merchant X', amount: '-$240', color: 'text-error' },
                   { date: 'Apr 04', desc: 'Subscription Renewal', amount: '-$15', color: 'text-error' },
                   { date: 'Mar 31', desc: 'Inflow from Central Hub', amount: '+$4,200', color: 'text-tertiary' }
                 ].map((log, i) => (
                    <div key={i} className="flex justify-between items-center group cursor-pointer hover:translate-x-2 transition-transform">
                       <div>
                          <p className="text-[10px] text-on-surface-variant italic mb-1 uppercase font-bold">{log.date}</p>
                          <p className="text-xs font-black text-white italic underline decoration-white/5">{log.desc}</p>
                       </div>
                       <p className={`text-sm font-black italic ${log.color}`}>{log.amount}</p>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-12 py-3 rounded-xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white transition-all">Download Audit PDF</button>
           </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

export default TransactionInsights
