import { Link, NavLink } from 'react-router-dom'

const navClass = ({ isActive }) => {
  const base = 'whitespace-nowrap rounded-md px-4 py-2 text-[11px] font-bold uppercase tracking-[0.05em] transition-all duration-200'
  if (isActive) {
    return `${base} bg-primary text-white shadow-premium`
  }
  return `${base} text-on-surface-variant hover:bg-surface-highest hover:text-on-surface`
}

function SiteHeader() {
  return (
    <header className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-xl bg-surface-lowest/70 p-2 shadow-premium backdrop-blur-xl sm:px-4 sm:py-3">
      <Link to="/" className="flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-lg premium-gradient text-xs font-bold text-white shadow-premium">
          SI
        </div>
        <div className="hidden min-w-0 sm:block">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Sovereign</p>
          <p className="font-display text-sm font-bold text-on-surface">Intelligence</p>
        </div>
      </Link>

      <nav className="no-scrollbar flex items-center gap-1 overflow-x-auto">
        <NavLink to="/" className={navClass} end>
          Institutional
        </NavLink>
        <NavLink to="/auth" className={navClass}>
          Protocol
        </NavLink>
        <NavLink to="/dashboard/home" className={navClass}>
          Ledger
        </NavLink>
        <NavLink to="/admin" className={navClass}>
          Console
        </NavLink>
      </nav>
    </header>
  )
}

export default SiteHeader
