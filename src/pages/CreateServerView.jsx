import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Plus,
  Server,
  HelpCircle,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Shield,
  KeyRound,
  Terminal,
  RefreshCw,
  Cpu,
  Layers,
  Database,
  Shuffle,
  Info,
} from 'lucide-react'
import {
  DigitalOceanLogo,
  HetznerLogo,
  VultrLogo,
  LinodeLogo,
  AmazonEC2Logo,
  UpCloudLogo,
  KrystalLogo,
  HostingerLogo,
  CustomServerLogo,
} from '../components/ProviderLogos'
import { api, ApiError } from '../services/api'
import { useToast } from '../context/ToastContext'

// Fun auto-generated memorable names generator
const ADJECTIVES = [
  'fancy', 'stellar', 'hyper', 'brave', 'swift', 'amber', 'silent', 'cosmic',
  'mighty', 'vivid', 'rapid', 'lunar', 'quantum', 'golden', 'frosty', 'neon'
]
const NOUNS = [
  'raccoon', 'falcon', 'badger', 'lynx', 'panther', 'otter', 'dolphin', 'phoenix',
  'sparrow', 'comet', 'horizon', 'beacon', 'atlas', 'titan', 'nebula', 'tiger'
]

function generateServerName() {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]
  return `${adj}-${noun}`
}

