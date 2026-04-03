import { Navigate, Route, Routes } from 'react-router-dom'
import AuthPage from './pages/AuthPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import LandingPage from './pages/LandingPage'
import UserDashboardPage from './pages/UserDashboardPage'

function App() {
  return (
    <div className="min-h-screen bg-app-base text-ink">
      <div className="bg-orb bg-orb-left" />
      <div className="bg-orb bg-orb-right" />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/dashboard/:tab" element={<UserDashboardPage />} />
        <Route path="/dashboard/user" element={<Navigate to="/dashboard/home" replace />} />
        <Route path="/dashboard/admin" element={<Navigate to="/admin" replace />} />
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
