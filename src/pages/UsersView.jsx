import { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  Shield,
  Search,
  ChevronDown,
  Command,
  Lock,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Monitor,
  ScrollText,
  AlertTriangle,
  RotateCcw,
  Crown,
  Building2,
  Copy,
  Check,
  Sparkles,
  UserX,
  UserCheck,
  Trash2,
  Ban
} from 'lucide-react'
import { ROLE_DEFINITIONS } from '../data/usersData'
import { InviteUserModal } from '../components/InviteUserModal'
import { OneTimeSecretModal } from '../components/OneTimeSecretModal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { can } from '../utils/permissions'
import { api, ApiError } from '../services/api'

export function UsersView() {
  const { user: currentUser, role, isSuperAdmin, organizationName } = useAuth()
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [tempPasswordModal, setTempPasswordModal] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    secretLabel: '',
    secretValue: '',
    userEmail: '',
  })
  const [copiedGeneralInvite, setCopiedGeneralInvite] = useState(false)
  const [copiedMemberId, setCopiedMemberId] = useState(null)
  const [resendingEmail, setResendingEmail] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  useEffect(() => {
    let isMounted = true
    async function fetchUsers() {
      setLoading(true)
      try {
        const res = await api('/users', { query: { limit: 50 } })
        let items = []
        const origin = window.location.origin
        const org = organizationName || 'Primary Workspace'
        if (res && res.items && isMounted) {
          items = res.items.map((u) => {
            const isInvited = Boolean(u.inviteToken)
            const inviteLink = isInvited
              ? `${origin}/accept-invite?token=${encodeURIComponent(u.inviteToken)}&email=${encodeURIComponent(u.email)}&role=${encodeURIComponent(u.role)}&org=${encodeURIComponent(org)}&inviter=${encodeURIComponent(currentUser?.name || 'Workspace Admin')}`
              : null
            return {
              ...u,
              roleTitle: u.roleTitle || (u.role === 'ADMIN' ? 'Admin Engineer' : u.role === 'DEPLOYER' ? 'Platform Deployer' : 'Telemetry Observer'),
              isYou: u.email?.toLowerCase() === currentUser?.email?.toLowerCase(),
              status: isInvited ? 'Invited' : (u.isActive ? 'Active' : 'Deactivated'),
              lastActive: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleTimeString() : (u.invitedAt ? 'Invited' : 'Never'),
              canResend: isInvited,
              inviteLink,
            }
          })
        }

        const existingEmails = new Set(items.map((i) => i.email?.toLowerCase()))

        // Ensure current user is included and marked properly
        if (currentUser && !existingEmails.has(currentUser.email?.toLowerCase())) {
          items.unshift({
            id: currentUser.id || 'usr_current',
            name: currentUser.name || 'Workspace User',
            email: currentUser.email || '',
            role: currentUser.role || 'ADMIN',
            roleTitle: currentUser.roleTitle || 'Workspace Owner',
            isSuperAdmin: isSuperAdmin,
            isYou: true,
            status: 'Active',
            lastActive: 'Just now',
            avatar: currentUser.avatar || '/avatar.jpg',
          })
        }

        if (isMounted) setUsers(items)
      } catch (err) {
        console.error('Failed to fetch users:', err)
        const items = []
        if (currentUser) {
          items.push({
            id: currentUser.id || 'usr_current',
            name: currentUser.name || 'Workspace User',
            email: currentUser.email || '',
            role: currentUser.role || 'ADMIN',
            roleTitle: currentUser.roleTitle || 'Workspace Owner',
            isSuperAdmin: isSuperAdmin,
            isYou: true,
            status: 'Active',
            lastActive: 'Just now',
            avatar: currentUser.avatar || '/avatar.jpg',
          })
        }
        if (isMounted) setUsers(items)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchUsers()
    return () => {
      isMounted = false
    }
  }, [currentUser, isSuperAdmin, organizationName])

  const handleAddUser = async (newUser) => {
    const res = await api('/users/invite', {
      method: 'POST',
      body: {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role?.toUpperCase() || 'DEPLOYER',
        roleTitle: newUser.roleTitle,
      },
    })

    const origin = window.location.origin
    const org = organizationName || 'Primary Workspace'
    const token = res?.user?.inviteToken || ''
    const inviteLink = res?.inviteLink || `${origin}/accept-invite?token=${encodeURIComponent(token)}&email=${encodeURIComponent(newUser.email)}&role=${encodeURIComponent(newUser.role)}&org=${encodeURIComponent(org)}&inviter=${encodeURIComponent(currentUser?.name || 'Workspace Admin')}`

    const enrichedUser = {
      ...newUser,
      id: res?.user?.id || `u-${Date.now()}`,
      name: res?.user?.name || newUser.name || newUser.email.split('@')[0],
      email: res?.user?.email || newUser.email,
      role: res?.user?.role || newUser.role?.toUpperCase(),
      roleTitle: res?.user?.roleTitle || newUser.roleTitle || 'Platform Engineer',
      initials: (res?.user?.name || newUser.name || newUser.email).slice(0, 2).toUpperCase(),
      bg: (res?.user?.role || newUser.role) === 'ADMIN' ? 'bg-[#005459]' : 'bg-[#565f6b]',
      status: 'Invited',
      inviteToken: token,
      inviteLink,
      invitedBy: currentUser?.name || 'Workspace Admin',
      invitedAt: res?.user?.invitedAt || new Date().toISOString(),
      lastActive: 'Just now',
      canResend: true,
    }

    setUsers((prev) => [enrichedUser, ...prev.filter((u) => u.email?.toLowerCase() !== newUser.email.toLowerCase())])

    setTempPasswordModal({
      isOpen: true,
      title: res?.emailSent ? 'Invitation Email Dispatched!' : 'Member Invitation Created',
      subtitle: res?.emailSent
        ? `An invitation email has been sent to ${newUser.email}. The new member can click the link in their inbox to join ${org}. You can also share the direct link below as a backup.`
        : `An invitation has been generated for ${newUser.email}. Share this link with them to join ${org}:`,
      secretLabel: 'Invitation Link',
      secretValue: inviteLink,
      userEmail: newUser.email,
    })

    return res
  }

  const handleCopyGeneralInvite = () => {
    const org = organizationName || 'Engineering'
    const origin = window.location.origin
    const link = `${origin}/accept-invite?org=${encodeURIComponent(org)}&inviter=${encodeURIComponent(currentUser?.name || 'Super Admin')}`
    navigator.clipboard?.writeText(link)
    setCopiedGeneralInvite(true)
    setTimeout(() => setCopiedGeneralInvite(false), 2000)
  }

  const handleCopyMemberLink = (link, id) => {
    navigator.clipboard?.writeText(link)
    setCopiedMemberId(id)
    setTimeout(() => setCopiedMemberId(null), 2000)
  }

  const handleResendInvite = async (email) => {
    setResendingEmail(email)
    try {
      const res = await api('/users/resend-invite', {
        method: 'POST',
        body: { email },
      })
      showToast({
        type: 'success',
        title: 'Invitation Sent',
        message: res?.emailSent ? `Invitation email resent to ${email} successfully!` : `Invitation renewed for ${email}.`,
      })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Resend Failed',
        message: err.message || `Failed to resend invitation to ${email}`,
      })
    } finally {
      setResendingEmail(null)
    }
  }

  const handleToggleStatus = async (targetUser) => {
    if (targetUser.isYou) return
    const nextActive = targetUser.status !== 'Active'
    setActionLoadingId(targetUser.id)
    try {
      await api(`/users/${targetUser.id}`, {
        method: 'PATCH',
        body: { isActive: nextActive },
      })
      setUsers((prev) =>
        prev.map((u) =>
          u.id === targetUser.id
            ? { ...u, isActive: nextActive, status: nextActive ? 'Active' : 'Deactivated' }
            : u
        )
      )
      showToast({
        type: nextActive ? 'success' : 'warning',
        title: nextActive ? 'Account Reactivated' : 'Account Suspended',
        message: nextActive
          ? `${targetUser.name || targetUser.email}'s platform access has been restored.`
          : `${targetUser.name || targetUser.email} has been suspended. All active sessions have been terminated.`,
      })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Action Failed',
        message: err.message || 'Could not update user account status.',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRevokeInvite = async (targetUser) => {
    if (!window.confirm(`Revoke invitation for ${targetUser.email}? The invitation link will immediately stop working.`)) {
      return
    }
    setActionLoadingId(targetUser.id)
    try {
      await api(`/users/${targetUser.id}`, { method: 'DELETE' })
      setUsers((prev) => prev.filter((u) => u.id !== targetUser.id))
      showToast({
        type: 'success',
        title: 'Invitation Revoked',
        message: `The invitation for ${targetUser.email} has been permanently cancelled.`,
      })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Revocation Failed',
        message: err.message || 'Could not revoke invitation.',
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const filteredUsers = users.filter((u) => {
    const nameMatch = (u.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    const emailMatch = (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    const titleMatch = (u.roleTitle || '').toLowerCase().includes(searchQuery.toLowerCase())
    const matchesSearch = nameMatch || emailMatch || titleMatch

    const normalizedRole = (u.role || '').toUpperCase()
    const matchesRole =
      roleFilter === 'All Roles' ||
      normalizedRole === roleFilter.toUpperCase() ||
      (roleFilter === 'Admin' && (normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN'))

    const matchesStatus =
      statusFilter === 'All Statuses' ||
      (u.status || '').toLowerCase() === statusFilter.toLowerCase()

    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Admins' && (normalizedRole === 'ADMIN' || normalizedRole === 'SUPER_ADMIN')) ||
      (activeTab === 'Deployers' && normalizedRole === 'DEPLOYER') ||
      (activeTab === 'Viewers' && normalizedRole === 'VIEWER') ||
      (activeTab === 'Pending Invites' && u.status === 'Invited')

    return matchesSearch && matchesRole && matchesStatus && matchesTab
  })


  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div>
        {/* Breadcrumb */}
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#565f6b] font-semibold">
          PLATFORM <span className="text-[#8F9CA7]">/</span> ACCESS CONTROL <span className="text-[#8F9CA7]">/</span> USERS &amp; ROLES
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mt-1">
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold text-[#101d26] tracking-tight leading-tight">
              Users
            </h1>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] text-[#005459] font-mono text-[11px] font-semibold border border-[#BEDDF7]">
              {users.length} members
            </span>
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#EAF5EE] text-[#2E8B57] font-mono text-[11px] font-medium border border-[#B8E0C5]">
              <Lock className="w-3 h-3 text-[#2E8B57]" />
              Admin restricted access
            </span>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search with ⌘K */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565f6b]" />
              <input
                type="text"
                placeholder="Filter by name, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-[34px] pl-8 pr-9 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-1 focus:ring-[#005459] w-[180px] sm:w-[220px]"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#8F9CA7] border border-[#E2E7E4] px-1 rounded bg-[#F4F6F5]">
                ⌘K
              </span>
            </div>

            {/* Role dropdown */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-[34px] px-2.5 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459] cursor-pointer"
            >
              <option value="All Roles">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Deployer">Deployer</option>
              <option value="Viewer">Viewer</option>
            </select>

            {/* Status dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-[34px] px-2.5 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459] cursor-pointer"
            >
              <option value="All Statuses">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Invited">Invited</option>
              <option value="Deactivated">Deactivated</option>
            </select>

            {/* Invite Button */}
            {can(role, 'users:manage') && (
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(true)}
                className="h-[34px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>+ Onboard Colleague</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Super Admin Workspace & Onboarding Banner */}
      {isSuperAdmin && (
        <div className="p-4 bg-gradient-to-r from-[#17202A] to-[#1F2C38] border border-[#24313E] rounded-[8px] text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-[6px] bg-[#FAF3E7]/15 border border-[#F1D6A4]/30 flex items-center justify-center shrink-0 text-[#E5C07B]">
              <Crown className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[15px] tracking-tight text-white">
                  {organizationName || 'Engineering Organization'}
                </span>
                <span className="px-2 py-0.2 rounded-full bg-[#FAF3E7] text-[#B87E0C] text-[10px] font-bold uppercase font-mono tracking-wider">
                  Super Admin Control
                </span>
              </div>
              <p className="text-[12px] text-[#8F9CA7] mt-0.5 max-w-xl">
                As the primary workspace owner, you can onboard new engineers, assign permissions, and share one-time activation links.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleCopyGeneralInvite}
              className="h-[34px] px-3 rounded-[6px] bg-[#141B22] hover:bg-[#1D2733] border border-[#24313E] text-[#85D3DA] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy shareable workspace invite link"
            >
              {copiedGeneralInvite ? <Check className="w-3.5 h-3.5 text-[#2E8B57]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedGeneralInvite ? 'Invite Copied!' : 'Copy Invite Link'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsInviteModalOpen(true)}
              className="h-[34px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Onboard Team Member</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Filter Tabs & Live Sync */}
      <div className="flex items-center justify-between border-b border-[#E2E7E4] pb-2">
        <div className="flex items-center gap-1">
          {[
            { id: 'All', label: 'All', count: users.length },
            { id: 'Admins', label: 'Admins', count: users.filter((u) => (u.role || '').toUpperCase().includes('ADMIN') || u.isSuperAdmin).length },
            { id: 'Deployers', label: 'Deployers', count: users.filter((u) => (u.role || '').toUpperCase() === 'DEPLOYER').length },
            { id: 'Viewers', label: 'Viewers', count: users.filter((u) => (u.role || '').toUpperCase() === 'VIEWER').length },
            { id: 'Pending Invites', label: 'Pending Invites', count: users.filter((u) => u.status === 'Invited').length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-[6px] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#101d26] text-white font-semibold shadow-2xs'
                  : 'text-[#565f6b] hover:bg-[#F4F6F5] hover:text-[#101d26]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white'
                    : 'bg-[#E2E7E4] text-[#565f6b]'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#2E8B57]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57]" />
          <span>Live Sync</span>
        </div>
      </div>

      {/* 3. Main 2-Column Grid (Table + Side Panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: User Table & 3 Metric Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* User Table */}
          <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E7E4] bg-[#F4F6F5] text-[10px] font-mono font-semibold text-[#565f6b] uppercase tracking-wider">
                    <th className="py-2.5 px-5">USER</th>
                    <th className="py-2.5 px-4">EMAIL</th>
                    <th className="py-2.5 px-4">ROLE</th>
                    <th className="py-2.5 px-4">STATUS</th>
                    <th className="py-2.5 px-5 text-right">ACTIONS / LAST ACTIVE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E7E4] text-[12px]">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAFBFB] transition-colors">
                      {/* User (Avatar + Name + Role Title) */}
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img
                              src={u.avatar}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-[#CDD4D0] shrink-0"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full ${u.bg || 'bg-[#565f6b]'} text-white font-mono font-semibold text-[11px] flex items-center justify-center shrink-0`}
                            >
                              {u.initials || (u.name ? u.name.slice(0, 2).toUpperCase() : 'U')}
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-[#101d26] text-[13px]">
                                {u.name}
                              </span>
                              {u.isYou && (
                                <span className="px-1.5 py-0.2 rounded-[3px] bg-[#E2F0FD] text-[#005459] font-mono text-[9px] font-bold border border-[#BEDDF7]">
                                  YOU
                                </span>
                              )}
                              {(u.role === 'SUPER_ADMIN' || u.isSuperAdmin) && (
                                <span className="px-1.5 py-0.2 rounded-[3px] bg-[#FAF3E7] text-[#B87E0C] font-mono text-[9px] font-bold border border-[#F1D6A4]">
                                  OWNER
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#565f6b]">
                              {u.roleTitle || (u.isSuperAdmin ? 'Super Admin & Owner' : u.role)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-[11px] text-[#565f6b]">
                        <span className={u.strikethroughEmail ? 'line-through text-[#8F9CA7]' : ''}>
                          {u.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td className="py-3 px-4">
                        {(u.role === 'SUPER_ADMIN' || u.role === 'Super Admin' || u.isSuperAdmin) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#FAF3E7] border border-[#F1D6A4] font-mono text-[11px] font-bold text-[#B87E0C]">
                            <Crown className="w-3 h-3 text-[#B87E0C]" />
                            <span>Super Admin</span>
                          </span>
                        )}
                        {((u.role === 'Admin' || u.role === 'ADMIN') && !u.isSuperAdmin) && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDDF7] font-mono text-[11px] font-semibold text-[#005459]">
                            <Shield className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        )}
                        {(u.role === 'Deployer' || u.role === 'DEPLOYER') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] font-mono text-[11px] font-medium text-[#101d26]">
                            <span>Deployer</span>
                          </span>
                        )}
                        {(u.role === 'Viewer' || u.role === 'VIEWER') && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#FAFBFB] border border-[#E2E7E4] font-mono text-[11px] font-medium text-[#565f6b]">
                            <span>Viewer</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {u.status === 'Active' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#2E8B57] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57]" />
                            <span>Active</span>
                          </span>
                        )}
                        {u.status === 'Invited' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#B87E0C] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B87E0C]" />
                            <span>Invited</span>
                          </span>
                        )}
                        {u.status === 'Deactivated' && (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#BA1A1A] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#BA1A1A]" />
                            <span>Deactivated</span>
                          </span>
                        )}
                      </td>

                      {/* Actions / Last Active */}
                      <td className="py-3 px-5 text-right font-mono text-[11px] text-[#565f6b]">
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          {u.status === 'Invited' && u.inviteLink && (
                            <button
                              type="button"
                              onClick={() => handleCopyMemberLink(u.inviteLink, u.id)}
                              className="h-[24px] px-2 rounded-[4px] bg-[#FFFFFF] hover:bg-[#E2F0FD] border border-[#CDD4D0] hover:border-[#005459] text-[10px] text-[#005459] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                              title="Copy personalized invite link"
                            >
                              {copiedMemberId === u.id ? <Check className="w-3 h-3 text-[#2E8B57]" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedMemberId === u.id ? 'Copied' : 'Link'}</span>
                            </button>
                          )}

                          {u.canResend && (
                            <button
                              type="button"
                              disabled={resendingEmail === u.email}
                              onClick={() => handleResendInvite(u.email)}
                              className="h-[24px] px-2 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F4F6F5] border border-[#CDD4D0] text-[10px] text-[#101d26] font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              title="Resend invitation email"
                            >
                              <span>{resendingEmail === u.email ? 'Sending...' : 'Resend'}</span>
                            </button>
                          )}

                          {u.status === 'Invited' && (
                            <button
                              type="button"
                              disabled={actionLoadingId === u.id}
                              onClick={() => handleRevokeInvite(u)}
                              className="h-[24px] px-2 rounded-[4px] bg-[#FAEBE9] hover:bg-red-100 border border-[#F1B5AC] text-[10px] text-[#BA1A1A] font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              title="Revoke and cancel invitation"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Revoke</span>
                            </button>
                          )}

                          {!u.isYou && u.status === 'Active' && (
                            <button
                              type="button"
                              disabled={actionLoadingId === u.id}
                              onClick={() => handleToggleStatus(u)}
                              className="h-[24px] px-2 rounded-[4px] bg-[#FAF3E7] hover:bg-amber-100 border border-[#F1D6A4] text-[10px] text-[#B87E0C] font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              title="Suspend user and end active sessions"
                            >
                              <Ban className="w-3 h-3" />
                              <span>Suspend</span>
                            </button>
                          )}

                          {!u.isYou && u.status === 'Deactivated' && (
                            <button
                              type="button"
                              disabled={actionLoadingId === u.id}
                              onClick={() => handleToggleStatus(u)}
                              className="h-[24px] px-2 rounded-[4px] bg-[#EBF5EE] hover:bg-emerald-100 border border-emerald-200 text-[10px] text-[#2E8B57] font-medium flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                              title="Restore user platform access"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Reactivate</span>
                            </button>
                          )}

                          <div className="text-[10px] text-zinc-400 pl-1">{u.lastActive}</div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="px-5 py-3 border-t border-[#E2E7E4] bg-[#FAFBFB] flex items-center justify-between text-[11px] font-mono text-[#565f6b]">
              <span>Showing 1-10 of {users.length} users</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className="px-2 py-1 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#101d26] cursor-pointer"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(1)}
                  className={`px-2.5 py-1 rounded-[4px] font-bold ${
                    currentPage === 1
                      ? 'bg-[#005459] text-white'
                      : 'bg-[#FFFFFF] border border-[#CDD4D0] text-[#101d26]'
                  }`}
                >
                  1
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className={`px-2.5 py-1 rounded-[4px] font-bold ${
                    currentPage === 2
                      ? 'bg-[#005459] text-white'
                      : 'bg-[#FFFFFF] border border-[#CDD4D0] text-[#101d26]'
                  }`}
                >
                  2
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(2)}
                  className="px-2 py-1 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#101d26] cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* 3 Metric Cards below User Table */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Card 1: ACTIVE 2FA COVERAGE */}
            <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#565f6b] font-semibold">
                  ACTIVE 2FA COVERAGE
                </div>
                <div className="text-[24px] font-bold text-[#101d26] font-mono mt-1">
                  100%
                </div>
                <div className="text-[11px] font-mono text-[#2E8B57] mt-0.5 flex items-center gap-1">
                  <span>All accounts compliant</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-[6px] bg-[#EAF5EE] text-[#2E8B57] flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
            </div>

            {/* Card 2: ACTIVE SESSIONS */}
            <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#565f6b] font-semibold">
                  ACTIVE SESSIONS
                </div>
                <div className="text-[24px] font-bold text-[#101d26] font-mono mt-1">
                  8
                </div>
                <div className="text-[11px] font-mono text-[#565f6b] mt-0.5">
                  Across 3 clusters
                </div>
              </div>
              <div className="w-10 h-10 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
                <Monitor className="w-5 h-5" />
              </div>
            </div>

            {/* Card 3: AUDIT LOG STATUS */}
            <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-4 shadow-xs flex items-center justify-between">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-wider text-[#565f6b] font-semibold">
                  AUDIT LOG STATUS
                </div>
                <div className="text-[24px] font-bold text-[#101d26] font-mono mt-1">
                  0 Revocations
                </div>
                <div className="text-[11px] font-mono text-[#565f6b] mt-0.5">
                  Past 30 days clean
                </div>
              </div>
              <div className="w-10 h-10 rounded-[6px] bg-[#F4F6F5] text-[#565f6b] flex items-center justify-center">
                <ScrollText className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Permission Roles & Security Cards (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Card 1: Permission Roles Breakdown */}
          <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-4">
            <div className="flex items-start gap-2.5 pb-3 border-b border-[#E2E7E4]">
              <div className="w-7 h-7 rounded-[4px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center shrink-0 mt-0.5">
                <Shield className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="font-bold text-[14px] text-[#101d26]">
                  Permission Roles
                </h3>
                <p className="text-[11px] text-[#565f6b] mt-0.5">
                  Granular RBAC boundaries for team deployments.
                </p>
              </div>
            </div>

            {/* Role Blocks */}
            <div className="space-y-4">
              {ROLE_DEFINITIONS.map((r) => (
                <div key={r.role} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-0.5 rounded-[4px] font-mono text-[10px] font-bold tracking-wider ${
                        r.role === 'ADMIN'
                          ? 'bg-[#005459] text-white'
                          : r.role === 'DEPLOYER'
                          ? 'bg-[#E2F0FD] text-[#005459] border border-[#BEDDF7]'
                          : 'bg-[#F4F6F5] text-[#565f6b] border border-[#CDD4D0]'
                      }`}
                    >
                      {r.role}
                    </span>
                    <span className="text-[11px] font-mono text-[#565f6b]">
                      {r.count}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#565f6b] leading-relaxed">
                    {r.description}
                  </p>

                  <ul className="space-y-1 text-[11px]">
                    {r.permissions.map((p, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-2">
                        {p.granted ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B57] shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-[#BA1A1A] shrink-0" />
                        )}
                        <span className={p.granted ? 'text-[#101d26]' : 'text-[#BA1A1A]'}>
                          {p.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Enterprise SSO & 2FA */}
          <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[13px] text-[#101d26]">
              <Lock className="w-4 h-4 text-[#005459]" />
              <span>Enterprise SSO &amp; 2FA</span>
            </div>
            <p className="text-[11px] text-[#565f6b] leading-relaxed">
              All user invitations require company SAML SSO authentication. Custom roles are defined via <code className="text-[#005459] font-mono">policy.json</code>.
            </p>
            <a
              href="#sso"
              onClick={(e) => {
                e.preventDefault()
                alert('Opening Identity Provider SSO Configuration')
              }}
              className="text-[11px] font-mono text-[#005459] hover:underline font-semibold flex items-center gap-1 pt-1"
            >
              <span>Configure identity provider</span>
              <span>→</span>
            </a>
          </div>

          {/* Card 3: ACCESS HYGIENE */}
          <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-3">
            <div className="font-mono text-[10px] font-bold text-[#565f6b] uppercase tracking-wider">
              ACCESS HYGIENE
            </div>

            <div className="space-y-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#565f6b]">Inactive accounts (&gt;30d)</span>
                <span className="font-mono font-semibold text-[#BA1A1A]">
                  1 detected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#565f6b]">Pending invitations</span>
                <span className="font-mono font-semibold text-[#B87E0C]">
                  1 expiring soon
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert('Starting comprehensive IAM security review...')}
              className="w-full h-[32px] rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#101d26] text-[11px] font-medium transition-colors cursor-pointer"
            >
              Run Security Review
            </button>
          </div>
        </div>
      </div>

      {/* Invite User Modal */}
      <InviteUserModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onInviteUser={handleAddUser}
      />

      {/* One-Time Temporary Password / Invitation Modal */}
      <OneTimeSecretModal
        isOpen={tempPasswordModal.isOpen}
        onClose={() =>
          setTempPasswordModal({
            isOpen: false,
            title: '',
            subtitle: '',
            secretLabel: '',
            secretValue: '',
            userEmail: '',
          })
        }
        title={tempPasswordModal.title || 'User Invitation Created'}
        subtitle={
          tempPasswordModal.subtitle ||
          `An invitation has been generated for ${tempPasswordModal.userEmail}. Share this with the user securely.`
        }
        secretLabel={tempPasswordModal.secretLabel || 'Invitation Link'}
        secretValue={tempPasswordModal.secretValue || ''}
      />
    </div>
  )
}
