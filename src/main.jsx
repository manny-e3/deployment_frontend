import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

// Dynamic basename detection:
// When served from an Apache subdirectory like /app-deploy/, ensure all client-side
// routes and redirects remain under /app-deploy/ (e.g. /app-deploy/login instead of /login)
const getBasename = () => {
  const path = window.location.pathname
  if (!path || path === '/' || window.location.port === '5173') return undefined

  if (import.meta.env.VITE_ROUTER_BASE) {
    const configuredBase = import.meta.env.VITE_ROUTER_BASE.replace(/\/+$/, '')
    if (configuredBase && path.startsWith(configuredBase)) {
      return configuredBase
    }
  }

  // Top-level application routes that shouldn't be treated as folder names
  const topLevelRoutes = new Set([
    'login',
    'register',
    'accept-invite',
    'onboarding',
    'dashboard',
    'projects',
    'servers',
    'deployments',
    'users',
    'audit-log',
    'settings',
  ])

  const segments = path.split('/').filter(Boolean)
  if (segments.length > 0 && !topLevelRoutes.has(segments[0])) {
    return `/${segments[0]}`
  }
  return undefined
}

const basename = getBasename()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
