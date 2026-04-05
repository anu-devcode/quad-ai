import { Navigate, Route, Routes } from 'react-router-dom'

// Layouts
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import AdminLayout from './layouts/AdminLayout'

// Public Pages
import LandingPage from './pages/LandingPage'
import FeaturesPage from './pages/FeaturesPage'
import CapabilitiesPage from './pages/CapabilitiesPage'
import ResourcesPage from './pages/ResourcesPage'
import PricingPage from './pages/PricingPage'
import UseCasesPage from './pages/UseCasesPage'
import DemoPage from './pages/DemoPage'

// Auth Pages (strictly separated)
import AuthPage from './pages/AuthPage'               // User login: /auth
import AdminAuthPage from './pages/admin/AdminAuthPage' // Admin login: /admin/auth

// User Portal Modules (/portal/*)
import DashboardHome from './pages/dashboard/DashboardHome'
import DataUpload from './pages/dashboard/DataUpload'
import TransactionInsights from './pages/dashboard/TransactionInsights'
import CreditProfile from './pages/dashboard/CreditProfile'
import TrustStatus from './pages/dashboard/TrustStatus'
import DashboardHistory from './pages/dashboard/DashboardHistory'
import DashboardLoan from './pages/dashboard/DashboardLoan'

// Admin Control Modules (/admin/*) — only reachable via AdminLayout
import AdminOverview from './pages/dashboard/admin/AdminOverview'
import AdminLoans from './pages/dashboard/admin/AdminLoans'
import AdminEvidence from './pages/dashboard/admin/AdminEvidence'
import AdminUsers from './pages/dashboard/admin/AdminUsers'
import AdminAnalytics from './pages/dashboard/admin/AdminAnalytics'
import AdminSettings from './pages/dashboard/admin/AdminSettings'
import ThemeToggle from './components/ThemeToggle'

function App() {
  return (
    <>
      <ThemeToggle />
      <Routes>
        {/* ═══════════════════════════════════════════════════════════════════
            PUBLIC ROUTES — No auth required
        ═══════════════════════════════════════════════════════════════════ */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/capabilities" element={<CapabilitiesPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/use-cases" element={<UseCasesPage />} />
          <Route path="/demo" element={<DemoPage />} />
        </Route>

        {/* ═══════════════════════════════════════════════════════════════════
            USER AUTH — /auth
            Standalone, NOT nested in PublicLayout (no navbar/footer)
            Admin phone numbers are blocked here and sent to /admin/auth
        ═══════════════════════════════════════════════════════════════════ */}
        <Route path="/auth" element={<AuthPage />} />

        {/* ═══════════════════════════════════════════════════════════════════
            ADMIN AUTH — /admin/auth
            Completely separate from /auth.
            Only whitelisted phone numbers can proceed past OTP.
        ═══════════════════════════════════════════════════════════════════ */}
        <Route path="/admin/auth" element={<AdminAuthPage />} />

        {/* ═══════════════════════════════════════════════════════════════════
            USER PORTAL — /portal/*
            Protected by DashboardLayout:
              • Unauthenticated → /auth
              • Admin user    → /admin/overview  (hard redirect, no access)
              • /admin/* path → /portal/home     (path guard)
        ═══════════════════════════════════════════════════════════════════ */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Navigate to="/portal/home" replace />} />
          <Route path="/portal/home" element={<DashboardHome />} />
          <Route path="/portal/upload" element={<DataUpload />} />
          <Route path="/portal/insights" element={<TransactionInsights />} />
          <Route path="/portal/profile" element={<CreditProfile />} />
          <Route path="/portal/status" element={<TrustStatus />} />
          <Route path="/portal/history" element={<DashboardHistory />} />
          <Route path="/portal/loan" element={<DashboardLoan />} />
        </Route>

        {/* ═══════════════════════════════════════════════════════════════════
            ADMIN CONTROL HUB — /admin/*
            Protected by AdminLayout (separate from DashboardLayout):
              • Unauthenticated  → /admin/auth
              • Non-admin user   → /auth         (hard eject)
              • Non-/admin path  → /admin/overview
            /admin/auth is excluded here (handled above as standalone)
        ═══════════════════════════════════════════════════════════════════ */}
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Navigate to="/admin/overview" replace />} />
          <Route path="/admin/overview" element={<AdminOverview />} />
          <Route path="/admin/loans" element={<AdminLoans />} />
          <Route path="/admin/evidence" element={<AdminEvidence />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* ═══════════════════════════════════════════════════════════════════
            CATCH-ALL — redirect unknown paths to landing
        ═══════════════════════════════════════════════════════════════════ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default App
