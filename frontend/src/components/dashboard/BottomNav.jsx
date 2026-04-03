import { Link, useLocation } from 'react-router-dom'

const navItems = [
  { key: 'home', label: 'Home', href: '/dashboard/home' },
  { key: 'history', label: 'History', href: '/dashboard/history' },
  { key: 'send', label: 'Send', href: '/dashboard/send' },
  { key: 'loan', label: 'Loan', href: '/dashboard/loan' },
  { key: 'admin', label: 'Admin', href: '/admin' },
]

function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-3 left-1/2 z-20 w-[min(560px,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl border border-white/60 bg-white/95 p-2 shadow-soft backdrop-blur">
      <ul className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.key === 'home' && location.pathname === '/dashboard') ||
            (item.key === 'admin' && location.pathname === '/admin')

          return (
            <li key={item.key}>
              <Link
                to={item.href}
                className={`block rounded-xl px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] transition ${
                  isActive ? 'bg-indigo-700 text-white' : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNav
