import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import {
  Folder,
  Users,
  ClipboardList,
  Settings,
  Plus,
  Server,
  Check,
  CheckCircle2,
  Trash2,
  Shield,
  KeyRound,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Loader2,
  UserPlus,
  Lock,
  Globe
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../services/api'
import { UsersView } from './UsersView'

// Initial default permission keys structure matching Ploi UI
const INITIAL_PERMISSIONS = {
  // SITES & APPS
  manage_sites: true,
  create_sites: true,
  update_sites: true,
  delete_sites: false,
  manage_env: true,
  manage_deployments: true,
  manage_ssl: true,
  run_commands: false,
  manage_apps: true,

  // DATABASES & BACKUPS
  manage_database: true,
  manage_backups: true,

  // NETWORK & ACCESS
  manage_network: false,
  manage_ssh: false,
  manage_file_explorer: true,

  // SERVICES
  manage_cronjobs: true,
  manage_php: false,
  manage_daemons: true,
  manage_services: false,
  manage_docker: true,

  // MONITORING & LOGS
  manage_insights: true,
  manage_logs: true,
  manage_monitor: true,
  manage_status: true,

  // SERVER
  manage_servers: true,
  create_servers: false,
  update_servers: false,
  delete_servers: false,
  manage_settings: false,
}

export function TeamDetailView() {
  const { tab = 'overview' } = useParams()
  const navigate = useNavigate()
  const { user, organizationName, updateOrganization } = useAuth()
  const { addToast } = useToast()

  const [activeTab, setActiveTab] = useState(tab)
  const defaultTeamName = organizationName || (user?.name ? `${user.name}'s Team` : "My Team")

  // Team Details & Permissions State
  const [teamTitle, setTeamTitle] = useState(() => {
    try {
      const saved = localStorage.getItem('portalops_team_title')
      return saved || defaultTeamName
    } catch {
      return defaultTeamName
    }
  })

  const [teamDescription, setTeamDescription] = useState(() => {
    try {
      return localStorage.getItem('portalops_team_desc') || ''
    } catch {
      return ''
    }
  })

  const [permissions, setPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem('portalops_team_permissions')
      return saved ? JSON.parse(saved) : INITIAL_PERMISSIONS
    } catch {
      return INITIAL_PERMISSIONS
    }
  })

  const [securityOptions, setSecurityOptions] = useState(() => {
    try {
      const saved = localStorage.getItem('portalops_team_security')
      return saved ? JSON.parse(saved) : { force2FA: false, forceIpLock: false }
    } catch {
      return { force2FA: false, forceIpLock: false }
    }
  })

  // Servers State for Overview tab
  const [availableServers, setAvailableServers] = useState([])
  const [selectedServerId, setSelectedServerId] = useState('')
  const [teamServerIds, setTeamServerIds] = useState(() => {
    try {
      const saved = localStorage.getItem('portalops_team_servers')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Members state for Members tab
  const [teamMembers, setTeamMembers] = useState([])
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Member')

  // Activity logs for Logs tab
  const [teamLogs, setTeamLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('portalops_team_logs')
      return saved ? JSON.parse(saved) : [
        { id: 1, action: 'Team created', actor: user?.name || 'Owner', time: 'Just now' },
        { id: 2, action: 'Default permissions configured', actor: user?.name || 'Owner', time: '1 hour ago' },
      ]
    } catch {
      return []
    }
  })

  const [isSaving, setIsSaving] = useState(false)

  // Sync tab with URL
  useEffect(() => {
    if (tab && ['overview', 'members', 'logs', 'settings'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [tab])

  const handleTabChange = (newTab) => {
    setActiveTab(newTab)
    navigate(`/teams/${newTab}`)
  }

  // Load servers from API
  useEffect(() => {
    async function fetchServers() {
      try {
        const res = await api('/servers')
        const items = Array.isArray(res) ? res : res?.items || []
        setAvailableServers(items)
      } catch (err) {
        console.error('Failed to load servers:', err)
      }
    }
    fetchServers()
  }, [])

  // Load team members from API
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await api('/users')
        const items = Array.isArray(res) ? res : res?.items || []
        setTeamMembers(items)
      } catch (err) {
        console.error('Failed to load users:', err)
      }
    }
    fetchUsers()
  }, [])

  // Handle Add Server to Team
  const handleAddServerToTeam = () => {
    if (!selectedServerId) {
      addToast?.({
        type: 'warning',
        title: 'Select a server',
        message: 'Please choose a server from the dropdown to attach to this team.',
      })
      return
    }

    if (teamServerIds.includes(selectedServerId)) {
      addToast?.({
        type: 'info',
        title: 'Already added',
        message: 'This server is already attached to this team.',
      })
      return
    }

    const updated = [...teamServerIds, selectedServerId]
    setTeamServerIds(updated)
    localStorage.setItem('portalops_team_servers', JSON.stringify(updated))

    // Log action
    const srv = availableServers.find((s) => s.id === selectedServerId)
    const newLog = {
      id: Date.now(),
      action: `Added server "${srv?.name || selectedServerId}" to team`,
      actor: user?.name || 'Admin',
      time: 'Just now'
    }
    const updatedLogs = [newLog, ...teamLogs]
    setTeamLogs(updatedLogs)
    localStorage.setItem('portalops_team_logs', JSON.stringify(updatedLogs))

    setSelectedServerId('')
    addToast?.({
      type: 'success',
      title: 'Server added',
      message: `Server "${srv?.name || 'Selected server'}" is now assigned to ${teamTitle}.`,
    })
  }

  // Handle Remove Server from Team
  const handleRemoveServerFromTeam = (srvId) => {
    const updated = teamServerIds.filter((id) => id !== srvId)
    setTeamServerIds(updated)
    localStorage.setItem('portalops_team_servers', JSON.stringify(updated))
    addToast?.({
      type: 'info',
      title: 'Server detached',
      message: 'Server removed from team view.',
    })
  }

  // Toggle Single Permission
  const togglePermission = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Toggle "Select all" Permissions
  const handleSelectAllPermissions = () => {
    const allChecked = Object.values(permissions).every(Boolean)
    const newPermissions = {}
    Object.keys(permissions).forEach((k) => {
      newPermissions[k] = !allChecked
    })
    setPermissions(newPermissions)
  }

  // Handle Save Settings
  const handleSaveSettings = (e) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      localStorage.setItem('portalops_team_title', teamTitle)
      localStorage.setItem('portalops_team_desc', teamDescription)
      localStorage.setItem('portalops_team_permissions', JSON.stringify(permissions))
      localStorage.setItem('portalops_team_security', JSON.stringify(securityOptions))

      if (teamTitle !== organizationName) {
        updateOrganization?.(teamTitle)
      }

      const newLog = {
        id: Date.now(),
        action: 'Updated team settings and default permissions',
        actor: user?.name || 'Owner',
        time: 'Just now'
      }
      const updatedLogs = [newLog, ...teamLogs]
      setTeamLogs(updatedLogs)
      localStorage.setItem('portalops_team_logs', JSON.stringify(updatedLogs))

      addToast?.({
        type: 'success',
        title: 'Settings saved',
        message: 'Team settings and default permissions have been updated.',
      })
    } catch (err) {
      console.error('Failed to save settings:', err)
    } finally {
      setIsSaving(false)
    }
  }

  const assignedServersList = availableServers.filter((s) => teamServerIds.includes(s.id))

  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-120px)] -m-6 bg-white dark:bg-[#070D14]">
      {/* ============================================================== */}
      {/* SECONDARY SUB-SIDEBAR (Overview, Members, Logs, Settings) */}
      {/* ============================================================== */}
      <aside className="w-full md:w-[230px] shrink-0 border-r border-zinc-200 dark:border-zinc-800 bg-[#FAFBFB] dark:bg-[#0A1017] p-4 space-y-4 select-none">
        {/* Team Name Header */}
        <div className="px-3 py-1">
          <div className="text-sm font-bold text-zinc-900 dark:text-white truncate">
            {teamTitle}
          </div>
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
            Team Workspace
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="space-y-1">
          <button
            type="button"
            onClick={() => handleTabChange('overview')}
            className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#EBF3FC] dark:bg-[#005459]/20 text-[#005459] dark:text-[#00DF8F] font-bold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Folder className="w-4 h-4 shrink-0" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('members')}
            className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
              activeTab === 'members'
                ? 'bg-[#EBF3FC] dark:bg-[#005459]/20 text-[#005459] dark:text-[#00DF8F] font-bold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Members</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('logs')}
            className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-[#EBF3FC] dark:bg-[#005459]/20 text-[#005459] dark:text-[#00DF8F] font-bold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            <ClipboardList className="w-4 h-4 shrink-0" />
            <span>Logs</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('settings')}
            className={`w-full px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-all text-left cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-[#EBF3FC] dark:bg-[#005459]/20 text-[#005459] dark:text-[#00DF8F] font-bold shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
            }`}
          >
            <Settings className="w-4 h-4 shrink-0" />
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* ============================================================== */}
      {/* MAIN CONTENT AREA */}
      {/* ============================================================== */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">
        {/* ============================================================ */}
        {/* TAB 1: OVERVIEW (Image 1) */}
        {/* ============================================================ */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Header & Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  Overview
                </h1>
                <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  <Link to="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-200">
                    Dashboard
                  </Link>
                  <span>/</span>
                  <span>Teams</span>
                  <span>/</span>
                  <span className="text-zinc-700 dark:text-zinc-300 font-medium">{teamTitle}</span>
                </div>
              </div>

              <Link
                to="/servers/create"
                className="px-4 py-2 rounded-lg bg-[#005459] hover:bg-[#084246] text-white text-xs font-semibold shadow-xs inline-flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create server</span>
              </Link>
            </div>

            {/* Select server to add Card (Matches Image 1) */}
            <div className="bg-white dark:bg-[#0B131D] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                  Select server to add
                </label>
                <select
                  value={selectedServerId}
                  onChange={(e) => setSelectedServerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-lg bg-white dark:bg-[#070D14] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-[#005459]"
                >
                  <option value="">Select server</option>
                  {availableServers.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} ({srv.host || srv.hostname || 'localhost'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleAddServerToTeam}
                  className="px-5 py-2 rounded-lg bg-[#005459] hover:bg-[#084246] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Add server
                </button>
              </div>
            </div>

            {/* Attached Servers Table / Cards */}
            <div className="bg-white dark:bg-[#0B131D] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
              <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-[#FAFBFB] dark:bg-[#081018] flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                  Servers assigned to this team ({assignedServersList.length})
                </span>
                <span className="text-[11px] text-zinc-500 font-mono">
                  {assignedServersList.length} of {availableServers.length} total
                </span>
              </div>

              {assignedServersList.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs">
                  <Server className="w-8 h-8 mx-auto text-zinc-400 mb-2 opacity-50" />
                  <div>No servers assigned to this team yet.</div>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    Select a server in the box above and click "Add server".
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                  {assignedServersList.map((srv) => (
                    <div key={srv.id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#EBF3FC] text-[#005459] flex items-center justify-center font-bold">
                          <Server className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                            <span>{srv.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                              Active
                            </span>
                          </div>
                          <div className="text-zinc-500 text-[11px] font-mono mt-0.5">
                            {srv.host || srv.hostname || '127.0.0.1'} · Port {srv.port || 22}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Link
                          to="/servers"
                          className="px-2.5 py-1 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 text-[11px] font-medium"
                        >
                          Manage
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleRemoveServerFromTeam(srv.id)}
                          className="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Remove server from team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: MEMBERS & ONBOARDING */}
        {/* ============================================================ */}
        {activeTab === 'members' && (
          <UsersView isEmbedded={true} teamTitle={teamTitle} />
        )}

        {/* ============================================================ */}
        {/* TAB 3: LOGS */}
        {/* ============================================================ */}
        {activeTab === 'logs' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Team Activity Logs
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <Link to="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-200">
                  Dashboard
                </Link>
                <span>/</span>
                <span>Teams</span>
                <span>/</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">Logs</span>
              </div>
            </div>

            <div className="bg-white dark:bg-[#0B131D] border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-xs">
              <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-[#FAFBFB] dark:bg-[#081018] text-xs font-bold text-zinc-800 dark:text-zinc-200">
                Audit Trail
              </div>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
                {teamLogs.map((log) => (
                  <div key={log.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-white">
                        {log.action}
                      </div>
                      <div className="text-[11px] text-zinc-500">
                        Performed by <span className="text-zinc-700 dark:text-zinc-300 font-medium">{log.actor}</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {log.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: SETTINGS (Images 2 & 3) */}
        {/* ============================================================ */}
        {activeTab === 'settings' && (
          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* Header & Breadcrumbs */}
            <div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                Settings
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                <Link to="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-200">
                  Dashboard
                </Link>
                <span>/</span>
                <span>Teams</span>
                <span>/</span>
                <span>{teamTitle}</span>
                <span>/</span>
                <span className="text-zinc-700 dark:text-zinc-300 font-medium">Settings</span>
              </div>
            </div>

            {/* Settings Card (Matches Images 2 & 3) */}
            <div className="bg-white dark:bg-[#0B131D] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-8">
              {/* Top Section: Details & Title/Description */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Description Column */}
                <div className="lg:col-span-4 space-y-1">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Details
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Edit the team details here, you can also setup default permissions your users should have.
                  </p>
                </div>

                {/* Right Form Inputs Column */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={teamTitle}
                      onChange={(e) => setTeamTitle(e.target.value)}
                      placeholder="e.g. aboajahemmanuel's Team"
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-[#070D14] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-[#005459]"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      placeholder="What does this team work on?"
                      className="w-full px-3.5 py-2 text-sm rounded-lg bg-white dark:bg-[#070D14] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-[#005459]"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              {/* Middle Section: Select Default Permissions */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                      Select default permissions
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      These apply to every member, unless overridden per server on the permissions page.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleSelectAllPermissions}
                    className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    Select all
                  </button>
                </div>

                {/* Permissions Grid (2 Columns, Exact layout from Images 2 & 3) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2">
                  {/* LEFT COLUMN OF PERMISSIONS */}
                  <div className="space-y-6">
                    {/* SITES & APPS */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        SITES &amp; APPS
                      </div>
                      <div className="space-y-2 text-xs">
                        {/* Parent: Manage sites */}
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-900 dark:text-zinc-100">
                          <input
                            type="checkbox"
                            checked={permissions.manage_sites}
                            onChange={() => togglePermission('manage_sites')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage sites</span>
                        </label>

                        {/* Nested items under manage sites */}
                        <div className="pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.create_sites}
                              onChange={() => togglePermission('create_sites')}
                              className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                            />
                            <span>Create sites</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.update_sites}
                              onChange={() => togglePermission('update_sites')}
                              className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                            />
                            <span>Update sites</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.delete_sites}
                              onChange={() => togglePermission('delete_sites')}
                              className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                            />
                            <span>Delete sites</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.manage_env}
                              onChange={() => togglePermission('manage_env')}
                              className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                            />
                            <span>Manage .env</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.manage_deployments}
                              onChange={() => togglePermission('manage_deployments')}
                              className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                            />
                            <span>Manage deployments</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.manage_ssl}
                              onChange={() => togglePermission('manage_ssl')}
                              className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                            />
                            <span>Manage SSL</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.run_commands}
                              onChange={() => togglePermission('run_commands')}
                              className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                            />
                            <span>Run commands</span>
                          </label>
                        </div>

                        {/* Manage apps */}
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 pt-1">
                          <input
                            type="checkbox"
                            checked={permissions.manage_apps}
                            onChange={() => togglePermission('manage_apps')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage apps</span>
                        </label>
                      </div>
                    </div>

                    {/* NETWORK & ACCESS */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        NETWORK &amp; ACCESS
                      </div>
                      <div className="space-y-2 text-xs text-zinc-800 dark:text-zinc-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_network}
                            onChange={() => togglePermission('manage_network')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage network</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_ssh}
                            onChange={() => togglePermission('manage_ssh')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage SSH</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_file_explorer}
                            onChange={() => togglePermission('manage_file_explorer')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage file explorer</span>
                        </label>
                      </div>
                    </div>

                    {/* MONITORING & LOGS */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        MONITORING &amp; LOGS
                      </div>
                      <div className="space-y-2 text-xs text-zinc-800 dark:text-zinc-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_insights}
                            onChange={() => togglePermission('manage_insights')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage insights</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_logs}
                            onChange={() => togglePermission('manage_logs')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage logs</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_monitor}
                            onChange={() => togglePermission('manage_monitor')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage monitor</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_status}
                            onChange={() => togglePermission('manage_status')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage status</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT COLUMN OF PERMISSIONS */}
                  <div className="space-y-6">
                    {/* DATABASES & BACKUPS */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        DATABASES &amp; BACKUPS
                      </div>
                      <div className="space-y-2 text-xs text-zinc-800 dark:text-zinc-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_database}
                            onChange={() => togglePermission('manage_database')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage database</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_backups}
                            onChange={() => togglePermission('manage_backups')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage backups</span>
                        </label>
                      </div>
                    </div>

                    {/* SERVICES */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        SERVICES
                      </div>
                      <div className="space-y-2 text-xs text-zinc-800 dark:text-zinc-200">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_cronjobs}
                            onChange={() => togglePermission('manage_cronjobs')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage cronjobs</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_php}
                            onChange={() => togglePermission('manage_php')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage PHP</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_daemons}
                            onChange={() => togglePermission('manage_daemons')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage daemons</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_services}
                            onChange={() => togglePermission('manage_services')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage services</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={permissions.manage_docker}
                            onChange={() => togglePermission('manage_docker')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage docker</span>
                        </label>
                      </div>
                    </div>

                    {/* SERVER */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                        SERVER
                      </div>
                      <div className="space-y-2 text-xs">
                        {/* Parent: Manage servers */}
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-900 dark:text-zinc-100">
                          <input
                            type="checkbox"
                            checked={permissions.manage_servers}
                            onChange={() => togglePermission('manage_servers')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage servers</span>
                        </label>

                        {/* Nested items */}
                        <div className="pl-6 space-y-2 text-zinc-700 dark:text-zinc-300">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.create_servers}
                              onChange={() => togglePermission('create_servers')}
                              className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                            />
                            <span>Create servers</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.update_servers}
                              onChange={() => togglePermission('update_servers')}
                              className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                            />
                            <span>Update servers</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.delete_servers}
                              onChange={() => togglePermission('delete_servers')}
                              className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                            />
                            <span>Delete servers</span>
                          </label>
                        </div>

                        {/* Manage settings */}
                        <label className="flex items-center gap-2 cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 pt-1">
                          <input
                            type="checkbox"
                            checked={permissions.manage_settings}
                            onChange={() => togglePermission('manage_settings')}
                            className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                          />
                          <span>Manage settings</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <hr className="border-zinc-100 dark:border-zinc-800" />

              {/* Bottom Section: Security Options (Exact Match to Image 3) */}
              <div className="space-y-3 pt-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Security options
                </h3>
                <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityOptions.force2FA}
                      onChange={(e) => setSecurityOptions({ ...securityOptions, force2FA: e.target.checked })}
                      className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                    />
                    <span>Force members to have 2FA on before they can manage servers or sites</span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securityOptions.forceIpLock}
                      onChange={(e) => setSecurityOptions({ ...securityOptions, forceIpLock: e.target.checked })}
                      className="rounded border-zinc-300 text-[#005459] focus:ring-[#005459]"
                    />
                    <span>Force members to have IP lock on before they can manage servers or sites</span>
                  </label>
                </div>
              </div>

              {/* Submit Save Button */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-lg bg-[#005459] hover:bg-[#084246] active:bg-[#003538] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save</span>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  )
}

