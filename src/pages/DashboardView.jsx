import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardMetrics } from '../components/DashboardMetrics'
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
} from 'lucide-react'

export function DashboardView() {
  const navigate = useNavigate()
  const searchInputRef = useRef(null)
  const { role } = useAuth()
  const canRollback = can(role, 'deploy:rollback')

  const [environment, setEnvironment] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [isLiveSync, setIsLiveSync] = useState(true)

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
      {/* Workspace Title & Toolbar Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          {/* Breadcrumbs & Status Beacon */}
          <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wider text-[#565f6b] font-semibold">
            {/* <span>WORKSPACE</span>
            <span className="text-[#8F9CA7]">/</span>
            <span>CONTROL PLANE</span>
            <span className="text-[#8F9CA7]">•</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-mono text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              US-EAST HEALTHY
            </span> */}
          </div>

          <div className="flex items-baseline gap-3 mt-1">
            <h1 className="text-[32px] font-bold text-[#101d26] tracking-tight leading-tight">
              Dashboard
            </h1>
            <span className="text-[13px] text-[#565f6b] hidden sm:inline">
              Real-time platform telemetry &amp; automated release pipelines
            </span>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Sync Toggle */}
          {/* <button
            type="button"
            onClick={() => setIsLiveSync(!isLiveSync)}
            className={`h-[36px] px-3 rounded-[6px] border text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${isLiveSync
                ? 'bg-[#FFFFFF] border-emerald-300 text-emerald-800 hover:bg-emerald-50/50'
                : 'bg-[#FFFFFF] border-[#CDD4D0] text-[#565f6b] hover:bg-[#F4F6F5]'
              }`}
            title={isLiveSync ? 'Live sync enabled (15s auto-refresh)' : 'Live sync paused'}
          >
            <Radio className={`w-3.5 h-3.5 ${isLiveSync ? 'text-emerald-600 animate-pulse' : 'text-[#8F9CA7]'}`} />
            <span className="font-mono text-[11px]">
              {isLiveSync ? 'LIVE' : 'PAUSED'}
            </span>
          </button> */}

          {/* Manual Refresh Button */}
          {/* <button
            type="button"
            onClick={() => fetchDashboardData()}
            disabled={loading}
            className="h-[36px] px-3 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#565f6b] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Refresh dashboard metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#005459]' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button> */}

          {/* Search Box */}
          <div className="relative flex items-center w-[200px] sm:w-[240px]">
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

          {/* Environment Filter Dropdown */}
          {/* <div className="relative">
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="h-[36px] pl-3 pr-8 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] font-medium text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15 appearance-none cursor-pointer shadow-2xs"
            >
              <option value="All">Environment: All</option>
              <option value="Production">Environment: Production</option>
              <option value="Staging">Environment: Staging</option>
              <option value="QA">Environment: QA</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#565f6b] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div> */}

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

      {/* Metric Cards Row */}
      <DashboardMetrics
        metrics={metrics}
        activeFilter={statusFilter}
        onSelectFilter={(filterKey) => setStatusFilter(filterKey)}
      />

      {/* Two-Column Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Deployments Table */}
        <div className="lg:col-span-8">
          <RecentDeploymentsTable
            deployments={filteredDeployments}
            loading={loading}
            title="Recent deployments"
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

        {/* Right Column: Fleet Status & Pipeline Runners */}
        <div className="lg:col-span-4 space-y-4">
          <ServersListCard
            servers={servers}
            loading={loading}
            onManageServers={() => navigate('/servers')}
          />

          <RunningNowCard
            activeDeploy={activeDeploy}
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
