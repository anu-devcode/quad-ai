import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { PremiumButton, SurfaceCard } from '../components/ui'

function AuthPage() {
  return (
    <div className="relative px-4 pb-20 pt-6 sm:px-8 sm:pt-8 lg:px-12">
      <SiteHeader />

      <main className="mx-auto mt-8 grid max-w-7xl gap-8 sm:mt-12 lg:grid-cols-2">
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

        <SurfaceCard level="lowest" className="p-8 sm:p-12">
          <div className="mb-8 flex rounded-md bg-surface-low p-1">
            <button className="flex-1 rounded bg-surface-lowest py-2.5 text-sm font-bold text-on-surface shadow-premium">
              Sign In
            </button>
            <button className="flex-1 py-2.5 text-sm font-bold text-on-surface-variant hover:text-on-surface">
              Account Sync
            </button>
          </div>

          <form className="space-y-6">
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
              <Link to="/dashboard/home" className="w-full">
                <PremiumButton variant="primary" className="w-full">
                  User Protocol
                </PremiumButton>
              </Link>
              <Link to="/admin" className="w-full">
                <PremiumButton variant="secondary" className="w-full">
                  Admin Console
                </PremiumButton>
              </Link>
            </div>
          </form>
        </SurfaceCard>
      </main>
    </div>
  )
}

export default AuthPage
