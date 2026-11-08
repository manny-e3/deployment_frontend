import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X, Sparkles } from 'lucide-react'

export function TrialBanner() {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem('portalops_trial_banner_dismissed')
    if (dismissed === 'true') {
      setIsDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setIsDismissed(true)
    sessionStorage.setItem('portalops_trial_banner_dismissed', 'true')
  }

  if (isDismissed) return null

  return (
    <div className="w-full bg-[#FEE360] text-zinc-950 py-2 px-4 sm:px-6 flex items-center justify-between gap-3 text-xs sm:text-[13px] font-medium shadow-2xs select-none z-30 sticky top-0 transition-all">
      <div className="flex-1 flex items-center justify-center gap-1.5 text-center">
        <span>You are currently on a trial with <strong>5 days left</strong>, if you enjoy PortalOps make sure to</span>
        <Link
          to="/profile"
          className="underline font-bold hover:text-black transition-colors inline-flex items-center gap-1"
        >
          <span>upgrade</span>
          <span>🚀</span>
        </Link>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        className="p-1 text-zinc-800 hover:text-black rounded hover:bg-black/10 transition-colors cursor-pointer shrink-0"
        title="Dismiss banner"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

