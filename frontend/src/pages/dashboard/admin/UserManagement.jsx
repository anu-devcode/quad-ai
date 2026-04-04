import { SurfaceCard } from '../../../components/ui'
import { Histogram, RadialGauge, ScatterChart, StatusBadge } from '../../../components/dashboard/AdminVisuals'
import { useEffect, useMemo, useState } from 'react'
import { useAdminOps } from '../../../context/AdminOpsContext'
import { useAuth } from '../../../context/AuthContext'

function UserManagement() {
   const { users, flagUser, blockUser, restoreUser, userSummary } = useAdminOps()
   const { user } = useAuth()
   const [activeUser, setActiveUser] = useState(users[0] || null)
   const [query, setQuery] = useState('')
   const [message, setMessage] = useState('')

   useEffect(() => {
      if (!activeUser && users[0]) {
         setActiveUser(users[0])
         return
      }

      if (activeUser) {
         const next = users.find((entry) => entry.id === activeUser.id)
         if (next) setActiveUser(next)
      }
   }, [users, activeUser])

   const riskBins = useMemo(() => [
      { label: '0-200', value: users.filter((item) => item.score <= 200).length },
      { label: '201-400', value: users.filter((item) => item.score > 200 && item.score <= 400).length },
      { label: '401-600', value: users.filter((item) => item.score > 400 && item.score <= 600).length },
      { label: '601-800', value: users.filter((item) => item.score > 600 && item.score <= 800).length },
      { label: '801+', value: users.filter((item) => item.score > 800).length },
   ], [users])

   const scatterPoints = useMemo(() => users.map((entry) => ({
      id: entry.id,
      name: entry.name,
      trust: entry.trust,
      risk: entry.risk,
   })), [users])

   const filteredUsers = useMemo(() => users.filter((entry) => {
      const needle = query.trim().toLowerCase()
      if (!needle) return true
      return entry.name.toLowerCase().includes(needle) || entry.phone.toLowerCase().includes(needle) || entry.role.toLowerCase().includes(needle)
   }), [users, query])

   const actor = user?.name || 'System Admin'

   const handleFlag = () => {
      if (!activeUser) return
      flagUser(activeUser.id, actor)
      setMessage(`${activeUser.name} moved into flagged review state.`)
   }

   const handleBlock = () => {
      if (!activeUser) return
      blockUser(activeUser.id, actor)
      setMessage(`${activeUser.name} has been blocked and escalated.`)
   }

   const handleRestore = () => {
      if (!activeUser) return
      restoreUser(activeUser.id, actor)
      setMessage(`${activeUser.name} restored to normal monitoring.`)
   }

  return (
      <div className="mx-auto max-w-7xl space-y-8 animate-enter">
         <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
               <p className="section-kicker">Identity Analytics</p>
               <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">User Intelligence</h1>
               <p className="mt-2 text-sm text-on-surface-variant">Blend behavioral risk signals with profile context to drive policy actions.</p>
            </div>
            <StatusBadge tone="info">Flagged {userSummary.flagged} • Blocked {userSummary.blocked}</StatusBadge>
         </header>
         {message ? <p className="text-sm text-tertiary">{message}</p> : null}

         <div className="grid gap-4 sm:grid-cols-3">
            <SurfaceCard className="glass-surface border-white/10 p-4">
               <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Profiles tracked</p>
               <p className="mt-2 text-2xl font-bold text-white">{userSummary.total}</p>
            </SurfaceCard>
            <SurfaceCard className="glass-surface border-white/10 p-4">
               <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Verified</p>
               <p className="mt-2 text-2xl font-bold text-white">{userSummary.verified}</p>
            </SurfaceCard>
            <SurfaceCard className="glass-surface border-white/10 p-4">
               <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Needs review</p>
               <p className="mt-2 text-2xl font-bold text-white">{userSummary.flagged + userSummary.blocked}</p>
            </SurfaceCard>
         </div>

         <div className="grid gap-6 lg:grid-cols-12">
            <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-4">
               <h2 className="font-display text-xl font-semibold text-white">Trust Gauge</h2>
               {activeUser ? (
                 <>
                   <div className="mt-4 flex justify-center">
                      <RadialGauge value={activeUser.score} max={850} tone={activeUser.score < 400 ? 'error' : 'primary'} size={150} />
                   </div>
                   <p className="mt-3 text-center text-sm text-on-surface-variant">{activeUser.name} current score</p>
                 </>
               ) : <p className="mt-4 text-sm text-on-surface-variant">No profile selected.</p>}
            </SurfaceCard>

            <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-4">
               <h2 className="font-display text-xl font-semibold text-white">Score Distribution</h2>
               <div className="mt-4">
                  <Histogram bins={riskBins} />
               </div>
            </SurfaceCard>

            <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-4">
               <h2 className="font-display text-xl font-semibold text-white">Trust vs Risk Map</h2>
               <div className="mt-4">
                  <ScatterChart points={scatterPoints} />
               </div>
            </SurfaceCard>
         </div>

         <div className="grid gap-6 lg:grid-cols-12">
            <SurfaceCard className="glass-surface border-white/10 p-0 overflow-hidden lg:col-span-8">
               <div className="border-b border-white/10 px-6 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-display text-xl font-semibold text-white">Identity Directory</h2>
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search user, phone, or role" className="w-full rounded-lg border border-white/15 bg-surface-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50 sm:w-72" />
                  </div>
               </div>
                      <div className="grid gap-3 p-4 md:hidden">
                           {filteredUsers.map((entry) => (
                              <button
                                 key={entry.id}
                                 type="button"
                                 onClick={() => setActiveUser(entry)}
                                 className={`rounded-2xl border p-4 text-left ${activeUser?.id === entry.id ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-surface-low/40'}`}
                              >
                                 <div className="flex items-start justify-between gap-3">
                                    <div>
                                       <p className="font-semibold text-on-surface">{entry.name}</p>
                                       <p className="mt-1 text-xs text-on-surface-variant">{entry.phone}</p>
                                       <p className="mt-2 text-xs uppercase tracking-[0.14em] text-on-surface-variant">{entry.role}</p>
                                    </div>
                                    <StatusBadge tone={entry.status === 'Verified' ? 'good' : entry.status === 'Blocked' ? 'bad' : entry.status === 'Flagged' ? 'warn' : 'neutral'}>{entry.status}</StatusBadge>
                                 </div>
                                 <div className="mt-3 flex items-center justify-between text-sm">
                                    <span className="text-on-surface-variant">Score</span>
                                    <span className="font-semibold text-white">{entry.score}</span>
                                 </div>
                              </button>
                           ))}
                      </div>
                      <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-surface-low/60 text-[10px] uppercase tracking-[0.16em] text-on-surface-variant">
                        <tr>
                           <th className="px-5 py-3">User</th>
                           <th className="px-5 py-3">Role</th>
                           <th className="px-5 py-3">Score</th>
                           <th className="px-5 py-3">Status</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-white/10">
                        {filteredUsers.map((u) => (
                           <tr key={u.id} className="cursor-pointer hover:bg-white/5" onClick={() => setActiveUser(u)}>
                              <td className="px-5 py-4">
                                 <p className="font-semibold text-on-surface">{u.name}</p>
                                 <p className="text-xs text-on-surface-variant">{u.phone}</p>
                              </td>
                              <td className="px-5 py-4 text-on-surface-variant">{u.role}</td>
                              <td className="px-5 py-4 font-semibold text-white">{u.score}</td>
                              <td className="px-5 py-4">
                                 <StatusBadge tone={u.status === 'Verified' ? 'good' : u.status === 'Blocked' ? 'bad' : u.status === 'Flagged' ? 'warn' : 'neutral'}>{u.status}</StatusBadge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </SurfaceCard>

            <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-4">
               <h2 className="font-display text-xl font-semibold text-white">Profile Drilldown</h2>
               {activeUser ? (
                 <>
                   <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
                      <p>Name: <span className="text-on-surface">{activeUser.name}</span></p>
                      <p>Phone: <span className="text-on-surface">{activeUser.phone}</span></p>
                      <p>Role: <span className="text-on-surface">{activeUser.role}</span></p>
                      <p>Updated: <span className="text-on-surface">{activeUser.date}</span></p>
                      <p>Monthly volume: <span className="text-on-surface">${activeUser.monthlyVolume.toLocaleString()}</span></p>
                      <p>Status: <span className="text-on-surface">{activeUser.status}</span></p>
                    </div>
                    <div className="mt-5 grid gap-3">
                      <button onClick={handleFlag} className="rounded-xl bg-yellow-400/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-yellow-400">Flag account</button>
                      <button onClick={handleBlock} className="rounded-xl bg-error/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-error">Block account</button>
                      <button onClick={handleRestore} className="rounded-xl bg-primary/20 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">Restore account</button>
                    </div>
                 </>
               ) : <p className="mt-4 text-sm text-on-surface-variant">No profile selected.</p>}
            </SurfaceCard>
         </div>
      </div>
  )
}

export default UserManagement
