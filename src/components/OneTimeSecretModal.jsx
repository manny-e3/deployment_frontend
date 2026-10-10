import { useState } from 'react'
import { KeyRound, Copy, Check, X, AlertTriangle } from 'lucide-react'

export function OneTimeSecretModal({
  isOpen,
  onClose,
  title = 'One-Time Credential Generated',
  subtitle = 'Copy this credential now. For security, it will never be displayed again.',
  secretLabel = 'Secret Value',
  secretValue = '',
}) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const handleCopy = () => {
    navigator.clipboard?.writeText(secretValue)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-[480px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E7E4] flex items-center justify-between bg-[#FAFBFB]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center shrink-0">
              <KeyRound className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-bold text-[15px] text-[#101d26]">
                {title}
              </h3>
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

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-[12px] text-[#565f6b] leading-relaxed">
            {subtitle}
          </p>

          <div className="p-3 rounded-[6px] bg-[#FAEBE9] border border-[#F1B5AC] flex items-start gap-2.5 text-[12px] text-[#BA1A1A]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#BA1A1A]" />
            <span>
              Store this secret in a secure password manager. The backend stores it encrypted and will never reveal it again.
            </span>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-[#565f6b] mb-1.5 font-semibold">
              {secretLabel}
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2.5 rounded-[6px] bg-[#F4F6F5] border border-[#CDD4D0] font-mono text-[13px] text-[#101d26] break-all select-all font-semibold">
                {secretValue}
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="h-[38px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-[#97F4B6]" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E7E4] flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-[34px] px-4 rounded-[6px] bg-[#101d26] hover:bg-[#253241] text-white text-[12px] font-medium transition-colors cursor-pointer"
            >
              I have saved this credential
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
