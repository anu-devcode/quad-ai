import { SurfaceCard, TokenPill } from '../../components/ui'
import { userTransactions } from '../../data/mockData'

function txPill(status) {
  if (status === 'Completed') return 'good'
  if (status === 'Pending') return 'warn'
  return 'neutral'
}

function amountText(amount) {
  const sign = amount > 0 ? '+' : '-'
  return `${sign}$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function DashboardHistory() {
  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-enter">
      <header className="mb-16">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 italic underline decoration-primary/20">[ Operational Ledger ]</p>
         <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tighter italic uppercase underline decoration-white/5">
            Integrity <span className="text-gradient">Timeline</span>
         </h1>
         <p className="text-xl text-on-surface-variant font-light mt-4 italic">Mathematical history of all sovereign transactions and audit signals.</p>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* FILTERS PANEL */}
        <div className="lg:col-span-12 flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
           {['All Timeline', 'Institutional', 'Utilities', 'Transfers', 'Merchant Hubs'].map((f, i) => (
              <button key={i} className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all whitespace-nowrap border ${i === 0 ? 'bg-primary border-primary text-white shadow-premium' : 'bg-white/5 border-white/5 text-on-surface-variant hover:bg-white/10 hover:text-white'}`}>
                 {f}
              </button>
           ))}
        </div>

        {/* LEDGER TABLE */}
        <div className="lg:col-span-12">
           <SurfaceCard className="glass-surface border-white/5 overflow-hidden">
              <div className="flex justify-between items-center p-10 border-b border-white/5 bg-white/5">
                 <h2 className="font-display text-2xl font-black text-white italic uppercase underline decoration-primary/20">System Records</h2>
                 <div className="flex gap-4">
                    <button className="text-[10px] font-black text-primary hover:underline italic uppercase tracking-widest">Download Full CSV Audit →</button>
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant italic">
                       <tr>
                          <th className="px-10 py-6">Operational Date</th>
                          <th className="px-10 py-6">Entity / Node</th>
                          <th className="px-10 py-6">Category</th>
                          <th className="px-10 py-6 text-right">Credit Value</th>
                          <th className="px-10 py-6 text-center">Protocol</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                       {userTransactions.map((tx) => (
                          <tr key={tx.id} className="group hover:bg-white/5 transition-all cursor-pointer">
                             <td className="px-10 py-8">
                                <p className="text-[10px] font-black text-on-surface-variant italic opacity-60 mb-1">{tx.age}</p>
                                <p className="text-xs font-bold text-white italic">2026-03-{(Math.floor(Math.random() * 20) + 10)}</p>
                             </td>
                             <td className="px-10 py-8">
                                <p className="text-sm font-black text-white italic uppercase tracking-tight group-hover:text-primary transition-colors">{tx.merchant}</p>
                                <p className="text-[10px] text-on-surface-variant font-light italic mt-1 leading-none tracking-widest opacity-40">TX-ID: {tx.id}</p>
                             </td>
                             <td className="px-10 py-8">
                                <span className="px-3 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-on-surface-variant uppercase italic tracking-widest">{tx.category}</span>
                             </td>
                             <td className="px-10 py-8 text-right">
                                <p className={`text-xl font-black italic tracking-tighter ${tx.amount > 0 ? 'text-tertiary' : 'text-white underline decoration-white/5'}`}>{amountText(tx.amount)}</p>
                             </td>
                             <td className="px-10 py-8 text-center">
                                <TokenPill tone={txPill(tx.status)}>{tx.status}</TokenPill>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
              
              <div className="p-10 border-t border-white/5 bg-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
                 <p className="text-[10px] font-black text-on-surface-variant italic opacity-40 uppercase tracking-[0.2em]">Showing Last 24 Operational Entries</p>
                 <div className="flex gap-4">
                    <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white transition-all">←</button>
                    <button className="h-10 w-10 rounded-xl bg-primary border border-primary text-white flex items-center justify-center shadow-premium">1</button>
                    <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white transition-all">2</button>
                    <button className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-on-surface-variant hover:text-white transition-all">→</button>
                 </div>
              </div>
           </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

export default DashboardHistory
