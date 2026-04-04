import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PremiumButton, SurfaceCard } from '../components/ui'

const sampleUploads = [
  {
    name: 'M-Pesa SMS Confirmation',
    type: 'SMS',
    data: [
      { date: '2026-03-01', merchant: 'Safaricom Store', amount: 'Ksh 4,500', status: 'Verified' },
      { date: '2026-03-03', merchant: 'Naivas Supermarket', amount: 'Ksh 1,200', status: 'Verified' },
      { date: '2026-03-05', merchant: 'Shell Filling Station', amount: 'Ksh 3,000', status: 'Verified' }
    ],
    score: 842,
    risk: 'Low',
    confidence: '98%',
    rawText: 'M-PESA Confirmed. Ksh4,500.00 sent to Safaricom Store on 1/3/20 at 2:14 PM. Trans ID: QW34R5T6. New balance...',
    insights: ['Consistent essential spending', 'Verified mobile wallet history', 'Low churn probability']
  },
  {
    name: 'Bank Transaction Screenshot',
    type: 'Screenshot',
    data: [
      { date: '2026-03-02', merchant: 'Rent Repayment', amount: '₦ 85,000', status: 'Extracted' },
      { date: '2026-03-04', merchant: 'Electricity Bill', amount: '₦ 12,000', status: 'Extracted' }
    ],
    score: 615,
    risk: 'Medium',
    confidence: '82%',
    rawText: '[OCR EXTRACT] Transaction Date: 02-03-2026. Ref: RENT_MARCH. Amount: 85,000. Receiver: Unity Housing...',
    insights: ['Potential month-end liquidity stress', 'Recurring high-value outgoing', 'Average data signal strength']
  },
  {
    name: 'Suspicious / Altered Evidence',
    type: 'Screenshot',
    data: [
      { date: '2026-02-28', merchant: 'Unknown Receiver', amount: '$ 10,000', status: 'Flagged' }
    ],
    score: 285,
    risk: 'High',
    confidence: '45%',
    rawText: '[TAMPER DETECTED] Date: 28-02. Amount: 10,000. Note: Payment For Services Rendering. [IMAGE ARTIFACTS FOUND]',
    insights: ['Metadata mismatch detected', 'Digital alteration patterns found in font rendering', 'Possible synthetic identity signal']
  }
]

