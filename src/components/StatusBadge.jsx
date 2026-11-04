export function StatusBadge({ status, showPulse = true, size = 'sm' }) {
  const norm = String(status || 'queued').toLowerCase().trim()

  const isSuccess = ['success', 'ready', 'active', 'healthy', 'live'].includes(norm)
  const isRunning = ['running', 'in_progress', 'building', 'deploying', 'queued', 'pending'].includes(norm)
  const isFailed = ['failed', 'error', 'incident', 'unhealthy', 'crashed'].includes(norm)

  const sizeClasses = size === 'md' 
    ? 'h-[22px] px-2 text-[10.5px] gap-1.5 rounded-[4px]' 
    : 'h-[19px] px-1.5 text-[10px] gap-1.5 rounded-[3px]'

  if (isSuccess) {
    return (
      <span className={`inline-flex items-center font-mono font-medium tracking-wider uppercase select-none shrink-0 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shrink-0" />
        <span>{norm === 'active' || norm === 'live' ? 'LIVE' : norm === 'ready' ? 'READY' : 'SUCCESS'}</span>
      </span>
    )
  }

  if (isRunning) {
    return (
      <span className={`inline-flex items-center font-mono font-medium tracking-wider uppercase select-none shrink-0 bg-amber-50/60 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60 ${sizeClasses}`}>
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          {showPulse && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500" />
        </span>
        <span>{norm === 'queued' ? 'QUEUED' : norm === 'building' ? 'BUILDING' : 'IN PROGRESS'}</span>
      </span>
    )
  }

  if (isFailed) {
    return (
      <span className={`inline-flex items-center font-mono font-medium tracking-wider uppercase select-none shrink-0 bg-red-50/60 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200/60 dark:border-red-800/60 ${sizeClasses}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 shrink-0" />
        <span>FAILED</span>
      </span>
    )
  }

  // Fallback / Neutral (e.g. unbuilt, draft, paused)
  return (
    <span className={`inline-flex items-center font-mono font-medium tracking-wider uppercase select-none shrink-0 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 shrink-0" />
      <span>{norm.toUpperCase()}</span>
    </span>
  )
}
