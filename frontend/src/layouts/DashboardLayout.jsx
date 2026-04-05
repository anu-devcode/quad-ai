import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/dashboard/Sidebar'
import BottomNav from '../components/dashboard/BottomNav'

const pageTitles = {
  '/portal/home': 'Overview',
  '/portal/upload': 'Upload Data',
  '/portal/insights': 'Spending Insights',
  '/portal/profile': 'Credit Score',
  '/portal/status': 'Safety Alerts',
  '/portal/history': 'History',
  '/portal/loan': 'Loan Requests',
}

function DashboardLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const location = useLocation()

  // ── Guard 1: must be authenticated ──────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  // ── Guard 2: admins must use their own layout — hard block ───────────────
  // An admin that somehow lands here is redirected to their portal, NOT given user access
  if (isAdmin) {
    return <Navigate to="/admin/overview" replace />
  }

  // ── Guard 3: path must be a user portal path ─────────────────────────────
  // Prevents a user from navigating to /admin/* even if they somehow pass guard 2
  if (location.pathname.startsWith('/admin')) {
    return <Navigate to="/portal/home" replace />
  }

  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  return (
    <div className="flex h-screen bg-transparent text-on-surface relative isolate">
      {/* ─── Institutional Animated Background ─── */}
      <div className="fixed inset-0 z-[-10] pointer-events-none">
        <div className="mesh-gradient-bg" />
        <div className="blueprint-grid" />
        <div className="neural-particles">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="neural-particle" 
              style={{ 
                '--x': `${Math.random() * 100}%`, 
                '--y': `${Math.random() * 100}%`,
                '--d': `${15 + Math.random() * 20}s`,
                animationDelay: `${Math.random() * 10}s`
              }} 
            />
          ))}
        </div>
        <div className="landing-vignette fixed inset-0" />
      </div>
      <div className="analytic-grain fixed inset-0 z-50 pointer-events-none" />

      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 sm:h-16 items-center justify-between border-b border-white/5 bg-surface-container-low/70 px-4 sm:px-8 backdrop-blur-3xl relative z-10">
          <div className="flex items-center gap-6">
            <Link to="/" className="lg:hidden flex items-center gap-2 mr-4">
              <div className="h-8 w-8 rounded-lg premium-gradient grid place-items-center text-[10px] font-black text-white italic shadow-premium">
                Q
              </div>
            </Link>
            <div>
              <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] text-primary italic opacity-60">
                [ User Dashboard ]
              </p>
              <h1 className="font-display text-sm sm:text-xl font-extrabold text-white tracking-tighter italic uppercase underline decoration-primary/20">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:text-white italic transition-all decoration-white/10 underline md:flex hidden items-center gap-2"
            >
              <span>← Back to Website</span>
            </Link>

            <div className="flex items-center gap-4 border-l border-white/5 pl-6">
              <div className="text-right flex flex-col justify-center">
                <p className="text-xs font-black text-white italic leading-tight">{user?.name}</p>
                <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest italic opacity-40">
                  {user?.role}
                </p>
              </div>
              <button
                onClick={logout}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-error/10 hover:text-error transition-all"
                title="Logout"
              >
                🚪
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8 relative animate-slide-up">
          <div className="mx-auto max-w-7xl px-4 sm:px-8 py-6 sm:py-10">
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
