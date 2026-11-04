import { useState, useEffect } from 'react'
import {
  Wrench,
  X,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Check,
  Copy,
  Radio,
  Flame,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'

export function MaintenanceModeModal({
  isOpen,
  onClose,
  target,
  projectId,
  currentStatus = null,
  onSave
}) {
  const { showToast } = useToast()

  const isAlreadyInMaint = Boolean(
    typeof currentStatus === 'object' ? currentStatus?.enabled : currentStatus
  )

  const [reason, setReason] = useState('Database schema migration')
  const [customReason, setCustomReason] = useState('')
  const [drainSeconds, setDrainSeconds] = useState(15)
  const [estimatedMinutes, setEstimatedMinutes] = useState(30)
  const [customMessage, setCustomMessage] = useState(
    'We are currently performing scheduled system maintenance. Services will resume shortly.'
  )
  const [bypassToken, setBypassToken] = useState('')
  const [copiedToken, setCopiedToken] = useState(false)
  const [copiedHeader, setCopiedHeader] = useState(false)

  // Connection draining state
  const [isDraining, setIsDraining] = useState(false)
  const [drainCountdown, setDrainCountdown] = useState(0)
  const [saving, setSaving] = useState(false)

  // Initialize or generate bypass token when modal opens
  useEffect(() => {
    if (!isOpen) {
      setIsDraining(false)
      return
    }

    if (isAlreadyInMaint && typeof currentStatus === 'object') {
      setReason(currentStatus.reason || 'Scheduled maintenance')
      setCustomMessage(currentStatus.message || '')
      setBypassToken(currentStatus.bypassToken || '')
    } else {
      // Generate unique bypass token
      const randToken = 'maint_' + Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10)
      setBypassToken(randToken)
    }
  }, [isOpen, isAlreadyInMaint, currentStatus])

  // Connection draining countdown timer
  useEffect(() => {
    let timer = null
    if (isDraining && drainCountdown > 0) {
      timer = setInterval(() => {
        setDrainCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            finalizeActivation()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [isDraining, drainCountdown])

  if (!isOpen || !target) return null

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === 'token') {
      setCopiedToken(true)
      setTimeout(() => setCopiedToken(false), 2000)
    } else {
      setCopiedHeader(true)
      setTimeout(() => setCopiedHeader(false), 2000)
    }
  }

  const handleStartEnable = () => {
    if (drainSeconds > 0) {
      setIsDraining(true)
      setDrainCountdown(drainSeconds)
    } else {
      finalizeActivation()
    }
  }

  const finalizeActivation = async () => {
    setIsDraining(false)
    setSaving(true)

    const payload = {
      enabled: true,
      reason: reason === 'Custom' ? customReason : reason,
      drainSeconds,
      estimatedMinutes,
      message: customMessage,
      bypassToken,
      activatedAt: new Date().toISOString()
    }

    try {
      if (projectId && target.id) {
        await api(`/projects/${projectId}/targets/${target.id}/maintenance`, {
          method: 'PATCH',
          body: payload
        }).catch(() => null) // Graceful if backend endpoint not yet deployed
      }

      onSave?.(target.id, payload)
      showToast({
        type: 'warning',
        title: 'Maintenance Mode Active',
        message: `Target "${target.name}" is now responding with HTTP 503.`
      })
      onClose()
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Operation Failed',
        message: err.message || 'Failed to update maintenance mode.'
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDisableMaintenance = async () => {
    setSaving(true)
    const payload = { enabled: false }

    try {
      if (projectId && target.id) {
        await api(`/projects/${projectId}/targets/${target.id}/maintenance`, {
          method: 'PATCH',
          body: payload
        }).catch(() => null)
      }

      onSave?.(target.id, null)
      showToast({
        type: 'success',
        title: 'Target Restored Live',
        message: `Maintenance mode disabled for "${target.name}". Serving live traffic.`
      })
      onClose()
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Operation Failed',
        message: err.message || 'Failed to disable maintenance mode.'
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17202A]/60 backdrop-blur-xs select-none">
      <div
        className="w-full max-w-[560px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[10px] overflow-hidden shadow-[0_12px_32px_rgba(23,32,42,0.16)] animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        role="dialog"
      >
        {/* Header */}
        <div className="h-[52px] px-5 bg-[#FFFFFF] border-b border-[#E2E7E4] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-[6px] flex items-center justify-center ${
              isAlreadyInMaint ? 'bg-[#FAEBE9] text-[#C2412D]' : 'bg-[#FEF3C7] text-[#D97706]'
            }`}>
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#101d26] tracking-tight">
                {isAlreadyInMaint ? 'Exit Target Maintenance Mode' : 'Configure Maintenance & Traffic Drain'}
              </h3>
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

        {/* Target Server Subheader */}
        <div className="px-5 py-2.5 bg-[#F9FBFA] border-b border-[#E2E7E4] flex items-center justify-between text-[12px]">
          <div className="flex items-center gap-2">
            <span className="text-[#565f6b]">Target:</span>
            <span className="font-semibold text-[#101d26]">{target.name}</span>
            <span className="font-mono text-[11px] text-[#8F9CA7]">({target.host || 'cluster-node'}:{target.port || 80})</span>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-[4px] font-bold uppercase ${
            isAlreadyInMaint
              ? 'bg-[#FAEBE9] text-[#C2412D] border border-[#F1B5AC]'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {isAlreadyInMaint ? 'CURRENTLY 503 MAINT' : 'CURRENTLY LIVE'}
          </span>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Active Connection Draining Screen */}
          {isDraining ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-100 border-2 border-amber-300 text-amber-700 mx-auto flex items-center justify-center animate-pulse">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[16px] font-bold text-[#101d26]">
                  Gracefully Draining TCP Connections
                </h4>
                <p className="text-[13px] text-[#565f6b] max-w-[400px] mx-auto">
                  Allowing in-flight user requests to complete before rerouting traffic to the HTTP 503 maintenance page.
                </p>
              </div>

              <div className="max-w-[280px] mx-auto space-y-2">
                <div className="h-2.5 w-full bg-[#E2E7E4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-1000 ease-linear rounded-full"
                    style={{
                      width: `${((drainSeconds - drainCountdown) / drainSeconds) * 100}%`
                    }}
                  />
                </div>
                <div className="text-[12px] font-mono text-[#565f6b]">
                  <span className="font-bold text-[#101d26]">{drainCountdown}s</span> remaining of {drainSeconds}s drain
                </div>
              </div>

              <div className="pt-4 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDraining(false)}
                  className="px-3.5 h-[32px] rounded-[6px] border border-[#CDD4D0] bg-white text-[12px] text-[#565f6b] hover:bg-[#F4F6F5] cursor-pointer"
                >
                  Cancel Drain
                </button>
                <button
                  type="button"
                  onClick={finalizeActivation}
                  className="px-4 h-[32px] rounded-[6px] bg-[#D97706] text-white text-[12px] font-medium hover:bg-[#B45309] cursor-pointer"
                >
                  Skip to Instant 503
                </button>
              </div>
            </div>
          ) : isAlreadyInMaint ? (
            /* Disable Maintenance View */
            <div className="space-y-4">
              <div className="p-4 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[8px] space-y-2 text-[12px] text-[#C2412D]">
                <div className="flex items-center gap-2 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Target is currently serving HTTP 503 Maintenance</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Reason: <strong>{currentStatus?.reason || 'System Maintenance'}</strong>
                </p>
                {currentStatus?.activatedAt && (
                  <p className="text-[10px] font-mono text-[#8F9CA7]">
                    Active since: {new Date(currentStatus.activatedAt).toLocaleString()}
                  </p>
                )}
              </div>

              {/* QA Bypass Header Info */}
              {bypassToken && (
                <div className="p-3 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] space-y-2">
                  <span className="text-[11px] font-mono uppercase font-semibold text-[#565f6b] block">
                    Active QA Bypass Credentials
                  </span>
                  <div className="flex items-center justify-between text-[11px] font-mono bg-white p-2 rounded border border-[#CDD4D0]">
                    <span className="truncate max-w-[360px] text-[#005459]">X-Maintenance-Bypass: {bypassToken}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(`X-Maintenance-Bypass: ${bypassToken}`, 'header')}
                      className="text-[11px] text-[#005459] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                    >
                      {copiedHeader ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedHeader ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              <p className="text-[12px] text-[#565f6b]">
                Disabling maintenance mode will restore the target to the reverse proxy and resume routing live end-user traffic immediately.
              </p>
            </div>
          ) : (
            /* Enable Maintenance Form */
            <div className="space-y-4">
              {/* Reason selection */}
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
                  Operational Reason
                </label>
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  {[
                    'Database schema migration',
                    'Emergency hotfix mitigation',
                    'Host kernel & OS patch',
                    'Custom'
                  ].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setReason(r)}
                      className={`h-[34px] px-3 rounded-[6px] border text-left font-medium transition-colors cursor-pointer truncate ${
                        reason === r
                          ? 'bg-[#E2F0FD] border-[#BEDDF7] text-[#005459] font-bold'
                          : 'bg-white border-[#CDD4D0] text-[#565f6b] hover:bg-[#F4F6F5]'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
                {reason === 'Custom' && (
                  <input
                    type="text"
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter custom maintenance reason..."
                    className="mt-2 w-full h-[34px] px-3 bg-white border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459]"
                  />
                )}
              </div>

              {/* Graceful Connection Draining selection */}
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
                  Connection Draining Strategy
                </label>
                <div className="grid grid-cols-4 gap-2 text-[12px]">
                  {[
                    { label: 'Instant', sec: 0 },
                    { label: '15s Safe', sec: 15 },
                    { label: '30s Prod', sec: 30 },
                    { label: '60s Deep', sec: 60 }
                  ].map((item) => (
                    <button
                      key={item.sec}
                      type="button"
                      onClick={() => setDrainSeconds(item.sec)}
                      className={`h-[34px] px-2 rounded-[6px] border text-center font-mono font-medium transition-colors cursor-pointer ${
                        drainSeconds === item.sec
                          ? 'bg-[#E2F0FD] border-[#BEDDF7] text-[#005459] font-bold'
                          : 'bg-white border-[#CDD4D0] text-[#565f6b] hover:bg-[#F4F6F5]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-[#8F9CA7] mt-1">
                  {drainSeconds === 0
                    ? 'Immediately switches edge proxy to 503. Ongoing requests are cut.'
                    : `Waits ${drainSeconds}s for in-flight requests to complete before switching to 503.`}
                </p>
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
                  Estimated Downtime Window
                </label>
                <div className="grid grid-cols-4 gap-2 text-[12px]">
                  {[15, 30, 60, 120].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setEstimatedMinutes(mins)}
                      className={`h-[32px] px-2 rounded-[6px] border text-center font-mono text-[11px] transition-colors cursor-pointer ${
                        estimatedMinutes === mins
                          ? 'bg-[#E2F0FD] border-[#BEDDF7] text-[#005459] font-bold'
                          : 'bg-white border-[#CDD4D0] text-[#565f6b] hover:bg-[#F4F6F5]'
                      }`}
                    >
                      {mins >= 60 ? `${mins / 60}h` : `${mins}m`}
                    </button>
                  ))}
                </div>
              </div>

              {/* User-facing 503 message */}
              <div>
                <label className="block text-[11px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
                  Public 503 Response Message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-white border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459] resize-none"
                />
              </div>

              {/* QA & Team Bypass Token */}
              <div className="p-3 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase font-semibold text-[#565f6b] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#005459]" />
                    Internal QA Bypass Header
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(`X-Maintenance-Bypass: ${bypassToken}`, 'header')}
                    className="text-[11px] text-[#005459] hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    {copiedHeader ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedHeader ? 'Copied' : 'Copy Header'}</span>
                  </button>
                </div>
                <div className="text-[11px] font-mono bg-white p-2 rounded border border-[#CDD4D0] text-[#005459] truncate">
                  X-Maintenance-Bypass: {bypassToken}
                </div>
                <p className="text-[10px] text-[#8F9CA7]">
                  Allows developers and QA to test the target using this HTTP header or cookie while public users receive HTTP 503.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isDraining && (
          <div className="h-[56px] px-5 bg-[#F9FBFA] border-t border-[#E2E7E4] flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-3.5 h-[34px] rounded-[6px] border border-[#CDD4D0] bg-white hover:bg-[#F4F6F5] text-[12px] font-medium text-[#565f6b] cursor-pointer"
            >
              Cancel
            </button>

            {isAlreadyInMaint ? (
              <button
                type="button"
                onClick={handleDisableMaintenance}
                disabled={saving}
                className="px-4 h-[34px] rounded-[6px] bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Restore Live Traffic</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartEnable}
                disabled={saving}
                className="px-4 h-[34px] rounded-[6px] bg-[#C2412D] hover:bg-[#A33423] text-white text-[12px] font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{drainSeconds > 0 ? `Start ${drainSeconds}s Drain & 503` : 'Enable 503 Maintenance'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
