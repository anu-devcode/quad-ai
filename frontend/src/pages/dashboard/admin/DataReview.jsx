import { useState } from 'react'
import { SurfaceCard } from '../../../components/ui'

function DataReview() {
  const [activeEvidence, setActiveEvidence] = useState({
     id: 'EV-8842',
     user: 'Selam A.',
     type: 'M-Pesa SMS Confirmation',
     status: 'Unverified',
     extraction: [
        { field: 'Transaction Date', raw: '2026-03-24', extracted: '2026-03-24', confidence: 99 },
        { field: 'Merchant ID', raw: 'TOTAL-HUB-X45', extracted: 'TOTAL-HUB-X45', confidence: 92 },
        { field: 'Amount Value', raw: 'Ksh 4.500', extracted: '450.00', confidence: 42 }, // Intentional error for demo
        { field: 'Reference ID', raw: 'QW34R5T6', extracted: 'QW34R5T6', confidence: 98 }
     ],
     rawText: 'M-PESA Confirmed. Ksh4,500.00 sent to TOTAL-HUB-X45 on 24/3/26 at 2:14 PM. Trans ID: QW34R5T6. New balance...',
     imagePlaceholder: '📄 M-Pesa Evidence Screenshot.png'
  })

  const [reviewData, setReviewData] = useState(activeEvidence.extraction)

  const handleCorrection = (idx, val) => {
     setReviewData(prev => prev.map((item, i) => i === idx ? { ...item, extracted: val } : item))
  }

  const handleApprove = () => {
     alert('Evidence Synchronized Globally.')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <header className="mb-16 text-center lg:text-left">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 italic underline decoration-primary/20">[ Forensic Audit Panel ]</p>
         <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tighter italic uppercase underline decoration-white/5">
            Data <span className="text-gradient">Review Hub</span>
         </h1>
         <p className="text-xl text-on-surface-variant font-light mt-4 italic">Manually audit neural extraction vectors against raw evidence artifacts for 100% data integrity.</p>
      </header>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* LEFT PANEL: EVIDENCE ARTIFACT */}
        <div className="lg:col-span-12 grid gap-8 lg:grid-cols-2">
           <SurfaceCard className="glass-surface p-12 border-white/5 h-full relative overflow-hidden flex flex-col justify-center items-center text-center">
              <div className="text-8xl mb-8 opacity-20 grayscale hover:grayscale-0 transition-all duration-700 decoration-primary/20 underline">🖼️</div>
              <h3 className="text-sm font-black text-white italic uppercase tracking-[0.2em] mb-4">Ingested Proof Artifact</h3>
              <p className="text-[10px] text-on-surface-variant italic opacity-60 mb-10 max-w-xs leading-relaxed font-light">Evidence Source: {activeEvidence.type}</p>
              
              <div className="w-full p-8 rounded-3xl bg-surface-container-lowest font-mono text-[10px] text-on-surface-variant border border-white/5 overflow-x-auto whitespace-pre text-left italic">
                 <p className="mb-4 text-primary font-black uppercase text-[8px]">[ Raw OCR Stream ]</p>
                 {activeEvidence.rawText}
              </div>
              <div className="absolute top-0 right-0 h-48 w-48 bg-primary/5 blur-3xl rounded-full" />
           </SurfaceCard>

           <SurfaceCard className="glass-surface p-12 border-white/5 h-full min-h-[500px]">
              <div className="flex justify-between items-center mb-10">
                 <h2 className="font-display text-2xl font-black text-white italic uppercase underline decoration-primary/20">Audit Verification Hub</h2>
                 <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 italic">Manual Intervention Required</span>
              </div>

              <div className="space-y-8">
                 {reviewData.map((item, i) => (
                    <div key={i} className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all cursor-default">
                       <div className="flex justify-between items-center mb-4">
                          <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest italic decoration-primary/20 underline opacity-40">{item.field}</p>
                          <span className={`text-[8px] font-black uppercase italic ${item.confidence < 50 ? 'text-error' : item.confidence < 90 ? 'text-yellow-400' : 'text-tertiary'}`}>{item.confidence}% Confidence Signal</span>
                       </div>
                       <div className="grid gap-6 md:grid-cols-2 items-center">
                          <div className="p-4 rounded-xl bg-white/5 border border-white/10 italic text-[10px] text-on-surface-variant font-mono">
                             <span className="text-[8px] block mb-1 uppercase font-bold opacity-30">Raw Signal:</span>
                             {item.raw}
                          </div>
                          <div className="space-y-2">
                             <span className="text-[8px] block uppercase font-bold opacity-30 italic">Hub Target Extraction:</span>
                             <input 
                                className={`w-full bg-surface-container-lowest p-4 rounded-xl border font-black italic text-sm focus:outline-none focus:border-primary transition-all ${item.confidence < 50 ? 'border-error/40 text-error' : 'border-white/10 text-white'}`}
                                value={item.extracted}
                                onChange={(e) => handleCorrection(i, e.target.value)}
                             />
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-12 flex flex-col md:flex-row justify-between items-center gap-8 pt-10 border-t border-white/5 bg-gradient-to-t from-primary/5 to-transparent rounded-[3rem] p-8 -mx-8 -mb-8">
                 <div className="text-left flex-1 px-4">
                    <h4 className="text-xs font-black text-white uppercase italic mb-2 tracking-widest decoration-white/10 underline">Operational Governance</h4>
                    <p className="text-[10px] text-on-surface-variant italic font-light leading-relaxed max-w-xs">By approving this audit, you are manually declaring the extracted neural vectors as the source of truth for global scoring.</p>
                 </div>
                 <button 
                    onClick={handleApprove}
                    className="px-14 py-5 rounded-2xl bg-primary text-white text-lg font-black italic shadow-premium hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
                 >
                    Approve Hub Sync
                 </button>
              </div>
           </SurfaceCard>
        </div>
      </div>
    </div>
  )
}

export default DataReview
