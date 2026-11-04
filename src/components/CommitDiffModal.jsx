import { useState, useEffect } from 'react'
import {
  GitCommit,
  ArrowRight,
  User,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  GitBranch,
  ShieldAlert,
  Flame,
  FileDiff,
  Info,
  Server
} from 'lucide-react'
import { api } from '../services/api'

export function CommitDiffModal({
  isOpen,
  onClose,
  onConfirmDeploy,
  projectId,
  projectName = 'Project',
  targetName = 'Target Server',
  targetId,
  baseSha,
  targetRef = 'main',
  recentDeployments = []
}) {
  const [loading, setLoading] = useState(true)
  const [diff, setDiff] = useState(null)
  const [endpointStatus, setEndpointStatus] = useState(null)
  const [copiedSha, setCopiedSha] = useState(null)
  const [showFilesList, setShowFilesList] = useState(false)
  const [acknowledgedBreaking, setAcknowledgedBreaking] = useState(false)

  useEffect(() => {
    if (!isOpen) return

    let isMounted = true
    setLoading(true)
    setDiff(null)
    setEndpointStatus(null)
    setAcknowledgedBreaking(false)

    const fetchDiff = async () => {
      try {
        const res = await api(`/projects/${projectId}/compare`, {
          query: {
            baseSha: baseSha || undefined,
            headRef: targetRef || 'main',
            targetId: targetId || undefined
          }
        })
        if (isMounted) {
          if (res && (Array.isArray(res.commits) || res.aheadBy !== undefined)) {
            setDiff(res)
          } else {
            setEndpointStatus({
              available: false,
              message: 'No git comparison payload returned by server.'
            })
          }
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          // Real error or endpoint not implemented — NO mock data
          setEndpointStatus({
            available: false,
            status: err.status || 404,
            message: err.message || 'Git comparison endpoint (/projects/:id/compare) is not configured.'
          })
          setLoading(false)
        }
      }
    }

    fetchDiff()

    return () => {
      isMounted = false
    }
  }, [isOpen, projectId, baseSha, targetRef, targetId])

  if (!isOpen) return null

  const handleCopySha = (sha, e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(sha)
    setCopiedSha(sha)
    setTimeout(() => setCopiedSha(null), 2000)
  }

  // Only check breaking changes if real commits were returned by API
  const realCommits = Array.isArray(diff?.commits) ? diff.commits : []
  const hasBreaking = Boolean(
    diff?.hasBreakingChanges ||
    realCommits.some((c) => c.isBreaking || c.message?.includes('BREAKING CHANGE') || c.message?.includes('!:'))
  )

  const canProceed = !hasBreaking || acknowledgedBreaking

  // Find real active deployment on this target from actual recentDeployments
  const activeDeploy = recentDeployments?.find((d) => {
    const tId = d.targetId || d.target?.id
    return targetId ? tId === targetId : true
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17202A]/60 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-[640px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[10px] overflow-hidden shadow-[0_12px_32px_rgba(23,32,42,0.16)] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="h-[52px] px-5 bg-[#FFFFFF] border-b border-[#E2E7E4] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#005459]/10 text-[#005459] flex items-center justify-center">
              <FileDiff className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-[14px] font-bold text-[#101d26] tracking-tight">
                  Pre-Deployment Review &amp; Diff
                </h3>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] text-[#565f6b] border border-[#CDD4D0]">
                  {projectName}
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[4px] text-[#565f6b] hover:text-[#101d26] hover:bg-[#F4F6F5] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Sub-banner: Target Server & Ref Comparison */}
        <div className="px-5 py-2.5 bg-[#F9FBFA] border-b border-[#E2E7E4] flex flex-wrap items-center justify-between gap-2 text-[12px] shrink-0">
          <div className="flex items-center gap-2 text-[#565f6b]">
            <span className="font-semibold text-[#101d26]">Target:</span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-[#CDD4D0] text-[#005459]">
              {targetName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="bg-white px-2 py-0.5 rounded border border-[#CDD4D0] text-[#565f6b]">
              active: {baseSha ? String(baseSha).slice(0, 7) : 'None'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#8F9CA7]" />
            <span className="bg-[#E2F0FD] px-2 py-0.5 rounded border border-[#BEDDF7] text-[#005459] font-bold flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              {targetRef}
            </span>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 h-7 text-[#005459] animate-spin" />
              <p className="text-[13px] text-[#565f6b] font-medium">
                Fetching Git changelog &amp; comparing commit history...
              </p>
            </div>
          ) : diff && realCommits.length > 0 ? (
            /* Real diff returned from backend API */
            <>
              {/* Diff Metric Summary Cards */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px]">
                  <span className="block text-[18px] font-bold text-[#101d26] leading-tight">
                    {diff.aheadBy ?? realCommits.length}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-[#565f6b] font-semibold">
                    New Commits
                  </span>
                </div>
                <div className="p-2.5 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px]">
                  <span className="block text-[18px] font-bold text-[#101d26] leading-tight">
                    {diff.filesChanged ?? diff.files?.length ?? 0}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-[#565f6b] font-semibold">
                    Files Changed
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-[6px]">
                  <span className="block text-[18px] font-bold text-emerald-700 leading-tight">
                    +{diff.insertions ?? 0}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-emerald-800 font-semibold">
                    Additions
                  </span>
                </div>
                <div className="p-2.5 bg-rose-50/60 border border-rose-200 rounded-[6px]">
                  <span className="block text-[18px] font-bold text-rose-700 leading-tight">
                    -{diff.deletions ?? 0}
                  </span>
                  <span className="text-[10px] font-mono uppercase text-rose-800 font-semibold">
                    Deletions
                  </span>
                </div>
              </div>

              {/* Breaking Changes Alert Banner */}
              {hasBreaking && (
                <div className="p-3.5 bg-[#FEF3C7] border border-[#F59E0B]/50 rounded-[8px] text-[12px] text-[#92400E] space-y-2">
                  <div className="flex items-start gap-2">
                    <Flame className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Breaking Changes Detected</span>
                      <p className="text-[11px] text-[#78350F] mt-0.5">
                        One or more commits introduce backward-incompatible modifications or API contract changes.
                      </p>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 pt-1 border-t border-[#F59E0B]/30 cursor-pointer text-[12px] font-medium text-[#78350F]">
                    <input
                      type="checkbox"
                      checked={acknowledgedBreaking}
                      onChange={(e) => setAcknowledgedBreaking(e.target.checked)}
                      className="rounded border-[#D97706] text-[#005459] focus:ring-[#005459] cursor-pointer"
                    />
                    <span>I have reviewed the breaking changes and confirmed backward compatibility</span>
                  </label>
                </div>
              )}

              {/* Real Commits List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase font-semibold text-[#565f6b]">
                  <span>Commits in this release ({realCommits.length})</span>
                  <span>Author &amp; Time</span>
                </div>

                <div className="divide-y divide-[#E2E7E4] border border-[#CDD4D0] rounded-[6px] overflow-hidden bg-white">
                  {realCommits.map((c) => {
                    const isBreaking = c.isBreaking || c.message?.includes('BREAKING CHANGE') || c.message?.includes('!:')
                    return (
                      <div
                        key={c.sha || c.hash || Math.random()}
                        className={`p-3 text-[12px] hover:bg-[#F9FBFA] transition-colors ${
                          isBreaking ? 'bg-amber-50/40' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {c.type && (
                                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                  {c.type}
                                </span>
                              )}
                              {isBreaking && (
                                <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-bold bg-[#FEF3C7] text-[#92400E] border border-[#F59E0B]">
                                  BREAKING
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={(e) => handleCopySha(c.sha || c.shortSha, e)}
                                className="font-mono text-[11px] text-[#005459] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                                title="Click to copy commit SHA"
                              >
                                {c.shortSha || (c.sha ? String(c.sha).slice(0, 7) : 'commit')}
                                {copiedSha === (c.sha || c.shortSha) ? (
                                  <Check className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3 h-3 text-[#8F9CA7]" />
                                )}
                              </button>
                            </div>
                            <p className="text-[#101d26] font-medium leading-snug">
                              {c.message || 'No commit message'}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="flex items-center gap-1.5 justify-end text-[11px] text-[#565f6b]">
                              <span className="font-medium text-[#101d26]">{c.author?.name || c.author || 'Committer'}</span>
                            </div>
                            <span className="text-[10px] text-[#8F9CA7] font-mono block mt-0.5">
                              {c.timestamp ? new Date(c.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Files list if provided by real API */}
              {diff.files && diff.files.length > 0 && (
                <div className="border border-[#CDD4D0] rounded-[6px] overflow-hidden text-[12px]">
                  <button
                    type="button"
                    onClick={() => setShowFilesList(!showFilesList)}
                    className="w-full px-3 py-2 bg-[#F4F6F5] hover:bg-[#EDF0EE] flex items-center justify-between font-mono text-[11px] font-semibold text-[#565f6b] cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5">
                      {showFilesList ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      <span>Modified File Manifest ({diff.files.length} files)</span>
                    </div>
                    <span className="text-[10px] text-[#8F9CA7]">Toggle inspection</span>
                  </button>

                  {showFilesList && (
                    <div className="p-2 space-y-1 bg-white max-h-[160px] overflow-y-auto divide-y divide-[#F4F6F5]">
                      {diff.files.map((file, idx) => (
                        <div key={idx} className="py-1 px-1 flex items-center justify-between text-[11px] font-mono">
                          <span className="text-[#101d26] truncate max-w-[420px]" title={file.path || file.filename}>
                            {file.path || file.filename}
                          </span>
                          <div className="flex items-center gap-2 shrink-0">
                            {file.additions > 0 && <span className="text-emerald-700">+{file.additions}</span>}
                            {file.deletions > 0 && <span className="text-rose-700">-{file.deletions}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            /* Direct Release Confirmation (When git comparison API is not active on backend) */
            <div className="space-y-4">
              <div className="p-4 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[8px] space-y-3">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-[#101d26]">
                  <Server className="w-4 h-4 text-[#005459]" />
                  <span>Deployment Target Manifest</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[12px] bg-white p-3 rounded border border-[#E2E7E4]">
                  <div>
                    <span className="text-[11px] font-mono text-[#565f6b] uppercase block">Target Server</span>
                    <span className="font-semibold text-[#101d26]">{targetName}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#565f6b] uppercase block">Target Branch / Ref</span>
                    <span className="font-mono text-[#005459] font-bold">{targetRef}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#565f6b] uppercase block">Active Release SHA</span>
                    <span className="font-mono text-[#101d26]">{baseSha ? String(baseSha).slice(0, 7) : 'None (Initial Run)'}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-[#565f6b] uppercase block">Last Deployment</span>
                    <span className="text-[#101d26]">
                      {activeDeploy ? `#${activeDeploy.number || activeDeploy.id?.slice(0, 6)}` : 'None'}
                    </span>
                  </div>
                </div>

                {endpointStatus && (
                  <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded text-[11px] text-amber-800 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-700" />
                    <span>
                      Git commit diff comparison endpoint (`/projects/:id/compare`) is not enabled on this backend. Pipeline will pull and build the latest commit directly from branch <strong>{targetRef}</strong>.
                    </span>
                  </div>
                )}
              </div>

              {activeDeploy && (
                <div className="p-3 bg-white border border-[#CDD4D0] rounded-[6px] text-[12px] space-y-1">
                  <span className="text-[10px] font-mono uppercase font-semibold text-[#565f6b] block">
                    Current Active Release on Target
                  </span>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-medium text-[#005459]">
                      {activeDeploy.commitSha || baseSha || 'HEAD'}
                    </span>
                    <span className="text-[11px] text-[#8F9CA7] font-mono">
                      {activeDeploy.startedAt ? new Date(activeDeploy.startedAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-[#101d26] text-[12px] truncate">
                    {activeDeploy.commitMsg || activeDeploy.commitMessage || 'Production deployment'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="h-[56px] px-5 bg-[#F9FBFA] border-t border-[#E2E7E4] flex items-center justify-between shrink-0">
          <div className="text-[11px] text-[#565f6b]">
            {hasBreaking && !acknowledgedBreaking ? (
              <span className="text-amber-800 font-medium">⚠️ Acknowledge breaking change to deploy</span>
            ) : (
              <span>Ready to dispatch to pipeline</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 h-[34px] rounded-[6px] border border-[#CDD4D0] bg-white hover:bg-[#F4F6F5] text-[12px] font-medium text-[#565f6b] cursor-pointer transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={!canProceed || loading}
              onClick={() => {
                onConfirmDeploy()
                onClose()
              }}
              className={`px-4 h-[34px] rounded-[6px] text-[12px] font-semibold text-white flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                canProceed && !loading
                  ? 'bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43]'
                  : 'bg-[#005459]/40 cursor-not-allowed opacity-60'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Confirm &amp; Deploy</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
