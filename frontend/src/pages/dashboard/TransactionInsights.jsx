import { useEffect, useMemo, useState } from 'react'
import { getDashboardStats, getTransactions, toList } from '../../services/campusApi'
import { ProgressTrack, SectionHeading, SurfaceCard, TokenPill } from '../../components/ui'

function TransactionInsights() {
   const [stats, setStats] = useState(null)
   const [transactions, setTransactions] = useState([])
   const [error, setError] = useState('')

   useEffect(() => {
      let mounted = true

      async function load() {
         try {
            const [statsPayload, txPayload] = await Promise.all([
               getDashboardStats(),
               getTransactions(),
            ])

            if (!mounted) return
            setStats(statsPayload)
            setTransactions(toList(txPayload))
         } catch (loadError) {
            if (!mounted) return
            setError(loadError.message || 'Unable to load fraud overview.')
         }
      }

      load()

      return () => {
         mounted = false
      }
   }, [])

   const cards = useMemo(() => {
      const total = stats?.total_transactions ?? 0
      const flagged = stats?.flagged_count ?? 0
      const low = stats?.risk_distribution?.low ?? 0
      const medium = stats?.risk_distribution?.medium ?? 0
      const high = stats?.risk_distribution?.high ?? 0

      return [
         { label: 'Total Transactions', value: total },
         { label: 'Flagged Count', value: flagged },
         { label: 'Low Risk', value: low },
         { label: 'High Risk', value: high },
         { label: 'Medium Risk', value: medium },
      ]
   }, [stats])

   const riskDistribution = useMemo(() => {
      const risk = stats?.risk_distribution || { low: 0, medium: 0, high: 0 }
      const total = Math.max(1, risk.low + risk.medium + risk.high)
      return [
         { label: 'Low', value: Math.round((risk.low / total) * 100) },
         { label: 'Medium', value: Math.round((risk.medium / total) * 100) },
         { label: 'High', value: Math.round((risk.high / total) * 100) },
      ]
   }, [stats])

   const decisionFeed = useMemo(() => {
      return transactions.slice(0, 6).map((txn) => ({
         id: txn.id,
         event: `Transaction ${txn.id} is ${txn.status}`,
         actor: txn?.user?.username || 'system',
         timestamp: txn?.created_at ? new Date(txn.created_at).toLocaleString() : 'unknown time',
      }))
   }, [transactions])

  return (
      <div className="space-y-10 max-w-6xl mx-auto">
         <header className="space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary italic underline decoration-primary/20">[ Fraud Overview ]</p>
            <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-none italic uppercase">Live <span className="text-gradient">Fraud Overview</span></h1>
            <p className="max-w-3xl text-lg font-light italic text-on-surface-variant">
               This screen matches the backend's dashboard stats and risk distribution output for operators.
            </p>
         </header>

         <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {cards.slice(0, 4).map((stat) => (
               <SurfaceCard key={stat.label} className="glass-surface border-white/5 p-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic">{stat.label}</p>
                  <div className="mt-3 flex items-end justify-between">
                     <p className="text-4xl font-black text-white italic">{stat.value}</p>
                  </div>
               </SurfaceCard>
            ))}
         </section>

         <div className="grid gap-6 lg:grid-cols-[1fr_0.7fr]">
            <SurfaceCard className="glass-surface border-white/5">
               <SectionHeading overline="Risk Distribution" title="Low, medium, and high signals" action={<TokenPill tone="warn">backend-stats</TokenPill>} />
               <div className="space-y-4">
                  {riskDistribution.map((item) => (
                     <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-on-surface-variant">
                           <span>{item.label}</span>
                           <span>{item.value}%</span>
                        </div>
                        <ProgressTrack value={item.value} />
                     </div>
                  ))}
               </div>
            </SurfaceCard>

            <SurfaceCard className="glass-surface border-white/5">
               <SectionHeading overline="Recent events" title="Decision feed" />
               <div className="space-y-3">
                  {decisionFeed.map((event) => (
                     <div key={event.id} className="rounded-2xl bg-white/5 p-4">
                        <p className="text-sm font-bold text-white">{event.event}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] font-medium uppercase tracking-widest text-on-surface-variant">
                           <span>{event.actor}</span>
                           <span>{event.timestamp}</span>
                        </div>
                     </div>
                  ))}
                  {!decisionFeed.length && (
                     <div className="rounded-2xl bg-white/5 p-4 text-sm text-on-surface-variant">
                        No transactions available yet.
                     </div>
                  )}
                  {error && (
                     <div className="rounded-2xl bg-error/10 border border-error/20 p-4 text-sm text-white">
                        {error}
                     </div>
                  )}
               </div>
            </SurfaceCard>
         </div>
    </div>
  )
}

export default TransactionInsights
