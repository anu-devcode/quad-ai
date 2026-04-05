import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinkClass = ({ isActive }) => {
  const base = 'rounded-full px-4 py-2 text-sm font-semibold tracking-wide transition-all duration-200'
  return isActive
    ? `${base} bg-primary/12 text-primary`
    : `${base} text-on-surface-variant hover:text-on-surface hover:bg-surface-high/50`
}

function PublicLayout() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const isAuthPage = location.pathname === '/auth'
  const isLandingPage = location.pathname === '/'
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileNavOpen) return undefined

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isMobileNavOpen])

  const mobileLinks = [
    { to: '/', label: 'Home' },
    { to: '/features', label: 'Features' },
    { to: '/use-cases', label: 'Use Cases' },
    { to: '/resources', label: 'Resources' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/demo', label: 'Try Demo' }
  ]

  return (
    <div className="min-h-screen bg-transparent text-on-surface relative isolate">
      {/* ─── Institutional Animated Background ─── */}
      {!isLandingPage && (
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
      )}
      <div className="analytic-grain fixed inset-0 z-50 pointer-events-none" />

      {/* ─── Public Navbar ─── */}
      <header className="sticky top-0 z-40 w-full border-b border-outline-variant/40 bg-surface-lowest/70 backdrop-blur-xl">
        <div className="mx-auto flex h-[3.75rem] sm:h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-8 w-8 sm:h-9 sm:w-9 place-items-center overflow-hidden rounded-lg border border-white/10 bg-surface-lowest shadow-premium ring-1 ring-white/10 transition-transform group-hover:scale-110">
              <img src="/logo.png" alt="Q" className="h-full w-full object-cover scale-110" />
            </div>
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-white">
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
            <NavLink to="/use-cases" className={navLinkClass}>
              Use Cases
            </NavLink>
            <NavLink to="/resources" className={navLinkClass}>
              Resources
            </NavLink>
            <NavLink to="/pricing" className={navLinkClass}>
              Pricing
            </NavLink>
            <NavLink to="/demo" className="ml-3 rounded-full bg-primary px-5 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white shadow-premium transition-all hover:scale-105 hover:brightness-110">
              Try Demo
            </NavLink>
          </nav>

          {/* CTA */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
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
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              className="grid h-9 w-9 place-items-center rounded-lg text-on-surface-variant hover:bg-surface-high lg:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Drawer */}
      {isMobileNavOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation menu"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={() => setIsMobileNavOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-[84%] max-w-sm border-l border-white/10 bg-surface-lowest/95 p-6">
            <div className="mb-8 flex items-center justify-between">
              <p className="font-display text-lg font-bold tracking-tight text-white">Navigation</p>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setIsMobileNavOpen(false)}
                className="rounded-lg p-2 text-on-surface-variant hover:bg-surface-high"
              >
                ✕
              </button>
            </div>

            <nav className="space-y-2">
              {mobileLinks.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `block rounded-xl px-4 py-3 text-sm font-semibold ${
                      isActive ? 'bg-primary/12 text-primary' : 'text-on-surface-variant hover:bg-surface-high/60 hover:text-on-surface'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-8 border-t border-white/10 pt-6">
              <Link
                to={isAuthenticated ? '/dashboard' : '/auth'}
                className="inline-flex w-full items-center justify-center rounded-xl premium-gradient px-5 py-3 text-sm font-semibold text-white shadow-premium"
              >
                {isAuthenticated ? 'Open Dashboard' : 'Get Started'}
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* ─── Page Content ─── */}
      <main className="animate-fade-in">
        <Outlet />
      </main>

      {/* ─── Integrated Public Footer ─── */}
      {!isAuthPage && (
        <footer className="relative overflow-hidden border-t border-white/5 bg-surface-container-lowest px-4 py-20 sm:px-8 lg:px-12">
          {/* Subtle Background Glow */}
          <div className="absolute right-0 bottom-0 h-96 w-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="mx-auto max-w-7xl relative z-10">
            <div className="grid gap-20 lg:grid-cols-12">
              {/* BRANDING SECTION */}
              <div className="lg:col-span-4 space-y-6">
                <div>
                  <div className="flex items-center gap-3 mb-6 group">
                    <div className="grid h-9 w-9 place-items-center rounded-xl premium-gradient text-[10px] font-black text-white shadow-premium ring-1 ring-white/10 group-hover:scale-110 transition-transform">Q</div>
                    <p className="font-display text-xl font-bold text-white tracking-tight">Quirass</p>
                  </div>
                  <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed max-w-sm">
                    The world's most resilient financial trust infrastructure for the next billion operators.
                  </p>
                </div>
                
                <div className="flex items-center gap-6 opacity-40 hover:opacity-100 transition-opacity">
                   <div className="h-0.5 w-12 bg-primary" />
                   <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white">Sovereign Intelligence</p>
                </div>
              </div>

              {/* LINKS GRID */}
              <div className="lg:col-span-8 grid gap-8 grid-cols-2 md:grid-cols-4">
                {[
                  {
                    title: 'Infrastructure',
                    links: [
                      { label: 'Live Demo', to: '/demo' },
                      { label: 'Core Engine', to: '/' },
                      { label: 'Capabilities', to: '/capabilities' },
                      { label: 'Features', to: '/features' }
                    ]
                  },
                  {
                    title: 'Solutions',
                    links: [
                      { label: 'Lending Ops', to: '/use-cases' },
                      { label: 'Fraud Shield', to: '/use-cases' },
                      { label: 'Fintech Hub', to: '/use-cases' },
                      { label: 'Risk Audit', to: '/use-cases' }
                    ]
                  },
                  {
                    title: 'Resources',
                    links: [
                      { label: 'Developer Hub', to: '/resources' },
                      { label: 'API Research', to: '/resources' },
                      { label: 'Case Studies', to: '/use-cases' },
                      { label: 'Institutional PDF', to: '/resources' }
                    ]
                  },
                  {
                    title: 'Company',
                    links: [
                      { label: 'Manifesto', to: '/' },
                      { label: 'Privacy Protocol', to: '/' },
                      { label: 'System Status', to: '/' },
                      { label: 'Contact', to: '/' }
                    ]
                  }
                ].map((group) => (
                  <div key={group.title}>
                    <h4 className="mb-4 text-[9px] font-bold uppercase tracking-[0.25em] text-white/50">{group.title}</h4>
                    <ul className="space-y-3 test-xs sm:text-sm text-on-surface-variant">
                      {group.links.map((link) => (
                        <li key={link.label}>
                          <Link to={link.to} className="group flex items-center gap-2 transition-colors hover:text-primary">
                             <span className="opacity-0 group-hover:opacity-100 transition-all">→</span>
                             {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* BOTTOM BAR */}
            <div className="mt-32 pt-12 border-t border-white/5 flex flex-wrap justify-between items-center gap-10">
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium tracking-tight text-on-surface-variant/50">© 2026 Quirass Infrastructure. All protocols active.</p>
                <div className="flex gap-4">
                   <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                   <p className="text-[9px] font-bold uppercase tracking-widest text-tertiary">Global Network Online</p>
                </div>
              </div>
              
              <div className="flex gap-12 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/40">
                <Link to="/" className="hover:text-white transition-colors hover:underline decoration-primary">Privacy Policy</Link>
                <Link to="/" className="hover:text-white transition-colors hover:underline decoration-primary">Terms of Service</Link>
                <Link to="/" className="hover:text-white transition-colors hover:underline decoration-primary">Security Audit</Link>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default PublicLayout
