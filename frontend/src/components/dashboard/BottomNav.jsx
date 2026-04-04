import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function BottomNav() {
  const { user } = useAuth()
  const location = useLocation()
  const currentPath = location.pathname

  const userLinks = [
    { name: 'Home', icon: '🏠', path: '/portal/home' },
    { name: 'Evidence', icon: '📤', path: '/portal/upload' },
    { name: 'Insights', icon: '📊', path: '/portal/insights' },
    { name: 'History', icon: '📁', path: '/portal/history' }
  ]

  const adminLinks = [
    { name: 'Admin', icon: '🚨', path: '/admin/overview' },
    { name: 'Review', icon: '📥', path: '/admin/review' },
    { name: 'Users', icon: '👥', path: '/admin/users' }
  ]

  const isPathAdmin = currentPath.startsWith('/admin')
  const links = isPathAdmin ? adminLinks : userLinks

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-background/80 backdrop-blur-3xl border-t border-white/5 py-3 px-4 pb-8">
      <div className="flex items-center justify-around">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-2 px-3 py-2 rounded-xl transition-all ${
                isActive ? 'text-primary scale-110 shadow-premium' : 'text-on-surface-variant'
              }`
            }
          >
            <span className="text-2xl">{link.icon}</span>
            <span className="text-[10px] font-black uppercase tracking-widest italic">{link.name}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export default BottomNav
