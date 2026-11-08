import { useState, useEffect } from 'react'
import { X, Maximize2, Minimize2, ExternalLink, KeyRound, Check, Shield } from 'lucide-react'
import {
  DigitalOceanLogo,
  HetznerLogo,
  VultrLogo,
  LinodeLogo,
  AmazonEC2Logo,
  UpCloudLogo,
  KrystalLogo,
  HostingerLogo,
} from './ProviderLogos'

export const PROVIDERS_LIST = [
  {
    id: 'hostinger',
    name: 'Hostinger',
    guideUrl: 'https://support.hostinger.com/en/',
    logo: HostingerLogo,
    placeholder: 'hostinger_token_xxxxxxxx',
    disabled: true,
  },
]

export function AddServerProviderModal({ isOpen, onClose, onSaveProvider }) {
  const [selectedProviderId, setSelectedProviderId] = useState('hostinger')
  const [label, setLabel] = useState('Hostinger')
  const [apiKey, setApiKey] = useState('')
  const [isExpanded, setIsExpanded] = useState(false)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Update label default when provider selection changes if user hasn't heavily customized it
  const handleSelectProvider = (provider) => {
    if (provider.disabled) return
    setSelectedProviderId(provider.id)
    setLabel(provider.name)
    setError(null)
  }

  useEffect(() => {
    if (isOpen) {
      setSelectedProviderId('hostinger')
      setLabel('Hostinger')
      setApiKey('')
      setError(null)
      setIsSaving(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = (e) => {
    e.preventDefault()
    if (!label.trim()) {
      setError('Please provide a recognizable label for this provider.')
      return
    }
    if (!apiKey.trim()) {
      setError('Please provide a valid API key or access token.')
      return
    }

    setIsSaving(true)
    const providerMeta = PROVIDERS_LIST.find((p) => p.id === selectedProviderId) || PROVIDERS_LIST[0]
    const newCred = {
      id: `prov_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      providerId: providerMeta.id,
      providerName: providerMeta.name,
      label: label.trim(),
      apiKeyMasked: apiKey.length > 8 ? `${apiKey.substring(0, 4)}••••${apiKey.substring(apiKey.length - 4)}` : '••••••••',
      createdAt: new Date().toISOString(),
    }

    try {
      const stored = localStorage.getItem('portalops_server_providers')
      const parsed = stored ? JSON.parse(stored) : []
      parsed.unshift(newCred)
      localStorage.setItem('portalops_server_providers', JSON.stringify(parsed))
    } catch (err) {
      console.warn('Could not persist provider to localStorage:', err)
    }

    if (onSaveProvider) {
      onSaveProvider(newCred)
    }

    setIsSaving(false)
    onClose()
  }

  const activeProvider = PROVIDERS_LIST.find((p) => p.id === selectedProviderId) || PROVIDERS_LIST[0]

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-[#0B1317] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl flex flex-col transition-all duration-200 ${isExpanded
            ? 'w-[95vw] h-[92vh] max-w-5xl'
            : 'w-full max-w-lg max-h-[90vh]'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between shrink-0">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Add server provider
          </h2>
          <div className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title={isExpanded ? 'Restore size' : 'Expand window'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body Content */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Subtitle description */}
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            You can add a server provider here to be able to create servers with, you can get the API keys at the provider. If you want to use your own vendor that's no problem, just click 'Custom VPS' and follow the steps.
          </p>

          {/* Provider Radios */}
          <div className="space-y-2.5">
            {PROVIDERS_LIST.map((prov) => {
              const LogoComp = prov.logo
              const isSelected = selectedProviderId === prov.id
              const isDisabled = prov.disabled
              return (
                <div
                  key={prov.id}
                  onClick={() => !isDisabled && handleSelectProvider(prov)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg border transition-all ${
                    isDisabled
                      ? 'opacity-40 cursor-not-allowed border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/30 dark:bg-[#060D10]/30'
                      : isSelected
                      ? 'border-[#005459] bg-[#005459]/5 dark:bg-[#005459]/15 cursor-pointer'
                      : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-[#060D10] cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Custom Radio Button */}
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                        isDisabled
                          ? 'border-zinc-200 dark:border-zinc-800 bg-transparent'
                          : isSelected
                          ? 'border-[#005459] bg-[#005459]'
                          : 'border-zinc-300 dark:border-zinc-600 bg-transparent'
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>

                    {/* Logo & Name */}
                    <div className="flex items-center gap-2.5">
                      <LogoComp className="w-5 h-5 shrink-0" />
                      <span className="text-sm font-medium text-zinc-900 dark:text-white">
                        {prov.name}
                      </span>
                      {isDisabled && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          Soon
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Guide Link */}
                  {!isDisabled && (
                    <a
                      href={prov.guideUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs text-[#0080FF] hover:underline flex items-center gap-1 font-medium"
                    >
                      <span>Guide</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                </div>
              )
            })}
          </div>

          {/* Form Fields */}
          <div className="space-y-4 pt-2">
            {/* Label */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                Label <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. DigitalOcean - Personal"
                className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:border-[#005459] transition-colors"
              />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                Use this to recognise your credentials if you have more than one account per provider
              </p>
            </div>

            {/* API Key */}
            <div>
              <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                API key <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={activeProvider.placeholder}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-zinc-50 dark:bg-[#060D10] border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono focus:outline-none focus:border-[#005459] transition-colors pr-9"
                />
                <KeyRound className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-xs text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Footer Submit Button */}
          <div className="pt-3 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2 rounded-lg bg-[#005459] hover:bg-[#064347] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

