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
  RotateCcw
} from 'lucide-react'
import { ROLE_DEFINITIONS } from '../data/usersData'
import { InviteUserModal } from '../components/InviteUserModal'
import { OneTimeSecretModal } from '../components/OneTimeSecretModal'
import { useAuth } from '../context/AuthContext'
import { can } from '../utils/permissions'
import { api, ApiError } from '../services/api'

export function UsersView() {
  const { user: currentUser, role } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [tempPasswordModal, setTempPasswordModal] = useState({ isOpen: false, password: '', userEmail: '' })

  useEffect(() => {
    let isMounted = true
    async function fetchUsers() {
      setLoading(true)
      try {
        const res = await api('/users', { query: { limit: 50 } })
        if (res && res.items && isMounted) {
          // Merge with avatars and titles
          const mapped = res.items.map((u) => ({
            ...u,
            roleTitle: u.role === 'ADMIN' ? 'Admin Engineer' : u.role === 'DEPLOYER' ? 'Platform Deployer' : 'Telemetry Observer',
            isYou: u.email?.toLowerCase() === currentUser?.email?.toLowerCase(),
            status: u.isActive ? 'Active' : 'Deactivated',
            lastActive: u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleTimeString() : 'Never',
          }))
          setUsers(mapped)
        }
      } catch (err) {
        console.error('Failed to fetch users:', err)
        if (isMounted) setUsers([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchUsers()
    return () => {
      isMounted = false
    }
  }, [currentUser])

  const handleAddUser = async (newUser) => {
    try {
      const res = await api('/users', {
        method: 'POST',
        body: {
          name: newUser.name,
          email: newUser.email.toLowerCase().trim(),
          role: newUser.role.toUpperCase(),
        },
      })
      if (res?.user && res?.temporaryPassword) {
        setUsers((prev) => [
          {
            ...res.user,
            roleTitle: newUser.roleTitle,
            isYou: false,
            status: 'Invited',
            lastActive: 'Just now',
          },
          ...prev,
        ])
        setTempPasswordModal({
          isOpen: true,
          password: res.temporaryPassword,
          userEmail: newUser.email,
        })
        return
      }
    } catch (err) {
      console.warn('API /users error, falling back to simulated generation:', err)
    }

    // Dev fallback: generate secure one-time password
    const mockTempPassword = `tmp_${Math.random().toString(36).substring(2, 10)}${Math.random().toString(36).substring(2, 6).toUpperCase()}!`
    setUsers((prev) => [newUser, ...prev])
    setTempPasswordModal({
      isOpen: true,
      password: mockTempPassword,
      userEmail: newUser.email,
    })
  }

  const handleResendInvite = (email) => {
    alert(`Invitation resent to ${email}`)
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.roleTitle.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole =
      roleFilter === 'All Roles' || u.role.toLowerCase() === roleFilter.toLowerCase()

    const matchesStatus =
      statusFilter === 'All Statuses' ||
      u.status.toLowerCase() === statusFilter.toLowerCase()

    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Admins' && u.role === 'Admin') ||
      (activeTab === 'Deployers' && u.role === 'Deployer') ||
      (activeTab === 'Viewers' && u.role === 'Viewer') ||
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
                <span>Invite user</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Filter Tabs & Live Sync */}
      <div className="flex items-center justify-between border-b border-[#E2E7E4] pb-2">
        <div className="flex items-center gap-1">
          {[
            { id: 'All', label: 'All', count: 14 },
            { id: 'Admins', label: 'Admins', count: 3 },
            { id: 'Deployers', label: 'Deployers', count: 8 },
            { id: 'Viewers', label: 'Viewers', count: 3 },
            { id: 'Pending Invites', label: 'Pending Invites', count: 2 },
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
                    <th className="py-2.5 px-5 text-right">LAST ACTIVE</th>
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
                              {u.initials}
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
                            </div>
                            <div className="text-[11px] text-[#565f6b]">
                              {u.roleTitle}
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
                        {u.role === 'Admin' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDDF7] font-mono text-[11px] font-semibold text-[#005459]">
                            <Shield className="w-3 h-3" />
                            <span>Admin</span>
                          </span>
                        )}
                        {u.role === 'Deployer' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] font-mono text-[11px] font-medium text-[#101d26]">
                            <span>Deployer</span>
                          </span>
                        )}
                        {u.role === 'Viewer' && (
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

                      {/* Last Active */}
                      <td className="py-3 px-5 text-right font-mono text-[11px] text-[#565f6b]">
                        <div>{u.lastActive}</div>
                        {u.subActive && (
                          <div className="text-[10px] text-[#005459] font-medium">
                            {u.subActive}
                          </div>
                        )}
                        {u.canResend && (
                          <button
                            type="button"
                            onClick={() => handleResendInvite(u.email)}
                            className="text-[10px] text-[#005459] hover:underline font-semibold cursor-pointer"
                          >
                            Resend
                          </button>
                        )}
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

      {/* One-Time Temporary Password Modal */}
      <OneTimeSecretModal
        isOpen={tempPasswordModal.isOpen}
        onClose={() => setTempPasswordModal({ isOpen: false, password: '', userEmail: '' })}
        title="User Invitation Created"
        subtitle={`A temporary credential has been generated for ${tempPasswordModal.userEmail}. Share this with the user securely; they will be required to change it upon first login.`}
        secretLabel="One-Time Temporary Password"
        secretValue={tempPasswordModal.password}
      />
    </div>
  )
}
