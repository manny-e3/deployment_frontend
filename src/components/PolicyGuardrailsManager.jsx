import { useState, useEffect } from 'react'
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Plus,
  Save,
  Sliders,
  Lock,
  Layers,
  Info,
  Check,
  Trash2
} from 'lucide-react'
import {
  DEFAULT_GUARDRAIL_POLICIES,
  getGuardrailPolicies,
  saveGuardrailPolicies
} from '../utils/policyGuardrails'
import { useToast } from '../context/ToastContext'

export function PolicyGuardrailsManager() {
  const { addToast } = useToast()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAddOpen, setIsAddOpen] = useState(false)

  // New policy state
  const [newPolicyName, setNewPolicyName] = useState('')
  const [newPolicyDesc, setNewPolicyDesc] = useState('')
  const [newPolicyCategory, setNewPolicyCategory] = useState('Governance')
  const [newPolicySeverity, setNewPolicySeverity] = useState('BLOCKING')
  const [newPolicyScope, setNewPolicyScope] = useState('production')

  useEffect(() => {
    let mounted = true
    getGuardrailPolicies().then((loaded) => {
      if (mounted) {
        setPolicies(loaded)
        setLoading(false)
      }
    })
    return () => {
      mounted = false
    }
  }, [])

  const handleToggle = (id) => {
    const updated = policies.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    setPolicies(updated)
    saveGuardrailPolicies(updated)
    addToast({
      title: 'Policy Updated',
      desc: 'Guardrail status updated successfully.',
      type: 'info'
    })
  }

  const handleSeverityChange = (id, severity) => {
    const updated = policies.map((p) => (p.id === id ? { ...p, severity } : p))
    setPolicies(updated)
    saveGuardrailPolicies(updated)
    addToast({
      title: 'Severity Level Changed',
      desc: `Rule severity set to ${severity}.`,
      type: 'info'
    })
  }

  const handleScopeChange = (id, scope) => {
    const updated = policies.map((p) => (p.id === id ? { ...p, scope } : p))
    setPolicies(updated)
    saveGuardrailPolicies(updated)
  }

  const handleResetDefaults = () => {
    if (!confirm('Reset all policy guardrails to enterprise baseline defaults?')) return
    setPolicies(DEFAULT_GUARDRAIL_POLICIES)
    saveGuardrailPolicies(DEFAULT_GUARDRAIL_POLICIES)
    addToast({
      title: 'Guardrails Reset',
      desc: 'Platform rules reverted to factory enterprise baseline.',
      type: 'success'
    })
  }

  const handleAddPolicy = (e) => {
    e.preventDefault()
    if (!newPolicyName.trim() || !newPolicyDesc.trim()) return

    const newId = `custom_${Date.now()}`
    const newRule = {
      id: newId,
      name: newPolicyName.trim(),
      description: newPolicyDesc.trim(),
      category: newPolicyCategory,
      severity: newPolicySeverity,
      scope: newPolicyScope,
      enabled: true,
      requiresBypassRole: ['ADMIN', 'SUPERADMIN']
    }

    const updated = [newRule, ...policies]
    setPolicies(updated)
    saveGuardrailPolicies(updated)

    setNewPolicyName('')
    setNewPolicyDesc('')
    setIsAddOpen(false)
    addToast({
      title: 'Custom Guardrail Created',
      desc: `Rule "${newRule.name}" is now active in pre-flight evaluation.`,
      type: 'success'
    })
  }

  const handleDeletePolicy = (id) => {
    const updated = policies.filter((p) => p.id !== id)
    setPolicies(updated)
    saveGuardrailPolicies(updated)
    addToast({
      title: 'Rule Removed',
      desc: 'Custom guardrail rule deleted.',
      type: 'info'
    })
  }

  const activeCount = policies.filter((p) => p.enabled).length
  const blockingCount = policies.filter((p) => p.enabled && p.severity === 'BLOCKING').length

  return (
    <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E7E4] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#101d26]">
                Policy-as-Code &amp; Pre-Flight Guardrails
              </h3>
              <p className="text-[11px] text-[#565f6b]">
                Programmable release conditions that automatically run before any deployment is dispatched
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="h-[30px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#565f6b] hover:text-[#101d26] text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
            title="Reset to enterprise default policies"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Baseline</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddOpen(!isAddOpen)}
            className="h-[30px] px-3 rounded-[4px] bg-[#005459] hover:bg-[#0B5459] text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Rule</span>
          </button>
        </div>
      </div>

      {/* Metric Summary Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 bg-[#FAFBFB] border border-[#E2E7E4] rounded-[6px]">
          <div className="text-[10px] font-mono uppercase text-[#565f6b] font-semibold">Active Rules</div>
          <div className="text-[18px] font-bold text-[#101d26] font-mono mt-0.5">
            {activeCount} <span className="text-[11px] text-[#565f6b] font-normal">/ {policies.length}</span>
          </div>
        </div>

        <div className="p-3 bg-[#FEF5F4] border border-[#FAD2CD] rounded-[6px]">
          <div className="text-[10px] font-mono uppercase text-[#C2412D] font-semibold">Blocking Gates</div>
          <div className="text-[18px] font-bold text-[#C2412D] font-mono mt-0.5">
            {blockingCount}
          </div>
        </div>

        <div className="p-3 bg-[#FFFBF0] border border-[#FDE6B8] rounded-[6px]">
          <div className="text-[10px] font-mono uppercase text-[#92400E] font-semibold">Advisory Rules</div>
          <div className="text-[18px] font-bold text-[#92400E] font-mono mt-0.5">
            {activeCount - blockingCount}
          </div>
        </div>

        <div className="p-3 bg-[#EAF5EE] border border-[#B8E0C5] rounded-[6px]">
          <div className="text-[10px] font-mono uppercase text-[#2E8B57] font-semibold">Engine Status</div>
          <div className="text-[12px] font-bold text-[#2E8B57] font-mono mt-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#2E8B57]" />
            ENFORCING
          </div>
        </div>
      </div>

      {/* Add Custom Rule Form */}
      {isAddOpen && (
        <form
          onSubmit={handleAddPolicy}
          className="p-4 bg-[#FAFBFB] border border-[#005459]/30 rounded-[6px] space-y-3 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E7E4]">
            <span className="font-bold text-[13px] text-[#101d26]">Define Custom Pre-Flight Rule</span>
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="text-[#565f6b] hover:text-[#101d26] text-[11px]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#101d26]">Rule Name</label>
              <input
                type="text"
                required
                value={newPolicyName}
                onChange={(e) => setNewPolicyName(e.target.value)}
                placeholder="e.g., Mandatory Database Backup Verification"
                className="w-full h-[32px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-white text-[12px] text-[#101d26] focus:outline-none focus:border-[#005459]"
              />
            </div>

            <div className="space-y-1 sm:col-span-2">
              <label className="block text-[11px] font-semibold text-[#101d26]">Description &amp; Enforcement Rationale</label>
              <textarea
                rows={2}
                required
                value={newPolicyDesc}
                onChange={(e) => setNewPolicyDesc(e.target.value)}
                placeholder="Enforces pre-deployment snapshot before major migrations"
                className="w-full p-2 rounded-[4px] border border-[#CDD4D0] bg-white text-[12px] text-[#101d26] focus:outline-none focus:border-[#005459]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#101d26]">Category</label>
              <select
                value={newPolicyCategory}
                onChange={(e) => setNewPolicyCategory(e.target.value)}
                className="w-full h-[32px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-white text-[12px] text-[#101d26]"
              >
                <option value="Governance">Governance</option>
                <option value="Security">Security</option>
                <option value="Reliability">Reliability</option>
                <option value="Quality">Quality</option>
                <option value="Configuration">Configuration</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#101d26]">Severity Level</label>
              <select
                value={newPolicySeverity}
                onChange={(e) => setNewPolicySeverity(e.target.value)}
                className="w-full h-[32px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-white text-[12px] text-[#101d26]"
              >
                <option value="BLOCKING">BLOCKING (Hard stop, requires Admin bypass)</option>
                <option value="WARNING">WARNING (Advisory notification only)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="h-[30px] px-3.5 rounded-[4px] bg-[#005459] text-white text-[11px] font-medium hover:bg-[#0B5459] cursor-pointer"
            >
              Save &amp; Activate Rule
            </button>
          </div>
        </form>
      )}

      {/* Rules List */}
      <div className="space-y-2.5">
        {policies.map((rule) => {
          const isCustom = String(rule.id).startsWith('custom_')

          return (
            <div
              key={rule.id}
              className={`p-3.5 rounded-[6px] border transition-all ${
                rule.enabled
                  ? 'bg-white border-[#CDD4D0]'
                  : 'bg-[#F4F6F5] border-[#E2E7E4] opacity-70'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[13px] text-[#101d26]">
                      {rule.name}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[3px] bg-[#F4F6F5] border border-[#CDD4D0] text-[#565f6b]">
                      {rule.category}
                    </span>
                    {rule.scope === 'production' && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[3px] bg-[#E2F0FD] border border-[#BEDDF7] text-[#005459] font-medium">
                        Production Only
                      </span>
                    )}
                    {isCustom && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-[3px] bg-[#FEF8EC] border border-[#F6DEAC] text-[#D97706]">
                        Custom
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#565f6b] leading-relaxed">
                    {rule.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {/* Severity selector */}
                  <select
                    disabled={!rule.enabled}
                    value={rule.severity}
                    onChange={(e) => handleSeverityChange(rule.id, e.target.value)}
                    className={`h-[28px] px-2 rounded-[4px] border font-mono text-[10px] font-semibold cursor-pointer disabled:opacity-50 ${
                      rule.severity === 'BLOCKING'
                        ? 'bg-[#FEF5F4] border-[#FAD2CD] text-[#C2412D]'
                        : 'bg-[#FFFBF0] border-[#FDE6B8] text-[#92400E]'
                    }`}
                  >
                    <option value="BLOCKING">BLOCKING</option>
                    <option value="WARNING">WARNING</option>
                  </select>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={() => handleToggle(rule.id)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-[#CDD4D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#CDD4D0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#005459]"></div>
                  </label>

                  {isCustom && (
                    <button
                      type="button"
                      onClick={() => handleDeletePolicy(rule.id)}
                      className="text-[#8F9CA7] hover:text-[#C2412D] p-1 rounded hover:bg-[#F4F6F5] transition-colors cursor-pointer"
                      title="Delete custom rule"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
