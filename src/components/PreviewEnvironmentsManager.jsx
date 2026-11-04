import { useState, useEffect } from 'react'
import {
  Globe,
  GitPullRequest,
  Clock,
  ExternalLink,
  Plus,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Layers,
  X,
  Loader2,
  Calendar
} from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'

export function PreviewEnvironmentsManager({
  projectId,
  projectName = 'Project'
}) {
  const { showToast } = useToast()
  const [environments, setEnvironments] = useState([])
  const [isProvisionOpen, setIsProvisionOpen] = useState(false)
  const [provisioning, setProvisioning] = useState(false)

  // Form state for manual ephemeral spawn
  const [prNumber, setPrNumber] = useState('')
  const [prTitle, setPrTitle] = useState('')
  const [branch, setBranch] = useState('')
  const [ttlDays, setTtlDays] = useState('7')

  const storageKey = `deploy_portal_previews_${projectId}`

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        setEnvironments(JSON.parse(saved))
      } else {
        // Initial clean state with real project context
        setEnvironments([
          {
            id: 'prev_104',
            prNumber: 104,
            title: 'Refactor auth session handling and OAuth callbacks',
            branch: 'feat/oauth-session',
            commitSha: '8f3a290',
            url: `https://pr-104.${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}.preview.internal`,
            status: 'ACTIVE',
            createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
            expiresAt: new Date(Date.now() + 86400000 * 5).toISOString(),
            allocatedPort: 3104
          }
        ])
      }
    } catch (err) {
      console.error('Failed to load preview environments:', err)
    }
  }, [projectId, projectName])

  const saveEnvironments = (updated) => {
    setEnvironments(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch (err) {
      console.error('Failed to persist preview environments:', err)
    }
  }

  // Provision new preview environment
  const handleProvision = async (e) => {
    e.preventDefault()
    if (!prNumber || !branch.trim()) return

    setProvisioning(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200))

      const days = parseInt(ttlDays, 10) || 7
      const newEnv = {
        id: `prev_${Date.now()}`,
        prNumber: parseInt(prNumber, 10),
        title: prTitle.trim() || `Pull Request #${prNumber}`,
        branch: branch.trim(),
        commitSha: 'HEAD',
        url: `https://pr-${prNumber}.${projectName.toLowerCase().replace(/[^a-z0-9]/g, '')}.preview.internal`,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * days).toISOString(),
        allocatedPort: 3200 + Math.floor(Math.random() * 500)
      }

      const updated = [newEnv, ...environments]
      saveEnvironments(updated)

      setPrNumber('')
      setPrTitle('')
      setBranch('')
      setIsProvisionOpen(false)

      showToast({
        type: 'success',
        title: 'Preview Environment Provisioned',
        message: `Allocated ephemeral URL ${newEnv.url} with ${days}-day TTL.`
      })
    } catch (err) {
      console.error('Provisioning error:', err)
      showToast({
        type: 'error',
        title: 'Provisioning Failed',
        message: err.message || 'Error creating preview environment.'
      })
    } finally {
      setProvisioning(false)
    }
  }

  // Extend TTL (+3 or +7 days)
  const handleExtendTtl = (envId, daysToAdd = 3) => {
    const updated = environments.map((env) => {
      if (env.id === envId) {
        const currentExp = new Date(env.expiresAt).getTime()
        const newExp = new Date(Math.max(Date.now(), currentExp) + 86400000 * daysToAdd).toISOString()
        return { ...env, expiresAt: newExp }
      }
      return env
    })
    saveEnvironments(updated)
    showToast({
      type: 'info',
      title: 'TTL Extended',
      message: `Environment lifecycle extended by +${daysToAdd} days.`
    })
  }

  // Teardown / Decommission preview
  const handleTeardown = (envId, prNum) => {
    if (!confirm(`Are you sure you want to decommission preview environment for PR #${prNum}? All temporary containers, routes, and ephemeral databases will be destroyed.`)) {
      return
    }

    const updated = environments.filter((env) => env.id !== envId)
    saveEnvironments(updated)
    showToast({
      type: 'warning',
      title: 'Preview Environment Decommissioned',
      message: `PR #${prNum} ephemeral resources released.`
    })
  }

  // Calculate days remaining
  const getRemainingDays = (expiresAt) => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E7E4] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center font-bold">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#101d26]">
                Ephemeral &amp; PR Preview Environments
              </h3>
              <p className="text-[11px] text-[#565f6b]">
                Isolated on-demand cloud environments provisioned per Pull Request with automatic TTL teardown
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsProvisionOpen(!isProvisionOpen)}
          className="h-[30px] px-3 rounded-[4px] bg-[#005459] hover:bg-[#0B5459] text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Provision Preview Env</span>
        </button>
      </div>

      {/* Provisioning Drawer / Form */}
      {isProvisionOpen && (
        <form
          onSubmit={handleProvision}
          className="p-4 bg-[#FAFBFB] border border-[#005459]/30 rounded-[6px] space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E7E4]">
            <span className="font-bold text-[13px] text-[#101d26]">Provision Ephemeral PR Target</span>
            <button
              type="button"
              onClick={() => setIsProvisionOpen(false)}
              className="text-[#565f6b] hover:text-[#101d26] text-[11px]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#101d26]">Pull Request #</label>
              <input
                type="number"
                required
                value={prNumber}
                onChange={(e) => setPrNumber(e.target.value)}
                placeholder="105"
                className="w-full h-[32px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-white font-mono text-[12px] text-[#101d26]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#101d26]">Git Branch</label>
              <input
                type="text"
                required
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="feat/checkout-redesign"
                className="w-full h-[32px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-white font-mono text-[12px] text-[#101d26]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#101d26]">PR Title / Feature Scope</label>
              <input
                type="text"
                value={prTitle}
                onChange={(e) => setPrTitle(e.target.value)}
                placeholder="Checkout redesign with Apple Pay integration"
                className="w-full h-[32px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-white text-[12px] text-[#101d26]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#101d26]">TTL Expiration</label>
              <select
                value={ttlDays}
                onChange={(e) => setTtlDays(e.target.value)}
                className="w-full h-[32px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-white text-[12px] text-[#101d26]"
              >
                <option value="3">3 Days</option>
                <option value="7">7 Days (Default)</option>
                <option value="14">14 Days</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={provisioning}
              className="h-[30px] px-3.5 rounded-[4px] bg-[#005459] text-white text-[11px] font-medium hover:bg-[#0B5459] flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {provisioning && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Launch Isolated Container</span>
            </button>
          </div>
        </form>
      )}

      {/* Active Preview Environments List */}
      <div className="space-y-3">
        {environments.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-[#CDD4D0] rounded-[6px] space-y-2">
            <Globe className="w-6 h-6 mx-auto text-[#8F9CA7]" />
            <div className="text-[13px] font-medium text-[#101d26]">No active preview environments</div>
            <p className="text-[11px] text-[#565f6b]">
              Ephemeral targets provision automatically when Pull Requests are opened or manually via the button above.
            </p>
          </div>
        ) : (
          environments.map((env) => {
            const timeLeft = getRemainingDays(env.expiresAt)
            const isExpired = timeLeft === 'Expired'

            return (
              <div
                key={env.id}
                className="p-4 bg-white border border-[#CDD4D0] rounded-[6px] shadow-2xs space-y-3 transition-shadow hover:shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-[#E2F0FD] text-[#005459] border border-[#BEDDF7]">
                        PR #{env.prNumber}
                      </span>
                      <span className="font-bold text-[13px] text-[#101d26]">
                        {env.title}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.2 rounded font-bold ${
                        isExpired
                          ? 'bg-[#F4F6F5] text-[#565f6b] border border-[#CDD4D0]'
                          : 'bg-[#EAF5EE] text-[#2E8B57] border border-[#B8E0C5]'
                      }`}>
                        {env.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] font-mono text-[#565f6b]">
                      <span>Branch: <strong>{env.branch}</strong></span>
                      <span>·</span>
                      <span>Port: <strong>{env.allocatedPort}</strong></span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[#005459]">
                        <Clock className="w-3 h-3" />
                        TTL: {timeLeft}
                      </span>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={env.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-[30px] px-3 rounded-[4px] bg-[#005459] hover:bg-[#0B5459] text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <span>Visit Preview App</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleExtendTtl(env.id, 3)}
                      className="h-[30px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-white hover:bg-[#F4F6F5] text-[#565f6b] text-[11px] font-medium cursor-pointer"
                      title="Extend TTL by 3 days"
                    >
                      +3d TTL
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTeardown(env.id, env.prNumber)}
                      className="h-[30px] w-[30px] rounded-[4px] border border-[#CDD4D0] bg-white hover:bg-[#FEF5F4] text-[#8F9CA7] hover:text-[#C2412D] flex items-center justify-center cursor-pointer transition-colors"
                      title="Teardown environment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Subdomain URL Ribbon */}
                <div className="px-3 py-1.5 bg-[#F4F6F5] border border-[#E2E7E4] rounded-[4px] flex items-center justify-between text-[11px] font-mono text-[#565f6b]">
                  <span className="truncate max-w-[420px] text-[#005459]">{env.url}</span>
                  <span>Provisioned: {new Date(env.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
