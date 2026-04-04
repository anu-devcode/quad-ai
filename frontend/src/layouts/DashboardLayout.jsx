import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/dashboard/Sidebar'
import BottomNav from '../components/dashboard/BottomNav'

const pageTitles = {
  '/portal/home': 'Operational Overview',
  '/portal/upload': 'Evidence Ingestion',
  '/portal/insights': 'Transaction Analytics',
  '/portal/profile': 'Credit Intelligence',
  '/portal/status': 'Trust & Fraud Watch',
  '/portal/history': 'Evidence History',
  '/admin/overview': 'System KPIs',
  '/admin/fraud': 'Fraud Monitoring',
  '/admin/review': 'Data Review Panel',
  '/admin/users': 'User Governance',
  '/admin/models': 'Model Integrity',
}

function DashboardLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  const role = user?.role || 'user'
  const isPathAdmin = location.pathname.startsWith('/admin')

  // ENFORCE SEPARATION
  if (isPathAdmin && role !== 'admin') {
    return <Navigate to="/portal/home" replace />
  }
  if (!isPathAdmin && role === 'admin') {
    return <Navigate to="/admin/overview" replace />
  }

  const pageTitle = pageTitles[location.pathname] || 'Operational Hub'

  return (
    <div className="flex h-screen bg-background text-on-surface">
      <div className="analytic-grain" />

      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-20 items-center justify-between border-b border-white/5 bg-surface-container-low/70 px-8 backdrop-blur-3xl relative z-10">
          <div className="flex items-center gap-6">
            <Link to="/" className="lg:hidden flex items-center gap-2 mr-4">
               <div className="h-8 w-8 rounded-lg premium-gradient grid place-items-center text-[10px] font-black text-white italic shadow-premium">Q</div>
            </Link>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary italic opacity-60">
                 [ {isPathAdmin ? 'Control Hub' : 'Citizen Portal'} ]
              </p>
              <h1 className="font-display text-xl font-extrabold text-white tracking-tighter italic uppercase underline decoration-primary/20">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/" className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white italic transition-all decoration-white/10 underline md:flex hidden items-center gap-2">
               <span>← Return to Public</span>
            </Link>

            <div className="flex items-center gap-4 border-l border-white/5 pl-6">
              <div className="text-right flex flex-col justify-center">
                <p className="text-xs font-black text-white italic leading-tight">{user?.name}</p>
                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest italic opacity-40">{user?.role}</p>
              </div>
              <button 
                 onClick={logout}
                 className="h-10 w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-error/10 hover:text-error transition-all"
              >
                 🚪
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 relative animate-slide-up">
          <div className="mx-auto max-w-7xl px-8 py-10">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Bottom nav (mobile) */}
      <BottomNav />
    </div>
  )
}

export default DashboardLayout
