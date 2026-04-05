import { useEffect, useMemo, useRef, useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth, isAdminPhone } from '../context/AuthContext'
import AppIcon from '../components/AppIcon'
import { PremiumButton, SurfaceCard, TokenPill } from '../components/ui'
import { requestOtp, saveUserProfile, verifyOtp, uploadTransactionEvidence } from '../services/campusApi'

const OTP_DURATION_SECONDS = 90

const REGION_OPTIONS = [
  'Addis Ababa',
  'Dire Dawa',
  'Mekelle',
  'Bahir Dar',
  'Hawassa',
]

const INSTITUTION_OPTIONS = [
  'Commercial Bank of Ethiopia',
  'Awash Bank',
  'Dashen Bank',
  'Bank of Abyssinia',
  'Telebirr Wallet',
  'M-Pesa',
]

const INTENT_OPTIONS = [
  {
    key: 'screenshot',
    icon: 'camera',
    title: 'Screenshot',
    detail: 'Upload transaction screenshots',
  },
  {
    key: 'pdf',
    icon: 'document',
    title: 'PDF Document',
    detail: 'Bank statements and invoices',
  },
  {
    key: 'sms',
    icon: 'message',
    title: 'SMS Message',
    detail: 'Paste transaction SMS evidence',
  },
  {
    key: 'manual',
    icon: 'pencil',
    title: 'Manual Entry',
    detail: 'Enter transaction fields directly',
  },
]

const SOURCE_LABEL = {
  screenshot: 'Screenshot',
  pdf: 'PDF Document',
  sms: 'SMS Message',
  manual: 'Manual Entry',
}

