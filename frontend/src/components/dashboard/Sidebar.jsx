import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NavIcon from './NavIcon'

// User-only nav links — no admin paths ever rendered here
const userLinks = [
  { name: 'Home', icon: 'home', path: '/portal/home' },
  { name: 'Upload Data', icon: 'upload', path: '/portal/upload' },
  { name: 'Spending Insights', icon: 'insights', path: '/portal/insights' },
  { name: 'Credit Score', icon: 'credit', path: '/portal/profile' },
  { name: 'Safety Alerts', icon: 'safety', path: '/portal/status' },
  { name: 'History', icon: 'history', path: '/portal/history' },
  { name: 'Loan Requests', icon: 'loan', path: '/portal/loan' },
]

function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="hidden lg:flex w-72 flex-col bg-surface-container-low border-r border-white/5 relative z-20 h-screen">
      <div className="flex items-center gap-3 p-8 border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface-container border border-white/5 shadow-premium ring-1 ring-white/10 group-hover:scale-110 transition-transform overflow-hidden">
            <img src="/logo.png" alt="Q" className="h-full w-full object-cover scale-110" />
          </div>
          <div>
            <p className="font-display text-2xl font-black text-white italic tracking-tighter leading-none">
              Quirass
            </p>
            <p className="text-[9px] font-black uppercase text-on-surface-variant tracking-widest italic opacity-40 group-hover:text-primary transition-colors">
              ← Exit Portal
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-6 px-4 italic opacity-50 underline decoration-primary/20">
          User Dashboard
        </p>
        {userLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? 'bg-primary text-white shadow-premium ring-1 ring-white/10'
                  : 'text-on-surface-variant hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span className="grid h-6 w-6 place-items-center transition-transform group-hover:scale-110">
              <NavIcon name={link.icon} className="h-5 w-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest italic">{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 space-y-4">
        <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/5">
          <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant italic opacity-50">
            Logged in as
          </p>
          <p className="text-xs font-black text-white italic mt-1">{user?.name}</p>
        </div>
        <Link
          to="/"
          className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-on-surface-variant text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-white/10 transition-all italic"
        >
          <span>← Main Website</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl bg-error/10 text-error text-[10px] font-black uppercase tracking-widest hover:bg-error/20 transition-all italic shadow-premium"
        >
          Log Out
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
