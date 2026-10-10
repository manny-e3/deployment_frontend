import { createContext, useContext, useState, useEffect } from 'react'
import { api, setOnSessionEnded, ApiError } from '../services/api'
import { connectSocket, disconnectSocket, setSocketSessionEndedHandler } from '../services/socket'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const isLoggedOut = localStorage.getItem('deploy_portal_logged_out') === 'true'
    if (isLoggedOut) return null
    const saved = localStorage.getItem('deploy_portal_user')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return null
      }
    }
    return null
  })
  const [loading, setLoading] = useState(true)

  // Session termination handler
  const handleSessionEnded = () => {
    setUser(null)
    localStorage.setItem('deploy_portal_logged_out', 'true')
    localStorage.removeItem('deploy_portal_user')
    disconnectSocket()
  }

  // Register session end handlers
  useEffect(() => {
    setOnSessionEnded(handleSessionEnded)
    setSocketSessionEndedHandler(handleSessionEnded)

    // Check backend session via GET /auth/me
    let isMounted = true
    async function checkCurrentSession() {
      try {
        const me = await api('/auth/me')
        if (me && isMounted) {
          const formatted = {
            ...me,
            avatar: me.avatar || '/avatar.jpg',
            roleTitle: me.roleTitle || (me.role === 'ADMIN' ? 'Staff Platform Eng' : me.role),
          }
          setUser(formatted)
          localStorage.removeItem('deploy_portal_logged_out')
          localStorage.setItem('deploy_portal_user', JSON.stringify(formatted))
          connectSocket()
        }
      } catch (err) {
        // If 401 unauthenticated, clear session
        if (err instanceof ApiError && err.status === 401) {
          if (isMounted) handleSessionEnded()
        }
        // If network error (backend offline during dev), retain current local state
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    checkCurrentSession()
    return () => {
      isMounted = false
    }
  }, [])

  const login = async (credentials) => {
    // If called with email & password, attempt backend /auth/login
    if (credentials?.email && credentials?.password) {
      try {
        const loggedInUser = await api('/auth/login', {
          method: 'POST',
          body: {
            email: credentials.email.toLowerCase().trim(),
            password: credentials.password,
          },
        })

        if (loggedInUser) {
          const formatted = {
            ...loggedInUser,
            avatar: loggedInUser.avatar || '/avatar.jpg',
            roleTitle: loggedInUser.roleTitle || (loggedInUser.role === 'ADMIN' ? 'Staff Platform Eng' : loggedInUser.role),
          }
          setUser(formatted)
          localStorage.removeItem('deploy_portal_logged_out')
          localStorage.setItem('deploy_portal_user', JSON.stringify(formatted))
          connectSocket()
          return formatted
        }
      } catch (err) {
        throw err // Re-throw ApiError for UI to display (e.g. 401 INVALID_CREDENTIALS)
      }
    }

    // Fallback: if a user object is passed directly (e.g. from SSO callback)
    if (credentials?.id || credentials?.email) {
      const fallbackUser = credentials
      setUser(fallbackUser)
      localStorage.removeItem('deploy_portal_logged_out')
      localStorage.setItem('deploy_portal_user', JSON.stringify(fallbackUser))
      return fallbackUser
    }

    throw new Error('Email and password are required.')
  }

  const logout = async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // Ignore if network fails or already unauthenticated
    } finally {
      handleSessionEnded()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role?.toUpperCase() || 'ADMIN',
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
