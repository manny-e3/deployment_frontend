import { useState, useMemo } from 'react'
import {
  GitBranch,
  ArrowRight,
  Server,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Rocket,
  Layers,
  ChevronRight,
  ExternalLink,
  Activity,
  Plus,
  Play,
  RotateCcw,
  Check,
  X,
  Lock,
  Loader2
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { evaluateGuardrails, getGuardrailPolicies } from '../utils/policyGuardrails'
import { checkFreezeStatus } from '../utils/freezeWindows'
import { GuardrailsPreflightModal } from './GuardrailsPreflightModal'

const STAGE_DEFINITIONS = [
  {
    id: 'staging',
    name: 'Development & Staging',
    badge: 'STAGE 1',
    description: 'Continuous integration and ephemeral test deploys from default branch.',
    color: '#005459',
    bgColor: '#E2F0FD',
    borderColor: '#BEDAF2',
    nextStageId: 'qa'
  },
  {
    id: 'qa',
    name: 'User Acceptance & QA',
    badge: 'STAGE 2',
    description: 'Pre-production regression verification and QA engineer sign-off.',
    color: '#D97706',
    bgColor: '#FFFBEB',
    borderColor: '#FDE68A',
    nextStageId: 'production'
  },
  {
    id: 'production',
    name: 'Production Environment',
    badge: 'STAGE 3 (LOCKED)',
    description: 'High-availability customer traffic. Protected by policy gates & lockouts.',
    color: '#2E8B57',
    bgColor: '#EAF5EE',
    borderColor: '#B8E0C5',
    nextStageId: null
  }
]

export function PromotionPipelineBoard({
  project,
  servers = [],
  projectDeployments = [],
  activeDeploymentsByTarget = {},
  onDeploySuccess,
  onOpenAddTarget
}) {
  const { role } = useAuth()
  const { showToast } = useToast()

  const [selectedPromotion, setSelectedPromotion] = useState(null)
  const [targetServerId, setTargetServerId] = useState('')
  const [isPromoting, setIsPromoting] = useState(false)
  const [preflightEvaluation, setPreflightEvaluation] = useState(null)
  const [isPreflightModalOpen, setIsPreflightModalOpen] = useState(false)

  // Classify targets into stages based on their name or environment tag
  const targetsByStage = useMemo(() => {
    const map = {
      staging: [],
      qa: [],
      production: []
    }

    servers.forEach((server) => {
      const env = (server.environment || server.name || '').toLowerCase()
      if (env.includes('prod') || env.includes('live')) {
        map.production.push(server)
      } else if (env.includes('qa') || env.includes('uat') || env.includes('test')) {
        map.qa.push(server)
      } else {
        // Default to staging/development
        map.staging.push(server)
      }
    })

    return map
  }, [servers])

  // Helper to retrieve the latest successful deployment for a target
  const getTargetActiveDeploy = (targetId) => {
    return projectDeployments.find(
      (d) =>
        (d.targetId === targetId || d.target?.id === targetId) &&
        String(d.status).toUpperCase() === 'SUCCESS'
    )
  }

  // Open the promotion modal
  const handleInitiatePromotion = async (fromStage, toStage, sourceTarget) => {
    const sourceDeploy = getTargetActiveDeploy(sourceTarget.id)
    const destTargets = targetsByStage[toStage.id] || []

    if (destTargets.length === 0) {
      showToast({
        type: 'warning',
        title: `No ${toStage.name} Targets`,
        message: `Please add or configure a server for ${toStage.name} before promoting.`
      })
      return
    }

    const defaultDest = destTargets[0]
    setTargetServerId(defaultDest.id)

    const promotionData = {
      fromStage,
      toStage,
      sourceTarget,
      sourceDeploy,
      commitSha: sourceDeploy?.commitSha || project?.defaultBranch || 'HEAD',
      branch: sourceDeploy?.branch || project?.defaultBranch || 'main'
    }

    setSelectedPromotion(promotionData)

    // Run automated guardrail evaluation for destination
    const policies = await getGuardrailPolicies()
    const evaluation = evaluateGuardrails({
      project,
      target: defaultDest,
      environment: toStage.id,
      commitSha: promotionData.commitSha,
      author: role,
      role,
      policies
    })

    setPreflightEvaluation(evaluation)
  }

  // Execute the promotion deploy
  const handleExecutePromotion = async (overrideData = {}) => {
    if (!selectedPromotion || !targetServerId) return

    // Freeze window check
    const freezeCheck = checkFreezeStatus(selectedPromotion.toStage.id, role)
    if (freezeCheck.isBlocked && !freezeCheck.canBypass && !overrideData.emergencyBypass) {
      showToast({
        type: 'error',
        title: 'Promotion Blocked by Freeze Window',
        message: `Active freeze window: "${freezeCheck.freeze.reason}"`
      })
      return
    }

    setIsPromoting(true)
    try {
      const destTargetObj = servers.find((s) => s.id === targetServerId)
      const res = await api(`/projects/${project?.id}/deploy`, {
        method: 'POST',
        body: {
          targetIds: [targetServerId],
          commitSha: selectedPromotion.commitSha,
          branch: selectedPromotion.branch,
          emergencyBypass: overrideData.emergencyBypass ? overrideData.bypassReason : undefined
        }
      })

      showToast({
        type: 'success',
        title: 'Promotion Dispatched',
        message: `Promoting release ${selectedPromotion.commitSha.slice(0, 7)} to ${destTargetObj?.name || selectedPromotion.toStage.name}.`
      })

      setSelectedPromotion(null)
      if (onDeploySuccess) {
        onDeploySuccess(res)
      }
    } catch (err) {
      console.error('Promotion failed to dispatch:', err)
      showToast({
        type: 'error',
        title: 'Promotion Failed',
        message: err.message || 'Server error while dispatching promotion.'
      })
    } finally {
      setIsPromoting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Board Header Summary */}
      <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#101d26]">
                Multi-Stage Continuous Delivery Promotion Board
              </h2>
              <p className="text-[12px] text-[#565f6b]">
                Visualize release artifacts moving through Staging ➔ QA ➔ Production gates
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[12px] font-mono">
          <span className="px-2.5 py-1 rounded-[4px] bg-[#FAFBFB] border border-[#CDD4D0] text-[#565f6b]">
            Total Targets: <strong className="text-[#101d26]">{servers.length}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-[4px] bg-[#EAF5EE] border border-[#B8E0C5] text-[#2E8B57] font-semibold">
            Strict Progression: ENFORCED
          </span>
        </div>
      </div>

      {/* 3-Column Pipeline Stages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {STAGE_DEFINITIONS.map((stage, index) => {
          const stageTargets = targetsByStage[stage.id] || []
          const nextStage = STAGE_DEFINITIONS.find((s) => s.id === stage.nextStageId)

          return (
            <div
              key={stage.id}
              className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] flex flex-col shadow-xs overflow-hidden"
            >
              {/* Stage Header */}
              <div
                className="p-4 border-b border-[#E2E7E4] flex items-center justify-between"
                style={{ backgroundColor: stage.bgColor }}
              >
                <div>
                  <span
                    className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-[3px] border"
                    style={{
                      color: stage.color,
                      borderColor: stage.borderColor,
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    {stage.badge}
                  </span>
                  <h3 className="font-bold text-[14px] text-[#101d26] mt-1.5">
                    {stage.name}
                  </h3>
                </div>

                <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white border border-[#CDD4D0] text-[#565f6b]">
                  {stageTargets.length} {stageTargets.length === 1 ? 'target' : 'targets'}
                </span>
              </div>

              {/* Stage Subline Description */}
              <div className="px-4 py-2 bg-[#FAFBFB] border-b border-[#E2E7E4] text-[11px] text-[#565f6b] leading-tight">
                {stage.description}
              </div>

              {/* Stage Content: Targets & Release Cards */}
              <div className="p-4 flex-1 space-y-3 bg-[#FAFBFB]/50 overflow-y-auto max-h-[560px]">
                {stageTargets.length === 0 ? (
                  <div className="p-6 text-center border-2 border-dashed border-[#CDD4D0] rounded-[6px] space-y-2">
                    <Server className="w-6 h-6 mx-auto text-[#8F9CA7]" />
                    <div className="text-[12px] font-medium text-[#101d26]">
                      No {stage.name} targets
                    </div>
                    <p className="text-[11px] text-[#565f6b]">
                      Configure a target server named or tagged for this environment.
                    </p>
                    {onOpenAddTarget && (
                      <button
                        type="button"
                        onClick={onOpenAddTarget}
                        className="mt-1 h-[28px] px-3 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F4F6F5] border border-[#CDD4D0] text-[#005459] text-[11px] font-medium inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Target</span>
                      </button>
                    )}
                  </div>
                ) : (
                  stageTargets.map((target) => {
                    const activeDeploy = getTargetActiveDeploy(target.id)
                    const hasActiveRelease = Boolean(activeDeploy?.commitSha)
                    const isMaint = Boolean(target.maintenanceMode)

                    return (
                      <div
                        key={target.id}
                        className="p-3.5 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] shadow-2xs space-y-3 transition-shadow hover:shadow-xs"
                      >
                        {/* Server Title & Reachability Badge */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Server className="w-3.5 h-3.5 text-[#005459]" />
                            <span className="font-bold text-[13px] text-[#101d26]">
                              {target.name}
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-mono font-semibold ${
                              isMaint
                                ? 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]'
                                : target.status === 'READY' || target.status === 'DEPLOYED'
                                ? 'bg-[#EAF5EE] text-[#2E8B57] border border-[#B8E0C5]'
                                : 'bg-[#FAFBFB] text-[#565f6b] border border-[#CDD4D0]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isMaint
                                  ? 'bg-[#D97706]'
                                  : target.status === 'READY' || target.status === 'DEPLOYED'
                                  ? 'bg-[#2E8B57]'
                                  : 'bg-[#8F9CA7]'
                              }`}
                            />
                            {isMaint ? 'MAINTENANCE' : target.status || 'READY'}
                          </span>
                        </div>

                        {/* Active Release Card Info */}
                        <div className="p-2.5 bg-[#F4F6F5] rounded-[4px] border border-[#E2E7E4] space-y-1.5 text-[11px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[#565f6b] font-medium">Running Release:</span>
                            {hasActiveRelease ? (
                              <span className="font-mono font-bold text-[#005459] bg-[#E2F0FD] px-1.5 py-0.2 rounded border border-[#BEDDF7]">
                                {activeDeploy.commitSha.slice(0, 7)}
                              </span>
                            ) : (
                              <span className="font-mono text-[#8F9CA7]">—</span>
                            )}
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-[#565f6b] font-medium">Source Branch:</span>
                            <span className="font-mono text-[#101d26] flex items-center gap-1">
                              <GitBranch className="w-2.5 h-2.5 text-[#565f6b]" />
                              {activeDeploy?.branch || target.branch || project?.defaultBranch || 'main'}
                            </span>
                          </div>

                          {activeDeploy?.createdAt && (
                            <div className="flex items-center justify-between text-[#565f6b]">
                              <span>Deployed:</span>
                              <span className="font-mono">
                                {new Date(activeDeploy.createdAt).toLocaleDateString()} {new Date(activeDeploy.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Promotion Action Button */}
                        {nextStage && (
                          <button
                            type="button"
                            onClick={() => handleInitiatePromotion(stage, nextStage, target)}
                            disabled={!hasActiveRelease}
                            className={`w-full h-[32px] px-3 rounded-[4px] text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
                              hasActiveRelease
                                ? 'bg-[#FFFFFF] hover:bg-[#E2F0FD] text-[#005459] border-[#005459]/40 hover:border-[#005459]'
                                : 'bg-[#FAFBFB] text-[#8F9CA7] border-[#E2E7E4] cursor-not-allowed'
                            }`}
                            title={
                              hasActiveRelease
                                ? `Promote ${activeDeploy.commitSha.slice(0, 7)} to ${nextStage.name}`
                                : 'Deploy an active release before promoting to next stage'
                            }
                          >
                            <span>Promote to {nextStage.name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Promotion Review Drawer / Modal */}
      {selectedPromotion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/50 backdrop-blur-xs select-none">
          <div className="w-full max-w-[540px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="h-[50px] px-5 border-b border-[#E2E7E4] flex items-center justify-between bg-[#FAFBFB]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[4px] bg-[#005459] text-white flex items-center justify-center">
                  <Rocket className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-[14px] text-[#101d26]">
                  Release Promotion Gate
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedPromotion(null)}
                className="w-7 h-7 flex items-center justify-center rounded-[4px] hover:bg-[#F4F6F5] text-[#565f6b] hover:text-[#101d26] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-[13px]">
              {/* Flow Visualizer */}
              <div className="p-3 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-mono text-[#565f6b] uppercase font-bold">SOURCE</div>
                  <div className="font-semibold text-[#101d26] text-[13px]">
                    {selectedPromotion.fromStage.name}
                  </div>
                  <div className="font-mono text-[11px] text-[#005459] mt-0.5">
                    {selectedPromotion.sourceTarget.name}
                  </div>
                </div>

                <div className="flex flex-col items-center px-3">
                  <span className="font-mono text-[10px] text-[#565f6b] bg-white px-2 py-0.5 rounded border border-[#CDD4D0]">
                    SHA: {selectedPromotion.commitSha.slice(0, 7)}
                  </span>
                  <ArrowRight className="w-5 h-5 text-[#005459] mt-1" />
                </div>

                <div className="text-right">
                  <div className="text-[10px] font-mono text-[#565f6b] uppercase font-bold">DESTINATION</div>
                  <div className="font-semibold text-[#101d26] text-[13px]">
                    {selectedPromotion.toStage.name}
                  </div>
                  <div className="font-mono text-[11px] text-[#2E8B57] mt-0.5 font-bold">
                    {selectedPromotion.toStage.badge}
                  </div>
                </div>
              </div>

              {/* Destination Target Selector */}
              <div className="space-y-1.5">
                <label className="block text-[12px] font-semibold text-[#101d26]">
                  Select Destination Target Server
                </label>
                <select
                  value={targetServerId}
                  onChange={(e) => setTargetServerId(e.target.value)}
                  className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26] focus:outline-none focus:border-[#005459]"
                >
                  {(targetsByStage[selectedPromotion.toStage.id] || []).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.host || 'local'}) — {t.status || 'READY'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Guardrails Pre-flight Summary Card */}
              {preflightEvaluation && (
                <div className="p-3.5 bg-[#FAFBFB] border border-[#CDD4D0] rounded-[6px] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase font-bold text-[#565f6b]">
                      Policy Pre-Flight Status
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        preflightEvaluation.hasBlockingViolation
                          ? 'bg-[#FEF5F4] text-[#C2412D] border border-[#FAD2CD]'
                          : 'bg-[#EAF5EE] text-[#2E8B57] border border-[#B8E0C5]'
                      }`}
                    >
                      {preflightEvaluation.hasBlockingViolation ? 'VIOLATIONS DETECTED' : 'READY TO PROMOTE'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#565f6b]">
                    {preflightEvaluation.hasBlockingViolation
                      ? 'One or more blocking guardrails requires admin override before deployment.'
                      : 'All automated quality, governance, and security checks verified successfully.'}
                  </p>

                  <button
                    type="button"
                    onClick={() => setIsPreflightModalOpen(true)}
                    className="text-[11px] text-[#005459] font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <span>View detailed rule evaluation checklist</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="h-[52px] px-5 border-t border-[#E2E7E4] flex items-center justify-between bg-[#FAFBFB]">
              <button
                type="button"
                onClick={() => setSelectedPromotion(null)}
                className="h-[34px] px-3.5 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#101d26] text-[12px] font-medium cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isPromoting || !targetServerId}
                onClick={() => {
                  if (preflightEvaluation?.hasBlockingViolation) {
                    setIsPreflightModalOpen(true)
                  } else {
                    handleExecutePromotion()
                  }
                }}
                className="h-[34px] px-4 rounded-[4px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isPromoting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Rocket className="w-3.5 h-3.5" />
                )}
                <span>{isPromoting ? 'Promoting...' : `Confirm Promotion to ${selectedPromotion.toStage.name}`}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preflight Modal for Overriding Blockers */}
      {selectedPromotion && (
        <GuardrailsPreflightModal
          isOpen={isPreflightModalOpen}
          onClose={() => setIsPreflightModalOpen(false)}
          evaluation={preflightEvaluation}
          onProceed={(overrideData) => {
            handleExecutePromotion(overrideData)
          }}
          project={project}
          target={servers.find((s) => s.id === targetServerId)}
          environment={selectedPromotion.toStage.id}
          commitSha={selectedPromotion.commitSha}
        />
      )}
    </div>
  )
}
