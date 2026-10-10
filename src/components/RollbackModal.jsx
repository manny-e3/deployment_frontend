import { useState } from 'react'
import { X, RotateCcw, GitBranch, Server, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import { api } from '../services/api'

export function RollbackModal({
  isOpen,
  onClose,
  deployment,
  onRollbackSuccess
}) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  if (!isOpen || !deployment) return null

  const targetName =
    deployment.target?.name ||
    deployment.server ||
    deployment.targetName ||
    'Target Server'

  const projectName =
    deployment.target?.project?.name ||
    deployment.project ||
    deployment.projectName ||
    'Project'

  const commitSha = deployment.commitSha
    ? deployment.commitSha.slice(0, 7)
    : deployment.requestedSha
    ? deployment.requestedSha.slice(0, 7)
    : 'HEAD'

  const commitMsg =
    deployment.commitMessage ||
    deployment.commitMsg ||
    'Prior release deployment'

  const deployedAt = deployment.createdAt
    ? new Date(deployment.createdAt).toLocaleString()
    : deployment.finishedAt
    ? new Date(deployment.finishedAt).toLocaleString()
    : 'Unknown date'

  const deployNumber = deployment.number
    ? `#${deployment.number}`
    : `#${deployment.id.slice(0, 8)}`

  const handleRollback = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      const res = await api(`/deployments/${deployment.id}/rollback`, {
        method: 'POST'
      })
      if (onRollbackSuccess) {
        onRollbackSuccess(res)
      }
      onClose()
    } catch (err) {
      console.error('Failed to trigger rollback:', err)
      setError(
        err?.message ||
          'Failed to dispatch rollback. Please verify no deployment is currently running on this target.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/50 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="w-full max-w-[500px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="h-[48px] px-5 border-b border-[#E2E7E4] flex items-center justify-between bg-[#FAFBFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[5px] bg-[#FAF3E7] border border-[#F1D6A4] text-[#B87E0C] flex items-center justify-center">
              <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#101d26] tracking-tight">
                Rollback to {deployNumber}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-7 h-7 rounded-[4px] text-[#565f6b] hover:text-[#101d26] hover:bg-[#F4F6F5] flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-start gap-2.5 text-[12px] text-[#C2412D]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{error}</div>
          </div>
        )}

        {/* Body content */}
        <form onSubmit={handleRollback} className="p-5 space-y-4">
          <div className="p-3 bg-[#FAF3E7]/50 border border-[#F1D6A4]/70 rounded-[6px] space-y-1">
            <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#8C5E09]">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Rollback Confirmation</span>
            </div>
            <p className="text-[11px] text-[#704B07] leading-relaxed">
              This action dispatches a new deployment checking out commit{' '}
              <strong className="font-mono">{commitSha}</strong> onto{' '}
              <strong>{targetName}</strong> and executing the target's post-deploy hook scripts.
            </p>
            <p className="text-[10px] text-[#8C5E09]/80 italic pt-1">
              Note: This redeploys the target server ({targetName}). It does not alter your local working copy on your machine.
            </p>
          </div>

          {/* Target Metadata Card */}
          <div className="p-3.5 bg-[#F8FAF9] border border-[#E2E7E4] rounded-[6px] space-y-2.5 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="text-[#565f6b] font-mono text-[11px] uppercase">Project / Target</span>
              <span className="font-semibold text-[#101d26] flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#005459]" />
                {projectName} <span className="text-[#8F9CA7]">/</span> {targetName}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-[#E2E7E4] pt-2">
              <span className="text-[#565f6b] font-mono text-[11px] uppercase">Commit</span>
              <div className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#565f6b]" />
                <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-[#FFFFFF] border border-[#CDD4D0] font-bold text-[#005459]">
                  {commitSha}
                </span>
                <span className="text-[#565f6b] text-[11px] max-w-[190px] truncate" title={commitMsg}>
                  {commitMsg}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#E2E7E4] pt-2">
              <span className="text-[#565f6b] font-mono text-[11px] uppercase">Deployed On</span>
              <span className="font-mono text-[11px] text-[#565f6b] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#8F9CA7]" />
                {deployedAt}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#E2E7E4] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-[34px] px-3.5 rounded-[6px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[12px] font-medium text-[#101d26] transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="h-[34px] px-4 rounded-[6px] bg-[#B87E0C] hover:bg-[#A36F0B] active:bg-[#8C5E09] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Queueing Rollback...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Confirm Rollback</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
