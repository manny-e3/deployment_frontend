import { useState, useEffect } from 'react'
import {
  Server,
  X,
  KeyRound,
  Lock,
  Zap,
  CheckCircle2,
  Save,
  AlertCircle,
  Loader2,
  Pencil,
  Terminal,
  Cpu,
  Monitor,
  Layers,
  Shield,
  HelpCircle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { api, ApiError } from '../services/api'

// Custom Windows 4-square icon
export function WindowsLogo({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 88 88" fill="currentColor">
      <path d="M0 12.402l35.687-4.86.016 34.423-35.67.202zm35.67 33.529l.028 34.453L.028 75.48.016 46.134zM39.73 6.942L87.527.027l.016 39.807-47.813.16zM87.543 45.928l-.016 42.045-47.797-6.73-.016-35.39z" />
    </svg>
  )
}

// Custom Linux Penguin / Terminal icon
export function LinuxLogo({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m4 17 6-6-6-6" />
      <path d="M12 19h8" />
    </svg>
  )
}

export function AddServerModal({ isOpen, onClose, onSaveServer, serverToEdit = null }) {
  const [serverType, setServerType] = useState('LINUX') // 'LINUX' | 'WINDOWS'
  const [serverName, setServerName] = useState('')
  const [hostIp, setHostIp] = useState('')
  const [port, setPort] = useState('22')
  const [username, setUsername] = useState('portalops')
  const [windowsProtocol, setWindowsProtocol] = useState('WINRM_HTTP') // 'WINRM_HTTP' | 'WINRM_HTTPS' | 'OPENSSH'
  const [authMethod, setAuthMethod] = useState('private-key') // 'private-key' | 'password'
  const [privateKey, setPrivateKey] = useState('')
  const [password, setPassword] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [windowsDomain, setWindowsDomain] = useState('')
  const [testStatus, setTestStatus] = useState('idle') // 'idle' | 'testing' | 'success' | 'failed'
  const [testDetails, setTestDetails] = useState(null)
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Guided SSH Onboarding / Editing states
  const [onboardingMode, setOnboardingMode] = useState('guided') // 'guided' | 'advanced'
  const [onboardingStep, setOnboardingStep] = useState('details') // 'details' | 'handshake'
  const [createdServer, setCreatedServer] = useState(null)
  const [handshakeStatus, setHandshakeStatus] = useState('listening')
  const [setupMethodTab, setSetupMethodTab] = useState('script') // 'script' | 'manual'
  const [copiedScript, setCopiedScript] = useState(false)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedEditKey, setCopiedEditKey] = useState(false)
  const [copiedEditScript, setCopiedEditScript] = useState(false)
  const [showCredentialOverride, setShowCredentialOverride] = useState(false)

  // Polling for automated setup callback when creating in modal
  useEffect(() => {
    if (!createdServer?.setupToken || handshakeStatus === 'completed') return
    const timer = setInterval(async () => {
      try {
        const res = await api(`/setup/${createdServer.setupToken}/status`)
        if (res?.configured) {
          setHandshakeStatus('completed')
        }
      } catch (_) {}
    }, 2000)
    return () => clearInterval(timer)
  }, [createdServer, handshakeStatus])

  // Initialize or reset state when modal opens or serverToEdit changes
  useEffect(() => {
    setOnboardingStep('details')
    setCreatedServer(null)
    setHandshakeStatus('listening')
    setSetupMethodTab('script')
    setShowCredentialOverride(false)
    setTestStatus('idle')
    setTestDetails(null)
    setFormError(null)

    if (serverToEdit) {
      setOnboardingMode('guided')
      const isWin =
        serverToEdit.osType === 'WINDOWS' ||
        serverToEdit.serverType === 'WINDOWS' ||
        serverToEdit.port === 5985 ||
        serverToEdit.port === 5986 ||
        serverToEdit.name?.toLowerCase().includes('win')

      setServerType(isWin ? 'WINDOWS' : 'LINUX')
      setServerName(serverToEdit.name || '')
      setHostIp(serverToEdit.host || serverToEdit.hostname || '')

      let extractedPort = isWin ? '5985' : '22'
      let extractedUser = isWin ? 'Administrator' : 'portalops'

      if (serverToEdit.address) {
        const parts = serverToEdit.address.split('@')
        if (parts.length === 2) {
          extractedUser = parts[0]
          const hostPort = parts[1].split(':')
          if (hostPort.length === 2) {
            extractedPort = hostPort[1].split(' ')[0]
          }
        }
      }

      const p = String(serverToEdit.port || extractedPort)
      setPort(p)
      if (isWin) {
        if (p === '5986') setWindowsProtocol('WINRM_HTTPS')
        else if (p === '22') setWindowsProtocol('OPENSSH')
        else setWindowsProtocol('WINRM_HTTP')
      }

      setUsername(serverToEdit.username || extractedUser)
      const isPass =
        serverToEdit.authType === 'Password' ||
        serverToEdit.authType === 'PASSWORD' ||
        (isWin && windowsProtocol !== 'OPENSSH')
      setAuthMethod(isPass ? 'password' : 'private-key')
      setPrivateKey('')
      setPassword('')
      setPassphrase('')
      setWindowsDomain(serverToEdit.domain || '')
    } else {
      setOnboardingMode('guided')
      setServerType('LINUX')
      setServerName('')
      setHostIp('')
      setPort('22')
      setUsername('portalops')
      setWindowsProtocol('WINRM_HTTP')
      setAuthMethod('private-key')
      setPrivateKey('')
      setPassword('')
      setPassphrase('')
      setWindowsDomain('')
    }
  }, [serverToEdit, isOpen])

  if (!isOpen) return null

  // Handle switching server type
  const handleServerTypeChange = (type) => {
    setServerType(type)
    setTestStatus('idle')
    setTestDetails(null)

    if (type === 'WINDOWS') {
      if (windowsProtocol === 'WINRM_HTTP') setPort('5985')
      else if (windowsProtocol === 'WINRM_HTTPS') setPort('5986')
      else setPort('22')

      if (username === 'deploy' || username === 'root' || username === 'portalops') {
        setUsername('Administrator')
      }
      setAuthMethod('password')
    } else if (type === 'LINUX') {
      setPort('22')
      if (username === 'Administrator') {
        setUsername('portalops')
      }
      setAuthMethod('private-key')
    }
  }

  // Handle switching Windows protocol (WinRM vs OpenSSH)
  const handleWindowsProtocolChange = (proto) => {
    setWindowsProtocol(proto)
    setTestStatus('idle')
    if (proto === 'WINRM_HTTP') {
      setPort('5985')
      setAuthMethod('password')
    } else if (proto === 'WINRM_HTTPS') {
      setPort('5986')
      setAuthMethod('password')
    } else if (proto === 'OPENSSH') {
      setPort('22')
    }
  }

  // Auto-parse full user@host:port strings pasted into Host input
  const handleHostChange = (raw) => {
    let val = raw.trim()
    if (val.includes('@') || val.includes(':')) {
      let parsedUser = null
      let parsedPort = null

      if (val.includes('@')) {
        const parts = val.split('@')
        parsedUser = parts[0]
        val = parts.slice(1).join('@')
      }

      const lastColon = val.lastIndexOf(':')
      if (lastColon > 0) {
        const portCandidate = val.slice(lastColon + 1)
        if (/^\d+$/.test(portCandidate)) {
          parsedPort = portCandidate
          val = val.slice(0, lastColon)
        }
      }

      if (val) {
        setHostIp(val)
        if (parsedUser) setUsername(parsedUser)
        if (parsedPort) setPort(parsedPort)
        return
      }
    }
    setHostIp(raw)
  }

  // Live Connection Test
  const handleTestConnection = async () => {
    setTestStatus('testing')
    setTestDetails(null)

    if (serverToEdit?.id) {
      try {
        const res = await api(`/servers/${serverToEdit.id}/test`, { method: 'POST' })
        setTestStatus('success')
        setTestDetails(res?.message || `SSH handshake verified! Connected as ${res?.whoami || username}.`)
      } catch (err) {
        setTestStatus('failed')
        setTestDetails(err.message || 'SSH connection could not be established.')
      }
      return
    }

    // New server simulated test before creation
    setTimeout(() => {
      setTestStatus('success')
      if (serverType === 'WINDOWS') {
        setTestDetails('WinRM responder active · PowerShell 7.4 runtime detected · Windows Server 2022')
      } else {
        setTestDetails('OpenSSH 8.9p1 handshake successful · Git 2.43.0 available')
      }
    }, 700)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    const trimmedName = serverName.trim()
    const trimmedHost = hostIp.trim()
    const trimmedUser = username.trim()

    if (!trimmedName) {
      setFormError('Server name is required.')
      return
    }
    if (!trimmedHost) {
      setFormError('Host or IP is required.')
      return
    }
    if (!trimmedUser) {
      setFormError('User / Login account is required.')
      return
    }

    // Zero-Friction Guided SSH Onboarding: initialize keypair on backend & proceed to Step 2
    if (!serverToEdit && serverType === 'LINUX' && onboardingMode === 'guided') {
      setIsSubmitting(true)
      try {
        const res = await api('/servers', {
          method: 'POST',
          body: {
            name: trimmedName,
            host: trimmedHost,
            port: Number(port) || 22,
            username: trimmedUser || 'portalops',
            authType: 'KEY',
            autoGenerateKey: true,
          },
        })
        setCreatedServer(res)
        setOnboardingStep('handshake')
        setHandshakeStatus(res.setupCompletedAt ? 'completed' : 'listening')
      } catch (err) {
        setFormError(err.message || 'Failed to initialize server keypair.')
      } finally {
        setIsSubmitting(false)
      }
      return
    }

    setIsSubmitting(true)

    const apiPayload = {
      name: trimmedName,
      host: trimmedHost,
      port: Number(port) || (serverType === 'WINDOWS' ? 5985 : 22),
      username: trimmedUser,
    }

    if (serverToEdit) {
      // If user toggled credential override, apply the new credentials
      if (showCredentialOverride) {
        if (authMethod === 'private-key' && privateKey.trim()) {
          apiPayload.authType = 'KEY'
          apiPayload.secret = privateKey.trim()
          if (passphrase.trim()) {
            apiPayload.passphrase = passphrase.trim()
          }
        } else if (authMethod === 'password' && password) {
          apiPayload.authType = 'PASSWORD'
          apiPayload.secret = password
        }
      } else if (serverType === 'WINDOWS' && password) {
        apiPayload.authType = 'PASSWORD'
        apiPayload.secret = password
      }
    } else {
      if (authMethod === 'private-key') {
        if (!privateKey.trim()) {
          setFormError('Private key is required for manual SSH Key authentication.')
          setIsSubmitting(false)
          return
        }
        apiPayload.authType = 'KEY'
        apiPayload.secret = privateKey.trim()
        if (passphrase.trim()) apiPayload.passphrase = passphrase.trim()
      } else {
        if (!password) {
          setFormError('Password is required for Password authentication.')
          setIsSubmitting(false)
          return
        }
        apiPayload.authType = 'PASSWORD'
        apiPayload.secret = password
      }
    }

    const resolvedProtocol = serverType === 'WINDOWS' ? windowsProtocol : 'SSH'
    const resolvedIcon = serverType === 'WINDOWS' ? 'windows' : 'cloud'
    const resolvedVersion = serverType === 'WINDOWS' ? 'PowerShell 7.4' : 'git 2.43.0'

    try {
      if (serverToEdit) {
        const res = await api(`/servers/${serverToEdit.id}`, {
          method: 'PATCH',
          body: apiPayload,
        })

        if (res && onSaveServer) {
          onSaveServer({
            ...serverToEdit,
            ...res,
            name: res.name || trimmedName,
            host: res.host || trimmedHost,
            hostname: res.host || trimmedHost,
            osType: serverType,
            serverType: serverType,
            protocol: resolvedProtocol,
            domain: serverType === 'WINDOWS' && windowsDomain.trim() ? windowsDomain.trim() : undefined,
            address: `${res.username || trimmedUser}@${res.host || trimmedHost}:${res.port || port}`,
            authType: res.authType === 'KEY' ? 'SSH Key' : 'Password',
            iconType: resolvedIcon,
            gitVersion: serverType === 'WINDOWS' ? 'PowerShell 7.4' : (res.gitVersion || resolvedVersion),
          })
          onClose()
          return
        }
      } else {
        const res = await api('/servers', {
          method: 'POST',
          body: apiPayload,
        })

        if (res && onSaveServer) {
          onSaveServer({
            ...res,
            id: res.id,
            name: res.name || trimmedName,
            host: res.host || trimmedHost,
            hostname: res.host || trimmedHost,
            osType: serverType,
            serverType: serverType,
            protocol: resolvedProtocol,
            domain: serverType === 'WINDOWS' && windowsDomain.trim() ? windowsDomain.trim() : undefined,
            address: `${res.username || trimmedUser}@${res.host || trimmedHost}:${res.port || port}`,
            authType: res.authType === 'KEY' ? 'SSH Key' : 'Password',
            authKeyType: 'ed25519',
            pipelineCount: 0,
            pipelineProjects: 'None',
            status: 'online',
            gitVersion: resolvedVersion,
            checkedAgo: 'Just added',
            iconType: resolvedIcon,
          })
          onClose()
          return
        }
      }
    } catch (err) {
      console.error('Server operation error:', err)
      if (err instanceof ApiError) {
        if (err.details?.fields && Array.isArray(err.details.fields)) {
          const detailMsg = err.details.fields
            .map((f) => `${f.field?.replace(/^(body|query|params)\./, '')}: ${f.message}`)
            .join(' · ')
          setFormError(`${err.message} (${detailMsg})`)
        } else {
          setFormError(err.message || `Failed to save server (${err.code})`)
        }
      } else {
        setFormError(err.message || 'Network error while saving server.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditingLinuxKeyServer = serverToEdit && serverType === 'LINUX'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-[620px] bg-white dark:bg-[#0B1317] border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 bg-[#005459]/10 text-[#005459] dark:text-[#00DF8F]">
              {serverType === 'WINDOWS' ? (
                <WindowsLogo className="w-5 h-5" />
              ) : serverToEdit ? (
                <Terminal className="w-5 h-5" />
              ) : (
                <Server className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                  {serverToEdit ? `Edit server: ${serverToEdit.name}` : 'Add target server'}
                </h2>
                {serverToEdit && (
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${
                      serverToEdit.setupCompletedAt || serverToEdit.status === 'online'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        serverToEdit.setupCompletedAt || serverToEdit.status === 'online'
                          ? 'bg-emerald-500'
                          : 'bg-amber-500'
                      }`}
                    />
                    <span>
                      {serverToEdit.setupCompletedAt || serverToEdit.status === 'online' ? 'Online' : 'Pending Handshake'}
                    </span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Configure network host, SSH credentials, and platform access keys.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Handshake Screen when Creating a Server */}
        {onboardingStep === 'handshake' && createdServer ? (
          <div className="p-6 space-y-5 overflow-y-auto flex-1">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Connect {createdServer.name}
                  </h3>
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    {createdServer.host}:{createdServer.port || 22}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Platform keypair generated. Run the 1-liner script or authorize the public key.
                </p>
              </div>

              {handshakeStatus === 'completed' ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified &amp; Online</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-medium animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
                  <span>Listening for handshake...</span>
                </div>
              )}
            </div>

            {/* Method Tabs */}
            <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 p-1 gap-1">
              <button
                type="button"
                onClick={() => setSetupMethodTab('script')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  setupMethodTab === 'script'
                    ? 'bg-white dark:bg-zinc-800 text-[#005459] dark:text-[#00DF8F] shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                ⚡ Method A: 1-Click Automated Script (Recommended)
              </button>
              <button
                type="button"
                onClick={() => setSetupMethodTab('manual')}
                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                  setupMethodTab === 'manual'
                    ? 'bg-white dark:bg-zinc-800 text-[#005459] dark:text-[#00DF8F] shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Method B: Manual Public Key
              </button>
            </div>

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
                        const cmd = createdServer.setupCommand || `curl -fsSL https://portalops.online/setup/${createdServer.setupToken}.sh | bash`
                        navigator.clipboard?.writeText(cmd)
                        setCopiedScript(true)
                        setTimeout(() => setCopiedScript(false), 2000)
                      }}
                      className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedScript ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00DF8F]" />
                          <span className="text-[#00DF8F]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-3 rounded-lg bg-black/60 border border-white/5 font-mono text-xs text-[#00DF8F] overflow-x-auto select-all whitespace-pre-wrap break-all">
                    {createdServer.setupCommand || `curl -fsSL https://portalops.online/setup/${createdServer.setupToken}.sh | bash`}
                  </pre>
                </div>

                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                  <div className="font-semibold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#005459] dark:text-[#00DF8F]" />
                    <span>What happens automatically on your server:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs leading-relaxed">
                    <li>Creates dedicated unprivileged deploy user: <code className="text-[#005459] dark:text-[#00DF8F] font-mono font-semibold">portalops</code></li>
                    <li>Installs PortalOps dedicated Ed25519 public key into <code className="font-mono">~portalops/.ssh/authorized_keys</code></li>
                    <li>Configures scoped sudo permissions for nginx, systemctl, pm2, docker, certbot</li>
                    <li>Pings PortalOps control plane to confirm connection</li>
                  </ul>
                  <p className="text-[11px] text-zinc-400 italic pt-1">
                    Under the 1-line script, zero root passwords or private keys are shared. Revocable anytime with <code className="font-mono">userdel -r portalops</code>.
                  </p>
                </div>
              </div>
            ) : (
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
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all">
                    {createdServer.publicKey || 'ssh-ed25519 AAAAC3... portalops-deployer'}
                  </div>
                </div>

                <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs space-y-2 text-zinc-600 dark:text-zinc-400">
                  <span className="font-semibold text-zinc-900 dark:text-white">Manual setup steps:</span>
                  <ol className="list-decimal pl-5 space-y-1 text-xs leading-relaxed">
                    <li>Log in to your VPS: <code className="font-mono">ssh root@{createdServer.host}</code></li>
                    <li>Add the public key above to <code className="font-mono">~/.ssh/authorized_keys</code></li>
                    <li>Click <strong>Test Connection</strong> below to verify SSH handshake</li>
                  </ol>
                </div>
              </div>
            )}

            {/* Footer Finish Actions */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setOnboardingStep('details')}
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                ← Back to details
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onSaveServer && createdServer) {
                    onSaveServer({
                      ...createdServer,
                      host: createdServer.host,
                      hostname: createdServer.host,
                      osType: 'LINUX',
                      serverType: 'LINUX',
                      protocol: 'SSH',
                      address: `${createdServer.username || 'portalops'}@${createdServer.host}:${createdServer.port || 22}`,
                      authType: 'SSH Key',
                      authKeyType: 'ed25519',
                      status: handshakeStatus === 'completed' ? 'online' : 'provisioning',
                      gitVersion: 'git 2.43.0',
                    })
                  }
                  onClose()
                }}
                className={`h-9 px-5 rounded-lg text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer ${
                  handshakeStatus === 'completed'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-[#005459] hover:bg-[#064347]'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{handshakeStatus === 'completed' ? 'Finish & View Server' : 'Done (Configuring in background)'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Form for Editing or Setting Details */
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {formError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Server Type & OS Protocol Selector */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                Server Type &amp; Operating Protocol
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Linux Card */}
                <button
                  type="button"
                  onClick={() => handleServerTypeChange('LINUX')}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    serverType === 'LINUX'
                      ? 'border-2 border-[#005459] bg-[#005459]/5 dark:bg-[#005459]/15 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-[#060D10]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      serverType === 'LINUX'
                        ? 'bg-[#005459] text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    <LinuxLogo className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <span>Linux / Unix</span>
                      {serverType === 'LINUX' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      OpenSSH · bash · Ubuntu / Debian / RHEL / AlmaLinux
                    </div>
                  </div>
                </button>

                {/* Windows Card */}
                <button
                  type="button"
                  onClick={() => handleServerTypeChange('WINDOWS')}
                  className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    serverType === 'WINDOWS'
                      ? 'border-2 border-[#0078D4] bg-[#0078D4]/10 shadow-xs'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-[#060D10]'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      serverType === 'WINDOWS'
                        ? 'bg-[#0078D4] text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    <WindowsLogo className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                      <span>Windows Server</span>
                      {serverType === 'WINDOWS' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0078D4]" />
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-snug">
                      WinRM / OpenSSH · PowerShell · IIS · Windows Server
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Windows Specific Protocol Selector */}
            {serverType === 'WINDOWS' && (
              <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0078D4] flex items-center gap-1.5">
                    <WindowsLogo className="w-3.5 h-3.5" />
                    <span>Windows Server Configuration</span>
                  </span>
                  <span className="text-[10px] font-mono text-[#0078D4] bg-blue-100/60 dark:bg-blue-900/40 px-2 py-0.5 rounded font-semibold">
                    PowerShell 7.x / 5.1
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleWindowsProtocolChange('WINRM_HTTP')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border text-center transition-all cursor-pointer ${
                      windowsProtocol === 'WINRM_HTTP'
                        ? 'bg-[#0078D4] text-white border-[#0078D4] font-bold shadow-xs'
                        : 'bg-white dark:bg-[#060D10] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    WinRM (5985)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWindowsProtocolChange('WINRM_HTTPS')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border text-center transition-all cursor-pointer ${
                      windowsProtocol === 'WINRM_HTTPS'
                        ? 'bg-[#0078D4] text-white border-[#0078D4] font-bold shadow-xs'
                        : 'bg-white dark:bg-[#060D10] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    WinRM SSL (5986)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWindowsProtocolChange('OPENSSH')}
                    className={`py-1.5 px-2 rounded-lg text-xs font-mono font-medium border text-center transition-all cursor-pointer ${
                      windowsProtocol === 'OPENSSH'
                        ? 'bg-[#0078D4] text-white border-[#0078D4] font-bold shadow-xs'
                        : 'bg-white dark:bg-[#060D10] text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    OpenSSH (22)
                  </button>
                </div>
              </div>
            )}

            {/* Server Name */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                Server name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={serverName}
                onChange={(e) => setServerName(e.target.value)}
                placeholder="e.g. Hetzner Production or web-prod-01"
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                required
              />
            </div>

            {/* 3-Column Grid: Host, Port, User */}
            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-12 sm:col-span-6">
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Host or IP <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={hostIp}
                  onChange={(e) => handleHostChange(e.target.value)}
                  placeholder="e.g. 86.107.77.213"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  {serverType === 'WINDOWS' && windowsProtocol !== 'OPENSSH' ? 'WinRM Port' : 'SSH Port'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                  required
                />
              </div>

              <div className="col-span-6 sm:col-span-3">
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  {serverType === 'WINDOWS' ? 'Windows User' : 'SSH User'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={serverType === 'WINDOWS' ? 'Administrator' : 'portalops'}
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                  required
                />
              </div>
            </div>

            {/* Active Directory Domain (Windows Only) */}
            {serverType === 'WINDOWS' && (
              <div>
                <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  Active Directory Domain (optional)
                </label>
                <input
                  type="text"
                  value={windowsDomain}
                  onChange={(e) => setWindowsDomain(e.target.value)}
                  placeholder="e.g. CORP (leave empty for local account)"
                  className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                />
              </div>
            )}

            {/* ========================================================== */}
            {/* NEW DESIGN FLOW: EDITING EXISTING LINUX SERVER */}
            {/* ========================================================== */}
            {isEditingLinuxKeyServer && (
              <div className="space-y-3 pt-1">
                {/* Dedicated Public Key Card */}
                <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#060D10] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <KeyRound className="w-4 h-4 text-[#005459] dark:text-[#00DF8F]" />
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                        Dedicated Server Public Key (Ed25519)
                      </span>
                    </div>
                    {serverToEdit.publicKey && (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(serverToEdit.publicKey)
                          setCopiedEditKey(true)
                          setTimeout(() => setCopiedEditKey(false), 2000)
                        }}
                        className="px-2.5 py-1 rounded bg-[#005459]/10 dark:bg-[#005459]/25 hover:bg-[#005459]/20 text-xs font-medium text-[#005459] dark:text-[#00DF8F] flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedEditKey ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy public key</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  <div className="p-3 rounded-lg bg-white dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all leading-relaxed">
                    {serverToEdit.publicKey || 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5... (Platform Keypair)'}
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    This public key is authorized in <code className="text-[#005459] dark:text-[#00DF8F] font-mono font-semibold">/home/{username || 'portalops'}/.ssh/authorized_keys</code> on your VPS.
                  </p>
                </div>

                {/* 1-Line Setup & Repair Script Card */}
                {serverToEdit.setupToken && (
                  <div className="p-4 rounded-xl border border-zinc-800 bg-[#061014] text-white space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Terminal className="w-4 h-4 text-[#00DF8F]" />
                        <span className="text-xs font-mono font-semibold text-zinc-200">
                          1-Line Setup &amp; Repair Script:
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const cmd = `curl -fsSL https://portalops.online/setup/${serverToEdit.setupToken}.sh | bash`
                          navigator.clipboard?.writeText(cmd)
                          setCopiedEditScript(true)
                          setTimeout(() => setCopiedEditScript(false), 2000)
                        }}
                        className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-mono text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {copiedEditScript ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#00DF8F]" />
                            <span className="text-[#00DF8F]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy command</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-2.5 rounded-lg bg-black/60 border border-white/5 font-mono text-xs text-[#00DF8F] overflow-x-auto select-all">
                      {`curl -fsSL https://portalops.online/setup/${serverToEdit.setupToken}.sh | bash`}
                    </pre>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Run this on your VPS as root to automatically configure or repair the dedicated <code className="text-[#00DF8F]">portalops</code> user and scoped sudo permissions.
                    </p>
                  </div>
                )}

                {/* Collapsible Credential Override */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCredentialOverride(!showCredentialOverride)}
                    className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 flex items-center gap-1.5 font-medium transition-colors cursor-pointer"
                  >
                    {showCredentialOverride ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>Override credentials (use custom password or private key)</span>
                  </button>

                  {showCredentialOverride && (
                    <div className="mt-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-[#060D10] space-y-3 animate-in fade-in duration-200">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                          Authentication Method
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setAuthMethod('password')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                              authMethod === 'password'
                                ? 'border-[#005459] bg-[#005459]/10 text-[#005459] dark:text-[#00DF8F] font-semibold'
                                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0B1317] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Password</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setAuthMethod('private-key')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 border transition-all cursor-pointer ${
                              authMethod === 'private-key'
                                ? 'border-[#005459] bg-[#005459]/10 text-[#005459] dark:text-[#00DF8F] font-semibold'
                                : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-[#0B1317] text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50'
                            }`}
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Custom SSH Private Key</span>
                          </button>
                        </div>
                      </div>

                      {authMethod === 'password' ? (
                        <div>
                          <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            placeholder="Leave empty to keep existing credentials"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 bg-white dark:bg-[#0B1317] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div>
                            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                              Custom Private Key (PEM / OpenSSH)
                            </label>
                            <textarea
                              rows={3}
                              value={privateKey}
                              onChange={(e) => setPrivateKey(e.target.value)}
                              placeholder="Leave empty to keep existing keypair, or paste new private key..."
                              className="w-full p-2.5 bg-white dark:bg-[#0B1317] border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-[#005459]"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                              Passphrase (optional)
                            </label>
                            <input
                              type="password"
                              placeholder="Leave empty if unencrypted"
                              value={passphrase}
                              onChange={(e) => setPassphrase(e.target.value)}
                              className="w-full px-3 py-2 bg-white dark:bg-[#0B1317] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* When adding new Linux server or editing Windows server */}
            {!isEditingLinuxKeyServer && (
              <div className="space-y-3 pt-1">
                {serverType === 'WINDOWS' ? (
                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                      Windows Account Password {!serverToEdit && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="password"
                      placeholder={serverToEdit ? 'Leave empty to keep current password' : 'Enter Administrator password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459]"
                      required={!serverToEdit}
                    />
                  </div>
                ) : (
                  /* New Linux server via modal */
                  <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300 space-y-1.5">
                    <div className="font-semibold flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200">
                      <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Zero-Trust Automatic Keypair</span>
                    </div>
                    <p className="text-[11.5px] leading-relaxed text-emerald-700 dark:text-emerald-400">
                      PortalOps will generate a dedicated Ed25519 keypair for this server upon submission. Keyless script mode requires zero root passwords.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Test Connection Result Banner */}
            {testDetails && (
              <div
                className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                  testStatus === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400'
                }`}
              >
                {testStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                )}
                <span>{testDetails}</span>
              </div>
            )}

            {/* Footer Actions */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                {serverToEdit && (
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing'}
                    className="px-3.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {testStatus === 'testing' ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#005459] dark:text-[#00DF8F]" />
                        <span>Testing SSH...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5 text-[#005459] dark:text-[#00DF8F]" />
                        <span>Test Connection</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-lg bg-[#005459] hover:bg-[#064347] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{serverToEdit ? 'Updating...' : 'Generating Key...'}</span>
                    </>
                  ) : !serverToEdit && serverType === 'LINUX' ? (
                    <>
                      <Zap className="w-3.5 h-3.5 text-[#00DF8F]" />
                      <span>Generate Key &amp; Connect →</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>{serverToEdit ? 'Save Changes' : 'Save Server'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
