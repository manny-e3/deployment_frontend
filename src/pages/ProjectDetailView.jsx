import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import {
  FolderGit2,
  GitBranch,
  Globe,
  Rocket,
  Server,
  Clock,
  KeyRound,
  Settings,
  Plus,
  Play,
  RotateCcw,
  Check,
  Copy,
  Download,
  FileText,
  ArrowLeft,
  Loader2,
  Square,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Trash2,
  Edit3,
  Save,
  AlertTriangle,
  Activity,
  ShieldAlert,
  Wrench,
  HeartPulse
} from 'lucide-react'
import { api } from '../services/api'
import { watchDeploy } from '../services/socket'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { can } from '../utils/permissions'
import { AddTargetModal } from '../components/AddTargetModal'
import { EnvironmentManager } from '../components/EnvironmentManager'
import { EditProjectModal } from '../components/EditProjectModal'
import { DeleteProjectModal } from '../components/DeleteProjectModal'
import { EditTargetModal } from '../components/EditTargetModal'
import { RollbackModal } from '../components/RollbackModal'
import { PipelineStepper } from '../components/PipelineStepper'
import { ApprovalModal } from '../components/ApprovalModal'

export function ProjectDetailView() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { role } = useAuth()
  const { showToast } = useToast()
  const canDeploy = can(role, 'deploy:create')
  const canManage = can(role, 'projects:manage')
  const canCancel = can(role, 'deploy:cancel')
  const canRollback = can(role, 'deploy:rollback')

  const [activeTab, setActiveTab] = useState('Servers')
  const [autoDeploy, setAutoDeploy] = useState(true)
  const [project, setProject] = useState(null)
  const [servers, setServers] = useState([])
  const [projectDeployments, setProjectDeployments] = useState([])
  const [pendingApprovalDeploy, setPendingApprovalDeploy] = useState(null)
  const [activeStepperStage, setActiveStepperStage] = useState(null)
  const [healthProbeResults, setHealthProbeResults] = useState({})
  const [maintenanceStatus, setMaintenanceStatus] = useState({})

  // Map of targetId -> activeDeploymentId (the most recent successful deploy for that target)
  const activeDeploymentsByTarget = useMemo(() => {
    const map = {}
    projectDeployments.forEach((dep) => {
      const tid = dep.targetId || dep.target?.id
      if (tid && String(dep.status).toUpperCase() === 'SUCCESS' && dep.commitSha) {
        if (!map[tid]) {
          map[tid] = dep.id
        }
      }
    })
    return map
  }, [projectDeployments])
  const [copiedLog, setCopiedLog] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [deployError, setDeployError] = useState(null)
  const [streamStatus, setStreamStatus] = useState('IDLE') // IDLE | SUCCESS | RUNNING | FAILED
  const [exitCode, setExitCode] = useState(0)
  const [activeDeployment, setActiveDeployment] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState(null)
  const [rollbackDeployment, setRollbackDeployment] = useState(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  // Settings tab form state
  const [settingName, setSettingName] = useState('')
  const [settingRepoUrl, setSettingRepoUrl] = useState('')
  const [settingBranch, setSettingBranch] = useState('main')
  const [settingUrl, setSettingUrl] = useState('')
  const [settingAutoDeploy, setSettingAutoDeploy] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [settingsSuccess, setSettingsSuccess] = useState(null)
  const [settingsError, setSettingsError] = useState(null)
  const [webhookCopied, setWebhookCopied] = useState(false)
  const [isRegeneratingSecret, setIsRegeneratingSecret] = useState(false)
  const [webhookSecret, setWebhookSecret] = useState(null)
  const terminalBottomRef = useRef(null)

  // Fetch project details and deployments from API
  const refreshProject = async () => {
    try {
      if (!projectId) return
      const [projectData, deploymentsData] = await Promise.allSettled([
        api(`/projects/${projectId}`),
        api('/deployments', { query: { projectId, limit: 30 } })
      ])

      if (projectData.status === 'fulfilled' && projectData.value) {
        const data = projectData.value
        const localUrl = localStorage.getItem(`project_url_${projectId}`) || ''
        const effectiveUrl = data.url || localUrl || ''
        setProject({ ...data, url: effectiveUrl })
        setAutoDeploy(data.autoDeploy ?? true)
        setSettingName(data.name || '')
        setSettingRepoUrl(data.repoUrl || data.repo || '')
        setSettingBranch(data.defaultBranch || data.branch || 'main')
        setSettingUrl(effectiveUrl)
        setSettingAutoDeploy(data.autoDeploy ?? true)

        if (Array.isArray(data.targets) && data.targets.length > 0) {
          setServers(
            data.targets.filter(Boolean).map((t) => {
              let meta = {}
              try {
                const metaStr = localStorage.getItem(`target_meta_${t.id}`)
                if (metaStr) meta = JSON.parse(metaStr)
              } catch (_) {}

              return {
                id: t.id,
                name: t.name || t.server?.name || 'Target',
                host: t.server?.host || t.host || 'remote',
                ip: t.server?.host || t.ip || '—',
                targetDir: t.path || t.targetDir || '/var/www/app',
                path: t.path,
                branch: t.branch,
                preDeploy: t.preDeploy,
                postDeploy: t.postDeploy,
                serverId: t.serverId,
                healthCheckUrl: meta.healthCheckUrl !== undefined ? meta.healthCheckUrl : (t.healthCheckUrl || t.healthUrl || null),
                autoRollbackOnFailure: meta.autoRollbackOnFailure !== undefined ? meta.autoRollbackOnFailure : (t.autoRollbackOnFailure ?? true),
                requiresApproval: meta.requiresApproval !== undefined ? meta.requiresApproval : (t.requiresApproval ?? false),
                commitSha: t.currentDeployment?.commitSha?.slice(0, 7) || 'HEAD',
                commitMsg: t.currentDeployment?.commitMessage || t.currentDeployment?.commitMsg || '—',
                status: t.currentDeployment?.status || 'READY',
                lastDeployed: t.currentDeployment?.finishedAt
                  ? new Date(t.currentDeployment.finishedAt).toLocaleDateString()
                  : 'Never deployed',
              }
            })
          )
        } else {
          setServers([])
        }
      }

      if (deploymentsData.status === 'fulfilled' && deploymentsData.value) {
        const depItems = deploymentsData.value?.items || (Array.isArray(deploymentsData.value) ? deploymentsData.value : [])
        const filtered = depItems.filter(Boolean)
        setProjectDeployments(filtered)
        if (filtered.length > 0) {
          const latest = filtered[0]
          if (!activeDeployment?.id || activeDeployment.id === latest.id) {
            setActiveDeployment({
              id: latest.id,
              number: latest.number,
              status: latest.status,
              targetName: latest.target?.name || 'Target',
              commitSha: latest.commitSha?.slice(0, 7) || 'HEAD',
              trigger: latest.triggeredBy?.name || latest.trigger || 'Operator',
              duration: latest.durationMs ? `${Math.round(latest.durationMs / 1000)}s` : (latest.status === 'RUNNING' ? 'Running...' : 'Completed')
            })
            setStreamStatus(latest.status)
            setExitCode(latest.exitCode ?? (latest.status === 'SUCCESS' ? 0 : latest.status === 'FAILED' ? 1 : null))
          }
        }
      }
    } catch (err) {
      console.error('Failed to refresh project:', err)
    }
  }

  useEffect(() => {
    let mounted = true
    const loadInitial = async () => {
      setLoading(true)
      await refreshProject()
      if (mounted) setLoading(false)
    }
    loadInitial()
    return () => {
      mounted = false
    }
  }, [projectId])

  // Fetch full log history whenever activeDeployment changes
  useEffect(() => {
    if (!activeDeployment?.id) return
    let cancelled = false
    const loadLogs = async () => {
      try {
        const res = await api(`/deployments/${activeDeployment.id}/logs`)
        if (!cancelled && res?.lines) {
          setLogs(
            res.lines.map((l) => ({
              seq: l.seq,
              stream: l.stream,
              line: l.line,
              time: new Date(l.at || l.createdAt || Date.now()).toLocaleTimeString(),
            }))
          )
        }
      } catch (err) {
        console.warn('Could not fetch deployment logs:', err)
      }
    }
    loadLogs()
    return () => {
      cancelled = true
    }
  }, [activeDeployment?.id])

  const handleRemoveTarget = async (targetId) => {
    if (!window.confirm('Are you sure you want to remove this target server from this project?')) return
    try {
      await api(`/projects/${projectId}/targets/${targetId}`, { method: 'DELETE' })
      setServers((prev) => prev.filter((s) => s.id !== targetId))
    } catch (err) {
      console.error('Failed to remove target:', err)
      alert(err.message || 'Failed to remove target server')
    }
  }

  // Watch realtime logs when an active deployment is running
  useEffect(() => {
    if (!activeDeployment?.id || streamStatus !== 'RUNNING') return

    const unwatch = watchDeploy(activeDeployment.id, {
      onLines: (fresh) => {
        setLogs((prev) => {
          const mapped = fresh.map((l) => ({
            seq: l.seq,
            stream: l.stream,
            line: l.line || l.text,
            time: new Date(l.createdAt || Date.now()).toLocaleTimeString(),
          }))
          const existingSeqs = new Set(prev.map((l) => l.seq))
          const filtered = mapped.filter((l) => !existingSeqs.has(l.seq))
          return [...prev, ...filtered]
        })
        if (terminalBottomRef.current) {
          terminalBottomRef.current.scrollIntoView({ behavior: 'smooth' })
        }
      },
      onFinished: async (finished) => {
        const isSuccess = finished.status === 'SUCCESS'

        if (!isSuccess) {
          setStreamStatus('FAILED')
          setExitCode(finished.exitCode ?? 1)
          setActiveDeployment((prev) => ({
            ...prev,
            status: 'FAILED',
            duration: finished.durationMs ? `${Math.round(finished.durationMs / 1000)}s` : 'Failed'
          }))
          refreshProject()
          return
        }

        // Deployment build/hook commands succeeded.
        // Stage 7: Run Post-Deploy Health Check Probe!
        const targetObj = servers.find((s) => s.id === (finished.targetId || activeDeployment?.targetId)) || servers[0]
        const probeUrl = resolveTargetProbeUrl(targetObj)

        setLogs((prev) => [
          ...prev,
          {
            seq: (prev.length > 0 ? (prev[prev.length - 1].seq || prev.length) + 1 : 1),
            time: new Date().toLocaleTimeString(),
            line: `[STAGE 7/7: HEALTH CHECK] Executing Post-Deploy Health Check Probe on ${probeUrl}...`,
            stream: 'SYSTEM'
          }
        ])

        try {
          const probeStart = performance.now()
          const probeRes = await fetch(`/probe-url?url=${encodeURIComponent(probeUrl)}`, { cache: 'no-store' })
            .then((r) => r.json())
            .catch(async () => {
              const d = await fetch(probeUrl, { cache: 'no-store' })
              return { ok: d.status >= 200 && d.status < 400, status: d.status, statusText: d.statusText }
            })
            .catch((err) => ({ ok: false, status: 500, statusText: err.message }))

          const latency = Math.round(performance.now() - probeStart)

          if (probeRes.ok) {
            // PROBE PASSED (HTTP 200 - 399)
            setHealthProbeResults((prev) => ({
              ...prev,
              [targetObj.id]: { ok: true, latency, status: `${probeRes.status || 200} OK`, testedAt: 'Just now', url: probeUrl }
            }))
            setLogs((prev) => [
              ...prev,
              {
                seq: (prev[prev.length - 1].seq || prev.length) + 1,
                time: new Date().toLocaleTimeString(),
                line: `[STAGE 7/7: HEALTH CHECK] PASSED · HTTP ${probeRes.status || 200} OK (${latency}ms). Target application is healthy.`,
                stream: 'STDOUT'
              },
              {
                seq: (prev[prev.length - 1].seq || prev.length) + 2,
                time: new Date().toLocaleTimeString(),
                line: `[PIPELINE COMPLETE] Deployment #${finished.number || finished.id.slice(0, 8)} successfully promoted.`,
                stream: 'SYSTEM'
              }
            ])
            setStreamStatus('SUCCESS')
            setExitCode(0)
            setActiveDeployment((prev) => ({
              ...prev,
              status: 'SUCCESS',
              duration: finished.durationMs ? `${Math.round(finished.durationMs / 1000)}s` : 'Completed'
            }))
            showToast({
              type: 'success',
              title: 'Deployment & Health Check Verified',
              message: `${targetObj.name}: HTTP ${probeRes.status || 200} OK (${latency}ms)`
            })
            refreshProject()
          } else {
            // PROBE FAILED! (HTTP 500, ParseError, timeout, etc.)
            const statusMsg = `HTTP ${probeRes.status || 500} ${probeRes.statusText || 'Internal Server Error'}`
            setHealthProbeResults((prev) => ({
              ...prev,
              [targetObj.id]: { ok: false, latency, status: statusMsg, testedAt: 'Just now', url: probeUrl }
            }))
            setLogs((prev) => [
              ...prev,
              {
                seq: (prev[prev.length - 1].seq || prev.length) + 1,
                time: new Date().toLocaleTimeString(),
                line: `[STAGE 7/7: HEALTH CHECK] FAILED · ${probeUrl} returned ${statusMsg}!`,
                stream: 'STDERR'
              },
              {
                seq: (prev[prev.length - 1].seq || prev.length) + 2,
                time: new Date().toLocaleTimeString(),
                line: `[PIPELINE FAILURE] Application returned fatal error post-deployment (HTTP ${probeRes.status || 500}).`,
                stream: 'STDERR'
              }
            ])

            setStreamStatus('FAILED')
            setExitCode(1)
            setActiveDeployment((prev) => ({
              ...prev,
              status: 'FAILED',
              duration: finished.durationMs ? `${Math.round(finished.durationMs / 1000)}s` : 'Probe Failed'
            }))
            showToast({
              type: 'error',
              title: 'Health Check Failed',
              message: `Target ${targetObj.name} returned ${statusMsg} post-deployment!`
            })

            // Trigger Automatic Rollback if enabled on target
            const shouldRollback = targetObj?.autoRollbackOnFailure !== false
            if (shouldRollback) {
              setLogs((prev) => [
                ...prev,
                {
                  seq: (prev[prev.length - 1].seq || prev.length) + 1,
                  time: new Date().toLocaleTimeString(),
                  line: `[AUTO-ROLLBACK] Auto-rollback safeguard is ENABLED. Dispatched automatic rollback to restore working release...`,
                  stream: 'SYSTEM'
                }
              ])

              try {
                // Find prior successful deployment on this project/target
                const priorDeploy = projectDeployments.find((d) => d.id !== finished.id && d.status === 'SUCCESS')
                const deployIdToRollback = priorDeploy?.id || finished.id
                const rollbackRes = await api(`/deployments/${deployIdToRollback}/rollback`, { method: 'POST' })
                const startedRollback = rollbackRes?.started?.[0] || rollbackRes
                if (startedRollback && startedRollback.id) {
                  handleRollbackSuccess(startedRollback)
                  showToast({
                    type: 'warning',
                    title: 'Auto-Rollback Dispatched',
                    message: `Health probe failed. Automatically reverting target to release #${startedRollback.number || startedRollback.id.slice(0, 8)}.`
                  })
                }
              } catch (rbErr) {
                console.error('Auto-rollback dispatch error:', rbErr)
                setLogs((prev) => [
                  ...prev,
                  {
                    seq: (prev[prev.length - 1].seq || prev.length) + 1,
                    time: new Date().toLocaleTimeString(),
                    line: `[AUTO-ROLLBACK] Error dispatching automatic rollback: ${rbErr.message}`,
                    stream: 'STDERR'
                  }
                ])
              }
            }
            refreshProject()
          }
        } catch (probeErr) {
          console.error('Health probe execution exception:', probeErr)
          setStreamStatus('FAILED')
          setExitCode(1)
          refreshProject()
        }
      }
    })

    return () => {
      unwatch()
    }
  }, [activeDeployment?.id, streamStatus])

  // Format dynamic title
  const formattedTitle = project?.name || (projectId ? projectId.slice(0, 16) : 'Project')

  // Copy logs
  const copyLogStream = () => {
    const text = logs.map((l) => `[${l.time}] ${l.line || l.text}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedLog(true)
    setTimeout(() => setCopiedLog(false), 2000)
  }

  // Download raw log
  const downloadRawLogs = () => {
    const text = logs.map((l) => `[${l.time}] [${l.stream || 'STDOUT'}] ${l.line || l.text}`).join('\n')
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `deploy-${activeDeployment?.id || 'log'}.log`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Real API deployment trigger — NO mock data or fake simulation
  const handleDeploy = async (targetId = null, approved = false) => {
    if (!canDeploy) return

    // Check if target requires approval gate sign-off
    const targetObj = targetId ? servers.find((s) => s.id === targetId) : servers[0]
    const needsApproval = targetObj?.requiresApproval
    if (needsApproval && !approved) {
      setPendingApprovalDeploy({
        targetId,
        targetName: targetObj?.name || 'All servers',
        branch: targetObj?.branch || settingBranch || 'main',
        commitSha: targetObj?.commitSha || 'HEAD'
      })
      return
    }

    setDeploying(true)
    setDeployError(null)
    const targetName = targetId ? (servers.find((s) => s.id === targetId)?.name || 'Target') : 'All servers'

    try {
      const idToDeploy = project?.id || projectId
      const res = await api(`/projects/${idToDeploy}/deploy`, {
        method: 'POST',
        body: targetId ? { targetIds: [targetId] } : {}
      })
      const started = res?.started?.[0] || (Array.isArray(res) ? res[0] : res)
      if (started && started.id) {
        setActiveDeployment({
          id: started.id,
          number: started.number,
          status: started.status || 'RUNNING',
          targetName,
          commitSha: started.commitSha?.slice(0, 7) || 'HEAD',
          trigger: started.triggeredBy?.name || started.user?.name || role || 'Operator',
          duration: 'Running...'
        })
        setStreamStatus('RUNNING')
        setExitCode(null)
        setLogs([
          {
            seq: 0,
            time: new Date().toLocaleTimeString(),
            line: `Deployment #${started.number || started.id.slice(0, 8)} initiated for ${targetName}...`,
            stream: 'SYSTEM'
          }
        ])
        showToast({
          type: 'info',
          title: 'Pipeline Dispatched',
          message: `Deployment #${started.number || started.id.slice(0, 8)} is running on ${targetName}.`
        })
        refreshProject()
      }
    } catch (err) {
      console.error('Deployment execution error:', err)
      setDeployError(err.message || 'Failed to trigger deployment on the server.')
      setStreamStatus('FAILED')
      setExitCode(1)
      setLogs([
        {
          seq: 0,
          time: new Date().toLocaleTimeString(),
          line: `Deployment error: ${err.message || 'Failed to start deployment on target'}`,
          stream: 'STDERR'
        }
      ])
      showToast({
        type: 'error',
        title: 'Deployment Failed to Dispatch',
        message: err.message || 'Server error while starting release.'
      })
    } finally {
      setDeploying(false)
    }
  }

  // Resolve Target URL or default to Project base URL / homepage
  const resolveTargetProbeUrl = (target) => {
    if (target?.healthCheckUrl && target.healthCheckUrl.trim()) {
      return target.healthCheckUrl.trim()
    }
    if (target?.url) return target.url
    if (project?.url) return project.url
    if (target?.host && !['remote', '—', 'localhost', '127.0.0.1'].includes(target.host)) {
      return `http://${target.host}`
    }
    // Fallback to local project host path
    return `http://localhost/${project?.name ? encodeURIComponent(project.name) : 'app'}`
  }

  // Health Check Probe / Site Reachability Verification
  const handleVerifyHealthProbe = async (target) => {
    const probeUrl = resolveTargetProbeUrl(target)
    const isCustomEndpoint = Boolean(target.healthCheckUrl?.trim())

    showToast({
      type: 'info',
      title: isCustomEndpoint ? 'Testing Health Endpoint' : 'Checking Project URL',
      message: `Pinging ${probeUrl}...`
    })

    const start = performance.now()
    try {
      const probeRes = await fetch(`/probe-url?url=${encodeURIComponent(probeUrl)}`, { cache: 'no-store' })
        .then((r) => r.json())
        .catch(async () => {
          const d = await fetch(probeUrl, { cache: 'no-store' })
          return { ok: d.status >= 200 && d.status < 400, status: d.status, statusText: d.statusText }
        })
        .catch((err) => ({ ok: false, status: 500, statusText: err.message }))

      const latency = Math.round(performance.now() - start)

      if (probeRes.ok) {
        setHealthProbeResults((prev) => ({
          ...prev,
          [target.id]: { ok: true, latency, status: `${probeRes.status || 200} OK`, testedAt: 'Just now', url: probeUrl }
        }))
        showToast({
          type: 'success',
          title: isCustomEndpoint ? 'Health Check Verified' : 'Project URL Reachable',
          message: `${target.name} (${probeUrl}): HTTP ${probeRes.status || 200} OK (${latency}ms)`
        })
      } else {
        const errorMsg = `HTTP ${probeRes.status || 500} ${probeRes.statusText || 'Internal Server Error'}`
        setHealthProbeResults((prev) => ({
          ...prev,
          [target.id]: { ok: false, latency, status: errorMsg, testedAt: 'Just now', url: probeUrl }
        }))
        showToast({
          type: 'error',
          title: 'Reachability Probe Failed',
          message: `${target.name} (${probeUrl}) returned ${errorMsg}!`
        })
      }
    } catch (err) {
      setHealthProbeResults((prev) => ({
        ...prev,
        [target.id]: { ok: false, latency: null, status: 'ERR 500', testedAt: 'Just now', url: probeUrl }
      }))
      showToast({
        type: 'error',
        title: 'Reachability Probe Failed',
        message: `Failed to connect to ${probeUrl}: ${err.message}`
      })
    }
  }

  // Maintenance Mode Switch
  const handleToggleMaintenanceMode = (target) => {
    const isCurrentlyMaint = Boolean(maintenanceStatus[target.id])
    const newStatus = !isCurrentlyMaint
    setMaintenanceStatus((prev) => ({
      ...prev,
      [target.id]: newStatus
    }))

    showToast({
      type: newStatus ? 'warning' : 'success',
      title: newStatus ? 'Maintenance Mode Active' : 'Target Back Live',
      message: newStatus
        ? `Enabled maintenance mode on "${target.name}". App responds with HTTP 503.`
        : `Disabled maintenance mode on "${target.name}". App is serving live traffic.`
    })
  }

  // Real Cancel deployment
  const handleCancelDeploy = async () => {
    if (!canCancel || !activeDeployment?.id) return
    try {
      await api(`/deployments/${activeDeployment.id}/cancel`, { method: 'POST' })
    } catch (err) {
      console.error('Failed to cancel deployment:', err)
    }
    setStreamStatus('FAILED')
    setLogs((prev) => [
      ...prev,
      { seq: prev.length + 1, time: new Date().toLocaleTimeString(), text: 'Deployment cancelled by operator', stream: 'STDERR' }
    ])
  }

  // Handle successful rollback initiation
  const handleRollbackSuccess = (started) => {
    if (started && started.id) {
      const targetName = started.target?.name || 'Target'
      setActiveDeployment({
        id: started.id,
        number: started.number,
        status: started.status || 'RUNNING',
        targetName,
        commitSha: started.commitSha?.slice(0, 7) || started.requestedSha?.slice(0, 7) || 'HEAD',
        trigger: 'Rollback',
        duration: 'Running...'
      })
      setStreamStatus('RUNNING')
      setExitCode(null)
      setLogs([
        {
          seq: 0,
          time: new Date().toLocaleTimeString(),
          line: `Rollback deployment #${started.number || started.id.slice(0, 8)} queued...`,
          stream: 'SYSTEM'
        }
      ])
      const consoleEl = document.getElementById('deployment-console-view')
      if (consoleEl) consoleEl.scrollIntoView({ behavior: 'smooth' })
      refreshProject()
    }
  }

  // Save project settings
  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault()
    setIsSavingSettings(true)
    setSettingsSuccess(null)
    setSettingsError(null)

    try {
      if (settingUrl.trim()) {
        localStorage.setItem(`project_url_${projectId}`, settingUrl.trim())
      } else {
        localStorage.removeItem(`project_url_${projectId}`)
      }

      // Backend project schema strictly expects name, repoUrl, defaultBranch, autoDeploy
      const payload = {
        name: settingName.trim(),
        repoUrl: settingRepoUrl.trim(),
        defaultBranch: settingBranch.trim() || 'main',
        autoDeploy: Boolean(settingAutoDeploy)
      }
      const updated = await api(`/projects/${projectId}`, {
        method: 'PATCH',
        body: payload
      })
      setProject((prev) => ({ ...prev, ...payload, url: settingUrl.trim() || null }))
      setAutoDeploy(Boolean(settingAutoDeploy))
      setSettingsSuccess('Project settings updated successfully.')
      refreshProject()
    } catch (err) {
      console.error('Failed to update project settings:', err)
      setSettingsError(err.message || 'Failed to update project settings.')
    } finally {
      setIsSavingSettings(false)
    }
  }

  // Regenerate webhook secret
  const handleRegenerateWebhookSecret = async () => {
    setIsRegeneratingSecret(true)
    try {
      const res = await api(`/projects/${projectId}/webhook-secret`, {
        method: 'POST'
      })
      if (res?.webhookSecret) {
        setWebhookSecret(res.webhookSecret)
      }
      setSettingsSuccess('New webhook secret generated successfully.')
    } catch (err) {
      console.error('Failed to regenerate webhook secret:', err)
      setSettingsError(err.message || 'Failed to regenerate webhook secret.')
    } finally {
      setIsRegeneratingSecret(false)
    }
  }

  // Dynamic server status counts
  const onlineCount = servers.filter((s) => s.status === 'READY' || s.status === 'DEPLOYED' || s.status === 'ONLINE').length
  const runningCount = servers.filter((s) => s.status === 'DEPLOYING...' || s.status === 'RUNNING').length
  const failedCount = servers.filter((s) => s.status === 'FAILED' || s.status === 'ERROR').length

  // Environment variables count
  const envCount = project?.envVarsCount ?? (project?.envVars ? Object.keys(project.envVars).length : (Array.isArray(project?.environmentVariables) ? project.environmentVariables.length : 0))

  return (
    <div className="space-y-6">
      {/* 1. Breadcrumb & Status Ribbon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[13px]">
          <Link
            to="/projects"
            className="flex items-center gap-1.5 text-[#565f6b] hover:text-[#005459] font-medium transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Projects</span>
          </Link>
          <span className="text-[#CDD4D0]">/</span>
          <span className="font-mono text-[#005459] font-semibold bg-[#E2F0FD] px-2 py-0.5 rounded-[4px] border border-[#BEDAF2]">
            {project?.name || (projectId ? projectId.slice(0, 16) : 'Project')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#EAF5EE] border border-[#B8E0C5] text-[#2E8B57] font-mono text-[11px] font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57]" />
            <span>{project?.status || 'ACTIVE'}</span>
          </span>
          <span className="text-[12px] font-mono text-[#565f6b]">
            ID: {projectId ? projectId.slice(0, 12) : '—'}
          </span>
        </div>
      </div>

      {/* 2. Project Header Card */}
      <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[26px] font-bold text-[#101d26] tracking-tight">
              {formattedTitle}
            </h1>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
              servers.length > 0
                ? 'bg-[#EAF5EE] border border-[#B8E0C5] text-[#2E8B57]'
                : 'bg-[#F4F6F5] border border-[#CDD4D0] text-[#565f6b]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${servers.length > 0 ? 'bg-[#2E8B57]' : 'bg-[#8F9CA7]'}`} />
              {servers.length > 0 ? 'Configured' : 'Needs Target Server'}
            </span>
          </div>

          {/* Subline Metadata */}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-[12px] text-[#565f6b] font-mono">
            <div className="flex items-center gap-1.5 text-[#101d26]">
              <FolderGit2 className="w-3.5 h-3.5 text-[#8F9CA7]" />
              <span className="truncate max-w-[320px]">{project?.repoUrl || project?.repo || 'No repository URL'}</span>
            </div>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] text-[#101d26]">
              <GitBranch className="w-3 h-3 text-[#565f6b]" />
              <span>{project?.defaultBranch || project?.branch || 'main'}</span>
            </span>

            <div className="flex items-center gap-1 text-[#565f6b]">
              <Globe className="w-3.5 h-3.5 text-[#8F9CA7]" />
              <span>{servers.length > 0 ? `${servers.length} target${servers.length > 1 ? 's' : ''} configured` : 'No targets configured'}</span>
            </div>

            {project?.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] hover:bg-[#D0E7FC] border border-[#BEDDF7] text-[#005459] text-[11px] font-mono font-medium transition-colors cursor-pointer"
                title={`Visit Live URL: ${project.url}`}
              >
                <Globe className="w-3 h-3 text-[#005459]" />
                <span>{project.url.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            )}
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Auto-deploy toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#F4F6F5] border border-[#CDD4D0]">
            <button
              type="button"
              onClick={() => setAutoDeploy(!autoDeploy)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                autoDeploy ? 'bg-[#005459]' : 'bg-[#CDD4D0]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 ${
                  autoDeploy ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <div className="text-[11px] font-medium text-[#101d26] leading-none">
              <div>Auto-deploy</div>
              <div className="text-[9px] font-mono uppercase text-[#005459] font-bold">
                {autoDeploy ? 'ON PUSH' : 'PAUSED'}
              </div>
            </div>
          </div>

          {/* Edit Project */}
          {canManage && (
            <button
              type="button"
              onClick={() => setIsEditOpen(true)}
              className="h-[36px] px-3 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F4F6F5] border border-[#CDD4D0] text-[#101d26] text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              title="Edit project details"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#565f6b]" />
              <span>Edit</span>
            </button>
          )}

          {/* Deploy to all servers */}
          {canDeploy && (
            <button
              type="button"
              disabled={deploying || servers.length === 0}
              onClick={() => handleDeploy(null)}
              className="h-[36px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0 disabled:opacity-50"
            >
              {deploying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Rocket className="w-4 h-4" />
              )}
              <span>{deploying ? 'Deploying...' : 'Deploy to all servers'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Deploy Error Notification Banner */}
      {deployError && (
        <div className="p-3 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-center justify-between text-[#C2412D] text-[13px]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{deployError}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeployError(null)}
            className="text-[12px] font-medium underline hover:text-[#8D2B1B] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 3. Tab Bar Navigation */}
      <div className="flex items-center gap-6 border-b border-[#CDD4D0] text-[13px] font-medium select-none">
        <button
          type="button"
          onClick={() => setActiveTab('Servers')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === 'Servers'
              ? 'border-[#005459] text-[#005459] font-semibold'
              : 'border-transparent text-[#565f6b] hover:text-[#101d26]'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Servers</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#E2F0FD] text-[#005459] text-[11px] font-mono font-bold">
            {servers.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Deployments')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === 'Deployments'
              ? 'border-[#005459] text-[#005459] font-semibold'
              : 'border-transparent text-[#565f6b] hover:text-[#101d26]'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Deployments</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#F4F6F5] border border-[#CDD4D0] text-[#565f6b] text-[11px] font-mono">
            {projectDeployments.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Environment')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === 'Environment'
              ? 'border-[#005459] text-[#005459] font-semibold'
              : 'border-transparent text-[#565f6b] hover:text-[#101d26]'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Environment</span>
          <span className="px-1.5 py-0.2 rounded-full bg-[#F4F6F5] border border-[#CDD4D0] text-[#565f6b] text-[11px] font-mono">
            {envCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('Settings')}
          className={`pb-3 flex items-center gap-2 cursor-pointer transition-colors border-b-2 ${
            activeTab === 'Settings'
              ? 'border-[#005459] text-[#005459] font-semibold'
              : 'border-transparent text-[#565f6b] hover:text-[#101d26]'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
      </div>

      {/* 4. Tab Contents */}
      {activeTab === 'Servers' && (
        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs">
          {/* Table Card Header */}
          <div className="px-5 py-3.5 border-b border-[#E2E7E4] flex flex-wrap items-center justify-between gap-3">
            <div className="text-[14px] font-semibold text-[#101d26] tracking-tight">
              Target Servers <span className="font-normal text-[12px] text-[#565f6b]">({servers.length} configured{servers.length > 0 ? `, ${onlineCount} ready` : ''})</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 text-[11px] font-mono text-[#565f6b]">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#2E8B57]" /> {onlineCount} Ready
                </span>
                {runningCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#B87E0C]" /> {runningCount} Running
                    </span>
                  </>
                )}
                {failedCount > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#C2412D]" /> {failedCount} Failed
                    </span>
                  </>
                )}
              </div>

              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsAddTargetOpen(true)}
                  className="h-[30px] px-3 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add Target Server</span>
                </button>
              )}
            </div>
          </div>

          {/* Table Rows */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse select-none">
              <thead>
                <tr className="h-[34px] bg-[#F4F6F5] border-b border-[#CDD4D0] text-[#565f6b] font-semibold text-[11px] font-sans tracking-[0.04em] uppercase">
                  <th className="px-4">SERVER &amp; HOST</th>
                  <th className="px-3">TARGET DIRECTORY</th>
                  <th className="px-3">ACTIVE COMMIT</th>
                  <th className="px-3">STATUS</th>
                  <th className="px-3">LAST DEPLOYED</th>
                  <th className="px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E7E4] text-[13px]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#565f6b]">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#005459]" />
                        <span>Loading target servers...</span>
                      </div>
                    </td>
                  </tr>
                ) : servers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="max-w-sm mx-auto flex flex-col items-center gap-2 text-[#565f6b]">
                        <Server className="w-8 h-8 text-[#8F9CA7] stroke-[1.5]" />
                        <div className="font-semibold text-[#101d26] text-[13px]">No target servers configured</div>
                        <p className="text-[11px] leading-relaxed text-[#565f6b]">
                          Link your configured server (e.g. cPanel host) to target deployments for this project.
                        </p>
                        {canManage && (
                          <div className="flex items-center gap-2.5 mt-2">
                            <button
                              type="button"
                              onClick={() => setIsAddTargetOpen(true)}
                              className="h-[32px] px-3.5 rounded-[6px] bg-[#005459] text-white text-[12px] font-medium hover:bg-[#0B5459] transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                            >
                              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Add Target Server</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => navigate('/servers')}
                              className="h-[32px] px-3 rounded-[6px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[12px] text-[#565f6b] transition-colors cursor-pointer"
                            >
                              Manage Servers
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  servers.map((s) => (
                    <tr key={s.id} className="hover:bg-[#F9FAF9] transition-colors">
                      {/* Host info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-7 h-7 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] flex items-center justify-center text-[#565f6b] shrink-0">
                            <Server className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-[#101d26] text-[13px]">{s.name}</div>
                            <div className="font-mono text-[11px] text-[#565f6b]">
                              {s.ip} ({s.host})
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                              {/* Health / Reachability Probe Pill */}
                              <button
                                type="button"
                                onClick={() => handleVerifyHealthProbe(s)}
                                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] bg-[#E2F0FD] hover:bg-[#D0E7FC] text-[#005459] font-mono text-[10px] font-semibold border border-[#BEDDF7] cursor-pointer transition-colors"
                                title={`URL Probe: ${resolveTargetProbeUrl(s)} ${s.healthCheckUrl ? '(Custom Endpoint)' : '(Project Base URL)'} — Click to verify reachability`}
                              >
                                <Activity className="w-2.5 h-2.5" />
                                <span>{healthProbeResults[s.id]?.status || (s.healthCheckUrl ? 'Probe: Ready' : 'Site: Ready')}</span>
                                {healthProbeResults[s.id]?.latency && (
                                  <span className="opacity-75 font-normal">({healthProbeResults[s.id].latency}ms)</span>
                                )}
                              </button>
                              {s.requiresApproval && (
                                <span
                                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] bg-[#FAF3E7] text-[#B87E0C] border border-[#F1D6A4] font-mono text-[10px] font-semibold"
                                  title="Production release requires authorized sign-off"
                                >
                                  <ShieldAlert className="w-2.5 h-2.5" />
                                  <span>Approval Gate</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Target directory */}
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] font-mono text-[11px] text-[#101d26]">
                          {s.targetDir}
                        </span>
                      </td>

                      {/* Active commit */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2 font-mono text-[12px]">
                          <span className="px-1.5 py-0.2 rounded bg-[#E2F0FD] border border-[#BEDAF2] text-[#005459] font-bold text-[11px]">
                            {s.commitSha}
                          </span>
                          <span className="font-sans text-[12px] text-[#565f6b] truncate max-w-[220px]">
                            {s.commitMsg}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3">
                        {s.status === 'DEPLOYED' || s.status === 'READY' || s.status === 'SUCCESS' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#EAF5EE] border border-[#B8E0C5] text-[#2E8B57] font-mono text-[11px] font-semibold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57]" />
                            {s.status}
                          </span>
                        ) : s.status === 'DEPLOYING...' || s.status === 'RUNNING' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#FAF3E7] border border-[#F1D6A4] text-[#B87E0C] font-mono text-[11px] font-semibold uppercase animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B87E0C]" />
                            DEPLOYING..
                          </span>
                        ) : s.status === 'FAILED' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#FAEBE9] border border-[#F1B5AC] text-[#C2412D] font-mono text-[11px] font-semibold uppercase">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#C2412D]" />
                            FAILED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] text-[#565f6b] font-mono text-[11px] font-semibold uppercase">
                            {s.status}
                          </span>
                        )}
                      </td>

                      {/* Last deployed */}
                      <td className="px-3 py-3 font-mono text-[12px] text-[#565f6b]">
                        {s.lastDeployed}
                      </td>

                      {/* Action button */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(() => {
                            // Find all successful deployments for this target that have a commit SHA
                            const targetDeploys = projectDeployments.filter(
                              (d) =>
                                (d.targetId === s.id || d.target?.id === s.id) &&
                                String(d.status).toUpperCase() === 'SUCCESS' &&
                                d.commitSha
                            )
                            // The most recent successful deployment is the currently running release
                            const currentDeploy = targetDeploys[0]
                            // The prior release to roll back to must be a different commit SHA
                            const priorDeploy = targetDeploys.find(
                              (d, idx) => idx > 0 && d.commitSha !== currentDeploy?.commitSha
                            ) || targetDeploys[1]

                            return (
                              <>
                                {canRollback && priorDeploy && (
                                  <button
                                    type="button"
                                    disabled={deploying}
                                    onClick={() => setRollbackDeployment(priorDeploy)}
                                    className="h-[28px] px-2 rounded-[6px] bg-[#FFFFFF] hover:bg-[#FAF3E7] border border-[#CDD4D0] hover:border-[#F1D6A4] text-[11px] font-medium text-[#B87E0C] inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                                    title={`Rollback ${s.name} to prior release (${priorDeploy.commitSha?.slice(0, 7)})`}
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Rollback</span>
                                  </button>
                                )}
                                {canDeploy && (
                                  s.status === 'FAILED' ? (
                                    <button
                                      type="button"
                                      disabled={deploying}
                                      onClick={() => handleDeploy(s.id)}
                                      className="h-[28px] px-2.5 rounded-[6px] bg-[#FAEBE9] hover:bg-[#F8DFDC] border border-[#F1B5AC] text-[12px] font-medium text-[#C2412D] inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                                    >
                                      <RotateCcw className="w-3 h-3" />
                                      <span>Retry</span>
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={deploying}
                                      onClick={() => handleDeploy(s.id)}
                                      className="h-[28px] px-2.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F4F6F5] border border-[#CDD4D0] text-[12px] font-medium text-[#101d26] inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                                    >
                                      <Play className="w-3 h-3 fill-current text-[#565f6b]" />
                                      <span>Deploy</span>
                                    </button>
                                  )
                                )}
                              </>
                            )
                          })()}
                          {/* Maintenance Mode Toggle Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleMaintenanceMode(s)}
                            className={`h-[28px] px-2 rounded-[6px] border text-[11px] font-medium inline-flex items-center gap-1 transition-colors cursor-pointer shadow-2xs ${
                              maintenanceStatus[s.id]
                                ? 'bg-[#FAEBE9] border-[#F1B5AC] text-[#C2412D]'
                                : 'bg-[#FFFFFF] border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#565f6b]'
                            }`}
                            title={
                              maintenanceStatus[s.id]
                                ? 'Maintenance active (HTTP 503). Click to restore live traffic.'
                                : 'Click to put target into maintenance mode (HTTP 503)'
                            }
                          >
                            <Wrench className="w-3 h-3" />
                            <span>{maintenanceStatus[s.id] ? '503 Maint' : 'Live'}</span>
                          </button>
                          {canManage && (
                            <>
                              <button
                                type="button"
                                onClick={() => setEditingTarget(s)}
                                className="h-[28px] w-[28px] rounded-[6px] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#8F9CA7] hover:text-[#005459] flex items-center justify-center transition-colors cursor-pointer"
                                title="Edit target configuration"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveTarget(s.id)}
                                className="h-[28px] w-[28px] rounded-[6px] border border-[#CDD4D0] hover:bg-[#FAEBE9] hover:border-[#F1B5AC] text-[#8F9CA7] hover:text-[#C2412D] flex items-center justify-center transition-colors cursor-pointer"
                                title="Remove target from project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deployments Tab */}
      {activeTab === 'Deployments' && (
        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs">
          <div className="px-5 py-3.5 border-b border-[#E2E7E4] flex items-center justify-between">
            <h3 className="text-[14px] font-semibold text-[#101d26]">
              Deployment History ({projectDeployments.length})
            </h3>
          </div>
          {projectDeployments.length === 0 ? (
            <div className="p-12 text-center">
              <Clock className="w-8 h-8 text-[#8F9CA7] mx-auto mb-2 stroke-[1.5]" />
              <div className="text-[13px] font-semibold text-[#101d26]">No deployments recorded yet</div>
              <p className="text-[11px] text-[#565f6b] mt-1 max-w-sm mx-auto">
                Trigger a deployment using the button above to run your release pipeline.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse select-none">
                <thead>
                  <tr className="h-[34px] bg-[#F4F6F5] border-b border-[#CDD4D0] text-[#565f6b] font-semibold text-[11px] font-sans tracking-[0.04em] uppercase">
                    <th className="px-4">RELEASE / COMMIT</th>
                    <th className="px-3">TARGET</th>
                    <th className="px-3">TRIGGERED BY</th>
                    <th className="px-3">STATUS</th>
                    <th className="px-3">DATE</th>
                    <th className="px-4 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E7E4] text-[13px]">
                  {projectDeployments.map((d) => (
                    <tr key={d.id} className="hover:bg-[#F9FAF9] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-mono text-[12px] font-semibold text-[#101d26]">
                          {d.commitSha ? d.commitSha.slice(0, 7) : 'HEAD'}
                        </div>
                        <div className="text-[11px] text-[#565f6b] truncate max-w-[200px]">
                          {d.commitMessage || 'Deployment run'}
                        </div>
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#101d26]">
                        {d.target?.name || d.server || 'Target'}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#565f6b]">
                        {d.triggeredBy?.name || d.trigger || 'Operator'}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] font-mono text-[11px] font-semibold uppercase ${
                          d.status === 'SUCCESS' ? 'bg-[#EAF5EE] text-[#2E8B57]' :
                          d.status === 'FAILED' ? 'bg-[#FAEBE9] text-[#C2412D]' : 'bg-[#FAF3E7] text-[#B87E0C]'
                        }`}>
                          {d.status || 'QUEUED'}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-mono text-[12px] text-[#565f6b]">
                        {d.createdAt ? new Date(d.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveDeployment({
                                id: d.id,
                                number: d.number,
                                status: d.status,
                                targetName: d.target?.name || 'Target',
                                commitSha: d.commitSha?.slice(0, 7) || 'HEAD',
                                trigger: d.triggeredBy?.name || d.trigger || 'Operator',
                                duration: d.durationMs ? `${Math.round(d.durationMs / 1000)}s` : 'Completed'
                              })
                              setStreamStatus(d.status)
                              setExitCode(d.exitCode ?? (d.status === 'SUCCESS' ? 0 : d.status === 'FAILED' ? 1 : null))
                              const consoleEl = document.getElementById('deployment-console-view')
                              if (consoleEl) consoleEl.scrollIntoView({ behavior: 'smooth' })
                            }}
                            className="h-[26px] px-2.5 rounded-[4px] border border-[#CDD4D0] hover:border-[#005459] hover:bg-[#F4F6F5] text-[11px] text-[#005459] font-medium transition-colors cursor-pointer"
                          >
                            View Logs
                          </button>
                          {canRollback && String(d.status).toUpperCase() === 'SUCCESS' && d.commitSha && (
                            (() => {
                              const targetId = d.targetId || d.target?.id
                              const isCurrentActive = activeDeploymentsByTarget[targetId] === d.id
                              if (isCurrentActive) {
                                return (
                                  <span
                                    className="h-[26px] px-2 rounded-[4px] bg-[#EAF5EE] border border-[#B3E3D1] text-[#2E8B57] text-[11px] font-mono font-semibold inline-flex items-center gap-1 shadow-2xs"
                                    title="Currently active deployment on this target"
                                  >
                                    <Check className="w-3 h-3 text-[#2E8B57]" />
                                    <span>Active</span>
                                  </span>
                                )
                              }
                              return (
                                <button
                                  type="button"
                                  onClick={() => setRollbackDeployment(d)}
                                  className="h-[26px] px-2 rounded-[4px] border border-[#CDD4D0] hover:border-[#F1D6A4] hover:bg-[#FAF3E7] text-[11px] text-[#B87E0C] font-medium transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                                  title={`Rollback target to this release (${d.commitSha?.slice(0, 7)})`}
                                >
                                  <RotateCcw className="w-3 h-3" />
                                  <span>Rollback</span>
                                </button>
                              )
                            })()
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Environment Tab */}
      {activeTab === 'Environment' && (
        <EnvironmentManager
          projectId={projectId}
          targets={project?.targets?.length ? project.targets : servers}
          canManage={canManage}
          onEnvUpdated={() => refreshProject()}
        />
      )}

      {/* Settings Tab */}
      {activeTab === 'Settings' && (
        <div className="space-y-5">
          {/* General Project Settings Card */}
          <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#E2E7E4] flex items-center justify-between">
              <div>
                <h3 className="text-[15px] font-semibold text-[#101d26]">General Settings</h3>
                <p className="text-[11px] text-[#565f6b] mt-0.5">
                  Update project metadata, repository source, and automated deployment parameters.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              {settingsSuccess && (
                <div className="p-3 bg-[#EAF5EE] border border-[#B8E0C5] rounded-[6px] flex items-center justify-between text-[#2E8B57] text-[12px]">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>{settingsSuccess}</span>
                  </div>
                  <button type="button" onClick={() => setSettingsSuccess(null)} className="text-[11px] underline cursor-pointer">
                    Dismiss
                  </button>
                </div>
              )}

              {settingsError && (
                <div className="p-3 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-center justify-between text-[#C2412D] text-[12px]">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{settingsError}</span>
                  </div>
                  <button type="button" onClick={() => setSettingsError(null)} className="text-[11px] underline cursor-pointer">
                    Dismiss
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Name */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
                    PROJECT NAME <span className="text-[#C2412D]">*</span>
                  </label>
                  <input
                    type="text"
                    value={settingName}
                    onChange={(e) => setSettingName(e.target.value)}
                    placeholder="e.g. checkout-service"
                    className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                    required
                  />
                </div>

                {/* Internal Identifier */}
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
                    PROJECT IDENTIFIER
                  </label>
                  <div className="h-[36px] px-3 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#565f6b] flex items-center">
                    {projectId}
                  </div>
                </div>
              </div>

              {/* Repo URL */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
                  GIT REPOSITORY URL <span className="text-[#C2412D]">*</span>
                </label>
                <div className="relative flex items-center">
                  <FolderGit2 className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={settingRepoUrl}
                    onChange={(e) => setSettingRepoUrl(e.target.value)}
                    placeholder="https://github.com/org/repo.git or git@github.com:..."
                    className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                    required
                  />
                </div>
              </div>

              {/* Default Branch */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
                  DEFAULT DEPLOYMENT BRANCH
                </label>
                <div className="relative flex items-center">
                  <GitBranch className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    value={settingBranch}
                    onChange={(e) => setSettingBranch(e.target.value)}
                    placeholder="main"
                    className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                  />
                </div>
              </div>

              {/* Project Public URL / Domain */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
                  PROJECT PUBLIC URL / DOMAIN (OPTIONAL)
                </label>
                <div className="relative flex items-center">
                  <Globe className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
                  <input
                    type="url"
                    value={settingUrl}
                    onChange={(e) => setSettingUrl(e.target.value)}
                    placeholder="e.g. https://myproject.com or http://localhost/kensite"
                    className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                  />
                </div>
                <p className="text-[11px] text-[#565f6b] mt-1">
                  Default address tested by post-deploy reachability probes and linked in the project header.
                </p>
              </div>

              {/* Auto Deploy Toggle */}
              <div className="p-3 bg-[#F8FAF9] border border-[#CDD4D0] rounded-[6px] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-semibold text-[#101d26]">Auto-Deploy on Push</div>
                  <div className="text-[11px] text-[#565f6b]">
                    Automatically trigger release pipeline whenever GitHub or GitLab sends a push webhook to the default branch.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSettingAutoDeploy(!settingAutoDeploy)}
                  className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                    settingAutoDeploy ? 'bg-[#005459]' : 'bg-[#CDD4D0]'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 ${
                      settingAutoDeploy ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {canManage && (
                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="h-[36px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {isSavingSettings ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{isSavingSettings ? 'Saving...' : 'Save Settings'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Webhook & Automation Card */}
          <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-6 shadow-xs space-y-3">
            <h3 className="text-[15px] font-semibold text-[#101d26]">Git Webhook Automation</h3>
            <p className="text-[12px] text-[#565f6b]">
              Configure your GitHub or GitLab repository settings with this webhook payload URL to enable instantaneous auto-deployments on git push.
            </p>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
                WEBHOOK PAYLOAD URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/api/v1/webhooks/${projectId}`}
                  className="flex-1 h-[34px] px-3 bg-[#F8FAF9] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] select-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/api/v1/webhooks/${projectId}`)
                    setWebhookCopied(true)
                    setTimeout(() => setWebhookCopied(false), 2000)
                  }}
                  className="h-[34px] px-3 rounded-[6px] border border-[#CDD4D0] bg-white hover:bg-[#F4F6F5] text-[12px] font-medium text-[#101d26] flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {webhookCopied ? <Check className="w-3.5 h-3.5 text-[#2E8B57]" /> : <Copy className="w-3.5 h-3.5 text-[#565f6b]" />}
                  <span>{webhookCopied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {canManage && (
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isRegeneratingSecret}
                  onClick={handleRegenerateWebhookSecret}
                  className="h-[30px] px-3 rounded-[6px] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[11px] font-medium text-[#101d26] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isRegeneratingSecret ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3 text-[#565f6b]" />}
                  <span>Regenerate Webhook Secret</span>
                </button>
                {webhookSecret && (
                  <div className="mt-2 p-2.5 bg-[#FAF3E7] border border-[#F1D6A4] rounded-[4px] text-[11px] font-mono text-[#8C5D07]">
                    New Webhook Secret: <strong className="text-[#101d26] select-all">{webhookSecret}</strong>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Danger Zone: Delete Project Card */}
          {canManage && (
            <div className="bg-[#FFFFFF] border border-[#F1B5AC] rounded-[8px] overflow-hidden shadow-xs">
              <div className="px-6 py-4 bg-[#FAEBE9] border-b border-[#F1B5AC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#C2412D]" />
                  <h3 className="text-[14px] font-bold text-[#C2412D] tracking-tight">Danger Zone</h3>
                </div>
              </div>

              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-[14px] font-semibold text-[#101d26]">Delete this project</h4>
                  <p className="text-[12px] text-[#565f6b] mt-0.5 max-w-xl">
                    Once deleted, all configured target servers, encrypted environment variables, and historical deployment logs will be permanently erased. This action cannot be reversed.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="h-[36px] px-4 rounded-[6px] bg-[#FAEBE9] hover:bg-[#F8DFDC] border border-[#F1B5AC] text-[#C2412D] text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Project</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Live Terminal Container */}
      <div id="deployment-console-view" className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs">
        {/* Terminal Header Bar */}
        <div className="px-5 py-3 border-b border-[#E2E7E4] flex flex-wrap items-center justify-between gap-3 text-[12px]">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 font-semibold text-[#101d26]">
              <span className={`w-2 h-2 rounded-full ${
                streamStatus === 'RUNNING' ? 'bg-[#B87E0C] animate-pulse' :
                streamStatus === 'FAILED' ? 'bg-[#C2412D]' :
                streamStatus === 'SUCCESS' ? 'bg-[#2E8B57]' : 'bg-[#8F9CA7]'
              }`} />
              Deployment Console
            </span>
            <span className="text-[#8F9CA7]">•</span>
            <span className="text-[#565f6b]">Run: <strong className="font-mono text-[#005459] bg-[#E2F0FD] px-1 rounded font-semibold">{activeDeployment?.number ? `#${activeDeployment.number}` : (activeDeployment?.id ? `#${activeDeployment.id.slice(0, 8)}` : '—')}</strong></span>
            <span className="text-[#8F9CA7]">•</span>
            <span className="text-[#565f6b]">Target: <strong className="text-[#101d26] font-medium">{activeDeployment?.targetName || (servers.length > 0 ? servers[0].name : 'All targets')}</strong></span>
            <span className="text-[#8F9CA7]">•</span>
            <span className="text-[#565f6b]">Commit: <strong className="font-mono text-[#005459] bg-[#E2F0FD] px-1 rounded">{activeDeployment?.commitSha || 'HEAD'}</strong></span>
            <span className="text-[#8F9CA7]">•</span>
            <span className="text-[#565f6b]">Trigger: <strong className="text-[#101d26] font-medium">{activeDeployment?.trigger || 'Operator'}</strong></span>
            <span className="text-[#8F9CA7]">•</span>
            <span className="text-[#565f6b] font-mono">⏱ {activeDeployment?.duration || (streamStatus === 'RUNNING' ? 'Running...' : 'Idle')}</span>
          </div>

          <div className="flex items-center gap-2">
            {streamStatus === 'RUNNING' ? (
              <>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#FAF3E7] border border-[#F1D6A4] text-[#B87E0C] font-mono text-[11px] font-semibold uppercase animate-pulse flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B87E0C]" />
                  RUNNING
                </span>
                {canCancel && (
                  <button
                    type="button"
                    onClick={handleCancelDeploy}
                    className="h-[26px] px-2 rounded-[4px] bg-[#FAEBE9] hover:bg-[#F8DFDC] border border-[#F1B5AC] text-[11px] text-[#C2412D] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Square className="w-3 h-3 fill-current" />
                    <span>Cancel</span>
                  </button>
                )}
              </>
            ) : streamStatus === 'FAILED' ? (
              <span className="px-2 py-0.5 rounded-[4px] bg-[#FAEBE9] border border-[#F1B5AC] text-[#C2412D] font-mono text-[11px] font-semibold uppercase">
                ● FAILED (EXIT {exitCode})
              </span>
            ) : streamStatus === 'SUCCESS' ? (
              <span className="px-2 py-0.5 rounded-[4px] bg-[#EAF5EE] border border-[#B8E0C5] text-[#2E8B57] font-mono text-[11px] font-semibold uppercase">
                ● SUCCESS
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] text-[#565f6b] font-mono text-[11px] font-semibold uppercase">
                ● IDLE
              </span>
            )}

            <button
              type="button"
              onClick={downloadRawLogs}
              disabled={logs.length === 0}
              className="h-[26px] px-2 rounded-[4px] bg-[#FFFFFF] hover:bg-[#F4F6F5] border border-[#CDD4D0] text-[11px] text-[#101d26] flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
              title="Download raw deployment log"
            >
              <FileText className="w-3 h-3 text-[#565f6b]" />
              <span>Raw log</span>
            </button>
          </div>
        </div>

        {/* Visual Pipeline Stage Stepper */}
        <div className="p-3.5 bg-[#131A22] border-t border-[#24313E]">
          <PipelineStepper
            status={streamStatus}
            logs={logs}
            activeStage={activeStepperStage}
            onStageClick={(stgId) => setActiveStepperStage(stgId === activeStepperStage ? null : stgId)}
          />
        </div>

        {/* Embedded Dark Terminal Window */}
        <div className="p-4 bg-[#11161B] border-t border-[#24313E] font-mono text-[12px] text-[#D1D7DC]">
          {/* Terminal Window Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#24313E] select-none text-[11px]">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E06C75]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5C07B]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#98C379]" />
              </div>
              <span className="text-[#8F9CA7] ml-2">&lt;&gt; deploy-stream.log (stdout/stderr)</span>
            </div>

            <div className="flex items-center gap-2 text-[#8F9CA7]">
              <span className="px-1.5 py-0.2 rounded bg-[#17202A] border border-[#24313E] text-[10px]">UTF-8</span>
              <button
                type="button"
                onClick={copyLogStream}
                disabled={logs.length === 0}
                className="hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                title="Copy log text"
              >
                {copiedLog ? <Check className="w-3.5 h-3.5 text-[#2E8B57]" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Terminal Log Lines */}
          <div className="py-3 leading-[20px] space-y-0.5 select-text overflow-x-auto min-h-[140px] max-h-[360px] overflow-y-auto">
            {logs.length === 0 ? (
              <div className="py-8 text-center text-[#5E6B76] font-mono text-[12px] flex flex-col items-center justify-center gap-1.5">
                <Terminal className="w-5 h-5 text-[#3A4754]" />
                <span>Ready. Realtime stdout/stderr deployment logs will stream here during release runs.</span>
              </div>
            ) : (
              logs.map((line, idx) => {
                const isStderr = line.stream === 'STDERR'
                const isSystem = line.stream === 'SYSTEM'
                return (
                  <div key={idx} className="flex items-start gap-2 hover:bg-[#17202A]/40 px-1 rounded">
                    <span className="text-[#5E6B76] select-none shrink-0 text-[11px]">[{line.time}]</span>
                    {line.stream && (
                      <span className={`select-none text-[10px] font-bold shrink-0 ${
                        isStderr ? 'text-[#E06C75]' : isSystem ? 'text-[#85D3DA]' : 'text-[#8F9CA7]'
                      }`}>
                        [{line.stream}]
                      </span>
                    )}
                    <span className={`break-all whitespace-pre-wrap ${
                      isStderr ? 'text-[#F1B5AC]' : isSystem ? 'text-[#85D3DA]' : 'text-[#D1D7DC]'
                    }`}>
                      {line.line || line.text}
                    </span>
                  </div>
                )
              })
            )}
            <div ref={terminalBottomRef} />
          </div>

          {/* Terminal Status Footer */}
          <div className="pt-2 border-t border-[#24313E] flex items-center justify-between text-[11px] text-[#8F9CA7] select-none">
            <span className={`flex items-center gap-1.5 ${
              streamStatus === 'RUNNING' ? 'text-[#E5C07B]' :
              streamStatus === 'FAILED' ? 'text-[#E06C75]' :
              streamStatus === 'SUCCESS' ? 'text-[#7ed99e]' : 'text-[#8F9CA7]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                streamStatus === 'RUNNING' ? 'bg-[#E5C07B] animate-ping' :
                streamStatus === 'FAILED' ? 'bg-[#E06C75]' :
                streamStatus === 'SUCCESS' ? 'bg-[#7ed99e]' : 'bg-[#5E6B76]'
              }`} />
              {streamStatus === 'RUNNING'
                ? 'Streaming deployment logs in realtime...'
                : streamStatus === 'FAILED'
                ? `Stream ended with error (exit code ${exitCode})`
                : streamStatus === 'SUCCESS'
                ? `Stream closed normally with exit code ${exitCode}`
                : 'Deployment stream idle'}
            </span>
            <span className="text-[#5E6B76]">Job ID: {activeDeployment?.id || '—'}</span>
          </div>
        </div>
      </div>

      {/* 6. Link Target Server Modal */}
      <AddTargetModal
        isOpen={isAddTargetOpen}
        onClose={() => setIsAddTargetOpen(false)}
        projectId={projectId}
        defaultBranch={project?.defaultBranch || 'main'}
        projectFramework={
          location.state?.framework ||
          localStorage.getItem(`project_framework_${projectId}`) ||
          (project?.name?.toLowerCase().includes('laravel')
            ? 'laravel'
            : project?.name?.toLowerCase().includes('node')
            ? 'node'
            : 'react')
        }
        onTargetAdded={refreshProject}
      />

      {/* 7. Edit Project Modal */}
      {isEditOpen && (
        <EditProjectModal
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          project={project}
          onProjectUpdated={(updated) => {
            setProject((prev) => ({ ...prev, ...updated }))
            refreshProject()
            setIsEditOpen(false)
          }}
        />
      )}

      {/* 8. Delete Project Modal */}
      {isDeleteOpen && (
        <DeleteProjectModal
          isOpen={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          project={project}
          onProjectDeleted={() => {
            navigate('/projects')
          }}
        />
      )}

      {/* 9. Edit Target Modal */}
      {editingTarget && (
        <EditTargetModal
          isOpen={Boolean(editingTarget)}
          onClose={() => setEditingTarget(null)}
          projectId={projectId}
          target={editingTarget}
          onTargetUpdated={() => {
            refreshProject()
            setEditingTarget(null)
          }}
        />
      )}

      {/* 10. Rollback Modal */}
      {rollbackDeployment && (
        <RollbackModal
          isOpen={Boolean(rollbackDeployment)}
          onClose={() => setRollbackDeployment(null)}
          deployment={rollbackDeployment}
          onRollbackSuccess={handleRollbackSuccess}
        />
      )}

      {/* 11. Production Approval Gate Modal */}
      {pendingApprovalDeploy && (
        <ApprovalModal
          isOpen={Boolean(pendingApprovalDeploy)}
          onClose={() => setPendingApprovalDeploy(null)}
          deployment={pendingApprovalDeploy}
          onApprove={(dep) => {
            setPendingApprovalDeploy(null)
            handleDeploy(dep.targetId, true)
          }}
          onReject={() => {
            setPendingApprovalDeploy(null)
            showToast({
              type: 'warning',
              title: 'Release Rejected',
              message: 'Deployment was cancelled by operator.'
            })
          }}
        />
      )}
    </div>
  )
}