function AuthPage() {
  const { isAuthenticated, isAdmin, loginUser } = useAuth()
  const navigate = useNavigate()

  const [authStep, setAuthStep] = useState('login')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [otpError, setOtpError] = useState('')
  const [otpTimer, setOtpTimer] = useState(0)

  const [isLoading, setIsLoading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [profile, setProfile] = useState({
    name: '',
    region: REGION_OPTIONS[0],
    institutions: [],
    phoneVerified: false,
  })
  const [profileError, setProfileError] = useState('')
  const [institutionSearch, setInstitutionSearch] = useState('')

  const [selectedIntents, setSelectedIntents] = useState([])
  const [intentError, setIntentError] = useState('')

  const [sourceType, setSourceType] = useState('screenshot')
  const [selectedFile, setSelectedFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [rawText, setRawText] = useState('')
  const [amount, setAmount] = useState('')
  const [purchaseTime, setPurchaseTime] = useState('')

  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState('')
  const [analysisResult, setAnalysisResult] = useState(null)

  const otpRefs = useRef([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    if (authStep !== 'otp' || otpTimer <= 0) return undefined

    const timer = window.setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [authStep, otpTimer])

  useEffect(() => {
    if (authStep === 'otp') {
      otpRefs.current[0]?.focus()
    }
  }, [authStep])

  const filteredInstitutions = useMemo(() => {
    const needle = institutionSearch.trim().toLowerCase()
    return INSTITUTION_OPTIONS.filter((item) => {
      if (profile.institutions.includes(item)) return false
      return !needle || item.toLowerCase().includes(needle)
    })
  }, [institutionSearch, profile.institutions])

  const normalizePhone = (value) => value.replace(/[\s\-().]/g, '')

  const formatSeconds = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const goToAdminSignIn = () => {
    const normalized = normalizePhone(phoneNumber)
    navigate('/admin/auth', {
      state: normalized ? { phone: normalized } : undefined,
    })
  }

  const toggleIntent = (intentKey) => {
    setIntentError('')
    setSelectedIntents((prev) => {
      if (prev.includes(intentKey)) {
        return prev.filter((item) => item !== intentKey)
      }
      return [...prev, intentKey]
    })
  }

  const addInstitution = (name) => {
    if (!name || profile.institutions.includes(name)) return
    setProfile((prev) => ({ ...prev, institutions: [...prev.institutions, name] }))
    setInstitutionSearch('')
    setProfileError('')
  }

  const removeInstitution = (name) => {
    setProfile((prev) => ({
      ...prev,
      institutions: prev.institutions.filter((item) => item !== name),
    }))
  }

  const resolveUploadResult = (payload) => payload?.raw_result || payload?.execution?.result || payload || {}

  const buildDisplayName = (userPayload = {}) => {
    const provided = String(userPayload?.full_name || '').trim()
    if (provided) return provided

    const fromParts = [userPayload?.first_name, userPayload?.last_name]
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .join(' ')

    return fromParts
  }

  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/overview" replace />
  }
  if (isAuthenticated && !isAdmin) {
    return <Navigate to="/portal/home" replace />
  }

  const handlePhoneSubmit = async (e) => {
    e.preventDefault()
    setPhoneError('')

    const normalized = normalizePhone(phoneNumber)
    if (!normalized) {
      setPhoneError('Phone number is required.')
      return
    }

    if (isAdminPhone(normalized)) {
      setAuthStep('blocked')
      return
    }

    setIsLoading(true)
    try {
      await requestOtp({ phone_number: normalized, purpose: 'user' })
      setIsLoading(false)
      setOtpDigits(['', '', '', '', '', ''])
      setOtpTimer(OTP_DURATION_SECONDS)
      setAuthStep('otp')
    } catch (error) {
      setIsLoading(false)
      setPhoneError(error.message || 'Unable to send OTP. Please try again.')
    }
  }

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
      const otpResult = await verifyOtp({
        phone_number: normalizePhone(phoneNumber),
        otp_code: entered,
        purpose: 'user',
        name: profile.name,
      })

      const resolvedUser = otpResult?.user || {}
      const resolvedName = buildDisplayName(resolvedUser)
      const resolvedInstitutions = Array.isArray(resolvedUser?.financial_institutions)
        ? resolvedUser.financial_institutions
        : []
      const resolvedRegion = String(resolvedUser?.city_region || '').trim()
      const derivedProfileComplete = Boolean(
        resolvedName && resolvedRegion && resolvedInstitutions.length > 0
      )
      const onboardingRequired = otpResult?.onboarding_required ?? !derivedProfileComplete

      setProfile((prev) => ({
        ...prev,
        name: resolvedName || prev.name,
        region: resolvedRegion || prev.region,
        institutions: resolvedInstitutions.length ? resolvedInstitutions : prev.institutions,
        phoneVerified: true,
      }))

      if (!onboardingRequired) {
        setIsLoading(false)
        loginUser(
          normalizePhone(phoneNumber),
          {
            name: resolvedName || profile.name || 'Operator',
            region: resolvedRegion || profile.region,
            institutions: resolvedInstitutions.length ? resolvedInstitutions : profile.institutions,
            intents: selectedIntents,
          },
          { returningUser: true }
        )
        return
      }

      setIsLoading(false)
      setAuthStep('profile')
    } catch (error) {
      setOtpError(error.message || 'Invalid code. Please try again.')
      setIsLoading(false)
    }
  }

  const handleOtpDigit = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otpDigits]
    next[index] = value
    setOtpDigits(next)
    if (value && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = [...otpDigits]
    for (let i = 0; i < 6; i += 1) {
      next[i] = pasted[i] || ''
    }
    setOtpDigits(next)
    const nextFocus = Math.min(5, pasted.length)
    otpRefs.current[nextFocus]?.focus()
  }

  const handleResendOtp = async () => {
    if (otpTimer > 0) return
    setIsLoading(true)
    setOtpError('')

    try {
      await requestOtp({ phone_number: normalizePhone(phoneNumber), purpose: 'user' })
      setOtpTimer(OTP_DURATION_SECONDS)
      setOtpDigits(['', '', '', '', '', ''])
      otpRefs.current[0]?.focus()
      setIsLoading(false)
    } catch (error) {
      setOtpError(error.message || 'Unable to resend OTP.')
      setIsLoading(false)
    }
  }

  const moveToIntentSelection = async () => {
    if (!profile.name.trim()) {
      setProfileError('Full name is required.')
      return
    }
    if (!profile.region.trim()) {
      setProfileError('Region / city is required.')
      return
    }
    if (profile.institutions.length === 0) {
      setProfileError('Select at least one financial institution.')
      return
    }

    setProfileError('')

    setIsLoading(true)
    try {
      await saveUserProfile({
        phone_number: normalizePhone(phoneNumber),
        name: profile.name,
        region: profile.region,
        financial_institutions: profile.institutions,
      })

      setAuthStep('intent')
      setIsLoading(false)
    } catch (error) {
      setProfileError(error.message || 'Unable to save profile right now. Please try again.')
      setIsLoading(false)
    }
  }

  const moveToIngestion = () => {
    if (!selectedIntents.length) {
      setIntentError('Select at least one analysis intent.')
      return
    }

    setIntentError('')
    setSourceType(selectedIntents[0])
    setAuthStep('ingest')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError('')
    }
  }

  const handleFileSelection = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadError('')
    }
  }

  const runAnalysis = async () => {
    setUploadError('')

    if ((sourceType === 'screenshot' || sourceType === 'pdf') && !selectedFile) {
      setUploadError('Attach a file to continue.')
      return
    }

    if (sourceType === 'sms' && !rawText.trim()) {
      setUploadError('Paste transaction SMS text to continue.')
      return
    }

    if (sourceType === 'manual' && (!amount || !purchaseTime)) {
      setUploadError('Manual entry requires amount and purchase time.')
      return
    }

    setIsAnalyzing(true)
    setUploadProgress(6)
    setAuthStep('processing')

    const progressTimer = window.setInterval(() => {
      setUploadProgress((prev) => (prev >= 92 ? prev : prev + 8))
    }, 320)

    try {
      const form = new FormData()
      form.append('source_type', sourceType)
      form.append('type', sourceType)
      form.append('device_id', 'onboard-device-01')
      form.append('ip_address', '127.0.0.1')
      form.append('external_user_key', normalizePhone(phoneNumber))
      form.append('owner_name', profile.name)
      form.append('continue_on_gaps', 'true')
      form.append('age', '24')

      if (sourceType === 'sms') {
        form.append('raw_text', rawText)
      }

      if (sourceType === 'manual') {
        form.append('amount', amount)
        form.append('purchase_time', new Date(purchaseTime).toISOString())
      }

      if ((sourceType === 'screenshot' || sourceType === 'pdf') && selectedFile) {
        form.append('file', selectedFile)
      }

      const payload = await uploadTransactionEvidence(form)
      const result = resolveUploadResult(payload)
      const assessment = result?.fraud_assessment || {
        fraud_probability: payload?.fraud_score,
        risk_level: payload?.risk_level,
      }

      const fraudProbability = Math.round(Number(assessment?.fraud_probability || 0) * 100)
      const prediction = Number(assessment?.prediction || 0)
      const riskLevel = String(assessment?.risk_level || 'Medium')
      const recommendation = prediction === 1 ? 'Review Required' : 'Approved for Processing'

      setAnalysisResult({
        parsedData: {
          transaction_id: result?.id || 'pending',
          source: SOURCE_LABEL[sourceType],
          amount: result?.amount || amount || 'N/A',
          purchase_time: result?.purchase_time || purchaseTime || 'N/A',
          status: result?.status || 'pending',
        },
        fraudProbability,
        riskLevel,
        recommendation,
      })

      setUploadProgress(100)
      setAuthStep('ingest')
      setIsAnalyzing(false)
    } catch (error) {
      setUploadError(error.message || 'Unable to analyze evidence.')
      setAuthStep('ingest')
      setIsAnalyzing(false)
    } finally {
      window.clearInterval(progressTimer)
    }
  }

  const completeOnboarding = () => {
    const firstInsight = analysisResult
      ? {
          message: 'First Insight Ready',
          riskLevel: String(analysisResult.riskLevel || 'Medium'),
          fraudProbability: Number(analysisResult.fraudProbability || 0),
          recommendation: analysisResult.recommendation || 'Review Required',
        }
      : {
          message: 'First Insight Ready',
          riskLevel: 'High',
          fraudProbability: 55,
          recommendation: 'Review Required',
        }

    loginUser(
      normalizePhone(phoneNumber),
      {
        name: profile.name || 'Operator',
        region: profile.region,
        institutions: profile.institutions,
        intents: selectedIntents,
      },
      { firstInsight }
    )
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-transparent p-4">
      <main className="relative z-10 w-full max-w-2xl">
        <div className="mb-12 flex flex-col items-center">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-surface-container border border-white/10 shadow-premium mb-8 ring-2 ring-white/10 overflow-hidden">
            <img src="/logo.png" alt="Q" className="h-full w-full object-cover scale-125" />
          </div>
          <h1 className="font-display text-4xl font-extrabold text-white tracking-tighter italic uppercase underline decoration-primary/20">
            Quirass
          </h1>
          <p className="mt-4 text-on-surface-variant font-light italic">Sovereign Financial Integrity</p>
        </div>

        <SurfaceCard className="relative overflow-hidden border-white/5 p-8 glass-surface sm:p-12">
          <div className="mb-7 flex flex-wrap gap-2">
            <TokenPill tone="info">Phone + OTP</TokenPill>
            <TokenPill tone={profile.phoneVerified ? 'good' : 'warn'}>Profile Setup</TokenPill>
            <TokenPill tone={selectedIntents.length ? 'good' : 'warn'}>Intent Selection</TokenPill>
            <TokenPill tone={analysisResult ? 'good' : 'warn'}>First Insight</TokenPill>
          </div>

          {authStep === 'login' && (
            <div className="animate-enter">
              <h2 className="text-2xl font-black text-white italic uppercase mb-8 underline decoration-primary/20">
                Phone Login
              </h2>
              <p className="mb-8 text-sm text-on-surface-variant">
                Start by confirming your operator phone number.
              </p>
              <form className="space-y-6" onSubmit={handlePhoneSubmit}>
                <div className="space-y-2">
                  <label htmlFor="user-phone" className="text-[10px] font-black uppercase italic text-on-surface-variant">
                    Phone Number
                  </label>
                  <input
                    id="user-phone"
                    type="tel"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white font-black italic tracking-widest transition-all focus:border-primary focus:outline-none"
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
                  className="w-full bg-primary py-4 text-sm font-black italic"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending Signal…' : 'Request OTP Signal'}
                </PremiumButton>
                <button
                  type="button"
                  onClick={goToAdminSignIn}
                  className="w-full rounded-2xl border border-error/30 bg-error/10 py-3 text-sm font-black uppercase italic tracking-widest text-error transition-all hover:bg-error/20"
                  disabled={isLoading}
                >
                  Sign in as admin
                </button>
              </form>
              <div className="mt-12 border-t border-white/5 pt-8 text-center">
                <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant opacity-40">
                  <AppIcon name="safety" className="h-3.5 w-3.5" />
                  <span>Global Encryption Active</span>
                </div>
              </div>
            </div>
          )}

          {authStep === 'blocked' && (
            <div className="animate-enter text-center">
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-error/30 bg-error/10 text-error">
                <AppIcon name="lock" className="h-7 w-7" />
              </div>
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
                Sign in as admin
              </Link>
              <button
                onClick={() => { setAuthStep('login'); setPhoneNumber('') }}
                className="mt-4 text-[10px] font-black uppercase italic text-on-surface-variant/40 underline decoration-white/10 hover:text-white"
              >
                ← Use Different Number
              </button>
            </div>
          )}

          {authStep === 'otp' && (
            <div className="animate-enter text-center">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Step 1 / 4</p>
              <h2 className="mb-6 text-2xl font-black uppercase italic text-white underline decoration-primary/20">
                OTP Verification
              </h2>
              <p className="mb-8 text-sm font-light italic leading-relaxed text-on-surface-variant">
                Signal sent to <span className="font-bold italic text-white">{phoneNumber}</span>.
                <br />Enter the 6-digit operational code.
              </p>

              <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-1 text-xs font-semibold tracking-wider text-warning">
                Code expires in {formatSeconds(otpTimer)}
              </div>

              <form onSubmit={handleOtpSubmit}>
                <div className="mb-8 flex justify-center gap-3" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={(el) => { otpRefs.current[i] = el }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigit(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="h-14 w-10 rounded-xl border border-white/10 bg-white/5 text-center text-xl font-black italic text-white transition-all focus:border-primary focus:outline-none"
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
                onClick={handleResendOtp}
                disabled={otpTimer > 0 || isLoading}
                className="mt-5 text-[11px] font-semibold text-on-surface-variant underline decoration-primary/40 disabled:opacity-40"
              >
                Resend OTP
              </button>

              <button
                onClick={() => { setAuthStep('login'); setOtpDigits(['','','','','','']); setOtpError('') }}
                className="mt-6 text-[10px] font-black uppercase italic text-on-surface-variant/40 underline decoration-white/10 hover:text-white"
              >
                ← Re-enter Phone
              </button>
            </div>
          )}

          {authStep === 'profile' && (
            <div className="animate-enter">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Step 2 / 4</p>
              <h2 className="mb-2 text-2xl font-black uppercase italic text-white">Set Up Your Operational Profile</h2>
              <p className="mb-8 text-sm text-on-surface-variant">
                This helps us personalize your fraud detection and trust scoring.
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase italic text-on-surface-variant">Full Name</label>
                  <input
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white font-black italic tracking-widest transition-all focus:border-primary focus:outline-none"
                    placeholder="e.g. Hagos Tesfaye"
                    value={profile.name}
                    onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase italic text-on-surface-variant">Phone Number</label>
                  <div className="flex items-center justify-between rounded-xl border border-tertiary/20 bg-tertiary/10 px-4 py-3">
                    <p className="font-semibold text-white">{phoneNumber}</p>
                    <TokenPill tone="good">OTP Verified</TokenPill>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase italic text-on-surface-variant">Region / City</label>
                  <input
                    list="region-options"
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white font-semibold transition-all focus:border-primary focus:outline-none"
                    value={profile.region}
                    onChange={(e) => setProfile(p => ({ ...p, region: e.target.value }))}
                    placeholder="Search or select region"
                  />
                  <datalist id="region-options">
                    {REGION_OPTIONS.map((region) => (
                      <option key={region} value={region} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase italic text-on-surface-variant">Financial Institution (Multi-select)</label>
                  <input
                    value={institutionSearch}
                    onChange={(e) => setInstitutionSearch(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white font-semibold transition-all focus:border-primary focus:outline-none"
                    placeholder="Search institution and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addInstitution(filteredInstitutions[0] || institutionSearch.trim())
                      }
                    }}
                  />

                  {!!filteredInstitutions.length && (
                    <div className="max-h-36 space-y-2 overflow-y-auto rounded-xl border border-white/10 bg-surface-lowest/80 p-3">
                      {filteredInstitutions.map((institution) => (
                        <button
                          type="button"
                          key={institution}
                          onClick={() => addInstitution(institution)}
                          className="block w-full rounded-lg px-3 py-2 text-left text-sm text-on-surface-variant transition-colors hover:bg-white/10 hover:text-white"
                        >
                          {institution}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {profile.institutions.map((institution) => (
                      <button
                        type="button"
                        key={institution}
                        onClick={() => removeInstitution(institution)}
                        className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                      >
                        ✓ {institution} ×
                      </button>
                    ))}
                  </div>
                </div>

                {profileError ? <p className="text-sm text-error">{profileError}</p> : null}

                <PremiumButton onClick={moveToIntentSelection} variant="primary" className="mt-4 w-full py-4 font-black uppercase italic tracking-widest" disabled={isLoading}>
                  {isLoading ? 'Saving Profile…' : 'Continue to Intent Selection →'}
                </PremiumButton>
              </div>
            </div>
          )}

          {authStep === 'intent' && (
            <div className="animate-enter">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Step 3 / 4</p>
              <h2 className="mb-2 text-2xl font-black uppercase italic text-white">What do you want to analyze?</h2>
              <p className="mb-8 text-sm text-on-surface-variant">Select one or more data types to seed your first intelligence run.</p>

              <div className="grid gap-4 sm:grid-cols-2">
                {INTENT_OPTIONS.map((intent) => {
                  const isSelected = selectedIntents.includes(intent.key)
                  return (
                    <button
                      type="button"
                      key={intent.key}
                      onClick={() => toggleIntent(intent.key)}
                      className={`rounded-2xl border p-5 text-left transition-all ${isSelected ? 'border-primary/40 bg-primary/12' : 'border-white/10 bg-white/5 hover:border-primary/30 hover:bg-white/10'}`}
                    >
                        <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5">
                          <AppIcon name={intent.icon} className="h-5 w-5" />
                        </div>
                      <p className="text-sm font-black uppercase italic text-white">{intent.title}</p>
                      <p className="mt-2 text-xs text-on-surface-variant">{intent.detail}</p>
                      <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-primary">
                        {isSelected ? 'Selected' : 'Tap to select'}
                      </p>
                    </button>
                  )
                })}
              </div>

              {intentError ? <p className="mt-4 text-sm text-error">{intentError}</p> : null}

              <PremiumButton onClick={moveToIngestion} variant="primary" className="mt-8 w-full py-4 font-black uppercase italic tracking-widest">
                Continue to Upload →
              </PremiumButton>
            </div>
          )}

          {authStep === 'ingest' && (
            <div className="animate-enter">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-primary">Step 4 / 4</p>
              <h2 className="mb-2 text-2xl font-black uppercase italic text-white">Seed Ingestion</h2>
              <p className="mb-8 text-sm text-on-surface-variant">
                Drag and drop evidence, or choose one of the supported sources below.
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                {selectedIntents.map((intent) => (
                  <button
                    key={intent}
                    type="button"
                    onClick={() => setSourceType(intent)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${sourceType === intent ? 'bg-primary text-white' : 'border border-white/15 bg-white/5 text-on-surface-variant'}`}
                  >
                    {SOURCE_LABEL[intent]}
                  </button>
                ))}
              </div>

              {(sourceType === 'screenshot' || sourceType === 'pdf') && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`mb-6 rounded-3xl border-2 border-dashed p-8 text-center transition-all ${dragActive ? 'border-primary bg-primary/10' : 'border-white/15 bg-white/5'}`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelection}
                    className="hidden"
                    accept={sourceType === 'pdf' ? '.pdf' : '.png,.jpg,.jpeg'}
                  />
                  <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/5">
                    <AppIcon name="attachment" className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-white">Drag and Drop</p>
                  <p className="my-4 text-xs tracking-[0.2em] text-on-surface-variant">------ OR ------</p>
                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setSourceType('sms')}
                      className="rounded-xl border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white"
                    >
                      Paste SMS
                    </button>
                  </div>
                  <p className="mt-4 text-xs text-on-surface-variant">Accepted formats: PNG, JPG, PDF, TXT (SMS)</p>
                  {selectedFile ? <p className="mt-3 text-xs font-semibold text-primary">Selected: {selectedFile.name}</p> : null}
                </div>
              )}

              {sourceType === 'sms' && (
                <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <textarea
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    className="min-h-28 w-full rounded-xl border border-white/10 bg-surface-lowest px-4 py-3 text-sm text-white focus:border-primary focus:outline-none"
                    placeholder="Paste SMS transaction details here"
                  />
                </div>
              )}

              {sourceType === 'manual' && (
                <div className="mb-6 grid gap-3 sm:grid-cols-2">
                  <input
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                    placeholder="Amount"
                  />
                  <input
                    value={purchaseTime}
                    onChange={(e) => setPurchaseTime(e.target.value)}
                    type="datetime-local"
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              {uploadError ? <p className="mb-4 text-sm text-error">{uploadError}</p> : null}

              <PremiumButton onClick={runAnalysis} variant="primary" className="w-full py-4 font-black uppercase italic tracking-widest" disabled={isAnalyzing}>
                {isAnalyzing ? 'Analyzing evidence…' : 'Run Analysis'}
              </PremiumButton>

              {analysisResult && (
                <div className="mt-8 space-y-4 rounded-2xl border border-primary/20 bg-primary/10 p-6">
                  <h3 className="text-lg font-black uppercase italic text-white">Parsed Data Preview</h3>
                  <div className="grid gap-3 text-sm text-on-surface-variant sm:grid-cols-2">
                    <p>Transaction ID: <span className="font-semibold text-white">{analysisResult.parsedData.transaction_id}</span></p>
                    <p>Source: <span className="font-semibold text-white">{analysisResult.parsedData.source}</span></p>
                    <p>Amount: <span className="font-semibold text-white">{analysisResult.parsedData.amount}</span></p>
                    <p>Status: <span className="font-semibold text-white">{analysisResult.parsedData.status}</span></p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-tertiary">First Insight Ready</p>
                    <p className="mt-3 flex items-center gap-2 text-sm text-white">
                      <span>Transaction Risk:</span>
                      <span className="font-semibold text-warning">{String(analysisResult.riskLevel).toUpperCase()}</span>
                      <AppIcon name="warning" className="h-4 w-4 text-warning" />
                    </p>
                    <p className="mt-1 text-sm text-white">Fraud Probability: <span className="font-semibold text-error">{analysisResult.fraudProbability}%</span></p>
                    <p className="mt-1 text-sm text-white">Recommendation: <span className="font-semibold text-primary">{analysisResult.recommendation}</span></p>
                  </div>

                  <PremiumButton onClick={completeOnboarding} variant="primary" className="w-full py-4 text-sm font-black uppercase italic tracking-widest">
                    Finish and Open Dashboard
                  </PremiumButton>
                </div>
              )}
            </div>
          )}

          {authStep === 'processing' && (
            <div className="animate-enter text-center">
              <div className="mx-auto mb-6 h-24 w-24 animate-spin rounded-[1.6rem] border-4 border-primary/20 border-t-primary" />
              <h2 className="mb-3 text-2xl font-black uppercase italic text-white">Analyzing Evidence…</h2>
              <p className="mx-auto mb-6 max-w-md text-sm text-on-surface-variant">
                Parsing fields, running fraud scoring, and preparing your first trust insight.
              </p>
              <div className="mx-auto mb-3 h-2 w-full max-w-md overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className="text-xs text-on-surface-variant">{uploadProgress}% complete</p>
            </div>
          )}

          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-2xl rounded-full" />
        </SurfaceCard>
      </main>
    </div>
  )
}

export default AuthPage
