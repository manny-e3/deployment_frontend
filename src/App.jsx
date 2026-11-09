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
  CreateServerView,
  DeploymentsView,
  UsersView,
  TeamDetailView,
  AuditLogView,
  SettingsView,
  ProfileView,
  SignIn,
  Register,
  ConfirmEmail,
  ConfirmEmailPending,
  ForgotPassword,
  ResetPassword,
  OnboardingView,
  AcceptInvite,
  LandingPage,
  PlatformAdminView,
  TermsOfService,
  PrivacyPolicy,
  SecurityArchitecture,
} from './pages'

function ProtectedRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth()
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

  // Gate users whose email is unconfirmed: they cannot see onboarding or workspace
  if (user && user.isEmailVerified === false) {
    return <Navigate to="/confirm-email-pending" state={{ from: location }} replace />
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
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/security" element={<SecurityArchitecture />} />
            <Route path="/security-architecture" element={<SecurityArchitecture />} />
            <Route path="/confirm-email" element={<ConfirmEmail />} />
            <Route path="/confirm-email-pending" element={<ConfirmEmailPending />} />
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
              <Route path="/platform-admin" element={<PlatformAdminView />} />
              <Route path="/projects" element={<ProjectsView />} />
              <Route path="/projects/new" element={<CreateProjectView />} />
              <Route path="/projects/:projectId" element={<ProjectDetailView />} />
              <Route path="/servers" element={<ServersView />} />
              <Route path="/servers/create" element={<CreateServerView />} />
              <Route path="/servers/new" element={<CreateServerView />} />
              <Route path="/deployments" element={<DeploymentsView />} />
              <Route path="/users" element={<Navigate to="/teams/members" replace />} />
              <Route path="/teams" element={<TeamDetailView />} />
              <Route path="/teams/:tab" element={<TeamDetailView />} />
              <Route path="/audit-log" element={<AuditLogView />} />
              <Route path="/settings" element={<SettingsView />} />
              <Route path="/profile" element={<ProfileView />} />
              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
