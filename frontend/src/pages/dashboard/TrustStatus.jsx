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
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="mb-16">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 italic underline decoration-primary/20">[ Integrity Radar ]</p>
         <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tighter italic uppercase underline decoration-white/5">
            Trust & <span className="text-gradient">Security</span>
         </h1>
         <p className="text-xl text-on-surface-variant font-light mt-4 italic">Monitor the mathematical signals protecting your institutional reputation from fraud and signal noise.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* TOP METRICS GRID */}
        <div className="lg:col-span-12 grid gap-6 md:grid-cols-3">
           {metrics.map((m, i) => (
              <SurfaceCard key={i} className="p-8 border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-default">
                 <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] mb-4 italic opacity-60">{m.label}</p>
                 <div className="flex items-center justify-between">
                    <span className="text-4xl font-black text-white italic tracking-tighter decoration-primary/20 underline">{m.value}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic bg-primary/10 px-3 py-1 rounded border border-primary/20">{m.status}</span>
                 </div>
              </SurfaceCard>
           ))}
        </div>

        {/* RISK FLAGS / SUSPICIOUS ACTIVITY */}
        <div className="lg:col-span-8">
           <SurfaceCard className="glass-surface p-12 border-white/5 block min-h-[500px]">
              <div className="flex justify-between items-center mb-12">
                 <h2 className="font-display text-2xl font-black text-white italic uppercase underline decoration-primary/20">Critical Integrity Flags</h2>
                 <p className="text-[10px] font-bold text-on-surface-variant italic uppercase tracking-widest">Global Status: <span className="text-tertiary">Protected 🟢</span></p>
              </div>

              <div className="space-y-8">
                 {flags.map((f, i) => (
                    <div key={i} className="group p-8 rounded-[2rem] bg-white/5 border border-white/5 hover:border-error/20 transition-all cursor-default relative overflow-hidden">
                       <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          <div className="flex-1">
                             <div className="flex items-center gap-3 mb-3">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${f.level === 'High' ? 'text-error border-error/20 bg-error/10' : 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10'}`}>{f.level} Flag</span>
                                <span className="text-[10px] font-bold text-on-surface-variant italic opacity-40">{f.type}</span>
                             </div>
                             <h4 className="text-xl font-black text-white italic uppercase group-hover:text-primary transition-colors mb-2">{f.title}</h4>
                             <p className="text-xs text-on-surface-variant italic font-light leading-relaxed max-w-xl">{f.desc}</p>
                          </div>
                          <div className="flex flex-col items-end">
                             <p className="text-[10px] text-on-surface-variant font-bold mb-4 italic">{f.date}</p>
                             <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline italic">Resolve Proof →</button>
                          </div>
                       </div>
                       <div className="absolute left-0 top-0 h-full w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                    </div>
                 ))}
                 
                 {flags.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-20 opacity-20 text-center italic">
                       <div className="text-6xl mb-6">🛡️</div>
                       <p className="text-xl font-black text-white italic">Operational Integrity is Perfect</p>
                    </div>
                 )}
              </div>
           </SurfaceCard>
        </div>

        {/* PROTECTION HUD SIDEBAR */}
        <div className="lg:col-span-4 space-y-8 h-full">
           <SurfaceCard className="glass-surface p-10 h-full border-white/5 bg-surface-container-high/40 text-center">
              <div className="text-5xl mb-8 group-hover:scale-110 transition-transform duration-700 decoration-primary/20 underline opacity-30 grayscale group-hover:grayscale-0 group-hover:opacity-100">🛡️</div>
              <h2 className="font-display text-xl font-black text-white italic uppercase underline decoration-primary/20 mb-10">Data Sovereignty Control</h2>
              
              <div className="space-y-6 text-left">
                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                    <p className="text-[10px] font-black text-white group-hover:text-primary transition-colors underline decoration-white/10 uppercase italic mb-3">Audit Transparency Layer</p>
                    <p className="text-[10px] text-on-surface-variant font-light italic leading-relaxed">Toggle real-time audit logs for third-party inference validation during credit events.</p>
                    <div className="mt-4 flex justify-end">
                       <div className="h-6 w-12 rounded-full bg-primary/20 p-1 cursor-pointer">
                          <div className="h-4 w-4 rounded-full bg-primary" />
                       </div>
                    </div>
                 </div>

                 <div className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                    <p className="text-[10px] font-black text-white group-hover:text-primary transition-colors underline decoration-white/10 uppercase italic mb-3">Neural Masking Hub</p>
                    <p className="text-[10px] text-on-surface-variant font-light italic leading-relaxed">Protect merchant data from direct extraction while maintaining institutional signal depth.</p>
                    <div className="mt-4 flex justify-end">
                       <div className="h-6 w-12 rounded-full bg-primary/20 p-1 cursor-pointer">
                          <div className="h-4 w-4 bg-primary/20 border border-primary/40 rounded-full translate-x-6" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-12 pt-10 border-t border-white/5">
                 <p className="text-[10px] font-black uppercase text-on-surface-variant mb-6 italic opacity-40">System Integrity</p>
                 <button className="w-full py-4 rounded-xl border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/5 transition-all">Download Cyber Audit Hub</button>
              </div>
           </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

export default TrustStatus
