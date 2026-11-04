// Utility for managing and evaluating Deployment Freeze Windows (Change Lockouts)
import { api } from '../services/api'

const STORAGE_KEY = 'deploy_portal_freeze_windows'

export const getStoredFreezeWindows = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const setStoredFreezeWindows = (windows) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(windows))
  } catch (err) {
    console.error('Failed to save freeze windows to storage:', err)
  }
}

export const fetchFreezeWindows = async () => {
  try {
    const res = await api('/governance/freeze-windows')
    if (Array.isArray(res)) {
      setStoredFreezeWindows(res)
      return res
    }
    if (res?.items && Array.isArray(res.items)) {
      setStoredFreezeWindows(res.items)
      return res.items
    }
  } catch {
    // Graceful fallback to persistent localStorage if backend route is not configured
  }
  return getStoredFreezeWindows()
}

/**
 * Checks if a given environment (e.g. 'production', 'staging') is currently under an active freeze window
 * @param {string} environment - Target environment name
 * @param {Array} freezeWindows - List of freeze windows (optional, reads from storage if omitted)
 * @returns {object|null} Active freeze window if locked, null otherwise
 */
export const getActiveFreezeWindow = (environment = 'production', freezeWindows = null) => {
  const windows = freezeWindows || getStoredFreezeWindows()
  if (!Array.isArray(windows) || windows.length === 0) return null

  const now = Date.now()
  const targetEnv = (environment || 'production').toLowerCase()

  for (const win of windows) {
    if (!win.enabled) continue

    const winEnv = (win.environment || 'production').toLowerCase()
    const matchesEnv = winEnv === 'all' || winEnv === targetEnv

    if (!matchesEnv) continue

    const start = new Date(win.startsAt).getTime()
    const end = new Date(win.endsAt).getTime()

    if (now >= start && now <= end) {
      return {
        ...win,
        remainingMinutes: Math.max(0, Math.round((end - now) / (1000 * 60)))
      }
    }
  }

  return null
}

/**
 * Checks whether a deployment is blocked by an active freeze window
 * @param {string} environment - Target environment
 * @param {string} userRole - Operator role (e.g. 'ADMIN', 'DEPLOYER', 'VIEWER')
 * @returns {object} { isBlocked, canBypass, freeze }
 */
export const checkFreezeStatus = (environment = 'production', userRole = 'OPERATOR') => {
  const activeFreeze = getActiveFreezeWindow(environment)
  if (!activeFreeze) {
    return { isBlocked: false, canBypass: true, freeze: null }
  }

  const role = (userRole || '').toUpperCase()
  const allowedRoles = (activeFreeze.allowedRoles || ['ADMIN']).map((r) => r.toUpperCase())
  const canBypass = allowedRoles.includes(role) || role === 'ADMIN'

  return {
    isBlocked: true,
    canBypass,
    freeze: activeFreeze
  }
}
