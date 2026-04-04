import { useAuth } from '../../context/AuthContext'
import { useVerification } from '../../context/VerificationContext'
import { SurfaceCard } from '../../components/ui'
import { useMemo } from 'react'

function DashboardHome() {
  const { user } = useAuth()
  const { getUserVerificationLayer } = useVerification()
  
  const verification = useMemo(() => 
    getUserVerificationLayer(user?.phone || ''), 
    [getUserVerificationLayer, user?.phone]
  )

  // Calculate dynamic scores based on base + verification boost
  const baseScore = 715
  const score = Math.min(850, baseScore + (verification.approved * 15))
  const trustScore = Math.min(100, 78 + verification.trustBoost)
  const confidence = Math.min(99, 88 + verification.confidenceBoost)
  
  const riskLevel = verification.rejected > 0 ? 'Elevated' : 'Minimal'

  return (
    <div className="space-y-10 animate-enter">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 sm:mb-12">
        <div>
           <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 sm:mb-4 italic underline decoration-primary/20">[ Operational Hub ]</p>
           <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-none italic uppercase underline decoration-white/5">
              System <span className="text-gradient">Integrity</span>
           </h1>
           <p className="text-sm sm:text-xl text-on-surface-variant font-light mt-3 sm:mt-4 italic">Operator: <span className="text-white font-black">{user?.name}</span>. Signal synchronisation active.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <SurfaceCard className="p-4 sm:p-6 bg-white/5 border-white/5 text-center px-6 sm:px-10 relative overflow-hidden group flex-1 md:flex-initial">
              <p className="text-[10px] uppercase text-on-surface-variant mb-2 font-black italic tracking-widest relative z-10">Trust Index</p>
              <p className="text-3xl font-black text-tertiary italic relative z-10">{trustScore}%</p>
              <div className="absolute inset-0 bg-tertiary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           </SurfaceCard>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Score Gauge Section */}
        <div className="lg:col-span-4 lg:row-span-2">
           <SurfaceCard className="glass-surface p-8 sm:p-12 flex flex-col items-center justify-center text-center border-white/5 relative overflow-hidden h-full group">
              <div className="relative h-48 w-48 sm:h-72 sm:w-72 mb-8 sm:mb-12 group">
                 {/* Circular Gauge SVG */}
                 <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="6" 
                            strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * score) / 850} 
                            strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out" />
                 </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-1 sm:translate-y-2">
                    <p className="text-5xl sm:text-7xl font-black text-white italic tracking-tighter decoration-primary/20 underline">{score}</p>
                    <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant italic mt-1 sm:mt-2">Operational Score</p>
                  </div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 sm:p-6 w-full text-left space-y-1 sm:space-y-2">
                 <div className="flex justify-between items-center">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-primary italic">Status: Verified Tier</p>
                    <span className="text-[8px] sm:text-[10px] text-tertiary font-bold italic">+{verification.trustBoost}% Boost</span>
                 </div>
                 <p className="text-[10px] sm:text-xs text-on-surface-variant italic leading-relaxed">Your score reflects <span className="text-white font-bold">{verification.approved}</span> approved institutional evidentiary layers.</p>
              </div>
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-3xl rounded-full opacity-50" />
           </SurfaceCard>
        </div>

        {/* METRICS & TRENDS */}
        <div className="lg:col-span-8 grid gap-8 md:grid-cols-2">
            <SurfaceCard className="p-10 border-white/5 bg-white/5 hover:bg-white/10 transition-all group overflow-hidden relative">
               <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-6 italic opacity-50 underline decoration-primary/20">Data Confidence</p>
               <div className="flex items-end gap-3 mb-6">
                  <span className="text-5xl font-black text-white italic tracking-tighter">{confidence}%</span>
                  <span className="text-xs text-tertiary mb-2 font-black italic uppercase tracking-widest">Signal Hub Active ✅</span>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary transition-all duration-1000" style={{width: `${confidence}%`}} />
               </div>
               <div className="absolute top-0 right-0 h-32 w-32 bg-tertiary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </SurfaceCard>

            <SurfaceCard className="p-10 border-white/5 bg-white/5 hover:bg-white/10 transition-all group overflow-hidden relative">
               <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-6 italic opacity-50 underline decoration-primary/20">Risk Matrix</p>
               <div className="flex items-end gap-3 mb-6">
                  <span className={`text-5xl font-black italic tracking-tighter ${riskLevel === 'Minimal' ? 'text-tertiary' : 'text-error'}`}>{riskLevel}</span>
                  <span className="text-xs text-on-surface-variant mb-2 font-black italic uppercase tracking-widest">Institutional 🛡️</span>
               </div>
               <div className="flex gap-2 h-4 items-end">
                  {[15, 30, 20, 45, 12, 18, 25, 40, 10, 35].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/10 rounded-t-sm group-hover:bg-primary/20 transition-all" style={{height: `${h}%`}} />
                  ))}
               </div>
               <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </SurfaceCard>

            <SurfaceCard className="md:col-span-2 glass-surface p-8 sm:p-12 border-white/5 relative overflow-hidden">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10">
                  <h3 className="font-display text-lg sm:text-2xl font-black text-white uppercase italic underline decoration-primary/20 tracking-tighter">Credential Verification Hub</h3>
                  <div className="flex gap-4 sm:gap-6 text-[8px] sm:text-[10px] font-black uppercase tracking-widest italic opacity-40">
                     <span>Approved: <span className="text-tertiary">{verification.approved}</span></span>
                     <span>Pending: <span className="text-primary">{verification.pending}</span></span>
                  </div>
               </div>
               
               <div className="grid gap-4 sm:grid-gap-6 grid-cols-1 sm:grid-cols-3">
                  {[
                    { label: 'Telebirr Sync', status: 'Continuous', color: 'text-tertiary' },
                    { label: 'CBE Statement', status: verification.approved > 0 ? 'Verified' : 'Required', color: verification.approved > 0 ? 'text-tertiary' : 'text-primary' },
                    { label: 'Identity Proof', status: 'Sovereign', color: 'text-tertiary' }
                  ].map((item, i) => (
                    <div key={i} className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all text-center">
                       <p className="text-[8px] sm:text-[10px] font-black text-on-surface-variant uppercase italic mb-2 sm:mb-3 opacity-40">{item.label}</p>
                       <p className={`text-xs sm:text-sm font-black italic uppercase italic tracking-widest ${item.color}`}>{item.status}</p>
                    </div>
                  ))}
               </div>
               
               <div className="absolute bottom-[-20px] left-[-20px] h-40 w-40 bg-primary/5 blur-3xl" />
            </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

export default DashboardHome
