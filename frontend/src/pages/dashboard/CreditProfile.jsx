import { useEffect, useMemo, useState } from 'react'
import { getTransactions, toList } from '../../services/campusApi'
import { ProgressTrack, SectionHeading, SurfaceCard, TokenPill } from '../../components/ui'
import { useAuth } from '../../context/AuthContext'

function CreditProfile() {
   const { user } = useAuth()
   const [transactions, setTransactions] = useState([])
   const [error, setError] = useState('')

   useEffect(() => {
      let mounted = true

      async function load() {
         if (!user?.phone) {
            if (!mounted) return
            setTransactions([])
            return
         }

         try {
            const payload = await getTransactions({ external_user_key: user.phone })
            if (!mounted) return
            setTransactions(toList(payload))
         } catch (loadError) {
            if (!mounted) return
            setError(loadError.message || 'Unable to load transaction details.')
         }
      }

      load()

      return () => {
         mounted = false
      }
   }, [user?.phone])

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
         sourceConfidence: candidate.source_confidence || 'not available',
         validationScore: Number(candidate.validation_score || 0).toFixed(2),
         deviceId: candidate.device_id || 'Not available',
         ipAddress: candidate.ip_address || 'Not available',
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
               <SectionHeading overline="Transaction Details" title="No transactions yet" />
               <p className="text-sm text-on-surface-variant">Upload a transaction to see details here.</p>
               {error && <p className="mt-4 text-sm text-error">{error}</p>}
            </SurfaceCard>
         </div>
      )
   }

  return (
      <div className="max-w-6xl mx-auto space-y-10">
         <header className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic underline decoration-primary/20">[ Transaction Details ]</p>
            <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-none italic uppercase">
               Transaction <span className="text-gradient">Details</span>
            </h1>
            <p className="max-w-3xl text-lg font-light italic text-on-surface-variant">
               Review transaction details, risk score, and system checks.
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
                     <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Chance of Fraud</p>
                     <p className="mt-2 text-3xl font-black text-white">{transactionCase.fraudProbability}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                     <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Chance It Is Normal</p>
                     <p className="mt-2 text-3xl font-black text-white">{transactionCase.legitimateProbability}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                     <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold">Validation Score</p>
                     <p className="mt-2 text-3xl font-black text-white">{transactionCase.validationScore}</p>
                  </div>
               </div>

               <div className="mt-8">
                  <h2 className="mb-4 text-sm font-black uppercase tracking-widest text-white italic underline decoration-primary/20">Why this needs review</h2>
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
                  <SectionHeading overline="Transaction Details" title="Saved information" />
                  <div className="space-y-3 text-sm text-on-surface-variant">
                     <p>Device ID: <span className="text-white">{transactionCase.deviceId}</span></p>
                     <p>IP Address: <span className="text-white">{transactionCase.ipAddress}</span></p>
                     <p>Source confidence: <span className="text-white">{transactionCase.sourceConfidence}</span></p>
                     <p>Parsing success: <span className="text-white">{transactionCase.parsingSuccess}</span></p>
                  </div>
               </SurfaceCard>

               <SurfaceCard className="glass-surface border-white/5">
                  <SectionHeading overline="System Checks" title="Review notes" />
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
                  <SectionHeading overline="Confidence" title="Data confidence" />
                  <ProgressTrack value={61} />
                  <p className="mt-4 text-sm text-on-surface-variant">
                     This score shows how sure the system is about the transaction data.
                  </p>
               </SurfaceCard>
            </div>
         </div>
    </div>
  )
}

export default CreditProfile
