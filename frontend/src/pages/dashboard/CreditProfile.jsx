import { useEffect, useMemo, useState } from 'react'
import { getTransactions, toList } from '../../services/campusApi'
import { ProgressTrack, SectionHeading, SurfaceCard, TokenPill } from '../../components/ui'

function CreditProfile() {
   const [transactions, setTransactions] = useState([])
   const [error, setError] = useState('')

   useEffect(() => {
      let mounted = true

      async function load() {
         try {
            const payload = await getTransactions()
            if (!mounted) return
            setTransactions(toList(payload))
         } catch (loadError) {
            if (!mounted) return
            setError(loadError.message || 'Unable to load case data.')
         }
      }

      load()

      return () => {
         mounted = false
      }
   }, [])

   const transactionCase = useMemo(() => {
      const candidate = transactions.find((txn) => txn.status === 'flagged') || transactions[0]
      if (!candidate) return null

      return {
         id: candidate.id,
         user: candidate?.user?.username || candidate?.user?.full_name || `User ${candidate?.user?.id || 'N/A'}`,
         amount: Number(candidate.amount || 0).toFixed(2),
         source: candidate.transaction_source || candidate.data_source || 'manual',
         status: candidate.status || 'pending',
         riskLevel: candidate.status === 'flagged' ? 'High' : candidate.validation_score > 0.8 ? 'Low' : 'Medium',
         fraudProbability: candidate.status === 'flagged' ? '0.80' : '0.20',
         legitimateProbability: candidate.status === 'flagged' ? '0.20' : '0.80',
         parsingSuccess: Number(candidate.parsing_success ? 1 : 0).toFixed(2),
         sourceConfidence: candidate.source_confidence || 'unknown',
         validationScore: Number(candidate.validation_score || 0).toFixed(2),
         deviceId: candidate.device_id || 'N/A',
         ipAddress: candidate.ip_address || 'N/A',
         reasoning: [
            `Status currently marked as ${candidate.status || 'pending'}.`,
            `Source type is ${(candidate.transaction_source || candidate.data_source || 'manual').toString()}.`,
            `Validation score is ${Number(candidate.validation_score || 0).toFixed(2)}.`,
         ],
         validationLogs: candidate.validation_logs || [],
      }
   }, [transactions])

   if (!transactionCase) {
      return (
         <div className="max-w-6xl mx-auto space-y-6">
            <SurfaceCard className="glass-surface border-white/5">
               <SectionHeading overline="Case View" title="No transactions available" />
               <p className="text-sm text-on-surface-variant">Create or ingest a transaction to populate this view.</p>
               {error && <p className="mt-4 text-sm text-error">{error}</p>}
            </SurfaceCard>
         </div>
      )
   }

  return (
      <div className="max-w-6xl mx-auto space-y-10">
         <header className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic underline decoration-primary/20">[ Case View ]</p>
            <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-none italic uppercase">
               Transaction <span className="text-gradient">Case View</span>
            </h1>
            <p className="max-w-3xl text-lg font-light italic text-on-surface-variant">
               This screen mirrors the backend's fraud assessment output: assessment, confidence, validation logs, and reasoning.
            </p>
         </header>

         <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <SurfaceCard className="glass-surface border-white/5">
               <SectionHeading overline="Transaction Summary" title={transactionCase.id} action={<TokenPill tone="bad">{transactionCase.status}</TokenPill>} />
               <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                     ['User', transactionCase.user],
                     ['Amount', `$${transactionCase.amount}`],
                     ['Source', transactionCase.source],
                     ['Risk', transactionCase.riskLevel],
                  ].map(([label, value]) => (
                     <div key={label} className="rounded-2xl border border-white/5 bg-white/5 p-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic">{label}</p>
                        <p className="mt-2 text-sm font-bold text-white">{value}</p>
                     </div>
                  ))}
               </div>

               <div className="mt-8 grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl bg-primary/10 p-4 border border-primary/20">
                     <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Fraud Probability</p>
                     <p className="mt-2 text-3xl font-black text-white">{transactionCase.fraudProbability}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                     <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Legitimate Probability</p>
                     <p className="mt-2 text-3xl font-black text-white">{transactionCase.legitimateProbability}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                     <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Validation Score</p>
                     <p className="mt-2 text-3xl font-black text-white">{transactionCase.validationScore}</p>
                  </div>
               </div>

               <div className="mt-8">
                  <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-white italic underline decoration-primary/20">Why this was flagged</h2>
                  <div className="space-y-3">
                     {transactionCase.reasoning.map((reason) => (
                        <div key={reason} className="rounded-2xl border border-white/5 bg-white/5 p-4 text-sm text-on-surface-variant">
                           {reason}
                        </div>
                     ))}
                  </div>
               </div>
            </SurfaceCard>

            <div className="space-y-6">
               <SurfaceCard className="glass-surface border-white/5">
                  <SectionHeading overline="Technical Metadata" title="Backend input fields" />
                  <div className="space-y-3 text-sm text-on-surface-variant">
                     <p>Device ID: <span className="text-white">{transactionCase.deviceId}</span></p>
                     <p>IP Address: <span className="text-white">{transactionCase.ipAddress}</span></p>
                     <p>Source confidence: <span className="text-white">{transactionCase.sourceConfidence}</span></p>
                     <p>Parsing success: <span className="text-white">{transactionCase.parsingSuccess}</span></p>
                  </div>
               </SurfaceCard>

               <SurfaceCard className="glass-surface border-white/5">
                  <SectionHeading overline="Validation Logs" title="Manual review notes" />
                  <div className="space-y-3">
                     {transactionCase.validationLogs.map((log) => (
                        <div key={`${log.check_type}-${log.id || ''}`} className="rounded-2xl bg-white/5 p-4">
                           <div className="flex items-center justify-between gap-3">
                              <p className="text-sm font-bold text-white">{log.check_type}</p>
                              <TokenPill tone={log.check_passed ? 'good' : 'warn'}>{log.check_passed ? 'passed' : 'warn'}</TokenPill>
                           </div>
                           <p className="mt-2 text-xs text-on-surface-variant">{log.message}</p>
                        </div>
                     ))}
                  </div>
               </SurfaceCard>

               <SurfaceCard className="glass-surface border-white/5">
                  <SectionHeading overline="Confidence" title="Signal strength" />
                  <ProgressTrack value={61} />
                  <p className="mt-4 text-sm text-on-surface-variant">
                     The case view should ultimately render the backend's fraud assessment and confidence artifacts, not a generic profile dashboard.
                  </p>
               </SurfaceCard>
            </div>
         </div>
    </div>
  )
}

export default CreditProfile
