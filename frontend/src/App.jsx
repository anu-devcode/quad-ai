import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LandingPage from './pages/LandingPage'
import FeaturesPage from './pages/FeaturesPage'
import CapabilitiesPage from './pages/CapabilitiesPage'

import ResourcesPage from './pages/ResourcesPage'
import PricingPage from './pages/PricingPage'
import UseCasesPage from './pages/UseCasesPage'
import DemoPage from './pages/DemoPage'
import AuthPage from './pages/AuthPage'

// User Modules
import DashboardHome from './pages/dashboard/DashboardHome'
import DataUpload from './pages/dashboard/DataUpload'
import TransactionInsights from './pages/dashboard/TransactionInsights'
import CreditProfile from './pages/dashboard/CreditProfile'
import TrustStatus from './pages/dashboard/TrustStatus'
import DashboardHistory from './pages/dashboard/DashboardHistory'
import DashboardLoan from './pages/dashboard/DashboardLoan'

// Admin Modules
import AdminOverview from './pages/dashboard/admin/AdminOverview'
import FraudMonitoring from './pages/dashboard/admin/FraudMonitoring'
import DataReview from './pages/dashboard/admin/DataReview'
import UserManagement from './pages/dashboard/admin/UserManagement'
import ModelMonitoring from './pages/dashboard/admin/ModelMonitoring'

function App() {
  return (
    <Routes>
      {/* ─── Public Routes ─── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/capabilities" element={<CapabilitiesPage />} />

        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/use-cases" element={<UseCasesPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      {/* ─── Separated Dashboard Infrastructure ─── */}
      <Route element={<DashboardLayout />}>
        {/* Universal Entry points with Role-Enforcement in DashboardLayout */}
        <Route path="/dashboard" element={<Navigate to="/portal/home" replace />} />
        
        {/* User Portal Modules (Individual Hubs) */}
        <Route path="/portal/home" element={<DashboardHome />} />
        <Route path="/portal/upload" element={<DataUpload />} />
        <Route path="/portal/insights" element={<TransactionInsights />} />
        <Route path="/portal/profile" element={<CreditProfile />} />
        <Route path="/portal/status" element={<TrustStatus />} />
        <Route path="/portal/history" element={<DashboardHistory />} />
        <Route path="/portal/loan" element={<DashboardLoan />} />
        
        {/* Admin Gateway (System Governance) */}
        <Route path="/admin/overview" element={<AdminOverview />} />
        <Route path="/admin/fraud" element={<FraudMonitoring />} />
        <Route path="/admin/review" element={<DataReview />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/models" element={<ModelMonitoring />} />
      </Route>

      {/* Default Catch-all (Secure Public Infrastructure) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
