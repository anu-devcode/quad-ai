import { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { SurfaceCard } from '../../../components/ui'
import {
  Users,
  AlertCircle,
  CheckCircle,
  Target,
  Activity,
  Inbox,
  RefreshCw,
  FileText,
} from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import { adminScope, getAdminUsers, getDashboardStats, getLoans, getModelMonitoring, getTransactions, toList } from '../../../services/campusApi'


function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`
}


function formatShortAgo(dateValue) {
  if (!dateValue) return 'unknown time'
  const now = Date.now()
  const then = new Date(dateValue).getTime()
  if (Number.isNaN(then)) return 'unknown time'
  const deltaMinutes = Math.max(0, Math.floor((now - then) / 60000))
  if (deltaMinutes < 1) return 'just now'
  if (deltaMinutes < 60) return `${deltaMinutes}m ago`
  const hours = Math.floor(deltaMinutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}


function buildLastSevenDayTrend(transactions) {
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const slots = []
  const now = new Date()
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(now)
    day.setDate(now.getDate() - i)
    const key = day.toISOString().slice(0, 10)
    slots.push({ key, day: labels[day.getDay()], alerts: 0 })
  }

  const byDay = new Map(slots.map((slot) => [slot.key, slot]))
  transactions
    .filter((item) => String(item.status).toLowerCase() === 'flagged')
    .forEach((item) => {
      const key = item?.created_at ? new Date(item.created_at).toISOString().slice(0, 10) : null
      if (!key || !byDay.has(key)) return
      byDay.get(key).alerts += 1
    })

  return slots.map(({ day, alerts }) => ({ day, alerts }))
}


export default function AdminOverview() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loans, setLoans] = useState([])
  const [adminUsers, setAdminUsers] = useState([])
  const [adminSummary, setAdminSummary] = useState(null)
  const [modelMonitoring, setModelMonitoring] = useState(null)
  const [error, setError] = useState('')

  const scope = useMemo(() => adminScope(user?.phone), [user?.phone])

  useEffect(() => {
    let mounted = true

    async function load() {
      if (!user?.phone) {
        if (mounted) {
          setStats(null)
          setTransactions([])
          setLoans([])
          setAdminUsers([])
          setAdminSummary(null)
          setModelMonitoring(null)
        }
        return
      }

      try {
        const [statsPayload, txPayload, loanPayload, userPayload, modelPayload] = await Promise.all([
          getDashboardStats(scope),
          getTransactions(scope),
          getLoans(scope),
          getAdminUsers(scope),
          getModelMonitoring(),
        ])

        if (!mounted) return

        setStats(statsPayload)
        setTransactions(toList(txPayload))
        setLoans(toList(loanPayload))
        setAdminUsers(Array.isArray(userPayload?.users) ? userPayload.users : [])
        setAdminSummary(userPayload?.summary || null)
        setModelMonitoring(modelPayload)
        setError('')
      } catch (loadError) {
        if (!mounted) return
        setError(loadError.message || 'Unable to load admin dashboard data.')
      }
    }

    load()
    return () => {
      mounted = false
    }
  }, [scope, user?.phone])

  const totalUsers = Number(adminSummary?.total_users ?? adminUsers.length)
  const activeLoans = loans.filter((item) => !['approved', 'rejected'].includes(String(item.status).toLowerCase())).length
  const riskAlerts = Number(stats?.flagged_count ?? 0)
  const approvedLoans = loans.filter((item) => String(item.status).toLowerCase() === 'approved').length
  const approvalRate = loans.length ? (approvedLoans / loans.length) * 100 : 0
  const systemConfidence = Number(modelMonitoring?.summary?.avg_confidence_level || 0) * 100

  const scoreData = useMemo(() => {
    const bins = [
      { name: '300-500', min: 300, max: 500, users: 0 },
      { name: '501-650', min: 501, max: 650, users: 0 },
      { name: '651-750', min: 651, max: 750, users: 0 },
      { name: '751-850', min: 751, max: 850, users: 0 },
    ]

    adminUsers.forEach((entry) => {
      const score = Number(entry?.score || 0)
      const target = bins.find((bin) => score >= bin.min && score <= bin.max)
      if (target) target.users += 1
    })
    return bins.map(({ name, users }) => ({ name, users }))
  }, [adminUsers])

  const fraudTrend = useMemo(() => buildLastSevenDayTrend(transactions), [transactions])

  const riskBreakdown = useMemo(() => {
    const low = Number(stats?.risk_distribution?.low ?? 0)
    const medium = Number(stats?.risk_distribution?.medium ?? 0)
    const high = Number(stats?.risk_distribution?.high ?? 0)
    const total = Math.max(1, low + medium + high)
    return [
      { name: 'Safe', value: Number(((low / total) * 100).toFixed(1)), color: 'var(--safe)' },
      { name: 'Warning', value: Number(((medium / total) * 100).toFixed(1)), color: 'var(--warning)' },
      { name: 'Risk', value: Number(((high / total) * 100).toFixed(1)), color: 'var(--risk)' },
    ]
  }, [stats])

  const recentActivity = useMemo(() => {
    const txEvents = transactions.slice(0, 6).map((item) => ({
      key: `tx-${item.id}`,
      msg: `Transaction ${item.id} is ${String(item.status).toLowerCase()}`,
      time: formatShortAgo(item.created_at),
      type: String(item.status).toLowerCase() === 'flagged' ? 'risk' : 'info',
      at: item.created_at,
    }))

    const loanEvents = loans.slice(0, 6).map((item) => ({
      key: `loan-${item.id}`,
      msg: `Loan ${item.id} is ${String(item.status).toLowerCase()}`,
      time: formatShortAgo(item.updated_at || item.created_at),
      type: String(item.status).toLowerCase() === 'rejected' ? 'risk' : 'primary',
      at: item.updated_at || item.created_at,
    }))

    return [...txEvents, ...loanEvents]
      .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
      .slice(0, 6)
  }, [loans, transactions])

  const flaggedUsers = Number(adminSummary?.flagged_users ?? 0)
  const pendingLoanQueue = loans.filter((item) => ['submitted', 'evaluating', 'evaluated'].includes(String(item.status).toLowerCase())).length
  const pendingEvidenceQueue = Number(stats?.pending_count ?? transactions.filter((item) => String(item.status).toLowerCase() === 'pending').length)

  const statCards = [
    {
      label: 'Total Users',
      value: totalUsers.toLocaleString(),
      icon: <Users className="w-5 h-5 text-info" />,
      trend: `${flaggedUsers} flagged`,
      color: 'border-info/20 bg-info/5',
    },
    {
      label: 'Active Loans',
      value: activeLoans.toLocaleString(),
      icon: <Activity className="w-5 h-5 text-primary" />,
      trend: `${pendingLoanQueue} pending`,
      color: 'border-primary/20 bg-primary/5',
    },
    {
      label: 'Risk Alerts',
      value: riskAlerts.toLocaleString(),
      icon: <AlertCircle className="w-5 h-5 text-risk" />,
      trend: `${Number(stats?.total_transactions ?? 0)} transactions`,
      color: 'border-risk/20 bg-risk/5',
    },
    {
      label: 'Approval Rate',
      value: formatPercent(approvalRate),
      icon: <CheckCircle className="w-5 h-5 text-safe" />,
      trend: `${approvedLoans} approved`,
      color: 'border-safe/20 bg-safe/5',
    },
    {
      label: 'System Confidence',
      value: formatPercent(systemConfidence),
      icon: <Target className="w-5 h-5 text-tertiary" />,
      trend: `${Number(modelMonitoring?.summary?.total_assessments ?? 0)} assessments`,
      color: 'border-tertiary/20 bg-tertiary/5',
    },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-display font-bold text-white tracking-tight">System Control Center</h1>
        <p className="text-on-surface-variant text-sm">Real-time intelligence and system-wide action hub.</p>
      </div>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <div key={stat.label} className={`glass-card rounded-2xl p-6 border transition-transform hover:-translate-y-1 ${stat.color} relative overflow-hidden group`}>
            <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-150 transition-transform duration-500">
              {stat.icon}
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/5 rounded-xl border border-white/10">{stat.icon}</div>
              <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">{stat.label}</p>
            </div>
            <h3 className="text-3xl font-display font-bold text-white mb-2">{stat.value}</h3>
            <p className="text-xs font-semibold text-on-surface-variant">{stat.trend}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SurfaceCard className="glass-card p-6 h-[400px] flex flex-col">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Credit Score Distribution</h3>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: 'rgba(13, 19, 32, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  />
                  <Bar dataKey="users" fill="url(#colorScore)" radius={[6, 6, 0, 0]} />
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SurfaceCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SurfaceCard className="glass-card p-6 h-[300px] flex flex-col">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Fraud Alert Trend</h3>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fraudTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 19, 32, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="alerts" stroke="var(--risk)" strokeWidth={3} dot={{ r: 4, fill: 'var(--risk)' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </SurfaceCard>

            <SurfaceCard className="glass-card p-6 h-[300px] flex flex-col items-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant w-full mb-2">Risk Breakdown</h3>
              <div className="flex-1 w-full min-h-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={riskBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {riskBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 19, 32, 0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <p className="font-display font-bold text-2xl">100%</p>
                </div>
              </div>
              <div className="flex gap-4 mt-2">
                {riskBreakdown.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name}
                  </div>
                ))}
              </div>
            </SurfaceCard>
          </div>
        </div>

        <div className="space-y-6">
          <SurfaceCard className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-primary" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-risk/10 border border-risk/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-risk" />
                  <span className="font-semibold text-white">Review Flagged Users</span>
                </div>
                <span className="bg-risk text-white text-xs px-2 py-0.5 rounded-full font-bold group-hover:scale-110 transition-transform">{flaggedUsers} Pending</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-warning/10 border border-warning/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <Inbox className="w-5 h-5 text-warning" />
                  <span className="font-semibold text-white">Loan Requests</span>
                </div>
                <span className="bg-warning text-white text-xs px-2 py-0.5 rounded-full font-bold group-hover:scale-110 transition-transform">{pendingLoanQueue} Queue</span>
              </button>

              <button className="w-full flex items-center justify-between p-4 rounded-xl bg-info/10 border border-info/20 transition-colors group">
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-info" />
                  <span className="font-semibold text-white">Evidence Approval</span>
                </div>
                <span className="bg-info text-white text-xs px-2 py-0.5 rounded-full font-bold group-hover:scale-110 transition-transform">{pendingEvidenceQueue} Docs</span>
              </button>
            </div>
          </SurfaceCard>

          <SurfaceCard className="glass-card p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-on-surface-variant mb-6">Recent System Activity</h3>
            <div className="space-y-4">
              {recentActivity.map((act) => (
                <div key={act.key} className="flex gap-4">
                  <div className={`mt-0.5 w-2 h-2 rounded-full ${
                    act.type === 'risk'
                      ? 'bg-risk shadow-[0_0_8px_var(--risk)]'
                      : act.type === 'primary'
                        ? 'bg-primary shadow-[0_0_8px_var(--primary)]'
                        : 'bg-info shadow-[0_0_8px_var(--info)]'
                  } flex-shrink-0`} />
                  <div>
                    <p className="text-sm text-white font-medium leading-tight">{act.msg}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{act.time}</p>
                  </div>
                </div>
              ))}
              {!recentActivity.length ? <p className="text-xs text-on-surface-variant">No recent backend activity.</p> : null}
            </div>
          </SurfaceCard>
        </div>
      </div>
    </div>
  )
}
