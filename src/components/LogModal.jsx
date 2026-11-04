import { useState, useEffect, useMemo, useRef } from 'react'
import {
  X,
  Terminal,
  Copy,
  Check,
  ArrowDown,
  Loader2,
  RotateCcw,
  SlidersHorizontal,
  Search,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  PanelBottom,
  Download
} from 'lucide-react'
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
  onRetry = null,
  framework = 'react',
  initialDockMode = 'docked' // 'docked' | 'center' | 'minimized'
}) {
  const [dockMode, setDockMode] = useState(initialDockMode)
  const [copied, setCopied] = useState(false)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [finished, setFinished] = useState(false)
  const [selectedStage, setSelectedStage] = useState(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [filterMode, setFilterMode] = useState('clean') // 'clean' | 'all' | 'errors'
  const [searchQuery, setSearchQuery] = useState('')
  const terminalEndRef = useRef(null)

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

  // Sanitized & filtered logs
  const cleanedLogs = useMemo(() => {
    return logs
      .map((entry) => {
        let text = String(entry.line || entry.text || '')
        // Strip ANSI escape codes
        text = text.replace(/\u001b\[[0-9;]*[a-zA-Z]/g, '')
        text = text.replace(/\[\d+(?:;\d+)*m/g, '')

        let stream = entry.stream || 'STDOUT'

        // Reclassify harmless Git progress piped to stderr
        const isHarmlessGit =
          stream === 'STDERR' &&
          (text.includes('From https://') ||
            text.includes('* branch') ||
            text.includes('* [new branch]') ||
            text.includes('FETCH_HEAD') ||
            text.includes('origin/') ||
            text.includes('Cloning into') ||
            text.includes('POST git-upload-pack') ||
            text.includes('Receiving objects:') ||
            text.includes('Resolving deltas:') ||
            text.includes('Updating ') ||
            text.includes('Fast-forward'))

        if (isHarmlessGit) {
          stream = 'GIT'
        }

        // Hostinger SSH MOTD banner noise
        const isSshMotdNoise =
          text.includes('HHHH') ||
          text.includes('Welcome back! The time now is') ||
          text.includes('Server load:') ||
          text.includes('Link to hPanel:') ||
          text.includes('hpanel.hostinger.com') ||
          text.trim() === 'undefined'

        return {
          ...entry,
          clean: text,
          stream,
          isSshMotdNoise,
          isEmpty: !text.trim()
        }
      })
      .filter((item) => {
        if (filterMode === 'clean') {
          if (item.isEmpty) return false
          if (item.isSshMotdNoise) return false
        }
        if (filterMode === 'errors') {
          return item.stream === 'STDERR'
        }
        return true
      })
      .filter((item) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          item.clean.toLowerCase().includes(q) ||
          (item.stream && item.stream.toLowerCase().includes(q))
        )
      })
  }, [logs, filterMode, searchQuery])

  const trueErrorCount = useMemo(() => {
    return logs.filter((l) => {
      const line = String(l.line || '')
      const isHarmlessGit =
        line.includes('From https://') ||
        line.includes('* branch') ||
        line.includes('FETCH_HEAD')
      return l.stream === 'STDERR' && !isHarmlessGit
    }).length
  }, [logs])

  if (!isOpen) return null

  const handleCopy = () => {
    const text = cleanedLogs.length > 0
      ? cleanedLogs.map((l) => `[${l.at ? new Date(l.at).toLocaleTimeString() : 'LOG'}] [${l.stream || 'INFO'}] ${l.clean || l.line}`).join('\n')
      : `No log entries recorded for ${serviceName} on ${serverName}`
    navigator.clipboard?.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const text = cleanedLogs.map((l) => `[${l.at ? new Date(l.at).toLocaleTimeString() : 'LOG'}] [${l.stream || 'INFO'}] ${l.clean || l.line}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deploy-${deploymentId || 'stream'}.log`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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

  const s = String(status || '').toUpperCase()
  const isFailed = s === 'FAILED' || s === 'CANCELLED'
  const isRunning = s === 'RUNNING'
  const isSuccess = s === 'SUCCESS'

  const getStatusBadge = () => {
    if (isSuccess) {
      return (
        <span className="px-2 py-0.5 rounded-[4px] bg-emerald-950/80 text-emerald-400 text-[10px] uppercase font-bold border border-emerald-800">
          Success
        </span>
      )
    }
    if (isRunning) {
      return (
        <span className="px-2 py-0.5 rounded-[4px] bg-amber-950/80 text-amber-400 text-[10px] uppercase font-bold border border-amber-800 animate-pulse flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Running
        </span>
      )
    }
    if (isFailed) {
      return (
        <span className="px-2 py-0.5 rounded-[4px] bg-rose-950/80 text-rose-400 text-[10px] uppercase font-bold border border-rose-800">
          {s}
        </span>
      )
    }
    return (
      <span className="px-2 py-0.5 rounded-[4px] bg-slate-800 text-slate-400 text-[10px] uppercase font-bold border border-slate-700">
        {s || 'QUEUED'}
      </span>
    )
  }

  // 1. MINIMIZED FLOATING PILL STATE (Allows zero-distraction browsing while watching deploy)
  if (dockMode === 'minimized') {
    return (
      <aside aria-label="Deployment Status Bar" className="fixed bottom-4 right-6 z-50 pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-[10px] bg-[#0E151D] border border-slate-700/90 text-white shadow-2xl font-mono text-[12px] animate-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-amber-400 animate-ping' : isSuccess ? 'bg-emerald-400' : isFailed ? 'bg-rose-400' : 'bg-slate-400'}`} />
            <span className="font-semibold text-slate-200">{serviceName}</span>
            <span className="text-slate-500">•</span>
            {getStatusBadge()}
          </div>

          <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
            <button
              type="button"
              onClick={() => setDockMode('docked')}
              className="h-7 px-2.5 rounded-[5px] bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-sans font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Expand Docked Console"
            >
              <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
              <span>Console</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-[5px] hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>
    )
  }

  // 2. DOCKED OR MODAL WRAPPER
  const isDocked = dockMode === 'docked'

  return (
    <div
      className={
        isDocked
          ? 'fixed inset-x-0 bottom-0 z-50 pointer-events-none flex flex-col justify-end p-2 sm:p-4 select-none'
          : 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A0E14]/60 backdrop-blur-xs select-none'
      }
    >
      <div
        className={`w-full bg-[#0E151D] border border-[#24313E] overflow-hidden shadow-2xl flex flex-col font-mono text-[12px] pointer-events-auto transition-all duration-200 ${
          isDocked
            ? 'max-w-[1400px] mx-auto rounded-t-[12px] border-b-0 h-[440px] shadow-[0_-8px_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4'
            : 'max-w-[920px] rounded-[10px] max-h-[88vh] animate-in zoom-in-95'
        }`}
      >
        {/* Title Bar */}
        <div className="h-[46px] px-4 bg-[#141C26] border-b border-[#24313E] flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-2.5 truncate">
            <Terminal className="w-4 h-4 text-zinc-400 shrink-0" />
            <span className="font-semibold text-[13px] text-white tracking-tight truncate">{serviceName}</span>
            <span className="text-zinc-500">→</span>
            <span className="text-zinc-400 text-[11px] truncate">{serverName}</span>
            {commitSha && <span className="text-zinc-400 text-[11px] font-mono">({commitSha.slice(0, 7)})</span>}
            {getStatusBadge()}
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onRetry && isFailed && (
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="h-[26px] px-2.5 rounded-[5px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-[10.5px] uppercase font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                {isRetrying ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
                <span>Retry Run</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="h-[26px] px-2 rounded-[5px] bg-[#1A232E] hover:bg-[#253242] border border-[#2B3A4C] text-[#8F9CA7] hover:text-white text-[11px] font-sans font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title="Copy all logs"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="h-[26px] w-[26px] rounded-[5px] bg-[#1A232E] hover:bg-[#253242] border border-[#2B3A4C] text-[#8F9CA7] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Download raw log file"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Toggle Dock / Modal Mode */}
            <button
              type="button"
              onClick={() => setDockMode(isDocked ? 'center' : 'docked')}
              className="h-[26px] px-2 rounded-[5px] bg-[#1A232E] hover:bg-[#253242] border border-[#2B3A4C] text-[#8F9CA7] hover:text-white text-[11px] font-sans font-medium flex items-center gap-1 transition-colors cursor-pointer"
              title={isDocked ? 'Center as Modal' : 'Dock to Bottom'}
            >
              {isDocked ? <Maximize2 className="w-3.5 h-3.5" /> : <PanelBottom className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isDocked ? 'Center' : 'Dock'}</span>
            </button>

            {/* Minimize to Pill */}
            <button
              type="button"
              onClick={() => setDockMode('minimized')}
              className="w-7 h-7 rounded-[5px] text-[#8F9CA7] hover:text-white hover:bg-[#253242] flex items-center justify-center transition-colors cursor-pointer"
              title="Minimize console to status pill"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-[5px] text-[#8F9CA7] hover:text-rose-400 hover:bg-[#253242] flex items-center justify-center transition-colors cursor-pointer ml-1"
              title="Close log viewer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Pipeline Stage Stepper */}
        <div className="px-4 py-2.5 bg-[#101720] border-b border-[#24313E] shrink-0">
          <PipelineStepper
            status={status}
            logs={logs}
            framework={framework}
            activeStage={selectedStage}
            onStageClick={(stageId) => setSelectedStage(stageId === selectedStage ? null : stageId)}
            compact={true}
          />
        </div>

        {/* Filter View Selector Bar */}
        <div className="px-4 py-2 bg-[#121922] border-b border-[#24313E] flex flex-wrap items-center justify-between gap-2 text-[11px] shrink-0">
          <div className="flex items-center gap-1 p-0.5 bg-zinc-900 border border-zinc-800 rounded-[5px]">
            <button
              type="button"
              onClick={() => setFilterMode('clean')}
              className={`px-2.5 py-0.5 rounded-[4px] text-[10.5px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                filterMode === 'clean'
                  ? 'bg-zinc-700 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-2.5 h-2.5 text-zinc-300" />
              <span>Clean View</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-0.5 rounded-[4px] text-[10.5px] font-medium transition-colors cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-zinc-700 text-white font-semibold shadow-xs'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>All Raw ({logs.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('errors')}
              className={`px-2.5 py-0.5 rounded-[4px] text-[10.5px] font-medium transition-colors cursor-pointer ${
                filterMode === 'errors'
                  ? 'bg-red-900/80 text-white font-semibold shadow-xs border border-red-800'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>Errors {trueErrorCount > 0 ? `(${trueErrorCount})` : ''}</span>
            </button>
          </div>

          <div className="relative flex items-center">
            <Search className="w-3 h-3 text-zinc-500 absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search output..."
              className="h-[25px] pl-7 pr-2.5 w-[140px] focus:w-[190px] bg-zinc-900 border border-zinc-850 focus:border-zinc-700 rounded-[4px] text-[11px] text-zinc-200 outline-none transition-all placeholder:text-zinc-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 text-[#8F9CA7] hover:text-white cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Log Lines Container */}
        <div className="p-4 leading-[21px] text-[#D1D7DC] overflow-y-auto flex-1 space-y-0.5 terminal-scroll select-text font-mono text-[12px]">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-zinc-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Fetching streaming execution telemetry...</span>
            </div>
          ) : cleanedLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500 space-y-2">
              <Terminal className="w-8 h-8 opacity-40 text-zinc-500" />
              <div className="font-semibold text-zinc-400 text-[13px]">
                {searchQuery ? 'No log lines matched search query' : 'No execution output yet'}
              </div>
              <p className="text-[11px] max-w-sm text-zinc-500">
                {searchQuery
                  ? 'Try clearing the search query or switching to All Raw view.'
                  : 'Logs will stream automatically once runner processes commence.'}
              </p>
            </div>
          ) : (
            cleanedLogs.map((log, idx) => {
              const isStderr = log.stream === 'STDERR'
              const isGit = log.stream === 'GIT'
              const isSystem = log.stream === 'SYSTEM'

              return (
                <div key={log.seq || idx} className="flex items-start gap-2 hover:bg-zinc-900/60 px-1.5 py-0.5 rounded">
                  <span className="text-zinc-500 text-[11px] shrink-0 select-none">
                    {log.at ? new Date(log.at).toLocaleTimeString() : `#${idx + 1}`}
                  </span>
                  <span
                    className={`font-semibold text-[10px] px-1 rounded border shrink-0 select-none ${
                      isSystem
                        ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                        : isStderr
                        ? 'bg-red-950/80 text-red-300 border-red-800/60'
                        : isGit
                        ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                        : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                    }`}
                  >
                    {log.stream || 'STDOUT'}
                  </span>
                  <span
                    className={`flex-1 break-all whitespace-pre-wrap ${
                      isStderr
                        ? 'text-red-300'
                        : isGit
                        ? 'text-zinc-300'
                        : isSystem
                        ? 'text-white font-medium'
                        : 'text-zinc-300'
                    }`}
                  >
                    {log.clean || log.line}
                  </span>
                </div>
              )
            })
          )}

          {/* Running Cursor */}
          {!loading && !finished && isRunning && (
            <div className="flex items-center gap-2 text-zinc-400 pt-2">
              <span className="w-2 h-3.5 bg-zinc-400 animate-pulse inline-block" />
              <span className="text-zinc-500 italic">Connected to live execution socket...</span>
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Footer */}
        <div className="h-[32px] px-4 bg-[#111215] border-t border-[#24313E] flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
          <span>Run ID: <strong className="font-mono text-zinc-300">{deploymentId || 'N/A'}</strong></span>
          <span className="text-zinc-400 flex items-center gap-1">
            <ArrowDown className="w-3 h-3" /> {finished ? 'Execution completed' : 'Runner stream connected'}
          </span>
        </div>
      </div>
    </div>
  )
}
