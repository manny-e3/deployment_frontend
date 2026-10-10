import { useState, useEffect } from 'react'
import { RecentDeploymentsTable } from '../components/RecentDeploymentsTable'
import { LogModal } from '../components/LogModal'
import { RollbackModal } from '../components/RollbackModal'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { can } from '../utils/permissions'
import { api } from '../services/api'
import { Rocket, Filter, RefreshCw, Search, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

export function DeploymentsView() {
  const { role } = useAuth()
  const { showToast } = useToast()
  const canRollback = can(role, 'deploy:rollback')
  const [deployments, setDeployments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLogOpen, setIsLogOpen] = useState(false)
  const [rollbackDeployment, setRollbackDeployment] = useState(null)
  const [selectedLog, setSelectedLog] = useState({
    id: null,
    service: '',
    server: '',
    status: 'QUEUED',
    commitSha: null
  })

  const handleRetryDeployment = async (d) => {
    try {
      showToast({
        type: 'info',
        title: 'Retrying Deployment',
        message: `Re-dispatching pipeline run for ${d.project || d.service || 'target'}...`
      })
      const res = await api(`/deployments/${d.id}/retry`, { method: 'POST' }).catch(async () => {
        return await api(`/projects/${d.projectId || d.project}/deploy`, { method: 'POST' })
      })
      showToast({
        type: 'success',
        title: 'Pipeline Re-Dispatched',
        message: 'New deployment execution is now running.'
      })
      fetchDeployments()
      const started = res?.started?.[0] || res
      if (started && started.id) {
        setSelectedLog({
          id: started.id,
          service: d.project || d.service,
          server: d.server,
          status: started.status || 'RUNNING',
          commitSha: started.commitSha?.slice(0, 7) || d.commitSha
        })
        setIsLogOpen(true)
      }
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Retry Failed',
        message: err.message || 'Could not restart deployment.'
      })
    }
  }

  const fetchDeployments = async () => {
    setLoading(true)
    try {
      const query = { limit: 50 }
      if (statusFilter !== 'ALL') {
        query.status = statusFilter
      }
      const res = await api('/deployments', { query })
      const items = res?.items || (Array.isArray(res) ? res : [])
      const mapped = items.filter(Boolean).map((d) => {
        const rawStatus = (d.status || 'QUEUED').toUpperCase()
        const authorName = d.triggeredBy?.name || (d.trigger === 'WEBHOOK' ? 'Git Webhook' : 'Operator')
        const initials = authorName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'OP'

        return {
          id: d.id,
          number: d.number,
          status: rawStatus.toLowerCase(),
          rawStatus,
          project: d.target?.project?.name || d.project || 'Project',
          targetName: d.target?.name || 'default',
          server: d.target?.name || d.server || 'Target',
          branch: d.branch || 'main',
          commitSha: d.commitSha ? d.commitSha.slice(0, 7) : (d.requestedSha ? d.requestedSha.slice(0, 7) : 'HEAD'),
          commitMsg: d.commitMessage || d.commitMsg || (d.trigger === 'ROLLBACK' ? 'Rollback deployment' : 'Release deployment'),
          trigger: d.trigger,
          triggeredBy: d.trigger === 'WEBHOOK' ? { type: 'branch' } : {
            type: 'avatar',
            text: initials,
            name: authorName,
            bg: 'bg-[#005459]',
            color: 'text-white'
          },
          startedAt: d.startedAt,
          queuedAt: d.queuedAt,
          finishedAt: d.finishedAt,
          error: d.error
        }
      })
      setDeployments(mapped)
    } catch (err) {
      console.error('Failed to fetch deployments:', err)
      setDeployments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDeployments()
  }, [statusFilter])

  const filteredDeployments = deployments.filter((d) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      d.project.toLowerCase().includes(q) ||
      d.server.toLowerCase().includes(q) ||
      d.branch.toLowerCase().includes(q) ||
      d.commitSha.toLowerCase().includes(q) ||
      d.commitMsg.toLowerCase().includes(q)
    )
  })

  // Summary counts
  const totalCount = deployments.length
  const successCount = deployments.filter((d) => d.status === 'success').length
  const failedCount = deployments.filter((d) => d.status === 'failed' || d.status === 'cancelled').length
  const activeCount = deployments.filter((d) => d.status === 'running' || d.status === 'queued').length

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#565f6b] font-semibold">
            PIPELINES <span className="text-[#8F9CA7]">/</span> RELEASES &amp; HISTORY
          </div>
          <h1 className="text-[30px] font-bold text-[#101d26] tracking-tight leading-tight mt-1">
            Deployments History
          </h1>
          <p className="text-[13px] text-[#565f6b] mt-0.5">
            Audit trail of automated and manual deployment executions across target fleets.
          </p>
        </div>

        {/* Quick Stats Banner */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchDeployments}
            disabled={loading}
            className="h-[34px] px-3 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#565f6b] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh deployments"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#565f6b] uppercase">Total Listed</div>
            <div className="text-[20px] font-bold text-[#101d26] mt-0.5">{totalCount}</div>
          </div>
          <Rocket className="w-4 h-4 text-[#8F9CA7]" />
        </div>

        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#565f6b] uppercase">Successful</div>
            <div className="text-[20px] font-bold text-[#2E8B57] mt-0.5">{successCount}</div>
          </div>
          <CheckCircle2 className="w-4 h-4 text-[#2E8B57]" />
        </div>

        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#565f6b] uppercase">Active / Queued</div>
            <div className="text-[20px] font-bold text-[#B87E0C] mt-0.5">{activeCount}</div>
          </div>
          <Clock className="w-4 h-4 text-[#B87E0C]" />
        </div>

        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] p-3.5 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-[#565f6b] uppercase">Failed / Cancelled</div>
            <div className="text-[20px] font-bold text-[#C2412D] mt-0.5">{failedCount}</div>
          </div>
          <AlertCircle className="w-4 h-4 text-[#C2412D]" />
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-3 shadow-2xs">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565f6b]" />
          <input
            type="text"
            placeholder="Search by project, target, commit, or branch..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[34px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] placeholder-[#565f6b] outline-none focus:border-[#005459]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-medium text-[#565f6b]">Status:</span>
          {['ALL', 'SUCCESS', 'RUNNING', 'FAILED', 'QUEUED'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`h-[28px] px-2.5 rounded-[4px] font-mono text-[11px] font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#005459] text-white font-bold'
                  : 'bg-[#F4F6F5] hover:bg-[#EAEAEA] text-[#565f6b]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Recent Deployments Table */}
      <RecentDeploymentsTable
        deployments={filteredDeployments}
        loading={loading}
        title="Deployments log"
        showViewAll={false}
        onSelectDeployment={(d) => {
          setSelectedLog({
            id: d.id,
            service: d.project,
            server: d.server,
            status: d.rawStatus || d.status?.toUpperCase(),
            commitSha: d.commitSha
          })
          setIsLogOpen(true)
        }}
        onRollback={canRollback ? (d) => setRollbackDeployment(d) : undefined}
        onRetry={handleRetryDeployment}
      />

      {/* Realtime Log Modal */}
      <LogModal
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        deploymentId={selectedLog.id}
        serviceName={selectedLog.service}
        serverName={selectedLog.server}
        status={selectedLog.status}
        commitSha={selectedLog.commitSha}
        onRetry={handleRetryDeployment}
      />

      {/* Rollback Modal */}
      {rollbackDeployment && (
        <RollbackModal
          isOpen={Boolean(rollbackDeployment)}
          onClose={() => setRollbackDeployment(null)}
          deployment={rollbackDeployment}
          onRollbackSuccess={(started) => {
            fetchDeployments()
            if (started && started.id) {
              setSelectedLog({
                id: started.id,
                service: rollbackDeployment.project || 'Project',
                server: rollbackDeployment.server || 'Target',
                status: started.status || 'RUNNING',
                commitSha: started.commitSha?.slice(0, 7) || rollbackDeployment.commitSha
              })
              setIsLogOpen(true)
            }
          }}
        />
      )}
    </div>
  )
}

