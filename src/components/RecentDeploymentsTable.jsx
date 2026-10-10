import { useState, useMemo } from 'react'
import {
  GitBranch,
  ArrowRight,
  Loader2,
  Rocket,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  RotateCcw,
  Copy,
  Check,
  Server,
  ExternalLink,
  Filter,
  Search,
} from 'lucide-react'
import { formatTimeAgo, formatDuration } from '../utils/formatters'

export function RecentDeploymentsTable({
  deployments = [],
  onSelectDeployment,
  onRollback,
  onRetry,
  loading = false,
  title = 'Recent deployments',
  showViewAll = true,
  onViewAll,
  activeFilter = 'ALL',
  onFilterChange,
}) {
  const [internalFilter, setInternalFilter] = useState('ALL')
  const [copiedSha, setCopiedSha] = useState(null)
  const [quickSearch, setQuickSearch] = useState('')

  // Identify latest successful deployment for each target to distinguish active release
  const activeDeployIds = useMemo(() => {
    const set = new Set()
    const seen = new Set()
    deployments.forEach((d) => {
      const key = d.targetId || d.server || d.targetName || d.project || 'default'
      const status = String(d.status || d.rawStatus || '').toUpperCase()
      if (status === 'SUCCESS' && d.commitSha && !seen.has(key)) {
        seen.add(key)
        set.add(d.id)
      }
    })
    return set
  }, [deployments])

  const currentFilter = onFilterChange ? activeFilter : internalFilter
  const handleFilterSelect = (filter) => {
    if (onFilterChange) {
      onFilterChange(filter)
    } else {
      setInternalFilter(filter)
    }
  }

  const handleCopySha = (e, sha) => {
    e.stopPropagation()
    if (!sha) return
    navigator.clipboard?.writeText(sha)
    setCopiedSha(sha)
    setTimeout(() => setCopiedSha(null), 1500)
  }

  // Filter deployments by current tab & quick search
  const filteredList = deployments.filter((d) => {
    // Status filter
    if (currentFilter !== 'ALL') {
      const s = String(d.status || d.rawStatus || '').toUpperCase()
      if (currentFilter === 'SUCCESS' && s !== 'SUCCESS') return false
      if (currentFilter === 'FAILED' && s !== 'FAILED' && s !== 'CANCELLED') return false
      if (currentFilter === 'RUNNING' && s !== 'RUNNING' && s !== 'QUEUED') return false
    }

    // Quick text filter
    if (quickSearch) {
      const q = quickSearch.toLowerCase()
      const matches =
        d.project?.toLowerCase().includes(q) ||
        d.server?.toLowerCase().includes(q) ||
        d.branch?.toLowerCase().includes(q) ||
        d.commitSha?.toLowerCase().includes(q) ||
        d.commitMsg?.toLowerCase().includes(q)
      if (!matches) return false
    }

    return true
  })

  // Calculate status counts
  const successCount = deployments.filter(
    (d) => String(d.status || d.rawStatus || '').toUpperCase() === 'SUCCESS'
  ).length
  const failedCount = deployments.filter((d) => {
    const s = String(d.status || d.rawStatus || '').toUpperCase()
    return s === 'FAILED' || s === 'CANCELLED'
  }).length
  const runningCount = deployments.filter((d) => {
    const s = String(d.status || d.rawStatus || '').toUpperCase()
    return s === 'RUNNING' || s === 'QUEUED'
  }).length

  const renderStatusBadge = (status) => {
    const s = String(status || '').toLowerCase()
    switch (s) {
      case 'running':
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
            <span>RUNNING</span>
          </span>
        )
      case 'failed':
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs">
            <XCircle className="w-3 h-3 text-rose-500 shrink-0" />
            <span>FAILED</span>
          </span>
        )
      case 'success':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>SUCCESS</span>
          </span>
        )
    }
  }

  const renderTriggeredBy = (d) => {
    const triggered = d.triggeredBy
    const isWebhook = d.trigger === 'WEBHOOK' || !triggered || triggered.type === 'branch'

    if (isWebhook) {
      return (
        <div
          className="inline-flex items-center gap-1 text-[11px] text-[#565f6b] font-mono bg-[#F4F6F5] px-2 py-0.5 rounded-[4px] border border-[#CDD4D0]"
          title="Automated Git Push"
        >
          <GitBranch className="w-3 h-3 text-[#565f6b]" />
          <span>Webhook</span>
        </div>
      )
    }

    return (
      <div
        className="inline-flex items-center gap-1.5"
        title={triggered.name || 'Platform Operator'}
      >
        <span
          className={`w-5.5 h-5.5 rounded-full ${triggered.bg || 'bg-[#005459]'} ${
            triggered.color || 'text-white'
          } flex items-center justify-center font-mono text-[9px] font-bold tracking-tight shadow-2xs`}
        >
          {triggered.text || 'OP'}
        </span>
        <span className="text-[12px] text-[#565f6b] max-w-[80px] truncate">
          {triggered.name?.split(' ')[0] || 'Admin'}
        </span>
      </div>
    )
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[10px] overflow-hidden shadow-2xs">
      {/* Top Header & Filter Navigation Bar */}
      <div className="p-4 border-b border-[#E2E7E4] flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Title & Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold text-[#101d26] tracking-tight">
              {title}
            </h2>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDAF2] font-mono text-[11px] font-medium text-[#005459]">
              {loading ? '...' : `${deployments.length} total`}
            </span>
          </div>

          <div className="h-4 w-px bg-[#CDD4D0] hidden sm:block" />

          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-[#F4F6F5] p-0.5 rounded-[6px] border border-[#CDD4D0]/80">
            <button
              type="button"
              onClick={() => handleFilterSelect('ALL')}
              className={`px-2.5 py-1 rounded-[5px] text-[11px] font-medium font-sans transition-colors cursor-pointer ${
                currentFilter === 'ALL'
                  ? 'bg-white text-[#101d26] font-semibold shadow-2xs'
                  : 'text-[#565f6b] hover:text-[#101d26]'
              }`}
            >
              All ({deployments.length})
            </button>
            <button
              type="button"
              onClick={() => handleFilterSelect('SUCCESS')}
              className={`px-2 py-1 rounded-[5px] text-[11px] font-medium font-sans transition-colors cursor-pointer flex items-center gap-1 ${
                currentFilter === 'SUCCESS'
                  ? 'bg-white text-emerald-700 font-semibold shadow-2xs'
                  : 'text-[#565f6b] hover:text-emerald-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Passed ({successCount})
            </button>
            <button
              type="button"
              onClick={() => handleFilterSelect('FAILED')}
              className={`px-2 py-1 rounded-[5px] text-[11px] font-medium font-sans transition-colors cursor-pointer flex items-center gap-1 ${
                currentFilter === 'FAILED'
                  ? 'bg-white text-rose-700 font-semibold shadow-2xs'
                  : 'text-[#565f6b] hover:text-rose-700'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Failed ({failedCount})
            </button>
            {runningCount > 0 && (
              <button
                type="button"
                onClick={() => handleFilterSelect('RUNNING')}
                className={`px-2 py-1 rounded-[5px] text-[11px] font-medium font-sans transition-colors cursor-pointer flex items-center gap-1 ${
                  currentFilter === 'RUNNING'
                    ? 'bg-white text-amber-700 font-semibold shadow-2xs'
                    : 'text-[#565f6b] hover:text-amber-700'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                Active ({runningCount})
              </button>
            )}
          </div>
        </div>

        {/* Right: Quick Search & View all */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {showViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="group text-[12px] font-semibold text-[#005459] hover:text-[#0B5459] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>View all deployments</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          )}
        </div>
      </div>

      {/* Deployments Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse select-none">
          <thead>
            <tr className="h-[36px] bg-[#F4F6F5] border-b border-[#CDD4D0] text-[#565f6b] font-semibold text-[11px] font-mono tracking-wider uppercase">
              <th className="px-4 w-[110px]">STATUS</th>
              <th className="px-3">PROJECT</th>
              <th className="px-3">TARGET</th>
              <th className="px-3">BRANCH</th>
              <th className="px-3">COMMIT</th>
              <th className="px-3">TRIGGER</th>
              <th className="px-3">WHEN</th>
              <th className="px-4 text-right w-[90px]">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E7E4] text-[13px]">
            {loading ? (
              <tr>
                <td colSpan={8} className="py-14 text-center text-[#565f6b]">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-[#005459]" />
                    <span className="text-[13px] font-mono">Streaming deployment records...</span>
                  </div>
                </td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="max-w-sm mx-auto flex flex-col items-center gap-2.5 text-[#565f6b]">
                    <div className="w-10 h-10 rounded-full bg-[#F4F6F5] flex items-center justify-center">
                      <Rocket className="w-5 h-5 text-[#8F9CA7] stroke-[1.5]" />
                    </div>
                    <div className="font-semibold text-[#101d26] text-[14px]">
                      {currentFilter !== 'ALL'
                        ? `No ${currentFilter.toLowerCase()} deployments found`
                        : 'No deployments recorded yet'}
                    </div>
                    <p className="text-[12px] leading-relaxed text-[#565f6b]">
                      {currentFilter !== 'ALL'
                        ? 'Try clearing the status filter to view all deployment executions.'
                        : 'Dispatches triggered via Git webhook or the dashboard will appear here.'}
                    </p>
                    {currentFilter !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => handleFilterSelect('ALL')}
                        className="mt-1 px-3 py-1 bg-white border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[12px] font-medium text-[#101d26] rounded-[5px] cursor-pointer"
                      >
                        Reset filter to All
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredList.map((d) => {
                const timeAgo = formatTimeAgo(d.queuedAt || d.startedAt)
                const duration = formatDuration(d.startedAt, d.finishedAt)

                return (
                  <tr
                    key={d.id}
                    onClick={() => onSelectDeployment && onSelectDeployment(d)}
                    className="group h-[44px] hover:bg-[#F8FAF9] transition-colors cursor-pointer"
                  >
                    {/* Status Badge */}
                    <td className="px-4">
                      {renderStatusBadge(d.status || d.rawStatus)}
                    </td>

                    {/* Project & Environment Pill */}
                    <td className="px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#101d26] group-hover:text-[#005459] transition-colors tracking-tight">
                          {d.project}
                        </span>
                        {d.targetName && d.targetName !== 'default' && (
                          <span className="px-1.5 py-0.2 rounded-[3px] bg-[#F4F6F5] text-[#565f6b] text-[10px] font-mono border border-[#CDD4D0]">
                            {d.targetName}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Target / Server */}
                    <td className="px-3 font-mono text-[12px] text-[#565f6b]">
                      <div className="flex items-center gap-1.5">
                        <Server className="w-3 h-3 text-[#8F9CA7]" />
                        <span>{d.server}</span>
                      </div>
                    </td>

                    {/* Branch */}
                    <td className="px-3">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] text-[#005459] font-mono text-[11px] font-medium">
                        <GitBranch className="w-2.5 h-2.5 text-[#005459]" />
                        <span>{d.branch}</span>
                      </span>
                    </td>

                    {/* Commit SHA & Message */}
                    <td className="px-3">
                      <div className="flex items-center gap-2 max-w-[280px]">
                        <button
                          type="button"
                          onClick={(e) => handleCopySha(e, d.commitSha)}
                          title="Click to copy SHA"
                          className="px-1.5 py-0.5 rounded-[3px] bg-[#E2F0FD] hover:bg-[#D0E7FC] text-[#005459] font-mono text-[11px] font-bold border border-[#BEDAF2] flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                        >
                          {copiedSha === d.commitSha ? (
                            <Check className="w-2.5 h-2.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-2.5 h-2.5 text-[#005459]/70" />
                          )}
                          <span>{d.commitSha}</span>
                        </button>
                        <span
                          className="font-sans text-[12px] text-[#565f6b] truncate"
                          title={d.commitMsg}
                        >
                          {d.commitMsg}
                        </span>
                      </div>
                    </td>

                    {/* Triggered By */}
                    <td className="px-3">
                      {renderTriggeredBy(d)}
                    </td>

                    {/* Timing */}
                    <td className="px-3 font-sans text-[12px] text-[#565f6b] whitespace-nowrap">
                      <div className="flex items-center gap-1 text-[#565f6b]" title={d.queuedAt || d.startedAt}>
                        <Clock className="w-3 h-3 text-[#8F9CA7]" />
                        <span>{timeAgo}</span>
                        {duration && (
                          <span className="text-[10px] font-mono text-[#8F9CA7] ml-1">
                            ({duration})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action button */}
                    <td className="px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectDeployment && onSelectDeployment(d)
                          }}
                          className="px-2 py-1 rounded-[4px] bg-white border border-[#CDD4D0] hover:bg-[#005459] hover:text-white hover:border-[#005459] text-[#565f6b] text-[11px] font-medium inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                          title="View streaming deployment logs"
                        >
                          <Terminal className="w-3 h-3" />
                          <span>Logs</span>
                        </button>
                        {onRetry && (d.status === 'failed' || d.status === 'cancelled' || d.rawStatus === 'FAILED' || d.rawStatus === 'CANCELLED') && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              onRetry(d)
                            }}
                            className="px-2 py-1 rounded-[4px] bg-white border border-[#F1B5AC] hover:bg-[#C2412D] hover:text-white hover:border-[#C2412D] text-[#C2412D] text-[11px] font-medium inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            title="Retry this failed deployment"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                        {onRollback && (d.status === 'success' || d.rawStatus === 'SUCCESS') && d.commitSha && (
                          activeDeployIds.has(d.id) ? (
                            <span
                              className="px-2 py-0.5 rounded-[4px] bg-[#EAF5EE] border border-[#B3E3D1] text-[#2E8B57] text-[10px] font-mono font-semibold inline-flex items-center gap-1 shadow-2xs"
                              title="Currently active deployment"
                            >
                              <Check className="w-2.5 h-2.5 text-[#2E8B57]" />
                              <span>Active</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onRollback(d)
                              }}
                              className="px-2 py-1 rounded-[4px] bg-white border border-[#CDD4D0] hover:border-[#F1D6A4] hover:bg-[#FAF3E7] text-[#B87E0C] text-[11px] font-medium inline-flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title={`Rollback to this release (${d.commitSha?.slice(0, 7)})`}
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Rollback</span>
                            </button>
                          )
                        )}
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
  )
}
