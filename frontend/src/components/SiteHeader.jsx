import { Link, NavLink } from 'react-router-dom'

function navClass({ isActive }) {
  if (isActive) {
    return 'rounded-full bg-indigo-700 px-4 py-2 text-white'
  }
  return 'rounded-full px-4 py-2 text-slate-700 transition hover:bg-white/70'
}

function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-white/60 bg-white/80 px-3 py-2 shadow-soft backdrop-blur">
      <Link to="/" className="flex items-center gap-2 rounded-full px-3 py-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-700 text-xs font-bold text-white">FI</span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-slate-400">Fiduciary</p>
          <p className="font-display text-sm font-semibold text-slate-900">Intelligence</p>
        </div>
      </Link>

      <nav className="flex items-center gap-1 text-sm font-semibold">
        <NavLink to="/" className={navClass} end>
          Landing
        </NavLink>
        <NavLink to="/auth" className={navClass}>
          Auth
        </NavLink>
        <NavLink to="/dashboard/home" className={navClass}>
          User
        </NavLink>
        <NavLink to="/admin" className={navClass}>
          Admin
        </NavLink>
      </nav>
    </header>
  )
}

export default SiteHeader
