import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PremiumButton, SurfaceCard } from '../components/ui'

function AuthPage() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const [authStep, setAuthStep] = useState('login') // login, otp, onboarding-1, onboarding-2, onboarding-3
  const [phoneNumber, setPhoneNumber] = useState('')
  const [role, setRole] = useState('user')

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  const handleLogin = (e) => {
    e.preventDefault()
    setAuthStep('otp')
    setTimeout(() => {
       // Auto-progress for demo
       setAuthStep('onboarding-1')
    }, 1500)
  }

  const completeOnboarding = (selectedRole) => {
    const finalRole = selectedRole || role
    login(finalRole)
    if (finalRole === 'admin') {
      navigate('/admin/overview')
    } else {
      navigate('/portal/home')
    }
  }

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Background Orbs */}
      <div className="absolute left-1/4 top-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[150px] pointer-events-none" />
      <div className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-primary-dim/10 blur-[120px] pointer-events-none" />

      <main className="relative z-10 w-full max-w-lg">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-16">
          <div className="grid h-20 w-20 place-items-center rounded-3xl bg-surface-container border border-white/10 shadow-premium mb-8 ring-2 ring-white/10 overflow-hidden">
             <img src="/logo.png" alt="Q" className="h-full w-full object-cover scale-125" />
          </div>
          <h1 className="font-display text-4xl font-extrabold text-white tracking-tighter italic uppercase underline decoration-primary/20">Quirass</h1>
          <p className="text-on-surface-variant font-light mt-4 italic">Sovereign Financial Integrity</p>
        </div>

        <SurfaceCard className="glass-surface p-12 overflow-hidden border-white/5 relative">
          
          {/* LOGIN STEP */}
          {authStep === 'login' && (
            <div className="animate-enter">
              <h2 className="text-2xl font-black text-white italic uppercase mb-8 underline decoration-primary/20">Operator Access</h2>
              <form className="space-y-6" onSubmit={handleLogin}>
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-on-surface-variant italic">ID: Phone Number</label>
                   <input 
                      className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black italic tracking-widest focus:border-primary focus:outline-none transition-all"
                      placeholder="+251 ..."
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                   />
                </div>
                <PremiumButton type="submit" variant="primary" className="w-full py-4 text-sm font-black bg-primary italic">Request OTP Signal</PremiumButton>
              </form>
              <div className="mt-12 pt-8 border-t border-white/5 flex flex-col gap-4">
                 <button onClick={() => completeOnboarding('admin')} className="text-[10px] font-black text-on-surface-variant hover:text-white uppercase tracking-widest italic decoration-primary/20 underline">Admin Control Override (DEMO)</button>
                 <p className="text-[10px] text-on-surface-variant font-bold italic opacity-40 text-center uppercase tracking-widest">Global Encryption Active 🛡️</p>
              </div>
            </div>
          )}

          {/* OTP STEP */}
          {authStep === 'otp' && (
            <div className="animate-enter text-center">
              <h2 className="text-2xl font-black text-white italic uppercase mb-6 underline decoration-primary/20">OTP Verification</h2>
              <p className="text-sm text-on-surface-variant italic font-light mb-10 leading-relaxed">Signal sent to <span className="font-bold text-white italic">{phoneNumber}</span>. <br/>Enter the 6-digit operational code.</p>
              <div className="flex justify-center gap-3 mb-10">
                 {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 w-10 bg-white/5 border border-white/10 rounded-lg animate-pulse" />)}
              </div>
              <p className="text-[10px] text-on-surface-variant font-black italic uppercase animate-pulse">Waiting for Data Sync...</p>
            </div>
          )}

          {/* ONBOARDING 1: Basic Info */}
          {authStep === 'onboarding-1' && (
            <div className="animate-enter">
              <p className="text-[10px] font-black text-primary uppercase italic mb-2 tracking-widest underline decoration-primary/20">Step 01 / 03</p>
              <h2 className="text-2xl font-black text-white italic uppercase mb-8">Basic Intelligence</h2>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant italic">Operational Name</label>
                    <input className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black italic tracking-widest" placeholder="e.g. Hagos T." />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-on-surface-variant italic">Regional Hub</label>
                    <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-black italic tracking-widest appearance-none">
                       <option>Addis Ababa Hub</option>
                       <option>Mekelle Edge</option>
                       <option>Nairobi Global</option>
                    </select>
                 </div>
                 <PremiumButton onClick={() => setAuthStep('onboarding-2')} variant="primary" className="w-full py-4 font-black italic uppercase tracking-widest mt-6">Next Signal →</PremiumButton>
              </div>
            </div>
          )}

          {/* ONBOARDING 2: Financial Focus */}
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
                 <PremiumButton onClick={() => setAuthStep('onboarding-3')} variant="primary" className="w-full py-4 font-black italic uppercase tracking-widest mt-8">Configure Inference Hub →</PremiumButton>
              </div>
            </div>
          )}

          {/* ONBOARDING 3: Initial Upload */}
          {authStep === 'onboarding-3' && (
            <div className="animate-enter text-center">
              <p className="text-[10px] font-black text-primary uppercase italic mb-2 tracking-widest underline decoration-primary/20">Final Sync 03 / 03</p>
              <h2 className="text-2xl font-black text-white italic uppercase mb-8 underline decoration-primary/20">Seed Ingestion</h2>
              <p className="text-sm text-on-surface-variant italic font-light mb-10 leading-relaxed px-4">To generate your first Operational Score, upload one transaction screenshot or SMS proof.</p>
              
              <label className="group relative block aspect-video rounded-3xl bg-white/5 border-2 border-dashed border-white/10 hover:border-primary/50 cursor-pointer overflow-hidden flex flex-col items-center justify-center p-8 mb-10">
                 <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">📄</div>
                 <p className="text-[10px] font-black text-white uppercase italic tracking-widest opacity-40">Drop Seed Evidence</p>
              </label>

              <PremiumButton onClick={() => completeOnboarding()} variant="primary" className="w-full py-4 font-black text-lg bg-primary italic shadow-premium">Initialize Hub Profile</PremiumButton>
              <button 
                onClick={() => completeOnboarding()}
                className="mt-6 text-[10px] font-black text-on-surface-variant/40 hover:text-white uppercase italic underline decoration-white/10"
              >
                Skip Seed (Inference 0.0)
              </button>
            </div>
          )}

          {/* Decorative Effect */}
          <div className="absolute top-0 right-0 h-32 w-32 bg-primary/5 blur-2xl rounded-full" />
        </SurfaceCard>
      </main>
    </div>
  )
}

export default AuthPage
