import { useState, useEffect, useRef } from 'react'
import { Terminal, Copy, Check, ArrowDown, Search } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

export function TerminalViewer({ deployment }) {
  const [filterText, setFilterText] = useState('')
  const [selectedStage, setSelectedStage] = useState('all')
  const [autoScroll, setAutoScroll] = useState(true)
  const [copied, setCopied] = useState(false)
  const logContainerRef = useRef(null)

  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight
    }
  }, [deployment?.logs, autoScroll])

  if (!deployment) {
    return (
      <div className="bg-[#11161B] border border-[#24313E] rounded-[6px] p-6 text-center text-[#8F9CA7] font-mono text-[12px]">
        Select a deployment from the table above to view live runtime logs.
      </div>
    )
  }

  const stages = ['all', ...Array.from(new Set(deployment.logs.map((l) => l.stage)))]

  const filteredLogs = deployment.logs.filter((log) => {
    const matchesStage = selectedStage === 'all' || log.stage === selectedStage
    const matchesFilter =
      !filterText ||
      log.message.toLowerCase().includes(filterText.toLowerCase()) ||
      log.stage.toLowerCase().includes(filterText.toLowerCase())
    return matchesStage && matchesFilter
  })

  const handleCopyLogs = () => {
    const text = deployment.logs.map((l) => `[${l.timestamp}] [${l.stage.toUpperCase()}] ${l.message}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const renderLogLevel = (level) => {
    switch (level) {
      case 'error':
        return <span className="text-[#f1b5ac] font-semibold">[ERR]</span>
      case 'warn':
        return <span className="text-[#f1d6a4] font-semibold">[WRN]</span>
      case 'success':
        return <span className="text-[#7ed99e] font-semibold">[OK] </span>
      case 'stage':
        return <span className="text-[#85d3da] font-semibold">[STG]</span>
      case 'info':
      default:
        return <span className="text-[#8F9CA7]">[INF]</span>
    }
  }

  return (
    <div className="bg-[#11161B] border border-[#24313E] rounded-[6px] overflow-hidden flex flex-col font-mono select-text shadow-sm">
      {/* Terminal Titlebar */}
      <div className="h-[38px] px-3.5 bg-[#17202A] border-b border-[#24313E] flex items-center justify-between text-[12px] gap-2 select-none">
        <div className="flex items-center gap-2 overflow-hidden">
          <Terminal className="w-3.5 h-3.5 text-[#0F6E74] shrink-0" />
          <span className="text-white font-medium truncate">{deployment.service}</span>
          <span className="text-[#8F9CA7]">/</span>
          <span className="text-[#85d3da] text-[11px] truncate">{deployment.commitSha.slice(0, 7)}</span>
          <StatusBadge status={deployment.status} showPulse={deployment.status === 'running'} />
        </div>

        <div className="flex items-center gap-2">
          {/* Search within logs */}
          <div className="relative flex items-center">
            <Search className="w-3 h-3 text-[#8F9CA7] absolute left-2 pointer-events-none" />
            <input
              type="text"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              placeholder="Search log stream..."
              className="h-[24px] pl-6 pr-2 bg-[#11161B] border border-[#24313E] rounded-[4px] text-[11px] text-white placeholder-[#5E6B76] focus:outline-none focus:border-[#0F6E74] w-[140px] sm:w-[170px]"
            />
          </div>

          {/* Autoscroll switch */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`h-[24px] px-2 rounded-[4px] border text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer ${
              autoScroll
                ? 'bg-[#0F6E74]/20 border-[#0F6E74] text-[#85d3da]'
                : 'bg-[#11161B] border-[#24313E] text-[#8F9CA7] hover:text-white'
            }`}
          >
            <ArrowDown className={`w-3 h-3 ${autoScroll ? 'animate-bounce' : ''}`} />
            <span className="hidden sm:inline">Follow</span>
          </button>

          {/* Copy logs */}
          <button
            type="button"
            onClick={handleCopyLogs}
            className="h-[24px] px-2 rounded-[4px] bg-[#11161B] hover:bg-[#24313E] border border-[#24313E] text-[#8F9CA7] hover:text-white text-[10px] uppercase font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3 h-3 text-[#2E8B57]" /> : <Copy className="w-3 h-3" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Stage Tabs Bar */}
      <div className="h-[28px] px-3 bg-[#131920] border-b border-[#24313E] flex items-center gap-1 overflow-x-auto select-none">
        <span className="text-[10px] uppercase text-[#5E6B76] font-semibold mr-1 shrink-0">Stage:</span>
        {stages.map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() => setSelectedStage(stage)}
            className={`h-[20px] px-2 rounded-[3px] text-[10px] uppercase font-medium whitespace-nowrap transition-colors cursor-pointer ${
              selectedStage === stage
                ? 'bg-[#24313E] text-[#85d3da] font-semibold'
                : 'text-[#8F9CA7] hover:text-white hover:bg-[#17202A]'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Terminal Output Body */}
      <div
        ref={logContainerRef}
        className="p-3 text-[12px] leading-[18px] text-[#D1D7DC] overflow-y-auto max-h-[380px] min-h-[220px] terminal-scroll font-mono bg-[#11161B]"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-[#5E6B76] py-6 text-center text-[11px]">
            No matching log lines for query.
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className={`hover:bg-[#17202A]/60 py-0.5 px-1 rounded-[2px] flex items-start gap-2 ${
                log.level === 'error'
                  ? 'bg-[#C2412D]/10 text-[#f1b5ac]'
                  : log.level === 'stage'
                  ? 'text-[#85d3da] font-semibold border-l-2 border-l-[#0F6E74] pl-2'
                  : ''
              }`}
            >
              <span className="text-[#5E6B76] select-none shrink-0 text-[11px]">
                {log.timestamp}
              </span>
              <span className="shrink-0 text-[11px]">{renderLogLevel(log.level)}</span>
              <span className="text-[#8F9CA7] select-none shrink-0 text-[10px] uppercase font-semibold px-1 bg-[#17202A] rounded border border-[#24313E]">
                {log.stage}
              </span>
              <span className="break-all whitespace-pre-wrap flex-1">{log.message}</span>
            </div>
          ))
        )}

        {/* Blinking Prompt Cursor if running */}
        {deployment.status === 'running' && (
          <div className="flex items-center gap-2 mt-2 text-[#85d3da] text-[11px]">
            <span className="w-2 h-3.5 bg-[#0F6E74] animate-pulse inline-block" />
            <span className="text-[#8F9CA7] italic">Streaming stdout/stderr from runner pod...</span>
          </div>
        )}
      </div>

      {/* Terminal Footer Bar */}
      <div className="h-[26px] px-3 bg-[#131920] border-t border-[#24313E] flex items-center justify-between text-[10px] text-[#8F9CA7] select-none">
        <div className="flex items-center gap-3">
          <span>Exit code: {deployment.status === 'failed' ? '1' : '0'}</span>
          <span>•</span>
          <span>Lines: {filteredLogs.length}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#5E6B76]">
          <span>Runner: k8s-runner-us-east-1a-04</span>
        </div>
      </div>
    </div>
  )
}
