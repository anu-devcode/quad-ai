import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, isAdminPhone } from '../../context/AuthContext'
import { requestOtp, verifyOtp } from '../../services/campusApi'

// ─── COMPONENT ──────────────────────────────────────────────────────────────
function AdminAuthPage() {
  const { isAdmin, isAuthenticated, loginAdmin } = useAuth()

  const [step, setStep] = useState('phone') // 'phone' | 'otp' | 'rejected'
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // ── If already logged in as admin, redirect immediately ──────────────────
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/overview" replace />
  }
  // ── If logged in as regular user, do NOT redirect to admin — send them home ─
  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/portal/home" replace />
  }

  // ── STEP 1: Submit phone ─────────────────────────────────────────────────
  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    setPhoneError('')

    const normalized = phone.replace(/[\s\-().]/g, '')
    if (!normalized) {
      setPhoneError('Phone number is required.')
      return
    }

    // 🔐 WHITELIST CHECK — happens BEFORE OTP is even sent
    if (!isAdminPhone(normalized)) {
      setStep('rejected')
      return
    }

    setIsLoading(true)
    try {
      await requestOtp({ phone_number: normalized, purpose: 'admin' })
      setIsLoading(false)
      setStep('otp')
    } catch (error) {
      setIsLoading(false)
      setPhoneError(error.message || 'Unable to send OTP. Please try again.')
    }
  }

  // ── STEP 2: Submit OTP ──────────────────────────────────────────────────
  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    setOtpError('')

    const entered = otpDigits.join('')
    if (entered.length !== 6) {
      setOtpError('Enter all 6 digits.')
      return
    }

    setIsLoading(true)
    try {
      const normalized = phone.replace(/[\s\-().]/g, '')
      await verifyOtp({
        phone_number: normalized,
        otp_code: entered,
        purpose: 'admin',
      })

      if (!isAdminPhone(normalized)) {
        setStep('rejected')
        setIsLoading(false)
        return
      }

      loginAdmin(phone, { name: 'System Admin' })
      setIsLoading(false)
    } catch (error) {
      setOtpError(error.message || 'Invalid OTP. Please try again.')
      setIsLoading(false)
    }
  }

  // ── OTP digit input handler ───────────────────────────────────────────────
  const handleOtpDigit = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otpDigits]
    next[index] = value
    setOtpDigits(next)
    // Auto-advance focus
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background threat-colour orbs — distinct from user /auth */}
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-error/10 blur-[180px] pointer-events-none" />
      <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[140px] pointer-events-none" />

      <main className="relative z-10 w-full max-w-md">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-12">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-surface-container border border-error/20 shadow-premium mb-8 ring-2 ring-error/20 overflow-hidden">
            <img src="/logo.png" alt="Q" className="h-full w-full object-cover scale-125" />
          </div>
          <h1 className="font-display text-4xl font-extrabold text-white tracking-tighter italic uppercase underline decoration-error/20">
            Quirass
          </h1>
          <p className="text-on-surface-variant font-light mt-3 italic text-sm">
            Control Infrastructure — Restricted Access
          </p>
        </div>

        {/* ─── PHONE STEP ─── */}
        {step === 'phone' && (
          <div className="animate-enter bg-white/5 border border-error/10 rounded-3xl p-10 backdrop-blur-xl shadow-premium">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-error mb-4 italic">
              [ Admin — Authorised Operators Only ]
            </p>
            <h2 className="text-2xl font-black text-white italic uppercase mb-8 underline decoration-error/20">
              Control Access
            </h2>
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="admin-phone"
                  className="text-[10px] font-black uppercase text-on-surface-variant italic"
                >
                  Authorised Phone ID
                </label>
                <input
                  id="admin-phone"
                  type="tel"
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black italic tracking-widest focus:border-error/60 focus:outline-none transition-all"
                  placeholder="+251 ..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="tel"
                />
                {phoneError && (
                  <p className="text-[11px] text-error font-bold italic">{phoneError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-2xl bg-error/80 hover:bg-error text-white text-sm font-black uppercase italic tracking-widest transition-all shadow-premium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying Access…' : 'Request Control Signal'}
              </button>
            </form>

            <p className="mt-8 text-center text-[10px] text-on-surface-variant font-bold italic opacity-40 uppercase tracking-widest">
              🔒 Admin Credentials Required — No Public Registration
            </p>
          </div>
        )}

        {/* ─── OTP STEP ─── */}
        {step === 'otp' && (
          <div className="animate-enter bg-white/5 border border-error/10 rounded-3xl p-10 backdrop-blur-xl shadow-premium text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-error mb-4 italic">
              [ OTP Verification ]
            </p>
            <h2 className="text-2xl font-black text-white italic uppercase mb-4 underline decoration-error/20">
              Signal Authentication
            </h2>
            <p className="text-sm text-on-surface-variant italic font-light mb-10 leading-relaxed">
              Control signal sent to{' '}
              <span className="font-bold text-white italic">{phone}</span>.
              <br />
              Enter the 6-digit authorisation code.
            </p>

            <form onSubmit={handleOtpSubmit}>
              <div className="flex justify-center gap-3 mb-8">
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpDigit(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="h-14 w-10 bg-white/5 border border-white/10 rounded-xl text-center text-white text-xl font-black italic tracking-widest focus:border-error/60 focus:outline-none transition-all"
                    disabled={isLoading}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-[11px] text-error font-bold italic mb-4">{otpError}</p>
              )}

              <button
                type="submit"
                disabled={isLoading || otpDigits.join('').length < 6}
                className="w-full py-4 rounded-2xl bg-error/80 hover:bg-error text-white text-sm font-black uppercase italic tracking-widest transition-all shadow-premium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Authenticating…' : 'Verify & Gain Access'}
              </button>
            </form>

            <button
              onClick={() => { setStep('phone'); setOtpDigits(['','','','','','']); setOtpError('') }}
              className="mt-6 text-[10px] font-black text-on-surface-variant/40 hover:text-white uppercase italic underline decoration-white/10"
            >
              ← Re-enter Phone
            </button>
          </div>
        )}

        {/* ─── REJECTED STATE ─── */}
        {step === 'rejected' && (
          <div className="animate-enter bg-error/10 border border-error/30 rounded-3xl p-10 backdrop-blur-xl shadow-premium text-center">
            <div className="text-5xl mb-6">🚫</div>
            <p className="text-[10px] font-black uppercase tracking-[0.35em] text-error mb-4 italic">
              [ Access Denied ]
            </p>
            <h2 className="text-2xl font-black text-white italic uppercase mb-6 underline decoration-error/20">
              Unauthorised Identity
            </h2>
            <p className="text-sm text-on-surface-variant italic font-light mb-10 leading-relaxed px-4">
              This phone number is not registered as an authorised control operator.
              Contact your system administrator.
            </p>
            <button
              onClick={() => { setStep('phone'); setPhone(''); setPhoneError('') }}
              className="w-full py-4 rounded-2xl bg-white/5 border border-error/20 text-on-surface-variant text-sm font-black uppercase italic tracking-widest hover:bg-white/10 transition-all"
            >
              ← Try Again
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminAuthPage
