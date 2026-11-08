import { createContext, useContext, useState, useEffect } from 'react'
import { api, setOnSessionEnded, ApiError, getAuthToken, setAuthTokens, clearAuthTokens, getRefreshToken, setCsrfToken } from '../services/api'
import { connectSocket, disconnectSocket, setSocketSessionEndedHandler } from '../services/socket'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const isLoggedOut = localStorage.getItem('deploy_portal_logged_out') === 'true'
    if (isLoggedOut && !getAuthToken()) return null
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
    clearAuthTokens()
    setUser(null)
    localStorage.setItem('deploy_portal_logged_out', 'true')
    localStorage.removeItem('deploy_portal_user')
    localStorage.removeItem('deploy_portal_organization')
    localStorage.removeItem('deploy_portal_onboarded_members')
    localStorage.removeItem('deploy_portal_onboarding_completed')
    localStorage.removeItem('deploy_portal_registered_users')
    localStorage.removeItem('deploy_portal_super_admin_id')
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
            isEmailVerified: me.isEmailVerified ?? true,
            notifyDeployFailures: me.notifyDeployFailures ?? true,
            notifyDeploySuccess: me.notifyDeploySuccess ?? true,
            notifyTeamChanges: me.notifyTeamChanges ?? true,
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
            isEmailVerified: loggedInUser.isEmailVerified ?? true,
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

  const register = async ({ name, email, password, organizationName }) => {
    const cleanEmail = email.toLowerCase().trim()
    const orgName = organizationName?.trim() || 'My Organization'

    // Determine if this is the first registered user (Super Admin)
    const existingUsersRaw = localStorage.getItem('deploy_portal_registered_users')
    let existingUsers = []
    try {
      existingUsers = existingUsersRaw ? JSON.parse(existingUsersRaw) : []
    } catch {
      existingUsers = []
    }

    const isFirstUser = existingUsers.length === 0 || !localStorage.getItem('deploy_portal_super_admin_id')
    const assignedRole = 'ADMIN'
    const assignedTitle = isFirstUser ? 'Super Admin & Owner' : 'Platform Deployer'

    try {
      // 1. Attempt backend /auth/register
      const res = await api('/auth/register', {
        method: 'POST',
        body: {
          name: name.trim(),
          email: cleanEmail,
          password,
          organizationName: orgName,
          role: assignedRole,
        },
      })

      if (res) {
        const formatted = {
          ...res,
          avatar: res.avatar || '/avatar.jpg',
          role: res.role || assignedRole,
          roleTitle: res.roleTitle || (res.role === 'ADMIN' ? 'Super Admin & Owner' : assignedTitle),
          isSuperAdmin: res.role === 'ADMIN' || isFirstUser,
          organizationName: res.organizationName || orgName,
          isEmailVerified: res.isEmailVerified ?? false,
          emailSent: res.emailSent ?? true,
        }
        setUser(formatted)
        localStorage.removeItem('deploy_portal_logged_out')
        localStorage.setItem('deploy_portal_user', JSON.stringify(formatted))
        localStorage.setItem('deploy_portal_organization', JSON.stringify({ name: orgName, ownerEmail: cleanEmail }))
        if (isFirstUser) {
          localStorage.setItem('deploy_portal_super_admin_id', formatted.id || cleanEmail)
        }
        connectSocket()
        return formatted
      }
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(err.message || 'Registration failed.')
      }
      console.warn('Backend /auth/register unavailable, using local simulated registration:', err.message)
    }

    // 2. Simulated registration fallback
    const newUserId = `usr_${Date.now()}`
    const mockUser = {
      id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole,
      roleTitle: assignedTitle,
      isSuperAdmin: isFirstUser,
      organizationName: orgName,
      avatar: '/avatar.jpg',
      createdAt: new Date().toISOString(),
      emailSent: true,
    }

    // Persist registered user & organization
    const updatedUsers = [...existingUsers, { ...mockUser, status: 'Active' }]
    localStorage.setItem('deploy_portal_registered_users', JSON.stringify(updatedUsers))
    localStorage.setItem('deploy_portal_organization', JSON.stringify({ name: orgName, ownerEmail: cleanEmail }))
    if (isFirstUser) {
      localStorage.setItem('deploy_portal_super_admin_id', newUserId)
    }

    // Generate mock token for auth header persistence
    setAuthTokens({
      accessToken: `mock_jwt_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      refreshToken: `mock_rf_${Date.now()}`,
    })

    setUser(mockUser)
    localStorage.removeItem('deploy_portal_logged_out')
    localStorage.setItem('deploy_portal_user', JSON.stringify(mockUser))
    return mockUser
  }

  // Accept team member invite
  const acceptInvite = async ({ token, name, password, email, role, organizationName }) => {
    const cleanEmail = (email || '').toLowerCase().trim()
    const assignedRole = (role || 'DEPLOYER').toUpperCase()

    try {
      const res = await api('/auth/accept-invite', {
        method: 'POST',
        body: { token, name, password },
      })
      if (res) {
        const formatted = {
          ...res,
          avatar: res.avatar || '/avatar.jpg',
          role: res.role || assignedRole,
          roleTitle: res.roleTitle || (assignedRole === 'ADMIN' ? 'Platform Admin' : assignedRole === 'VIEWER' ? 'Telemetry Observer' : 'Platform Deployer'),
          isSuperAdmin: false,
          organizationName: res.organizationName || organizationName || 'Primary Workspace',
        }
        setUser(formatted)
        localStorage.removeItem('deploy_portal_logged_out')
        localStorage.setItem('deploy_portal_user', JSON.stringify(formatted))
        connectSocket()
        return formatted
      }
    } catch (err) {
      if (err instanceof ApiError || err.status || err.message) {
        throw err
      }
      console.warn('Backend /auth/accept-invite error:', err.message)
      throw err
    }
  }

  // Super Admin batch onboards team members
  const onboardMembers = async (membersList) => {
    const existing = JSON.parse(localStorage.getItem('deploy_portal_onboarded_members') || '[]')
    const origin = window.location.origin
    const org = user?.organizationName || 'Engineering'

    const processed = []
    for (const m of membersList) {
      let inviteToken = null
      let inviteLink = null
      try {
        const res = await api('/users/invite', {
          method: 'POST',
          body: {
            name: m.name || m.email.split('@')[0],
            email: m.email.toLowerCase().trim(),
            role: (m.role || 'Deployer').toUpperCase(),
            roleTitle: m.roleTitle,
          },
        })
        inviteToken = res?.user?.inviteToken
        inviteLink = res?.inviteLink
      } catch (err) {
        console.warn('Could not invite member via API:', m.email, err.message)
      }

      const token = inviteToken || `inv_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`
      const link = inviteLink || `${origin}/accept-invite?token=${token}&email=${encodeURIComponent(m.email)}&role=${encodeURIComponent(m.role || 'Deployer')}&org=${encodeURIComponent(org)}&inviter=${encodeURIComponent(user?.name || 'Super Admin')}`

      processed.push({
        id: `u-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: m.name || m.email.split('@')[0],
        email: m.email.toLowerCase().trim(),
        role: (m.role || 'Deployer').toUpperCase(),
        roleTitle: m.roleTitle || (m.role === 'Admin' ? 'Admin Engineer' : m.role === 'Viewer' ? 'Telemetry Observer' : 'Platform Deployer'),
        status: 'Invited',
        inviteToken: token,
        inviteLink: link,
        invitedBy: user?.name || 'Super Admin',
        invitedAt: new Date().toISOString(),
      })
    }

    return processed
  }

  const updateOrganization = (newOrgName) => {
    if (!newOrgName) return
    const updatedUser = { ...user, organizationName: newOrgName }
    setUser(updatedUser)
    localStorage.setItem('deploy_portal_user', JSON.stringify(updatedUser))
    localStorage.setItem('deploy_portal_organization', JSON.stringify({ name: newOrgName }))
  }

  const updateProfile = async (profileData) => {
    const res = await api('/auth/profile', {
      method: 'PATCH',
      body: profileData,
    })
    if (res) {
      const updatedUser = {
        ...user,
        ...res,
        organizationName: res.organizationName || user?.organizationName,
      }
      setUser(updatedUser)
      localStorage.setItem('deploy_portal_user', JSON.stringify(updatedUser))
      return updatedUser
    }
  }

  const sendTestAlert = async (alertType = 'DEPLOYMENT_SUCCESS') => {
    return api('/auth/test-alert', {
      method: 'POST',
      body: { alertType },
    })
  }

  const changePassword = async ({ currentPassword, newPassword }) => {
    const res = await api('/auth/password', {
      method: 'PATCH',
      body: { currentPassword, newPassword },
    })
    if (res?.accessToken) {
      setAuthTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      })
    }
    if (res?.csrfToken) {
      setCsrfToken(res.csrfToken)
    }
    return { success: true }
  }

  const logout = async () => {
    try {
      const rf = getRefreshToken()
      await api('/auth/logout', {
        method: 'POST',
        body: rf ? { refreshToken: rf } : undefined,
      })
    } catch {
      // Ignore if network fails or already unauthenticated
    } finally {
      handleSessionEnded()
    }
  }

  const forgotPassword = async (email) => {
    return api('/auth/forgot-password', {
      method: 'POST',
      body: { email: email.toLowerCase().trim() },
    })
  }

  const verifyResetToken = async (token) => {
    return api(`/auth/verify-reset-token?token=${encodeURIComponent(token)}`, {
      method: 'GET',
    })
  }

  const resetPassword = async ({ token, newPassword }) => {
    return api('/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword },
    })
  }

  const confirmEmail = async (token) => {
    const res = await api('/auth/confirm-email', {
      method: 'POST',
      body: { token },
    })

    if (res) {
      const formatted = {
        ...(user || {}),
        ...res,
        isEmailVerified: true,
        avatar: res.avatar || user?.avatar || '/avatar.jpg',
        roleTitle: res.roleTitle || user?.roleTitle || (res.role === 'ADMIN' ? 'Super Admin & Owner' : 'Platform Deployer'),
      }
      setUser(formatted)
      localStorage.removeItem('deploy_portal_logged_out')
      localStorage.setItem('deploy_portal_user', JSON.stringify(formatted))
      connectSocket()
      return formatted
    }
    return res
  }

  const resendConfirmation = async (emailToResend) => {
    const emailTarget = (emailToResend || user?.email || '').toLowerCase().trim()
    return api('/auth/resend-confirmation', {
      method: 'POST',
      body: { email: emailTarget },
    })
  }

  const isSuperAdmin = user?.role?.toUpperCase() === 'SUPER_ADMIN' || user?.isSuperAdmin === true
  const organizationName = user?.organizationName || 'Primary Workspace'

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role?.toUpperCase() || 'ADMIN',
        isSuperAdmin,
        organizationName,
        loading,
        login,
        register,
        confirmEmail,
        resendConfirmation,
        acceptInvite,
        onboardMembers,
        updateOrganization,
        updateProfile,
        changePassword,
        sendTestAlert,
        logout,
        forgotPassword,
        verifyResetToken,
        resetPassword,
        isAuthenticated: !!user,
        isEmailVerified: !!user?.isEmailVerified,
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
