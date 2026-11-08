import { useState, useEffect, useId } from 'react'
import {
  User,
  Mail,
  Shield,
  KeyRound,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Save,
  Loader2,
  Crown,
  Sparkles,
  Layers,
  Laptop,
  Check,
  Smartphone,
  ShieldAlert,
  Sliders,
  Bell,
  Send,
  CreditCard,
  Zap,
  Rocket
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useTheme } from '../context/ThemeContext'
import { can } from '../utils/permissions'

export function ProfileView() {
  const { user, isSuperAdmin, organizationName, updateProfile, changePassword, sendTestAlert } = useAuth()
  const { showToast } = useToast()
  const { isDark, toggleTheme } = useTheme()

  const [activeTab, setActiveTab] = useState('details') // 'details' | 'security' | 'permissions' | 'preferences'

  // Profile fields state
  const [name, setName] = useState(user?.name || '')
  const [roleTitle, setRoleTitle] = useState(user?.roleTitle || '')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  useEffect(() => {
    if (user?.name) setName(user.name)
    if (user?.roleTitle !== undefined) setRoleTitle(user.roleTitle || '')
  }, [user?.name, user?.roleTitle])

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [isChangingPw, setIsChangingPw] = useState(false)
  const [passwordError, setPasswordError] = useState(null)

  // Notification preferences state
  const [notifyDeploys, setNotifyDeploys] = useState(user?.notifyDeploySuccess !== false)
  const [notifyFailures, setNotifyFailures] = useState(user?.notifyDeployFailures !== false)
  const [notifyTeam, setNotifyTeam] = useState(user?.notifyTeamChanges !== false)
  const [isUpdatingAlerts, setIsUpdatingAlerts] = useState(false)
  const [sendingTestAlert, setSendingTestAlert] = useState(null) // null | string

  useEffect(() => {
    if (user) {
      if (user.notifyDeploySuccess !== undefined) setNotifyDeploys(user.notifyDeploySuccess !== false)
      if (user.notifyDeployFailures !== undefined) setNotifyFailures(user.notifyDeployFailures !== false)
      if (user.notifyTeamChanges !== undefined) setNotifyTeam(user.notifyTeamChanges !== false)
    }
  }, [user?.notifyDeploySuccess, user?.notifyDeployFailures, user?.notifyTeamChanges])

  const handleToggleAlert = async (key, newValue) => {
    let nextFailures = notifyFailures
    let nextDeploys = notifyDeploys
    let nextTeam = notifyTeam

    if (key === 'failures') {
      setNotifyFailures(newValue)
      nextFailures = newValue
    } else if (key === 'deploys') {
      setNotifyDeploys(newValue)
      nextDeploys = newValue
    } else if (key === 'team') {
      setNotifyTeam(newValue)
      nextTeam = newValue
    }

    setIsUpdatingAlerts(true)
    try {
      await updateProfile({
        notifyDeployFailures: nextFailures,
        notifyDeploySuccess: nextDeploys,
        notifyTeamChanges: nextTeam,
      })
      showToast({
        type: 'success',
        title: 'Preferences Saved',
        message: 'Your email alert preferences have been updated.',
      })
    } catch (err) {
      // Revert if error
      if (key === 'failures') setNotifyFailures(!newValue)
      if (key === 'deploys') setNotifyDeploys(!newValue)
      if (key === 'team') setNotifyTeam(!newValue)
      showToast({
        type: 'error',
        title: 'Save Failed',
        message: err.message || 'Could not update alert preferences.',
      })
    } finally {
      setIsUpdatingAlerts(false)
    }
  }

  const handleSendTestAlert = async (type) => {
    setSendingTestAlert(type)
    try {
      const res = await sendTestAlert(type)
      showToast({
        type: 'success',
        title: 'Test Email Dispatched',
        message: res?.message || `A test alert has been sent to ${user?.email}. Check your inbox!`,
      })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Test Failed',
        message: err.message || 'Could not send test email. Please check SMTP settings.',
      })
    } finally {
      setSendingTestAlert(null)
    }
  }

  const userRole = (user?.role || 'ADMIN').toUpperCase()

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      showToast({ type: 'error', title: 'Validation Error', message: 'Full name cannot be empty.' })
      return
    }

    setIsUpdatingProfile(true)
    try {
      await updateProfile({
        name: name.trim(),
        roleTitle: roleTitle.trim(),
      })
      showToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal information has been saved successfully.',
      })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update your profile details.',
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError(null)

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.')
      return
    }
    if (!/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError('New password must contain at least one letter and one number.')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.')
      return
    }

    setIsChangingPw(true)
    try {
      await changePassword({
        currentPassword,
        newPassword,
      })
      showToast({
        type: 'success',
        title: 'Password Changed',
        message: 'Your account password has been updated. Other device sessions have been ended for security.',
      })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setPasswordError(err.message || 'Current password was incorrect. Please try again.')
    } finally {
      setIsChangingPw(false)
    }
  }

  // Password strength calculator
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { label: 'Empty', pct: 0, color: 'bg-zinc-200 dark:bg-zinc-800' }
    let score = 0
    if (pwd.length >= 8) score += 1
    if (pwd.length >= 12) score += 1
    if (/[A-Z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd)) score += 1
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 2) return { label: 'Weak', pct: 33, color: 'bg-[#BA1A1A]' }
    if (score <= 4) return { label: 'Moderate', pct: 66, color: 'bg-[#B87E0C]' }
    return { label: 'Strong', pct: 100, color: 'bg-[#2E8B57]' }
  }

  const pwStrength = getPasswordStrength(newPassword)

  // Permissions summary
  const capabilities = [
    { key: 'projects:manage', title: 'Manage Repositories & Services', desc: 'Create, edit, and configure projects and target servers.' },
    { key: 'deploy:create', title: 'Trigger Deployments', desc: 'Execute manual pipeline releases and dispatch deployments to nodes.' },
    { key: 'deploy:rollback', title: 'Rollback Deployments', desc: 'Safely revert targets to previous stable production release commits.' },
    { key: 'servers:manage', title: 'Manage Target Fleet', desc: 'Register Linux/Windows servers, manage SSH credentials, and health probes.' },
    { key: 'users:manage', title: 'Team Access & IAM', desc: 'Invite engineers, configure roles, and rotate credentials.' },
  ]

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto pb-12">
      {/* 1. Header & Breadcrumb */}
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#565f6b] dark:text-zinc-400 font-semibold">
          PLATFORM <span className="text-[#8F9CA7] dark:text-zinc-600">/</span> ACCOUNT <span className="text-[#8F9CA7] dark:text-zinc-600">/</span> PROFILE SETTINGS
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <div>
            <h1 className="text-[26px] font-bold text-[#101d26] dark:text-white tracking-tight leading-tight">
              Profile &amp; Account
            </h1>
            <p className="text-[13px] text-[#565f6b] dark:text-zinc-400 mt-0.5">
              Manage your personal credentials, workspace affiliations, and platform release roles.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-[5px] bg-[#E2F0FD] dark:bg-[#005459]/20 text-[#005459] dark:text-teal-300 font-mono text-[11px] font-semibold border border-[#BEDDF7] dark:border-[#005459]/40 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              <span>{organizationName || 'Primary Workspace'}</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Hero Profile Identity Card */}
      <div className="bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-[#E2F0FD] dark:bg-[#005459] border-2 border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[#005459] dark:text-white font-bold text-[22px] font-mono shadow-xs overflow-hidden">
                {user?.avatar && user.avatar !== '/avatar.jpg' ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  (user?.name || user?.email || 'User').slice(0, 2).toUpperCase()
                )}
              </div>
              {isSuperAdmin && (
                <div className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center absolute -top-1 -right-1 shadow-xs" title="Super Admin / Owner">
                  <Crown className="w-3 h-3 fill-current" />
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[18px] font-bold text-zinc-950 dark:text-white leading-tight">
                  {user?.name || 'Workspace User'}
                </h2>
                {isSuperAdmin ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#FAF3E7] dark:bg-amber-950/40 border border-[#F1D6A4] dark:border-amber-800 text-[10px] font-bold font-mono text-[#B87E0C] dark:text-amber-300">
                    <Crown className="w-3 h-3" />
                    <span>SUPER ADMIN</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] dark:bg-[#005459]/20 border border-[#BEDDF7] dark:border-[#005459]/40 text-[10px] font-semibold font-mono text-[#005459] dark:text-teal-300">
                    <Shield className="w-3 h-3" />
                    <span>{userRole}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[12px] font-mono text-zinc-500 dark:text-zinc-400">
                <span>{user?.email}</span>
                <span>•</span>
                <span>{user?.roleTitle || (userRole === 'ADMIN' ? 'Staff Platform Engineer' : 'Platform Deployer')}</span>
              </div>
            </div>
          </div>

          {/* Quick Status Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-zinc-100 dark:border-zinc-800">
            <div className="p-2.5 rounded-[6px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E8B57]" />
              <div>
                <div className="text-zinc-400 text-[9px] uppercase font-bold">Email Status</div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">Confirmed</div>
              </div>
            </div>

            <div className="p-2.5 rounded-[6px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono flex items-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <div>
                <div className="text-zinc-400 text-[9px] uppercase font-bold">Session State</div>
                <div className="font-semibold text-zinc-900 dark:text-zinc-100">Active (Live)</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 pb-px">
        {[
          { id: 'details', label: 'General Details', icon: User },
          { id: 'security', label: 'Security & Password', icon: KeyRound },
          { id: 'permissions', label: 'Role & Permissions', icon: Shield },
          { id: 'preferences', label: 'Preferences', icon: Sliders },
          { id: 'subscription', label: 'Subscription & Plans', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-[38px] px-3.5 rounded-t-[6px] text-[13px] font-medium flex items-center gap-2 transition-colors cursor-pointer relative ${
                isActive
                  ? 'bg-white dark:bg-[#0D1219] text-[#005459] dark:text-teal-300 font-bold border-t border-x border-zinc-200 dark:border-zinc-800 shadow-2xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#005459] dark:bg-teal-400" />
              )}
            </button>
          )
        })}
      </div>

      {/* 4. Tab 1: General Details Form */}
      {activeTab === 'details' && (
        <div className="bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-[16px] font-bold text-zinc-900 dark:text-white">
              Personal Information
            </h3>
            <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Update your display name and role title shown across deployments and audit trails.
            </p>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-[560px]">
            <div>
              <label className="block text-[12px] font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                Full Name <span className="text-[#BA1A1A]">*</span>
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jordan Lee"
                  className="w-full h-[36px] pl-8 pr-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#005459] dark:focus:border-teal-400 focus:ring-1 focus:ring-[#005459]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="email"
                  readOnly
                  disabled
                  value={user?.email || ''}
                  className="w-full h-[36px] pl-8 pr-3 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-[6px] text-[13px] font-mono text-zinc-500 dark:text-zinc-400 cursor-not-allowed select-all"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Your email address is your verified platform identifier and cannot be changed directly.
              </p>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                Job Title / Team
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g. Staff Platform Engineer"
                className="w-full h-[36px] px-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#005459] dark:focus:border-teal-400 focus:ring-1 focus:ring-[#005459]"
              />
            </div>

            <div>
              <label className="block text-[12px] font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                Workspace Affiliation
              </label>
              <div className="flex items-center gap-2 p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[6px]">
                <Building2 className="w-4 h-4 text-[#005459] dark:text-teal-400" />
                <div className="text-[12px]">
                  <span className="font-semibold text-zinc-900 dark:text-white">{organizationName || 'Primary Workspace'}</span>
                  <span className="text-zinc-400 text-[11px] font-mono ml-2">ID: {user?.organizationId || 'default'}</span>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="h-[36px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Details</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      
      {/* 5. Tab 5: Subscription & Plans (Self-Serve Freemium Wedge) */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-[17px] font-bold text-zinc-900 dark:text-white">
                  Subscription &amp; Platform Tier
                </h3>
                <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Bring Your Own Server (BYOS) model: deployments run entirely on your VPS compute.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Free Hobby Tier Active</span>
                </span>
              </div>
            </div>

            {/* 3 Tier Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
              {/* Free Forever */}
              <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                      HOBBY DEVELOPER
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      FREE FOREVER
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$0</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Zero-cost deployment for indie hackers and individual builders.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>1 Connected Server</strong> (BYOS)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Unlimited deployments &amp; releases</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Auto GitHub / GitLab Webhook trigger</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1-Line Automated SSH Onboarding</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled
                  className="w-full py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold cursor-default text-center"
                >
                  Current Active Plan
                </button>
              </div>

              {/* Pro Developer */}
              <div className="rounded-xl border-2 border-[#005459] p-5 flex flex-col justify-between space-y-5 bg-[#005459]/5 dark:bg-[#005459]/10 relative shadow-sm">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#005459] text-white">
                  POPULAR
                </span>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#005459] dark:text-teal-300">
                      PRO DEVELOPER
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2F0FD] text-[#005459]">
                      TEAM EXPANSION
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$15</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Designed for fast-shipping developers with multiple production nodes.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Up to 5 Connected Servers</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant 1-Click Production Rollbacks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Live WebSocket log streaming</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Slack &amp; Discord deploy notifications</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Stripe billing integration ready: upgrade to Pro Developer.')}
                  className="w-full py-2.5 rounded-lg bg-[#005459] hover:bg-[#074549] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer text-center"
                >
                  Upgrade to Pro Developer
                </button>
              </div>

              {/* Agency Tier */}
              <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      AGENCY &amp; STUDIO
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      CLIENT MANAGEMENT
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$49</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    For freelancers and agencies billing monthly retainers across multiple clients.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Unlimited Client Workspaces</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Unlimited Client Viewers &amp; Stakeholders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Multi-server deployment targets (HA / LB)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Granular RBAC, IP lock &amp; enforced 2FA</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Stripe billing integration ready: upgrade to Agency.')}
                  className="w-full py-2.5 rounded-lg border border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Upgrade to Agency Tier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Security & Password */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Password Change Card */}
          <div className="bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-6 shadow-xs space-y-5">
            <div>
              <h3 className="text-[16px] font-bold text-zinc-900 dark:text-white">
                Change Password
              </h3>
              <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Passwords are cryptographically hashed with Argon2id. Changing your password logs you out on all other active devices.
              </p>
            </div>

            {passwordError && (
              <div className="p-3 rounded-[6px] bg-[#FAEBE9] dark:bg-red-950/30 border border-[#F1B5AC] dark:border-red-900/50 text-[#BA1A1A] dark:text-red-300 text-[12.5px] flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#BA1A1A]" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4 max-w-[500px]">
              <div>
                <label className="block text-[12px] font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                  Current Password <span className="text-[#BA1A1A]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-[36px] pl-8 pr-10 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#005459] dark:focus:border-teal-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                  New Password <span className="text-[#BA1A1A]">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters (letters + numbers)"
                    className="w-full h-[36px] pl-8 pr-10 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#005459] dark:focus:border-teal-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                  >
                    {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-zinc-500">Strength:</span>
                      <span className="font-semibold">{pwStrength.label}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div className={`h-full ${pwStrength.color} transition-all duration-300`} style={{ width: `${pwStrength.pct}%` }} />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-medium text-zinc-800 dark:text-zinc-200 mb-1">
                  Confirm New Password <span className="text-[#BA1A1A]">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full h-[36px] pl-8 pr-3 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 outline-none focus:border-[#005459] dark:focus:border-teal-400"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPw}
                  className="h-[36px] px-4 rounded-[6px] bg-[#101d26] dark:bg-zinc-100 dark:text-zinc-950 text-white text-[12px] font-medium flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isChangingPw ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Updating Password...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Update Account Password</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Active Session & Device Hygiene Card */}
          <div className="bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-6 shadow-xs space-y-4">
            <h3 className="text-[16px] font-bold text-zinc-900 dark:text-white">
              Active Sessions &amp; Security Hygiene
            </h3>

            <div className="space-y-3">
              <div className="p-3.5 rounded-[6px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-[5px] bg-[#E2F0FD] dark:bg-[#005459]/30 text-[#005459] dark:text-teal-300 flex items-center justify-center">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>Current Active Web Session</span>
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                        THIS DEVICE
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Bearer JWT + HTTP-only rotation · CSRF Double Submit active
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-zinc-400">
                  Online now
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* 5. Tab 5: Subscription & Plans (Self-Serve Freemium Wedge) */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-[17px] font-bold text-zinc-900 dark:text-white">
                  Subscription &amp; Platform Tier
                </h3>
                <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Bring Your Own Server (BYOS) model: deployments run entirely on your VPS compute.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Free Hobby Tier Active</span>
                </span>
              </div>
            </div>

            {/* 3 Tier Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
              {/* Free Forever */}
              <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                      HOBBY DEVELOPER
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      FREE FOREVER
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$0</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Zero-cost deployment for indie hackers and individual builders.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>1 Connected Server</strong> (BYOS)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Unlimited deployments &amp; releases</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Auto GitHub / GitLab Webhook trigger</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1-Line Automated SSH Onboarding</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled
                  className="w-full py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold cursor-default text-center"
                >
                  Current Active Plan
                </button>
              </div>

              {/* Pro Developer */}
              <div className="rounded-xl border-2 border-[#005459] p-5 flex flex-col justify-between space-y-5 bg-[#005459]/5 dark:bg-[#005459]/10 relative shadow-sm">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#005459] text-white">
                  POPULAR
                </span>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#005459] dark:text-teal-300">
                      PRO DEVELOPER
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2F0FD] text-[#005459]">
                      TEAM EXPANSION
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$15</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Designed for fast-shipping developers with multiple production nodes.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Up to 5 Connected Servers</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant 1-Click Production Rollbacks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Live WebSocket log streaming</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Slack &amp; Discord deploy notifications</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Stripe billing integration ready: upgrade to Pro Developer.')}
                  className="w-full py-2.5 rounded-lg bg-[#005459] hover:bg-[#074549] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer text-center"
                >
                  Upgrade to Pro Developer
                </button>
              </div>

              {/* Agency Tier */}
              <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      AGENCY &amp; STUDIO
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      CLIENT MANAGEMENT
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$49</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    For freelancers and agencies billing monthly retainers across multiple clients.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Unlimited Client Workspaces</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Unlimited Client Viewers &amp; Stakeholders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Multi-server deployment targets (HA / LB)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Granular RBAC, IP lock &amp; enforced 2FA</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Stripe billing integration ready: upgrade to Agency.')}
                  className="w-full py-2.5 rounded-lg border border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Upgrade to Agency Tier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. Tab 3: Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[16px] font-bold text-zinc-900 dark:text-white">
                Assigned Platform Permissions
              </h3>
              <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Your account is assigned the <strong className="text-[#005459] dark:text-teal-300 font-mono">{userRole}</strong> role in <strong>{organizationName}</strong>.
              </p>
            </div>

            <span className="px-3 py-1 rounded-[5px] bg-[#E2F0FD] dark:bg-[#005459]/20 text-[#005459] dark:text-teal-300 border border-[#BEDDF7] dark:border-[#005459]/40 font-mono text-[12px] font-bold">
              Role: {userRole}
            </span>
          </div>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-[6px] overflow-hidden">
            {capabilities.map((cap) => {
              const hasPermission = can(userRole, cap.key)
              return (
                <div key={cap.key} className="p-3.5 flex items-center justify-between gap-4 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors">
                  <div className="space-y-0.5">
                    <div className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100">
                      {cap.title}
                    </div>
                    <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                      {cap.desc}
                    </div>
                  </div>

                  <div className="shrink-0">
                    {hasPermission ? (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-emerald-50 dark:bg-emerald-950/40 text-[#2E8B57] dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 font-mono text-[11px] font-medium">
                        <Check className="w-3.5 h-3.5" />
                        <span>Granted</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border border-zinc-200 dark:border-zinc-700 font-mono text-[11px]">
                        Restricted
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      
      {/* 5. Tab 5: Subscription & Plans (Self-Serve Freemium Wedge) */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-[17px] font-bold text-zinc-900 dark:text-white">
                  Subscription &amp; Platform Tier
                </h3>
                <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Bring Your Own Server (BYOS) model: deployments run entirely on your VPS compute.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Free Hobby Tier Active</span>
                </span>
              </div>
            </div>

            {/* 3 Tier Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
              {/* Free Forever */}
              <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                      HOBBY DEVELOPER
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      FREE FOREVER
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$0</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Zero-cost deployment for indie hackers and individual builders.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>1 Connected Server</strong> (BYOS)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Unlimited deployments &amp; releases</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Auto GitHub / GitLab Webhook trigger</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1-Line Automated SSH Onboarding</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled
                  className="w-full py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold cursor-default text-center"
                >
                  Current Active Plan
                </button>
              </div>

              {/* Pro Developer */}
              <div className="rounded-xl border-2 border-[#005459] p-5 flex flex-col justify-between space-y-5 bg-[#005459]/5 dark:bg-[#005459]/10 relative shadow-sm">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#005459] text-white">
                  POPULAR
                </span>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#005459] dark:text-teal-300">
                      PRO DEVELOPER
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2F0FD] text-[#005459]">
                      TEAM EXPANSION
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$15</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Designed for fast-shipping developers with multiple production nodes.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Up to 5 Connected Servers</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant 1-Click Production Rollbacks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Live WebSocket log streaming</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Slack &amp; Discord deploy notifications</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Stripe billing integration ready: upgrade to Pro Developer.')}
                  className="w-full py-2.5 rounded-lg bg-[#005459] hover:bg-[#074549] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer text-center"
                >
                  Upgrade to Pro Developer
                </button>
              </div>

              {/* Agency Tier */}
              <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      AGENCY &amp; STUDIO
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      CLIENT MANAGEMENT
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$49</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    For freelancers and agencies billing monthly retainers across multiple clients.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Unlimited Client Workspaces</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Unlimited Client Viewers &amp; Stakeholders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Multi-server deployment targets (HA / LB)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Granular RBAC, IP lock &amp; enforced 2FA</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Stripe billing integration ready: upgrade to Agency.')}
                  className="w-full py-2.5 rounded-lg border border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Upgrade to Agency Tier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Tab 4: Preferences */}
      {activeTab === 'preferences' && (
        <div className="bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-[16px] font-bold text-zinc-900 dark:text-white">
              Interface &amp; Notification Preferences
            </h3>
            <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Customize your workstation theme and personal notification alerts.
            </p>
          </div>

          <div className="space-y-4 max-w-[560px]">
            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-[6px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="text-[13px] font-semibold text-zinc-900 dark:text-white">Appearance Theme</div>
                <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400">Current mode: {isDark ? 'Dark Mode' : 'Light Mode'}</div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="h-[32px] px-3 rounded-[5px] bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-200 text-[12px] font-medium hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Switch to {isDark ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Email notification preferences */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200">Email Alerts</h4>
                  <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                    Real-time automated incident and release updates sent to <span className="font-mono text-zinc-700 dark:text-zinc-300">{user?.email}</span>.
                  </p>
                </div>
                {isUpdatingAlerts && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#005459] dark:text-teal-400">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Saving...</span>
                  </div>
                )}
              </div>

              <label className="flex items-center justify-between p-3.5 rounded-[6px] border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div>
                  <div className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                    Notify me on deployment failures
                  </div>
                  <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                    Instant alerts whenever a health check fails, a script errors, or a deployment halts.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyFailures}
                  disabled={isUpdatingAlerts}
                  onChange={(e) => handleToggleAlert('failures', e.target.checked)}
                  className="w-4 h-4 rounded text-[#005459] focus:ring-[#005459] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-[6px] border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div>
                  <div className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                    Notify me on successful production releases
                  </div>
                  <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                    Delivery receipts with target host, git commit sha, and execution elapsed time.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyDeploys}
                  disabled={isUpdatingAlerts}
                  onChange={(e) => handleToggleAlert('deploys', e.target.checked)}
                  className="w-4 h-4 rounded text-[#005459] focus:ring-[#005459] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-[6px] border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                <div>
                  <div className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
                    Notify me when new colleagues join workspace
                  </div>
                  <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                    Notification when a team member accepts an invitation and joins your workspace.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={notifyTeam}
                  disabled={isUpdatingAlerts}
                  onChange={(e) => handleToggleAlert('team', e.target.checked)}
                  className="w-4 h-4 rounded text-[#005459] focus:ring-[#005459] cursor-pointer"
                />
              </label>
            </div>

            {/* Test Email Delivery Section */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2.5">
              <div>
                <h4 className="text-[13px] font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-[#005459] dark:text-teal-400" />
                  <span>Test Alert Delivery</span>
                </h4>
                <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Dispatch a real test alert email to your inbox to confirm SMTP delivery works.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={!!sendingTestAlert}
                  onClick={() => handleSendTestAlert('DEPLOYMENT_FAILURE')}
                  className="h-[32px] px-3 rounded-[5px] bg-[#FAEBE9] hover:bg-red-100 text-[#BA1A1A] dark:bg-red-950/40 dark:hover:bg-red-900/60 dark:text-red-300 border border-[#F1B5AC] dark:border-red-900 text-[11.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sendingTestAlert === 'DEPLOYMENT_FAILURE' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Send Failure Alert</span>
                </button>

                <button
                  type="button"
                  disabled={!!sendingTestAlert}
                  onClick={() => handleSendTestAlert('DEPLOYMENT_SUCCESS')}
                  className="h-[32px] px-3 rounded-[5px] bg-[#EBF5EE] hover:bg-emerald-100 text-[#2E8B57] dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-[11.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sendingTestAlert === 'DEPLOYMENT_SUCCESS' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Send Success Alert</span>
                </button>

                <button
                  type="button"
                  disabled={!!sendingTestAlert}
                  onClick={() => handleSendTestAlert('TEAM_JOINED')}
                  className="h-[32px] px-3 rounded-[5px] bg-[#E2F0FD] hover:bg-teal-100 text-[#005459] dark:bg-teal-950/40 dark:hover:bg-teal-900/60 dark:text-teal-300 border border-[#BEDDF7] dark:border-teal-800 text-[11.5px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {sendingTestAlert === 'TEAM_JOINED' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Send Colleague Joined Alert</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 5: Subscription & Plans (Self-Serve Freemium Wedge) */}
      {activeTab === 'subscription' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="text-[17px] font-bold text-zinc-900 dark:text-white">
                  Subscription &amp; Platform Tier
                </h3>
                <p className="text-[12.5px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Bring Your Own Server (BYOS) model: deployments run entirely on your VPS compute.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Free Hobby Tier Active</span>
                </span>
              </div>
            </div>

            {/* 3 Tier Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-6">
              {/* Free Forever */}
              <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-500">
                      HOBBY DEVELOPER
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                      FREE FOREVER
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$0</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Zero-cost deployment for indie hackers and individual builders.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>1 Connected Server</strong> (BYOS)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Unlimited deployments &amp; releases</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Auto GitHub / GitLab Webhook trigger</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>1-Line Automated SSH Onboarding</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  disabled
                  className="w-full py-2 rounded-lg bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold cursor-default text-center"
                >
                  Current Active Plan
                </button>
              </div>

              {/* Pro Developer */}
              <div className="rounded-xl border-2 border-[#005459] p-5 flex flex-col justify-between space-y-5 bg-[#005459]/5 dark:bg-[#005459]/10 relative shadow-sm">
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#005459] text-white">
                  POPULAR
                </span>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-[#005459] dark:text-teal-300">
                      PRO DEVELOPER
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E2F0FD] text-[#005459]">
                      TEAM EXPANSION
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$15</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Designed for fast-shipping developers with multiple production nodes.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Up to 5 Connected Servers</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Instant 1-Click Production Rollbacks</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Live WebSocket log streaming</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Slack &amp; Discord deploy notifications</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Stripe billing integration ready: upgrade to Pro Developer.')}
                  className="w-full py-2.5 rounded-lg bg-[#005459] hover:bg-[#074549] text-white text-xs font-bold transition-colors shadow-xs cursor-pointer text-center"
                >
                  Upgrade to Pro Developer
                </button>
              </div>

              {/* Agency Tier */}
              <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-800 p-5 flex flex-col justify-between space-y-5 bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      AGENCY &amp; STUDIO
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                      CLIENT MANAGEMENT
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-zinc-900 dark:text-white">$49</span>
                    <span className="text-xs text-zinc-500">/ month</span>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    For freelancers and agencies billing monthly retainers across multiple clients.
                  </p>
                  <ul className="space-y-2 pt-2 text-xs text-zinc-700 dark:text-zinc-300">
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span><strong>Unlimited Client Workspaces</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Unlimited Client Viewers &amp; Stakeholders</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Multi-server deployment targets (HA / LB)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span>Granular RBAC, IP lock &amp; enforced 2FA</span>
                    </li>
                  </ul>
                </div>

                <button
                  type="button"
                  onClick={() => alert('Stripe billing integration ready: upgrade to Agency.')}
                  className="w-full py-2.5 rounded-lg border border-purple-300 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-purple-700 dark:text-purple-300 text-xs font-bold transition-colors cursor-pointer text-center"
                >
                  Upgrade to Agency Tier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
