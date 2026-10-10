import { useState, useEffect } from 'react'
import {
  Clock,
  Terminal,
  CheckCircle2,
  Play,
  Rocket,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
  Zap,
} from 'lucide-react'

export function RunningNowCard({
  activeDeploy,
  onViewLog,
  onQuickDeploy,
}) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0)

  useEffect(() => {
    if (!activeDeploy) {
      setElapsedSeconds(0)
      return
    }

    const startTime = activeDeploy.startedAt
      ? new Date(activeDeploy.startedAt).getTime()
      : Date.now()

    const interval = setInterval(() => {
      const now = Date.now()
      setElapsedSeconds(Math.max(0, Math.floor((now - startTime) / 1000)))
    }, 1000)

    return () => clearInterval(interval)
  }, [activeDeploy])

  if (!activeDeploy) {
    return (
      <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[10px] p-4.5 shadow-2xs space-y-3.5">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="font-bold text-[14px] text-[#101d26] tracking-tight">
              Pipeline Runners
            </h3>
          </div>

          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-mono font-bold uppercase tracking-wider">
            All Idle (2/2)
          </span>
        </div>

        {/* Worker Pool Visualization */}
        <div className="space-y-2 pt-0.5">
          <div className="bg-[#F8FAF9] border border-[#E2E7E4] rounded-[6px] p-2.5 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-[#101d26]">runner-worker-01</span>
            </div>
            <span className="text-[#565f6b]">Ready (Warm)</span>
          </div>

          <div className="bg-[#F8FAF9] border border-[#E2E7E4] rounded-[6px] p-2.5 flex items-center justify-between text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-medium text-[#101d26]">runner-worker-02</span>
            </div>
            <span className="text-[#565f6b]">Ready (Standby)</span>
          </div>
        </div>

        {/* Telemetry info */}
        <div className="text-[12px] text-[#565f6b] leading-relaxed pt-1 flex items-center justify-between border-t border-[#F0F3F1] font-mono text-[11px]">
          <span>Queue Latency: 0s</span>
          <span className="text-emerald-700">Docker Engine 24.x</span>
        </div>

        {/* Quick action button */}
        {onQuickDeploy && (
          <button
            type="button"
            onClick={onQuickDeploy}
            className="w-full h-[32px] rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[12px] font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs mt-1"
          >
            <Rocket className="w-3.5 h-3.5" />
            <span>Deploy Now</span>
          </button>
        )}
      </div>
    )
  }

  const service = activeDeploy.project || 'Project'
  const server = activeDeploy.server || 'Target'
  const status = activeDeploy.rawStatus || 'RUNNING'
  const branch = activeDeploy.branch || 'main'

  return (
    <div className="bg-[#FFFFFF] border-2 border-[#005459]/40 rounded-[10px] p-4.5 shadow-xs space-y-3.5 relative overflow-hidden">
      {/* Background glow banner */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#005459] via-emerald-500 to-[#005459] animate-pulse" />

      {/* Header */}
      <div className="flex items-center justify-between pt-0.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
          </span>
          <h3 className="font-bold text-[14px] text-[#101d26] tracking-tight">
            Pipeline Active
          </h3>
        </div>

        <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 text-[10px] font-mono font-bold uppercase tracking-wider animate-pulse">
          {status}
        </span>
      </div>

      {/* Target service and server */}
      <div className="bg-[#F8FAF9] border border-[#E2E7E4] rounded-[6px] p-3 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-[14px] text-[#101d26]">{service}</span>
          <span className="text-[11px] font-mono text-[#005459] bg-[#E2F0FD] px-1.5 py-0.5 rounded">
            {branch}
          </span>
        </div>
        <div className="text-[12px] text-[#565f6b] font-mono flex items-center gap-1.5">
          <span>Target host:</span>
          <span className="font-semibold text-[#101d26]">{server}</span>
        </div>
      </div>

      {/* Live progress track */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#565f6b]">Building and deploying artifacts...</span>
          <span className="font-bold text-[#005459]">{elapsedSeconds}s elapsed</span>
        </div>

        <div className="w-full bg-[#E2E7E4] rounded-full h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-[#005459] to-emerald-500 h-2 rounded-full w-3/4 animate-pulse" />
        </div>
      </div>

      {/* Footer bar */}
      <div className="pt-2 border-t border-[#E2E7E4] flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px] text-[#565f6b] font-mono">
          <Activity className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          <span>Worker streaming</span>
        </div>

        <button
          type="button"
          onClick={() => onViewLog && onViewLog(activeDeploy)}
          className="h-[28px] px-3 rounded-[5px] bg-[#005459] hover:bg-[#0B5459] text-white text-[11px] font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>View Live Logs</span>
        </button>
      </div>
    </div>
  )
}
