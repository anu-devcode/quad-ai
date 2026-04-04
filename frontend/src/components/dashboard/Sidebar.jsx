import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  {
    key: 'home',
    label: 'Home',
    href: '/dashboard/home',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
      </svg>
    ),
  },
  {
    key: 'history',
    label: 'History',
    href: '/dashboard/history',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
      </svg>
    ),
  },
  {
    key: 'send',
    label: 'Send',
    href: '/dashboard/send',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
      </svg>
    ),
  },
  {
    key: 'loan',
    label: 'Loan',
    href: '/dashboard/loan',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
      </svg>
    ),
  },
]

const adminItem = {
  key: 'admin',
  label: 'Admin',
  href: '/dashboard/admin',
  icon: (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-[18px] w-[18px]" viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
    </svg>
  ),
}

const sidebarLinkClass = ({ isActive }) => {
  const base = 'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200'
  return isActive
    ? `${base} bg-primary/10 text-primary font-semibold`
    : `${base} text-on-surface-variant hover:bg-surface-high hover:text-on-surface`
}

function Sidebar() {
  const { user, isAdmin, logout } = useAuth()
  const items = isAdmin ? [...navItems, adminItem] : navItems

  return (
    <aside className="hidden lg:flex lg:w-[260px] lg:flex-col lg:border-r lg:border-outline-variant/40 lg:bg-surface-lowest/50">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-outline-variant/40 px-6">
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-lg premium-gradient text-xs font-bold text-white shadow-premium">
            SI
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
              Sovereign
            </p>
            <p className="font-display text-sm font-bold leading-tight text-on-surface">
              Intelligence
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 px-3 pt-6">
        <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant">
          Navigation
        </p>
        {items.map((item) => (
          <NavLink key={item.key} to={item.href} className={sidebarLinkClass}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-outline-variant/40 p-4">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-surface-highest text-xs font-bold text-on-surface-variant">
            {user?.initials || 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-on-surface">{user?.name || 'User'}</p>
            <p className="truncate text-[10px] font-medium capitalize text-on-surface-variant">
              {user?.role || 'member'}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-surface-high px-3 py-2 text-xs font-semibold text-on-surface-variant transition-colors hover:bg-error-container hover:text-error"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
