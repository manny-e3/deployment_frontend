import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  CheckCircle2,
  X,
  ExternalLink,
  Plus,
  Shield,
  KeyRound,
  Server,
  Sparkles,
  ChevronDown,
  ChevronUp,
  RotateCcw
} from 'lucide-react'
import { AddServerProviderModal } from './AddServerProviderModal'

export function OnboardingChecklistCard({ serversCount = 0, onOpenAddServer }) {
  const navigate = useNavigate()

  // Persistent completion states for steps 1, 2, 4, 5 (Step 3 is tied to serversCount)
  const [completedSteps, setCompletedSteps] = useState(() => {
    try {
      const saved = localStorage.getItem('portalops_onboarding_completed_steps')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  // Collapsed or Skipped state
  const [isSkipped, setIsSkipped] = useState(() => {
    return localStorage.getItem('portalops_onboarding_skipped') === 'true'
  })

  // Modals state for in-place actions
  const [activeModal, setActiveModal] = useState(null) // 'git' | 'provider' | 'upgrade' | null

  // If user has at least 1 server, Step 3 is automatically considered completed
  const isStep3Completed = serversCount > 0 || Boolean(completedSteps[3])

  const steps = [
    {
      id: 1,
      title: 'Add a Git provider',
      badge: 'Optional but recommended',
      desc: 'Add a Git provider to easily clone your repositories, we offer the ability to link GitHub, Bitbucket, GitLab & Forgejo.',
      actionLabel: 'Link Git provider',
      isCompleted: Boolean(completedSteps[1]),
      onAction: () => setActiveModal('git')
    },
    {
      id: 2,
      title: 'Add a server provider',
      badge: 'Optional but recommended',
      desc: 'You can add a server provider to easily create your servers, this makes creating your server a breeze.',
      actionLabel: 'Link server provider',
      isCompleted: Boolean(completedSteps[2]),
      onAction: () => setActiveModal('provider')
    },
    {
      id: 3,
      title: 'Create your first server',
      badge: null,
      desc: 'Now it\'s time for the fun stuff: creating your first server. If you want to use another server provider that we do not provide, you can select "Custom server".',
      actionLabel: 'Create server',
      isCompleted: isStep3Completed,
      onAction: () => {
        if (onOpenAddServer) {
          onOpenAddServer()
        } else {
          navigate('/servers/create')
        }
      }
    },
    {
      id: 4,
      title: 'Upgrade your plan',
      badge: null,
      desc: 'Upgrade your plan to lift restrictions and enjoy the most out of managing your services.',
      actionLabel: 'Upgrade plan',
      isCompleted: Boolean(completedSteps[4]),
      onAction: () => setActiveModal('upgrade')
    },
    {
      id: 5,
      title: 'Enable 2FA',
      badge: 'Optional but recommended',
      desc: 'Enabling 2FA increases the security of your account, you can easily enable this in your profile under the security tab.',
      actionLabel: 'Enable 2FA',
      isCompleted: Boolean(completedSteps[5]),
      onAction: () => navigate('/profile')
    }
  ]

  const completedCount = steps.filter((s) => s.isCompleted).length

  const handleToggleStep = (stepId, e) => {
    e.stopPropagation()
    const next = { ...completedSteps, [stepId]: !completedSteps[stepId] }
    setCompletedSteps(next)
    localStorage.setItem('portalops_onboarding_completed_steps', JSON.stringify(next))
  }

  const handleSkip = () => {
    setIsSkipped(true)
    localStorage.setItem('portalops_onboarding_skipped', 'true')
  }

  const handleRestore = () => {
    setIsSkipped(false)
    localStorage.setItem('portalops_onboarding_skipped', 'false')
  }

  // If user skipped it, show a subtle collapsible pill
  if (isSkipped) {
    return (
      <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0D1219] shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="text-base">🚀</span>
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
            Onboarding Checklist ({completedCount}/5 completed)
          </span>
        </div>
        <button
          type="button"
          onClick={handleRestore}
          className="text-xs text-[#005459] dark:text-teal-400 font-semibold hover:underline cursor-pointer flex items-center gap-1"
        >
          <span>Resume Guide »</span>
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 sm:p-6 shadow-xs select-none transition-colors">
        {/* Card Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <span className="text-base leading-none">🚀</span>
            <h2 className="font-bold text-[15px] sm:text-[16px] text-zinc-900 dark:text-white tracking-tight">
              Finish up your account ({completedCount}/5)
            </h2>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="text-xs text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-medium transition-colors cursor-pointer"
          >
            Skip &raquo;
          </button>
        </div>

        {/* 5 Sequential Onboarding Steps */}
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
          {steps.map((step) => (
            <div
              key={step.id}
              className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              {/* Left Item Details */}
              <div className="flex items-start gap-3.5">
                {/* Step Number or Green Checkmark */}
                <button
                  type="button"
                  onClick={(e) => handleToggleStep(step.id, e)}
                  title={step.isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono font-bold transition-all cursor-pointer ${
                    step.isCompleted
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-[#005459]'
                  }`}
                >
                  {step.isCompleted ? <Check className="w-4 h-4 stroke-[2.5]" /> : step.id}
                </button>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-bold text-[13.5px] ${
                        step.isCompleted
                          ? 'text-zinc-400 dark:text-zinc-500 line-through'
                          : 'text-zinc-900 dark:text-zinc-100'
                      }`}
                    >
                      {step.title}
                    </span>

                    {step.badge && (
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-normal">
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed max-w-2xl">
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Right Action Button */}
              <div className="sm:self-center shrink-0 pl-10 sm:pl-0">
                {step.isCompleted ? (
                  <button
                    type="button"
                    onClick={(e) => handleToggleStep(step.id, e)}
                    className="h-8.5 px-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Completed</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={step.onAction}
                    className="h-8.5 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer shadow-2xs hover:border-[#005459] dark:hover:border-teal-400"
                  >
                    {step.actionLabel}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Link Git Provider */}
      {activeModal === 'git' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#10141D] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Link Git Provider
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Connect your Git account to enable automatic webhook deployments on every git push.
            </p>

            <div className="space-y-2 pt-2">
              {['GitHub', 'GitLab', 'Bitbucket', 'Forgejo / Gitea'].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  onClick={() => {
                    handleToggleStep(1, { stopPropagation: () => {} })
                    setActiveModal(null)
                  }}
                  className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-[#005459] dark:hover:border-teal-400 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors cursor-pointer"
                >
                  <span>Connect {provider}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Link Server Provider */}
      <AddServerProviderModal
        isOpen={activeModal === 'provider'}
        onClose={() => setActiveModal(null)}
        onSaveProvider={() => {
          handleToggleStep(2, { stopPropagation: () => {} })
          setActiveModal(null)
        }}
      />

      {/* Modal: Upgrade Plan */}
      {activeModal === 'upgrade' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#10141D] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                PortalOps Subscription Plans
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              You are currently on the <strong>Trial Plan (5 days remaining)</strong>. Upgrade to unlock unlimited deployments, custom cron daemons, and client workspace isolation.
            </p>

            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-zinc-900 dark:text-white">Developer Pro</span>
                <span className="font-mono font-bold text-xs text-[#005459] dark:text-teal-400">$14 / mo</span>
              </div>
              <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400">
                Up to 5 servers, zero-downtime symlink deploys, automated database snapshots.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="h-9 px-4 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  handleToggleStep(4, { stopPropagation: () => {} })
                  setActiveModal(null)
                  navigate('/profile')
                }}
                className="h-9 px-4 rounded-lg bg-[#005459] hover:bg-[#004246] active:bg-[#003538] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Upgrade to Pro
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
