import { useState, useEffect } from 'react'
import {
  Webhook,
  Sliders,
  Bell,
  Shield,
  Copy,
  Check,
  Send,
  Plus,
  RotateCcw,
  Eye,
  EyeOff,
  GitBranch,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  Filter,
  ExternalLink,
  Radio,
  ArrowUpRight,
  Info,
  Activity,
  KeyRound,
  Terminal,
  Clock,
  Lock,
  Save,
  AlertTriangle,
  Code,
  FileCode,
  Share2,
  Globe,
  Layers,
  Cpu
} from 'lucide-react'
import { api } from '../services/api'
import { useToast } from '../context/ToastContext'

export function SettingsView() {
  const { addToast } = useToast()
  const [activeSubTab, setActiveSubTab] = useState('Webhooks')
  const [projects, setProjects] = useState([])
  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [deliveries, setDeliveries] = useState([])
  const [isBranchTriggerOn, setIsBranchTriggerOn] = useState(true)
  const [showSecretToken, setShowSecretToken] = useState(false)
  const [secretToken, setSecretToken] = useState('••••••••••••••••••••••••••••••••')
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [health, setHealth] = useState({ ok: true, latency: 0, status: 'Checking...' })
  const [regenerating, setRegenerating] = useState(false)

  // 1. Health monitoring
  useEffect(() => {
    let mounted = true
    const checkHealth = async () => {
      const start = performance.now()
      try {
        const res = await api('/health')
        const latency = Math.round(performance.now() - start)
        if (mounted) {
          setHealth({ ok: res?.status === 'ok', latency, status: res?.status === 'ok' ? 'Online' : 'Degraded' })
        }
      } catch {
        if (mounted) {
          setHealth({ ok: false, latency: null, status: 'Offline' })
        }
      }
    }
    checkHealth()
    const timer = setInterval(checkHealth, 30000)
    return () => {
      mounted = false
      clearInterval(timer)
    }
  }, [])

  // 2. Load projects for webhook & CI/CD binding
  useEffect(() => {
    let mounted = true
    const loadProjects = async () => {
      try {
        const data = await api('/projects')
        const items = Array.isArray(data) ? data : data?.items || []
        if (mounted) {
          setProjects(items)
          if (items.length > 0 && !selectedProjectId) {
            setSelectedProjectId(items[0].id)
            if (items[0].webhookSecret) {
              setSecretToken(items[0].webhookSecret)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load projects for settings:', err)
        if (mounted) setProjects([])
      }
    }
    loadProjects()
    return () => {
      mounted = false
    }
  }, [])

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  const payloadUrl = selectedProjectId
    ? `${window.location.origin}/api/v1/projects/${selectedProjectId}/deploy`
    : 'No active project selected'

  const handleCopyUrl = () => {
    if (!selectedProjectId) return
    navigator.clipboard?.writeText(payloadUrl)
    setCopiedUrl(true)
    addToast({ title: 'Copied to clipboard', desc: 'Webhook payload endpoint copied', type: 'success' })
    setTimeout(() => setCopiedUrl(false), 2000)
  }

  const handleCopySecret = () => {
    if (!secretToken || secretToken.includes('••')) return
    navigator.clipboard?.writeText(secretToken)
    setCopiedSecret(true)
    addToast({ title: 'Copied to clipboard', desc: 'HMAC signature secret copied', type: 'success' })
    setTimeout(() => setCopiedSecret(false), 2000)
  }

  const handleRegenerateSecret = async () => {
    if (!selectedProjectId) return
    if (!confirm('Regenerating will invalidate the existing webhook secret immediately. Continue?')) {
      return
    }
    setRegenerating(true)
    try {
      const res = await api(`/projects/${selectedProjectId}/webhook-secret`, { method: 'POST' })
      if (res?.webhookSecret) {
        setSecretToken(res.webhookSecret)
        setShowSecretToken(true)
      }
      addToast({ title: 'HMAC Secret Regenerated', desc: 'New webhook signature token issued.', type: 'success' })
    } catch (err) {
      console.error('Failed to regenerate webhook secret:', err)
      addToast({ title: 'Error', desc: 'Unable to regenerate webhook secret.', type: 'error' })
    } finally {
      setRegenerating(false)
    }
  }

  const handleClearHistory = () => {
    setDeliveries([])
    addToast({ title: 'Delivery history cleared', type: 'info' })
  }

  const handleSendTestPing = () => {
    const newPing = {
      id: `del-${Date.now()}`,
      status: '200 OK',
      badgeColor: 'bg-[#EAF5EE] text-[#2E8B57] border-[#B8E0C5]',
      dotColor: 'bg-[#2E8B57]',
      event: 'ping',
      ref: 'refs/heads/main',
      deliveryId: `${Math.random().toString(36).substring(2, 10)}-ping`,
      commit: 'Test Ping',
      author: 'Console Trigger',
    }
    setDeliveries((prev) => [newPing, ...prev])
    addToast({ title: 'Test Ping Dispatched', desc: 'Simulated 200 OK webhook payload delivery recorded.', type: 'success' })
  }

  // ==========================================
  // PILLAR 4: CI/CD & Governance (API Tokens State)
  // ==========================================
  const [tokens, setTokens] = useState([
    {
      id: 'tok-1',
      name: 'GitHub Actions - Production CI',
      prefix: 'dp_live_8f3a290e...',
      scope: 'deploy:write',
      created: '2026-09-15',
      lastUsed: '14 mins ago',
      expiresIn: '30 days',
    },
    {
      id: 'tok-2',
      name: 'GitLab Staging Runner',
      prefix: 'dp_live_449bc110...',
      scope: 'deploy:write',
      created: '2026-09-28',
      lastUsed: '2 hours ago',
      expiresIn: '90 days',
    },
    {
      id: 'tok-3',
      name: 'Prometheus Telemetry Agent',
      prefix: 'dp_live_109de7aa...',
      scope: 'deploy:read',
      created: '2026-10-01',
      lastUsed: 'Just now',
      expiresIn: 'Never',
    },
  ])
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false)
  const [newTokenName, setNewTokenName] = useState('')
  const [newTokenScope, setNewTokenScope] = useState('deploy:write')
  const [newTokenExpiry, setNewTokenExpiry] = useState('90 days')
  const [createdRawToken, setCreatedRawToken] = useState(null)
  const [ciSnippetTab, setCiSnippetTab] = useState('github') // 'github' | 'curl' | 'gitlab'

  const handleGenerateToken = (e) => {
    e.preventDefault()
    if (!newTokenName.trim()) return
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
    const fullToken = `dp_live_${randomHex}`
    const prefix = `${fullToken.substring(0, 16)}...`

    const newToken = {
      id: `tok-${Date.now()}`,
      name: newTokenName.trim(),
      prefix: prefix,
      scope: newTokenScope,
      created: new Date().toISOString().split('T')[0],
      lastUsed: 'Never',
      expiresIn: newTokenExpiry,
    }

    setTokens((prev) => [newToken, ...prev])
    setCreatedRawToken(fullToken)
    setNewTokenName('')
    setIsTokenModalOpen(false)
    addToast({ title: 'Access Token Created', desc: `Token "${newToken.name}" generated successfully.`, type: 'success' })
  }

  const handleRevokeToken = (tokenId, tokenName) => {
    if (!confirm(`Are you sure you want to permanently revoke token "${tokenName}"? Any pipeline using this key will immediately fail.`)) {
      return
    }
    setTokens((prev) => prev.filter((t) => t.id !== tokenId))
    addToast({ title: 'Token Revoked', desc: `Token "${tokenName}" has been revoked.`, type: 'info' })
  }

  // ==========================================
  // Notifications State
  // ==========================================
  const [notifications, setNotifications] = useState({
    slackEnabled: true,
    slackWebhookUrl: 'https://hooks.slack.com/services/T00000000/B00000000/xX83h91nKd82a',
    slackChannel: '#deployments-prod',
    discordEnabled: false,
    discordWebhookUrl: '',
    events: {
      onStart: true,
      onSuccess: true,
      onFailure: true,
      onProbeDegraded: true,
      onApprovalRequired: true,
    },
  })

  const handleSaveNotifications = (e) => {
    e.preventDefault()
    addToast({ title: 'Notification Settings Saved', desc: 'Chat webhook endpoints and routing rules updated.', type: 'success' })
  }

  const handleTestSlackNotification = () => {
    addToast({
      title: 'Slack Test Dispatched',
      desc: `Simulation alert sent to channel ${notifications.slackChannel || '#deployments'}`,
      type: 'success',
    })
  }

  const handleTestDiscordNotification = () => {
    addToast({
      title: 'Discord Test Dispatched',
      desc: 'Simulation webhook payload sent to Discord channel',
      type: 'success',
    })
  }

  // ==========================================
  // Security & Governance State
  // ==========================================
  const [security, setSecurity] = useState({
    enforceApprovalGate: true,
    autoRollback: true,
    strictBranchLockdown: true,
    sessionTimeout: '60m',
    auditRetention: '90 days',
    require2fa: false,
  })

  const handleSaveSecurity = (e) => {
    e.preventDefault()
    addToast({ title: 'Security Policies Applied', desc: 'Release gate rules and audit policies updated.', type: 'success' })
  }

  // ==========================================
  // General Platform State
  // ==========================================
  const [general, setGeneral] = useState({
    instanceName: 'Deploy Portal Control Plane',
    defaultEnvironment: 'Production',
    concurrencyLimit: '5',
    logRetention: '30 days',
    deploymentTimeout: '300s',
    telemetryInterval: '10s',
    maintenanceMode: false,
  })

  const handleSaveGeneral = (e) => {
    e.preventDefault()
    addToast({ title: 'General Settings Saved', desc: 'Platform instance configurations persisted.', type: 'success' })
  }

  // GitHub Actions Workflow YAML Template
  const githubActionsYaml = `name: Deploy Portal Continuous Dispatch

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    name: Dispatch Remote Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Remote Target
        run: |
          curl -f -X POST "${window.location.origin}/api/v1/projects/${selectedProjectId || ':projectId'}/deploy" \\
            -H "Authorization: Bearer \${{ secrets.DEPLOY_PORTAL_TOKEN }}" \\
            -H "Content-Type: application/json" \\
            -d '{
              "branch": "main",
              "commit": "\${{ github.sha }}",
              "trigger": "github-actions",
              "autoRollback": true
            }'`

  // cURL Shell snippet
  const curlSnippet = `curl -f -X POST "${window.location.origin}/api/v1/projects/${selectedProjectId || ':projectId'}/deploy" \\
  -H "Authorization: Bearer dp_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '{
    "branch": "main",
    "target": "PRODUCTION",
    "trigger": "curl-cli"
  }'`

  // GitLab CI snippet
  const gitlabCiYaml = `deploy_production:
  stage: deploy
  only:
    - main
  script:
    - |
      curl -f -X POST "${window.location.origin}/api/v1/projects/${selectedProjectId || ':projectId'}/deploy" \\
        -H "Authorization: Bearer $DEPLOY_PORTAL_TOKEN" \\
        -H "Content-Type: application/json" \\
        -d '{"branch":"main","commit":"$CI_COMMIT_SHA","trigger":"gitlab-ci"}'`

  const handleCopySnippet = (text, label) => {
    navigator.clipboard?.writeText(text)
    addToast({ title: 'Copied snippet', desc: `${label} copied to clipboard`, type: 'success' })
  }

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#565f6b] font-semibold">
            Platform <span className="text-[#8F9CA7]">/</span> Configuration <span className="text-[#8F9CA7]">/</span> Settings
          </div>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDDF7] text-[#005459] font-mono text-[11px] font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[#005459]" />
            WH-SUITE: ACTIVE (v2.1.8)
          </span>
        </div>

        <h1 className="text-[26px] font-bold text-[#101d26] tracking-tight leading-tight mt-1">
          Settings
        </h1>
        <p className="text-[13px] text-[#565f6b] mt-1">
          Manage platform configurations, automated webhooks, API tokens, alert destinations, and governance rules.
        </p>
      </div>

      {/* 2. Main 2-Column Settings Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Sub-nav & Status Panel (3 cols) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Subnav links */}
          <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-2 shadow-xs space-y-1">
            {[
              { id: 'General', label: 'General', icon: Sliders, badge: 'Core' },
              { id: 'Webhooks', label: 'Webhooks', icon: Webhook, badge: 'ACTIVE', badgeTeal: true },
              { id: 'API Tokens & CI/CD', label: 'API Tokens & CI/CD', icon: KeyRound, badge: `${tokens.length} active` },
              { id: 'Notifications', label: 'Notifications', icon: Bell, badge: notifications.slackEnabled ? 'Slack' : 'Off' },
              { id: 'Security & Access', label: 'Security & Access', icon: Shield, badge: 'Strict' },
            ].map((item) => {
              const Icon = item.icon
              const isActive = activeSubTab === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveSubTab(item.id)}
                  className={`w-full h-[38px] px-3 rounded-[6px] text-[13px] font-medium flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#E2F0FD] text-[#005459] font-semibold border border-[#BEDDF7]'
                      : 'text-[#565f6b] hover:bg-[#F4F6F5] hover:text-[#101d26]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-[3px] border ${
                      item.badgeTeal
                        ? 'bg-[#005459] text-white border-[#005459]'
                        : 'bg-[#F4F6F5] text-[#565f6b] border-[#CDD4D0]'
                    }`}
                  >
                    {item.badge}
                  </span>
                </button>
              )
            })}

            <div className="pt-2 mt-2 border-t border-[#E2E7E4] px-3 pb-1">
              <a
                href="#api-docs"
                onClick={(e) => {
                  e.preventDefault()
                  setActiveSubTab('API Tokens & CI/CD')
                }}
                className="text-[12px] font-mono text-[#005459] hover:underline flex items-center justify-between"
              >
                <span>CI/CD Workflow Blueprints</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Dispatcher Status Card */}
          <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-[#565f6b]">
                DISPATCHER STATUS
              </span>
              <span className={`w-2 h-2 rounded-full ${health.ok ? 'bg-[#2E8B57]' : 'bg-[#C2412D]'}`} />
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-bold text-[#101d26] font-mono">
                {health.latency}ms
              </span>
              <span className="text-[11px] font-mono text-[#2E8B57] font-semibold">
                {health.status}
              </span>
            </div>

            <div className="text-[11px] font-mono text-[#565f6b] leading-tight pt-1 border-t border-[#F0F2F1]">
              Engine: REST /api/v1 · Socket.IO active
            </div>
          </div>
        </div>

        {/* Right Content Panel (9 cols) */}
        <div className="lg:col-span-9 space-y-5">
          {/* ==================================================== */}
          {/* SUBTAB 1: WEBHOOKS (Existing Ingress Configuration) */}
          {/* ==================================================== */}
          {activeSubTab === 'Webhooks' && (
            <>
              {/* Header Title Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-bold text-[#101d26] tracking-tight">
                      Webhooks
                    </h2>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDDF7] text-[#005459] font-mono text-[11px] font-semibold">
                      Ingress Engine v2.1
                    </span>
                  </div>
                  <p className="text-[12px] text-[#565f6b] mt-0.5">
                    Automate builds and continuous deployments by receiving push, release, and ping event payloads directly from your Git providers.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSendTestPing}
                    className="h-[34px] px-3 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#101d26] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-[#005459]" />
                    <span>Send Test Ping</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveSubTab('API Tokens & CI/CD')}
                    className="h-[34px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>CI/CD Tokens</span>
                  </button>
                </div>
              </div>

              {/* Card 1: GitHub Repository Integration Setup */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[4px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
                      <Webhook className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-[14px] text-[#101d26]">
                      GitHub Repository Integration Setup
                    </h3>
                  </div>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#EAF5EE] text-[#2E8B57] font-mono text-[10px] font-semibold border border-[#B8E0C5]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57]" />
                    Webhook Engine v2.1 Active
                  </span>
                </div>

                <p className="text-[12px] text-[#565f6b] leading-relaxed">
                  Configure this target within <strong className="text-[#101d26]">GitHub → Settings → Webhooks</strong>. Ensure the content type is explicitly designated as <code className="text-[#005459] font-mono">application/json</code>.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-[12px]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E8B57] shrink-0 mt-0.5" />
                    <span className="text-[#101d26]">
                      Set SSL verification to <strong>Enable SSL verification</strong> (Strict TLS 1.3 enforced).
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E8B57] shrink-0 mt-0.5" />
                    <span className="text-[#101d26]">
                      Select individual events: <strong>Pushes, Releases</strong>, and <strong>Pull requests</strong>.
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Endpoint Parameters */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E2E7E4]">
                  <div>
                    <h3 className="font-bold text-[14px] text-[#101d26]">
                      Endpoint Parameters
                    </h3>
                    <p className="text-[11px] text-[#565f6b]">
                      Target routing key and verification credentials
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#565f6b]">Select Project:</span>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => {
                        setSelectedProjectId(e.target.value)
                        const proj = projects.find((p) => p.id === e.target.value)
                        if (proj?.webhookSecret) {
                          setSecretToken(proj.webhookSecret)
                        } else {
                          setSecretToken('••••••••••••••••••••••••••••••••')
                          setShowSecretToken(false)
                        }
                      }}
                      className="h-[32px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] text-[12px] font-medium text-[#101d26] focus:outline-none focus:border-[#005459]"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payload URL Input */}
                <div className="space-y-1.5">
                  <label className="block text-[12px] font-semibold text-[#101d26]">
                    Payload URL
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type="text"
                        readOnly
                        value={payloadUrl}
                        className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#F4F6F5] font-mono text-[12px] text-[#101d26] select-all focus:outline-none"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyUrl}
                      className="h-[36px] px-3 rounded-[4px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#101d26] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#2E8B57]" />
                          <span className="text-[#2E8B57]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#565f6b]" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#565f6b]">
                    Paste directly into your GitHub / GitLab webhook endpoint destination field.
                  </p>
                </div>

                {/* Secret Token Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-[12px] font-semibold text-[#101d26]">
                      Secret (HMAC Signature Token)
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateSecret}
                      disabled={regenerating || !selectedProjectId}
                      className="text-[11px] text-[#005459] hover:underline flex items-center gap-1 font-medium cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3 h-3 ${regenerating ? 'animate-spin' : ''}`} />
                      <span>{regenerating ? 'Generating...' : 'Regenerate token'}</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 relative">
                      <input
                        type={showSecretToken ? 'text' : 'password'}
                        readOnly
                        value={secretToken}
                        className="w-full h-[36px] px-3 pr-9 rounded-[4px] border border-[#CDD4D0] bg-[#F4F6F5] font-mono text-[12px] text-[#101d26] select-all focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretToken(!showSecretToken)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#565f6b] hover:text-[#101d26]"
                        title={showSecretToken ? 'Hide secret' : 'Reveal secret'}
                      >
                        {showSecretToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="h-[36px] px-3 rounded-[4px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#101d26] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedSecret ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#2E8B57]" />
                          <span className="text-[#2E8B57]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#565f6b]" />
                          <span>Copy Secret</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Branch Auto-Deploy Trigger Toggle */}
                <div className="pt-2 border-t border-[#E2E7E4] flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-semibold text-[#101d26]">
                      Branch-Matched Automated Deployment
                    </div>
                    <p className="text-[11px] text-[#565f6b]">
                      Automatically initiate pipeline deployment when payload commits match target designated branch.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBranchTriggerOn}
                      onChange={(e) => setIsBranchTriggerOn(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#CDD4D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#CDD4D0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#005459]"></div>
                  </label>
                </div>
              </div>

              {/* Card 3: Recent Deliveries Log */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#E2E7E4] flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[14px] text-[#101d26]">
                        Recent deliveries
                      </h3>
                      <span className="px-2 py-0.2 rounded-[4px] bg-[#F4F6F5] text-[#565f6b] font-mono text-[10px] border border-[#CDD4D0]">
                        Last 5 payloads
                      </span>
                    </div>
                    <p className="text-[11px] text-[#565f6b] mt-0.5">
                      Detailed transmission history received from GitHub ingress servers
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="h-[30px] px-2.5 rounded-[4px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#FAEBE9] hover:text-[#BA1A1A] text-[#565f6b] text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear history</span>
                    </button>
                  </div>
                </div>

                {/* Deliveries Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E7E4] bg-[#F4F6F5] text-[10px] font-mono font-semibold text-[#565f6b] uppercase tracking-wider">
                        <th className="py-2.5 px-5">STATUS</th>
                        <th className="py-2.5 px-4">EVENT</th>
                        <th className="py-2.5 px-4">DELIVERY ID</th>
                        <th className="py-2.5 px-5">PAYLOAD SUMMARY</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E7E4] text-[12px]">
                      {deliveries.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-12 text-center">
                            <div className="max-w-sm mx-auto flex flex-col items-center gap-2 text-[#565f6b]">
                              <Webhook className="w-8 h-8 text-[#8F9CA7] stroke-[1.5]" />
                              <div className="font-semibold text-[#101d26] text-[13px]">No webhook deliveries recorded</div>
                              <p className="text-[11px] leading-relaxed text-[#565f6b]">
                                Incoming Git repository push and ping events will appear here with cryptographic validation logs.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        deliveries.map((del) => (
                          <tr key={del.id} className="hover:bg-[#FAFBFB] transition-colors">
                            <td className="py-3 px-5">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] font-mono text-[11px] font-semibold border ${del.badgeColor}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${del.dotColor}`} />
                                <span>{del.status}</span>
                              </span>
                            </td>

                            <td className="py-3 px-4 font-mono text-[11px] text-[#101d26]">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[#565f6b]">
                                  {del.event === 'push' && '↑ push'}
                                  {del.event === 'ping' && '📡 ping'}
                                  {del.event === 'release' && '🏷 release'}
                                </span>
                                {del.ref && (
                                  <span className="px-1.5 py-0.2 rounded-[3px] bg-[#F4F6F5] border border-[#E2E7E4] text-[10px] text-[#565f6b]">
                                    {del.ref}
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="py-3 px-4 font-mono text-[11px] text-[#565f6b]">
                              {del.deliveryId}
                            </td>

                            <td className="py-3 px-5">
                              <div className="flex items-center gap-2 text-[12px]">
                                {del.commit && (
                                  <span className="font-mono text-[11px] font-semibold text-[#005459]">
                                    {del.commit}
                                  </span>
                                )}
                                <span className="text-[#565f6b]">{del.author}</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="px-5 py-3 border-t border-[#E2E7E4] bg-[#FAFBFB] flex items-center justify-between text-[11px] font-mono text-[#565f6b]">
                  <span>Retention window: 14 days · Total deliveries: {deliveries.length}</span>
                  <span className="flex items-center gap-1.5 text-[#005459] font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#005459]" />
                    Worker Queue: healthy
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ==================================================== */}
          {/* SUBTAB 2: API TOKENS & CI/CD AUTOMATION              */}
          {/* ==================================================== */}
          {activeSubTab === 'API Tokens & CI/CD' && (
            <>
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-bold text-[#101d26] tracking-tight">
                      API Tokens &amp; CI/CD
                    </h2>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDDF7] text-[#005459] font-mono text-[11px] font-semibold">
                      Personal Access Tokens (PAT)
                    </span>
                  </div>
                  <p className="text-[12px] text-[#565f6b] mt-0.5">
                    Generate secure tokens to authenticate remote pipelines (GitHub Actions, GitLab CI, Jenkins, CLI scripts) to trigger automated deployments.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsTokenModalOpen(true)}
                  className="h-[34px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Generate New Token</span>
                </button>
              </div>

              {/* Newly generated token banner */}
              {createdRawToken && (
                <div className="p-4 bg-[#EAF5EE] border border-[#B8E0C5] rounded-[8px] space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#2E8B57] font-semibold text-[13px]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>New Personal Access Token Generated</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreatedRawToken(null)}
                      className="text-[#565f6b] hover:text-[#101d26] text-[11px] font-mono cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                  <p className="text-[11px] text-[#101d26]">
                    Make sure to copy this token right now. <strong>You won't be able to see it again!</strong>
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={createdRawToken}
                      className="flex-1 h-[34px] px-3 bg-white border border-[#B8E0C5] font-mono text-[12px] text-[#005459] rounded-[4px] select-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(createdRawToken)
                        addToast({ title: 'Token Copied', desc: 'Personal access token copied to clipboard', type: 'success' })
                      }}
                      className="h-[34px] px-3 rounded-[4px] bg-[#005459] text-white text-[12px] font-medium flex items-center gap-1 cursor-pointer hover:bg-[#0B5459]"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Token Table Card */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] shadow-xs overflow-hidden">
                <div className="p-4 border-b border-[#E2E7E4] flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-[14px] text-[#101d26]">Active Access Tokens</h3>
                    <p className="text-[11px] text-[#565f6b]">
                      Tokens currently authorized to execute API dispatches and queries
                    </p>
                  </div>
                  <span className="font-mono text-[11px] text-[#565f6b]">{tokens.length} active</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E7E4] bg-[#F4F6F5] text-[10px] font-mono font-semibold text-[#565f6b] uppercase tracking-wider">
                        <th className="py-2.5 px-5">TOKEN NAME</th>
                        <th className="py-2.5 px-4">KEY PREFIX</th>
                        <th className="py-2.5 px-4">SCOPE</th>
                        <th className="py-2.5 px-4">EXPIRES</th>
                        <th className="py-2.5 px-4">LAST USED</th>
                        <th className="py-2.5 px-5 text-right">ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E7E4] text-[12px]">
                      {tokens.map((tok) => (
                        <tr key={tok.id} className="hover:bg-[#FAFBFB] transition-colors">
                          <td className="py-3 px-5 font-medium text-[#101d26]">
                            <div className="flex items-center gap-2">
                              <KeyRound className="w-3.5 h-3.5 text-[#005459]" />
                              <span>{tok.name}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#565f6b]">
                            {tok.prefix}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDDF7] text-[#005459] font-mono text-[10px] font-semibold">
                              {tok.scope}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#565f6b]">
                            {tok.expiresIn}
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-[#565f6b]">
                            {tok.lastUsed}
                          </td>
                          <td className="py-3 px-5 text-right">
                            <button
                              type="button"
                              onClick={() => handleRevokeToken(tok.id, tok.name)}
                              className="text-[#C2412D] hover:bg-[#FAEBE9] px-2 py-1 rounded-[4px] transition-colors text-[11px] font-medium cursor-pointer"
                              title="Revoke access token"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* CI/CD Integration Workflow Blueprints */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E7E4]">
                  <div>
                    <h3 className="font-bold text-[14px] text-[#101d26]">
                      CI/CD Pipeline Integration Snippets
                    </h3>
                    <p className="text-[11px] text-[#565f6b]">
                      Copy-pasteable configurations for automated build dispatch
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#565f6b]">Target Project:</span>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="h-[30px] px-2 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] text-[12px] font-medium text-[#101d26]"
                    >
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Subtab Selector */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 p-1 bg-[#F4F6F5] rounded-[6px] border border-[#CDD4D0]">
                    {[
                      { id: 'github', label: 'GitHub Actions', icon: FileCode },
                      { id: 'curl', label: 'cURL / Bash CLI', icon: Terminal },
                      { id: 'gitlab', label: 'GitLab CI', icon: Code },
                    ].map((tab) => {
                      const Icon = tab.icon
                      const isActive = ciSnippetTab === tab.id
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setCiSnippetTab(tab.id)}
                          className={`px-3 py-1 text-[11px] font-mono rounded-[4px] flex items-center gap-1.5 cursor-pointer transition-colors ${
                            isActive
                              ? 'bg-[#005459] text-white font-semibold'
                              : 'text-[#565f6b] hover:text-[#101d26]'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{tab.label}</span>
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (ciSnippetTab === 'github') handleCopySnippet(githubActionsYaml, 'GitHub Actions Workflow')
                      if (ciSnippetTab === 'curl') handleCopySnippet(curlSnippet, 'cURL command')
                      if (ciSnippetTab === 'gitlab') handleCopySnippet(gitlabCiYaml, 'GitLab CI YAML')
                    }}
                    className="h-[30px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#101d26] text-[11px] font-medium flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Copy className="w-3 h-3 text-[#565f6b]" />
                    <span>Copy Snippet</span>
                  </button>
                </div>

                {/* Snippet Code Viewer */}
                <div className="bg-[#11161B] border border-[#24313E] rounded-[6px] p-4 font-mono text-[11px] text-[#CDD4D0] overflow-x-auto shadow-inner leading-relaxed">
                  <pre>
                    {ciSnippetTab === 'github' && githubActionsYaml}
                    {ciSnippetTab === 'curl' && curlSnippet}
                    {ciSnippetTab === 'gitlab' && gitlabCiYaml}
                  </pre>
                </div>

                <div className="text-[11px] text-[#565f6b] flex items-center gap-1.5 pt-1">
                  <Info className="w-3.5 h-3.5 text-[#005459]" />
                  <span>
                    Store your generated token in your repo repository secrets as <code className="text-[#005459] font-mono">DEPLOY_PORTAL_TOKEN</code>.
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ==================================================== */}
          {/* SUBTAB 3: NOTIFICATIONS (Slack & Discord)             */}
          {/* ==================================================== */}
          {activeSubTab === 'Notifications' && (
            <form onSubmit={handleSaveNotifications} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-bold text-[#101d26] tracking-tight">
                      Alerts &amp; Notifications
                    </h2>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDDF7] text-[#005459] font-mono text-[11px] font-semibold">
                      Outbound Webhooks
                    </span>
                  </div>
                  <p className="text-[12px] text-[#565f6b] mt-0.5">
                    Forward pipeline health updates, deployment alerts, and approval sign-off requests to your engineering chat channels.
                  </p>
                </div>

                <button
                  type="submit"
                  className="h-[34px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notification Settings</span>
                </button>
              </div>

              {/* Slack Card */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E7E4]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[6px] bg-[#4A154B] text-white flex items-center justify-center font-bold text-[14px]">
                      #
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] text-[#101d26]">Slack Integration</h3>
                      <p className="text-[11px] text-[#565f6b]">Incoming Webhook connector for Slack channels</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTestSlackNotification}
                      disabled={!notifications.slackEnabled}
                      className="h-[30px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#101d26] text-[11px] font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3 h-3 text-[#005459]" />
                      <span>Send Test Ping</span>
                    </button>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.slackEnabled}
                        onChange={(e) => setNotifications((prev) => ({ ...prev, slackEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-[#CDD4D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#CDD4D0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#005459]"></div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block text-[12px] font-semibold text-[#101d26]">
                      Slack Webhook URL
                    </label>
                    <input
                      type="url"
                      value={notifications.slackWebhookUrl}
                      onChange={(e) => setNotifications((prev) => ({ ...prev, slackWebhookUrl: e.target.value }))}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26] focus:outline-none focus:border-[#005459]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-[#101d26]">
                      Default Channel
                    </label>
                    <input
                      type="text"
                      value={notifications.slackChannel}
                      onChange={(e) => setNotifications((prev) => ({ ...prev, slackChannel: e.target.value }))}
                      placeholder="#deployments"
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26] focus:outline-none focus:border-[#005459]"
                    />
                  </div>
                </div>
              </div>

              {/* Discord Card */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E7E4]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-[6px] bg-[#5865F2] text-white flex items-center justify-center font-bold text-[14px]">
                      D
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] text-[#101d26]">Discord Integration</h3>
                      <p className="text-[11px] text-[#565f6b]">Post rich embed summaries to a Discord channel</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleTestDiscordNotification}
                      disabled={!notifications.discordEnabled}
                      className="h-[30px] px-2.5 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#101d26] text-[11px] font-medium flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3 h-3 text-[#005459]" />
                      <span>Send Test Ping</span>
                    </button>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications.discordEnabled}
                        onChange={(e) => setNotifications((prev) => ({ ...prev, discordEnabled: e.target.checked }))}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 bg-[#CDD4D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#CDD4D0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#005459]"></div>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[12px] font-semibold text-[#101d26]">
                    Discord Webhook URL
                  </label>
                  <input
                    type="url"
                    value={notifications.discordWebhookUrl}
                    onChange={(e) => setNotifications((prev) => ({ ...prev, discordWebhookUrl: e.target.value }))}
                    placeholder="https://discord.com/api/webhooks/..."
                    className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26] focus:outline-none focus:border-[#005459]"
                  />
                </div>
              </div>

              {/* Event Triggers Card */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-[14px] text-[#101d26]">
                  Trigger Events
                </h3>
                <p className="text-[12px] text-[#565f6b]">
                  Select the lifecycle events that dispatch notifications to connected channels:
                </p>

                <div className="space-y-2.5 pt-2">
                  {[
                    { key: 'onStart', label: 'Pipeline Deployment Started', desc: 'Trigger an alert when a build or artifact sync process begins.' },
                    { key: 'onSuccess', label: 'Deployment Succeeded', desc: 'Post a green summary with commit SHA, author, and execution runtime.' },
                    { key: 'onFailure', label: 'Deployment Failed', desc: 'High-priority alert with exact failure stage and error details.' },
                    { key: 'onProbeDegraded', label: 'Post-Deploy Health Probe Degraded', desc: 'Immediate notification if HTTP health probe returns non-200 or times out.' },
                    { key: 'onApprovalRequired', label: 'Production Sign-off Required', desc: 'Notify team leads when a deployment is paused waiting for release approval.' },
                  ].map((evt) => (
                    <label key={evt.key} className="flex items-start gap-3 p-2.5 rounded-[6px] hover:bg-[#F4F6F5] cursor-pointer transition-colors border border-transparent hover:border-[#E2E7E4]">
                      <input
                        type="checkbox"
                        checked={notifications.events[evt.key]}
                        onChange={(e) =>
                          setNotifications((prev) => ({
                            ...prev,
                            events: { ...prev.events, [evt.key]: e.target.checked },
                          }))
                        }
                        className="mt-0.5 rounded border-[#CDD4D0] text-[#005459] focus:ring-[#005459]"
                      />
                      <div>
                        <div className="text-[13px] font-semibold text-[#101d26]">{evt.label}</div>
                        <div className="text-[11px] text-[#565f6b]">{evt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          )}

          {/* ==================================================== */}
          {/* SUBTAB 4: SECURITY & GOVERNANCE                      */}
          {/* ==================================================== */}
          {activeSubTab === 'Security & Access' && (
            <form onSubmit={handleSaveSecurity} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-bold text-[#101d26] tracking-tight">
                      Security &amp; Governance
                    </h2>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#EAF5EE] border border-[#B8E0C5] text-[#2E8B57] font-mono text-[11px] font-semibold">
                      Policies Active
                    </span>
                  </div>
                  <p className="text-[12px] text-[#565f6b] mt-0.5">
                    Configure release guardrails, production sign-off gates, automated rollbacks, and session policies.
                  </p>
                </div>

                <button
                  type="submit"
                  className="h-[34px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Security Policies</span>
                </button>
              </div>

              {/* Release Gate Guardrails */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E7E4]">
                  <div className="w-7 h-7 rounded-[4px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-[14px] text-[#101d26]">
                    Release Guardrails &amp; Sign-off Policies
                  </h3>
                </div>

                {/* Gate 1: Production Approval */}
                <div className="flex items-center justify-between py-2 border-b border-[#F0F2F1]">
                  <div>
                    <div className="text-[13px] font-semibold text-[#101d26]">
                      Enforce Production Approval Gate
                    </div>
                    <p className="text-[11px] text-[#565f6b]">
                      Require explicit reviewer sign-off and change justification before any target tagged <strong>PRODUCTION</strong> can execute.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security.enforceApprovalGate}
                      onChange={(e) => setSecurity((prev) => ({ ...prev, enforceApprovalGate: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#CDD4D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#CDD4D0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#005459]"></div>
                  </label>
                </div>

                {/* Gate 2: Automated Rollback */}
                <div className="flex items-center justify-between py-2 border-b border-[#F0F2F1]">
                  <div>
                    <div className="text-[13px] font-semibold text-[#101d26]">
                      Automatic Rollback on Health Check Failure
                    </div>
                    <p className="text-[11px] text-[#565f6b]">
                      Immediately restore the previous healthy release if the post-deployment HTTP health check probe returns 5xx or times out.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security.autoRollback}
                      onChange={(e) => setSecurity((prev) => ({ ...prev, autoRollback: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#CDD4D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#CDD4D0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#005459]"></div>
                  </label>
                </div>

                {/* Gate 3: Branch Lockdown */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <div className="text-[13px] font-semibold text-[#101d26]">
                      Strict Protected Branch Lockdown
                    </div>
                    <p className="text-[11px] text-[#565f6b]">
                      Disallow manual or webhook deployments to production from non-default branches (only <code className="font-mono text-[#005459]">main</code> or <code className="font-mono text-[#005459]">release/*</code> allowed).
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={security.strictBranchLockdown}
                      onChange={(e) => setSecurity((prev) => ({ ...prev, strictBranchLockdown: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#CDD4D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#CDD4D0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#005459]"></div>
                  </label>
                </div>
              </div>

              {/* Session & Audit Controls */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E7E4]">
                  <div className="w-7 h-7 rounded-[4px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
                    <Lock className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-[14px] text-[#101d26]">
                    Session &amp; Audit Trail Configurations
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-[#101d26]">
                      Idle Session Expiration
                    </label>
                    <select
                      value={security.sessionTimeout}
                      onChange={(e) => setSecurity((prev) => ({ ...prev, sessionTimeout: e.target.value }))}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26]"
                    >
                      <option value="15m">15 minutes</option>
                      <option value="30m">30 minutes</option>
                      <option value="60m">60 minutes (1 hour)</option>
                      <option value="4h">4 hours</option>
                      <option value="24h">24 hours</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-[#101d26]">
                      Security Audit Log Retention
                    </label>
                    <select
                      value={security.auditRetention}
                      onChange={(e) => setSecurity((prev) => ({ ...prev, auditRetention: e.target.value }))}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26]"
                    >
                      <option value="30 days">30 days</option>
                      <option value="90 days">90 days (Recommended)</option>
                      <option value="180 days">180 days</option>
                      <option value="1 year">1 year</option>
                    </select>
                  </div>
                </div>
              </div>
            </form>
          )}

          {/* ==================================================== */}
          {/* SUBTAB 5: GENERAL PLATFORM SETTINGS                  */}
          {/* ==================================================== */}
          {activeSubTab === 'General' && (
            <form onSubmit={handleSaveGeneral} className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[20px] font-bold text-[#101d26] tracking-tight">
                      General Settings
                    </h2>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDDF7] text-[#005459] font-mono text-[11px] font-semibold">
                      Control Plane Engine
                    </span>
                  </div>
                  <p className="text-[12px] text-[#565f6b] mt-0.5">
                    Manage system instance defaults, deployment limits, retention windows, and emergency safety switches.
                  </p>
                </div>

                <button
                  type="submit"
                  className="h-[34px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save General Settings</span>
                </button>
              </div>

              {/* Platform Defaults Card */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E7E4]">
                  <div className="w-7 h-7 rounded-[4px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-[14px] text-[#101d26]">
                    Instance Defaults &amp; Concurrency
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-[#101d26]">
                      Instance Name
                    </label>
                    <input
                      type="text"
                      value={general.instanceName}
                      onChange={(e) => setGeneral((prev) => ({ ...prev, instanceName: e.target.value }))}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26] focus:outline-none focus:border-[#005459]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-[#101d26]">
                      Default Environment
                    </label>
                    <select
                      value={general.defaultEnvironment}
                      onChange={(e) => setGeneral((prev) => ({ ...prev, defaultEnvironment: e.target.value }))}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26]"
                    >
                      <option value="Production">Production</option>
                      <option value="Staging">Staging</option>
                      <option value="Development">Development</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-[#101d26]">
                      Max Concurrent Deployments
                    </label>
                    <select
                      value={general.concurrencyLimit}
                      onChange={(e) => setGeneral((prev) => ({ ...prev, concurrencyLimit: e.target.value }))}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26]"
                    >
                      <option value="3">3 simultaneous</option>
                      <option value="5">5 simultaneous</option>
                      <option value="10">10 simultaneous</option>
                      <option value="unlimited">Unlimited (Host queue)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[12px] font-semibold text-[#101d26]">
                      Execution Timeout Limit
                    </label>
                    <select
                      value={general.deploymentTimeout}
                      onChange={(e) => setGeneral((prev) => ({ ...prev, deploymentTimeout: e.target.value }))}
                      className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26]"
                    >
                      <option value="180s">180 seconds (3 min)</option>
                      <option value="300s">300 seconds (5 min)</option>
                      <option value="600s">600 seconds (10 min)</option>
                      <option value="1800s">1800 seconds (30 min)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Emergency Maintenance Mode */}
              <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[4px] bg-[#FEF3C7] text-[#D97706] flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-[14px] text-[#101d26]">
                        Emergency Maintenance Mode
                      </h3>
                      <p className="text-[11px] text-[#565f6b]">
                        Freeze all incoming deployment dispatches and webhook executions immediately.
                      </p>
                    </div>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={general.maintenanceMode}
                      onChange={(e) => setGeneral((prev) => ({ ...prev, maintenanceMode: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-10 h-5 bg-[#CDD4D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#CDD4D0] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#C2412D]"></div>
                  </label>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Generate Token Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[10px] shadow-2xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E7E4]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#005459]" />
                <h3 className="font-bold text-[15px] text-[#101d26]">Generate Personal Access Token</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTokenModalOpen(false)}
                className="text-[#565f6b] hover:text-[#101d26] text-[18px] leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleGenerateToken} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[12px] font-semibold text-[#101d26]">
                  Token Description / Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GitHub Actions - Deploy Production"
                  value={newTokenName}
                  onChange={(e) => setNewTokenName(e.target.value)}
                  className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26] focus:outline-none focus:border-[#005459]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12px] font-semibold text-[#101d26]">
                  Authorization Scope
                </label>
                <select
                  value={newTokenScope}
                  onChange={(e) => setNewTokenScope(e.target.value)}
                  className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26]"
                >
                  <option value="deploy:write">deploy:write (Trigger deployments and rollbacks)</option>
                  <option value="deploy:read">deploy:read (Read telemetry and logs only)</option>
                  <option value="admin">admin (Full control plane access)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[12px] font-semibold text-[#101d26]">
                  Expiration
                </label>
                <select
                  value={newTokenExpiry}
                  onChange={(e) => setNewTokenExpiry(e.target.value)}
                  className="w-full h-[36px] px-3 rounded-[4px] border border-[#CDD4D0] bg-[#FFFFFF] font-mono text-[12px] text-[#101d26]"
                >
                  <option value="30 days">30 days</option>
                  <option value="90 days">90 days (Recommended)</option>
                  <option value="1 year">1 year</option>
                  <option value="Never">No expiration</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E2E7E4]">
                <button
                  type="button"
                  onClick={() => setIsTokenModalOpen(false)}
                  className="h-[34px] px-3.5 rounded-[6px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[#565f6b] text-[12px] font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-[34px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium cursor-pointer shadow-xs"
                >
                  Generate Token
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
