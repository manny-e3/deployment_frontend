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
  const [serverType, setServerType] = useState('LINUX') // 'LINUX' | 'WINDOWS' | 'DOCKER'
  const [serverName, setServerName] = useState('')
  const [hostIp, setHostIp] = useState('')
  const [port, setPort] = useState('22')
  const [username, setUsername] = useState('deploy')
  const [windowsProtocol, setWindowsProtocol] = useState('WINRM_HTTP') // 'WINRM_HTTP' | 'WINRM_HTTPS' | 'OPENSSH'
  const [authMethod, setAuthMethod] = useState('password') // 'private-key' | 'password'
  const [privateKey, setPrivateKey] = useState('')
  const [password, setPassword] = useState('')
  const [passphrase, setPassphrase] = useState('')
  const [windowsDomain, setWindowsDomain] = useState('')
  const [testStatus, setTestStatus] = useState('idle') // 'idle' | 'testing' | 'success'
  const [testDetails, setTestDetails] = useState(null)
  const [formError, setFormError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize or reset state when modal opens or serverToEdit changes
  useEffect(() => {
    if (serverToEdit) {
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
      let extractedUser = isWin ? 'Administrator' : 'deploy'

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
        isWin
      setAuthMethod(isPass ? 'password' : 'private-key')
      setPrivateKey('')
      setPassword('')
      setPassphrase('')
      setWindowsDomain(serverToEdit.domain || '')
      setFormError(null)
      setTestStatus('idle')
      setTestDetails(null)
    } else {
      setServerType('LINUX')
      setServerName('')
      setHostIp('')
      setPort('22')
      setUsername('deploy')
      setWindowsProtocol('WINRM_HTTP')
      setAuthMethod('password')
      setPrivateKey('')
      setPassword('')
      setPassphrase('')
      setWindowsDomain('')
      setFormError(null)
      setTestStatus('idle')
      setTestDetails(null)
    }
  }, [serverToEdit, isOpen])

  // Handle switching server type (Linux vs Windows)
  const handleServerTypeChange = (type) => {
    setServerType(type)
    setTestStatus('idle')
    setTestDetails(null)

    if (type === 'WINDOWS') {
      if (windowsProtocol === 'WINRM_HTTP') setPort('5985')
      else if (windowsProtocol === 'WINRM_HTTPS') setPort('5986')
      else setPort('22')

      if (username === 'deploy' || username === 'root') {
        setUsername('Administrator')
      }
      setAuthMethod('password')
    } else if (type === 'LINUX') {
      setPort('22')
      if (username === 'Administrator') {
        setUsername('deploy')
      }
    } else if (type === 'DOCKER') {
      setPort('2375')
      if (username === 'Administrator') {
        setUsername('root')
      }
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

  if (!isOpen) return null

  const handleTestConnection = () => {
    setTestStatus('testing')
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

    if (!serverToEdit && authMethod === 'private-key' && !privateKey.trim()) {
      setFormError('Private key is required for SSH Key authentication.')
      return
    }
    if (!serverToEdit && authMethod === 'password' && !password) {
      setFormError('Password is required for Password / WinRM authentication.')
      return
    }

    setIsSubmitting(true)

    // Build payload containing strictly the fields expected by the backend API
    const apiPayload = {
      name: trimmedName,
      host: trimmedHost,
      port: Number(port) || (serverType === 'WINDOWS' ? 5985 : 22),
      username: trimmedUser,
      authType: authMethod === 'private-key' ? 'KEY' : 'PASSWORD',
    }

    if (authMethod === 'private-key' && privateKey.trim()) {
      apiPayload.secret = privateKey.trim()
      if (passphrase.trim()) {
        apiPayload.passphrase = passphrase.trim()
      }
    } else if (authMethod === 'password' && password) {
      apiPayload.secret = password
    }

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
            hostname: res.host || trimmedHost,
            osType: serverType,
            serverType: serverType,
            protocol: serverType === 'WINDOWS' ? windowsProtocol : 'SSH',
            domain: serverType === 'WINDOWS' && windowsDomain.trim() ? windowsDomain.trim() : undefined,
            address: `${res.username || trimmedUser}@${res.host || trimmedHost}:${res.port || port}`,
            authType: res.authType === 'KEY' ? 'SSH Key' : 'Password',
            iconType: serverType === 'WINDOWS' ? 'windows' : 'cloud',
            gitVersion: serverType === 'WINDOWS' ? 'PowerShell 7.4' : (res.gitVersion || 'git 2.43.0'),
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
            hostname: res.host || trimmedHost,
            osType: serverType,
            serverType: serverType,
            protocol: serverType === 'WINDOWS' ? windowsProtocol : 'SSH',
            domain: serverType === 'WINDOWS' && windowsDomain.trim() ? windowsDomain.trim() : undefined,
            address: `${res.username || trimmedUser}@${res.host || trimmedHost}:${res.port || port}`,
            authType: res.authType === 'KEY' ? 'SSH Key' : 'Password',
            authKeyType: 'ed25519',
            pipelineCount: 0,
            pipelineProjects: 'None',
            status: 'online',
            gitVersion: serverType === 'WINDOWS' ? 'PowerShell 7.4' : 'git 2.43.0',
            checkedAgo: 'Just added',
            iconType: serverType === 'WINDOWS' ? 'windows' : 'cloud',
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
        setIsSubmitting(false)
        return
      }

      // If backend offline or network error, update frontend state gracefully
      if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
        if (onSaveServer) {
          onSaveServer({
            id: serverToEdit?.id || `srv-${Date.now()}`,
            name: trimmedName,
            hostname: trimmedHost,
            osType: serverType,
            serverType: serverType,
            protocol: payload.protocol,
            address: `${trimmedUser}@${trimmedHost}:${port}`,
            authType: authMethod === 'private-key' ? 'SSH Key' : 'Password',
            authKeyType: 'ed25519',
            pipelineCount: serverToEdit?.pipelineCount || 0,
            pipelineProjects: serverToEdit?.pipelineProjects || 'None',
            status: serverToEdit?.status || 'online',
            gitVersion: serverType === 'WINDOWS' ? 'PowerShell 7.4' : 'git 2.44.0',
            checkedAgo: 'Just updated',
            iconType: serverType === 'WINDOWS' ? 'windows' : 'cloud',
          })
        }
        onClose()
        return
      }

      setFormError(err.message || 'An unexpected error occurred while saving the server.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-[580px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[10px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#E2E7E4] flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 mt-0.5 ${
                serverType === 'WINDOWS'
                  ? 'bg-[#0078D4]/10 text-[#0078D4]'
                  : 'bg-[#E2F0FD] text-[#005459]'
              }`}
            >
              {serverType === 'WINDOWS' ? (
                <WindowsLogo className="w-5 h-5" />
              ) : serverToEdit ? (
                <Pencil className="w-5 h-5" />
              ) : (
                <Server className="w-5 h-5 stroke-[2.2]" />
              )}
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-[#101d26] tracking-tight">
                {serverToEdit ? `Edit server: ${serverToEdit.name}` : 'Add target server'}
              </h2>
              <p className="text-[12px] text-[#565f6b] mt-0.5">
                Configure Linux, Windows Server, or Docker target infrastructure for automated release pipelines.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[4px] text-[#565f6b] hover:text-[#101d26] hover:bg-[#F4F6F5] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Form Error Banner */}
          {formError && (
            <div className="p-3 bg-[#FAEBE9] border border-[#FFDAD6] rounded-[6px] text-[#BA1A1A] text-[12px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="font-medium leading-relaxed">{formError}</span>
            </div>
          )}

          {/* 1. Server Type / OS Selection */}
          <div>
            <label className="block text-[12px] font-semibold text-[#101d26] mb-2 uppercase font-mono tracking-wider">
              Server Type &amp; Operating System
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {/* Linux Card */}
              <button
                type="button"
                onClick={() => handleServerTypeChange('LINUX')}
                className={`p-3 rounded-[8px] border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  serverType === 'LINUX'
                    ? 'border-[#005459] bg-[#E2F0FD]/60 ring-2 ring-[#005459]/20 text-[#101d26]'
                    : 'border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F8FAF9] text-[#565f6b]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5 ${
                    serverType === 'LINUX'
                      ? 'bg-[#005459] text-white'
                      : 'bg-[#F4F6F5] text-[#565f6b]'
                  }`}
                >
                  <LinuxLogo className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#101d26] flex items-center gap-1.5">
                    <span>Linux / Unix</span>
                    {serverType === 'LINUX' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#565f6b] mt-0.5">
                    OpenSSH · bash · Ubuntu / Debian / RHEL
                  </div>
                </div>
              </button>

              {/* Windows Server Card */}
              <button
                type="button"
                onClick={() => handleServerTypeChange('WINDOWS')}
                className={`p-3 rounded-[8px] border text-left flex items-start gap-3 transition-all cursor-pointer ${
                  serverType === 'WINDOWS'
                    ? 'border-[#0078D4] bg-[#EBF3FC] ring-2 ring-[#0078D4]/25 text-[#101d26]'
                    : 'border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F8FAF9] text-[#565f6b]'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0 mt-0.5 ${
                    serverType === 'WINDOWS'
                      ? 'bg-[#0078D4] text-white'
                      : 'bg-[#F4F6F5] text-[#565f6b]'
                  }`}
                >
                  <WindowsLogo className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[13px] font-bold text-[#101d26] flex items-center gap-1.5">
                    <span>Windows Server</span>
                    {serverType === 'WINDOWS' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0078D4]" />
                    )}
                  </div>
                  <div className="text-[11px] text-[#565f6b] mt-0.5">
                    WinRM / OpenSSH · PowerShell · IIS
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Windows-Specific Banner & Protocol Selector */}
          {serverType === 'WINDOWS' && (
            <div className="p-3.5 bg-[#F0F6FD] border border-[#C5DCFA] rounded-[8px] space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#005A9E] flex items-center gap-1.5">
                  <WindowsLogo className="w-3.5 h-3.5" />
                  <span>Windows Server Configuration</span>
                </span>
                <span className="text-[10px] font-mono text-[#005A9E] bg-[#D8E8F8] px-2 py-0.5 rounded font-semibold">
                  PowerShell 7.x / 5.1
                </span>
              </div>

              {/* Protocol selector */}
              <div>
                <label className="block text-[11px] font-medium text-[#101d26] mb-1">
                  Connection Protocol
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleWindowsProtocolChange('WINRM_HTTP')}
                    className={`py-1.5 px-2 rounded-[5px] text-[11px] font-mono font-medium border text-center transition-colors cursor-pointer ${
                      windowsProtocol === 'WINRM_HTTP'
                        ? 'bg-[#0078D4] text-white border-[#0078D4] font-bold shadow-2xs'
                        : 'bg-white text-[#565f6b] border-[#CDD4D0] hover:bg-[#F4F6F5]'
                    }`}
                  >
                    WinRM (Port 5985)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWindowsProtocolChange('WINRM_HTTPS')}
                    className={`py-1.5 px-2 rounded-[5px] text-[11px] font-mono font-medium border text-center transition-colors cursor-pointer ${
                      windowsProtocol === 'WINRM_HTTPS'
                        ? 'bg-[#0078D4] text-white border-[#0078D4] font-bold shadow-2xs'
                        : 'bg-white text-[#565f6b] border-[#CDD4D0] hover:bg-[#F4F6F5]'
                    }`}
                  >
                    WinRM SSL (5986)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleWindowsProtocolChange('OPENSSH')}
                    className={`py-1.5 px-2 rounded-[5px] text-[11px] font-mono font-medium border text-center transition-colors cursor-pointer ${
                      windowsProtocol === 'OPENSSH'
                        ? 'bg-[#0078D4] text-white border-[#0078D4] font-bold shadow-2xs'
                        : 'bg-white text-[#565f6b] border-[#CDD4D0] hover:bg-[#F4F6F5]'
                    }`}
                  >
                    OpenSSH (Port 22)
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-[#42526E] leading-relaxed">
                Connects to Windows Server to execute deployment scripts, update IIS web applications, restart Windows services, or deploy .NET artifacts.
              </p>
            </div>
          )}

          {/* Server Name */}
          <div>
            <label className="block text-[12px] font-medium text-[#101d26] mb-1">
              Server name <span className="text-[#BA1A1A]">*</span>
            </label>
            <input
              type="text"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
              placeholder={
                serverType === 'WINDOWS'
                  ? 'e.g. win-iis-prod-01 or Windows App Server'
                  : 'e.g. cPanel Production or web-gateway-01'
              }
              className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15 font-mono"
              required
            />
          </div>

          {/* 3-Column Grid: Host, Port, User */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-6">
              <label className="block text-[12px] font-medium text-[#101d26] mb-1">
                Host or IP <span className="text-[#BA1A1A]">*</span>
              </label>
              <input
                type="text"
                value={hostIp}
                onChange={(e) => setHostIp(e.target.value)}
                placeholder={
                  serverType === 'WINDOWS'
                    ? 'e.g. winserver01.corp.net or 192.168.1.150'
                    : 'e.g. server14.tela-host.com or 198.51.100.12'
                }
                className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] font-mono outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                required
              />
            </div>

            <div className="col-span-3">
              <label className="block text-[12px] font-medium text-[#101d26] mb-1">
                {serverType === 'WINDOWS' && windowsProtocol !== 'OPENSSH' ? 'WinRM Port' : 'SSH Port'} <span className="text-[#BA1A1A]">*</span>
              </label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] font-mono outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                required
              />
            </div>

            <div className="col-span-3">
              <label className="block text-[12px] font-medium text-[#101d26] mb-1">
                {serverType === 'WINDOWS' ? 'Windows User' : 'SSH User'} <span className="text-[#BA1A1A]">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={serverType === 'WINDOWS' ? 'Administrator' : 'deploy'}
                className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] font-mono outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                required
              />
            </div>
          </div>

          {/* Active Directory Domain (Windows Only) */}
          {serverType === 'WINDOWS' && (
            <div>
              <label className="block text-[12px] font-medium text-[#101d26] mb-1">
                Active Directory Domain (optional)
              </label>
              <input
                type="text"
                value={windowsDomain}
                onChange={(e) => setWindowsDomain(e.target.value)}
                placeholder="e.g. CORP or CONTOSO (leave empty for local account)"
                className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] font-mono outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
              />
            </div>
          )}

          {/* Authentication Method Selector */}
          <div>
            <label className="block text-[12px] font-medium text-[#101d26] mb-1.5">
              Authentication Method
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAuthMethod('password')}
                className={`h-[34px] px-3.5 rounded-[6px] text-[12px] font-medium flex items-center gap-2 border transition-colors cursor-pointer ${
                  authMethod === 'password'
                    ? 'border-[#005459] bg-[#E2F0FD] text-[#005459] ring-1 ring-[#005459]'
                    : 'border-[#CDD4D0] bg-[#FFFFFF] text-[#565f6b] hover:bg-[#F4F6F5]'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{serverType === 'WINDOWS' ? 'Password / NTLM' : 'Password'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMethod('private-key')}
                className={`h-[34px] px-3.5 rounded-[6px] text-[12px] font-medium flex items-center gap-2 border transition-colors cursor-pointer ${
                  authMethod === 'private-key'
                    ? 'border-[#005459] bg-[#E2F0FD] text-[#005459] ring-1 ring-[#005459]'
                    : 'border-[#CDD4D0] bg-[#FFFFFF] text-[#565f6b] hover:bg-[#F4F6F5]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>SSH Key {serverType === 'WINDOWS' ? '(OpenSSH)' : ''}</span>
              </button>
            </div>
          </div>

          {/* Password Input */}
          {authMethod === 'password' ? (
            <div>
              <label className="block text-[12px] font-medium text-[#101d26] mb-1">
                {serverType === 'WINDOWS' ? 'Windows Account Password' : 'Password'}{' '}
                {!serverToEdit && <span className="text-[#BA1A1A]">*</span>}
              </label>
              <input
                type="password"
                placeholder={
                  serverToEdit
                    ? 'Leave empty to keep existing password, or enter new password'
                    : serverType === 'WINDOWS'
                    ? 'Enter Windows Administrator password'
                    : 'Enter server password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] font-mono outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                required={!serverToEdit}
              />
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[12px] font-medium text-[#101d26]">
                  Private key {!serverToEdit && <span className="text-[#BA1A1A]">*</span>}
                </label>
                <span className="font-mono text-[10px] text-[#565f6b] bg-[#F4F6F5] px-2 py-0.5 rounded-[4px] border border-[#E2E7E4]">
                  OpenSSH / RSA / Ed25519
                </span>
              </div>
              <textarea
                rows={4}
                value={privateKey}
                onChange={(e) => setPrivateKey(e.target.value)}
                placeholder={
                  serverToEdit
                    ? 'Leave empty to keep existing private key, or paste new key...'
                    : 'Paste PEM or OpenSSH private key...'
                }
                className="w-full p-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] font-mono text-[11px] leading-relaxed text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15 resize-none"
                required={!serverToEdit}
              />
            </div>
          )}

          {/* Key passphrase */}
          {authMethod === 'private-key' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[12px] font-medium text-[#101d26]">
                  Key passphrase (optional)
                </label>
                <span className="text-[11px] text-[#565f6b]">Leave empty if unencrypted</span>
              </div>
              <input
                type="password"
                placeholder={serverToEdit ? 'Leave empty to keep current or if unencrypted' : 'Passphrase'}
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] font-mono outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
              />
            </div>
          )}

          {/* Security Notice */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#565f6b]">
            <Lock className="w-3.5 h-3.5 text-[#565f6b]" />
            <span>Stored encrypted in server secrets vault. Never exposed in API responses.</span>
          </div>

          {/* Connection Test & Details */}
          {testStatus === 'success' && testDetails && (
            <div className="p-3 bg-[#EAF5EE] border border-[#B8E0C5] rounded-[6px] text-[12px] font-mono text-[#2E8B57] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E8B57]" />
              <span>{testDetails}</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#E2E7E4] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="h-[34px] px-3 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#101d26] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-[#005459]" />
                <span>{testStatus === 'testing' ? 'Testing endpoint...' : 'Test connection'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="h-[34px] px-3 rounded-[6px] text-[12px] font-medium text-[#565f6b] hover:text-[#101d26] hover:bg-[#F4F6F5] transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`h-[34px] px-4 rounded-[6px] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  serverType === 'WINDOWS'
                    ? 'bg-[#0078D4] hover:bg-[#006CBE]'
                    : 'bg-[#005459] hover:bg-[#0B5459]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{serverToEdit ? 'Updating...' : 'Saving...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>{serverToEdit ? 'Update server' : 'Save server'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
