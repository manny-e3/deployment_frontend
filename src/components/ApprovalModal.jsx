import { useState } from 'react'
import { ShieldAlert, X, CheckCircle2, XCircle, GitBranch, Server, Clock, AlertTriangle } from 'lucide-react'

export function ApprovalModal({
  isOpen,
  onClose,
  deployment,
  onApprove,
  onReject
}) {
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !deployment) return null

  const handleApprove = async () => {
    setIsSubmitting(true)
    try {
      if (onApprove) {
        await onApprove(deployment, comment)
      }
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    setIsSubmitting(true)
    try {
      if (onReject) {
        await onReject(deployment, comment)
      }
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[10px] shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E2E7E4] flex items-center justify-between bg-[#FBFDFB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[6px] bg-[#FAF3E7] text-[#B87E0C] flex items-center justify-center border border-[#F1D6A4]">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#101d26] tracking-tight">
                Production Release Gate
              </h3>
              <p className="text-[12px] text-[#565f6b]">
                Authorized platform engineer approval required
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[#565f6b] hover:text-[#101d26] hover:bg-[#F4F6F5] rounded transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-[6px] bg-[#FAF3E7] border border-[#F1D6A4] text-[12px] text-[#8C5D08] flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#B87E0C]" />
            <div>
              <strong className="font-semibold">Governance Policy Active:</strong> This target is flagged as mission-critical. A peer engineer or admin must sign off on changes before pipeline execution starts.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="p-2.5 rounded-[6px] bg-[#F4F6F5] border border-[#CDD4D0]">
              <div className="text-[10px] font-mono uppercase text-[#565f6b] font-bold">Target Node</div>
              <div className="font-semibold text-[#101d26] mt-0.5 truncate flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#005459]" />
                <span>{deployment.targetName || deployment.server || 'Production Cluster'}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-[6px] bg-[#F4F6F5] border border-[#CDD4D0]">
              <div className="text-[10px] font-mono uppercase text-[#565f6b] font-bold">Commit &amp; Branch</div>
              <div className="font-mono text-[#005459] font-bold mt-0.5 truncate flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-[#005459]" />
                <span>{deployment.branch || 'main'} ({deployment.commitSha?.slice(0, 7) || 'HEAD'})</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-semibold text-[#101d26] mb-1">
              Sign-Off Note / Justification (Optional)
            </label>
            <textarea
              rows={2}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Verified database migration scripts and staging regression tests passed."
              className="w-full px-3 py-2 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] placeholder-[#8F9CA7] outline-none focus:border-[#005459] focus:bg-white resize-none"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#F8FAFA] border-t border-[#E2E7E4] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 text-[12px] font-medium text-[#565f6b] hover:text-[#101d26] cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleReject}
              className="px-3.5 py-1.5 rounded-[6px] bg-white border border-[#F1B5AC] hover:bg-[#FAEBE9] text-[#C2412D] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Reject Release</span>
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleApprove}
              className="px-4 py-1.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Approve &amp; Execute</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
