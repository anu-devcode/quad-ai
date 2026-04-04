import { useState, useRef } from 'react'
import { Navigate, Link } from 'react-router-dom'
import { useAuth, isAdminPhone } from '../context/AuthContext'
import { PremiumButton, SurfaceCard } from '../components/ui'

// Mock OTP for demo — replace with real API
function generateMockOtp() {
  // Use a fixed test code '123456' in development
  if (import.meta.env.DEV) return '123456'
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function AuthPage() {
  const { isAuthenticated, isAdmin, loginUser } = useAuth()
  const [authStep, setAuthStep] = useState('login') // login | blocked | otp | onboarding-1 | onboarding-2 | onboarding-3
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [profile, setProfile] = useState({ name: '', region: 'Addis Ababa Hub' })
  const mockOtpRef = useRef(null)

  // ── Redirects ─────────────────────────────────────────────────────────────
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/overview" replace />
  }
  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/portal/home" replace />
  }

  // ── Handle phone submit ───────────────────────────────────────────────────
  const handlePhoneSubmit = (e) => {
    e.preventDefault()
    setPhoneError('')

    const normalized = phoneNumber.replace(/[\s\-().]/g, '')
    if (!normalized) {
      setPhoneError('Phone number is required.')
      return
    }

    // If admin phone tries to use user auth — block and redirect them
    if (isAdminPhone(normalized)) {
      setAuthStep('blocked')
      return
    }

    setIsLoading(true)
    setTimeout(() => {
      mockOtpRef.current = generateMockOtp()
      if (import.meta.env.DEV) {
        console.info('[UserAuth DEV] Mock OTP →', mockOtpRef.current)
      }
      setIsLoading(false)
      setAuthStep('otp')
    }, 1200)
  }

  // ── Handle OTP submit ─────────────────────────────────────────────────────
  const handleOtpSubmit = (e) => {
    e.preventDefault()
    setOtpError('')
    const entered = otpDigits.join('')
    if (entered.length !== 6) { setOtpError('Enter all 6 digits.'); return }

    setIsLoading(true)
    setTimeout(() => {
      if (entered !== mockOtpRef.current) {
        setOtpError('Invalid code. Please try again.')
        setIsLoading(false)
        return
      }
      setIsLoading(false)
      setAuthStep('onboarding-1')
    }, 800)
  }

  const handleOtpDigit = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otpDigits]
    next[index] = value
    setOtpDigits(next)
    if (value && index < 5) document.getElementById(`user-otp-${index + 1}`)?.focus()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0)
      document.getElementById(`user-otp-${index - 1}`)?.focus()
  }

  // ── Complete onboarding ───────────────────────────────────────────────────
  const completeOnboarding = () => {
    loginUser(phoneNumber, { name: profile.name || 'Operator' })
  }

  return (
    <div className="relative min-h-screen bg-transparent overflow-hidden flex flex-col items-center justify-center p-4">
      <main className="relative z-10 w-full max-w-lg">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-16">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-surface-container border border-white/10 shadow-premium mb-8 ring-2 ring-white/10 overflow-hidden">
            <img src="/logo.png" alt="Q" className="h-full w-full object-cover scale-125" />
          </div>
          <h1 className="font-display text-4xl font-extrabold text-white tracking-tighter italic uppercase underline decoration-primary/20">
            Quirass
          </h1>
          <p className="text-on-surface-variant font-light mt-4 italic">Sovereign Financial Integrity</p>
        </div>

        <SurfaceCard className="glass-surface p-12 overflow-hidden border-white/5 relative">

          {/* ─── LOGIN ─── */}
          {authStep === 'login' && (
            <div className="animate-enter">
              <h2 className="text-2xl font-black text-white italic uppercase mb-8 underline decoration-primary/20">
                Operator Access
              </h2>
              <form className="space-y-6" onSubmit={handlePhoneSubmit}>
                <div className="space-y-2">
                  <label htmlFor="user-phone" className="text-[10px] font-black uppercase text-on-surface-variant italic">
                    ID: Phone Number
                  </label>
                  <input
                    id="user-phone"
                    type="tel"
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black italic tracking-widest focus:border-primary focus:outline-none transition-all"
                    placeholder="+251 ..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={isLoading}
                    required
                    autoComplete="tel"
                  />
                  {phoneError && (
                    <p className="text-[11px] text-error font-bold italic">{phoneError}</p>
                  )}
                </div>
                <PremiumButton
                  type="submit"
                  variant="primary"
                  className="w-full py-4 text-sm font-black bg-primary italic"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Signal…' : 'Request OTP Signal'}
                </PremiumButton>
              </form>
              <div className="mt-12 pt-8 border-t border-white/5 text-center">
                <p className="text-[10px] text-on-surface-variant font-bold italic opacity-40 uppercase tracking-widest">
                  Global Encryption Active 🛡️
                </p>
              </div>
            </div>
          )}

          {/* ─── BLOCKED (Admin tried user auth) ─── */}
          {authStep === 'blocked' && (
            <div className="animate-enter text-center">
              <div className="text-5xl mb-6">🔒</div>
              <h2 className="text-xl font-black text-white italic uppercase mb-4 underline decoration-primary/20">
                Admin Portal Required
              </h2>
              <p className="text-sm text-on-surface-variant italic font-light mb-10 leading-relaxed px-4">
                This phone number belongs to a Control Operator. Please use the Admin Access portal.
              </p>
              <Link
                to="/admin/auth"
                className="block w-full py-4 rounded-2xl bg-error/20 border border-error/30 text-error text-sm font-black uppercase italic tracking-widest hover:bg-error/30 transition-all text-center"
              >
                → Go to Admin Portal
              </Link>
              <button
                onClick={() => { setAuthStep('login'); setPhoneNumber('') }}
                className="mt-4 text-[10px] font-black text-on-surface-variant/40 hover:text-white uppercase italic underline decoration-white/10"
              >
                ← Use Different Number
              </button>
            </div>
          )}

          {/* ─── OTP ─── */}
          {authStep === 'otp' && (
            <div className="animate-enter text-center">
              <h2 className="text-2xl font-black text-white italic uppercase mb-6 underline decoration-primary/20">
                OTP Verification
              </h2>
              <p className="text-sm text-on-surface-variant italic font-light mb-10 leading-relaxed">
                Signal sent to <span className="font-bold text-white italic">{phoneNumber}</span>.
                <br />Enter the 6-digit operational code.
              </p>
              <form onSubmit={handleOtpSubmit}>
                <div className="flex justify-center gap-3 mb-8">
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      id={`user-otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigit(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-14 w-10 bg-white/5 border border-white/10 rounded-xl text-center text-white text-xl font-black italic focus:border-primary focus:outline-none transition-all"
                      disabled={isLoading}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="text-[11px] text-error font-bold italic mb-4">{otpError}</p>
                )}
                <PremiumButton
                  type="submit"
                  variant="primary"
                  className="w-full py-4 font-black italic uppercase tracking-widest"
                  disabled={isLoading || otpDigits.join('').length < 6}
                >
                  {isLoading ? 'Verifying…' : 'Confirm Signal →'}
                </PremiumButton>
              </form>
              <button
                onClick={() => { setAuthStep('login'); setOtpDigits(['','','','','','']); setOtpError('') }}
                className="mt-6 text-[10px] font-black text-on-surface-variant/40 hover:text-white uppercase italic underline decoration-white/10"
              >
                ← Re-enter Phone
              </button>
            </div>
          )}

          {/* ─── ONBOARDING 1 ─── */}
          {authStep === 'onboarding-1' && (
            <div className="animate-enter">
              <p className="text-[10px] font-black text-primary uppercase italic mb-2 tracking-widest underline decoration-primary/20">Step 01 / 03</p>
              <h2 className="text-2xl font-black text-white italic uppercase mb-8">Basic Intelligence</h2>
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant italic">Operational Name</label>
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black italic tracking-widest focus:border-primary focus:outline-none transition-all"
                    placeholder="e.g. Hagos T."
                    value={profile.name}
                    onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-on-surface-variant italic">Regional Hub</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black italic tracking-widest appearance-none focus:border-primary focus:outline-none transition-all"
                    value={profile.region}
                    onChange={(e) => setProfile(p => ({ ...p, region: e.target.value }))}
                  >
                    <option>Addis Ababa Hub</option>
                    <option>Mekelle Edge</option>
                    <option>Nairobi Global</option>
                  </select>
                </div>
                <PremiumButton onClick={() => setAuthStep('onboarding-2')} variant="primary" className="w-full py-4 font-black italic uppercase tracking-widest mt-6">
                  Next Signal →
                </PremiumButton>
              </div>
            </div>
          )}

          {/* ─── ONBOARDING 2 ─── */}
          {authStep === 'onboarding-2' && (
            <div className="animate-enter">
              <p className="text-[10px] font-black text-primary uppercase italic mb-2 tracking-widest underline decoration-primary/20">Step 02 / 03</p>
              <h2 className="text-2xl font-black text-white italic uppercase mb-8">Evidence Vectors</h2>
              <p className="text-sm text-on-surface-variant italic font-light mb-8">Select the primary financial ecosystems you operate within.</p>
              <div className="space-y-4">
                {[
                  { name: 'Telebirr Wallet', desc: 'Ethio Telecom Mobile Data Hub' },
                  { name: 'CBE (Commercial Bank)', desc: 'Institutional Bank Statement Audit' },
                  { name: 'M-Pesa Global', desc: 'Regional Wallet Inference' }
                ].map(hub => (
                  <div key={hub.name} className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/40 cursor-pointer group transition-all">
                    <h4 className="text-sm font-black text-white italic uppercase group-hover:text-primary transition-colors">{hub.name}</h4>
                    <p className="text-[10px] text-on-surface-variant italic mt-1">{hub.desc}</p>
                  </div>
                ))}
                <PremiumButton onClick={() => setAuthStep('onboarding-3')} variant="primary" className="w-full py-4 font-black italic uppercase tracking-widest mt-8">
                  Configure Inference Hub →
                </PremiumButton>
              </div>
            </div>
          )}

          {/* ─── ONBOARDING 3 ─── */}
          {authStep === 'onboarding-3' && (
            <div className="animate-enter text-center">
              <p className="text-[10px] font-black text-primary uppercase italic mb-2 tracking-widest underline decoration-primary/20">Final Sync 03 / 03</p>
              <h2 className="text-2xl font-black text-white italic uppercase mb-8 underline decoration-primary/20">Seed Ingestion</h2>
              <p className="text-sm text-on-surface-variant italic font-light mb-10 leading-relaxed px-4">
                To generate your first Operational Score, upload one transaction screenshot or SMS proof.
              </p>
              <label className="group relative block aspect-video rounded-3xl bg-white/5 border-2 border-dashed border-white/10 hover:border-primary/50 cursor-pointer overflow-hidden flex flex-col items-center justify-center p-8 mb-10">
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📄</div>
                <p className="text-[10px] font-black text-white uppercase italic tracking-widest opacity-40">Drop Seed Evidence</p>
              </label>
              <PremiumButton onClick={completeOnboarding} variant="primary" className="w-full py-4 font-black text-lg bg-primary italic shadow-premium">
                Initialize Hub Profile
              </PremiumButton>
              <button onClick={completeOnboarding} className="mt-6 text-[10px] font-black text-on-surface-variant/40 hover:text-white uppercase italic underline decoration-white/10">
                Skip Seed (Inference 0.0)
              </button>
            </div>
          )}

          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-2xl rounded-full" />
        </SurfaceCard>
      </main>
    </div>
  )
}

export default AuthPage
