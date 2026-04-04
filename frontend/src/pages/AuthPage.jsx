import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { PremiumButton, SurfaceCard } from '../components/ui'
import { Navigate } from 'react-router-dom'

function AuthPage() {
  const { isAuthenticated, login } = useAuth()
  const [activeTab, setActiveTab] = useState('signin')

  if (isAuthenticated) {
    return <Navigate to="/dashboard/home" replace />
  }

  const handleSubmit = (e, role) => {
    e.preventDefault()
    login(role)
  }

  return (
    <div className="relative px-4 pb-20 pt-8 sm:px-8 sm:pt-12 lg:px-12">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
        {/* Left panel — branding */}
        <SurfaceCard level="lowest" className="premium-gradient p-8 text-white sm:p-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary-dim">Secure Authorization</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:mt-6 sm:text-5xl">
            Initialize Sovereign Session
          </h1>
          <p className="mt-6 max-w-md text-sm leading-relaxed opacity-90 sm:text-lg">
            Continue with multi-factor biometric verification to access your institutional ledger or administrative console.
          </p>
          <div className="mt-10 space-y-4">
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-dim">Protocol Check</p>
              <p className="mt-1 text-sm">Adaptive neural risk assessment on every sign-in</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-primary-dim">Access Control</p>
              <p className="mt-1 text-sm">Role-based gateway routing by unit identifier</p>
            </div>
          </div>
        </SurfaceCard>

        {/* Right panel — form */}
        <SurfaceCard level="lowest" className="p-8 sm:p-12">
          {/* Tab Switcher */}
          <div className="mb-8 flex rounded-md bg-surface-low p-1">
            <button
              onClick={() => setActiveTab('signin')}
              className={`flex-1 rounded py-2.5 text-sm font-bold transition-all duration-200 ${
                activeTab === 'signin'
                  ? 'bg-surface-lowest text-on-surface shadow-premium'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('sync')}
              className={`flex-1 rounded py-2.5 text-sm font-bold transition-all duration-200 ${
                activeTab === 'sync'
                  ? 'bg-surface-lowest text-on-surface shadow-premium'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Account Sync
            </button>
          </div>

          {/* Form */}
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Institutional Email</span>
              <input
                type="email"
                placeholder="unit@sovereign.intel"
                className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-sm font-medium outline-none transition focus:ring-1 focus:ring-primary/40"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Security Cipher</span>
              <input
                type="password"
                placeholder="••••••••"
                className="mt-2 w-full rounded-md bg-surface-low px-4 py-3 text-sm font-medium outline-none transition focus:ring-1 focus:ring-primary/40"
              />
            </label>

            <label className="flex items-center gap-3 text-xs font-medium text-on-surface-variant">
              <input type="checkbox" className="h-4 w-4 rounded border-outline-variant bg-surface-low text-primary focus:ring-primary/40" defaultChecked />
              Maintain session trust for 14 operational cycles
            </label>

            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <PremiumButton
                variant="primary"
                className="w-full"
                onClick={(e) => handleSubmit(e, 'user')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                User Dashboard
              </PremiumButton>
              <PremiumButton
                variant="secondary"
                className="w-full"
                onClick={(e) => handleSubmit(e, 'admin')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Admin Console
              </PremiumButton>
            </div>
          </form>
        </SurfaceCard>
      </div>
    </div>
  )
}

export default AuthPage