export function CreateServerView() {
  const navigate = useNavigate()
  const { addToast } = useToast()

  // Selected Provider
  const [selectedProvider, setSelectedProvider] = useState('custom') // 'custom' by default for BYOS, or 'digitalocean', etc.
  const [isServerTypesModalOpen, setIsServerTypesModalOpen] = useState(false)

  // Saved Provider Credentials
  const [savedCredentials, setSavedCredentials] = useState([])
  const [selectedCredentialId, setSelectedCredentialId] = useState('')

  // Form Fields
  const [serverName, setServerName] = useState(() => generateServerName())
  const [serverOs, setServerOs] = useState('Ubuntu 24.04 LTS')
  const [serverType, setServerType] = useState('Server')
  const [plan, setPlan] = useState('Standard - 1 vCPU, 2GB RAM, 50GB NVMe ($6/mo)')
  const [region, setRegion] = useState('Frankfurt (eu-central-1)')

  // BYOS / Custom Server Specific Fields
  const [customMethod, setCustomMethod] = useState('script') // 'script' | 'manual'
  const [hostIp, setHostIp] = useState('')
  const [port, setPort] = useState('22')
  const [username, setUsername] = useState('deploy')
  const [authMethod, setAuthMethod] = useState('PASSWORD') // 'PASSWORD' | 'KEY'
  const [password, setPassword] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [copiedScript, setCopiedScript] = useState(false)

  // Submitting status & errors
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Guided Handshake Connection Modal / Screen
  const [createdServer, setCreatedServer] = useState(null)
  const [handshakeStatus, setHandshakeStatus] = useState('listening') // 'listening' | 'completed' | 'testing'
  const [setupMethodTab, setSetupMethodTab] = useState('script') // 'script' | 'manual'
  const [copiedKey, setCopiedKey] = useState(false)
  const [testKeyStatus, setTestKeyStatus] = useState('idle')
  const [testKeyError, setTestKeyError] = useState(null)

  // Polling for automated setup callback
  useEffect(() => {
    if (!createdServer?.setupToken || handshakeStatus === 'completed') return
    const timer = setInterval(async () => {
      try {
        const res = await api(`/setup/${createdServer.setupToken}/status`)
        if (res?.configured) {
          setHandshakeStatus('completed')
          addToast?.({
            type: 'success',
            title: 'Handshake Verified!',
            message: `${createdServer.name} has connected and is ready for deployments.`,
          })
        }
      } catch (_) { }
    }, 2000)
    return () => clearInterval(timer)
  }, [createdServer, handshakeStatus])

  // Load saved credentials from localStorage
  const loadCredentials = () => {
    try {
      const stored = localStorage.getItem('portalops_server_providers')
      if (stored) {
        const parsed = JSON.parse(stored)
        setSavedCredentials(parsed)
        if (parsed.length > 0 && !selectedCredentialId) {
          setSelectedCredentialId(parsed[0].id)
        }
      }
    } catch (err) {
      console.warn('Failed to parse saved providers:', err)
    }
  }

  useEffect(() => {
    loadCredentials()
  }, [])

  // Auto-switch OS port/defaults when OS selection changes
  useEffect(() => {
    if (serverOs.includes('Windows')) {
      setPort('5985')
      setUsername('Administrator')
      setAuthMethod('PASSWORD')
    } else {
      setPort('22')
      if (username === 'Administrator') {
        setUsername('deploy')
      }
    }
  }, [serverOs])

  const handleRandomizeName = () => {
    setServerName(generateServerName())
  }

  const handleCopyScript = () => {
    const scriptCmd = 'curl -fsSL https://portalops.online/setup.sh | bash'
    navigator.clipboard?.writeText(scriptCmd)
    setCopiedScript(true)
    setTimeout(() => setCopiedScript(false), 2000)
  }

  const handleProviderSaved = (newCred) => {
    loadCredentials()
    setSelectedCredentialId(newCred.id)
    setSelectedProvider(newCred.providerId)
    addToast?.({
      type: 'success',
      title: 'Provider linked',
      message: `${newCred.providerName} credentials saved successfully.`,
    })
  }

  const handleCreateServer = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    if (!serverName.trim()) {
      setSubmitError('Please enter a server name.')
      return
    }

    // Determine target host & secret
    let targetHost = hostIp.trim()
    let targetPort = parseInt(port, 10) || 22
    let targetUser = username.trim() || 'deploy'
    let targetAuth = authMethod
    let targetSecret = password

    // Zero-Friction 1-Line Script Flow for Custom Servers (The Ploi/Forge Model)
    if (selectedProvider === 'custom' && customMethod === 'script') {
      if (!targetHost) {
        setSubmitError('Please enter the server IP address.')
        return
      }
      setIsSubmitting(true)
      try {
        const res = await api('/servers', {
          method: 'POST',
          body: {
            name: serverName.trim(),
            host: targetHost,
            port: targetPort,
            username: 'portalops',
            authType: 'KEY',
            autoGenerateKey: true,
          },
        })
        setCreatedServer(res)
        setHandshakeStatus(res.setupCompletedAt ? 'completed' : 'listening')
        addToast?.({
          type: 'success',
          title: 'Server Keypair Generated',
          message: `Run the 1-liner command on your VPS to complete connection.`,
        })
      } catch (err) {
        console.error('Failed to create server:', err)
        const msg = err instanceof ApiError ? err.message : err?.message || 'Failed to initialize server.'
        setSubmitError(msg)
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    if (selectedProvider === 'custom') {
      if (!targetHost) {
        setSubmitError('Please enter the server IP address.')
        return
      }
      if (targetAuth === 'KEY') {
        if (!privateKey.trim()) {
          setSubmitError('Please paste your SSH private key.')
          return
        }
        targetSecret = privateKey
      } else {
        if (!password.trim()) {
          setSubmitError('Please enter the server SSH password.')
          return
        }
      }
    } else {
      // Cloud provider provisioning flow
      // Generates an allocated cloud IP placeholder and registers the node
      const randomOctet = Math.floor(10 + Math.random() * 240)
      targetHost = `159.65.${randomOctet}.${Math.floor(2 + Math.random() * 250)}`
      targetSecret = `cloud-prov-${Math.random().toString(36).substring(2, 10)}`
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: serverName.trim(),
        host: targetHost,
        port: targetPort,
        username: targetUser,
        authType: targetAuth,
        secret: targetSecret,
      }

      await api('/servers', {
        method: 'POST',
        body: payload,
      })

      addToast?.({
        type: 'success',
        title: 'Server created',
        message: `Server "${serverName}" is now registered and provisioning.`,
      })

      // Navigate back to servers directory
      navigate('/servers')
    } catch (err) {
      console.error('Failed to create server:', err)
      const msg = err instanceof ApiError ? err.message : err?.message || 'Failed to create server.'
      setSubmitError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter saved credentials for the selected provider
  const matchingCredentials = savedCredentials.filter(
    (c) => c.providerId === selectedProvider
  )

  const providers = [
    { id: 'custom', name: 'Custom server', logo: CustomServerLogo, highlight: true },
    { id: 'hostinger', name: 'Hostinger', logo: HostingerLogo, disabled: true },
    { id: 'digitalocean', name: 'DigitalOcean', logo: DigitalOceanLogo, disabled: true },
    { id: 'hetzner', name: 'Hetzner Cloud', logo: HetznerLogo, disabled: true },
    { id: 'vultr', name: 'Vultr', logo: VultrLogo, disabled: true },
    { id: 'linode', name: 'Linode', logo: LinodeLogo, disabled: true },
    { id: 'aws', name: 'Amazon EC2', logo: AmazonEC2Logo, disabled: true },
    { id: 'upcloud', name: 'UpCloud', logo: UpCloudLogo, disabled: true },
    { id: 'krystal', name: 'Krystal', logo: KrystalLogo, disabled: true },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      {/* Top Navigation: Cancel link */}
      <div>
        <Link
          to="/servers"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </Link>
      </div>

      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
          {createdServer ? `Connect ${createdServer.name}` : 'Create server'}
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
          {createdServer
            ? 'Follow the steps below to complete zero-friction connection with your server.'
            : 'Pick a provider, choose your stack and PortalOps takes care of provisioning. Bringing your own VPS? Select "Custom server" and follow the steps.'}
        </p>
      </div>

      {createdServer ? (
        /* ============================================================== */
        /* STEP 3: Active Connection Handshake Screen (Ploi / Forge Model) */
        /* ============================================================== */
        <div className="bg-white dark:bg-[#0B1317] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 sm:p-8 shadow-xs space-y-6 animate-in fade-in zoom-in-95 duration-200">
          {/* Header & Status Indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                    Connect {createdServer.name}
                  </h2>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                    {createdServer.host}:{createdServer.port || 22}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Platform keypair generated. Authorize via 1-liner script or public key.
                </p>
              </div>
            </div>

            {/* Handshake Polling Status Badge */}
            {handshakeStatus === 'completed' ? (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Handshake Verified &amp; Online</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-medium animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
                <span>Listening for callback from {createdServer.host}...</span>
              </div>
            )}
          </div>

          {/* Method Selection Tabs */}
          <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-1 gap-1">
            <button
              type="button"
              onClick={() => setSetupMethodTab('script')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${setupMethodTab === 'script'
                  ? 'bg-white dark:bg-zinc-800 text-[#005459] dark:text-[#00DF8F] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
            >
              ⚡ Method A: 1-Click Automated Script (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setSetupMethodTab('manual')}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${setupMethodTab === 'manual'
                  ? 'bg-white dark:bg-zinc-800 text-[#005459] dark:text-[#00DF8F] shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
            >
              Method B: Manual Public Key
            </button>
          </div>

          {/* Method A Content */}
          {setupMethodTab === 'script' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-zinc-800 bg-[#061014] text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#00DF8F]" />
                    <span className="text-xs font-mono font-semibold text-zinc-200">
                      Run this on your VPS as root:
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const rawApi = (import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || '').trim()
                      const apiBase = rawApi ? rawApi.replace(/\/api(\/v1)?\/?$/, '').replace(/\/$/, '') : 'https://deployment-server-3xsh.onrender.com'
                      const cmd = (createdServer.setupCommand && !createdServer.setupCommand.includes('portalops.online'))
                        ? createdServer.setupCommand
                        : `curl -fsSL ${apiBase}/setup/${createdServer.setupToken}.sh | bash`
                      navigator.clipboard?.writeText(cmd)
                      setCopiedScript(true)
                      setTimeout(() => setCopiedScript(false), 2000)
                    }}
                    className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-xs font-mono text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-[#00DF8F]" />
                        <span className="text-[#00DF8F]">Copied command</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy command</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-lg bg-black/60 border border-white/5 font-mono text-xs text-[#00DF8F] overflow-x-auto select-all break-all whitespace-pre-wrap">
                  {(createdServer.setupCommand && !createdServer.setupCommand.includes('portalops.online'))
                    ? createdServer.setupCommand
                    : `curl -fsSL ${(import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'https://deployment-server-3xsh.onrender.com').trim().replace(/\/api(\/v1)?\/?$/, '').replace(/\/$/, '')}/setup/${createdServer.setupToken}.sh | bash`}
                </pre>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs space-y-2.5 text-zinc-600 dark:text-zinc-300">
                <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#005459] dark:text-[#00DF8F]" />
                  <span>Automated provisioner details:</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  <li>Creates dedicated isolated deploy user: <code className="text-[#005459] dark:text-[#00DF8F] font-mono font-semibold">portalops</code></li>
                  <li>Adds PortalOps dedicated Ed25519 public key to <code className="font-mono">~portalops/.ssh/authorized_keys</code></li>
                  <li>Configures scoped sudo permissions for deployment operations (nginx, systemctl, pm2, docker, certbot)</li>
                  <li>Sends an instant completion handshake back to the control plane</li>
                </ul>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 italic pt-1">
                  Zero root passwords or private keys are ever shared with us. Revocable anytime with <code className="font-mono text-zinc-700 dark:text-zinc-300">userdel -r portalops</code>.
                </p>
              </div>
            </div>
          ) : (
            /* Method B Content */
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Dedicated Ed25519 Public Key
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(createdServer.publicKey || '')
                      setCopiedKey(true)
                      setTimeout(() => setCopiedKey(false), 2000)
                    }}
                    className="text-xs text-[#005459] dark:text-[#00DF8F] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey ? 'Copied key' : 'Copy public key'}</span>
                  </button>
                </div>
                <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all">
                  {createdServer.publicKey || 'ssh-ed25519 AAAAC3... portalops-deployer'}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 text-xs space-y-2 text-zinc-600 dark:text-zinc-300">
                <span className="font-semibold text-zinc-900 dark:text-white">Manual public key authorization:</span>
                <ol className="list-decimal pl-5 space-y-1 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">
                  <li>Log in to your VPS as root: <code className="font-mono">ssh root@{createdServer.host}</code></li>
                  <li>Paste the key into <code className="font-mono">~/.ssh/authorized_keys</code> (or <code className="font-mono">/home/portalops/.ssh/authorized_keys</code>)</li>
                  <li>Click <strong>Test Connection</strong> below to verify SSH access</li>
                </ol>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    setTestKeyStatus('testing')
                    setTestKeyError(null)
                    try {
                      const res = await api(`/servers/${createdServer.id}/test`, { method: 'POST' })
                      if (res?.ok) {
                        setTestKeyStatus('success')
                        setHandshakeStatus('completed')
                      } else {
                        setTestKeyStatus('failed')
                        setTestKeyError('Handshake failed. Ensure public key is placed in ~/.ssh/authorized_keys.')
                      }
                    } catch (err) {
                      setTestKeyStatus('failed')
                      setTestKeyError(err.message || 'SSH connection could not be established.')
                    }
                  }}
                  disabled={testKeyStatus === 'testing'}
                  className="h-9 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  {testKeyStatus === 'testing' ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#005459] dark:text-[#00DF8F]" />
                      <span>Testing SSH handshake...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-[#005459] dark:text-[#00DF8F]" />
                      <span>Test connection</span>
                    </>
                  )}
                </button>

                {testKeyStatus === 'success' && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <Check className="w-4 h-4" />
                    <span>SSH connection verified!</span>
                  </span>
                )}
                {testKeyStatus === 'failed' && testKeyError && (
                  <span className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{testKeyError}</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCreatedServer(null)}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
            >
              ← Back to provider selection
            </button>

            <button
              type="button"
              onClick={() => navigate('/servers')}
              className={`h-10 px-6 rounded-lg text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2 ${handshakeStatus === 'completed'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-[#005459] hover:bg-[#074549]'
                }`}
            >
              <Check className="w-4 h-4" />
              <span>{handshakeStatus === 'completed' ? 'Done · View Server in Fleet' : 'Finish (Verifying in background)'}</span>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleCreateServer} className="space-y-6">
          {/* ============================================================== */}
          {/* STEP 1: Select provider */}
          {/* ============================================================== */}
          <div className="bg-white dark:bg-[#0B1317] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Select provider
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Where should your new server be hosted?
                </p>
              </div>
            </div>

            {/* Provider Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
              {providers.map((p) => {
                const Logo = p.logo
                const isSelected = selectedProvider === p.id
                const isDisabled = p.disabled
                return (
                  <button
                    key={p.id}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => !isDisabled && setSelectedProvider(p.id)}
                    className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2.5 transition-all text-center relative ${isDisabled
                        ? 'opacity-40 cursor-not-allowed border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-900/20'
                        : isSelected
                          ? 'border-2 border-[#005459] bg-[#005459]/5 dark:bg-[#005459]/15 shadow-xs cursor-pointer'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-[#060D10] cursor-pointer'
                      } min-h-[96px]`}
                  >
                    {isDisabled && (
                      <span className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                        Soon
                      </span>
                    )}
                    <Logo className="w-7 h-7 shrink-0" />
                    <span className="text-xs font-medium text-zinc-900 dark:text-white">
                      {p.name}
                    </span>
                  </button>
                )
              })}
            </div>

          </div>

          {/* ============================================================== */}
          {/* STEP 2: Details */}
          {/* ============================================================== */}
          <div className="bg-white dark:bg-[#0B1317] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-xs space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-bold flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
                  Details
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Name your server and pick the stack you want installed.
                </p>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 pt-1">
              {/* Credentials / Provider Connection Banner */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Connection Method
                </label>
                <div className="px-3.5 py-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong>Bring Your Own Server:</strong> No cloud provider API required. Connect via 1-line script or direct SSH.
                  </span>
                </div>
              </div>

              {/* Server Name */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Name <span className="text-red-500">*</span>
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={serverName}
                    onChange={(e) => setServerName(e.target.value)}
                    placeholder="e.g. fancy-raccoon"
                    className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459] pr-10"
                  />
                  <button
                    type="button"
                    onClick={handleRandomizeName}
                    className="absolute right-2.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer p-1"
                    title="Generate another fun name"
                  >
                    <Shuffle className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Server OS */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Server OS
                </label>
                <select
                  value={serverOs}
                  onChange={(e) => setServerOs(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-[#005459]"
                >
                  <option value="Ubuntu 24.04 LTS">Ubuntu 24.04 LTS (Recommended)</option>
                  <option value="Ubuntu 22.04 LTS">Ubuntu 22.04 LTS</option>
                  <option value="Debian 12 Bookworm">Debian 12 Bookworm</option>
                  <option value="Windows Server 2022">Windows Server 2022 (WinRM / OpenSSH)</option>
                </select>
              </div>

              {/* Server Type */}
              <div>
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Server type
                </label>
                <select
                  value={serverType}
                  onChange={(e) => setServerType(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-[#005459]"
                >
                  <option value="Server">Server (Standard web & application runtime)</option>
                  <option value="Worker">Worker (Background jobs, queues & cron)</option>
                  <option value="Database">Database (Dedicated MySQL, Postgres, Redis)</option>
                  <option value="Load Balancer">Load Balancer (Reverse proxy & SSL termination)</option>
                </select>
                <button
                  type="button"
                  onClick={() => setIsServerTypesModalOpen(true)}
                  className="text-[11.5px] text-[#0080FF] hover:underline mt-1.5 inline-block cursor-pointer"
                >
                  Tell me more about the available server types
                </button>
              </div>

              {/* BYOS / VPS Setup Box (When Custom server is chosen) */}
              {selectedProvider === 'custom' && (
                <div className="pt-2 space-y-4">
                  {/* Method selector toggle for custom server */}
                  <div className="flex border border-zinc-200 dark:border-zinc-700 rounded-lg p-1 bg-zinc-50 dark:bg-[#060D10] w-full sm:w-auto self-start">
                    <button
                      type="button"
                      onClick={() => setCustomMethod('script')}
                      className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${customMethod === 'script'
                          ? 'bg-white dark:bg-[#0B1317] text-[#005459] dark:text-[#00DF8F] shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                        }`}
                    >
                      1-Line Setup Script (Zero Root Password)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomMethod('manual')}
                      className={`flex-1 sm:flex-none px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${customMethod === 'manual'
                          ? 'bg-white dark:bg-[#0B1317] text-[#005459] dark:text-[#00DF8F] shadow-xs'
                          : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                        }`}
                    >
                      Direct SSH Credentials
                    </button>
                  </div>

                  {/* 1-Line Setup Script instructions */}
                  {customMethod === 'script' && (
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-[#061014] text-white space-y-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#00DF8F]" />
                        <span className="text-xs font-mono font-semibold text-zinc-200">
                          Zero-Friction Automated Onboarding (2 Easy Steps):
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-zinc-300">
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#005459] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                          <span>Enter your VPS IP below and click <strong>Create server</strong> at the bottom.</span>
                        </div>
                        <div className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#005459] text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                          <span>PortalOps generates a dedicated encrypted keypair and gives you your personalized 1-line command to run on your VPS:</span>
                        </div>
                      </div>

                      <pre className="p-3 rounded-lg bg-black/50 border border-white/10 font-mono text-xs text-[#00DF8F] overflow-x-auto select-all">
                        curl -sSL https://portalops.online/setup/srv_[token].sh | bash
                      </pre>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        The script automatically creates an isolated <code className="text-[#00DF8F]">portalops</code> user, configures SSH keys, scopes sudo permissions, and confirms connection back to PortalOps. <strong>You never share root passwords or private keys.</strong>
                      </p>
                    </div>
                  )}

                  {/* Host IP & Connection info */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Server Public IP or Hostname <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required={customMethod === 'manual'}
                        value={hostIp}
                        onChange={(e) => setHostIp(e.target.value)}
                        placeholder="e.g. 192.168.1.100 or vps.example.com"
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                        Port
                      </label>
                      <input
                        type="number"
                        value={port}
                        onChange={(e) => setPort(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                      />
                    </div>
                  </div>

                  {/* Direct SSH fields if manual method chosen */}
                  {customMethod === 'manual' && (
                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                            SSH Username
                          </label>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="deploy or root"
                            className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                            Auth Method
                          </label>
                          <select
                            value={authMethod}
                            onChange={(e) => setAuthMethod(e.target.value)}
                            className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-[#005459]"
                          >
                            <option value="PASSWORD">Password</option>
                            <option value="KEY">SSH Private Key</option>
                          </select>
                        </div>
                      </div>

                      {authMethod === 'PASSWORD' ? (
                        <div>
                          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                            Password
                          </label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter user or root password"
                            className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                            Private Key (PEM or OpenSSH)
                          </label>
                          <textarea
                            rows={4}
                            value={privateKey}
                            onChange={(e) => setPrivateKey(e.target.value)}
                            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----..."
                            className="w-full px-3 py-2 text-xs rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {submitError && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/servers"
              className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-lg bg-[#005459] hover:bg-[#074549] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Provisioning node...</span>
                </>
              ) : (
                <span>Create server</span>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Modal: Tell me more about server types */}
      {isServerTypesModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsServerTypesModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#0B1317] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Available Server Types
              </h3>
              <button
                type="button"
                onClick={() => setIsServerTypesModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#060D10]">
                <div className="font-bold text-zinc-900 dark:text-white mb-1">
                  1. Server (Fullstack & Web Application)
                </div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  Ideal for running Nginx, Node.js / PHP / Python, SSL certificates, and hosting web applications or APIs directly.
                </div>
              </div>
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#060D10]">
                <div className="font-bold text-zinc-900 dark:text-white mb-1">
                  2. Worker (Background Queue Runner)
                </div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  Optimized for compute jobs, PM2 cluster workers, Redis consumers, and scheduled crons without opening public web ports.
                </div>
              </div>
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#060D10]">
                <div className="font-bold text-zinc-900 dark:text-white mb-1">
                  3. Database Engine
                </div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  Dedicated MySQL, PostgreSQL, or Redis instance with tuning for high disk IOPS and automated database snapshot schedules.
                </div>
              </div>
              <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#060D10]">
                <div className="font-bold text-zinc-900 dark:text-white mb-1">
                  4. Load Balancer
                </div>
                <div className="text-zinc-600 dark:text-zinc-400">
                  High-availability traffic router distributing inbound HTTP/HTTPS requests across multiple upstream application servers.
                </div>
              </div>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsServerTypesModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-[#005459] hover:bg-[#074549] text-white text-xs font-medium"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

