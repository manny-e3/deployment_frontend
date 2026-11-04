import { useState } from 'react'
import {
  FolderGit2,
  GitBranch,
  Globe,
  Rocket,
  RotateCcw,
  Check,
  Copy,
  ExternalLink,
  Terminal,
  Edit3,
  Loader2,
  CheckCircle2,
  Clock,
  User,
  ShieldCheck,
  Code2
} from 'lucide-react'
import { StatusBadge } from './StatusBadge'

export function ProjectHeroCard({
  project,
  projectId,
  servers = [],
  activeDeployment,
  deploying = false,
  autoDeploy = true,
  onToggleAutoDeploy,
  onDeploy,
  onOpenRollback,
  onOpenEdit,
  onJumpToConsole,
  canDeploy = true,
  canManage = true,
  canRollback = true,
  currentFramework = 'react',
}) {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedSha, setCopiedSha] = useState(false)

  const liveUrl = project?.url || ''
  const commitSha = activeDeployment?.commitSha || project?.lastCommit || 'HEAD'
  const commitMsg = activeDeployment?.commitMsg || project?.lastCommitMessage || 'Latest commit from repository'
  const branchName = project?.defaultBranch || project?.branch || 'main'
  const repoUrl = project?.repoUrl || project?.repo || ''
  const deployStatus = activeDeployment?.status || project?.status || 'READY'
  const duration = activeDeployment?.duration || 'Completed'
  const author = activeDeployment?.trigger || project?.author || 'Git Operator'

  const onlineTargets = servers.filter((s) => s.status === 'READY' || s.status === 'SUCCESS').length

  const handleCopyUrl = (e) => {
    e.stopPropagation()
    if (!liveUrl) return
    navigator.clipboard.writeText(liveUrl)
    setCopiedUrl(true)
    setTimeout(() => setCopiedUrl(false), 1800)
  }

  const handleCopySha = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(commitSha)
    setCopiedSha(true)
    setTimeout(() => setCopiedSha(false), 1500)
  }

  const formatFramework = (fw) => {
    switch (fw) {
      case 'react':
        return 'React SPA'
      case 'laravel':
        return 'Laravel / PHP'
      case 'node':
        return 'Node.js'
      default:
        return 'Custom / Static'
    }
  }

  return (
    <div className="bg-white border border-zinc-200/90 rounded-[8px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* 1. Header Bar: Service Title, Framework Tag & Primary Actions */}
      <div className="px-6 py-5 border-b border-zinc-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[20px] font-semibold text-zinc-950 tracking-tight">
              {project?.name || (projectId ? projectId.slice(0, 16) : 'Service')}
            </h1>

            {/* Framework Badge (No Emojis) */}
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[11px] font-mono font-medium bg-zinc-100 border border-zinc-200 text-zinc-700">
              <Code2 className="w-3 h-3 text-zinc-500" />
              <span>{formatFramework(currentFramework)}</span>
            </span>

            {/* Production State Badge */}
            <StatusBadge status={deployStatus} size="md" />
          </div>

          {/* Repo & Branch Metadata */}
          <div className="flex flex-wrap items-center gap-3 mt-2 text-[12px] text-zinc-500 font-mono">
            {repoUrl ? (
              <a
                href={repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-zinc-600 hover:text-zinc-900 transition-colors truncate max-w-[340px]"
                title={repoUrl}
              >
                <FolderGit2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">{repoUrl.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-2.5 h-2.5 opacity-50" />
              </a>
            ) : (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <FolderGit2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>No repository configured</span>
              </span>
            )}

            <span className="text-zinc-300">•</span>

            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-zinc-100 border border-zinc-200 text-zinc-700">
              <GitBranch className="w-3 h-3 text-zinc-400" />
              <span>{branchName}</span>
            </span>

            <span className="text-zinc-300">•</span>

            <div className="flex items-center gap-1.5 text-zinc-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{servers.length > 0 ? `${onlineTargets}/${servers.length} nodes ready` : 'No targets configured'}</span>
            </div>
          </div>
        </div>

        {/* Right Action Bar */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Auto-Deploy Toggle */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-[6px] bg-zinc-50 border border-zinc-200">
            <button
              type="button"
              onClick={onToggleAutoDeploy}
              className={`w-8 h-4.5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-150 ${
                autoDeploy ? 'bg-zinc-900' : 'bg-zinc-300'
              }`}
              title="Toggle automatic deployments on git push"
            >
              <div
                className={`bg-white w-3.5 h-3.5 rounded-full shadow-2xs transform transition-transform duration-150 ${
                  autoDeploy ? 'translate-x-3.5' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="text-[11px] font-medium text-zinc-700 leading-none">
              <div>Auto-deploy</div>
              <div className="text-[9px] font-mono font-semibold text-zinc-500 uppercase">
                {autoDeploy ? 'ON' : 'OFF'}
              </div>
            </div>
          </div>

          {/* Edit / Settings Button */}
          {canManage && (
            <button
              type="button"
              onClick={onOpenEdit}
              className="h-[32px] px-3 rounded-[5px] bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Edit project configuration"
            >
              <Edit3 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Settings</span>
            </button>
          )}

          {/* Rollback Button */}
          {canRollback && (
            <button
              type="button"
              onClick={onOpenRollback}
              className="h-[32px] px-3 rounded-[5px] bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Instantly roll back to previous deployment"
            >
              <RotateCcw className="w-3.5 h-3.5 text-zinc-500" />
              <span>Rollback</span>
            </button>
          )}

          {/* Primary Action: Deploy Targets (Crisp Monochromatic Black) */}
          {canDeploy && (
            <button
              type="button"
              disabled={deploying || servers.length === 0}
              onClick={() => onDeploy(null)}
              className="h-[32px] px-3.5 rounded-[5px] bg-zinc-900 hover:bg-zinc-800 active:bg-black text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {deploying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deploying...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Deploy Targets</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 2. Body: Production Domain & Commit Intelligence */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white">
        {/* Left Column (7 cols): Live Production URL & Status */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div>
            <div className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-500 mb-1.5">
              Production Domain
            </div>

            {liveUrl ? (
              <div className="flex items-center gap-2 p-2.5 rounded-[6px] bg-zinc-50 border border-zinc-200 group">
                <Globe className="w-4 h-4 text-zinc-500 shrink-0" />
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[13px] font-mono font-medium text-zinc-900 hover:underline truncate flex-1 flex items-center gap-1.5"
                >
                  <span className="truncate">{liveUrl}</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-600 shrink-0" />
                </a>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="h-6.5 px-2 rounded bg-white border border-zinc-200 hover:bg-zinc-100 text-[11px] font-mono text-zinc-600 flex items-center gap-1 transition-colors cursor-pointer"
                    title="Copy production URL"
                  >
                    {copiedUrl ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-zinc-400" />}
                    <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
                  </button>

                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-6.5 px-2.5 rounded bg-zinc-900 hover:bg-zinc-800 text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Visit</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-[6px] bg-zinc-50 border border-zinc-200 text-zinc-600 text-[12px] flex items-center justify-between">
                <span>No live domain configured. Set domain in settings to verify production URL.</span>
                {canManage && (
                  <button
                    type="button"
                    onClick={onOpenEdit}
                    className="text-[11px] font-medium text-zinc-900 underline hover:text-black cursor-pointer ml-3 shrink-0"
                  >
                    Set Domain
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Quick Telemetry Bar */}
          <div className="flex flex-wrap items-center gap-3 text-[11.5px] text-zinc-500 font-mono pt-2 border-t border-zinc-100">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Duration: <strong className="text-zinc-800 font-medium">{duration}</strong></span>
            </span>
            <span className="text-zinc-300">•</span>
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-zinc-400" />
              <span>Trigger: <strong className="text-zinc-800 font-medium">{author}</strong></span>
            </span>
            {onJumpToConsole && (
              <>
                <span className="text-zinc-300">•</span>
                <button
                  type="button"
                  onClick={onJumpToConsole}
                  className="flex items-center gap-1 text-zinc-700 hover:text-black font-medium cursor-pointer underline"
                >
                  <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Console</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Commit Intelligence Box */}
        <div className="lg:col-span-5 p-3.5 rounded-[6px] bg-zinc-50 border border-zinc-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10.5px] font-mono font-medium uppercase tracking-wider text-zinc-500">
                Active Release Commit
              </span>
              <button
                type="button"
                onClick={handleCopySha}
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-zinc-200 hover:bg-zinc-100 text-[10px] font-mono text-zinc-600 transition-colors cursor-pointer"
                title="Copy commit hash"
              >
                {copiedSha ? <Check className="w-2.5 h-2.5 text-emerald-600" /> : <Copy className="w-2.5 h-2.5 text-zinc-400" />}
                <span className="font-semibold">{commitSha.slice(0, 7)}</span>
              </button>
            </div>

            <p className="text-[12.5px] font-medium text-zinc-900 leading-snug line-clamp-2">
              {commitMsg}
            </p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-zinc-200/80 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>Branch: <strong className="text-zinc-800 font-medium">{branchName}</strong></span>
            <span className="text-emerald-700 font-medium flex items-center gap-1 text-[10.5px]">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              Verified
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
