import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

/**
 * Universal dynamic basename detection:
 * Supports BOTH root domains (e.g. https://portalops.online/)
 * AND Apache subdirectories (e.g. http://101-php-01.fmdqgroup.com/app-deploy/)
 * seamlessly without requiring build-time env flag rewrites.
 */
const getBasename = () => {
  if (typeof window === 'undefined') return undefined
  const pathname = window.location.pathname || '/'

  // 1. Root of domain or Vite dev server -> root basename
  if (pathname === '/' || window.location.port === '5173') return undefined

  // 2. Top-level application routes that belong to the app root, NOT a subdirectory
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
    'logout',
  ])

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) return undefined

  // If the first segment is an application page route, we are hosted at the domain root
  if (topLevelRoutes.has(segments[0])) {
    return undefined
  }

  // Otherwise, the first URL segment is the Apache subdirectory hosting the app (e.g. /app-deploy)
  return `/${segments[0]}`
}

const basename = getBasename()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
