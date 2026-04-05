import { useAuth } from '../../context/AuthContext'
import { SurfaceCard } from '../../components/ui'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import AppIcon from '../../components/AppIcon'
import { getDashboardStats, getNotifications, getTransactions, getTrustProfiles, toList } from '../../services/campusApi'

function DashboardHome() {
  const { user } = useAuth()
  const location = useLocation()
   const [stats, setStats] = useState(null)
   const [transactions, setTransactions] = useState([])
   const [trustProfile, setTrustProfile] = useState(null)
   const [notifications, setNotifications] = useState([])
   const [error, setError] = useState('')
   const [firstInsight, setFirstInsight] = useState(null)

   useEffect(() => {
      if (location.state?.firstInsight) {
         setFirstInsight(location.state.firstInsight)
      }
   }, [location.state])

   useEffect(() => {
      let mounted = true

      async function load() {
         if (!user?.phone) {
            if (mounted) {
               setStats(null)
               setTransactions([])
               setTrustProfile(null)
               setNotifications([])
            }
            return
         }

         try {
            const query = { external_user_key: user.phone }
            const [statsPayload, txPayload, trustPayload, notificationsPayload] = await Promise.all([
               getDashboardStats({ external_user_key: user.phone }),
               getTransactions({ external_user_key: user.phone }),
               getTrustProfiles(query),
               getNotifications(query),
            ])

            if (!mounted) return

            setStats(statsPayload)
            setTransactions(toList(txPayload))
            setTrustProfile(toList(trustPayload)[0] || null)
            setNotifications(toList(notificationsPayload))
            setError('')
         } catch (loadError) {
            if (!mounted) return
            setError(loadError.message || 'Unable to load operational overview.')
         }
      }

      load()

      return () => {
         mounted = false
      }
   }, [user?.phone])

   const verification = useMemo(() => {
      const completed = transactions.filter((item) => String(item.status).toLowerCase() === 'completed').length
      const pending = transactions.filter((item) => String(item.status).toLowerCase() === 'pending').length
      const rejected = transactions.filter((item) => ['flagged', 'failed', 'reversed'].includes(String(item.status).toLowerCase())).length

      return {
         approved: completed,
         pending,
         rejected,
         trustBoost: Math.min(15, completed * 2),
         confidenceBoost: Math.min(10, completed),
      }
   }, [transactions])

   const flaggedCount = Number(stats?.flagged_count || verification.rejected)
   const totalTransactions = Number(stats?.total_transactions || transactions.length)
   const score = Number(stats?.overall_score ?? 0)
   const derivedTrust = Math.max(0, Math.min(100, 70 + verification.trustBoost - flaggedCount * 3))
   const trustScore = Number.isFinite(Number(trustProfile?.trust_score))
      ? Number(trustProfile.trust_score)
      : derivedTrust
   const confidence = Number(stats?.data_quality ?? 0)
   const unreadNotifications = notifications.filter((item) => String(item.delivery_status).toLowerCase() !== 'read').length

   const riskLevel = stats?.risk_level || 'Unknown'

  return (
    <div className="space-y-10 animate-enter">
      <header className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8 sm:mb-12">
        <div>
           <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-3 sm:mb-4 italic underline decoration-primary/20">[ Dashboard ]</p>
           <h1 className="font-display text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-none italic uppercase underline decoration-white/5">
              Account <span className="text-gradient">Overview</span>
           </h1>
           <p className="text-sm sm:text-xl text-on-surface-variant font-light mt-3 sm:mt-4 italic">Signed in as <span className="text-white font-black">{user?.name}</span>.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <SurfaceCard className="p-4 sm:p-6 bg-white/5 border-white/5 text-center px-6 sm:px-10 relative overflow-hidden group flex-1 md:flex-initial">
              <p className="text-[10px] uppercase text-on-surface-variant mb-2 font-black italic tracking-widest relative z-10">Trust Score</p>
              <p className="text-3xl font-black text-tertiary italic relative z-10">{trustScore}%</p>
              <div className="absolute inset-0 bg-tertiary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           </SurfaceCard>
        </div>
      </header>

         {firstInsight ? (
            <SurfaceCard className="glass-surface border border-primary/20 bg-primary/10 p-6 sm:p-8">
               <div className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-tertiary">
                  <AppIcon name="target" className="h-3.5 w-3.5" />
                  <span>{firstInsight.message || 'First Insight Ready'}</span>
               </div>
               <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                     <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Transaction Risk</p>
                     <p className={`mt-2 text-lg font-black uppercase ${String(firstInsight.riskLevel).toLowerCase() === 'high' ? 'text-risk' : String(firstInsight.riskLevel).toLowerCase() === 'medium' ? 'text-warning' : 'text-safe'}`}>
                        {firstInsight.riskLevel}
                     </p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                     <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Fraud Probability</p>
                     <p className="mt-2 text-lg font-black text-error">{firstInsight.fraudProbability}%</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                     <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Recommendation</p>
                     <p className="mt-2 text-lg font-black text-warning">{firstInsight.recommendation}</p>
                  </div>
               </div>
            </SurfaceCard>
         ) : null}

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Score Gauge Section */}
        <div className="lg:col-span-4 lg:row-span-2">
           <SurfaceCard className="glass-surface p-8 sm:p-12 flex flex-col items-center justify-center text-center border-white/5 relative overflow-hidden h-full group">
              <div className="relative h-48 w-48 sm:h-72 sm:w-72 mb-8 sm:mb-12 group">
                 {/* Circular Gauge SVG */}
                 <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="6" className="text-white/5" />
                    <circle cx="50" cy="50" r="45" fill="transparent" stroke="currentColor" strokeWidth="6" 
                            strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * score) / 850} 
                            strokeLinecap="round" className="text-primary transition-all duration-1000 ease-out" />
                 </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-1 sm:translate-y-2">
                    <p className="text-5xl sm:text-7xl font-black text-white italic tracking-tighter decoration-primary/20 underline">{score}</p>
                    <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-on-surface-variant italic mt-1 sm:mt-2">Overall Score</p>
                  </div>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 sm:p-6 w-full text-left space-y-1 sm:space-y-2">
                 <div className="flex justify-between items-center">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-primary italic">Status</p>
                    <span className="text-[8px] sm:text-[10px] text-tertiary font-bold italic">{trustProfile?.risk_level || `+${verification.trustBoost}% Boost`}</span>
                 </div>
                 <p className="text-[10px] sm:text-xs text-on-surface-variant italic leading-relaxed">Your score is based on <span className="text-white font-bold">{verification.approved}</span> approved records.</p>
              </div>
              <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-3xl rounded-full opacity-50" />
           </SurfaceCard>
        </div>

        {/* METRICS & TRENDS */}
        <div className="lg:col-span-8 grid gap-8 md:grid-cols-2">
            <SurfaceCard className="p-10 border-white/5 bg-white/5 hover:bg-white/10 transition-all group overflow-hidden relative">
               <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-6 italic opacity-50 underline decoration-primary/20">Data Quality</p>
               <div className="flex items-end gap-3 mb-6">
                  <span className="text-5xl font-black text-white italic tracking-tighter">{confidence}%</span>
                  <span className="mb-2 inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-tertiary italic">
                     <AppIcon name="check" className="h-3.5 w-3.5" />
                     <span>Looks Good</span>
                  </span>
               </div>
               <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-tertiary transition-all duration-1000" style={{width: `${confidence}%`}} />
               </div>
               <div className="absolute top-0 right-0 h-32 w-32 bg-tertiary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </SurfaceCard>

            <SurfaceCard className="p-10 border-white/5 bg-white/5 hover:bg-white/10 transition-all group overflow-hidden relative">
               <p className="text-[10px] uppercase font-black tracking-widest text-on-surface-variant mb-6 italic opacity-50 underline decoration-primary/20">Risk Level</p>
               <div className="flex items-end gap-3 mb-6">
                  <span className={`text-5xl font-black italic tracking-tighter ${riskLevel === 'Minimal' ? 'text-tertiary' : 'text-error'}`}>{riskLevel}</span>
                  <span className="mb-2 inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-on-surface-variant italic">
                     <AppIcon name="safety" className="h-3.5 w-3.5" />
                     <span>Current Status</span>
                  </span>
               </div>
               <div className="flex gap-2 h-4 items-end">
                  {[15, 30, 20, 45, 12, 18, 25, 40, 10, 35].map((h, i) => (
                    <div key={i} className="flex-1 bg-white/10 rounded-t-sm group-hover:bg-primary/20 transition-all" style={{height: `${h}%`}} />
                  ))}
               </div>
               <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </SurfaceCard>

            <SurfaceCard className="md:col-span-2 glass-surface p-8 sm:p-12 border-white/5 relative overflow-hidden">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 sm:mb-10">
                  <h3 className="font-display text-lg sm:text-2xl font-black text-white uppercase italic underline decoration-primary/20 tracking-tighter">Verification Summary</h3>
                  <div className="flex gap-4 sm:gap-6 text-[8px] sm:text-[10px] font-black uppercase tracking-widest italic opacity-40">
                     <span>Approved: <span className="text-tertiary">{verification.approved}</span></span>
                     <span>Pending: <span className="text-primary">{verification.pending}</span></span>
                     <span>Unread Alerts: <span className="text-yellow-400">{unreadNotifications}</span></span>
                  </div>
               </div>
               
               <div className="grid gap-4 sm:grid-gap-6 grid-cols-1 sm:grid-cols-3">
                  {[
                              { label: 'Wallet Records', status: 'Up to date', color: 'text-tertiary' },
                              { label: 'Bank Statement', status: verification.approved > 0 ? 'Verified' : 'Required', color: verification.approved > 0 ? 'text-tertiary' : 'text-primary' },
                              { label: 'Identity Check', status: 'Verified', color: 'text-tertiary' }
                  ].map((item, i) => (
                    <div key={i} className="p-4 sm:p-6 rounded-2xl bg-white/5 border border-white/5 group hover:border-primary/20 transition-all text-center">
                       <p className="text-[8px] sm:text-[10px] font-black text-on-surface-variant uppercase italic mb-2 sm:mb-3 opacity-40">{item.label}</p>
                       <p className={`text-xs sm:text-sm font-black italic uppercase italic tracking-widest ${item.color}`}>{item.status}</p>
                    </div>
                  ))}
               </div>
               
               <div className="absolute bottom-[-20px] left-[-20px] h-40 w-40 bg-primary/5 blur-3xl" />
            </SurfaceCard>
        </div>
      </div>
         {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  )
}

export default DashboardHome
