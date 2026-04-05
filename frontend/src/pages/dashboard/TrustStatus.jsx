import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { SurfaceCard } from '../../components/ui'
import {
   getNotifications,
   getRiskAlerts,
   getTrustProfiles,
   markNotificationRead,
   toList,
} from '../../services/campusApi'

function TrustStatus() {
   const PAGE_SIZE = 4

   const { user } = useAuth()
   const [trustProfile, setTrustProfile] = useState(null)
   const [notifications, setNotifications] = useState([])
   const [alerts, setAlerts] = useState([])
   const [alertFilter, setAlertFilter] = useState('open')
   const [notificationFilter, setNotificationFilter] = useState('all')
   const [alertPage, setAlertPage] = useState(1)
   const [notificationPage, setNotificationPage] = useState(1)
   const [error, setError] = useState('')
   const [loading, setLoading] = useState(false)

   useEffect(() => {
      let mounted = true

      async function load() {
         if (!user?.phone) {
            if (!mounted) return
            setTrustProfile(null)
            setNotifications([])
            setAlerts([])
            return
         }

         setLoading(true)
         try {
            const query = { external_user_key: user.phone }
            const [trustPayload, notificationsPayload, alertsPayload] = await Promise.all([
               getTrustProfiles(query),
               getNotifications(query),
               getRiskAlerts(query),
            ])

            if (!mounted) return

            const trustRows = toList(trustPayload)
            setTrustProfile(trustRows[0] || null)
            setNotifications(toList(notificationsPayload))
            setAlerts(toList(alertsPayload))
            setError('')
         } catch (loadError) {
            if (!mounted) return
            setError(loadError.message || 'Unable to load safety status data.')
         } finally {
            if (mounted) setLoading(false)
         }
      }

      load()

      return () => {
         mounted = false
      }
   }, [user?.phone])

   const unreadNotifications = useMemo(
      () => notifications.filter((item) => String(item.delivery_status).toLowerCase() !== 'read').length,
      [notifications],
   )

   const openAlerts = useMemo(
      () => alerts.filter((item) => String(item.status).toLowerCase() === 'open'),
      [alerts],
   )

   const filteredAlerts = useMemo(() => {
      if (alertFilter === 'all') return alerts
      if (alertFilter === 'resolved') return alerts.filter((item) => String(item.status).toLowerCase() === 'resolved')
      return alerts.filter((item) => String(item.status).toLowerCase() === 'open')
   }, [alertFilter, alerts])

   const filteredNotifications = useMemo(() => {
      if (notificationFilter === 'all') return notifications
      if (notificationFilter === 'read') return notifications.filter((item) => String(item.delivery_status).toLowerCase() === 'read')
      return notifications.filter((item) => String(item.delivery_status).toLowerCase() !== 'read')
   }, [notificationFilter, notifications])

   const totalAlertPages = Math.max(1, Math.ceil(filteredAlerts.length / PAGE_SIZE))
   const totalNotificationPages = Math.max(1, Math.ceil(filteredNotifications.length / PAGE_SIZE))

   const pagedAlerts = useMemo(() => {
      const start = (alertPage - 1) * PAGE_SIZE
      return filteredAlerts.slice(start, start + PAGE_SIZE)
   }, [PAGE_SIZE, alertPage, filteredAlerts])

   const pagedNotifications = useMemo(() => {
      const start = (notificationPage - 1) * PAGE_SIZE
      return filteredNotifications.slice(start, start + PAGE_SIZE)
   }, [PAGE_SIZE, filteredNotifications, notificationPage])

   useEffect(() => {
      setAlertPage(1)
   }, [alertFilter])

   useEffect(() => {
      setNotificationPage(1)
   }, [notificationFilter])

   useEffect(() => {
      if (alertPage > totalAlertPages) {
         setAlertPage(totalAlertPages)
      }
   }, [alertPage, totalAlertPages])

   useEffect(() => {
      if (notificationPage > totalNotificationPages) {
         setNotificationPage(totalNotificationPages)
      }
   }, [notificationPage, totalNotificationPages])

   const metrics = useMemo(
      () => [
         {
            label: 'Trust Score',
            value: trustProfile ? `${Number(trustProfile.trust_score || 0).toFixed(1)}%` : '--',
            status: trustProfile?.risk_level || 'Unknown',
         },
         {
            label: 'Open Risk Alerts',
            value: String(openAlerts.length),
            status: openAlerts.length > 0 ? 'Needs review' : 'All clear',
         },
         {
            label: 'Unread Notifications',
            value: String(unreadNotifications),
            status: unreadNotifications > 0 ? 'New updates' : 'Up to date',
         },
      ],
      [openAlerts.length, trustProfile, unreadNotifications],
   )

   async function handleMarkRead(notificationId) {
      if (!user?.phone) return
      try {
         await markNotificationRead(notificationId, { external_user_key: user.phone })
         setNotifications((prev) =>
            prev.map((item) =>
               item.id === notificationId
                  ? {
                       ...item,
                       delivery_status: 'read',
                       read_at: new Date().toISOString(),
                    }
                  : item,
            ),
         )
      } catch (markError) {
         setError(markError.message || 'Unable to mark notification as read.')
      }
   }

   return (
      <div className="max-w-6xl mx-auto space-y-12 animate-enter">
      <header className="mb-16">
         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-6 italic underline decoration-primary/20">[ Safety Center ]</p>
         <h1 className="font-display text-4xl font-extrabold text-white tracking-tight leading-tighter italic uppercase underline decoration-white/5">
            Trust & <span className="text-gradient">Safety</span>
         </h1>
         <p className="text-xl text-on-surface-variant font-light mt-4 italic">See your trust score, important alerts, and account notifications in one place.</p>
      </header>

      <div className="grid gap-12 lg:grid-cols-12">
        {/* TOP METRICS GRID */}
        <div className="lg:col-span-12 grid gap-8 md:grid-cols-3">
           {metrics.map((m, i) => (
              <SurfaceCard key={i} className="p-10 border-white/5 bg-white/5 hover:bg-white/10 transition-all cursor-default group relative overflow-hidden">
                 <p className="text-[10px] font-black uppercase text-on-surface-variant tracking-[0.2em] mb-6 italic opacity-60 underline decoration-primary/20">{m.label}</p>
                 <div className="flex items-center justify-between">
                    <span className="text-5xl font-black text-white italic tracking-tighter decoration-primary/20 underline">{m.value}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic bg-primary/10 px-4 py-1 rounded border border-primary/20">{m.status}</span>
                 </div>
                 <div className="absolute top-0 right-0 h-40 w-40 bg-primary/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </SurfaceCard>
           ))}
        </div>

        {/* RISK FLAGS / SUSPICIOUS ACTIVITY */}
        <div className="lg:col-span-8">
           <SurfaceCard className="glass-surface p-14 border-white/5 block min-h-[600px] relative">
              <div className="flex justify-between items-center mb-16">
                 <h2 className="font-display text-2xl font-black text-white italic uppercase underline decoration-primary/20 tracking-tighter">Important Alerts</h2>
                 <div className="flex items-center gap-2">
                    <button onClick={() => setAlertFilter('open')} className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${alertFilter === 'open' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-on-surface-variant border border-white/10'}`}>Open</button>
                    <button onClick={() => setAlertFilter('resolved')} className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${alertFilter === 'resolved' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-on-surface-variant border border-white/10'}`}>Resolved</button>
                    <button onClick={() => setAlertFilter('all')} className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${alertFilter === 'all' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-on-surface-variant border border-white/10'}`}>All</button>
                 </div>
              </div>

              <div className="space-y-10">
                 {pagedAlerts.map((f, i) => (
                    <div key={i} className="group p-10 rounded-[3rem] bg-white/5 border border-white/5 hover:border-error/20 transition-all cursor-default relative overflow-hidden">
                       <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                          <div className="flex-1">
                             <div className="flex items-center gap-4 mb-6">
                                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded border shadow-premium ${String(f.severity).toLowerCase() === 'high' || String(f.severity).toLowerCase() === 'critical' ? 'text-error border-error/20 bg-error/10' : 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10'}`}>{f.severity} Alert</span>
                                <span className="text-[10px] font-bold text-on-surface-variant italic opacity-40 uppercase tracking-widest">{f.alert_type}</span>
                             </div>
                             <h4 className="text-2xl font-black text-white italic uppercase group-hover:text-primary transition-colors mb-4 underline decoration-white/5">{f.pattern_key || 'Alert Pattern'}</h4>
                             <p className="text-sm text-on-surface-variant italic font-light leading-relaxed max-w-2xl">{JSON.stringify(f.details || {})}</p>
                          </div>
                          <div className="flex flex-col items-end shrink-0">
                             <p className="text-[10px] text-on-surface-variant font-bold mb-6 italic opacity-40 uppercase tracking-widest">{f.detected_at ? new Date(f.detected_at).toLocaleString() : 'Unknown time'}</p>
                             <button className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black text-primary uppercase tracking-widest hover:bg-primary hover:text-white transition-all italic shadow-premium">View →</button>
                          </div>
                       </div>
                       <div className="absolute left-0 top-0 h-full w-1.5 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                    </div>
                 ))}
                 
                 {pagedAlerts.length === 0 && (
                    <div className="flex flex-col items-center justify-center p-24 opacity-30 text-center italic">
                       <div className="text-7xl mb-10 animate-bounce">🛡️</div>
                       <p className="text-2xl font-black text-white italic tracking-tighter uppercase underline decoration-primary/20">Everything Looks Good</p>
                       <p className="text-xs text-on-surface-variant mt-4 font-light">No open alerts right now.</p>
                    </div>
                 )}

                 {filteredAlerts.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                       <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Page {alertPage} of {totalAlertPages}</p>
                       <div className="flex gap-2">
                          <button
                             onClick={() => setAlertPage((prev) => Math.max(1, prev - 1))}
                             disabled={alertPage <= 1}
                             className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant disabled:opacity-40"
                          >
                             Prev
                          </button>
                          <button
                             onClick={() => setAlertPage((prev) => Math.min(totalAlertPages, prev + 1))}
                             disabled={alertPage >= totalAlertPages}
                             className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant disabled:opacity-40"
                          >
                             Next
                          </button>
                       </div>
                    </div>
                 )}
              </div>
              <div className="absolute bottom-6 right-10 text-[9px] font-bold text-on-surface-variant/20 italic tracking-widest uppercase">Status: Protected</div>
           </SurfaceCard>
        </div>

        {/* PROTECTION HUD SIDEBAR */}
        <div className="lg:col-span-4 space-y-12">
           <SurfaceCard className="glass-surface p-12 h-full border-white/5 bg-surface-container-high/40 text-center relative overflow-hidden group">
              <div className="text-6xl mb-10 group-hover:scale-110 transition-transform duration-1000 decoration-primary/20 underline opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-100">🛡️</div>
              <h2 className="font-display text-xl font-black text-white italic uppercase underline decoration-primary/20 mb-12 tracking-tighter">Account Safety Settings</h2>
              
              <div className="space-y-8 text-left relative z-10">
                 <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group/it">
                    <p className="text-[10px] font-black text-white group-hover/it:text-primary transition-colors underline decoration-white/10 uppercase italic mb-4 tracking-widest">Share Activity Logs</p>
                    <p className="text-[10px] text-on-surface-variant font-light italic leading-relaxed">Choose whether to share activity logs when you request support.</p>
                    <div className="mt-6 flex justify-end">
                       <div className="h-7 w-14 rounded-full bg-primary/10 border border-primary/20 p-1 cursor-pointer">
                          <div className="h-5 w-5 rounded-full bg-primary shadow-premium" />
                       </div>
                    </div>
                 </div>

                 <div className="p-6 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group/mask">
                    <p className="text-[10px] font-black text-white group-hover/mask:text-primary transition-colors underline decoration-white/10 uppercase italic mb-4 tracking-widest">Hide Merchant Details</p>
                    <p className="text-[10px] text-on-surface-variant font-light italic leading-relaxed">Keep merchant names private while still using your transactions for scoring.</p>
                    <div className="mt-6 flex justify-end">
                       <div className="h-7 w-14 rounded-full bg-white/10 border border-white/5 p-1 cursor-pointer">
                          <div className="h-5 w-5 bg-white/10 border border-white/20 rounded-full translate-x-7" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="mt-16 pt-12 border-t border-white/5 relative z-10">
                 <p className="text-[10px] font-black uppercase text-on-surface-variant mb-8 italic opacity-40 tracking-[0.3em] underline decoration-white/5">System Notifications</p>
                 <div className="mb-4 flex items-center gap-2">
                    <button onClick={() => setNotificationFilter('all')} className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${notificationFilter === 'all' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-on-surface-variant border border-white/10'}`}>All</button>
                    <button onClick={() => setNotificationFilter('unread')} className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${notificationFilter === 'unread' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-on-surface-variant border border-white/10'}`}>Unread</button>
                    <button onClick={() => setNotificationFilter('read')} className={`px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest ${notificationFilter === 'read' ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-white/5 text-on-surface-variant border border-white/10'}`}>Read</button>
                 </div>
                 <div className="space-y-3 text-left max-h-64 overflow-y-auto">
                    {pagedNotifications.map((item) => (
                       <div key={item.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">{item.title}</p>
                          <p className="mt-2 text-[10px] text-on-surface-variant leading-relaxed">{item.message}</p>
                          <div className="mt-3 flex items-center justify-between gap-3">
                             <span className="text-[9px] uppercase text-on-surface-variant">{item.category}</span>
                             {String(item.delivery_status).toLowerCase() !== 'read' ? (
                                <button
                                   onClick={() => handleMarkRead(item.id)}
                                   className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-primary"
                                >
                                   Mark Read
                                </button>
                             ) : (
                                <span className="text-[9px] uppercase text-tertiary">Read</span>
                             )}
                          </div>
                       </div>
                    ))}
                    {!filteredNotifications.length ? <p className="text-xs text-on-surface-variant">No notifications yet.</p> : null}
                 </div>

                 {filteredNotifications.length > 0 && (
                    <div className="mt-4 flex items-center justify-between">
                       <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">Page {notificationPage} of {totalNotificationPages}</p>
                       <div className="flex gap-2">
                          <button
                             onClick={() => setNotificationPage((prev) => Math.max(1, prev - 1))}
                             disabled={notificationPage <= 1}
                             className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant disabled:opacity-40"
                          >
                             Prev
                          </button>
                          <button
                             onClick={() => setNotificationPage((prev) => Math.min(totalNotificationPages, prev + 1))}
                             disabled={notificationPage >= totalNotificationPages}
                             className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant disabled:opacity-40"
                          >
                             Next
                          </button>
                       </div>
                    </div>
                 )}
              </div>
              <div className="absolute top-[-20%] right-[-20%] h-80 w-80 bg-primary/5 blur-[100px] rounded-full pointer-events-none" />
           </SurfaceCard>
        </div>
      </div>

      {loading ? <p className="text-sm text-primary">Loading account safety data...</p> : null}
      {error ? <p className="text-sm text-error">{error}</p> : null}
    </div>
  )
}

export default TrustStatus
