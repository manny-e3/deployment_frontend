import React, { useState } from 'react'
import {
  Server,
  Code2,
  Database,
  GitBranch,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react'
import { analyzeDeploymentError } from '../utils/logDiagnostics'

export function DeploymentDiagnostics({ logs = [], exitCode = null, className = '' }) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [copied, setCopied] = useState(false)

  const diagnostic = analyzeDeploymentError(logs, exitCode)
  if (!diagnostic) return null

  const isServer = diagnostic.origin === 'server'
  const isProject = diagnostic.origin === 'project'
  const isDatabase = diagnostic.origin === 'database'

  const handleCopyError = () => {
    if (diagnostic.highlightedLine) {
      navigator.clipboard?.writeText(diagnostic.highlightedLine)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Visual styling based on source origin
  const containerBorder = isServer
    ? 'border-[#F1D6A4] dark:border-[#B87E0C]/40 bg-[#FFFDF7] dark:bg-[#1A150D]'
    : isProject
      ? 'border-[#BEDDF7] dark:border-[#005459]/40 bg-[#F7FAFD] dark:bg-[#0A161D]'
      : 'border-[#F1B5AC] dark:border-[#C2412D]/40 bg-[#FFF9F8] dark:bg-[#1C1010]'

  const headerBg = isServer
    ? 'bg-[#FAF3E7] dark:bg-[#2A2012] text-[#B87E0C] dark:text-[#E5B558]'
    : isProject
      ? 'bg-[#E2F0FD] dark:bg-[#0D2431] text-[#005459] dark:text-[#4FB7C1]'
      : 'bg-[#FAEBE9] dark:bg-[#2E1414] text-[#C2412D] dark:text-[#E87363]'

  const IconComponent =
    diagnostic.iconType === 'server'
      ? Server
      : diagnostic.iconType === 'code'
        ? Code2
        : diagnostic.iconType === 'database'
          ? Database
          : diagnostic.iconType === 'git'
            ? GitBranch
            : AlertTriangle

  return (
    <div
      className={`rounded-lg border shadow-xs transition-all overflow-hidden mb-3 ${containerBorder} ${className}`}
    >
      {/* Top Header Banner */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-3 border-b border-inherit">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-md shrink-0 ${headerBg}`}>
            <IconComponent className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${diagnostic.badgeColor}`}
            >
              {diagnostic.badge}
            </span>
            <h4 className="text-[13px] font-bold text-zinc-900 dark:text-white truncate">
              {diagnostic.title}
            </h4>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors p-1 cursor-pointer"
          title={isExpanded ? 'Collapse diagnostic details' : 'Expand diagnostic details'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content Body */}
      {isExpanded && (
        <div className="p-4 space-y-3 text-[12px] leading-relaxed">
          {/* Plain-English Root Cause Explanation */}
          <div>
            <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">
              Diagnosis
            </div>
            <p className="text-zinc-800 dark:text-zinc-200">{diagnostic.summary}</p>
          </div>

          {/* Highlighted Log Line Snippet (if extracted) */}
          {diagnostic.highlightedLine && (
            <div className="rounded-md bg-zinc-950 dark:bg-black border border-zinc-800 p-2.5 font-mono text-[11px] text-red-400 relative group flex items-start justify-between gap-2">
              <span className="break-all whitespace-pre-wrap select-all font-semibold">
                {diagnostic.highlightedLine}
              </span>
              <button
                type="button"
                onClick={handleCopyError}
                className="shrink-0 p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
                title="Copy error line"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}

          {/* Actionable Recommended Resolution */}
          <div className="pt-2 border-t border-inherit flex items-start gap-2.5 text-zinc-700 dark:text-zinc-300">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-zinc-900 dark:text-white mr-1.5">
                Suggested Fix:
              </span>
              <span>{diagnostic.suggestedFix}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

