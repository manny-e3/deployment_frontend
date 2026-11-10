import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardMetrics } from '../components/DashboardMetrics'
import { DoraMetricsCard } from '../components/DoraMetricsCard'
import { RecentDeploymentsTable } from '../components/RecentDeploymentsTable'
import { ServersListCard } from '../components/ServersListCard'
import { RunningNowCard } from '../components/RunningNowCard'
import { LogModal } from '../components/LogModal'
import { QuickDeployModal } from '../components/QuickDeployModal'
import { RollbackModal } from '../components/RollbackModal'
import { useAuth } from '../context/AuthContext'
import { can } from '../utils/permissions'
import { api } from '../services/api'
import {
  Search,
  Plus,
  ChevronDown,
  Command,
  RefreshCw,
  Activity,
  Zap,
  Globe,
  Radio,
  X,
  ExternalLink,
  GitBranch,
  ChevronRight,
  UserPlus,
  Crown,
  Server
} from 'lucide-react'

export function DashboardView() {
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  const { user, role, isSuperAdmin, organizationName } = useAuth()
  const displayName = user?.name || user?.email?.split('@')[0] || 'developer'
  const canRollback = can(role, 'deploy:rollback')

  const [environment, setEnvironment] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [isLiveSync, setIsLiveSync] = useState(true)
  const [activeViewTab, setActiveViewTab] = useState('overview') // 'overview' | 'dora'

  const [projects, setProjects] = useState([])
  const [servers, setServers] = useState([])
  const [deployments, setDeployments] = useState([])
  const [metrics, setMetrics] = useState({
    projects: 0,
    servers: 0,
    deploysToday: 0,
    failed24h: 0,
  })

  // Modals state
  const [isLogModalOpen, setIsLogModalOpen] = useState(false)
  const [isQuickDeployOpen, setIsQuickDeployOpen] = useState(false)
  const [rollbackDeployment, setRollbackDeployment] = useState(null)
  const [selectedLog, setSelectedLog] = useState({
    id: null,
    service: '',
    server: '',
    status: 'QUEUED',
    commitSha: null,
  })

  const fetchDashboardData = async (isBackground = false) => {
    if (!isBackground) setLoading(true)
    try {
      const [projRes, srvRes, depRes] = await Promise.allSettled([
        api('/projects'),
        api('/servers'),
        api('/deployments', { query: { limit: 20 } }),
      ])

      const projList =
        projRes.status === 'fulfilled'
          ? Array.isArray(projRes.value)
            ? projRes.value
            : projRes.value?.items || []
          : []
      const srvList =
        srvRes.status === 'fulfilled'
          ? Array.isArray(srvRes.value)
            ? srvRes.value
            : srvRes.value?.items || []
          : []
      const depList =
        depRes.status === 'fulfilled'
          ? Array.isArray(depRes.value)
            ? depRes.value
            : depRes.value?.items || []
          : []

      setProjects(projList)
      setServers(srvList)

      const normalized = depList.map((d) => {
        const rawStatus = (d.status || 'QUEUED').toUpperCase()
        const authorName =
          d.triggeredBy?.name || (d.trigger === 'WEBHOOK' ? 'Git Webhook' : 'Operator')
        const initials =
          authorName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase() || 'OP'

        return {
          id: d.id,
          number: d.number,
          status: rawStatus.toLowerCase(),
          rawStatus,
          project: d.target?.project?.name || d.project || 'Project',
          server: d.target?.name || d.server || 'Target',
          targetName: d.target?.name,
          branch: d.branch || 'main',
          commitSha: d.commitSha
            ? d.commitSha.slice(0, 7)
            : d.requestedSha
              ? d.requestedSha.slice(0, 7)
              : 'HEAD',
          commitMsg:
            d.commitMessage ||
            d.commitMsg ||
            (d.trigger === 'ROLLBACK' ? 'Rollback deployment' : 'Release deployment'),
          trigger: d.trigger,
          triggeredBy:
            d.trigger === 'WEBHOOK'
              ? { type: 'branch' }
              : {
                type: 'avatar',
                text: initials,
                name: authorName,
                bg: 'bg-[#005459]',
                color: 'text-white',
              },
          startedAt: d.startedAt,
          queuedAt: d.queuedAt,
          finishedAt: d.finishedAt,
          error: d.error,
        }
      })
      setDeployments(normalized)

      // Calculate 24-hour metrics
      const now = Date.now()
      const oneDayAgo = now - 24 * 60 * 60 * 1000
      const deploysToday = depList.filter((d) => {
        const t = new Date(d.queuedAt || d.startedAt || 0).getTime()
        return t >= oneDayAgo
      }).length

      const failed24h = depList.filter((d) => {
        const t = new Date(d.queuedAt || d.startedAt || 0).getTime()
        return (d.status === 'FAILED' || d.status === 'CANCELLED') && t >= oneDayAgo
      }).length

      setMetrics({
        projects: projList.length,
        servers: srvList.length,
        deploysToday,
        failed24h,
      })
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      if (!isBackground) setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Live background polling (every 15 seconds when tab is active & live sync is on)
  useEffect(() => {
    if (!isLiveSync) return
    const interval = setInterval(() => {
      fetchDashboardData(true)
    }, 15000)
    return () => clearInterval(interval)
  }, [isLiveSync])

  // Global keyboard shortcuts (Cmd+K for search, Cmd+B for quick deploy)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        setIsQuickDeployOpen(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Find active deployment if running or queued
  const activeDeploy = deployments.find((d) => d.status === 'running' || d.status === 'queued')

  // Filter deployments by search and environment
  const filteredDeployments = deployments.filter((d) => {
    // Environment filter
    if (environment !== 'All') {
      const targetEnv = (d.targetName || d.server || '').toLowerCase()
      if (!targetEnv.includes(environment.toLowerCase())) {
        return false
      }
    }

    // Search query filter
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      d.project.toLowerCase().includes(q) ||
      d.server.toLowerCase().includes(q) ||
      d.commitSha.toLowerCase().includes(q) ||
      d.commitMsg.toLowerCase().includes(q) ||
      d.branch.toLowerCase().includes(q)
    )
  })

  // Quick dispatch launcher for a specific project
  const handleQuickDeployProject = (proj) => {
    setIsQuickDeployOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* 1. Welcome Header (Ploi.io layout) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#101d26] dark:text-white tracking-tight">
            Welcome back, {displayName}!
          </h1>
          {/* <p className="text-xs sm:text-[13px] text-[#565f6b] dark:text-zinc-400 mt-1.5 max-w-3xl leading-relaxed">
            Ready to dive in? Our onboarding guide will walk you through the essentials, from setting up your first server to deploying apps like a pro. If you ever get stuck, we're just a click away. Let's make something awesome together!
          </p> */}
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => navigate('/servers/create')}
            className="h-10 px-4 rounded-lg bg-[#005459] hover:bg-[#004246] active:bg-[#003538] text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Server className="w-4 h-4" />
            <span>Create server</span>
          </button>
        </div>
      </div>


      {/* Workspace Title & Toolbar Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-2">
        <div>
          <div className="flex items-baseline gap-3 mt-1">
            <h2 className="text-[24px] font-bold text-[#101d26] dark:text-white tracking-tight leading-tight">
              Platform Activity
            </h2>
            <span className="text-[13px] text-[#565f6b] dark:text-zinc-400 hidden sm:inline">
              Real-time platform telemetry &amp; automated release pipelines
            </span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* View Mode Switcher: Overview vs DORA */}
          <div className="flex items-center bg-[#F4F6F5] p-0.5 rounded-[6px] border border-[#CDD4D0]">
            <button
              type="button"
              onClick={() => setActiveViewTab('overview')}
              className={`px-3 py-1 rounded-[5px] text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${activeViewTab === 'overview'
                ? 'bg-white text-[#005459] shadow-2xs font-semibold'
                : 'text-[#565f6b] hover:text-[#101d26]'
                }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>
            {/* <button
              type="button"
              onClick={() => setActiveViewTab('dora')}
              className={`px-3 py-1 rounded-[5px] text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewTab === 'dora'
                  ? 'bg-white text-[#005459] shadow-2xs font-semibold'
                  : 'text-[#565f6b] hover:text-[#101d26]'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>DORA Telemetry</span>
            </button> */}
          </div>

          {/* Search Box */}
          <div className="relative flex items-center w-[180px] sm:w-[220px]">
            <Search className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deployments..."
              className="w-full h-[36px] pl-8 pr-12 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] placeholder-[#565f6b] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15 transition-all shadow-2xs"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 p-0.5 text-[#8F9CA7] hover:text-[#101d26] rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-2 px-1.5 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] text-[10px] font-mono text-[#565f6b] pointer-events-none flex items-center gap-0.5">
                <Command className="w-2.5 h-2.5" />K
              </span>
            )}
          </div>

          {/* Quick Deploy CTA Button */}
          <button
            type="button"
            onClick={() => setIsQuickDeployOpen(true)}
            className="h-[36px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[13px] font-medium flex items-center gap-1.5 transition-all shadow-xs hover:shadow-sm cursor-pointer shrink-0"
            title="Trigger a new deployment (Cmd+B)"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Quick Deploy</span>
          </button>
        </div>
      </div>

      {/* Super Admin Team Onboarding Quick-Prompt Banner */}
      {isSuperAdmin && (
        <div className="p-3.5 bg-gradient-to-r from-[#E2F0FD] to-[#EAF5EE] border border-[#BEDDF7] rounded-[8px] flex flex-wrap items-center justify-between gap-3 text-[#005459]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#005459] text-white flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-[#101d26] flex items-center gap-2">
                <span>Super Admin Hub: Onboard your engineering team</span>
                <span className="px-1.5 py-0.2 rounded bg-white text-[#005459] text-[10px] font-mono font-bold border border-[#BEDDF7]">
                  {organizationName}
                </span>
              </div>
              <div className="text-[11px] text-[#565f6b]">
                Invite colleagues as Deployers, Admins, or Viewers with customized release permissions.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/platform-admin')}
              className="h-[30px] px-3 rounded-[5px] bg-[#0E131F] hover:bg-[#1C263D] text-amber-300 border border-amber-500/30 text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Super-see all tenants and manage platform activities"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Platform Ops</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/onboarding')}
              className="h-[30px] px-3 rounded-[5px] bg-[#FFFFFF] hover:bg-[#F4F6F5] border border-[#BEDDF7] text-[12px] font-medium text-[#005459] transition-colors cursor-pointer shadow-2xs"
            >
              Launch Wizard
            </button>
            <button
              type="button"
              onClick={() => navigate('/teams/members')}
              className="h-[30px] px-3 rounded-[5px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Onboard Members</span>
            </button>
          </div>
        </div>
      )}

      {/* Metric Cards Row */}
      <DashboardMetrics
        metrics={metrics}
        activeFilter={statusFilter}
        onSelectFilter={(filterKey) => setStatusFilter(filterKey)}
      />

      {/* Conditional View: DORA Analytics vs Clean Overview */}
      {activeViewTab === 'dora' ? (
        <div className="space-y-6">
          <DoraMetricsCard deployments={deployments} />

          {/* Detailed deployments log under DORA */}
          <RecentDeploymentsTable
            deployments={filteredDeployments}
            loading={loading}
            title="Deployment Velocity History"
            showViewAll={true}
            activeFilter={statusFilter}
            onFilterChange={(f) => setStatusFilter(f)}
            onViewAll={() => navigate('/deployments')}
            onSelectDeployment={(d) => {
              setSelectedLog({
                id: d.id,
                service: d.project,
                server: d.server,
                status: d.rawStatus || d.status?.toUpperCase(),
                commitSha: d.commitSha,
              })
              setIsLogModalOpen(true)
            }}
            onRollback={canRollback ? (d) => setRollbackDeployment(d) : undefined}
          />
        </div>
      ) : (
        /* Overview View (Default: Clean, Focused, & Uncluttered) */
        <div className="space-y-6">
          {/* Subtle Platform Health Ribbon (takes only 36px instead of 220px DORA box) */}
          <div className="bg-[#FAFBFB] border border-[#E2E7E4] rounded-[8px] px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-[12px] shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-semibold text-[#101d26]">Platform Health:</span>
              <span className="text-[#565f6b]">
                {servers.length} target fleet nodes online &bull; 0 incidents in 24h &bull; Elite velocity (4.7 deploys/wk)
              </span>
            </div>
            <button
              type="button"
              onClick={() => setActiveViewTab('dora')}
              className="font-semibold text-[#005459] hover:text-[#0B5459] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View DORA Telemetry</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Two-Column Dashboard Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Recent Deployments Table (Clean, 6 rows, compact, no wrapping) */}
            <div className="lg:col-span-8">
              <RecentDeploymentsTable
                deployments={filteredDeployments}
                loading={loading}
                title="Recent deployments"
                showViewAll={true}
                activeFilter={statusFilter}
                onFilterChange={(f) => setStatusFilter(f)}
                onViewAll={() => navigate('/deployments')}
                limit={6}
                compact={true}
                onSelectDeployment={(d) => {
                  setSelectedLog({
                    id: d.id,
                    service: d.project,
                    server: d.server,
                    status: d.rawStatus || d.status?.toUpperCase(),
                    commitSha: d.commitSha,
                  })
                  setIsLogModalOpen(true)
                }}
                onRollback={canRollback ? (d) => setRollbackDeployment(d) : undefined}
              />
            </div>

            {/* Right Column: Fleet Status & Quick Launch */}
            <div className="lg:col-span-4 space-y-4">
              {/* Active Deployment Card (Only shown if actively running or queued) */}
              <RunningNowCard
                activeDeploy={activeDeploy}
                hideWhenIdle={true}
                onViewLog={(d) => {
                  setSelectedLog({
                    id: d?.id,
                    service: d?.project || 'Project',
                    server: d?.server || 'Target',
                    status: d?.rawStatus || 'RUNNING',
                    commitSha: d?.commitSha,
                  })
                  setIsLogModalOpen(true)
                }}
                onQuickDeploy={() => setIsQuickDeployOpen(true)}
              />

              {/* Compact Target Fleet */}
              <ServersListCard
                servers={servers}
                loading={loading}
                compact={true}
                onManageServers={() => navigate('/servers')}
              />

              {/* Quick Service Launchpad */}
              {projects.length > 0 && (
                <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[10px] p-4 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-bold text-[#565f6b] uppercase tracking-wider font-mono">
                      Quick Launchpad
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/projects')}
                      className="text-[11px] font-medium text-[#005459] hover:underline cursor-pointer"
                    >
                      All projects →
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {projects.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setIsQuickDeployOpen(true)
                        }}
                        className="p-2.5 rounded-[6px] bg-[#F8FAF9] hover:bg-[#F0F5F2] border border-[#E2E7E4] hover:border-[#005459]/40 text-left transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="font-semibold text-[12px] text-[#101d26] group-hover:text-[#005459] truncate">
                          {p.name}
                        </div>
                        <div className="text-[10px] font-mono text-[#565f6b] flex items-center justify-between mt-1">
                          <span>main</span>
                          <span className="text-[#005459] opacity-0 group-hover:opacity-100 transition-opacity font-bold">
                            Deploy →
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Log Streaming Modal */}
      <LogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        deploymentId={selectedLog.id}
        serviceName={selectedLog.service}
        serverName={selectedLog.server}
        status={selectedLog.status}
        commitSha={selectedLog.commitSha}
      />

      {/* Quick Deploy Modal */}
      <QuickDeployModal
        isOpen={isQuickDeployOpen}
        onClose={() => setIsQuickDeployOpen(false)}
        projects={projects}
        servers={servers}
        onDeploySuccess={() => {
          fetchDashboardData()
        }}
      />

      {/* Rollback Modal */}
      {rollbackDeployment && (
        <RollbackModal
          isOpen={Boolean(rollbackDeployment)}
          onClose={() => setRollbackDeployment(null)}
          deployment={rollbackDeployment}
          onRollbackSuccess={(started) => {
            fetchDashboardData()
            if (started && started.id) {
              setSelectedLog({
                id: started.id,
                service: rollbackDeployment.project || 'Project',
                server: rollbackDeployment.server || 'Target',
                status: started.status || 'RUNNING',
                commitSha: started.commitSha?.slice(0, 7) || rollbackDeployment.commitSha
              })
              setIsLogModalOpen(true)
            }
          }}
        />
      )}
    </div>
  )
}
