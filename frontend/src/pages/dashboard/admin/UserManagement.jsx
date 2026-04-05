import { useEffect, useMemo, useState } from 'react'
import { SurfaceCard } from '../../../components/ui'
import { Histogram, RadialGauge, ScatterChart, StatusBadge } from '../../../components/dashboard/AdminVisuals'
import { useAuth } from '../../../context/AuthContext'
import { adminScope, getAdminUsers } from '../../../services/campusApi'

function statusTone(status) {
   if (status === 'Verified') return 'good'
   if (status === 'Flagged') return 'warn'
   if (status === 'Blocked') return 'bad'
   return 'neutral'
}

function formatCurrency(value) {
   return Number(value || 0).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
   })
}

function UserManagement() {
   const { user } = useAuth()
   const scope = useMemo(() => adminScope(user?.phone), [user?.phone])

   const [users, setUsers] = useState([])
   const [summary, setSummary] = useState({
      total_users: 0,
      flagged_users: 0,
      blocked_users: 0,
      verified_users: 0,
      average_trust: 0,
      average_risk: 0,
      monthly_volume_total: 0,
   })
   const [activeUserId, setActiveUserId] = useState(null)
   const [query, setQuery] = useState('')
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState('')

   useEffect(() => {
      let mounted = true

      async function load() {
         if (!user?.phone) {
            if (mounted) {
               setUsers([])
               setSummary((prev) => ({ ...prev, total_users: 0 }))
            }
            return
         }

         setLoading(true)
         try {
            const payload = await getAdminUsers(scope)
            if (!mounted) return
            const backendUsers = Array.isArray(payload?.users) ? payload.users : []
            setUsers(backendUsers)
            setSummary((prev) => ({ ...prev, ...(payload?.summary || {}) }))
            setError('')
         } catch (loadError) {
            if (!mounted) return
            setError(loadError.message || 'Unable to load backend user intelligence.')
         } finally {
            if (mounted) setLoading(false)
         }
      }

      load()

      return () => {
         mounted = false
      }
   }, [scope, user?.phone])

   useEffect(() => {
      if (!users.length) {
         setActiveUserId(null)
         return
      }

      if (!activeUserId || !users.some((item) => item.id === activeUserId)) {
         setActiveUserId(users[0].id)
      }
   }, [activeUserId, users])

   const activeUser = useMemo(
      () => users.find((entry) => entry.id === activeUserId) || users[0] || null,
      [activeUserId, users],
   )

   const riskBins = useMemo(
      () => [
         { label: '0-200', value: users.filter((item) => item.score <= 200).length },
         { label: '201-400', value: users.filter((item) => item.score > 200 && item.score <= 400).length },
         { label: '401-600', value: users.filter((item) => item.score > 400 && item.score <= 600).length },
         { label: '601-800', value: users.filter((item) => item.score > 600 && item.score <= 800).length },
         { label: '801+', value: users.filter((item) => item.score > 800).length },
      ],
      [users],
   )

   const scatterPoints = useMemo(
      () => users.map((entry) => ({ id: entry.id, name: entry.full_name || entry.username, trust: entry.trust || 0, risk: entry.risk || 0 })),
      [users],
   )

   const filteredUsers = useMemo(() => {
      const needle = query.trim().toLowerCase()
      return users.filter((entry) => {
         if (!needle) return true
         return [
            entry.full_name,
            entry.username,
            entry.student_id,
            entry.email,
            entry.role,
            entry.status,
         ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(needle))
      })
   }, [query, users])

   return (
      <div className="mx-auto max-w-7xl space-y-8 animate-enter">
         <header className="flex flex-wrap items-end justify-between gap-4">
            <div>
               <p className="section-kicker">Users</p>
               <h1 className="mt-2 font-display text-3xl font-bold text-white sm:text-4xl">User Overview</h1>
               <p className="mt-2 text-sm text-on-surface-variant">View user status, trust score, and activity summary.</p>
            </div>
            <StatusBadge tone="info">Flagged {summary.flagged_users || 0} • Blocked {summary.blocked_users || 0}</StatusBadge>
         </header>

         {error ? <p className="text-sm text-error">{error}</p> : null}

         <div className="grid gap-4 sm:grid-cols-3">
            <SurfaceCard className="glass-surface border-white/10 p-4">
               <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Profiles tracked</p>
               <p className="mt-2 text-2xl font-bold text-white">{summary.total_users || 0}</p>
            </SurfaceCard>
            <SurfaceCard className="glass-surface border-white/10 p-4">
               <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Verified</p>
               <p className="mt-2 text-2xl font-bold text-white">{summary.verified_users || 0}</p>
            </SurfaceCard>
            <SurfaceCard className="glass-surface border-white/10 p-4">
               <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Needs review</p>
               <p className="mt-2 text-2xl font-bold text-white">{(summary.flagged_users || 0) + (summary.blocked_users || 0)}</p>
            </SurfaceCard>
         </div>

         <div className="grid gap-6 lg:grid-cols-12">
            <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-4">
               <h2 className="font-display text-xl font-semibold text-white">Trust Meter</h2>
               {activeUser ? (
                  <>
                     <div className="mt-4 flex justify-center">
                        <RadialGauge value={activeUser.score || 0} max={850} tone={(activeUser.score || 0) < 400 ? 'error' : 'primary'} size={150} />
                     </div>
                     <p className="mt-3 text-center text-sm text-on-surface-variant">{activeUser.full_name || activeUser.username} current score</p>
                  </>
               ) : <p className="mt-4 text-sm text-on-surface-variant">{loading ? 'Loading profiles...' : 'No profile selected.'}</p>}
            </SurfaceCard>

            <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-4">
               <h2 className="font-display text-xl font-semibold text-white">Score Distribution</h2>
               <div className="mt-4">
                     <h2 className="font-display text-xl font-semibold text-white">User List</h2>
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
                     <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search name, username, student ID, email, role"
                        className="w-full rounded-lg border border-white/15 bg-surface-low px-3 py-2 text-sm text-on-surface outline-none focus:border-primary/50 sm:w-96"
                     />
                  </div>
               </div>
               <div className="grid gap-3 p-4 md:hidden">
                  {filteredUsers.map((entry) => (
                     <button
                        key={entry.id}
                        type="button"
                        onClick={() => setActiveUserId(entry.id)}
                        className={`rounded-2xl border p-4 text-left ${activeUser?.id === entry.id ? 'border-primary/40 bg-primary/10' : 'border-white/10 bg-surface-low/40'}`}
                     >
                        <div className="flex items-start justify-between gap-3">
                           <div>
                              <p className="font-semibold text-on-surface">{entry.full_name || entry.username}</p>
                              <p className="mt-1 text-xs text-on-surface-variant">{entry.student_id || entry.email || 'No identifier'}</p>
                              <p className="mt-2 text-xs uppercase tracking-[0.14em] text-on-surface-variant">{entry.role}</p>
                           </div>
                           <StatusBadge tone={statusTone(entry.status)}>{entry.status}</StatusBadge>
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
                        {filteredUsers.map((entry) => (
                           <tr key={entry.id} className="cursor-pointer hover:bg-white/5" onClick={() => setActiveUserId(entry.id)}>
                              <td className="px-5 py-4">
                                 <p className="font-semibold text-on-surface">{entry.full_name || entry.username}</p>
                                 <p className="text-xs text-on-surface-variant">{entry.student_id || entry.email || 'No identifier'}</p>
                              </td>
                              <td className="px-5 py-4 text-on-surface-variant">{entry.role}</td>
                              <td className="px-5 py-4 font-semibold text-white">{entry.score}</td>
                              <td className="px-5 py-4">
                                 <StatusBadge tone={statusTone(entry.status)}>{entry.status}</StatusBadge>
                              </td>
                           </tr>
                        ))}
                        {!filteredUsers.length && (
                           <tr>
                              <td className="px-5 py-4 text-on-surface-variant" colSpan={4}>
                                 {loading ? 'Loading users...' : 'No users match your search.'}
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </SurfaceCard>

            <SurfaceCard className="glass-surface border-white/10 p-6 lg:col-span-4">
               <h2 className="font-display text-xl font-semibold text-white">Selected User</h2>
               {activeUser ? (
                  <>
                     <div className="mt-4 space-y-2 text-sm text-on-surface-variant">
                        <p>Name: <span className="text-on-surface">{activeUser.full_name || activeUser.username}</span></p>
                        <p>Username: <span className="text-on-surface">{activeUser.username}</span></p>
                        <p>Role: <span className="text-on-surface">{activeUser.role}</span></p>
                        <p>Last activity: <span className="text-on-surface">{activeUser.last_activity_at ? new Date(activeUser.last_activity_at).toLocaleString() : 'No activity yet'}</span></p>
                        <p>Monthly volume: <span className="text-on-surface">${formatCurrency(activeUser.monthly_volume)}</span></p>
                        <p>Status: <span className="text-on-surface">{activeUser.status}</span></p>
                     </div>
                     <div className="mt-5 grid gap-3 text-xs text-on-surface-variant">
                        <div className="rounded-xl border border-white/10 bg-surface-low/50 px-4 py-3">Total transactions: <span className="text-on-surface">{activeUser.total_transactions}</span></div>
                        <div className="rounded-xl border border-white/10 bg-surface-low/50 px-4 py-3">Flagged transaction rate: <span className="text-on-surface">{Number(activeUser.flagged_rate_percent || 0).toFixed(1)}%</span></div>
                        <div className="rounded-xl border border-white/10 bg-surface-low/50 px-4 py-3">Loan rejection rate: <span className="text-on-surface">{Number(activeUser.rejected_loan_rate_percent || 0).toFixed(1)}%</span></div>
                     </div>
                  </>
               ) : <p className="mt-4 text-sm text-on-surface-variant">{loading ? 'Loading profile...' : 'No profile selected.'}</p>}
            </SurfaceCard>
         </div>
      </div>
   )
}

export default UserManagement
