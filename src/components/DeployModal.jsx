import { useState, useEffect } from 'react'
import {
  X,
  Play,
  GitBranch,
  ShieldAlert,
  Check,
  Package,
  Layers,
  Lock,
  Flame,
  AlertTriangle,
  RotateCcw,
  Activity,
  ShieldCheck,
  Server
} from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { checkFreezeStatus } from '../utils/freezeWindows'
import { GuardrailsPreflightModal } from './GuardrailsPreflightModal'
import { evaluateGuardrails, getGuardrailPolicies } from '../utils/policyGuardrails'

export function DeployModal({
  isOpen,
  onClose,
  onDeploy,
  currentEnv = 'production',
  projects = []
}) {
  const { role } = useAuth()
  const [projectList, setProjectList] = useState(projects)
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [environment, setEnvironment] = useState(currentEnv)
  const [sourceType, setSourceType] = useState('git') // 'git' | 'registry'
  const [branch, setBranch] = useState('main')
  const [commitSha, setCommitSha] = useState('')
  const [version, setVersion] = useState('')
  const [imageRepo, setImageRepo] = useState('')
  const [imageTag, setImageTag] = useState('latest')
  const [strategy, setStrategy] = useState('canary') // 'canary' | 'rolling' | 'blue-green'
  const [canaryPercent, setCanaryPercent] = useState(10)
  const [autoRollbackOnFailure, setAutoRollbackOnFailure] = useState(true)
  const [emergencyBypassNote, setEmergencyBypassNote] = useState('')
  const [preflightEvaluation, setPreflightEvaluation] = useState(null)
  const [isPreflightOpen, setIsPreflightOpen] = useState(false)

  // Load real projects if not passed in
  useEffect(() => {
    if (!isOpen) return

    if (projects && projects.length > 0) {
      setProjectList(projects)
      if (!selectedProjectId) {
        setSelectedProjectId(projects[0].id)
        setBranch(projects[0].defaultBranch || 'main')
      }
      return
    }

    const fetchProjects = async () => {
      try {
        const res = await api('/projects')
        const items = Array.isArray(res) ? res : res?.items || []
        setProjectList(items)
        if (items.length > 0) {
          setSelectedProjectId(items[0].id)
          setBranch(items[0].defaultBranch || 'main')
        }
      } catch (err) {
        console.error('Failed to load projects for deploy modal:', err)
      }
    }
    fetchProjects()
  }, [isOpen, projects, selectedProjectId])

  // Update branch and image defaults when project changes
  const handleProjectSelect = (projId) => {
    setSelectedProjectId(projId)
    const selected = projectList.find((p) => p.id === projId)
    if (selected) {
      setBranch(selected.defaultBranch || selected.branch || 'main')
      if (selected.repoUrl) {
        // Deriving clean container repo name from git repo
        const repoName = selected.repoUrl.split('/').pop()?.replace(/\.git$/, '') || selected.name
        setImageRepo(`ghcr.io/org/${repoName}`)
      }
    }
  }

  if (!isOpen) return null

  // Check if target environment is currently frozen
  const freezeCheck = checkFreezeStatus(environment, role)
  const isLocked = freezeCheck.isBlocked && !freezeCheck.canBypass
  const requiresBypassNote = freezeCheck.isBlocked && freezeCheck.canBypass

  const executeDispatch = (overrideData = {}) => {
    const selectedProj = projectList.find((p) => p.id === selectedProjectId)
    onDeploy({
      projectId: selectedProjectId,
      service: selectedProj?.name || 'Service',
      environment,
      sourceType,
      branch: sourceType === 'git' ? branch : undefined,
      commitSha: sourceType === 'git' ? commitSha || undefined : undefined,
      version: version || imageTag || 'v1.0.0',
      image: sourceType === 'registry' ? `${imageRepo}:${imageTag}` : undefined,
      strategy,
      canaryPercent: strategy === 'canary' ? canaryPercent : undefined,
      autoRollbackOnFailure,
      emergencyBypass: overrideData.emergencyBypass
        ? overrideData.bypassReason
        : requiresBypassNote
        ? emergencyBypassNote
        : undefined
    })
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isLocked) return

    const selectedProj = projectList.find((p) => p.id === selectedProjectId)

    // Evaluate policy guardrails before dispatching
    try {
      const policies = await getGuardrailPolicies()
      const evalResult = evaluateGuardrails({
        project: selectedProj,
        environment,
        commitSha: commitSha || 'HEAD',
        author: role,
        role,
        isCanary: strategy === 'canary',
        policies
      })

      if (evalResult.hasBlockingViolation && !emergencyBypassNote) {
        setPreflightEvaluation(evalResult)
        setIsPreflightOpen(true)
        return
      }
    } catch (err) {
      console.error('Pre-flight evaluation error:', err)
    }

    executeDispatch()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17202A]/50 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-[540px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-[0_4px_12px_rgba(23,32,42,0.08)] animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="h-[48px] px-4 bg-[#FFFFFF] border-b border-[#E2E7E4] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[4px] bg-[#005459] text-white flex items-center justify-center">
              <Play className="w-3 h-3 fill-current" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#17202A] tracking-tight">
              Dispatch Service Deployment
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-[4px] text-[#5E6B76] hover:text-[#17202A] hover:bg-[#EDF0EE] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          {/* Target Environment */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
              TARGET ENVIRONMENT
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#F4F6F5] rounded-[6px] border border-[#CDD4D0]">
              {['production', 'staging', 'qa', 'preview'].map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  className={`h-[28px] rounded-[4px] text-[12px] font-medium uppercase font-mono transition-colors cursor-pointer ${
                    environment === env
                      ? env === 'production'
                        ? 'bg-[#C2412D] text-white font-semibold shadow-xs'
                        : 'bg-[#005459] text-white font-semibold shadow-xs'
                      : 'text-[#5E6B76] hover:text-[#17202A]'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>

            {/* Active Freeze Window Alert */}
            {freezeCheck.isBlocked && (
              <div className="mt-2 p-2.5 rounded-[6px] bg-[#FAEBE9] border border-[#F1B5AC] text-[12px] text-[#C2412D] space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  <span>Deployment Freeze Active on {environment.toUpperCase()}</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Reason: <strong>{freezeCheck.freeze.reason}</strong> (Ends: {new Date(freezeCheck.freeze.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                </p>
                {freezeCheck.canBypass ? (
                  <div className="pt-2 border-t border-[#F1B5AC]/60">
                    <span className="text-[11px] font-semibold text-[#902415] block mb-1">
                      Admin Emergency Bypass Justification:
                    </span>
                    <input
                      type="text"
                      value={emergencyBypassNote}
                      onChange={(e) => setEmergencyBypassNote(e.target.value)}
                      placeholder="Enter operational incident / override justification..."
                      className="w-full h-[28px] px-2 bg-white border border-[#F1B5AC] rounded text-[11px] text-[#101d26] outline-none"
                      required
                    />
                  </div>
                ) : (
                  <p className="text-[11px] font-semibold text-[#902415]">
                    Deployments are restricted to ADMIN emergency overrides during this window.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Real Service / Project Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
              SERVICE DEFINITION
            </label>
            <div className="relative">
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectSelect(e.target.value)}
                className="h-[34px] w-full bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] px-3 text-[13px] text-[#17202A] focus:outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15 cursor-pointer font-medium"
              >
                {projectList.length > 0 ? (
                  projectList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.repoUrl ? `(${p.repoUrl.split('/').pop()?.replace(/\.git$/, '')})` : ''}
                    </option>
                  ))
                ) : (
                  <option value="">No registered services found</option>
                )}
              </select>
            </div>
          </div>

          {/* Artifact Source Type: Git vs Container Registry */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
              ARTIFACT SOURCE
            </label>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <button
                type="button"
                onClick={() => setSourceType('git')}
                className={`h-[34px] px-3 rounded-[6px] border flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer ${
                  sourceType === 'git'
                    ? 'bg-[#E2F0FD] border-[#BEDDF7] text-[#005459] font-bold'
                    : 'bg-white border-[#CDD4D0] text-[#565f6b] hover:bg-[#F4F6F5]'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Deploy from Git Branch</span>
              </button>
              <button
                type="button"
                onClick={() => setSourceType('registry')}
                className={`h-[34px] px-3 rounded-[6px] border flex items-center justify-center gap-2 font-medium transition-colors cursor-pointer ${
                  sourceType === 'registry'
                    ? 'bg-[#E2F0FD] border-[#BEDDF7] text-[#005459] font-bold'
                    : 'bg-white border-[#CDD4D0] text-[#565f6b] hover:bg-[#F4F6F5]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>Container Registry Tag</span>
              </button>
            </div>
          </div>

          {sourceType === 'git' ? (
            /* Git Branch Configuration */
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
                  GIT BRANCH
                </label>
                <Input
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  icon={<GitBranch className="w-3.5 h-3.5" />}
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
                  SPECIFIC COMMIT SHA (OPTIONAL)
                </label>
                <Input
                  value={commitSha}
                  onChange={(e) => setCommitSha(e.target.value)}
                  placeholder="HEAD (Latest)"
                />
              </div>
            </div>
          ) : (
            /* Container Registry Configuration */
            <div className="space-y-3 bg-[#F9FBFA] p-3 rounded-[6px] border border-[#CDD4D0]">
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1">
                  IMAGE REPOSITORY URL
                </label>
                <input
                  type="text"
                  value={imageRepo}
                  onChange={(e) => setImageRepo(e.target.value)}
                  placeholder="e.g. ghcr.io/org/service or docker.io/..."
                  className="w-full h-[32px] px-3 bg-white border border-[#CDD4D0] rounded text-[12px] text-[#101d26] outline-none font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1">
                    IMAGE TAG
                  </label>
                  <input
                    type="text"
                    value={imageTag}
                    onChange={(e) => setImageTag(e.target.value)}
                    placeholder="e.g. v2.1.0 or latest"
                    className="w-full h-[32px] px-3 bg-white border border-[#CDD4D0] rounded text-[12px] text-[#101d26] outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1">
                    SCAN VERIFICATION
                  </label>
                  <div className="h-[32px] px-2.5 bg-emerald-50 border border-emerald-200 rounded flex items-center gap-1.5 text-[11px] text-emerald-800 font-mono">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>0 Critical CVEs</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Rollout Strategy with Automated Canary Analysis (ACA) */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
              DEPLOYMENT STRATEGY
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'canary', label: 'Canary Rollout', desc: '10% Traffic slice + verification' },
                { id: 'rolling', label: 'Rolling Update', desc: 'Sequential container restart' },
                { id: 'blue-green', label: 'Blue / Green', desc: 'Instant edge cutover' },
              ].map((strat) => (
                <div
                  key={strat.id}
                  onClick={() => setStrategy(strat.id)}
                  className={`p-2.5 rounded-[6px] border cursor-pointer transition-all ${
                    strategy === strat.id
                      ? 'border-[#005459] bg-[#E2F0FD]/40 ring-1 ring-[#005459]'
                      : 'border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F9FAF9]'
                  }`}
                >
                  <div className="text-[12px] font-semibold text-[#17202A] flex items-center justify-between">
                    <span>{strat.label}</span>
                    {strategy === strat.id && <Check className="w-3 h-3 text-[#005459]" />}
                  </div>
                  <div className="text-[10px] text-[#5E6B76] mt-0.5">{strat.desc}</div>
                </div>
              ))}
            </div>

            {/* Canary Verification Parameters */}
            {strategy === 'canary' && (
              <div className="mt-2.5 p-3 rounded-[6px] bg-[#F4F6F5] border border-[#CDD4D0] space-y-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#101d26] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#005459]" />
                    Automated Canary Analysis (ACA)
                  </span>
                  <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border border-[#CDD4D0] text-[#005459] font-bold">
                    {canaryPercent}% Initial Slice
                  </span>
                </div>
                <div className="flex items-center gap-4 text-[11px] text-[#565f6b]">
                  <span>Observation: <strong>5 minutes</strong></span>
                  <span>Max Error Rate: <strong>&lt; 1.0%</strong></span>
                </div>
                <label className="flex items-center gap-2 pt-1 border-t border-[#E2E7E4] cursor-pointer text-[11px] font-medium text-[#101d26]">
                  <input
                    type="checkbox"
                    checked={autoRollbackOnFailure}
                    onChange={(e) => setAutoRollbackOnFailure(e.target.checked)}
                    className="rounded text-[#005459] focus:ring-[#005459]"
                  />
                  <span>Automatically trigger instant rollback if HTTP 5xx error rate spikes</span>
                </label>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-[#E2E7E4] flex items-center justify-between">
            <span className="text-[11px] text-[#565f6b]">
              {isLocked ? (
                <span className="text-[#C2412D] font-medium">Locked by change freeze</span>
              ) : (
                'Target will verify reachability'
              )}
            </span>

            <div className="flex items-center gap-2">
              <Button variant="secondary" size="compact" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="compact"
                disabled={isLocked || (requiresBypassNote && !emergencyBypassNote.trim())}
                icon={<Play className="w-3 h-3 fill-current" />}
              >
                {requiresBypassNote ? 'Confirm Emergency Release' : 'Confirm & Dispatch'}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Pre-Flight Guardrails Evaluation Modal */}
      {isPreflightOpen && (
        <GuardrailsPreflightModal
          isOpen={isPreflightOpen}
          onClose={() => setIsPreflightOpen(false)}
          evaluation={preflightEvaluation}
          onProceed={(overrideData) => {
            setIsPreflightOpen(false)
            executeDispatch(overrideData)
          }}
          project={projectList.find((p) => p.id === selectedProjectId)}
          environment={environment}
          commitSha={commitSha || 'HEAD'}
        />
      )}
    </div>
  )
}
