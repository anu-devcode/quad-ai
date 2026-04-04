import { useAuth } from '../../context/AuthContext'
import { SurfaceCard } from '../../components/ui'

function DashboardHome() {
  const { user } = useAuth()
  
  const score = 742
  const trustScore = 85
  const confidence = 98
  const riskLevel = 'Low'

  return (
    <div className="space-y-10 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12 animate-slide-up">
        <div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-4 italic">[ Smart Overview ]</p>
           <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-none italic uppercase">
              Operational <span className="text-gradient">Integrity</span>
           </h1>
           <p className="text-on-surface-variant font-light mt-4 italic">Welcome, {user?.name}. Your financial trust is evolving.</p>
        </div>
        <div className="flex gap-4">
           <SurfaceCard className="p-6 bg-white/5 border-white/5 text-center px-10">
              <p className="text-[10px] uppercase text-on-surface-variant mb-2 font-black italic tracking-widest">Trust Index</p>
              <p className="text-3xl font-black text-tertiary italic">{trustScore}%</p>
           </SurfaceCard>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Score Gauge Section */}
        <div className="lg:col-span-4 translate-y-[-20px] animate-slide-up stagger-1">
           <SurfaceCard className="glass-surface p-10 flex flex-col items-center justify-center text-center border-white/5 relative overflow-hidden h-full group hover:shadow-premium transition-all">
              <div className="relative h-64 w-64 mb-10 group">
                 {/* Circular Gauge SVG */}
                 <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-white/5" />
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="8" 
                            strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * score) / 1000} 
                            strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(99,102,241,0.5)]" />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-6xl font-black text-white italic tracking-tighter">{score}</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic">Credit Score</p>
                 </div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 w-full">
                 <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Status: High Trust</p>
                 <p className="text-xs text-on-surface-variant italic">Top 12% of operators in your region.</p>
              </div>
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-3xl rounded-full" />
           </SurfaceCard>
        </div>

        {/* METRICS & TRENDS */}
        <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <SurfaceCard className="p-6 bg-white/5 border-white/5 animate-slide-up stagger-2 hover:bg-white/10 transition-colors">
                 <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-4 italic">Data Confidence</p>
                 <div className="flex items-end gap-2 mb-4">
                    <span className="text-4xl font-black text-white italic">{confidence}%</span>
                    <span className="text-xs text-tertiary mb-1">High ✅</span>
                 </div>
                 <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary w-[98%] animate-shimmer" />
                 </div>
              </SurfaceCard>

              <SurfaceCard className="p-6 bg-white/5 border-white/5 animate-slide-up stagger-3 hover:bg-white/10 transition-colors">
                 <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-4 italic">Risk Profile</p>
                 <div className="flex items-end gap-2 mb-4">
                    <span className="text-4xl font-black text-white italic">{riskLevel}</span>
                    <span className="text-xs text-tertiary mb-1">Minimal 🛡️</span>
                 </div>
                 <div className="flex gap-1 h-3 mt-auto">
                    {[10, 30, 20, 15, 5, 8, 12, 6].map((h, i) => <div key={i} className="flex-1 bg-tertiary/20 rounded-t-sm" style={{height: `${h}%`}} />)}
                 </div>
              </SurfaceCard>

              <SurfaceCard className="p-6 bg-primary/20 border-primary/20 sm:col-span-2 lg:col-span-1 animate-slide-up stagger-4 hover:shadow-premium transition-all">
                 <p className="text-[10px] uppercase font-black tracking-widest text-primary mb-4 italic">Action Items</p>
                 <div className="space-y-3">
                    <div className="text-[11px] font-bold text-white flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Upload March SMS Proof
                    </div>
                    <div className="text-[11px] font-bold text-white flex items-center gap-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-primary" /> Verify Account Age
                    </div>
                 </div>
                 <button className="w-full mt-6 py-2 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all">Go To Action Hub</button>
              </SurfaceCard>
            </div>

           {/* Trend Graph Placeholder */}
           <SurfaceCard className="flex-1 glass-surface p-10 border-white/5">
              <div className="flex justify-between items-center mb-10">
                 <h3 className="font-display text-xl font-black text-white uppercase italic underline decoration-primary/20">Evidence Evolution</h3>
                 <div className="flex gap-4 text-[10px] font-bold text-on-surface-variant">
                    <span className="text-primary italic">● This Year</span>
                    <span className="italic">● Industry Avg</span>
                 </div>
              </div>
              <div className="h-48 w-full relative flex items-end justify-between gap-6 px-4">
                 {[40, 25, 45, 60, 35, 70, 50, 85, 90, 65, 75, 100].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/5 rounded-t-lg relative group transition-all hover:bg-primary/20">
                       <div className="absolute bottom-0 w-full bg-primary/40 rounded-t-lg transition-all duration-1000 delay-[i*50ms]" style={{height: `${h}%`}} />
                       <div className="absolute top-[-25px] left-1/2 -translateX-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white text-[10px] px-2 py-1 rounded">{(score - 100) + h}</div>
                    </div>
                 ))}
                 <div className="absolute inset-0 border-b border-white/5" />
              </div>
              <div className="mt-8 flex justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40 italic">
                 <span>Jan</span><span>Apr</span><span>Jul</span><span>Oct</span><span>Dec</span>
              </div>
           </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
