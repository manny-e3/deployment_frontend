import { useState, useEffect } from 'react'
import { X, Server, Folder, GitBranch, AlertCircle, Loader2, Edit3, Check, Activity, ShieldAlert } from 'lucide-react'
import { api } from '../services/api'
import { TARGET_PRESETS } from './AddTargetModal'

export function EditTargetModal({ isOpen, onClose, projectId, target, onTargetUpdated }) {
  const [name, setName] = useState('')
  const [path, setPath] = useState('')
  const [branch, setBranch] = useState('main')
  const [preDeploy, setPreDeploy] = useState('')
  const [postDeploy, setPostDeploy] = useState('')
  const [healthCheckUrl, setHealthCheckUrl] = useState('')
  const [autoRollbackOnFailure, setAutoRollbackOnFailure] = useState(true)
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (target && isOpen) {
      setName(target.name || '')
      setPath(target.path || target.targetDir || '')
      setBranch(target.branch || 'main')
      setPreDeploy(target.preDeploy || '')
      const currentScript = target.postDeploy || ''
      setPostDeploy(currentScript)
      let savedMeta = {}
      try {
        const metaStr = localStorage.getItem(`target_meta_${target.id}`)
        if (metaStr) savedMeta = JSON.parse(metaStr)
      } catch (_) {}

      setHealthCheckUrl(savedMeta.healthCheckUrl !== undefined ? (savedMeta.healthCheckUrl || '') : (target.healthCheckUrl || target.healthUrl || ''))
      setAutoRollbackOnFailure(savedMeta.autoRollbackOnFailure !== undefined ? savedMeta.autoRollbackOnFailure : (target.autoRollbackOnFailure ?? true))
      setRequiresApproval(savedMeta.requiresApproval !== undefined ? savedMeta.requiresApproval : (target.requiresApproval ?? false))

      // Detect matching preset
      const matched = TARGET_PRESETS.find((p) => p.script === currentScript)
      setSelectedPresetId(matched ? matched.id : null)

      setError(null)
      setSuccess(false)
    }
  }, [target, isOpen])

  if (!isOpen || !target) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!name.trim()) {
      setError('Target name is required.')
      return
    }

    const trimmedPath = path.trim()
    if (!trimmedPath) {
      setError('Target deployment directory is required.')
      return
    }

    if (!trimmedPath.startsWith('/')) {
      setError('Target path must be an absolute path starting with / (e.g. /home/username/public_html).')
      return
    }

    if (trimmedPath.includes('..')) {
      setError('Target path cannot contain relative .. traversal.')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Persist governance & health check options in client storage
      const meta = {
        autoRollbackOnFailure: Boolean(autoRollbackOnFailure),
        requiresApproval: Boolean(requiresApproval),
        healthCheckUrl: healthCheckUrl.trim() || null,
      }
      try {
        localStorage.setItem(`target_meta_${target.id}`, JSON.stringify(meta))
      } catch (e) {
        console.warn('Failed to save target meta to localStorage:', e)
      }

      // 2. Backend target schema strictly allows name, path, branch, preDeploy, postDeploy (and healthCheckUrl)
      // Unrecognized keys like autoRollbackOnFailure and requiresApproval must NOT be sent to the backend
      const payload = {
        name: name.trim(),
        path: trimmedPath,
        branch: branch.trim() || null,
        preDeploy: preDeploy.trim(),
        postDeploy: postDeploy.trim(),
      }
      if (healthCheckUrl.trim()) {
        payload.healthCheckUrl = healthCheckUrl.trim()
      } else {
        payload.healthCheckUrl = null
      }

      let res
      try {
        res = await api(`/projects/${projectId}/targets/${target.id}`, {
          method: 'PATCH',
          body: payload
        })
      } catch (apiErr) {
        // If the backend strictly rejects healthCheckUrl, retry without it
        const isHealthCheckUnrecognized =
          apiErr?.message?.includes('healthCheckUrl') ||
          apiErr?.details?.fields?.some?.((f) => f.field === 'healthCheckUrl' || f.message?.includes('healthCheckUrl'))

        if (isHealthCheckUnrecognized) {
          delete payload.healthCheckUrl
          res = await api(`/projects/${projectId}/targets/${target.id}`, {
            method: 'PATCH',
            body: payload
          })
        } else {
          throw apiErr
        }
      }

      setSuccess(true)
      if (onTargetUpdated) {
        onTargetUpdated({
          ...(res || target),
          ...payload,
          healthCheckUrl: healthCheckUrl.trim() || null,
          autoRollbackOnFailure: Boolean(autoRollbackOnFailure),
          requiresApproval: Boolean(requiresApproval),
        })
      }
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (err) {
      console.error('Failed to update target:', err)
      if (
        err?.code === 'ALREADY_EXISTS' ||
        err?.message?.includes('already exists') ||
        err?.details?.fields?.includes('Target_serverId_path_key')
      ) {
        setError(`The path "${trimmedPath}" is already used by another target on this server. Please specify a unique path.`)
      } else {
        setError(err.message || 'Failed to update target. Please check your inputs.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D26]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-[560px] bg-[#FFFFFF] rounded-[8px] border border-[#CDD4D0] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E7E4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
              <Edit3 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#101d26] tracking-tight">
                Edit Target Server
              </h2>
              <p className="text-[11px] text-[#565f6b]">
                Modify destination path, branch override, or post-deploy hook commands.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8F9CA7] hover:text-[#101d26] p-1 rounded hover:bg-[#F4F6F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-center gap-2 text-[#C2412D] text-[12px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-[#EAF5EE] border border-[#B8E0C5] rounded-[6px] flex items-center gap-2 text-[#2E8B57] text-[12px]">
              <Check className="w-4 h-4 shrink-0" />
              <span>Target updated successfully.</span>
            </div>
          )}

          {/* Target Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              TARGET NAME <span className="text-[#C2412D]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production (Live cPanel)"
              className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
              required
            />
          </div>

          {/* Deployment Directory */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              ABSOLUTE DEPLOYMENT PATH <span className="text-[#C2412D]">*</span>
            </label>
            <div className="relative flex items-center">
              <Folder className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/home/username/public_html or /var/www/site"
                className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                required
              />
            </div>
            <p className="text-[10px] text-[#565f6b] mt-1">
              The full destination path on the remote machine where files will be cloned or extracted.
            </p>
          </div>

          {/* Branch Override */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              DEPLOYMENT BRANCH
            </label>
            <div className="relative flex items-center">
              <GitBranch className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
              />
            </div>
          </div>

          {/* Framework & Deployment Preset */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b]">
                DEPLOYMENT PRESET
              </label>
              <span className="text-[10px] text-[#565f6b] font-mono">
                Click preset to replace script
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {TARGET_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id)
                      setPostDeploy(preset.script)
                    }}
                    className={`text-left p-2.5 rounded-[6px] border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#005459] bg-[#EAF5EE] text-[#005459] ring-2 ring-[#005459]/20 shadow-xs'
                        : 'border-[#CDD4D0] bg-[#FFFFFF] hover:border-[#8F9CA7] hover:bg-[#FAFBFB]'
                    }`}
                  >
                    <div className="text-[12px] font-bold flex items-center gap-1.5">
                      <span className={isSelected ? 'text-[#005459]' : 'text-[#101d26]'}>
                        {preset.label}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#565f6b] leading-tight mt-0.5">
                      {preset.desc}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Post-Deploy Script */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              POST-DEPLOY HOOK SCRIPT
            </label>
            <div className="relative">
              <textarea
                value={postDeploy}
                onChange={(e) => setPostDeploy(e.target.value)}
                rows={4}
                placeholder="e.g. composer install --no-dev or npm run build"
                className="w-full p-2.5 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[11px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
              />
            </div>
            <p className="text-[10px] text-[#565f6b] mt-0.5">
              Commands executed automatically in target root immediately following git checkout and .env injection.
            </p>
          </div>

          {/* Reliability & Governance Settings */}
          <div className="p-3 bg-[#F8FAF9] border border-[#CDD4D0] rounded-[6px] space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider font-bold text-[#005459]">
              <Activity className="w-3.5 h-3.5" />
              <span>Pipeline Reliability &amp; Governance</span>
            </div>

            {/* Health Check Probe URL */}
            <div>
              <label className="block text-[11px] font-medium text-[#101d26] mb-1">
                Project URL / Health Check Endpoint (Optional)
              </label>
              <input
                type="text"
                value={healthCheckUrl}
                onChange={(e) => setHealthCheckUrl(e.target.value)}
                placeholder="e.g. https://myproject.com, http://localhost/kensite, or /health"
                className="w-full h-[32px] px-2.5 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[4px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459]"
              />
              <p className="text-[10px] text-[#565f6b] mt-0.5">
                Leave blank to automatically probe the Project Root URL (HTTP 200/302), or provide a specific domain or path.
              </p>
            </div>

            {/* Auto-rollback on probe fail */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRollbackOnFailure}
                onChange={(e) => setAutoRollbackOnFailure(e.target.checked)}
                className="rounded border-[#CDD4D0] text-[#005459] focus:ring-[#005459]"
              />
              <span className="text-[11px] text-[#101d26] font-medium">
                Auto-rollback if health probe returns non-200 or times out (30s)
              </span>
            </label>

            {/* Require Deployment Approval */}
            <label className="flex items-center gap-2 cursor-pointer select-none pt-1 border-t border-[#E2E7E4]">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="rounded border-[#CDD4D0] text-[#005459] focus:ring-[#005459]"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-[#101d26] font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-[#B87E0C]" />
                <span>Require release sign-off before executing on this target</span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E2E7E4] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-[34px] px-3.5 rounded-[6px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[12px] font-medium text-[#101d26] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[34px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Saving...' : 'Save Target Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
