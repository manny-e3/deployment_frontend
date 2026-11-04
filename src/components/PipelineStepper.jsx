import { useState, useMemo } from 'react'
import {
  GitBranch,
  KeyRound,
  Hammer,
  PlayCircle,
  FolderSync,
  Zap,
  Activity,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  ChevronRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

export const PIPELINE_STAGES = [
  { id: 'checkout', label: 'Git Checkout', icon: GitBranch, shortDesc: 'Clone & branch verify' },
  { id: 'env', label: 'Environment', icon: KeyRound, shortDesc: 'Inject target .env' },
  { id: 'build', label: 'Build & Compile', icon: Hammer, shortDesc: 'Run package build' },
  { id: 'pre_deploy', label: 'Pre-Deploy Hook', icon: PlayCircle, shortDesc: 'Pre-flight & migrations' },
  { id: 'sync', label: 'Artifact Sync', icon: FolderSync, shortDesc: 'Transfer to target dir' },
  { id: 'post_deploy', label: 'Post-Deploy Hook', icon: Zap, shortDesc: 'Restart & clear cache' },
  { id: 'health', label: 'Health Check', icon: Activity, shortDesc: 'Endpoint HTTP 200 probe' },
]

export function PipelineStepper({
  status = 'RUNNING', // QUEUED | RUNNING | SUCCESS | FAILED | CANCELLED
  logs = [],
  activeStage = null,
  onStageClick = null,
  compact = false,
  strategy = 'standard',
  canaryPercent = 10,
  framework = 'react'
}) {
  const normalizedStatus = String(status || 'QUEUED').toUpperCase()
  const isCanaryActive = strategy === 'canary' || logs.some((l) => (l.line || l.text || '').toLowerCase().includes('canary'))
  const [isCompact, setIsCompact] = useState(compact || normalizedStatus === 'SUCCESS')

  // Filter applicable stages based on framework (omit database pre-deploy migrations for React SPA)
  const activeStages = useMemo(() => {
    if (framework === 'react' || framework === 'custom') {
      return [
        { id: 'checkout', label: 'Git Checkout', icon: GitBranch, shortDesc: 'Clone & branch verify' },
        { id: 'env', label: 'Environment', icon: KeyRound, shortDesc: 'Inject target .env' },
        { id: 'build', label: 'Build & Compile', icon: Hammer, shortDesc: 'Vite / React build' },
        { id: 'sync', label: 'Artifact Sync', icon: FolderSync, shortDesc: 'Transfer dist to web root' },
        { id: 'post_deploy', label: 'Post-Deploy', icon: Zap, shortDesc: 'Clean stale cache' },
        { id: 'health', label: 'Health Check', icon: Activity, shortDesc: 'Endpoint HTTP 200 probe' },
      ]
    }
    return PIPELINE_STAGES
  }, [framework])

  // Heuristically calculate the current stage index based on logs & status
  const currentStageIndex = useMemo(() => {
    if (normalizedStatus === 'SUCCESS') return activeStages.length - 1
    if (normalizedStatus === 'QUEUED') return 0

    // Analyze log lines from most recent backwards
    const logTexts = logs.map((l) => (l.line || l.text || l.message || '').toLowerCase())
    const fullText = logTexts.join(' ')

    if (fullText.includes('health') || fullText.includes('probe') || fullText.includes('200 ok')) {
      return activeStages.length - 1
    }
    if (fullText.includes('post-deploy') || fullText.includes('pm2') || fullText.includes('cache:clear') || fullText.includes('restart')) {
      return activeStages.findIndex((s) => s.id === 'post_deploy') !== -1 ? activeStages.findIndex((s) => s.id === 'post_deploy') : 3
    }
    if (fullText.includes('rsync') || fullText.includes('sync') || fullText.includes('transferring') || fullText.includes('copying') || fullText.includes('dist/*')) {
      return activeStages.findIndex((s) => s.id === 'sync') !== -1 ? activeStages.findIndex((s) => s.id === 'sync') : 2
    }
    if (fullText.includes('build') || fullText.includes('vite') || fullText.includes('npm run') || fullText.includes('composer install') || fullText.includes('installing dependencies') || fullText.includes('compiling')) {
      return activeStages.findIndex((s) => s.id === 'build') !== -1 ? activeStages.findIndex((s) => s.id === 'build') : 2
    }
    if (fullText.includes('env') || fullText.includes('.env') || fullText.includes('secret')) {
      return 1
    }
    return 0
  }, [logs, normalizedStatus, activeStages])

  return (
    <div className="bg-[#17202A] border border-[#24313E] rounded-[8px] p-3 text-white shadow-xs">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#24313E]/80 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[#8F9CA7] uppercase font-bold tracking-wider">PIPELINE EXECUTION</span>
          <span className="text-[#3B4C5C]">|</span>
          <span className="text-[#85d3da]">
            {normalizedStatus === 'SUCCESS' ? `All ${activeStages.length} stages passed` : `Stage ${currentStageIndex + 1} of ${activeStages.length}`}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {normalizedStatus === 'RUNNING' && (
            <span className="flex items-center gap-1.5 text-[#F1D6A4] font-semibold animate-pulse">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Pipeline active</span>
            </span>
          )}
          {normalizedStatus === 'SUCCESS' && (
            <span className="flex items-center gap-1 text-[#7ED99E] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B57]" />
              <span>Verified nominal</span>
            </span>
          )}
          {normalizedStatus === 'FAILED' && (
            <span className="flex items-center gap-1 text-[#F1B5AC] font-semibold">
              <XCircle className="w-3.5 h-3.5 text-[#C2412D]" />
              <span>Failed at stage {currentStageIndex + 1}</span>
            </span>
          )}

          {/* Toggle compact / detailed view */}
          <button
            type="button"
            onClick={() => setIsCompact(!isCompact)}
            className="h-[22px] px-2 rounded bg-[#1F2A37] hover:bg-[#2A3749] border border-[#374151] text-[#9CA3AF] hover:text-white text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer select-none"
            title={isCompact ? 'Expand to show all stage cards' : 'Switch to sleek compact stage bar'}
          >
            {isCompact ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            <span>{isCompact ? 'Details ▾' : 'Compact ▴'}</span>
          </button>
        </div>
      </div>

      {/* COMPACT MODE: Sleek 1-line connected pill stepper */}
      {isCompact ? (
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 select-none">
          {activeStages.map((stg, idx) => {
            const Icon = stg.icon
            const isDone =
              normalizedStatus === 'SUCCESS' ||
              (normalizedStatus !== 'QUEUED' && idx < currentStageIndex)
            const isCurrent =
              (normalizedStatus === 'RUNNING' || normalizedStatus === 'FAILED') &&
              idx === currentStageIndex
            const isFailed = normalizedStatus === 'FAILED' && isCurrent
            const isSelected = activeStage === stg.id

            return (
              <div key={stg.id} className="flex items-center gap-1.5 shrink-0">
                <div
                  onClick={() => onStageClick && onStageClick(stg.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    isSelected
                      ? 'ring-1 ring-[#85D3DA] bg-[#1E293B] text-white'
                      : isFailed
                      ? 'bg-[#3A1E1E] border-[#C2412D]/60 text-[#F1B5AC]'
                      : isCurrent
                      ? 'bg-[#1F2C39] border-[#005459] text-white animate-pulse'
                      : isDone
                      ? 'bg-[#1B272E] border-[#2E8B57]/40 text-[#7ED99E]'
                      : 'bg-[#141B22] border-[#24313E]/50 text-[#8F9CA7] opacity-60'
                  } ${onStageClick ? 'cursor-pointer hover:border-[#85D3DA]' : ''}`}
                  title={`${stg.label} - ${stg.shortDesc}`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{stg.label}</span>
                  {isDone && <CheckCircle2 className="w-3 h-3 text-[#2E8B57]" />}
                  {isFailed && <XCircle className="w-3 h-3 text-[#C2412D]" />}
                  {isCurrent && <Loader2 className="w-3 h-3 text-[#85D3DA] animate-spin" />}
                </div>
                {idx < activeStages.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-[#3B4C5C] shrink-0" />
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* DETAILED MODE: Grid of cards */
        <div className={`grid gap-2 select-none ${activeStages.length === 6 ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6' : 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-7'}`}>
          {activeStages.map((stg, idx) => {
            const Icon = stg.icon
            const isDone =
              normalizedStatus === 'SUCCESS' ||
              (normalizedStatus !== 'QUEUED' && idx < currentStageIndex)

            const isCurrent =
              (normalizedStatus === 'RUNNING' || normalizedStatus === 'FAILED') &&
              idx === currentStageIndex

            const isFailed = normalizedStatus === 'FAILED' && isCurrent
            const isPending = !isDone && !isCurrent
            const isSelected = activeStage === stg.id

            return (
              <div
                key={stg.id}
                onClick={() => onStageClick && onStageClick(stg.id)}
                className={`relative rounded-[6px] p-2 flex flex-col justify-between transition-all select-none ${
                  onStageClick ? 'cursor-pointer hover:bg-[#202D3A]' : ''
                } ${
                  isSelected
                    ? 'ring-1 ring-[#005459] bg-[#1E293B]'
                    : isCurrent
                    ? isFailed
                      ? 'bg-[#3A1E1E] border border-[#C2412D]/60'
                      : 'bg-[#1F2C39] border border-[#005459]/80'
                    : isDone
                    ? 'bg-[#1B272E] border border-[#234B3C]/50'
                    : 'bg-[#141B22] border border-[#24313E]/50 opacity-60'
                }`}
              >
                {/* Top Row: Icon + Status Mark */}
                <div className="flex items-center justify-between mb-1">
                  <div
                    className={`w-6 h-6 rounded-[4px] flex items-center justify-center ${
                      isDone
                        ? 'bg-[#2E8B57]/20 text-[#7ED99E]'
                        : isFailed
                        ? 'bg-[#C2412D]/20 text-[#F1B5AC]'
                        : isCurrent
                        ? 'bg-[#005459] text-white'
                        : 'bg-[#24313E] text-[#8F9CA7]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  <div>
                    {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B57]" />}
                    {isFailed && <XCircle className="w-3.5 h-3.5 text-[#C2412D]" />}
                    {isCurrent && !isFailed && (
                      <Loader2 className="w-3.5 h-3.5 text-[#85d3da] animate-spin" />
                    )}
                    {isPending && <Clock className="w-3 h-3 text-[#565f6b]" />}
                  </div>
                </div>

                {/* Label & Description */}
                <div>
                  <div className="text-[11px] font-semibold tracking-tight text-white truncate">
                    {stg.label}
                  </div>
                  <div className="text-[9px] font-mono text-[#8F9CA7] truncate mt-0.5">
                    {stg.shortDesc}
                  </div>
                </div>

                {/* Bottom Progress Bar indicator */}
                <div className="mt-1.5 w-full bg-[#24313E] h-1 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      isDone
                        ? 'w-full bg-[#2E8B57]'
                        : isFailed
                        ? 'w-full bg-[#C2412D]'
                        : isCurrent
                        ? 'w-3/4 bg-[#005459] animate-pulse'
                        : 'w-0'
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Optional Automated Canary Analysis (ACA) Status Bar */}
      {isCanaryActive && (
        <div className="mt-2.5 pt-2 border-t border-[#24313E] flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-[#85d3da]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-bold text-amber-300">AUTOMATED CANARY ANALYSIS (ACA)</span>
            <span className="text-[#8F9CA7]">• Traffic Slice: {canaryPercent}%</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[#A0AEC0]">
            <span>Threshold: &lt; 1.0% HTTP 5xx</span>
            <span className="text-emerald-400 font-semibold">Auto-Rollback: ARMED</span>
          </div>
        </div>
      )}
    </div>
  )
}
