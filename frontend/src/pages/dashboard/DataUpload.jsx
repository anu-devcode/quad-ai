import { useState } from 'react'
import { SurfaceCard, PremiumButton } from '../../components/ui'

function DataUpload() {
  const [step, setStep] = useState('upload') // upload, processing, review
  const [fileName, setFileName] = useState(null)
  
  const [extractedData, setExtractedData] = useState([
    { id: 1, date: '2026-03-01', merchant: 'M-Pesa Paybill', amount: '2500.00', category: 'Utilities' },
    { id: 2, date: '2026-03-05', merchant: 'Total Energies', amount: '450.00', category: 'Fuel' },
    { id: 3, date: '2026-03-12', merchant: 'Supermarket', amount: '120.50', category: 'Groceries' }
  ])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) {
       setFileName(file.name)
       setStep('processing')
       setTimeout(() => setStep('review'), 2500)
    }
  }

  const handleEdit = (id, field, value) => {
     setExtractedData(prev => prev.map(row => 
        row.id === id ? { ...row, [field]: value } : row
     ))
  }

  const handleApprove = () => {
     alert('Data synchronized to your Hub Profile.')
     setStep('upload')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="mb-16">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 italic underline decoration-primary/20">[ Evidence Ingestion ]</p>
         <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tighter italic uppercase underline decoration-white/5">
            Sync <span className="text-gradient">Evidence</span>
         </h1>
         <p className="text-xl text-on-surface-variant font-light mt-4 italic">Feed the inference engine with transaction proofs, SMS history, or PDF statements.</p>
      </header>

      {step === 'upload' && (
         <div className="grid gap-8 md:grid-cols-2">
            <label className="group relative block aspect-[16/10] rounded-[3rem] bg-surface-container-low border-2 border-dashed border-white/10 hover:border-primary transition-all cursor-pointer overflow-hidden p-12 flex flex-col items-center justify-center text-center">
               <input type="file" className="hidden" onChange={handleFile} />
               <div className="text-6xl mb-8 group-hover:scale-110 transition-transform group-hover:rotate-6">📄</div>
               <p className="text-xl font-black text-white uppercase tracking-widest italic mb-2">Drop Evidence</p>
               <p className="text-xs text-on-surface-variant italic">Screenshots, PDFs, or Transaction SMS</p>
               <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </label>

            <div className="space-y-6">
               {[
                  { title: 'Mobile Wallet Screenshot', icon: '📱', desc: 'Sync screenshots from M-Pesa, Telebirr, or CBE app.' },
                  { title: 'Operator SMS History', icon: '💬', desc: 'Ingest raw transaction payloads for deeper verification.' },
                  { title: 'Financial Statements', icon: '🏦', desc: 'Upload 3-month PDF statements for institutional trust.' }
               ].map((item, i) => (
                  <SurfaceCard key={i} className="p-6 bg-white/5 border-white/5 hover:bg-white/10 transition-colors group cursor-pointer">
                     <div className="flex items-center gap-6">
                        <div className="text-4xl grayscale group-hover:grayscale-0 transition-all">{item.icon}</div>
                        <div>
                           <h4 className="text-sm font-black text-white uppercase italic tracking-widest">{item.title}</h4>
                           <p className="text-[10px] text-on-surface-variant italic mt-1 font-light">{item.desc}</p>
                        </div>
                        <span className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
                     </div>
                  </SurfaceCard>
               ))}
            </div>
         </div>
      )}

      {step === 'processing' && (
         <SurfaceCard className="glass-surface p-24 flex flex-col items-center justify-center text-center border-white/5 h-[400px]">
            <div className="relative mb-12">
               <div className="h-32 w-32 rounded-[2rem] border-4 border-primary/20 border-t-primary animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center text-primary font-black italic">AI</div>
            </div>
            <h2 className="text-3xl font-display font-black text-white mb-6 uppercase tracking-tight italic animate-pulse">Running Neural Extraction...</h2>
            <p className="text-xl text-on-surface-variant italic font-light max-w-sm">Parsing metadata and cross-referencing behavioral patterns from <span className="text-primary font-bold">"{fileName}"</span>.</p>
         </SurfaceCard>
      )}

      {step === 'review' && (
         <div className="animate-enter space-y-12">
            <SurfaceCard className="glass-surface p-12 border-white/5 overflow-hidden">
               <div className="flex justify-between items-center mb-12">
                  <h3 className="font-display text-2xl font-black text-white italic uppercase underline decoration-primary/20">Extraction Review</h3>
                  <div className="flex gap-4">
                     <button onClick={() => setStep('upload')} className="text-[10px] font-black text-on-surface-variant hover:text-white uppercase tracking-widest italic decoration-error/40 underline">Cancel / Re-upload</button>
                  </div>
               </div>

               <div className="overflow-hidden rounded-3xl border border-white/5">
                  <table className="w-full text-left">
                     <thead className="bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-on-surface-variant italic">
                        <tr>
                           <th className="px-8 py-6">Date</th>
                           <th className="px-8 py-6">Merchant / Source</th>
                           <th className="px-8 py-6">Amount</th>
                           <th className="px-8 py-6">Inference Tag</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/5">
                        {extractedData.map((row) => (
                           <tr key={row.id} className="group hover:bg-white/5 transition-colors">
                              <td className="px-8 py-6 text-sm italic font-mono text-on-surface-variant/70">
                                 <input 
                                    className="bg-transparent border-none focus:outline-none focus:text-primary w-full"
                                    value={row.date}
                                    onChange={(e) => handleEdit(row.id, 'date', e.target.value)}
                                 />
                              </td>
                              <td className="px-8 py-6 text-sm font-black text-white italic">
                                 <input 
                                    className="bg-transparent border-none focus:outline-none focus:text-primary w-full"
                                    value={row.merchant}
                                    onChange={(e) => handleEdit(row.id, 'merchant', e.target.value)}
                                 />
                              </td>
                              <td className="px-8 py-6 text-xl font-black text-primary italic">
                                 <input 
                                    className="bg-transparent border-none focus:outline-none focus:text-primary w-32"
                                    value={row.amount}
                                    onChange={(e) => handleEdit(row.id, 'amount', e.target.value)}
                                 />
                              </td>
                              <td className="px-8 py-6">
                                 <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase text-primary italic">Verified Match ✅</span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               <div className="mt-12 p-8 rounded-3xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="max-w-md">
                     <h4 className="text-lg font-black text-white uppercase italic mb-2">Synchronize Evidence</h4>
                     <p className="text-[11px] text-on-surface-variant italic leading-relaxed">Approving this data will permanently index it to your Operational Score. You can only edit these values before clicking the synchronization button below.</p>
                  </div>
                  <button 
                     onClick={handleApprove}
                     className="px-14 py-5 rounded-2xl bg-primary text-white text-lg font-black italic shadow-premium hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
                  >
                     Approve & Sync Hub
                  </button>
               </div>
            </SurfaceCard>
         </div>
      )}
    </div>
  )
}

export default DataUpload
