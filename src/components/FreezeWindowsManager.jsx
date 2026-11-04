import { useState, useEffect } from 'react'
import {
  Calendar,
  Lock,
  Plus,
  Trash2,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Loader2,
  X,
  Sliders,
  Check
} from 'lucide-react'
import { api } from '../services/api'
import {
  getStoredFreezeWindows,
  setStoredFreezeWindows,
  getActiveFreezeWindow
} from '../utils/freezeWindows'
import { useToast } from '../context/ToastContext'

export function FreezeWindowsManager() {
  const { showToast } = useToast()
  const [windows, setWindows] = useState([])
  const [loading, setLoading] = useState(true)
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [reason, setReason] = useState('')
  const [environment, setEnvironment] = useState('production')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [saving, setSaving] = useState(false)

  // Load freeze windows on mount
  useEffect(() => {
    let isMounted = true

    const loadWindows = async () => {
      try {
        const res = await api('/governance/freeze-windows')
        if (isMounted) {
          const list = Array.isArray(res) ? res : res?.items || []
          setWindows(list)
          setStoredFreezeWindows(list)
          setLoading(false)
          return
        }
      } catch {
        // Fallback to local storage
        if (isMounted) {
          setWindows(getStoredFreezeWindows())
          setLoading(false)
        }
      }
    }

    loadWindows()

    return () => {
      isMounted = false
    }
  }, [])

  // Quick preset dates generator
  const setPresetDates = (preset) => {
    const now = new Date()
    if (preset === 'weekend') {
      // Next Friday 16:00 to Monday 08:00
      const nextFri = new Date()
      const day = nextFri.getDay()
      const diffToFri = (5 - day + 7) % 7 || 7
      nextFri.setDate(nextFri.getDate() + diffToFri)
      nextFri.setHours(16, 0, 0, 0)

      const nextMon = new Date(nextFri)
      nextMon.setDate(nextMon.getDate() + 3)
      nextMon.setHours(8, 0, 0, 0)

      setStartsAt(nextFri.toISOString().slice(0, 16))
      setEndsAt(nextMon.toISOString().slice(0, 16))
      setName('Weekend Deployment Lockout')
      setReason('Unstaffed weekend support safe harbor')
    } else if (preset === '24h') {
      const end = new Date(now.getTime() + 24 * 60 * 60 * 1000)
      setStartsAt(now.toISOString().slice(0, 16))
      setEndsAt(end.toISOString().slice(0, 16))
      setName('24-Hour Emergency Freeze')
      setReason('Operational stabilization & incident mitigation')
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim() || !startsAt || !endsAt) {
      showToast({ type: 'warning', title: 'Incomplete Form', message: 'Please provide a name, start time, and end time.' })
      return
    }

    setSaving(true)
    const newWindow = {
      id: 'freeze_' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      reason: reason.trim() || 'Scheduled change control policy',
      environment,
      startsAt: new Date(startsAt).toISOString(),
      endsAt: new Date(endsAt).toISOString(),
      enabled: true,
      allowedRoles: ['ADMIN'],
      createdAt: new Date().toISOString()
    }

    try {
      await api('/governance/freeze-windows', {
        method: 'POST',
        body: newWindow
      }).catch(() => null)

      const updated = [newWindow, ...windows]
      setWindows(updated)
      setStoredFreezeWindows(updated)

      showToast({
        type: 'success',
        title: 'Freeze Window Established',
        message: `Deployment freeze "${newWindow.name}" has been registered.`
      })

      setIsCreateOpen(false)
      setName('')
      setReason('')
      setStartsAt('')
      setEndsAt('')
    } catch (err) {
      showToast({ type: 'error', title: 'Save Failed', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleToggleEnabled = async (win) => {
    const updated = windows.map((w) => (w.id === win.id ? { ...w, enabled: !w.enabled } : w))
    setWindows(updated)
    setStoredFreezeWindows(updated)

    try {
      await api(`/governance/freeze-windows/${win.id}`, {
        method: 'PATCH',
        body: { enabled: !win.enabled }
      }).catch(() => null)

      showToast({
        type: 'info',
        title: !win.enabled ? 'Freeze Window Activated' : 'Freeze Window Suspended',
        message: `"${win.name}" is now ${!win.enabled ? 'enforcing change lockouts' : 'paused'}.`
      })
    } catch (err) {
      console.error('Failed to update freeze status:', err)
    }
  }

  const handleDelete = async (id) => {
    const updated = windows.filter((w) => w.id !== id)
    setWindows(updated)
    setStoredFreezeWindows(updated)

    try {
      await api(`/governance/freeze-windows/${id}`, { method: 'DELETE' }).catch(() => null)
      showToast({ type: 'info', title: 'Window Removed', message: 'Freeze window has been deleted.' })
    } catch (err) {
      console.error('Failed to delete freeze window:', err)
    }
  }

  const getWindowStatus = (win) => {
    if (!win.enabled) return { label: 'DISABLED', badgeColor: 'bg-gray-100 text-gray-600 border-gray-300' }
    const now = Date.now()
    const start = new Date(win.startsAt).getTime()
    const end = new Date(win.endsAt).getTime()

    if (now >= start && now <= end) {
      const remainingMins = Math.round((end - now) / (1000 * 60))
      const timeStr = remainingMins >= 60 ? `${Math.round(remainingMins / 60)}h remaining` : `${remainingMins}m remaining`
      return {
        label: `ACTIVE LOCKOUT (${timeStr})`,
        isActive: true,
        badgeColor: 'bg-[#FAEBE9] text-[#C2412D] border-[#F1B5AC] animate-pulse font-bold'
      }
    }
    if (now < start) {
      return { label: 'SCHEDULED', badgeColor: 'bg-amber-50 text-amber-700 border-amber-300' }
    }
    return { label: 'EXPIRED', badgeColor: 'bg-gray-100 text-gray-500 border-gray-300' }
  }

  return (
    <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E7E4]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-[#FAEBE9] text-[#C2412D] flex items-center justify-center">
            <Lock className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="font-bold text-[14px] text-[#101d26]">
              Deployment Freeze Windows &amp; Change Lockouts
            </h3>
            <p className="text-[12px] text-[#565f6b]">
              Enforce blackout periods (e.g. holidays, unstaffed weekends) where production deployments are blocked.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setIsCreateOpen(true)
            setPresetDates('weekend')
          }}
          className="h-[32px] px-3 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Freeze Window</span>
        </button>
      </div>

      {/* Creation Modal / Inline Drawer */}
      {isCreateOpen && (
        <form onSubmit={handleCreate} className="p-4 bg-[#F9FBFA] border border-[#BEDDF7] rounded-[8px] space-y-3.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-[#005459] flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              Configure Deployment Lockout Window
            </span>
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="text-[#565f6b] hover:text-[#101d26] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 text-[11px] font-mono">
            <span className="text-[#565f6b]">Presets:</span>
            <button
              type="button"
              onClick={() => setPresetDates('weekend')}
              className="px-2 py-0.5 rounded border border-[#CDD4D0] bg-white hover:bg-[#F4F6F5] text-[#005459] cursor-pointer"
            >
              Upcoming Weekend
            </button>
            <button
              type="button"
              onClick={() => setPresetDates('24h')}
              className="px-2 py-0.5 rounded border border-[#CDD4D0] bg-white hover:bg-[#F4F6F5] text-[#005459] cursor-pointer"
            >
              Next 24 Hours
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-[#565f6b] mb-1">
                Freeze Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Black Friday Freeze"
                className="w-full h-[34px] px-3 bg-white border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-[#565f6b] mb-1">
                Target Environment
              </label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full h-[34px] px-3 bg-white border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459]"
              >
                <option value="production">Production Only</option>
                <option value="staging">Staging &amp; QA</option>
                <option value="all">All Environments (Cluster-wide)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-[#565f6b] mb-1">
                Lockout Starts At (Local Time)
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full h-[34px] px-3 bg-white border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459] font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-[#565f6b] mb-1">
                Lockout Ends At (Local Time)
              </label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full h-[34px] px-3 bg-white border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459] font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-[#565f6b] mb-1">
              Operational Rationale
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. High-traffic holiday volume protection"
              className="w-full h-[34px] px-3 bg-white border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#101d26] outline-none focus:border-[#005459]"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-3 h-[32px] rounded border border-[#CDD4D0] bg-white text-[12px] text-[#565f6b] hover:bg-[#F4F6F5] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 h-[32px] rounded bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              <span>Save Freeze Window</span>
            </button>
          </div>
        </form>
      )}

      {/* Freeze Windows Table / List */}
      {loading ? (
        <div className="py-8 flex justify-center text-[#565f6b]">
          <Loader2 className="w-5 h-5 animate-spin text-[#005459]" />
        </div>
      ) : windows.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-[#CDD4D0] rounded-[8px] space-y-2">
          <ShieldAlert className="w-7 h-7 text-[#8F9CA7] mx-auto" />
          <h4 className="text-[13px] font-semibold text-[#101d26]">No Active Freeze Windows</h4>
          <p className="text-[12px] text-[#565f6b] max-w-[420px] mx-auto">
            Deployments are unrestricted. You can define scheduled freeze windows to automatically lock production pipelines during critical business hours.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#E2E7E4] border border-[#CDD4D0] rounded-[6px] overflow-hidden bg-white text-[12px]">
          {windows.map((win) => {
            const status = getWindowStatus(win)
            return (
              <div key={win.id} className="p-3.5 hover:bg-[#F9FBFA] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#101d26] text-[13px]">{win.name}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase ${status.badgeColor}`}>
                      {status.label}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E2F0FD] text-[#005459] border border-[#BEDDF7] uppercase">
                      {win.environment}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#565f6b]">
                    {win.reason}
                  </p>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#8F9CA7] pt-0.5">
                    <span>From: {new Date(win.startsAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                    <span>To: {new Date(win.endsAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleToggleEnabled(win)}
                    className={`h-[28px] px-2.5 rounded-[4px] border text-[11px] font-medium transition-colors cursor-pointer ${
                      win.enabled
                        ? 'bg-white border-[#CDD4D0] text-[#565f6b] hover:bg-[#F4F6F5]'
                        : 'bg-[#005459] text-white border-[#005459]'
                    }`}
                  >
                    {win.enabled ? 'Pause Policy' : 'Enable Policy'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(win.id)}
                    className="h-[28px] w-[28px] rounded-[4px] border border-[#CDD4D0] hover:bg-[#FAEBE9] hover:border-[#F1B5AC] text-[#8F9CA7] hover:text-[#C2412D] flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete freeze window"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
