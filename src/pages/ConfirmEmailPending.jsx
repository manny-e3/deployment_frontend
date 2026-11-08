import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  RefreshCw,
  Loader2,
  ShieldAlert,
  LogOut,
  Sun,
  Moon,
  ExternalLink,
} from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'

export function ConfirmEmailPending() {
  const { user, resendConfirmation, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { showToast } = useToast()

  const [isResending, setIsResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  const email = user?.email || 'your registered email'

  const handleResend = async () => {
    setIsResending(true)
    setResendSuccess(false)
    try {
      await resendConfirmation(user?.email)
      setResendSuccess(true)
      showToast({
        type: 'success',
        title: 'Confirmation Resent',
        message: `A new confirmation link has been sent to ${email}.`,
      })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Failed to Resend',
        message: err.message || 'Could not resend confirmation email.',
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleCheckStatus = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#07090D] flex flex-col items-center justify-center p-4 selection:bg-zinc-900 selection:text-white dark:selection:bg-emerald-500/20 dark:selection:text-emerald-300 transition-colors duration-200 relative">
      {/* Top Bar Switcher */}
      <div className="absolute top-5 right-6 flex items-center gap-3">
        <button
          type="button"
          onClick={logout}
          className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign out</span>
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-[6px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0E151D] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-[480px] bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-8 shadow-xs">
        {/* Brand Logo */}
        <Link to="/" className="inline-block hover:opacity-85 transition-opacity" title="Back to PortalOps">
          <SlipwayLogo size="lg" />
        </Link>

        {/* Security / Action Required Badge */}
        <div className="mt-5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-[11px] font-mono mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Action Required • Email Confirmation</span>
          </div>

          <h1 className="text-[22px] font-bold text-zinc-950 dark:text-white tracking-tight">
            Confirm your email address
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-normal leading-relaxed">
            Before you can view the onboarding screen or provision targets, you must verify your email address.
          </p>
        </div>

        {/* Notice Card */}
        <div className="mt-5 p-4 rounded-[8px] bg-zinc-50 dark:bg-[#070A0F] border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#005459]/10 dark:bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
              <Mail className="w-4 h-4 text-[#005459] dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-zinc-900 dark:text-zinc-100">
                Confirmation link dispatched
              </div>
              <p className="text-[12.5px] text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
                We sent a confirmation link to <strong className="font-mono text-zinc-900 dark:text-white">{email}</strong>. Please check your inbox and click the button to confirm your account.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[11.5px] text-zinc-500 dark:text-zinc-400">
            <span>Onboarding Status:</span>
            <span className="font-mono font-medium text-amber-600 dark:text-amber-400">Gated (Unconfirmed)</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-3">
          <button
            type="button"
            onClick={handleCheckStatus}
            className="w-full h-[38px] rounded-[6px] bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-[13px] inline-flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>I have confirmed my email &rarr; Refresh</span>
          </button>

          <button
            type="button"
            disabled={isResending}
            onClick={handleResend}
            className="w-full h-[36px] rounded-[6px] border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300 font-medium text-[12.5px] inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-colors"
          >
            {isResending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Resending confirmation email...</span>
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                <span>Resend confirmation email</span>
              </>
            )}
          </button>

          {resendSuccess && (
            <p className="text-[12px] text-emerald-600 dark:text-emerald-400 text-center font-medium">
              A new confirmation link has been dispatched to your inbox.
            </p>
          )}
        </div>

        {/* Footer Guidance */}
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-[12px] text-zinc-500 dark:text-zinc-400">
          Didn't receive an email? Check your spam folder or contact your administrator.
        </div>
      </div>
    </div>
  )
}

