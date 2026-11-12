import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './components/ErrorBoundary.jsx'

/**
 * Dynamic basename detection:
 * Supports:
 * - Subdirectory routing (e.g. http://101-php-01.fmdqgroup.com/appdeploy)
 * - Environment override (VITE_ROUTER_BASE)
 * - Vite configured BASE_URL
 * - Root domains (e.g. https://portalops.online/)
 */
export const getBasename = () => {
  if (typeof window === 'undefined') return undefined

  // 1. Explicit environment variable override
  const rawEnv = (import.meta.env.VITE_ROUTER_BASE || '').trim()
  if (!rawEnv || rawEnv === '/') return undefined
  const envBase = rawEnv.replace(/\/+$/, '')
  if (envBase) {
    return envBase.startsWith('/') ? envBase : `/${envBase}`
  }

  // 2. Vite base URL from vite.config.js (default is '/')
  const rawViteBase = (import.meta.env.BASE_URL || '').trim()
  const viteBase = rawViteBase.replace(/\/+$/, '')
  if (viteBase && viteBase !== '.' && viteBase !== '' && viteBase !== '/') {
    return viteBase.startsWith('/') ? viteBase : `/${viteBase}`
  }

  // 3. Dynamic path inspection from current URL
  const pathname = window.location.pathname || '/'
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length > 0) {
    // Top-level application routes that belong to the root of the app
    const topLevelRoutes = new Set([
      'login',
      'register',
      'docs',
      'features',
      'integrations',
      'changelog',
      'contact',
      'terms',
      'terms-of-service',
      'privacy',
      'privacy-policy',
      'security',
      'security-architecture',
      'confirm-email',
      'confirm-email-pending',
      'forgot-password',
      'reset-password',
      'accept-invite',
      'onboarding',
      'dashboard',
      'platform-admin',
      'projects',
      'servers',
      'deployments',
      'users',
      'teams',
      'audit-log',
      'settings',
      'profile',
      'logout',
    ])

    // If first segment is an application page route, we are hosted at domain root
    if (topLevelRoutes.has(segments[0])) {
      return undefined
    }

    // Optional legacy Windows Server subfolder compatibility
    if (segments[0].toLowerCase() === 'appdeploy' || segments[0].toLowerCase() === 'app-deploy') {
      return `/${segments[0]}`
    }

    return `/${segments[0]}`
  }

  // Default to domain root
  return undefined
}

const basename = getBasename()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
