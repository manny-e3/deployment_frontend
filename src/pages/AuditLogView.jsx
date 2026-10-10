import { useState, useEffect } from 'react'
import {
  Clock,
  Shield,
  Download,
  FileSpreadsheet,
  Search,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Calendar,
  Filter,
  Code2,
  Bot,
  ExternalLink,
  Radio,
  RefreshCw,
  Lock,
  Loader2
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { can } from '../utils/permissions'

const formatAuditSummary = (it) => {
  const act = it.action || 'event'
  switch (act) {
    case 'auth.login': return 'User signed into control plane'
    case 'auth.login_failed': return `Sign-in attempt failed (${it.details?.reason || 'invalid credentials'})`
    case 'auth.logout': return 'User signed out'
    case 'auth.password_changed': return 'User credentials updated'
    case 'auth.refresh_reuse': return 'Stale refresh token detected and revoked'
    case 'user.created': return `User created: ${it.details?.email || it.entityId || 'new user'}`
    case 'user.updated': return `User modified: ${it.entityId || 'user'}`
    case 'user.deactivated': return `User deactivated: ${it.entityId || 'user'}`
    case 'server.created': return `Server host added: ${it.details?.host || it.entityId || 'new server'}`
    case 'server.updated': return `Server updated: ${it.entityId || 'server'}`
    case 'server.deleted': return `Server decommissioned: ${it.entityId || 'server'}`
    case 'server.tested': return `Server connectivity health check executed`
    case 'server.fingerprint_reset': return `SSH host key fingerprint reset`
    case 'project.created': return `Project created: ${it.details?.name || it.entityId || 'project'}`
    case 'project.updated': return `Project settings modified`
    case 'project.deleted': return `Project deleted`
    case 'project.webhook_secret_regenerated': return `Project HMAC webhook secret regenerated`
    case 'target.created': return `Deployment target created`
    case 'target.updated': return `Deployment target updated`
    case 'target.deleted': return `Deployment target removed`
    case 'target.env_replaced': return `Target environment variables updated`
    case 'deploy.started': return `Pipeline run triggered`
    case 'deploy.cancelled': return `Pipeline run cancelled`
    case 'deploy.cancel_requested': return `Cancellation requested for active deploy`
    case 'deploy.rollback': return `Rollback to prior commit initiated`
    default: return `${act.replace(/\./g, ' ')} (${it.entity || 'platform'})`
  }
}

const getActionType = (act) => {
  if (!act) return 'other'
  if (act.startsWith('deploy.')) return 'deployment'
  if (act.startsWith('auth.')) return 'security'
  if (act.startsWith('user.')) return 'access'
  if (act.startsWith('server.') || act.startsWith('target.') || act.startsWith('project.')) return 'infrastructure'
  return 'other'
}

export function AuditLogView() {
  const { role } = useAuth()
  const canViewAudit = can(role, 'audit:view')

  const [events, setEvents] = useState([])
  const [activeTab, setActiveTab] = useState('All')
  const [isLiveStreamOn, setIsLiveStreamOn] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [userFilter, setUserFilter] = useState('All users')
  const [actionFilter, setActionFilter] = useState('All actions')
  const [timeFilter, setTimeFilter] = useState('Last 7 days')
  const [expandedId, setExpandedId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [cursor, setCursor] = useState(null)
  const [cursorHistory, setCursorHistory] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchAuditLogs = async (cursorToken = null) => {
    if (!canViewAudit) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await api('/audit-logs', {
        query: {
          limit: 50,
          ...(cursorToken ? { cursor: cursorToken } : {})
        }
      })
      const items = res?.items || (Array.isArray(res) ? res : [])
      const normalized = items.map((it, idx) => {
        const createdAt = it.createdAt ? new Date(it.createdAt) : new Date()
        const isSecurity = it.action?.startsWith('auth.') || it.action?.includes('security')
        const isDeploy = it.action?.startsWith('deploy.')
        const actionType = getActionType(it.action)
        const userName = it.user?.name || it.user?.email || (it.user === null ? 'System Automation' : 'Operator')
        const initials = userName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'OP'

        return {
          id: it.id || `aud-${idx}`,
          action: it.action,
          timestamp: createdAt.toLocaleTimeString(),
          relativeTime: createdAt.toLocaleDateString(),
          dotColor: isSecurity ? 'bg-[#C2412D]' : isDeploy ? 'bg-[#005459]' : 'bg-[#2E8B57]',
          actor: {
            name: userName,
            avatar: null,
            initials,
            badge: (it.user?.role || (it.user ? 'USER' : 'SYSTEM')).toUpperCase(),
            badgeColor: it.user?.role === 'ADMIN' ? 'bg-[#E2F0FD] text-[#005459] border-[#BEDDF7]' : 'bg-[#F4F6F5] text-[#565f6b] border-[#CDD4D0]',
            isBot: !it.user,
          },
          actionType,
          summary: formatAuditSummary(it),
          targetHost: it.entity ? `${it.entity}${it.entityId ? ` #${String(it.entityId).slice(0, 8)}` : ''}` : (it.ip || 'Platform'),
          ip: it.ip || '—',
          hasPayload: !!it.details,
          isExpanded: false,
          payload: it.details || { action: it.action, entity: it.entity, entityId: it.entityId }
        }
      })
      setEvents(normalized)
      setNextCursor(res?.nextCursor || null)
    } catch (err) {
      console.error('Failed to fetch audit logs:', err)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAuditLogs(cursor)
  }, [cursor, canViewAudit])

  const handleNextPage = () => {
    if (!nextCursor) return
    setCursorHistory((prev) => [...prev, cursor])
    setCursor(nextCursor)
  }

  const handlePrevPage = () => {
    if (cursorHistory.length === 0) return
    const prevStack = [...cursorHistory]
    const last = prevStack.pop()
    setCursorHistory(prevStack)
    setCursor(last)
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const handleCopyJson = (payload, id) => {
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  if (!canViewAudit) {
    return (
      <div className="space-y-6">
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#565f6b] font-semibold">
          Platform <span className="text-[#8F9CA7]">&gt;</span> Compliance <span className="text-[#8F9CA7]">&gt;</span> Audit Log
        </div>
        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-12 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-[8px] bg-[#FAEBE9] border border-[#F1B5AC] text-[#C2412D] flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-[20px] font-bold text-[#101d26] tracking-tight">Access Restricted</h2>
            <p className="text-[13px] text-[#565f6b] max-w-md mx-auto mt-2 leading-relaxed">
              Your account role is <span className="font-mono font-semibold text-[#101d26] bg-[#F4F6F5] px-1.5 py-0.5 rounded border border-[#CDD4D0]">{role}</span>.
              Access to compliance audit logs and immutable ledger records requires <strong className="text-[#005459]">ADMIN</strong> privileges.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Dynamic filter lists and calculations
  const userOptions = ['All users', ...Array.from(new Set(events.map((e) => e.actor.name).filter(Boolean)))]

  const tabCounts = {
    All: events.length,
    Deployments: events.filter((e) => e.actionType === 'deployment').length,
    'Access & Roles': events.filter((e) => e.actionType === 'access').length,
    Infrastructure: events.filter((e) => e.actionType === 'infrastructure').length,
    'Security & Keys': events.filter((e) => e.actionType === 'security').length,
  }

  const securityCount = events.filter((e) => e.actionType === 'security').length
  const failedAuthCount = events.filter((e) => e.action === 'auth.login_failed').length

  const filteredEvents = events.filter((ev) => {
    const matchesSearch =
      ev.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.actor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.targetHost.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ev.ip.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesUser =
      userFilter === 'All users' ||
      ev.actor.name.toLowerCase() === userFilter.toLowerCase()

    const matchesAction =
      actionFilter === 'All actions' ||
      ev.actionType.toLowerCase() === actionFilter.toLowerCase()

    const matchesTab =
      activeTab === 'All' ||
      (activeTab === 'Deployments' && ev.actionType === 'deployment') ||
      (activeTab === 'Access & Roles' && ev.actionType === 'access') ||
      (activeTab === 'Infrastructure' && ev.actionType === 'infrastructure') ||
      (activeTab === 'Security & Keys' && ev.actionType === 'security')

    return matchesSearch && matchesUser && matchesAction && matchesTab
  })

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Stream Bar */}
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#565f6b] font-semibold">
            Platform <span className="text-[#8F9CA7]">&gt;</span> Compliance <span className="text-[#8F9CA7]">&gt;</span> Audit Log
          </div>

          {/* Top-Right: Live Stream Toggle & Export Buttons */}
          <div className="flex items-center gap-3">
            {/* Live Stream Switch */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[#101d26]">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLiveStreamOn ? 'bg-[#2E8B57] animate-pulse' : 'bg-[#565f6b]'
                  }`}
                />
                LIVE STREAM
              </span>
              <button
                type="button"
                onClick={() => setIsLiveStreamOn(!isLiveStreamOn)}
                className={`w-9 h-5 rounded-full transition-colors relative cursor-pointer ${
                  isLiveStreamOn ? 'bg-[#005459]' : 'bg-[#CDD4D0]'
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full bg-white transition-transform absolute top-[3px] ${
                    isLiveStreamOn ? 'left-[19px]' : 'left-[3px]'
                  }`}
                />
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={() => fetchAuditLogs(cursor)}
              disabled={loading}
              className="h-[32px] px-2.5 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#565f6b] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh audit events"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            {/* Export JSON */}
            <button
              type="button"
              onClick={() => {
                const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `audit-logs-${Date.now()}.json`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="h-[32px] px-3 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#101d26] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#565f6b]" />
              <span>Export JSON</span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={() => {
                const header = 'id,timestamp,actionType,summary,actor,ip\n'
                const rows = events.map(e => `"${e.id}","${e.timestamp}","${e.actionType}","${e.summary}","${e.actor.name}","${e.ip}"`).join('\n')
                const blob = new Blob([header + rows], { type: 'text/csv' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `audit-logs-${Date.now()}.csv`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="h-[32px] px-3 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#101d26] text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#565f6b]" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Title & Badges */}
        <div className="flex items-center gap-3 mt-1.5">
          <h1 className="text-[26px] font-bold text-[#101d26] tracking-tight leading-tight">
            Audit Log
          </h1>
          <span className="px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] text-[#101d26] font-mono text-[11px] font-medium">
            {loading ? 'fetching...' : `${events.length} events loaded`}
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDDF7] text-[#005459] font-mono text-[11px] font-medium">
            <Shield className="w-3.5 h-3.5 text-[#005459]" />
            Immutable Ledger · Retention: 365 days
          </span>
        </div>

        {/* 3 Metrics row */}
        <div className="flex items-center gap-6 mt-3 text-[12px] font-mono">
          <div>
            <span className="text-[#565f6b] uppercase text-[10px] tracking-wider">
              TOTAL RECORDED
            </span>{' '}
            <span className="font-bold text-[#101d26] text-[14px]">{events.length}</span>
          </div>
          <div>
            <span className="text-[#565f6b] uppercase text-[10px] tracking-wider">
              SECURITY CHANGES
            </span>{' '}
            <span className="font-bold text-[#101d26] text-[14px]">{securityCount}</span>{' '}
            <span className="px-1.5 py-0.2 rounded-[3px] bg-[#EAF5EE] text-[#2E8B57] text-[10px] font-semibold border border-[#B8E0C5]">
              audited
            </span>
          </div>
          <div>
            <span className="text-[#565f6b] uppercase text-[10px] tracking-wider">
              FAILED AUTH
            </span>{' '}
            <span className={`font-bold text-[14px] ${failedAuthCount > 0 ? 'text-[#C2412D]' : 'text-[#2E8B57]'}`}>
              {failedAuthCount} {failedAuthCount === 0 ? '(100% clean)' : 'alerts'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-3 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565f6b]" />
            <input
              type="text"
              placeholder="Search by resource, user, or IP.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[34px] pl-8 pr-9 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459]"
            />
            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#8F9CA7] border border-[#E2E7E4] px-1 rounded bg-[#F4F6F5]">
              ⌘K
            </span>
          </div>

          {/* User dropdown */}
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="h-[34px] px-2.5 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459] cursor-pointer"
          >
            {userOptions.map((u) => (
              <option key={u} value={u}>{u === 'All users' ? 'User: All users' : u}</option>
            ))}
          </select>

          {/* Action dropdown */}
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-[34px] px-2.5 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459] cursor-pointer"
          >
            <option value="All actions">Action: All actions</option>
            <option value="deployment">Deployments</option>
            <option value="access">Access &amp; Roles</option>
            <option value="infrastructure">Infrastructure</option>
            <option value="security">Security &amp; Keys</option>
          </select>

          {/* Time range */}
          <div className="flex items-center gap-1.5 h-[34px] px-2.5 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26]">
            <Calendar className="w-3.5 h-3.5 text-[#565f6b]" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-[12px]"
            >
              <option value="Last 7 days">Last 7 days</option>
              <option value="Last 24 hours">Last 24 hours</option>
              <option value="Last 30 days">Last 30 days</option>
              <option value="Last 90 days">Last 90 days</option>
            </select>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-[#F0F2F1]">
          {[
            { id: 'All', label: 'All', count: tabCounts.All },
            { id: 'Deployments', label: 'Deployments', count: tabCounts.Deployments },
            { id: 'Access & Roles', label: 'Access & Roles', count: tabCounts['Access & Roles'] },
            { id: 'Infrastructure', label: 'Infrastructure', count: tabCounts.Infrastructure },
            { id: 'Security & Keys', label: 'Security & Keys', count: tabCounts['Security & Keys'] },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`h-[28px] px-3 rounded-[4px] text-[12px] font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#005459] text-white font-semibold'
                  : 'bg-[#F4F6F5] hover:bg-[#EAEAEA] text-[#565f6b]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>


      {/* 3. Audit Log Timeline Table */}
      <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E7E4] bg-[#F4F6F5] text-[10px] font-mono font-semibold text-[#565f6b] uppercase tracking-wider">
                <th className="py-2.5 px-5">TIMESTAMP</th>
                <th className="py-2.5 px-4">ACTOR</th>
                <th className="py-2.5 px-4">ACTION SUMMARY</th>
                <th className="py-2.5 px-4">TARGET / IP</th>
                <th className="py-2.5 px-5 text-right">DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E7E4] text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-[#565f6b]">
                    <div className="flex items-center justify-center gap-2 font-mono text-[13px]">
                      <Loader2 className="w-4 h-4 animate-spin text-[#005459]" />
                      <span>Loading immutable audit ledger...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center gap-2 text-[#565f6b]">
                      <Shield className="w-8 h-8 text-[#8F9CA7] stroke-[1.5]" />
                      <div className="font-semibold text-[#101d26] text-[14px]">No audit events found</div>
                      <p className="text-[12px] leading-relaxed text-[#565f6b]">
                        Compliance and platform activity events will be recorded here automatically as operations execute.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((ev) => {
                const isExpanded = expandedId === ev.id
                return (
                  <tr key={ev.id} className="group">
                    <td colSpan={5} className="p-0">
                      {/* Row Header Bar */}
                      <div
                        onClick={() => toggleExpand(ev.id)}
                        className={`flex items-center px-5 py-3.5 hover:bg-[#FAFBFB] transition-colors cursor-pointer ${
                          isExpanded ? 'bg-[#FAFBFB]' : ''
                        }`}
                      >
                        {/* 1. Timestamp */}
                        <div className="w-[180px] shrink-0 flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${ev.dotColor} shrink-0`} />
                          <div>
                            <div className="font-mono text-[12px] font-bold text-[#101d26]">
                              {ev.timestamp}
                            </div>
                            <div className="font-mono text-[10px] text-[#565f6b]">
                              {ev.relativeTime}
                            </div>
                          </div>
                        </div>

                        {/* 2. Actor */}
                        <div className="w-[200px] shrink-0 flex items-center gap-2.5">
                          {ev.actor.avatar ? (
                            <img
                              src={ev.actor.avatar}
                              alt={ev.actor.name}
                              className="w-7 h-7 rounded-full object-cover border border-[#CDD4D0]"
                            />
                          ) : ev.actor.isBot ? (
                            <div className="w-7 h-7 rounded-full bg-[#FAEBE9] text-[#C2412D] flex items-center justify-center border border-[#F1B5AC]">
                              <Bot className="w-4 h-4" />
                            </div>
                          ) : (
                            <div
                              className={`w-7 h-7 rounded-full ${ev.actor.bg || 'bg-[#565f6b]'} text-white font-mono text-[10px] font-bold flex items-center justify-center`}
                            >
                              {ev.actor.initials}
                            </div>
                          )}

                          <div className="truncate">
                            <span className="font-semibold text-[#101d26] text-[12px]">
                              {ev.actor.name}
                            </span>
                            <div className="mt-0.5">
                              <span
                                className={`px-1.5 py-0.2 rounded-[3px] font-mono text-[9px] font-bold border ${
                                  ev.actor.badgeColor || 'bg-[#F4F6F5] text-[#565f6b] border-[#CDD4D0]'
                                }`}
                              >
                                {ev.actor.badge}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* 3. Action Summary */}
                        <div className="flex-1 px-4 min-w-0">
                          <div className="flex items-center gap-1.5 text-[12px] text-[#101d26] flex-wrap">
                            {ev.actionPill && (
                              <span
                                className={`px-1.5 py-0.2 rounded-[3px] font-mono text-[10px] font-bold border ${
                                  ev.actionPillColor || 'bg-[#F4F6F5] text-[#565f6b] border-[#CDD4D0]'
                                }`}
                              >
                                {ev.actionPill}
                              </span>
                            )}
                            <span className="leading-snug">{ev.summary}</span>
                          </div>
                        </div>

                        {/* 4. Target / IP */}
                        <div className="w-[180px] shrink-0 font-mono text-[11px] text-right pr-4">
                          <div className="text-[#101d26] font-medium">{ev.targetHost}</div>
                          <div className="text-[#565f6b] text-[10px]">{ev.ip}</div>
                        </div>

                        {/* 5. Chevron Details */}
                        <div className="w-8 shrink-0 text-right">
                          <button
                            type="button"
                            className="p-1 rounded hover:bg-[#E2E7E4] text-[#565f6b]"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Payload JSON Box */}
                      {isExpanded && ev.payload && (
                        <div className="px-5 pb-5 pt-1 bg-[#FAFBFB] border-t border-[#E2E7E4]">
                          <div className="rounded-[8px] bg-[#101820] border border-[#253241] overflow-hidden shadow-lg">
                            <div className="px-4 py-2 bg-[#1B2430] border-b border-[#253241] flex items-center justify-between text-[11px] font-mono text-slate-300">
                              <div className="flex items-center gap-2">
                                <Code2 className="w-3.5 h-3.5 text-[#85D3DA]" />
                                <span className="font-semibold text-slate-200">
                                  EVENT PAYLOAD METADATA
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleCopyJson(ev.payload, ev.id)
                                }}
                                className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                              >
                                {copiedId === ev.id ? (
                                  <Check className="w-3.5 h-3.5 text-[#97F4B6]" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                                <span>{copiedId === ev.id ? 'Copied' : 'Copy Raw JSON'}</span>
                              </button>
                            </div>

                            <pre className="p-4 font-mono text-[12px] leading-relaxed text-[#85D3DA] overflow-x-auto select-text">
                              {JSON.stringify(ev.payload, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              }))}
            </tbody>
          </table>
        </div>

        {/* 4. Table Pagination Footer */}
        <div className="px-5 py-3 border-t border-[#E2E7E4] bg-[#FAFBFB] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] font-mono text-[#565f6b]">
          <div className="flex items-center gap-4">
            <span>Showing {filteredEvents.length} events · Page {cursorHistory.length + 1}</span>
            {loading && <span className="text-[#005459] animate-pulse">Loading events...</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={cursorHistory.length === 0 || loading}
              onClick={handlePrevPage}
              className="px-2.5 py-1 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#101d26] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              &lt; Previous
            </button>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] text-[#005459] font-bold border border-[#BEDDF7]">
              Page {cursorHistory.length + 1}
            </span>
            <button
              type="button"
              disabled={!nextCursor || loading}
              onClick={handleNextPage}
              className="px-2.5 py-1 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#101d26] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
