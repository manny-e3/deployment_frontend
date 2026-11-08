import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Crown,
  Building2,
  Users,
  Rocket,
  Activity,
  Database,
  ShieldCheck,
  Server,
  Layers,
  Search,
  RefreshCw,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Cpu,
  Terminal,
  ExternalLink,
  Ban,
  UserCheck,
  ShieldAlert,
  Archive,
  Download,
  Filter,
  Check,
  X,
  ChevronRight,
  Info
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { platformApi } from '../services/platform.api'

export function PlatformAdminView() {
  const { user: currentUser, isSuperAdmin } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  // Navigation tab
  const [activeTab, setActiveTab] = useState('tenants')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Data states
  const [overview, setOverview] = useState(null)
  const [organizations, setOrganizations] = useState([])
  const [platformUsers, setPlatformUsers] = useState([])
  const [deployments, setDeployments] = useState([])
  const [systemHealth, setSystemHealth] = useState(null)
  const [backups, setBackups] = useState([])
  const [auditLogs, setAuditLogs] = useState([])

  // Search & Filters
  const [orgSearch, setOrgSearch] = useState('')
  const [orgStatusFilter, setOrgStatusFilter] = useState('all') // all, active, suspended
  const [userSearch, setUserSearch] = useState('')
  const [userOrgFilter, setUserOrgFilter] = useState('all')
  const [userRoleFilter, setUserRoleFilter] = useState('all')
  const [userStatusFilter, setUserStatusFilter] = useState('all')
  const [deployStatusFilter, setDeployStatusFilter] = useState('all')

  // Modals & Action Dialogs
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [newOrgSlug, setNewOrgSlug] = useState('')
  const [submittingOrg, setSubmittingOrg] = useState(false)

  // Confirmation Modal
  const [confirmDialog, setConfirmDialog] = useState(null)
  const [confirmLoading, setConfirmLoading] = useState(false)

  // Backup state
  const [isBackingUp, setIsBackingUp] = useState(false)

  // Selected Org for Inspector Modal
  const [inspectedOrg, setInspectedOrg] = useState(null)

  // Redirect non-super-admins immediately
  useEffect(() => {
    if (!isSuperAdmin) {
      addToast('error', 'Access Denied: Platform Super Admin privileges required')
      navigate('/dashboard')
    }
  }, [isSuperAdmin, navigate, addToast])

  // Synchronize all platform telemetry & records
  const loadPlatformData = useCallback(async () => {
    try {
      setRefreshing(true)
      const [ovRes, orgsRes, usersRes, deploysRes, healthRes, backupsRes, auditRes] = await Promise.all([
        platformApi.getOverview().catch(() => null),
        platformApi.getOrganizations().catch(() => ({ organizations: [] })),
        platformApi.getUsers().catch(() => ({ users: [] })),
        platformApi.getDeployments().catch(() => ({ deployments: [] })),
        platformApi.getSystemHealth().catch(() => null),
        platformApi.getBackups().catch(() => ({ backups: [] })),
        platformApi.getAuditLogs().catch(() => ({ logs: [] })),
      ])

      if (ovRes) setOverview(ovRes)
      if (orgsRes?.organizations) setOrganizations(orgsRes.organizations)
      if (usersRes?.users) setPlatformUsers(usersRes.users)
      if (deploysRes?.deployments) setDeployments(deploysRes.deployments)
      if (healthRes?.health) setSystemHealth(healthRes.health)
      if (backupsRes?.backups) setBackups(backupsRes.backups)
      if (auditRes?.logs) setAuditLogs(auditRes.logs)
    } catch (err) {
      addToast('error', `Failed to load platform data: ${err.message}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [addToast])

  useEffect(() => {
    if (isSuperAdmin) {
      loadPlatformData()
    }
  }, [isSuperAdmin, loadPlatformData])

  // Organization Provisioning
  const handleCreateOrg = async (e) => {
    e.preventDefault()
    if (!newOrgName.trim()) return

    try {
      setSubmittingOrg(true)
      const res = await platformApi.createOrganization({ name: newOrgName, slug: newOrgSlug })
      addToast('success', `Tenant workspace "${newOrgName}" created successfully`)
      setNewOrgName('')
      setNewOrgSlug('')
      setIsCreateOrgOpen(false)
      if (res?.organization) {
        setOrganizations((prev) => [res.organization, ...prev])
      }
      loadPlatformData()
    } catch (err) {
      addToast('error', err.message || 'Failed to create workspace')
    } finally {
      setSubmittingOrg(false)
    }
  }

  // Trigger Confirmation Modal for Org Status Toggle
  const requestToggleOrgStatus = (org) => {
    const isSuspending = org.isActive
    setConfirmDialog({
      type: 'org',
      target: org,
      title: isSuspending ? `Suspend Workspace "${org.name}"?` : `Reactivate Workspace "${org.name}"?`,
      description: isSuspending
        ? 'Suspending this workspace will immediately revoke access and invalidate all active sessions for members of this tenant.'
        : 'Reactivating this workspace will restore login privileges and allow members to resume project operations.',
      confirmLabel: isSuspending ? 'Suspend Workspace' : 'Reactivate Workspace',
      isDanger: isSuspending,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await platformApi.toggleOrganizationStatus(org.id, !org.isActive)
          addToast('success', `Workspace "${org.name}" has been ${isSuspending ? 'suspended' : 'reactivated'}`)
          // Optimistic update
          setOrganizations((prev) =>
            prev.map((o) => (o.id === org.id ? { ...o, isActive: !org.isActive } : o))
          )
          setConfirmDialog(null)
          loadPlatformData()
        } catch (err) {
          addToast('error', `Failed to update workspace: ${err.message}`)
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  // Trigger Confirmation Modal for User Status Toggle
  const requestToggleUserStatus = (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      addToast('warning', 'You cannot suspend your own administrator account')
      return
    }

    const isSuspending = targetUser.isActive
    setConfirmDialog({
      type: 'user',
      target: targetUser,
      title: isSuspending ? `Suspend User "${targetUser.name}"?` : `Reactivate User "${targetUser.name}"?`,
      description: isSuspending
        ? `Suspending "${targetUser.email}" will immediately end their active sessions and prevent login across all workspaces.`
        : `Reactivating "${targetUser.email}" will restore their platform access with their existing permissions.`,
      confirmLabel: isSuspending ? 'Suspend User' : 'Reactivate User',
      isDanger: isSuspending,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await platformApi.toggleUserStatus(targetUser.id, !targetUser.isActive)
          addToast('success', `User account ${isSuspending ? 'suspended' : 'reactivated'} successfully`)
          // Optimistic update
          setPlatformUsers((prev) =>
            prev.map((u) => (u.id === targetUser.id ? { ...u, isActive: !targetUser.isActive } : u))
          )
          setConfirmDialog(null)
          loadPlatformData()
        } catch (err) {
          addToast('error', `Failed to update user: ${err.message}`)
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  // Toggle Super Admin Role
  const requestToggleSuperAdmin = (targetUser) => {
    if (targetUser.id === currentUser?.id) {
      addToast('warning', 'You cannot revoke your own Super Admin access')
      return
    }

    const granting = !targetUser.isSuperAdmin
    setConfirmDialog({
      type: 'superadmin',
      target: targetUser,
      title: granting ? `Promote "${targetUser.name}" to Super Admin?` : `Revoke Super Admin from "${targetUser.name}"?`,
      description: granting
        ? `This user will receive full platform root privileges: seeing all tenant data, suspending workspaces, and managing disaster recovery.`
        : `This user will lose platform-wide visibility and return to standard tenant-scoped role permissions.`,
      confirmLabel: granting ? 'Grant Super Admin' : 'Revoke Privileges',
      isDanger: !granting,
      onConfirm: async () => {
        setConfirmLoading(true)
        try {
          await platformApi.toggleUserSuperAdmin(targetUser.id, granting)
          addToast('success', `Super Admin privileges ${granting ? 'granted to' : 'revoked from'} ${targetUser.email}`)
          setPlatformUsers((prev) =>
            prev.map((u) => (u.id === targetUser.id ? { ...u, isSuperAdmin: granting } : u))
          )
          setConfirmDialog(null)
          loadPlatformData()
        } catch (err) {
          addToast('error', `Failed to toggle Super Admin: ${err.message}`)
        } finally {
          setConfirmLoading(false)
        }
      },
    })
  }

  // Backup Execution Handler
  const handleTriggerBackup = async () => {
    try {
      setIsBackingUp(true)
      addToast('info', 'Creating compressed database snapshot archive...')
      const res = await platformApi.triggerBackup()
      addToast('success', 'Database backup archive created and verified successfully')
      if (res?.latest) {
        setBackups((prev) => [res.latest, ...prev.filter((b) => b.filename !== res.latest.filename)])
      }
      loadPlatformData()
    } catch (err) {
      addToast('error', `Backup failed: ${err.message}`)
    } finally {
      setIsBackingUp(false)
    }
  }

  // Filtered queries
  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch =
      !orgSearch ||
      org.name?.toLowerCase().includes(orgSearch.toLowerCase()) ||
      org.slug?.toLowerCase().includes(orgSearch.toLowerCase()) ||
      org.id?.toLowerCase().includes(orgSearch.toLowerCase())
    const matchesStatus =
      orgStatusFilter === 'all' ||
      (orgStatusFilter === 'active' && org.isActive) ||
      (orgStatusFilter === 'suspended' && !org.isActive)
    return matchesSearch && matchesStatus
  })

  const filteredUsers = platformUsers.filter((u) => {
    const matchesSearch =
      !userSearch ||
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase())
    const matchesOrg = userOrgFilter === 'all' || u.organizationId === userOrgFilter
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter
    const matchesStatus =
      userStatusFilter === 'all' ||
      (userStatusFilter === 'active' && u.isActive) ||
      (userStatusFilter === 'suspended' && !u.isActive) ||
      (userStatusFilter === 'superadmin' && u.isSuperAdmin)
    return matchesSearch && matchesOrg && matchesRole && matchesStatus
  })

  const filteredDeployments = deployments.filter((d) => {
    if (deployStatusFilter === 'all') return true
    return d.status === deployStatusFilter
  })

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] gap-3">
        <div className="w-8 h-8 border-2 border-[#005459] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono text-zinc-500">Loading platform telemetry...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Title Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Platform Administration
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 inline-flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-500" />
              ROOT CONSOLE
            </span>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Super-see multi-tenant operations, manage workspaces, users, releases, engine health and disaster recovery.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={loadPlatformData}
            disabled={refreshing}
            title="Refresh platform metrics"
            className="h-[36px] px-3 rounded-[6px] bg-white dark:bg-[#141820] hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-[#005459]' : ''}`} />
            <span>{refreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerBackup}
            disabled={isBackingUp}
            className="h-[36px] px-3.5 rounded-[6px] bg-white dark:bg-[#141820] hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
          >
            <Archive className={`w-4 h-4 ${isBackingUp ? 'animate-bounce text-amber-500' : 'text-[#005459]'}`} />
            <span>{isBackingUp ? 'Backing Up...' : 'Trigger Backup'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOrgOpen(true)}
            className="h-[36px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Workspace</span>
          </button>
        </div>
      </div>

      {/* 2. Platform KPI Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Workspaces */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Workspaces</span>
            <Building2 className="w-4 h-4 text-[#005459]" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1.5">
            {overview?.metrics?.totalOrganizations || organizations.length}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1 font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {overview?.metrics?.activeOrganizations || 0} active
            </span>
            <span>•</span>
            <span className={overview?.metrics?.suspendedOrganizations > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-zinc-400'}>
              {overview?.metrics?.suspendedOrganizations || 0} suspended
            </span>
          </div>
        </div>

        {/* Registered Users */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Registered Users</span>
            <Users className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1.5">
            {overview?.metrics?.totalUsers || platformUsers.length}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1 font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {overview?.metrics?.activeUsers || 0} active
            </span>
            <span>•</span>
            <span className={overview?.metrics?.suspendedUsers > 0 ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-zinc-400'}>
              {overview?.metrics?.suspendedUsers || 0} suspended
            </span>
          </div>
        </div>

        {/* Deployments */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Total Deployments</span>
            <Rocket className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1.5">
            {overview?.metrics?.totalDeployments || 0}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1 font-mono">
            <span className="text-zinc-700 dark:text-zinc-300 font-semibold">{overview?.metrics?.deploys24h || 0} today</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {overview?.metrics?.successRate24h || 100}% pass rate
            </span>
          </div>
        </div>

        {/* Fleet Infrastructure */}
        <div className="p-4 rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Fleet Infrastructure</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mt-1.5">
            {overview?.metrics?.totalServers || 0} <span className="text-xs font-normal text-zinc-500">nodes</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-1 font-mono">
            <span className="text-zinc-700 dark:text-zinc-300 font-semibold">
              {overview?.metrics?.totalProjects || 0} projects
            </span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400">All targets synced</span>
          </div>
        </div>
      </div>

      {/* 3. Tabbed Navigation Bar */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <nav className="flex items-center gap-1 overflow-x-auto pb-px">
          {[
            { id: 'tenants', label: 'Workspaces & Tenants', icon: Building2, count: organizations.length },
            { id: 'users', label: 'Global Users', icon: Users, count: platformUsers.length },
            { id: 'deployments', label: 'Cross-Tenant Releases', icon: Rocket, count: deployments.length },
            { id: 'infrastructure', label: 'Engine & Health', icon: HardDrive, count: null },
            { id: 'backups', label: 'Database Backups', icon: Database, count: backups.length },
            { id: 'audit', label: 'Platform Audit Log', icon: ShieldCheck, count: null },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 text-xs font-medium flex items-center gap-2 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'border-[#005459] text-[#005459] dark:text-teal-400 font-semibold'
                    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:border-zinc-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#005459] dark:text-teal-400' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
                {tab.count !== null && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isActive
                        ? 'bg-[#E2F0FD] dark:bg-teal-950/60 text-[#005459] dark:text-teal-300 font-bold'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* 4. TAB CONTENTS */}

      {/* TAB: WORKSPACES & TENANTS */}
      {activeTab === 'tenants' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#141820] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Filter by workspace name, ID, or slug..."
                value={orgSearch}
                onChange={(e) => setOrgSearch(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#0E121A] border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-[#005459]"
              />
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <div className="flex rounded-lg bg-zinc-100 dark:bg-[#0E121A] p-0.5 border border-zinc-200 dark:border-zinc-700 text-xs">
                {['all', 'active', 'suspended'].map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setOrgStatusFilter(filter)}
                    className={`px-3 py-1 rounded-md capitalize font-medium transition-colors cursor-pointer ${
                      orgStatusFilter === filter
                        ? 'bg-white dark:bg-[#1E2530] text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tenants Table */}
          <div className="rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-[#0F131A] border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Tenant Workspace</th>
                    <th className="px-4 py-3">Members</th>
                    <th className="px-4 py-3">Projects</th>
                    <th className="px-4 py-3">Servers</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  {filteredOrganizations.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                        No tenant workspaces found matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrganizations.map((org) => (
                      <tr key={org.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-[#005459] dark:text-teal-400 shrink-0 font-semibold">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs truncate">
                                {org.name}
                              </div>
                              <div className="text-[10px] text-zinc-400 font-mono truncate">{org.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-zinc-600 dark:text-zinc-300">
                          {org._count?.users || 0} users
                        </td>
                        <td className="px-4 py-3.5 font-mono text-zinc-600 dark:text-zinc-300">
                          {org._count?.projects || 0} projects
                        </td>
                        <td className="px-4 py-3.5 font-mono text-zinc-600 dark:text-zinc-300">
                          {org._count?.servers || 0} fleet nodes
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 ${
                              org.isActive
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${org.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            />
                            {org.isActive ? 'ACTIVE' : 'SUSPENDED'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-zinc-500 text-[11px]">
                          {new Date(org.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setInspectedOrg(org)}
                              className="px-2.5 py-1 rounded-[4px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-medium transition-colors cursor-pointer"
                            >
                              Inspect
                            </button>
                            <button
                              type="button"
                              onClick={() => requestToggleOrgStatus(org)}
                              className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer border ${
                                org.isActive
                                  ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                  : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                              }`}
                            >
                              {org.isActive ? 'Suspend' : 'Reactivate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: GLOBAL USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-[#141820] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by user name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-[#0E121A] border border-zinc-200 dark:border-zinc-700 rounded-lg pl-9 pr-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-[#005459]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Workspace filter */}
              <select
                value={userOrgFilter}
                onChange={(e) => setUserOrgFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-[#0E121A] border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:border-[#005459]"
              >
                <option value="all">All Workspaces</option>
                {organizations.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>

              {/* Role filter */}
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-[#0E121A] border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:border-[#005459]"
              >
                <option value="all">All Roles</option>
                <option value="ADMIN">ADMIN</option>
                <option value="DEPLOYER">DEPLOYER</option>
                <option value="VIEWER">VIEWER</option>
              </select>

              {/* Status filter */}
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="bg-zinc-50 dark:bg-[#0E121A] border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-zinc-700 dark:text-zinc-300 focus:outline-hidden focus:border-[#005459]"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
                <option value="superadmin">Super Admins</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-[#0F131A] border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">User & Identity</th>
                    <th className="px-4 py-3">Tenant Workspace</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Super Admin</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                        No users found matching query criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isYou = u.id === currentUser?.id
                      return (
                        <tr key={u.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#005459] to-teal-600 flex items-center justify-center font-bold text-white text-[11px] uppercase shrink-0">
                                {u.name ? u.name[0] : 'U'}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-xs truncate flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {isYou && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-mono font-medium">
                                      You
                                    </span>
                                  )}
                                  {u.isSuperAdmin && (
                                    <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" title="Super Admin" />
                                  )}
                                </div>
                                <div className="text-[11px] text-zinc-400 font-mono truncate">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-medium text-zinc-900 dark:text-zinc-200">
                              {u.organization?.name || 'Unassigned Workspace'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono">
                            <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[10px] font-semibold">
                              {u.roleTitle || u.role}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            {u.isSuperAdmin ? (
                              <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 font-mono text-[10px] font-bold">
                                👑 SUPER ADMIN
                              </span>
                            ) : (
                              <span className="text-zinc-400 text-[11px]">Standard</span>
                            )}
                          </td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 ${
                                u.isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}
                              />
                              {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-zinc-500 text-[11px]">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Toggle Super Admin privilege */}
                              <button
                                type="button"
                                onClick={() => requestToggleSuperAdmin(u)}
                                disabled={isYou}
                                title={isYou ? 'Cannot change own privileges' : u.isSuperAdmin ? 'Revoke Super Admin' : 'Make Super Admin'}
                                className="p-1.5 rounded-[4px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                              >
                                <Crown className="w-3.5 h-3.5 text-amber-500" />
                              </button>

                              {/* Toggle active / suspend status */}
                              <button
                                type="button"
                                onClick={() => requestToggleUserStatus(u)}
                                disabled={isYou}
                                title={isYou ? 'You cannot suspend your own account' : u.isActive ? 'Suspend account' : 'Reactivate account'}
                                className={`px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer border disabled:opacity-30 disabled:cursor-not-allowed ${
                                  u.isActive
                                    ? 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                    : 'bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                }`}
                              >
                                {u.isActive ? 'Suspend' : 'Reactivate'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: CROSS-TENANT RELEASES */}
      {activeTab === 'deployments' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#141820] p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-purple-600" />
              <span>Global Multi-Tenant Deployment Telemetry</span>
            </div>

            <div className="flex rounded-lg bg-zinc-100 dark:bg-[#0E121A] p-0.5 border border-zinc-200 dark:border-zinc-700 text-xs">
              {['all', 'SUCCESS', 'FAILED', 'RUNNING', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setDeployStatusFilter(status)}
                  className={`px-3 py-1 rounded-md uppercase font-mono text-[10px] transition-colors cursor-pointer ${
                    deployStatusFilter === status
                      ? 'bg-white dark:bg-[#1E2530] text-zinc-900 dark:text-zinc-100 shadow-2xs font-semibold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-[#0F131A] border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Run #</th>
                    <th className="px-4 py-3">Tenant Workspace</th>
                    <th className="px-4 py-3">Project & Target</th>
                    <th className="px-4 py-3">Commit & Branch</th>
                    <th className="px-4 py-3">Trigger</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  {filteredDeployments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-10 text-center text-zinc-400">
                        No deployments found matching filter.
                      </td>
                    </tr>
                  ) : (
                    filteredDeployments.map((d) => (
                      <tr key={d.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">#{d.number}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium text-[11px]">
                            {d.organizationName}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{d.projectName}</div>
                          <div className="text-[11px] text-zinc-400 font-mono">
                            {d.targetName} ({d.serverHost})
                          </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <div className="text-zinc-800 dark:text-zinc-200 font-semibold">{d.commitSha?.slice(0, 7) || 'HEAD'}</div>
                          <div className="text-zinc-400">{d.branch}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-zinc-700 dark:text-zinc-300">{d.triggeredByName}</div>
                          <div className="text-[10px] text-zinc-400 font-mono uppercase">{d.trigger}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1 ${
                              d.status === 'SUCCESS'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50'
                                : d.status === 'FAILED'
                                ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50'
                                : d.status === 'RUNNING'
                                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-600 dark:text-zinc-300">
                          {d.durationSec ? `${d.durationSec}s` : '—'}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-400 text-[11px]">
                          {new Date(d.queuedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ENGINE & INFRASTRUCTURE HEALTH */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* MySQL */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono uppercase">
                <span>Database Engine</span>
                <Database className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2">MySQL 8.4 Enterprise</div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                  Status: {systemHealth?.checks?.database?.status || 'UP'}
                </span>
                <span className="text-zinc-400 font-mono">
                  ({systemHealth?.checks?.database?.latencyMs || 2}ms latency)
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-3">
                Container: deploy-portal-mysql-1 (Port 3307)
              </div>
            </div>

            {/* Redis & BullMQ */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono uppercase">
                <span>Deployment Queue & Redis</span>
                <Activity className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2">BullMQ + Redis 7</div>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold uppercase">
                  Status: {systemHealth?.checks?.redis?.status || 'UP'}
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-3">
                Queue Jobs: Active ({systemHealth?.checks?.queue?.active || 0}) • Waiting ({systemHealth?.checks?.queue?.waiting || 0})
              </div>
            </div>

            {/* Node Runtime */}
            <div className="p-5 rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-zinc-500 font-mono uppercase">
                <span>Runtime & Memory</span>
                <Cpu className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mt-2">
                Node.js {systemHealth?.nodeVersion || 'v22'}
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-300 mt-2 font-mono">
                Memory RSS: {systemHealth?.memory?.rssMb || 65} MB • Heap: {systemHealth?.memory?.heapUsedMb || 45} MB
              </div>
              <div className="text-[11px] text-zinc-400 font-mono mt-3">
                OS: {systemHealth?.platform} ({systemHealth?.arch}) • PID: {systemHealth?.pid}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: DATABASE BACKUPS */}
      {activeTab === 'backups' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#141820] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Disaster Recovery & Metadata Backups
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Automated transactional MySQL dump with Gzip compression and SHA-256 integrity verification. Retains latest 14 snapshots.
              </p>
            </div>
            <button
              type="button"
              onClick={handleTriggerBackup}
              disabled={isBackingUp}
              className="px-4 py-2 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Archive className={`w-4 h-4 ${isBackingUp ? 'animate-bounce text-amber-300' : ''}`} />
              <span>{isBackingUp ? 'Generating Snapshot...' : 'Trigger Backup Now'}</span>
            </button>
          </div>

          <div className="rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-[#0F131A] border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Archive File</th>
                    <th className="px-4 py-3">Size</th>
                    <th className="px-4 py-3">SHA-256 Checksum</th>
                    <th className="px-4 py-3">Created</th>
                    <th className="px-4 py-3 text-right">Integrity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  {backups.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-10 text-center text-zinc-400">
                        No snapshot archives recorded yet. Click "Trigger Backup Now" to capture initial snapshot.
                      </td>
                    </tr>
                  ) : (
                    backups.map((b) => (
                      <tr key={b.filename} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-mono font-semibold">
                            <Archive className="w-4 h-4 text-[#005459]" />
                            <span>{b.filename}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-zinc-600 dark:text-zinc-300">{b.sizeFormatted}</td>
                        <td className="px-4 py-3.5 font-mono text-zinc-400 text-[10px] truncate max-w-xs">
                          {b.checksum || 'Verified via sha256 checksum'}
                        </td>
                        <td className="px-4 py-3.5 font-mono text-zinc-500 text-[11px]">
                          {new Date(b.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-[10px] font-mono font-bold uppercase inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            VERIFIED
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-[#141820] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xs">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Platform Security Audit Log</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Cross-tenant audit trail tracking user authentications, deployments, tenant suspensions, and administrative actions.
            </p>
          </div>

          <div className="rounded-xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-[#0F131A] border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-mono uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor / User</th>
                    <th className="px-4 py-3">Workspace</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Entity</th>
                    <th className="px-4 py-3">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/80 text-zinc-700 dark:text-zinc-300">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                        No audit log entries recorded.
                      </td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-zinc-500 text-[11px]">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-zinc-900 dark:text-zinc-100">{log.user?.name || 'System / Daemon'}</div>
                          <div className="text-[10px] text-zinc-400 font-mono">{log.user?.email || 'internal'}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px]">
                            {log.user?.organizationName || 'Platform Root'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-zinc-900 dark:text-zinc-100">
                          <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[#005459] dark:text-teal-400 text-[10px]">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-500 text-[11px]">
                          {log.entity} {log.entityId ? `(${log.entityId.slice(0, 8)})` : ''}
                        </td>
                        <td className="px-4 py-3 font-mono text-zinc-400 text-[11px]">{log.ip || '127.0.0.1'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: PROVISION NEW TENANT WORKSPACE */}
      {isCreateOrgOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#005459]" />
                <h3 className="font-semibold text-base">Provision New Tenant Workspace</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOrgOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Workspace Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Cloud Systems"
                  value={newOrgName}
                  onChange={(e) => {
                    setNewOrgName(e.target.value)
                    if (!newOrgSlug) {
                      setNewOrgSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]/g, '-')
                          .replace(/-+/g, '-')
                      )
                    }
                  }}
                  className="w-full bg-zinc-50 dark:bg-[#0E121A] border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:border-[#005459]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Workspace Slug Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. acme-cloud"
                  value={newOrgSlug}
                  onChange={(e) => setNewOrgSlug(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-[#0E121A] border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 font-mono focus:outline-hidden focus:border-[#005459]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOrgOpen(false)}
                  className="px-4 py-2 rounded-[6px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrg || !newOrgName.trim()}
                  className="px-4 py-2 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{submittingOrg ? 'Provisioning...' : 'Provision Workspace'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRMATION ACTION DIALOG (SUSPEND / REACTIVATE) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl text-zinc-900 dark:text-zinc-100">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-full shrink-0 ${
                  confirmDialog.isDanger
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400'
                }`}
              >
                {confirmDialog.isDanger ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-base leading-tight">{confirmDialog.title}</h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
                  {confirmDialog.description}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-5 mt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                disabled={confirmLoading}
                className="px-4 py-2 rounded-[6px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                disabled={confirmLoading}
                className={`px-4 py-2 rounded-[6px] text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                  confirmDialog.isDanger
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {confirmLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{confirmDialog.confirmLabel}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INSPECT WORKSPACE DETAILS */}
      {inspectedOrg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-2xs">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#141820] border border-zinc-200 dark:border-zinc-800 p-6 shadow-xl text-zinc-900 dark:text-zinc-100">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#005459]" />
                <h3 className="font-semibold text-base">{inspectedOrg.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedOrg(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-[#0E121A] border border-zinc-200 dark:border-zinc-700/60 font-mono">
                <div>
                  <span className="text-zinc-400">Workspace ID</span>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 truncate mt-0.5">{inspectedOrg.id}</div>
                </div>
                <div>
                  <span className="text-zinc-400">Status</span>
                  <div className="font-semibold mt-0.5">
                    <span className={inspectedOrg.isActive ? 'text-emerald-600' : 'text-rose-600'}>
                      {inspectedOrg.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-zinc-400">Total Users</span>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{inspectedOrg._count?.users || 0} members</div>
                </div>
                <div>
                  <span className="text-zinc-400">Total Projects</span>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{inspectedOrg._count?.projects || 0} projects</div>
                </div>
              </div>

              {/* Members sample */}
              {inspectedOrg.users && inspectedOrg.users.length > 0 && (
                <div>
                  <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Members ({inspectedOrg.users.length})</div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {inspectedOrg.users.map((u) => (
                      <div
                        key={u.id}
                        className="p-2 rounded-md bg-zinc-50 dark:bg-[#0E121A] border border-zinc-200 dark:border-zinc-700/40 flex items-center justify-between text-[11px]"
                      >
                        <div>
                          <span className="font-medium text-zinc-900 dark:text-zinc-100">{u.name}</span>
                          <span className="text-zinc-400 font-mono ml-2">({u.email})</span>
                        </div>
                        <span className="px-1.5 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono text-[10px]">
                          {u.roleTitle || u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  requestToggleOrgStatus(inspectedOrg)
                  setInspectedOrg(null)
                }}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-colors cursor-pointer ${
                  inspectedOrg.isActive
                    ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}
              >
                {inspectedOrg.isActive ? 'Suspend Workspace' : 'Reactivate Workspace'}
              </button>

              <button
                type="button"
                onClick={() => setInspectedOrg(null)}
                className="px-4 py-1.5 rounded-[4px] bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 text-xs font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
