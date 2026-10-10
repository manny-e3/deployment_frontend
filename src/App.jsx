import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
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
    <ToastProvider>
      <AuthProvider>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<SignIn />} />

          {/* Protected Application Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="projects" element={<ProjectsView />} />
            <Route path="projects/new" element={<CreateProjectView />} />
            <Route path="projects/:projectId" element={<ProjectDetailView />} />
            <Route path="servers" element={<ServersView />} />
            <Route path="deployments" element={<DeploymentsView />} />
            <Route path="users" element={<UsersView />} />
            <Route path="audit-log" element={<AuditLogView />} />
            <Route path="settings" element={<SettingsView />} />
            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </ToastProvider>
  )
}
