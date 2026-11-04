import { useState } from 'react'
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Play,
  Lock,
  ExternalLink,
  ChevronRight,
  Info,
  Layers
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function GuardrailsPreflightModal({
  isOpen,
  onClose,
  evaluation,
  onProceed,
  project,
  target,
  environment = 'production',
  commitSha
}) {
  const { role } = useAuth()
  const [bypassReason, setBypassReason] = useState('')
  const [showOverrideInput, setShowOverrideInput] = useState(false)

  if (!isOpen || !evaluation) return null

  const { passed, hasBlockingViolation, hasWarning, results } = evaluation
  const isAdmin = ['ADMIN', 'SUPERADMIN'].includes(String(role).toUpperCase())

  const handleConfirm = () => {
    if (hasBlockingViolation) {
      if (!isAdmin || !bypassReason.trim()) return
      onProceed({
        emergencyBypass: true,
        bypassReason: bypassReason.trim(),
        bypassedBy: role
      })
    } else {
      onProceed({})
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-[620px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="h-[52px] px-5 border-b border-[#E2E7E4] flex items-center justify-between shrink-0 bg-[#FAFBFB]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-[4px] flex items-center justify-center text-white ${
                hasBlockingViolation
                  ? 'bg-[#C2412D]'
                  : hasWarning
                  ? 'bg-[#D97706]'
                  : 'bg-[#005459]'
              }`}
            >
              {hasBlockingViolation ? (
                <ShieldAlert className="w-4 h-4" />
              ) : hasWarning ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </div>
            <div>
              <h2 className="text-[14px] font-bold text-[#101d26] leading-tight">
                Policy Pre-Flight Verification
              </h2>
              <p className="text-[11px] text-[#565f6b]">
                Target: <span className="font-mono font-semibold text-[#101d26]">{target?.name || 'All Targets'}</span> · Environment: <span className="font-mono font-semibold text-[#005459] uppercase">{environment}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-[4px] hover:bg-[#F4F6F5] text-[#565f6b] hover:text-[#101d26] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-[13px]">
          {/* Status Alert Banner */}
          {hasBlockingViolation ? (
            <div className="p-3.5 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#C2412D] shrink-0 mt-0.5" />
              <div className="flex-1 text-[12px]">
                <div className="font-bold text-[#C2412D]">
                  Deployment Blocked by Automated Guardrail
                </div>
                <div className="text-[#8D2B1B] mt-0.5 leading-relaxed">
                  One or more organizational policies failed compliance check. Releases to this environment are restricted unless authorized by an administrator with documented justification.
                </div>
              </div>
            </div>
          ) : hasWarning ? (
            <div className="p-3.5 bg-[#FEF8EC] border border-[#F6DEAC] rounded-[6px] flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#D97706] shrink-0 mt-0.5" />
              <div className="flex-1 text-[12px]">
                <div className="font-bold text-[#92400E]">
                  Release Allowed with Operational Advisory
                </div>
                <div className="text-[#78350F] mt-0.5 leading-relaxed">
                  All critical blocking guardrails passed. Review the advisory warning below before proceeding.
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-[#EAF5EE] border border-[#B8E0C5] rounded-[6px] flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#2E8B57] shrink-0 mt-0.5" />
              <div className="flex-1 text-[12px]">
                <div className="font-bold text-[#2E8B57]">
                  All Enterprise Guardrails Verified
                </div>
                <div className="text-[#101d26] mt-0.5 leading-relaxed">
                  Automated checks for security, reliability, test quality, and governance have evaluated successfully.
                </div>
              </div>
            </div>
          )}

          {/* Rules Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#565f6b] uppercase font-bold tracking-wider px-1">
              <span>Evaluated Policy Rules ({results.length})</span>
              <span>Result</span>
            </div>

            <div className="space-y-1.5 border border-[#CDD4D0] rounded-[6px] p-2 bg-[#FFFFFF]">
              {results.map((rule) => {
                const isFail = rule.status === 'FAIL'
                const isWarn = rule.status === 'WARN'
                const isPass = rule.status === 'PASS'

                return (
                  <div
                    key={rule.id}
                    className={`p-2.5 rounded-[4px] border transition-colors ${
                      isFail
                        ? 'bg-[#FEF5F4] border-[#FAD2CD]'
                        : isWarn
                        ? 'bg-[#FFFBF0] border-[#FDE6B8]'
                        : 'bg-[#FBFDFB] border-[#E2E7E4]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isFail ? (
                          <ShieldAlert className="w-4 h-4 text-[#C2412D] shrink-0" />
                        ) : isWarn ? (
                          <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-[#2E8B57] shrink-0" />
                        )}
                        <span className="font-semibold text-[#101d26] text-[12px]">
                          {rule.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[3px] bg-[#F4F6F5] border border-[#CDD4D0] text-[#565f6b]">
                          {rule.category}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-[3px] font-bold ${
                          isFail
                            ? 'bg-[#C2412D] text-white'
                            : isWarn
                            ? 'bg-[#D97706] text-white'
                            : 'bg-[#EAF5EE] text-[#2E8B57] border border-[#B8E0C5]'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>

                    <p
                      className={`text-[11px] mt-1 pl-6 leading-relaxed ${
                        isFail
                          ? 'text-[#C2412D]'
                          : isWarn
                          ? 'text-[#92400E]'
                          : 'text-[#565f6b]'
                      }`}
                    >
                      {rule.detail}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Admin Override Section if Blocked */}
          {hasBlockingViolation && (
            <div className="p-3.5 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#101d26]">
                  <Lock className="w-3.5 h-3.5 text-[#005459]" />
                  <span>Admin Emergency Override Gate</span>
                </div>
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={() => setShowOverrideInput(!showOverrideInput)}
                    className="text-[11px] text-[#005459] font-medium hover:underline cursor-pointer"
                  >
                    {showOverrideInput ? 'Hide Rationale Field' : 'Request Emergency Exception'}
                  </button>
                ) : (
                  <span className="text-[11px] text-[#8F9CA7] font-mono">
                    Requires Admin role
                  </span>
                )}
              </div>

              {showOverrideInput && isAdmin && (
                <div className="space-y-2 pt-1">
                  <p className="text-[11px] text-[#565f6b]">
                    Enter operational rationale for bypassing platform guardrails. This action will be immutably recorded in the security audit log:
                  </p>
                  <textarea
                    rows={2}
                    value={bypassReason}
                    onChange={(e) => setBypassReason(e.target.value)}
                    placeholder="e.g., Hotfix patch for payment gateway timeout approved by VP of Eng"
                    className="w-full p-2.5 bg-white border border-[#CDD4D0] rounded-[4px] font-mono text-[11px] text-[#101d26] focus:outline-none focus:border-[#005459]"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="h-[52px] px-5 border-t border-[#E2E7E4] flex items-center justify-between bg-[#FAFBFB] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-[34px] px-3.5 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#101d26] text-[12px] font-medium cursor-pointer transition-colors"
          >
            Cancel
          </button>

          {hasBlockingViolation ? (
            <button
              type="button"
              disabled={!isAdmin || !bypassReason.trim()}
              onClick={handleConfirm}
              className="h-[34px] px-4 rounded-[4px] bg-[#C2412D] hover:bg-[#A93422] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Override &amp; Release</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className="h-[34px] px-4 rounded-[4px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Confirm &amp; Dispatch Release</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
