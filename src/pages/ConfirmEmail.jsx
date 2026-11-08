import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  ArrowRight,
  ShieldCheck,
  Sun,
  Moon,
  RefreshCw,
} from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'

export function ConfirmEmail() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const { confirmEmail, resendConfirmation, user } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { showToast } = useToast()

  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [resendEmail, setResendEmail] = useState(user?.email || '')
  const [isResending, setIsResending] = useState(false)
  const [resendSent, setResendSent] = useState(false)

  useEffect(() => {
    let isMounted = true

    async function verify() {
      if (!token) {
        if (isMounted) {
          setLoading(false)
          setErrorMessage('Missing confirmation token. Please check the link from your email.')
        }
        return
      }

      try {
        await confirmEmail(token)
        if (isMounted) {
          setSuccess(true)
          setLoading(false)
          showToast({
            type: 'success',
            title: 'Email Confirmed',
            message: 'Your email address has been verified successfully. Welcome to PortalOps!',
            duration: 6000,
          })
          // Auto-redirect to onboarding after 3 seconds
          setTimeout(() => {
            if (isMounted) {
              navigate('/onboarding', { replace: true })
            }
          }, 3000)
        }
      } catch (err) {
        if (isMounted) {
          setLoading(false)
          setErrorMessage(err.message || 'This email confirmation link is invalid or has expired.')
        }
      }
    }

    verify()
    return () => {
      isMounted = false
    }
  }, [token, confirmEmail, navigate, showToast])

  const handleResend = async (e) => {
    e.preventDefault()
    if (!resendEmail) return

    setIsResending(true)
    try {
      await resendConfirmation(resendEmail)
      setResendSent(true)
      showToast({
        type: 'success',
        title: 'Confirmation Sent',
        message: `A new confirmation link has been sent to ${resendEmail}.`,
      })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Failed to Resend',
        message: err.message || 'Could not send confirmation email.',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#07090D] flex flex-col items-center justify-center p-4 selection:bg-zinc-900 selection:text-white dark:selection:bg-emerald-500/20 dark:selection:text-emerald-300 transition-colors duration-200 relative">
      {/* Top Bar Switcher & Back Home */}
      <div className="absolute top-5 right-6 flex items-center gap-3">
        <Link
          to="/"
          className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          &larr; Back to overview
        </Link>
        <button
          type="button"
          onClick={toggleTheme}
          className="w-8 h-8 rounded-[6px] border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0E151D] flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="w-full max-w-[460px] bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-8 shadow-xs">
        {/* Brand Logo */}
        <Link to="/" className="inline-block hover:opacity-85 transition-opacity" title="Back to PortalOps">
          <SlipwayLogo size="lg" />
        </Link>

        {loading ? (
          <div className="mt-8 text-center py-6 space-y-3">
            <Loader2 className="w-8 h-8 text-[#005459] dark:text-emerald-400 animate-spin mx-auto" />
            <h2 className="text-[16px] font-semibold text-zinc-950 dark:text-white">
              Confirming your email address...
            </h2>
            <p className="text-[13px] text-zinc-500 dark:text-zinc-400">
              Verifying your secure confirmation token with PortalOps root authority.
            </p>
          </div>
        ) : success ? (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-[8px] bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[15px] font-semibold text-emerald-950 dark:text-emerald-100">
                    Email Confirmed Successfully!
                  </h3>
                  <p className="text-[12.5px] text-emerald-800 dark:text-emerald-300 mt-1 leading-relaxed">
                    Your email address has been verified. You can now access your workspace and begin the onboarding setup.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-[6px] bg-zinc-50 dark:bg-[#070A0F] border border-zinc-200 dark:border-zinc-800 space-y-2 text-[12px]">
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Account Status:</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">Verified Active</span>
              </div>
              <div className="flex justify-between text-zinc-500 dark:text-zinc-400">
                <span>Access Granted:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">Workspace Onboarding Screen</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/onboarding', { replace: true })}
              className="w-full h-[38px] rounded-[6px] bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-[13px] inline-flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
            >
              <span>Continue to Workspace Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-center text-[11.5px] text-zinc-400 dark:text-zinc-500">
              Redirecting automatically to onboarding in 3 seconds...
            </p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="p-4 rounded-[8px] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-[15px] font-semibold text-red-950 dark:text-red-100">
                    Confirmation Link Expired or Invalid
                  </h3>
                  <p className="text-[12.5px] text-red-800 dark:text-red-300 mt-1 leading-relaxed">
                    {errorMessage || 'This email confirmation link is invalid or has already expired.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <h4 className="text-[13px] font-medium text-zinc-900 dark:text-zinc-200 mb-2">
                Need a new confirmation link?
              </h4>
              <form onSubmit={handleResend} className="space-y-3">
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder="Enter your registered email address"
                    className="w-full h-[36px] pl-8 pr-3 bg-zinc-50 dark:bg-[#070A0F] border border-zinc-200 dark:border-zinc-800 rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full h-[36px] rounded-[6px] border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-medium text-[12.5px] inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending confirmation link...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Resend Confirmation Email</span>
                    </>
                  )}
                </button>
                {resendSent && (
                  <p className="text-[12px] text-emerald-600 dark:text-emerald-400 text-center font-medium">
                    A new confirmation email has been dispatched. Please check your inbox.
                  </p>
                )}
              </form>
            </div>

            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-[12px]">
              <Link
                to="/login"
                className="font-medium text-zinc-900 dark:text-zinc-200 hover:underline"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

