import { Link } from 'react-router-dom'
import SiteHeader from '../components/SiteHeader'
import { SurfaceCard } from '../components/ui'

function AuthPage() {
  return (
    <div className="relative px-4 pb-16 pt-8 sm:px-6 lg:px-10">
      <SiteHeader />

      <main className="mx-auto mt-8 grid max-w-6xl gap-6 lg:grid-cols-[1fr_1fr]">
        <SurfaceCard className="bg-gradient-to-br from-indigo-700 to-indigo-900 p-8 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-indigo-100">Secure Access</p>
          <h1 className="mt-4 font-display text-4xl font-semibold">Welcome back to Fiduciary AI</h1>
          <p className="mt-4 max-w-md text-sm text-indigo-100">
            Continue with trusted identity verification and access your user or admin workspace without friction.
          </p>
          <div className="mt-8 space-y-3 text-sm text-indigo-100">
            <p className="rounded-2xl border border-white/20 bg-white/10 p-3">Adaptive risk checks on every sign in</p>
            <p className="rounded-2xl border border-white/20 bg-white/10 p-3">Role-based dashboard routing by account type</p>
            <p className="rounded-2xl border border-white/20 bg-white/10 p-3">Session and transaction safety monitoring by default</p>
          </div>
        </SurfaceCard>

        <SurfaceCard className="p-8">
          <div className="mb-6 flex rounded-2xl bg-slate-100 p-1 text-sm font-semibold">
            <button className="flex-1 rounded-xl bg-white px-3 py-2 text-indigo-700 shadow">Sign In</button>
            <button className="flex-1 rounded-xl px-3 py-2 text-slate-600">Create Account</button>
          </div>

          <form className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">
              Work Email
              <input
                type="email"
                placeholder="you@company.com"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="block text-sm font-semibold text-slate-700">
              Password
              <input
                type="password"
                placeholder="••••••••"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-500">
              <input type="checkbox" className="rounded border-slate-300" defaultChecked />
              Keep this device trusted for 14 days
            </label>

            <div className="grid gap-3 pt-2 sm:grid-cols-2">
              <Link
                to="/dashboard"
                className="rounded-xl bg-indigo-700 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Sign In as User
              </Link>
              <Link to="/admin" className="rounded-xl bg-slate-900 px-4 py-2.5 text-center text-sm font-semibold text-white">
                Sign In as Admin
              </Link>
            </div>
          </form>
        </SurfaceCard>
      </main>
    </div>
  )
}

export default AuthPage
