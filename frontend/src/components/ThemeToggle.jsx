import { useTheme } from '../context/ThemeContext'
import { useLocation } from 'react-router-dom'
import AppIcon from './AppIcon'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const location = useLocation()
  const isLight = theme === 'light'

  const hasStandaloneAuthLayout = location.pathname === '/auth' || location.pathname === '/admin/auth'
  const positionClassName = hasStandaloneAuthLayout
    ? 'top-4 sm:top-6'
    : 'top-[4.5rem] sm:top-[5.25rem]'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`fixed right-4 sm:right-6 lg:right-8 z-[95] inline-flex items-center gap-2 rounded-full border border-outline-variant/70 bg-surface-lowest/85 px-3 py-2 text-xs font-semibold text-on-surface shadow-premium backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-premium-hover ${positionClassName}`}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
    >
      <span className="grid h-4 w-4 place-items-center" aria-hidden="true">
        <AppIcon name={isLight ? 'moon' : 'sun'} className="h-4 w-4" />
      </span>
      <span className="hidden sm:inline">{isLight ? 'Dark Mode' : 'Light Mode'}</span>
    </button>
  )
}

export default ThemeToggle
