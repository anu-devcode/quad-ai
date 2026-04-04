import { SurfaceCard } from '../../components/ui'

function TrustStatus() {
  const flags = [
    { title: 'Metadata Mismatch', type: 'Upload Flag', level: 'High', date: '2026-03-24', desc: 'Device signature in SS-9432 does not match historical operator identity.' },
    { title: 'Inconsistent Velocity', type: 'Behavioral Radar', level: 'Medium', date: '2026-02-12', desc: 'Transaction volume in Feb 2026 was 400% higher than your 12-month baseline.' },
    { title: 'Incomplete Audit Trail', type: 'Data Signal', level: 'Low', date: '2026-01-05', desc: 'Missing 3-day window of transaction proof in early January.' }
  ]

  const metrics = [
    { label: 'Data Confidence', value: '98%', status: 'Institutional' },
    { label: 'Fraud Vulnerability', value: 'Minimal', status: 'Protected' },
    { label: 'Signal Strength', value: 'Sub-second', status: 'Real-time' }
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-enter">
      <header className="mb-16">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 italic underline decoration-primary/20">[ Integrity Radar ]</p>
         <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tighter italic uppercase underline decoration-white/5">
            Trust & <span className="text-gradient">Security</span>
         </h1>
         <p className="text-xl text-on-surface-variant font-light mt-4 italic">Monitor the mathematical signals protecting your institutional reputation from fraud and signal noise.</p>
      </header>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* TOP METRICS GRID */}
        <div className="lg:col-span-12 grid gap-8 md:grid-cols-3">
           {metrics.map((m, i) => (
              <SurfaceCard key={i} className="p-10 border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-default group relative overflow-hidden">
                 <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] mb-6 italic opacity-60 underline decoration-primary/20">{m.label}</p>
                 <div className="flex items-center justify-between">
                    <span className="text-5xl font-black text-white italic tracking-tighter decoration-primary/20 underline">{m.value}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic bg-primary/10 px-4 py-1 rounded border border-primary/20">{m.status}</span>
                 </div>
                 <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </SurfaceCard>
           ))}
        </div>

        {/* RISK FLAGS / SUSPICIOUS ACTIVITY */}
        <div className="lg:col-span-8">
           <SurfaceCard className="glass-surface p-14 border-white/5 block min-h-[600px] relative">
              <div className="flex justify-between items-center mb-16">
                 <h2 className="font-display text-2xl font-black text-white italic uppercase underline decoration-primary/20 tracking-tighter">Critical Integrity Flags</h2>
                 <p className="text-[10px] font-bold text-on-surface-variant italic uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full">Global Status: <span className="text-tertiary">Protected 🟢</span></p>
              </div>

              <div className="space-y-10">
                 {flags.map((f, i) => (
                    <div key={i} className="group p-10 rounded-[3rem] bg-white/5 border border-white/5 hover:border-error/20 transition-all cursor-default relative overflow-hidden">
                       <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                          <div className="flex-1">
                             <div className="flex items-center gap-4 mb-6">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded border shadow-premium ${f.level === 'High' ? 'text-error border-error/20 bg-error/10' : 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10'}`}>{f.level} Flag</span>
                                <span className="text-[10px] font-bold text-on-surface-variant italic opacity-40 uppercase tracking-widest">{f.type} Hub</span>
                             </div>
                             <h4 className="text-2xl font-black text-white italic uppercase group-hover:text-primary transition-colors mb-4 underline decoration-white/5">{f.title}</h4>
                             <p className="text-sm text-on-surface-variant italic font-light leading-relaxed max-w-2xl">{f.desc}</p>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                             <p className="text-[10px] text-on-surface-variant font-bold mb-6 italic opacity-40 uppercase tracking-widest">{f.date}</p>
                             <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary hover:text-white transition-all italic shadow-premium">Resolve Proof →</button>
                          </div>
                       </div>
                       <div className="absolute left-0 top-0 h-full w-1.5 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    </div>
                 ))}
                 
                 {flags.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-24 opacity-30 text-center italic">
                       <div className="text-7xl mb-10 animate-bounce">🛡️</div>
                       <p className="text-2xl font-black text-white italic tracking-tighter uppercase underline decoration-primary/20">Operational Integrity is Perfect</p>
                       <p className="text-xs text-on-surface-variant mt-4 font-light">No deviations detected in neural behavioral vectors.</p>
                    </div>
                 )}
              </div>
              <div className="absolute bottom-6 right-10 text-[9px] font-bold text-on-surface-variant/20 italic tracking-widest uppercase">Encryption Mesh: Sub-zero Status</div>
           </SurfaceCard>
        </div>

        {/* PROTECTION HUD SIDEBAR */}
        <div className="lg:col-span-4 space-y-12">
           <SurfaceCard className="glass-surface p-12 h-full border-white/5 bg-surface-container-high/40 text-center relative overflow-hidden group">
              <div className="text-6xl mb-10 group-hover:scale-110 transition-transform duration-1000 decoration-primary/20 underline opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100">🛡️</div>
              <h2 className="font-display text-xl font-black text-white italic uppercase underline decoration-primary/20 mb-12 tracking-tighter">Data Sovereignty Hub</h2>
              
              <div className="space-y-8 text-left relative z-10">
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group/it">
                    <p className="text-[10px] font-black text-white group-hover/it:text-primary transition-colors underline decoration-white/10 uppercase italic mb-4 tracking-widest">Audit Transparency Layer</p>
                    <p className="text-[10px] text-on-surface-variant font-light italic leading-relaxed">Toggle institutional audit logs for third-party inference validation during credit events.</p>
                    <div className="mt-6 flex justify-end">
                       <div className="h-7 w-14 rounded-full bg-primary/10 border border-primary/20 p-1 cursor-pointer">
                          <div className="h-5 w-5 rounded-full bg-primary shadow-premium" />
                       </div>
                    </div>
                 </div>

                 <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group/mask">
                    <p className="text-[10px] font-black text-white group-hover/mask:text-primary transition-colors underline decoration-white/10 uppercase italic mb-4 tracking-widest">Neural Masking Hub</p>
                    <p className="text-[10px] text-on-surface-variant font-light italic leading-relaxed">Protect merchant identities from direct extraction while maintaining signal depth.</p>
                    <div className="mt-6 flex justify-end">
                       <div className="h-7 w-14 rounded-full bg-white/10 border border-white/5 p-1 cursor-pointer">
                          <div className="h-5 w-5 bg-white/10 border border-white/20 rounded-full translate-x-7" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-16 pt-12 border-t border-white/5 relative z-10">
                 <p className="text-[10px] font-black uppercase text-on-surface-variant mb-8 italic opacity-40 tracking-[0.3em] underline decoration-white/5">System Integrity Status</p>
                 <button className="w-full py-5 rounded-2xl border border-primary/40 bg-primary/5 text-primary text-[11px] font-black uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all italic shadow-premium">Download Cyber Audit Trail</button>
              </div>
              <div className="absolute top-[-20%] right-[-20%] h-80 w-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
           </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

export default TrustStatus
