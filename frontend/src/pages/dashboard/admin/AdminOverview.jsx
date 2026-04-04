import { SurfaceCard } from '../../../components/ui'

function AdminOverview() {
  const kpis = [
    { label: 'Total Network Nodes', value: '1,245,932', delta: '+12.4%', status: 'Growing' },
    { label: 'Active Edge Users', value: '842,105', delta: '+8.2%', status: 'Peak' },
    { label: 'Avg Network Score', value: '715', delta: '-15 pts', status: 'Recalibrating' },
    { label: 'System Fraud Rate', value: '0.042%', delta: '-0.005%', status: 'Secured' }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="mb-16">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 italic underline decoration-primary/20">[ Global Control Center ]</p>
         <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tighter italic uppercase underline decoration-white/5">
            System <span className="text-gradient">KPIs</span>
         </h1>
         <p className="text-xl text-on-surface-variant font-light mt-4 italic">Monitor global network health, operational velocity, and institutional fraud resilience.</p>
      </header>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
         {kpis.map((kpi, i) => (
            <SurfaceCard key={i} className={`p-10 border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-default relative overflow-hidden group animate-slide-up stagger-${i+1}`}>
               <div className="relative z-10 flex flex-col justify-between h-full">
                  <div className="flex justify-between items-start mb-10">
                     <span className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] italic opacity-60 underline decoration-primary/20">{kpi.label}</span>
                     <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${kpi.status === 'Secured' || kpi.status === 'Growing' ? 'text-tertiary border-tertiary/20 bg-tertiary/10' : 'text-primary border-primary/20 bg-primary/10'}`}>{kpi.status}</span>
                  </div>
                  <p className="text-5xl font-black text-white italic tracking-tighter decoration-primary/20 underline mb-4">{kpi.value}</p>
                  <div className="flex items-center gap-2 text-xs font-black italic text-on-surface-variant grayscale group-hover:grayscale-0 transition-opacity">
                     <span className={kpi.delta.startsWith('+') ? 'text-tertiary' : 'text-error'}>{kpi.delta}</span>
                     <span>vs Prior 30d</span>
                  </div>
               </div>
               <div className="absolute top-0 right-0 h-48 w-48 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </SurfaceCard>
         ))}
      </div>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* NETWORK ACTIVITY BAR CHART */}
        <div className="lg:col-span-8">
           <SurfaceCard className="glass-surface p-14 h-full border-white/5 relative overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-20">
                 <h2 className="font-display text-2xl font-black text-white italic uppercase underline decoration-primary/20 tracking-tighter">Operational Velocity Hub</h2>
                 <div className="flex gap-4 text-[10px] font-bold text-on-surface-variant italic opacity-60">
                    <span>● Total Ingestions (12M)</span>
                    <span className="text-primary italic">● Verified Scores (8.4M)</span>
                 </div>
              </div>

              {/* Dynamic Velocity Graph */}
              <div className="flex-1 min-h-[350px] flex items-end justify-between px-10 gap-10">
                 {[40, 60, 55, 80, 70, 95, 45, 110, 130, 90, 85, 120].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-2xl relative group transition-all hover:bg-primary/20 cursor-help">
                       <div className="absolute bottom-0 w-full bg-primary/40 rounded-t-2xl transition-all duration-1000 delay-[i*40ms] group-hover:bg-primary shadow-premium" style={{height: `${h/1.5}%`}} />
                       <div className="absolute top-[-40px] left-1/2 -translateX-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] px-3 py-1 rounded-lg font-black italic whitespace-nowrap shadow-premium">{(h * 12.4).toFixed(1)}k Nodes</div>
                    </div>
                 ))}
                 <div className="absolute left-6 right-6 h-px bg-white/10 bottom-[0px] z-0" />
              </div>
              <div className="mt-12 flex justify-between px-10 text-[11px] font-black uppercase tracking-widest text-on-surface-variant opacity-40 italic">
                 <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:59</span>
              </div>
           </SurfaceCard>
        </div>

        {/* RECENT ALERTS PANEL */}
        <div className="lg:col-span-4 h-full">
           <SurfaceCard className="glass-surface p-12 h-full border-white/5 bg-surface-container-high/40">
              <h2 className="font-display text-xl font-black text-white italic uppercase underline decoration-primary/20 mb-12">Critical Operations</h2>
              <div className="space-y-10">
                 {[ 
                   { title: 'Neural Model Recalibration', time: '12m ago', desc: 'Auto-adjustment of trust weight vectors for M-Pesa patterns.' },
                   { title: 'Edge Cluster Expansion', time: '4h ago', desc: 'Deployed 12 new inference nodes in East Africa Region.' },
                   { title: 'Data Integrity Sweep', time: '1d ago', desc: 'Validated 1.2M historical score snapshots against latest risk matrix.' }
                 ].map((log, i) => (
                    <div key={i} className="group cursor-pointer hover:translate-x-3 transition-transform">
                       <div className="flex justify-between items-center mb-4">
                          <p className="text-[10px] text-primary font-black uppercase tracking-widest italic">{log.time}</p>
                          <span className="text-[8px] bg-white/5 px-2 py-0.5 rounded border border-white/10 uppercase font-bold text-on-surface-variant italic">Operational 🟢</span>
                       </div>
                       <h4 className="text-sm font-black text-white italic uppercase group-hover:text-primary transition-colors underline decoration-white/5 mb-2">{log.title}</h4>
                       <p className="text-[10px] text-on-surface-variant font-light italic leading-relaxed">{log.desc}</p>
                    </div>
                 ))}
              </div>
              <button className="w-full mt-20 py-4 rounded-2xl border border-primary/20 text-primary text-[11px] font-black uppercase tracking-[0.2em] italic hover:bg-primary/5 transition-all shadow-premium ring-1 ring-white/5">Global Control Audit Hub</button>
           </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

export default AdminOverview
