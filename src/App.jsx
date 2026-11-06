import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppLayout } from './components/AppLayout'
import {
  DashboardView,
  ProjectsView,
  ProjectDetailView,
  CreateProjectView,
  ServersView,
  DeploymentsView,
  UsersView,
  AuditLogView,
  SettingsView,
  SignIn,
  Register,
  ForgotPassword,
  ResetPassword,
  OnboardingView,
  AcceptInvite,
  LandingPage,
} from './pages'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F5] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#005459] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }
  return children
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Landing & Auth Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />

            {/* Super Admin Guided Onboarding Route */}
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <OnboardingView />
                </ProtectedRoute>
              }
            />

            {/* Protected Application Routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardView />} />
              <Route path="/projects" element={<ProjectsView />} />
              <Route path="/projects/new" element={<CreateProjectView />} />
              <Route path="/projects/:projectId" element={<ProjectDetailView />} />
              <Route path="/servers" element={<ServersView />} />
              <Route path="/deployments" element={<DeploymentsView />} />
              <Route path="/users" element={<UsersView />} />
              <Route path="/audit-log" element={<AuditLogView />} />
              <Route path="/settings" element={<SettingsView />} />
              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
