import { Navigate, Outlet, useLocation, Link } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// Admin-only nav links — only admin paths, never /portal/*
const adminNavLinks = [
  { name: 'Control Center', icon: '🧭', path: '/admin/overview' },
  { name: 'Risk Engine', icon: '🚨', path: '/admin/fraud' },
  { name: 'Evidence Lab', icon: '📥', path: '/admin/review' },
  { name: 'User Intelligence', icon: '👥', path: '/admin/users' },
  { name: 'AI Model Insights', icon: '🤖', path: '/admin/models' },
  { name: 'Analytics Hub', icon: '📊', path: '/admin/analytics' },
  { name: 'System Config', icon: '⚙️', path: '/admin/config' },
  { name: 'Audit Trail', icon: '📜', path: '/admin/audit' },
]

const pageTitles = {
  '/admin/overview': 'Control Center',
  '/admin/fraud': 'Risk Engine',
  '/admin/review': 'Evidence Lab',
  '/admin/users': 'User Intelligence',
  '/admin/models': 'AI Model Insights',
  '/admin/analytics': 'Analytics Hub',
  '/admin/config': 'System Config',
  '/admin/audit': 'Audit Trail',
}

function AdminLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // ── Guard 1: must be authenticated ──────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to="/admin/auth" replace />
  }

  // ── Guard 2: must be admin — regular users are NEVER allowed ─────────────
  if (!isAdmin) {
    // Do NOT redirect to /portal/home here — just eject back to user auth
    // This prevents any user from "stumbling" into admin via URL manipulation
    return <Navigate to="/auth" replace />
  }

  // ── Guard 3: path must start with /admin —————————————————————————————————
  if (!location.pathname.startsWith('/admin')) {
    return <Navigate to="/admin/overview" replace />
  }

  const pageTitle = pageTitles[location.pathname] || 'Control Hub'
  const primaryMobileLinks = adminNavLinks.slice(0, 3)

  return (
    <div className="flex h-screen bg-background text-on-surface">
      <div className="analytic-grain" />

      {/* ─── ADMIN SIDEBAR ─── */}
      <aside className="hidden lg:flex w-72 flex-col bg-surface-container-low border-r border-error/10 relative z-20 h-screen">
        {/* Brand */}
        <div className="flex items-center gap-3 p-8 border-b border-error/10">
          <Link to="/admin/overview" className="flex items-center gap-3 group">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-container border border-error/20 shadow-premium ring-1 ring-error/20 group-hover:scale-110 transition-transform overflow-hidden">
              <img src="/logo.png" alt="Q" className="h-full w-full object-cover scale-110" />
            </div>
            <div>
              <p className="font-display text-2xl font-black text-white italic tracking-tighter leading-none">
                Quirass
              </p>
              <p className="text-[9px] font-black uppercase text-error tracking-widest italic opacity-60">
                Control Hub
              </p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-error mb-6 px-4 italic opacity-50 underline decoration-error/20">
            Admin Intelligence
          </p>
          {adminNavLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                  isActive
                    ? 'bg-error/20 text-white shadow-premium ring-1 ring-error/30'
                    : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="text-xl group-hover:scale-110 transition-transform">
                  {link.icon}
                </span>
                <span className="text-xs font-black uppercase tracking-widest italic">
                  {link.name}
                </span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-error/10 space-y-4">
          <div className="px-4 py-3 rounded-xl bg-error/5 border border-error/10">
            <p className="text-[10px] font-black uppercase tracking-widest text-error italic opacity-70">
              Logged in as
            </p>
            <p className="text-xs font-black text-white italic mt-1">{user?.name}</p>
            <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest italic opacity-40">
              {user?.phone}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-error/10 text-error text-[10px] font-black uppercase tracking-widest hover:bg-error/20 transition-all italic shadow-premium"
          >
            Terminate Session
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="relative z-10 flex min-h-14 items-center justify-between gap-3 border-b border-error/10 bg-surface-container-low/70 px-4 py-3 backdrop-blur-3xl sm:min-h-16 sm:px-8">
          <div className="flex min-w-0 items-center gap-3 sm:gap-6">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg text-on-surface lg:hidden"
              aria-label="Open admin navigation"
            >
              ☰
            </button>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-error italic opacity-60">
                [ Control Hub ]
              </p>
              <h1 className="font-display text-sm font-extrabold leading-none tracking-tighter text-white italic uppercase underline decoration-error/20 sm:text-xl">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3 border-l border-error/10 pl-3 sm:gap-4 sm:pl-6">
              <div className="hidden text-right sm:flex sm:flex-col sm:justify-center">
                <p className="text-xs font-black leading-tight text-white italic">{user?.name}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-error italic opacity-60">
                  System Admin
                </p>
              </div>
              <button
                onClick={logout}
                className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-error/10 border border-error/20 flex items-center justify-center hover:bg-error/20 transition-all text-error"
                title="Terminate admin session"
              >
                🚪
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main className="relative flex-1 overflow-y-auto pb-32 sm:pb-36 lg:pb-8 animate-slide-up">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-8 sm:py-8 lg:py-10">
            <Outlet />
          </div>
        </main>
      </div>

      {isMobileMenuOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close admin navigation"
          />
          <div className="absolute inset-x-3 top-3 rounded-[1.75rem] border border-white/10 bg-surface-container-low/95 p-4 shadow-2xl backdrop-blur-3xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-error opacity-60">Admin Navigation</p>
                <p className="mt-1 font-display text-xl font-bold text-white">All Modules</p>
              </div>
              <button
                type="button"
                className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-on-surface"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 grid gap-2">
              {adminNavLinks.map((link) => {
                const isActive = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center justify-between rounded-2xl px-4 py-3 ${isActive ? 'bg-error/20 text-white ring-1 ring-error/30' : 'bg-white/5 text-on-surface-variant'}`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-lg">{link.icon}</span>
                      <span className="text-xs font-black uppercase tracking-[0.12em] italic">{link.name}</span>
                    </span>
                    <span className="text-sm opacity-60">→</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      {/* ─── MOBILE BOTTOM NAV (Admin) ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-error/10 bg-background/85 px-3 py-3 pb-6 backdrop-blur-3xl lg:hidden">
        <div className="grid grid-cols-4 gap-2">
          {primaryMobileLinks.map((link) => {
            const isActive = location.pathname === link.path
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                  isActive ? 'text-error scale-110' : 'text-on-surface-variant'
                }`}
              >
                <span className="text-xl">{link.icon}</span>
                <span className="text-[9px] text-center font-black uppercase tracking-[0.12em] italic leading-tight">
                  {link.name}
                </span>
              </Link>
            )
          })}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-2 rounded-xl px-3 py-2 text-on-surface-variant transition-all"
          >
            <span className="text-xl">⋯</span>
            <span className="text-[9px] text-center font-black uppercase tracking-[0.12em] italic leading-tight">More</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default AdminLayout