function DemoPage() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState(null)
  const [showRaw, setShowRaw] = useState(false)

  const handleSampleClick = (sample) => {
    setIsProcessing(true)
    setSelectedFile(null)
    setResult(null)
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false)
      setResult(sample)
    }, 1500)
  }

  const handleFileUpload = (e) => {
     const file = e.target.files[0]
     if (file) {
        setIsProcessing(true)
        setResult(null)
        setTimeout(() => {
           setIsProcessing(false)
           // Use the first sample for file upload demo
           setResult(sampleUploads[0])
        }, 2000)
     }
  }

  const getRiskColor = (risk) => {
     if (risk === 'Low') return 'text-tertiary shadow-[0_0_15px_rgba(16,185,129,0.3)]'
     if (risk === 'Medium') return 'text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)]'
     return 'text-error shadow-[0_0_15px_rgba(239,68,68,0.3)]'
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden px-4 pb-20 pt-12 sm:px-8 sm:pt-20 lg:px-12 text-on-surface">
      {/* Background Effect */}
      <div className="absolute left-1/4 top-0 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <main className="relative z-10 mx-auto max-w-7xl">
        <header className="mb-16 text-center">
          <div className="inline-block rounded-full bg-primary/10 px-4 py-1.5 border border-primary/20 mb-8 backdrop-blur-md">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary italic">[ Operational Sandbox ]</span>
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-tight text-white mb-6 sm:text-6xl tracking-tight leading-[1.1]">
            Evidence <span className="text-gradient">Sandbox</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-on-surface-variant font-light leading-relaxed">
            Upload financial evidence or choose a sample dataset to see how our engine transforms raw data into institutional trust signals.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Left Panel: Upload / Input */}
          <div className="lg:col-span-5 space-y-8">
            <SurfaceCard className="glass-surface p-8 border-white/5">
              <h3 className="font-display text-xl font-bold text-white mb-6 underline decoration-primary">1. Input Evidence</h3>
              
              {/* Dropzone */}
              <label className="group relative block w-full aspect-[4/3] rounded-2xl bg-surface-container-lowest/50 border-2 border-dashed border-white/10 hover:border-primary/40 transition-all cursor-pointer overflow-hidden p-8 flex flex-col items-center justify-center text-center">
                 <input type="file" className="hidden" onChange={handleFileUpload} />
                 <div className="text-5xl mb-6 group-hover:scale-110 transition-transform group-hover:rotate-6">📎</div>
                 <p className="text-sm font-bold text-white uppercase tracking-widest mb-2">Upload Evidence</p>
                 <p className="text-[10px] text-on-surface-variant italic">Drop M-Pesa SMS, screenshots or PDFs here</p>
                 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </label>

              <div className="mt-8">
                 <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-4 italic">Or use a sample dataset:</p>
                 <div className="space-y-3">
                    {sampleUploads.map((s, i) => (
                       <button 
                          key={i} 
                          onClick={() => handleSampleClick(s)}
                          className="w-full text-left p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-primary/10 hover:border-primary/20 transition-all flex items-center justify-between group"
                       >
                          <div>
                             <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">{s.name}</p>
                             <p className="text-[10px] text-on-surface-variant">{s.type}</p>
                          </div>
                          <span className="text-xs opacity-0 group-hover:opacity-100 transition-opacity">Select →</span>
                       </button>
                    ))}
                 </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="glass-surface p-8 border-white/5">
               <h4 className="text-sm font-bold text-white mb-4 italic underline decoration-primary">System Integrity Status</h4>
               <div className="flex items-center justify-between text-xs mb-4">
                  <span className="text-on-surface-variant">AI Inference Layer</span>
                  <span className="text-tertiary">Operational 🟢</span>
               </div>
               <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant">OCR Parsing Engine</span>
                  <span className="text-tertiary">Operational 🟢</span>
               </div>
            </SurfaceCard>
          </div>

          {/* Right Panel: Results */}
          <div className="lg:col-span-7">
            <SurfaceCard className="glass-surface min-h-[600px] border-white/5 relative overflow-hidden flex flex-col">
              
              {/* Processing Overlay */}
              {isProcessing && (
                 <div className="absolute inset-0 z-50 bg-background/80 backdrop-blur-lg flex flex-col items-center justify-center p-12 text-center">
                    <div className="relative mb-8">
                       <div className="h-20 w-20 rounded-2xl bg-primary/20 border border-primary/40 animate-spin" />
                       <div className="absolute inset-0 flex items-center justify-center font-bold text-primary">AI</div>
                    </div>
                    <h4 className="text-2xl font-display font-bold text-white mb-4 animate-pulse">Extracting Financial Data...</h4>
                    <p className="text-on-surface-variant max-w-xs text-sm">Our neural models are currently parsing the metadata and cross-referencing behavioral patterns.</p>
                 </div>
              )}

              {/* No Data State */}
              {!isProcessing && !result && (
                 <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                    <div className="text-6xl mb-8">🔭</div>
                    <h4 className="text-xl font-bold text-white mb-4 italic">No Evidence Selected</h4>
                    <p className="text-on-surface-variant text-sm max-w-xs">Upload a transaction screenshot or select a sample from the left to begin real-time analysis.</p>
                 </div>
              )}

              {/* SUCCESS RESULT VIEW */}
              {!isProcessing && result && (
                 <div className="flex-1 p-8 overflow-y-auto animate-enter">
                    <div className="flex flex-wrap justify-between items-start gap-6 mb-12">
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 italic">Analysis Success</p>
                          <h3 className="font-display text-4xl font-bold text-white tracking-tight">{result.name}</h3>
                       </div>
                       <SurfaceCard className={`p-4 border-white/10 ${getRiskColor(result.risk)}`}>
                          <p className="text-[10px] font-bold uppercase tracking-widest mb-1">Risk Level</p>
                          <p className="text-2xl font-black">{result.risk}</p>
                       </SurfaceCard>
                    </div>

                    {/* METRICS */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
                       <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] uppercase text-on-surface-variant mb-1 italic">Alternative Score</p>
                          <p className="text-3xl font-bold text-white">{result.score}</p>
                       </div>
                       <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] uppercase text-on-surface-variant mb-1 italic">Data Confidence</p>
                          <p className="text-3xl font-bold text-white">{result.confidence}</p>
                       </div>
                       <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                          <p className="text-[10px] uppercase text-on-surface-variant mb-1 italic">Data Integrity</p>
                          <p className="text-3xl font-bold text-white">VALID ✅</p>
                       </div>
                    </div>

                    {/* EXTRACTED TABLE */}
                    <div className="mb-12">
                       <h4 className="text-sm font-bold text-white mb-6 underline decoration-primary">Parsed Transactions</h4>
                       <div className="overflow-hidden rounded-xl border border-white/5">
                          <table className="w-full text-left">
                             <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-on-surface-variant">
                                <tr>
                                   <th className="px-4 py-4">Date</th>
                                   <th className="px-4 py-4">Merchant</th>
                                   <th className="px-4 py-4">Amount</th>
                                   <th className="px-4 py-4">Status</th>
                                </tr>
                             </thead>
                             <tbody className="divide-y divide-white/5">
                                {result.data.map((row, i) => (
                                   <tr key={i} className="text-xs group hover:bg-white/5">
                                      <td className="px-4 py-4 text-on-surface-variant">{row.date}</td>
                                      <td className="px-4 py-4 font-bold text-white">{row.merchant}</td>
                                      <td className="px-4 py-4 text-primary font-bold">{row.amount}</td>
                                      <td className="px-4 py-4"><span className="px-2 py-1 rounded bg-white/5 italic">{row.status}</span></td>
                                   </tr>
                                ))}
                             </tbody>
                          </table>
                       </div>
                    </div>

                    {/* INSIGHTS */}
                    <div className="mb-12">
                       <h4 className="text-sm font-bold text-white mb-6 underline decoration-primary">AI Behavioral Insights</h4>
                       <div className="grid gap-3">
                          {result.insights.map((insight, i) => (
                             <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-surface-container border border-outline-variant text-xs italic text-on-surface-variant">
                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {insight}
                             </div>
                          ))}
                       </div>
                    </div>

                    {/* RAW TOGGLE */}
                    <div className="mt-auto pt-8 border-t border-white/5">
                       <div className="flex items-center justify-between mb-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/40 italic">System Transparency</h4>
                          <button 
                             onClick={() => setShowRaw(!showRaw)}
                             className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest"
                          >
                             {showRaw ? 'Hide Raw Text' : 'Show Raw OCR Text'}
                          </button>
                       </div>
                       {showRaw && (
                          <div className="p-4 rounded-xl bg-surface-container-lowest font-mono text-[10px] text-on-surface-variant border border-white/5 overflow-x-auto whitespace-pre">
                             {result.rawText}
                          </div>
                       )}
                    </div>
                 </div>
              )}
            </SurfaceCard>
          </div>
        </div>
      </main>
    </div>
  )
}

export default DemoPage
