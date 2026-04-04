import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }) => {
  const base = 'rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200'
  return isActive
    ? `${base} text-primary`
    : `${base} text-on-surface-variant hover:text-on-surface hover:bg-surface-high/50`
}

function PublicLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const isAuthPage = location.pathname === '/auth'

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <div className="analytic-grain" />

      {/* ─── Public Navbar ─── */}
      <header className="sticky top-0 z-30 w-full border-b border-outline-variant/40 bg-surface-lowest/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg premium-gradient text-xs font-bold text-white shadow-premium ring-1 ring-white/20">
              Q
            </div>
            <div>
              <p className="font-display text-xl font-extrabold tracking-tight text-white">
                Quirass
              </p>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden items-center gap-1 lg:flex">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/features" className={navLinkClass}>
              Features
            </NavLink>
            <NavLink to="/capabilities" className={navLinkClass}>
              Capabilities
            </NavLink>
            <NavLink to="/engine" className={navLinkClass}>
              Engine
            </NavLink>
            <NavLink to="/resources" className={navLinkClass}>
              Resources
            </NavLink>
            <NavLink to="/pricing" className={navLinkClass}>
              Pricing
            </NavLink>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard/home"
                className="inline-flex items-center gap-2 rounded-lg premium-gradient px-5 py-2 text-sm font-semibold text-white shadow-premium transition-all hover:brightness-105 active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Dashboard
              </Link>
            ) : (
              !isAuthPage && (
                <Link
                  to="/auth"
                  className="inline-flex items-center gap-2 rounded-lg premium-gradient px-5 py-2 text-sm font-semibold text-white shadow-premium transition-all hover:brightness-105 active:scale-95"
                >
                  Get Started
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              )
            )}

            {/* Mobile menu button */}
            <button className="grid h-9 w-9 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-high md:hidden">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* ─── Page Content ─── */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default PublicLayout
