import { useState, useEffect } from 'react'
import { X, Terminal, Copy, Check, ArrowDown, Loader2, RotateCcw } from 'lucide-react'
import { api } from '../services/api'
import { PipelineStepper } from './PipelineStepper'

export function LogModal({
  isOpen,
  onClose,
  deploymentId,
  serviceName = 'api-gateway',
  serverName = 'prod-api-01',
  status = 'QUEUED',
  commitSha = null,
  onRetry = null
}) {
  const [copied, setCopied] = useState(false)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [selectedStage, setSelectedStage] = useState(null)
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    let cancelled = false
    const fetchLogs = async () => {
      if (!deploymentId) {
        setLogs([])
        return
      }

      setLoading(true)
      try {
        const res = await api(`/deployments/${deploymentId}/logs`, { query: { limit: 1000 } })
        if (!cancelled && res?.lines) {
          setLogs(res.lines)
          setFinished(!!res.finished)
        }
      } catch (err) {
        console.error('Failed to load deployment logs:', err)
        if (!cancelled) setLogs([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchLogs()
    return () => {
      cancelled = true
    }
  }, [isOpen, deploymentId])

  if (!isOpen) return null

  const handleCopy = () => {
    const text = logs.length > 0
      ? logs.map((l) => `[${l.at || 'LOG'}] [${l.stream || 'INFO'}] ${l.line}`).join('\n')
      : `No log entries recorded for ${serviceName} on ${serverName}`
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRetry = async () => {
    if (!onRetry) return
    setIsRetrying(true)
    try {
      await onRetry({ id: deploymentId, service: serviceName, server: serverName, commitSha })
    } finally {
      setIsRetrying(false)
    }
  }

  const getStatusBadge = () => {
    const s = String(status || '').toUpperCase()
    if (s === 'SUCCESS') {
      return <span className="px-2 py-0.5 rounded-[4px] bg-[#EAF5EE] text-[#2E8B57] text-[10px] uppercase font-bold border border-[#B8E0C5]">Success</span>
    }
    if (s === 'RUNNING') {
      return <span className="px-2 py-0.5 rounded-[4px] bg-[#FAF3E7] text-[#B87E0C] text-[10px] uppercase font-bold border border-[#F1D6A4] animate-pulse">Running</span>
    }
    if (s === 'FAILED' || s === 'CANCELLED') {
      return <span className="px-2 py-0.5 rounded-[4px] bg-[#FAEBE9] text-[#C2412D] text-[10px] uppercase font-bold border border-[#F1B5AC]">{s}</span>
    }
    return <span className="px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] text-[#565f6b] text-[10px] uppercase font-bold border border-[#CDD4D0]">{s || 'QUEUED'}</span>
  }

  const isFailed = String(status || '').toUpperCase() === 'FAILED' || String(status || '').toUpperCase() === 'CANCELLED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-[840px] bg-[#11161B] border border-[#24313E] rounded-[8px] overflow-hidden shadow-2xl flex flex-col font-mono text-[12px] animate-in fade-in zoom-in-95 duration-150">
        {/* Title Bar */}
        <div className="h-[44px] px-4 bg-[#17202A] border-b border-[#24313E] flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#85d3da]" />
            <span className="font-semibold text-[13px]">{serviceName}</span>
            <span className="text-[#8F9CA7]">→</span>
            <span className="text-[#8F9CA7] text-[11px]">{serverName}</span>
            {commitSha && <span className="text-[#85d3da] text-[11px]">({commitSha.slice(0, 7)})</span>}
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-2">
            {onRetry && isFailed && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="h-[24px] px-2 rounded-[4px] bg-[#005459] hover:bg-[#0B5459] text-white text-[10px] uppercase font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                {isRetrying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                <span>Retry Run</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCopy}
              className="h-[24px] px-2 rounded-[4px] bg-[#11161B] hover:bg-[#24313E] border border-[#24313E] text-[#8F9CA7] hover:text-white text-[10px] uppercase font-semibold flex items-center gap-1 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-[#2E8B57]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-6 h-6 rounded-[4px] text-[#8F9CA7] hover:text-white hover:bg-[#24313E] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Pipeline Stage Stepper */}
        <div className="p-3 bg-[#131A22] border-b border-[#24313E]">
          <PipelineStepper
            status={status}
            logs={logs}
            activeStage={selectedStage}
            onStageClick={(stageId) => setSelectedStage(stageId === selectedStage ? null : stageId)}
            compact={true}
          />
        </div>

        {/* Log Lines Container */}
        <div className="p-4 leading-[20px] text-[#D1D7DC] overflow-y-auto max-h-[380px] min-h-[220px] space-y-1 terminal-scroll select-text">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2 text-[#85d3da]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fetching deployment log stream...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#5E6B76] space-y-2">
              <Terminal className="w-8 h-8 opacity-40" />
              <div className="font-semibold text-[#8F9CA7] text-[13px]">No log output available</div>
              <p className="text-[11px] max-w-sm">
                Logs will appear here once the runner executes commands on target servers. Note that logs older than 90 days are automatically pruned.
              </p>
            </div>
          ) : (
            logs.map((log, idx) => (
              <div key={log.seq || idx} className="flex items-start gap-2 hover:bg-[#17202A]/40 px-1 py-0.5 rounded">
                <span className="text-[#5E6B76] text-[11px] shrink-0 select-none">
                  {log.at ? new Date(log.at).toLocaleTimeString() : `#${idx + 1}`}
                </span>
                <span
                  className={`font-semibold text-[10px] px-1 rounded border shrink-0 select-none ${
                    log.stream === 'SYSTEM'
                      ? 'bg-[#18343C] text-[#85d3da] border-[#225761]'
                      : log.stream === 'STDERR'
                      ? 'bg-[#2E1E1E] text-[#FFA899] border-[#4E2B2B]'
                      : 'bg-[#17202A] text-[#CDD4D0] border-[#24313E]'
                  }`}
                >
                  {log.stream || 'STDOUT'}
                </span>
                <span className="flex-1 break-all whitespace-pre-wrap">{log.line}</span>
              </div>
            ))
          )}

          {/* Running Cursor */}
          {!loading && !finished && status === 'RUNNING' && (
            <div className="flex items-center gap-2 text-[#85d3da] pt-2">
              <span className="w-2 h-3.5 bg-[#005459] animate-pulse inline-block" />
              <span className="text-[#8F9CA7] italic">Waiting for incoming log stream...</span>
            </div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="h-[32px] px-4 bg-[#131920] border-t border-[#24313E] flex items-center justify-between text-[11px] text-[#8F9CA7]">
          <span>Deployment ID: {deploymentId || 'N/A'}</span>
          <span className="text-[#85d3da] flex items-center gap-1">
            <ArrowDown className="w-3 h-3" /> {finished ? 'Execution completed' : 'Runner stream connected'}
          </span>
        </div>
      </div>
    </div>
  )
}

