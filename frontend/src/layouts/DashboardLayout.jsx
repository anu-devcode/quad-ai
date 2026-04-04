import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from '../components/dashboard/Sidebar'
import BottomNav from '../components/dashboard/BottomNav'

const pageTitles = {
  '/dashboard/home': 'Home',
  '/dashboard/history': 'Transaction History',
  '/dashboard/send': 'Send Money',
  '/dashboard/loan': 'Loan Request',
  '/dashboard/admin': 'Admin Console',
}

function DashboardLayout() {
  const { isAuthenticated, user, logout } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  return (
    <div className="flex h-screen bg-background text-on-surface">
      <div className="analytic-grain" />

      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-outline-variant/40 bg-surface-lowest/70 px-4 backdrop-blur-xl sm:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile logo */}
            <div className="grid h-8 w-8 place-items-center rounded-lg premium-gradient text-[10px] font-bold text-white shadow-premium lg:hidden">
              SI
            </div>
            <div>
              <p className="hidden text-[10px] font-bold uppercase tracking-[0.08em] text-on-surface-variant sm:block">
                Institutional Ledger
              </p>
              <h1 className="font-display text-lg font-semibold text-on-surface sm:text-xl">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative grid h-9 w-9 place-items-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-high hover:text-on-surface">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>

            {/* User avatar (mobile) */}
            <button
              onClick={logout}
              className="grid h-9 w-9 place-items-center rounded-full bg-surface-highest text-xs font-bold text-on-surface-variant transition-colors hover:bg-error-container hover:text-error lg:hidden"
              title="Sign out"
            >
              {user?.initials || 'U'}
            </button>

            {/* User avatar (desktop) */}
            <div className="hidden items-center gap-3 rounded-lg px-2 py-1 lg:flex">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-surface-highest text-xs font-bold text-on-surface-variant">
                {user?.initials || 'U'}
              </div>
              <p className="text-sm font-medium text-on-surface">{user?.name}</p>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-8">
          <div className="mx-auto max-w-7xl animate-enter px-4 py-6 sm:px-8 sm:py-8">
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
