import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// ─── ADMIN WHITELIST ────────────────────────────────────────────────────────
// Only these phone numbers can ever gain admin access.
// Even if OTP is delivered to another number, auth will be rejected here.
const ADMIN_WHITELIST = [
  '+251911000001',
  '+251911000002',
  '+251900000000', // Test Admin Number
  // Add authorised admin numbers here
]

export function isAdminPhone(phone) {
  // Normalize: strip spaces/dashes and compare
  const normalized = phone.replace(/[\s\-().]/g, '')
  return ADMIN_WHITELIST.some(
    (w) => w.replace(/[\s\-().]/g, '') === normalized
  )
}

// ─── SESSION STORAGE KEYS ───────────────────────────────────────────────────
const SESSION_KEY = 'qued_session'

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveSession(user) {
  try {
    if (user) sessionStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else sessionStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

// ─── CONTEXT ────────────────────────────────────────────────────────────────
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const navigate = useNavigate()
  const [user, setUser] = useState(() => loadSession())

  // Keep sessionStorage in sync whenever user changes
  useEffect(() => {
    saveSession(user)
  }, [user])

  /**
   * loginUser — completes user onboarding flow.
   * Phone number must NOT be an admin number.
   */
  const loginUser = useCallback(
    (phone, profile = {}) => {
      if (isAdminPhone(phone)) {
        // Admin trying to use user auth — reject silently and redirect to admin login
        navigate('/admin/auth', { replace: true })
        return
      }
      setUser({
        name: profile.name || 'Anonymous',
        initials: profile.name ? profile.name.slice(0, 2).toUpperCase() : 'AN',
        phone,
        role: 'user',
      })
      navigate('/portal/home', { replace: true })
    },
    [navigate]
  )

  /**
   * loginAdmin — completes admin auth flow.
   * Phone number MUST be in the whitelist — enforced both here and in AdminAuthPage.
   */
  const loginAdmin = useCallback(
    (phone, profile = {}) => {
      if (!isAdminPhone(phone)) {
        // Non-admin phone trying to access admin — hard block
        navigate('/admin/auth', { replace: true })
        return
      }
      setUser({
        name: profile.name || 'System Admin',
        initials: 'SA',
        phone,
        role: 'admin',
      })
      navigate('/admin/overview', { replace: true })
    },
    [navigate]
  )

  const logout = useCallback(() => {
    const wasAdmin = user?.role === 'admin'
    setUser(null)
    saveSession(null)
    // Admins return to admin login, users to user auth
    navigate(wasAdmin ? '/admin/auth' : '/auth', { replace: true })
  }, [navigate, user])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      isUser: user?.role === 'user',
      loginUser,
      loginAdmin,
      logout,
    }),
    [user, loginUser, loginAdmin, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
