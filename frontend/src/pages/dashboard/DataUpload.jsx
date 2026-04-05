import { useState } from 'react'
import { SurfaceCard, PremiumButton, TokenPill } from '../../components/ui'
import AppIcon from '../../components/AppIcon'
import { useAuth } from '../../context/AuthContext'
import { useVerification } from '../../context/VerificationContext'
import { orchestrateTransaction } from '../../services/campusApi'

const sourceOptions = [
   {
      key: 'screenshot',
      title: 'Mobile Wallet Screenshot',
      icon: 'camera',
      desc: 'Upload screenshots from wallet apps like M-Pesa, Telebirr, or CBE.',
   },
   {
      key: 'sms',
      title: 'Operator SMS History',
      icon: 'message',
      desc: 'Paste SMS transaction text from your phone.',
   },
   {
      key: 'pdf',
      title: 'Financial Statements',
      icon: 'institution',
      desc: 'Upload PDF bank or wallet statements.',
   },
   {
      key: 'manual',
      title: 'Manual Input',
      icon: 'note',
      desc: 'Type in amount and date yourself.',
   },
]

function DataUpload() {
  const { user } = useAuth()
  const { submitProof } = useVerification()
  const [step, setStep] = useState('upload') // upload, processing, review
   const [sourceType, setSourceType] = useState('screenshot')
  const [fileName, setFileName] = useState(null)
   const [selectedFile, setSelectedFile] = useState(null)
   const [deviceId, setDeviceId] = useState('portal-device-01')
   const [ipAddress, setIpAddress] = useState('127.0.0.1')
   const [rawText, setRawText] = useState('')
   const [amount, setAmount] = useState('')
   const [purchaseTime, setPurchaseTime] = useState('')
   const [error, setError] = useState('')
   const [processingLabel, setProcessingLabel] = useState('Processing your data...')
   const [responseMeta, setResponseMeta] = useState(null)
  
  const [extractedData, setExtractedData] = useState([
      { id: 1, date: '', merchant: '', amount: '', category: '' },
  ])

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (file) {
          setFileName(file.name)
          setSelectedFile(file)
          setError('')
    }
  }

   const handleProcess = async () => {
      setError('')

      if (!user?.phone) {
         setError('Session is missing a user phone. Please sign in again.')
         return
      }

      if ((sourceType === 'screenshot' || sourceType === 'pdf') && !selectedFile) {
         setError('Please attach a file before processing.')
         return
      }

      if (sourceType === 'sms' && !rawText.trim()) {
         setError('Please paste SMS text before processing.')
         return
      }

      if (sourceType === 'manual' && (!amount || !purchaseTime)) {
         setError('Manual mode requires amount and purchase time.')
         return
      }

      setProcessingLabel(sourceType === 'manual' ? 'Checking your entry...' : 'Processing your data...')
      setStep('processing')

      try {
         const form = new FormData()
         form.append('source_type', sourceType)
         form.append('device_id', deviceId)
         form.append('ip_address', ipAddress)
         form.append('external_user_key', user.phone)
         form.append('owner_name', user?.name || 'Anonymous Operator')
         form.append('age', String(user?.age || 24))
         form.append('continue_on_gaps', 'true')

         if (sourceType === 'sms') {
            form.append('raw_text', rawText)
         }

         if (sourceType === 'manual') {
            form.append('amount', amount)
            form.append('purchase_time', purchaseTime)
         }

         if ((sourceType === 'screenshot' || sourceType === 'pdf') && selectedFile) {
            form.append('file', selectedFile)
         }

         const response = await orchestrateTransaction(form)
         const result = response?.execution?.result || response

         setExtractedData([
            {
               id: result?.id || 1,
               date: (result?.purchase_time || new Date().toISOString()).slice(0, 10),
               merchant: result?.merchant?.name || result?.transaction_source || 'Parsed Transaction',
               amount: String(result?.amount || amount || '0.00'),
               category: result?.data_source || sourceType,
            },
         ])

         setResponseMeta({
            executionStatus: response?.execution?.status || 'completed',
            transactionStatus: result?.status || 'pending',
            transactionId: result?.id || null,
            modelSource: result?.analysis?.model_source || 'not available',
            ocrReliability: result?.analysis?.ocr_reliability,
            sourceConfidence: result?.analysis?.source_confidence,
         })

         setStep('review')
      } catch (uploadError) {
         const message = uploadError?.message || 'Upload failed.'
         setError(message)
         setStep('upload')
      }
   }

  const handleEdit = (id, field, value) => {
     setExtractedData(prev => prev.map(row => 
        row.id === id ? { ...row, [field]: value } : row
     ))
  }

  const handleApprove = () => {
     submitProof({
       ownerPhone: user?.phone || 'not-available',
       ownerName: user?.name || 'Anonymous Operator',
          proofType: sourceType === 'pdf' ? 'Bank Statement' : sourceType === 'sms' ? 'SMS Log' : 'Transaction Snapshot',
       title: `Upload: ${fileName || 'unnamed_batch.png'}`,
          notes: `System found ${extractedData.length} entries. Status: ${responseMeta?.transactionStatus || 'not available'}.`,
       fileName: fileName || 'batch_evidence.png'
     })
   alert('Data saved to your profile. We will continue monitoring for unusual activity.')
     setStep('upload')
       setResponseMeta(null)
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <header className="mb-16">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 italic underline decoration-primary/20">[ Upload Data ]</p>
         <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tighter italic uppercase underline decoration-white/5">
            Upload <span className="text-gradient">Transactions</span>
         </h1>
         <p className="text-xl text-on-surface-variant font-light mt-4 italic">Upload screenshots, SMS messages, PDFs, or type details manually.</p>
      </header>

      {step === 'upload' && (
         <div className="grid gap-8 md:grid-cols-2">
            <label className="group relative block aspect-[16/10] rounded-[3rem] bg-surface-container-low border-2 border-dashed border-white/10 hover:border-primary transition-all cursor-pointer overflow-hidden p-12 flex flex-col items-center justify-center text-center">
               <input type="file" className="hidden" onChange={handleFile} />
               <div className="mb-8 grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/5 text-on-surface group-hover:scale-110 transition-transform group-hover:rotate-6">
                  <AppIcon name="document" className="h-10 w-10" />
               </div>
               <p className="text-xl font-black text-white uppercase tracking-widest italic mb-2">Add Files</p>
               <p className="text-xs text-on-surface-variant italic">Screenshots, PDFs, or SMS messages</p>
               {fileName && <p className="mt-3 text-[10px] text-primary font-bold uppercase tracking-widest">{fileName}</p>}
               <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </label>

            <div className="space-y-6">
               {sourceOptions.map((item) => (
                  <SurfaceCard key={item.key} className={`p-6 border-white/5 transition-colors group cursor-pointer ${sourceType === item.key ? 'bg-primary/10 border-primary/30' : 'bg-white/5 hover:bg-white/10'}`} onClick={() => setSourceType(item.key)}>
                     <div className="flex items-center gap-6">
                        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/5 text-on-surface transition-all">
                           <AppIcon name={item.icon} className="h-6 w-6" />
                        </div>
                        <div>
                           <h4 className="text-sm font-black text-white uppercase italic tracking-widest">{item.title}</h4>
                           <p className="text-[10px] text-on-surface-variant italic mt-1 font-light">{item.desc}</p>
                        </div>
                        <span className="ml-auto text-primary opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
                     </div>
                  </SurfaceCard>
               ))}

                      <SurfaceCard className="p-6 bg-white/5 border-white/5 space-y-4">
                           <div className="grid gap-3 md:grid-cols-2">
                              <input value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="w-full rounded-xl border border-white/10 bg-surface-low px-4 py-3 text-sm text-white outline-none focus:border-primary" placeholder="Device ID" />
                              <input value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} className="w-full rounded-xl border border-white/10 bg-surface-low px-4 py-3 text-sm text-white outline-none focus:border-primary" placeholder="IP Address" />
                           </div>

                           {sourceType === 'sms' && (
                              <textarea value={rawText} onChange={(e) => setRawText(e.target.value)} className="w-full min-h-24 rounded-xl border border-white/10 bg-surface-low px-4 py-3 text-sm text-white outline-none focus:border-primary" placeholder="Paste SMS payload here" />
                           )}

                           {sourceType === 'manual' && (
                              <div className="grid gap-3 md:grid-cols-2">
                                 <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border border-white/10 bg-surface-low px-4 py-3 text-sm text-white outline-none focus:border-primary" placeholder="Amount" />
                                 <input value={purchaseTime} onChange={(e) => setPurchaseTime(e.target.value)} className="w-full rounded-xl border border-white/10 bg-surface-low px-4 py-3 text-sm text-white outline-none focus:border-primary" placeholder="2026-04-05T10:30:00Z" />
                              </div>
                           )}

                           {error && <p className="text-sm text-error">{error}</p>}

                           <PremiumButton onClick={handleProcess} className="w-full">Process Evidence</PremiumButton>
                      </SurfaceCard>
            </div>
         </div>
      )}

      {step === 'processing' && (
         <SurfaceCard className="glass-surface p-24 flex flex-col items-center justify-center text-center border-white/5 h-[400px]">
            <div className="relative mb-12">
               <div className="h-32 w-32 rounded-[2rem] border-4 border-primary/20 border-t-primary animate-spin" />
               <div className="absolute inset-0 flex items-center justify-center text-primary font-black italic">AI</div>
            </div>
            <h2 className="text-3xl font-display font-black text-white mb-6 uppercase tracking-tight italic animate-pulse">{processingLabel}</h2>
            <p className="text-xl text-on-surface-variant italic font-light max-w-sm">We are reading your data from <span className="text-primary font-bold">"{fileName}"</span>.</p>
         </SurfaceCard>
      )}

      {step === 'review' && (
         <div className="animate-enter space-y-12">
            <SurfaceCard className="glass-surface p-12 border-white/5 overflow-hidden">
               <div className="flex justify-between items-center mb-12">
                  <h3 className="font-display text-2xl font-black text-white italic uppercase underline decoration-primary/20">Review Parsed Data</h3>
                  <div className="flex gap-3 items-center">
                     {responseMeta?.executionStatus && <TokenPill tone={responseMeta.executionStatus === 'completed' ? 'good' : 'warn'}>{responseMeta.executionStatus}</TokenPill>}
                     {responseMeta?.transactionStatus && <TokenPill tone={responseMeta.transactionStatus === 'flagged' ? 'bad' : 'good'}>{responseMeta.transactionStatus}</TokenPill>}
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
                           <th className="px-8 py-6">Check Result</th>
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
                                 <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase text-primary italic">
                                    <AppIcon name="check" className="h-3 w-3" />
                                    <span>Looks Good</span>
                                 </span>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>

                      <div className="mt-6 grid gap-3 md:grid-cols-3">
                         <div className="rounded-2xl bg-white/5 p-4 text-xs text-on-surface-variant">Transaction ID: <span className="text-white">{responseMeta?.transactionId || 'Not available'}</span></div>
                         <div className="rounded-2xl bg-white/5 p-4 text-xs text-on-surface-variant">Scoring source: <span className="text-white">{responseMeta?.modelSource || 'Not available'}</span></div>
                         <div className="rounded-2xl bg-white/5 p-4 text-xs text-on-surface-variant">Reading confidence: <span className="text-white">{responseMeta?.ocrReliability ?? 'Not available'}</span></div>
                      </div>

               <div className="mt-12 p-8 rounded-3xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="max-w-md">
                     <h4 className="text-lg font-black text-white uppercase italic mb-2">Save This Data</h4>
                     <p className="text-[11px] text-on-surface-variant italic leading-relaxed">When you approve, this data is saved to your account and used in your score. You can edit values before saving.</p>
                  </div>
                  <button 
                     onClick={handleApprove}
                     className="px-14 py-5 rounded-2xl bg-primary text-white text-lg font-black italic shadow-premium hover:brightness-110 active:scale-95 transition-all whitespace-nowrap"
                  >
                     Approve and Save
                  </button>
               </div>
            </SurfaceCard>
         </div>
      )}
    </div>
  )
}

export default DataUpload
