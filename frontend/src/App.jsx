import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'
import LandingPage from './pages/LandingPage'
import FeaturesPage from './pages/FeaturesPage'
import CapabilitiesPage from './pages/CapabilitiesPage'
import EnginePage from './pages/EnginePage'
import ResourcesPage from './pages/ResourcesPage'
import PricingPage from './pages/PricingPage'
import AuthPage from './pages/AuthPage'
import DashboardHome from './pages/dashboard/DashboardHome'
import DashboardHistory from './pages/dashboard/DashboardHistory'
import DashboardSend from './pages/dashboard/DashboardSend'
import DashboardLoan from './pages/dashboard/DashboardLoan'
import DashboardAdmin from './pages/dashboard/DashboardAdmin'

function App() {
  return (
    <Routes>
      {/* ─── Public Routes ─── */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/capabilities" element={<CapabilitiesPage />} />
        <Route path="/engine" element={<EnginePage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/auth" element={<AuthPage />} />
      </Route>

      {/* ─── Protected Dashboard Routes ─── */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Navigate to="/dashboard/home" replace />} />
        <Route path="/dashboard/home" element={<DashboardHome />} />
        <Route path="/dashboard/history" element={<DashboardHistory />} />
        <Route path="/dashboard/send" element={<DashboardSend />} />
        <Route path="/dashboard/loan" element={<DashboardLoan />} />
        <Route path="/dashboard/admin" element={<DashboardAdmin />} />
      </Route>

      {/* ─── Legacy redirects ─── */}
      <Route path="/admin" element={<Navigate to="/dashboard/admin" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
