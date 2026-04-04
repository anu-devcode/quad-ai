import { useState } from 'react'
import { SurfaceCard } from '../../../components/ui'

function FraudMonitoring() {
  const [flags, setFlags] = useState([
    { id: 'USR-9432', user: 'Hagos T.', risk: 842, reason: 'Metadata Mismatch', status: 'Pending', date: '2026-03-24' },
    { id: 'USR-1022', user: 'Selam A.', risk: 615, reason: 'Velocity Inconsistency', status: 'Review', date: '2026-03-22' },
    { id: 'USR-0045', user: 'Desta B.', risk: 285, reason: 'Altered Evidence Proof', status: 'Flagged', date: '2026-03-21' },
    { id: 'USR-8821', user: 'Kifle M.', risk: 910, reason: 'Synthetic Identity Signal', status: 'Critical', date: '2026-03-20' }
  ])

  const handleAction = (id, action) => {
     setFlags(prev => prev.map(f => f.id === id ? { ...f, status: action } : f))
  }

  const getStatusColor = (status) => {
    switch (status) {
       case 'Review': return 'text-primary border-primary/20 bg-primary/10'
       case 'Pending': return 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10'
       case 'Critical':
       case 'Flagged': return 'text-error border-error/20 bg-error/10'
       case 'Approved': return 'text-tertiary border-tertiary/20 bg-tertiary/10'
       default: return 'text-on-surface-variant border-white/5 bg-white/5'
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="mb-16">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-error mb-6 italic underline decoration-error/20">[ Forensic Watch ]</p>
         <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tighter italic uppercase underline decoration-white/5">
            Fraud <span className="text-gradient">Monitoring</span>
         </h1>
         <p className="text-xl text-on-surface-variant font-light mt-4 italic">Identify, isolate, and neutralize neural evidence tampering across the global node network.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* RISK DISTRIBUTION BAR */}
        <div className="lg:col-span-12 grid gap-6 md:grid-cols-3">
           <SurfaceCard className="p-10 border-white/5 bg-white/5 flex flex-col items-center text-center group transition-all hover:bg-error/5 hover:border-error/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic mb-6 opacity-40">Critical Threats</span>
              <p className="text-6xl font-black text-error italic tracking-tighter decoration-error/10 underline mb-4">12</p>
              <p className="text-xs text-on-surface-variant font-light italic">Currently isolated in regional sandboxes.</p>
           </SurfaceCard>

           <SurfaceCard className="p-10 border-white/5 bg-white/5 flex flex-col items-center text-center group transition-all hover:bg-primary/5 hover:border-primary/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic mb-6 opacity-40">Review Backlog</span>
              <p className="text-6xl font-black text-primary italic tracking-tighter decoration-primary/10 underline mb-4">84</p>
              <p className="text-xs text-on-surface-variant font-light italic">Average resolution latency: 14.2 min.</p>
           </SurfaceCard>

           <SurfaceCard className="p-10 border-white/5 bg-white/5 flex flex-col items-center text-center group transition-all hover:bg-tertiary/5 hover:border-tertiary/20">
              <span className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic mb-6 opacity-40">Neutralized</span>
              <p className="text-6xl font-black text-tertiary italic tracking-tighter decoration-tertiary/10 underline mb-4">1.2k</p>
              <p className="text-xs text-on-surface-variant font-light italic">Last 24 hours of system protection.</p>
           </SurfaceCard>
        </div>

        {/* FRAUD TABLE */}
        <div className="lg:col-span-12">
           <SurfaceCard className="glass-surface border-white/5 overflow-hidden">
              <div className="flex justify-between items-center p-12 border-b border-white/5 bg-white/5">
                 <h2 className="font-display text-2xl font-black text-white italic uppercase underline decoration-error/20">Operational Threat Radar</h2>
                 <div className="flex gap-4">
                    <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline italic">Export Forensic Logs →</button>
                 </div>
              </div>

              <div className="overflow-x-auto p-8">
                 <table className="w-full text-left">
                    <thead className="text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant italic">
                       <tr className="border-b border-white/5 bg-white/5">
                          <th className="px-8 py-6">Operator node</th>
                          <th className="px-8 py-6">Risk Factor</th>
                          <th className="px-8 py-6">Radar Signal</th>
                          <th className="px-8 py-6">Status Hub</th>
                          <th className="px-8 py-6 text-right">Control Actions</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {flags.map((f) => (
                          <tr key={f.id} className="group hover:bg-error/5 transition-colors cursor-pointer">
                             <td className="px-8 py-10">
                                <p className="text-sm font-black text-white italic uppercase tracking-tighter">{f.user}</p>
                                <p className="text-[10px] text-on-surface-variant italic">{f.id} / {f.date}</p>
                             </td>
                             <td className="px-8 py-10 font-mono text-xl font-black text-white italic tracking-tighter">
                                <span className={f.risk > 700 ? 'text-error' : f.risk > 500 ? 'text-yellow-400' : 'text-primary'}>{f.risk}</span>
                                <span className="text-[8px] ml-1 opacity-20">/ 1000</span>
                             </td>
                             <td className="px-8 py-10 text-xs font-black text-on-surface-variant italic uppercase decoration-white/5 underline decoration-primary/20">{f.reason}</td>
                             <td className="px-8 py-10">
                                <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase italic shadow-premium tracking-widest ${getStatusColor(f.status)}`}>{f.status}</span>
                             </td>
                             <td className="px-8 py-10 text-right space-x-3">
                                <button onClick={() => handleAction(f.id, 'Suspicious')} className="text-[10px] font-black text-primary hover:underline italic uppercase">Suspicious</button>
                                <button onClick={() => handleAction(f.id, 'Reject')} className="text-[10px] font-black text-error hover:underline italic uppercase">Reject</button>
                                <button onClick={() => handleAction(f.id, 'Approved')} className="text-[10px] font-black text-tertiary hover:underline italic uppercase">Approve</button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

export default FraudMonitoring
