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
    <nav className="fixed bottom-4 left-1/2 z-20 w-[min(640px,calc(100%-2rem))] -translate-x-1/2 rounded-xl bg-inverse-surface p-1.5 shadow-premium sm:w-[min(640px,calc(100%-3rem))] sm:p-2 lg:static lg:mt-10 lg:w-full lg:translate-x-0 lg:rounded-2xl">
      <ul className="flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.href ||
            (item.key === 'home' && location.pathname === '/dashboard') ||
            (item.key === 'admin' && location.pathname === '/admin')

          return (
            <li key={item.key} className="flex-1">
              <Link
                to={item.href}
                className={`relative block rounded-lg py-2.5 text-center text-[10px] font-bold uppercase tracking-[0.05em] transition-all duration-200 sm:text-[11px] ${
                  isActive 
                    ? 'text-white' 
                    : 'text-on-inverse-surface/40 hover:text-white'
                }`}
              >
                {isActive && (
                  <div className="premium-gradient absolute inset-0 -z-10 rounded-lg opacity-20" />
                )}
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
