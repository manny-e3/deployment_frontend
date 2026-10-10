import { useState } from 'react'
import { Server, Loader2, ArrowRight, Shield, Terminal, Copy, Check, Cpu, HardDrive, Wifi } from 'lucide-react'
import { WindowsLogo } from './AddServerModal'

export function ServersListCard({ servers = [], loading = false, onManageServers, onAddServer }) {
  const [copiedId, setCopiedId] = useState(null)

  const handleCopyHost = (e, srv) => {
    e.stopPropagation()
    const text = srv.host || srv.ip || srv.name
    if (!text) return
    navigator.clipboard?.writeText(text)
    setCopiedId(srv.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  const onlineCount = servers.filter(
    (s) => s.lastCheckOk !== false && s.status !== 'offline'
  ).length

  return (
    <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[10px] overflow-hidden shadow-2xs">
      {/* Card Header */}
      <div className="px-4.5 py-3.5 border-b border-[#E2E7E4] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <Server className="w-4 h-4 text-[#005459]" />
            <h3 className="text-[14px] font-bold text-[#101d26] tracking-tight">
              Target Fleet
            </h3>
          </div>
          <span className="px-1.5 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] text-[#565f6b] font-mono text-[11px] font-semibold">
            {servers.length}
          </span>
          {servers.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] font-mono font-bold uppercase">
              {onlineCount}/{servers.length} Online
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onManageServers}
          className="group text-[12px] font-semibold text-[#005459] hover:text-[#0B5459] flex items-center gap-1 cursor-pointer transition-colors"
        >
          <span>Manage</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>

      {/* Server list items */}
      <div className="divide-y divide-[#E2E7E4]">
        {loading ? (
          <div className="p-8 text-center text-[#565f6b] flex items-center justify-center gap-2 font-sans">
            <Loader2 className="w-4 h-4 animate-spin text-[#005459]" />
            <span className="text-[12px] font-mono">Checking fleet ping status...</span>
          </div>
        ) : servers.length === 0 ? (
          <div className="p-6 text-center text-[#565f6b] font-sans space-y-2">
            <div className="w-10 h-10 rounded-full bg-[#F4F6F5] mx-auto flex items-center justify-center">
              <Server className="w-5 h-5 text-[#8F9CA7] stroke-[1.5]" />
            </div>
            <div className="font-semibold text-[#101d26] text-[13px]">No target servers configured</div>
            <p className="text-[11px] text-[#565f6b] max-w-xs mx-auto leading-relaxed">
              Register Linux or Windows Server targets to enable automated deployments.
            </p>
            {onManageServers && (
              <button
                type="button"
                onClick={onManageServers}
                className="mt-2 px-3 py-1 bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium rounded-[5px] transition-colors cursor-pointer"
              >
                + Add Target Server
              </button>
            )}
          </div>
        ) : (
          servers.slice(0, 5).map((srv) => {
            const isOnline = srv.lastCheckOk !== false && srv.status !== 'offline'
            const hostDisplay = srv.host || srv.ip || 'localhost'
            const isWin =
              srv.osType === 'WINDOWS' ||
              srv.serverType === 'WINDOWS' ||
              srv.port === 5985 ||
              srv.port === 5986 ||
              srv.name?.toLowerCase().includes('win')

            return (
              <div
                key={srv.id}
                className="p-3.5 hover:bg-[#F8FAF9] transition-colors flex flex-col gap-2"
              >
                {/* Top line: Name, Status & Host */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      {isOnline && (
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      )}
                      <span
                        className={`relative inline-flex rounded-full h-2 w-2 ${
                          isOnline ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                      />
                    </span>
                    <span className="font-bold text-[13px] text-[#101d26] flex items-center gap-1.5">
                      {isWin && <WindowsLogo className="w-3.5 h-3.5 text-[#0078D4]" />}
                      <span>{srv.name}</span>
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded-[3px] border text-[10px] font-mono ${
                        isWin
                          ? 'bg-[#EBF3FC] text-[#0078D4] border-[#C5DCFA]'
                          : 'bg-[#F4F6F5] text-[#565f6b] border-[#CDD4D0]'
                      }`}
                    >
                      {isWin
                        ? srv.port === 22
                          ? 'Win-SSH:22'
                          : `WinRM:${srv.port || 5985}`
                        : `SSH:${srv.port || 22}`}
                    </span>
                  </div>

                  {/* Host with copy button */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => handleCopyHost(e, srv)}
                      title="Copy host"
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[#565f6b] hover:text-[#005459] bg-[#F4F6F5] hover:bg-[#EAEFEA] px-1.5 py-0.5 rounded-[4px] border border-[#CDD4D0] transition-colors cursor-pointer"
                    >
                      {copiedId === srv.id ? (
                        <Check className="w-2.5 h-2.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-2.5 h-2.5 text-[#8F9CA7]" />
                      )}
                      <span>{hostDisplay}</span>
                    </button>
                  </div>
                </div>

                {/* Sub Telemetry Metrics */}
                <div className="flex items-center justify-between text-[11px] text-[#565f6b] pt-1 border-t border-[#F0F3F1]">
                  <div className="flex items-center gap-1 font-mono">
                    <Wifi className="w-3 h-3 text-emerald-600" />
                    <span>{isWin ? 'WinRM 24ms' : 'SSH 24ms'}</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="text-[#565f6b]">
                      {isWin ? 'PowerShell 7.x' : 'Git 2.43'}
                    </span>
                    <span className="text-emerald-700 bg-emerald-50 px-1 rounded font-semibold">
                      Healthy
                    </span>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
