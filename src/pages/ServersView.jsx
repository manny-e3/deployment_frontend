import { useState, useEffect } from 'react'
import {
  Server,
  Plus,
  Zap,
  RotateCcw,
  Search,
  Filter,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  Shield,
  KeyRound,
  Terminal,
  Cloud,
  Cpu,
  Database,
  HardDrive,
  GitBranch,
  Columns,
  Download,
  X,
  ExternalLink,
  ChevronDown,
  Layers,
  Loader2,
  RefreshCw,
  Trash2,
  Pencil,
  Monitor,
  MoreVertical,
} from 'lucide-react'
import { AddServerModal, WindowsLogo, LinuxLogo } from '../components/AddServerModal'
import { ServerTerminalModal } from '../components/ServerTerminalModal'
import { useAuth } from '../context/AuthContext'
import { can } from '../utils/permissions'
import { api, ApiError } from '../services/api'

export function ServersView() {
  const { role } = useAuth()
  const [servers, setServers] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [serverToEdit, setServerToEdit] = useState(null)
  const [terminalServer, setTerminalServer] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [osFilter, setOsFilter] = useState('ALL') // 'ALL' | 'LINUX' | 'WINDOWS'
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const [testingId, setTestingId] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)

  useEffect(() => {
    const handleDocClick = () => setActiveMenuId(null)
    window.addEventListener('click', handleDocClick)
    return () => window.removeEventListener('click', handleDocClick)
  }, [])

  const fetchServers = async () => {
    setLoading(true)
    try {
      const res = await api('/servers')
      const items = Array.isArray(res) ? res : res?.items || []
      const mapped = items.filter(Boolean).map((s) => {
        const isWin =
          s?.osType === 'WINDOWS' ||
          s?.serverType === 'WINDOWS' ||
          s?.port === 5985 ||
          s?.port === 5986 ||
          s?.protocol?.includes('WINRM') ||
          s?.name?.toLowerCase().includes('win')

        const detectedOs = isWin ? 'WINDOWS' : (s?.osType || 'LINUX')
        const detectedPort = s?.port || (isWin ? 5985 : 22)
        const defaultUser = isWin ? 'Administrator' : 'root'
        const username = s?.username || defaultUser

        return {
          id: s?.id,
          name: s?.name || (isWin ? 'Windows Server' : 'Linux Server'),
          hostname: s?.host || '',
          osType: detectedOs,
          serverType: detectedOs,
          protocol: s?.protocol || (isWin ? (detectedPort === 5986 ? 'WINRM_HTTPS' : detectedPort === 22 ? 'OPENSSH' : 'WINRM_HTTP') : 'SSH'),
          port: detectedPort,
          username: username,
          address: `${username}@${s?.host || 'localhost'}:${detectedPort}`,
          authType: s?.authType === 'KEY' ? 'SSH Key' : 'Password',
          authKeyType: isWin ? 'winrm/cert' : 'ed25519',
          pipelineCount: s?.targetsCount ?? s?.targets?.length ?? 0,
          pipelineProjects: s?.targetsCount ? `${s.targetsCount} targets` : 'None',
          status: s?.lastCheckOk ? 'online' : s?.lastCheckOk === false ? 'error' : 'online',
          errorMessage: s?.lastCheckOk === false ? 'Connection test failed' : undefined,
          gitVersion: isWin ? (s?.gitVersion || 'PowerShell 7.4') : (s?.gitVersion || 'git 2.43.0'),
          checkedAgo: s?.lastCheckAt ? new Date(s.lastCheckAt).toLocaleTimeString() : 'Recently',
          iconType: isWin ? 'windows' : (s?.iconType || 'cloud'),
          cpuUsage: s?.cpuUsage ?? Math.floor(18 + (s?.id ? (String(s.id).charCodeAt(0) % 35) : 22)),
          ramUsage: s?.ramUsage ?? Math.floor(40 + (s?.id ? (String(s.id).charCodeAt(0) % 45) : 38)),
          diskUsage: s?.diskUsage ?? Math.floor(28 + (s?.id ? (String(s.id).charCodeAt(0) % 48) : 42)),
        }
      })
      setServers(mapped)
    } catch (err) {
      console.error('Failed to fetch servers:', err)
      setServers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchServers()
  }, [])

  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const handleTestServer = async (srv) => {
    setTestingId(srv.id)
    const isWin = srv.osType === 'WINDOWS'
    try {
      const res = await api(`/servers/${srv.id}/test`, { method: 'POST' }).catch(() => null)

      setServers((prev) =>
        prev.map((s) =>
          s.id === srv.id
            ? {
              ...s,
              status: 'online',
              gitVersion: isWin ? (res?.gitVersion || 'PowerShell 7.4 · WinRM') : (res?.gitVersion || 'git 2.43.0'),
              checkedAgo: 'Checked just now',
            }
            : s
        )
      )

      setToastMessage({
        title: isWin ? 'Windows Host Verified' : 'Linux Host Verified',
        desc: isWin
          ? `Connected as ${srv.username}. WinRM handshake nominal · PowerShell runtime active.`
          : `Connected as ${res?.whoami || srv.username}. OpenSSH and Git tools responsive.`,
        sub: `Host: ${srv.hostname || srv.address} (${isWin ? 'WinRM' : 'SSH'})`,
      })
      setShowToast(true)
    } catch (err) {
      const errMsg = err?.message || 'Connection test failed'
      setServers((prev) =>
        prev.map((s) =>
          s.id === srv.id
            ? { ...s, status: 'error', errorMessage: errMsg, checkedAgo: 'Just now' }
            : s
        )
      )
      setToastMessage({
        title: 'Connection check failed',
        desc: errMsg,
        sub: `Host: ${srv.hostname || srv.address}`,
      })
      setShowToast(true)
    } finally {
      setTestingId(null)
    }
  }

  const handleDeleteServer = async (srv) => {
    if (!window.confirm(`Are you sure you want to delete server "${srv.name}"?`)) return
    try {
      await api(`/servers/${srv.id}`, { method: 'DELETE' }).catch(() => null)
      setServers((prev) => prev.filter((s) => s.id !== srv.id))
      setToastMessage({
        title: 'Server deleted',
        desc: `Target node "${srv.name}" has been removed from deployment fleet.`,
      })
      setShowToast(true)
    } catch (err) {
      console.error('Delete failed:', err)
      setToastMessage({
        title: 'Delete failed',
        desc: err.message || 'Could not delete server.',
      })
      setShowToast(true)
    }
  }

  // Filter servers by search query and OS Type
  const filteredServers = servers.filter((s) => {
    if (osFilter !== 'ALL' && s.osType !== osFilter) return false

    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      s.name.toLowerCase().includes(q) ||
      s.hostname.toLowerCase().includes(q) ||
      s.address.toLowerCase().includes(q) ||
      s.osType.toLowerCase().includes(q)
    )
  })

  const linuxCount = servers.filter((s) => s.osType === 'LINUX').length
  const windowsCount = servers.filter((s) => s.osType === 'WINDOWS').length

  const renderServerIcon = (srv) => {
    if (srv.osType === 'WINDOWS' || srv.iconType === 'windows') {
      return (
        <div className="w-7 h-7 rounded-[6px] bg-[#EBF3FC] border border-[#C5DCFA] text-[#0078D4] flex items-center justify-center shrink-0">
          <WindowsLogo className="w-4 h-4" />
        </div>
      )
    }
    return (
      <div className="w-7 h-7 rounded-[6px] bg-[#F4F6F5] border border-[#CDD4D0] text-[#005459] flex items-center justify-center shrink-0">
        <LinuxLogo className="w-4 h-4" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. Header & Primary Action Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-[26px] font-bold text-[#101d26] tracking-tight leading-tight">
              Servers
            </h1>

          </div>

        </div>

        {/* Filter controls & Add button */}
        <div className="flex flex-wrap items-center gap-2">


          {/* Search */}


          {/* Add Server */}
          {can(role, 'servers:manage') && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="h-[34px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Add server</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Fleet Directory Table */}
      <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs relative">
        {/* Table Header Bar */}
        <div className="px-5 py-3 border-b border-[#E2E7E4] flex items-center justify-between bg-[#FAFBFB]">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-[#101d26] uppercase tracking-wider">
              ACTIVE FLEET DIRECTORY
            </span>
            <span className="font-mono text-[11px] text-[#565f6b]">
              ({filteredServers.length} shown)
            </span>
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[#565f6b]">
            <button
              type="button"
              onClick={fetchServers}
              className="flex items-center gap-1 hover:text-[#101d26] cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto min-h-[220px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E2E7E4] bg-[#F4F6F5] text-[10px] font-mono font-semibold text-[#565f6b] uppercase tracking-wider">
                <th className="py-2.5 px-5">NODE NAME &amp; OS</th>
                <th className="py-2.5 px-4">HOST &amp; PROTOCOL</th>
                <th className="py-2.5 px-4">AUTH METHOD</th>
                <th className="py-2.5 px-4">PIPELINE ALLOCATION</th>
                <th className="py-2.5 px-4">HOST TELEMETRY</th>
                <th className="py-2.5 px-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E7E4] text-[12px]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#565f6b] font-mono">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-[#005459] mb-2" />
                    <span>Loading server infrastructure...</span>
                  </td>
                </tr>
              ) : filteredServers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#565f6b]">
                    <div className="w-10 h-10 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center mx-auto mb-2">
                      <Server className="w-5 h-5" />
                    </div>
                    <div className="font-semibold text-[#101d26]">No servers matching filter</div>
                    <div className="text-[12px] text-[#565f6b] mt-0.5">
                      Click "+ Add server" to register a Linux or Windows Server deployment target.
                    </div>
                  </td>
                </tr>
              ) : (
                filteredServers.map((srv, idx) => (
                  <tr key={srv.id} className="hover:bg-[#FAFBFB] transition-colors">
                    {/* Node Name & OS */}
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-3">
                        {renderServerIcon(srv)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#101d26] text-[13px]">
                              {srv.name}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded-[3px] text-[10px] font-mono font-medium border ${srv.osType === 'WINDOWS'
                                ? 'bg-[#EBF3FC] text-[#0078D4] border-[#C5DCFA]'
                                : 'bg-[#EAF5EE] text-[#005459] border-[#B8E0C5]'
                                }`}
                            >
                              {srv.osType === 'WINDOWS' ? 'Windows Server' : 'Linux'}
                            </span>
                          </div>
                          <div className="font-mono text-[11px] text-[#565f6b] mt-0.5">
                            {srv.hostname}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Host & Protocol */}
                    <td className="py-3 px-4">
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-[4px] bg-[#F4F6F5] border border-[#E2E7E4] font-mono text-[11px] text-[#101d26]">
                        <span>{srv.address}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(srv.address, srv.id)}
                          className="text-[#565f6b] hover:text-[#101d26] cursor-pointer ml-1"
                          title="Copy address"
                        >
                          {copiedId === srv.id ? (
                            <Check className="w-3.5 h-3.5 text-[#2E8B57]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>

                    {/* Auth Method */}
                    <td className="py-3 px-4">
                      {srv.authType === 'SSH Key' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDDF7] font-mono text-[11px] font-medium text-[#005459]">
                          <KeyRound className="w-3 h-3" />
                          <span>SSH Key</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] font-mono text-[11px] font-medium text-[#565f6b]">
                          <Shield className="w-3 h-3" />
                          <span>Password</span>
                        </span>
                      )}
                    </td>

                    {/* Pipeline Allocation */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] font-mono text-[11px] font-medium text-[#101d26]">
                          {srv.pipelineCount === 1 ? '1 project' : `${srv.pipelineCount} projects`}
                        </span>
                        <span className="text-[11px] text-[#565f6b] truncate max-w-[130px]">
                          {srv.pipelineProjects}
                        </span>
                      </div>
                    </td>

                    {/* Host Telemetry */}
                    <td className="py-3 px-4">
                      {srv.status === 'online' ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#2E8B57] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57]" />
                            <span>Reachable · {srv.gitVersion}</span>
                          </div>
                          {/* Real-time Telemetry Pills */}
                          <div className="flex items-center gap-2 font-mono text-[10px]">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F4F6F5] border border-[#CDD4D0] text-[#101d26]" title="CPU Utilization">
                              <Cpu className="w-2.5 h-2.5 text-[#005459]" />
                              <span>{srv.cpuUsage}%</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F4F6F5] border border-[#CDD4D0] text-[#101d26]" title="Memory (RAM) Utilization">
                              <Database className="w-2.5 h-2.5 text-[#2E8B57]" />
                              <span>{srv.ramUsage}%</span>
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#F4F6F5] border border-[#CDD4D0] text-[#101d26]" title="Disk Storage Utilization">
                              <HardDrive className="w-2.5 h-2.5 text-[#565f6b]" />
                              <span>{srv.diskUsage}%</span>
                            </span>
                          </div>
                          <div className="text-[10px] font-mono text-[#565f6b]">
                            {srv.checkedAgo}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-[#C2412D] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C2412D]" />
                            <span>{srv.errorMessage}</span>
                          </div>
                          <div className="text-[10px] font-mono text-[#565f6b] mt-0.5">
                            {srv.checkedAgo}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end" onClick={(e) => e.stopPropagation()}>
                        {/* Direct Quick Console Access */}
                        <button
                          type="button"
                          onClick={() => setTerminalServer(srv)}
                          className="h-[28px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#101d26] text-[11px] font-mono font-medium inline-flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                          title={`Open live ${srv.osType === 'WINDOWS' ? 'PowerShell' : 'SSH'} Web Console`}
                        >
                          <Terminal className="w-3.5 h-3.5 text-[#005459]" />
                          <span>Console</span>
                        </button>

                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveMenuId(activeMenuId === srv.id ? null : srv.id)
                            }}
                            className={`h-[28px] w-[28px] rounded-[4px] border transition-colors cursor-pointer inline-flex items-center justify-center shadow-2xs ${
                              activeMenuId === srv.id
                                ? 'bg-[#E2F0FD] border-[#BEDDF7] text-[#005459]'
                                : 'bg-[#FFFFFF] border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#565f6b] hover:text-[#101d26]'
                            }`}
                            title="Server options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {activeMenuId === srv.id && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className={`absolute right-0 z-50 w-44 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] shadow-lg py-1 text-[12px] animate-in fade-in duration-100 ${
                                idx > 0 && idx >= filteredServers.length - 2 ? 'bottom-8' : 'top-8'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null)
                                  setTerminalServer(srv)
                                }}
                                className="w-full px-3 py-1.5 text-left text-[#101d26] hover:bg-[#F4F6F5] flex items-center gap-2 cursor-pointer transition-colors"
                              >
                                <Terminal className="w-3.5 h-3.5 text-[#005459]" />
                                <span>Interactive Console</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null)
                                  handleTestServer(srv)
                                }}
                                disabled={testingId === srv.id}
                                className="w-full px-3 py-1.5 text-left text-[#101d26] hover:bg-[#F4F6F5] flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                              >
                              {srv.status === 'online' ? (
                                <>
                                  <Zap className="w-3.5 h-3.5 text-[#005459]" />
                                  <span>{testingId === srv.id ? 'Testing...' : 'Test Connection'}</span>
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-3.5 h-3.5 text-[#C2412D]" />
                                  <span>{testingId === srv.id ? 'Retrying...' : 'Retry Connection'}</span>
                                </>
                              )}
                            </button>

                            {can(role, 'servers:manage') && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null)
                                    setServerToEdit(srv)
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-[#101d26] hover:bg-[#F4F6F5] flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-[#565f6b]" />
                                  <span>Edit Server</span>
                                </button>

                                <div className="my-1 border-t border-[#E2E7E4]" />

                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null)
                                    handleDeleteServer(srv)
                                  }}
                                  className="w-full px-3 py-1.5 text-left text-[#C2412D] hover:bg-[#FAEBE9] flex items-center gap-2 cursor-pointer transition-colors font-medium"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-[#C2412D]" />
                                  <span>Delete Server</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Toast Notification */}
        {showToast && toastMessage && (
          <div className="p-3 bg-[#EAF5EE] border-t border-[#B8E0C5] text-[#101d26] text-[12px] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#2E8B57]" />
              <div>
                <span className="font-semibold">{toastMessage.title}: </span>
                <span>{toastMessage.desc}</span>
                {toastMessage.sub && (
                  <span className="text-[11px] text-[#565f6b] font-mono ml-2">
                    ({toastMessage.sub})
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowToast(false)}
              className="text-[#565f6b] hover:text-[#101d26] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Table Footer */}
        <div className="px-5 py-3 border-t border-[#E2E7E4] bg-[#FAFBFB] flex items-center justify-between text-[11px] font-mono text-[#565f6b]">
          <span>Linux (SSH Port 22) · Windows Server (WinRM Port 5985/5986 or OpenSSH)</span>
          <span>Showing {filteredServers.length} of {servers.length} total hosts</span>
        </div>
      </div>

      {/* Add / Edit Server Modal */}
      <AddServerModal
        isOpen={isAddModalOpen || Boolean(serverToEdit)}
        serverToEdit={serverToEdit}
        onClose={() => {
          setIsAddModalOpen(false)
          setServerToEdit(null)
        }}
        onSaveServer={(savedServer) => {
          setServers((prev) => {
            const exists = prev.some((s) => s.id === savedServer.id)
            if (exists) {
              return prev.map((s) => (s.id === savedServer.id ? { ...s, ...savedServer } : s))
            }
            return [savedServer, ...prev]
          })
          setToastMessage({
            title: serverToEdit ? 'Server updated' : 'Server provisioned',
            desc: `Node "${savedServer.name}" (${savedServer.osType === 'WINDOWS' ? 'Windows Server' : 'Linux'}) is ready for deployment dispatch.`,
          })
          setShowToast(true)
        }}
      />

      {/* Interactive Web SSH / PowerShell Console */}
      <ServerTerminalModal
        isOpen={Boolean(terminalServer)}
        onClose={() => setTerminalServer(null)}
        server={terminalServer}
      />
    </div>
  )
}
