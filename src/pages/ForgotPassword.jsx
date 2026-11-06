import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, ArrowRight, Loader2, Sun, Moon, Mail, ArrowLeft } from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export function ForgotPassword() {
  const { forgotPassword } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const [email, setEmail] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      await forgotPassword(email)
      setIsSubmitted(true)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send password reset email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#07090D] flex flex-col items-center justify-center p-4 selection:bg-zinc-900 selection:text-white dark:selection:bg-emerald-500/20 dark:selection:text-emerald-300 transition-colors duration-200 relative">
      {/* Top Bar Switcher & Back Sign In */}
      <div className="absolute top-5 right-6 flex items-center gap-3">
        <Link
          to="/login"
          className="text-[12.5px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
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

      {/* Centered Forgot Password Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-8 shadow-xs">
        {/* Brand Logo */}
        <Link to="/" className="inline-block hover:opacity-85 transition-opacity" title="Back to PortalOps">
          <SlipwayLogo size="lg" />
        </Link>

        {isSubmitted ? (
          <div className="mt-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h1 className="text-[20px] font-bold text-zinc-950 dark:text-white tracking-tight mt-4">
              Check your inbox
            </h1>

            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
              If an account matches <strong className="text-zinc-900 dark:text-zinc-200 font-medium">{email}</strong>, you will receive an email with instructions to reset your password shortly.
            </p>

            <div className="mt-6 p-3.5 rounded-[6px] bg-zinc-50 dark:bg-[#070A0F] border border-zinc-200 dark:border-zinc-800 text-left text-[12px] text-zinc-500 dark:text-zinc-400 space-y-1.5">
              <div className="flex items-start gap-2">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">•</span>
                <span>The link expires in 60 minutes.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">•</span>
                <span>Check your spam or junk folder if you don't see it within a couple minutes.</span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Link
                to="/login"
                className="w-full h-[38px] rounded-[6px] bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-[13px] inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>Return to sign in</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false)
                  setErrorMessage(null)
                }}
                className="w-full text-center text-[12.5px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 py-1.5 transition-colors cursor-pointer"
              >
                Try a different email
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Heading */}
            <div className="mt-5">
              <h1 className="text-[22px] font-bold text-zinc-950 dark:text-white tracking-tight">
                Reset password
              </h1>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-normal">
                Enter your email address and we will send you a link to reset your password.
              </p>
            </div>

            {/* Error Alert Banner */}
            {errorMessage && (
              <div className="mt-5 p-3 rounded-[6px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-[12.5px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Request Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[12.5px] font-medium text-zinc-900 dark:text-zinc-200 mb-1.5">
                  Email address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (errorMessage) setErrorMessage(null)
                    }}
                    className="w-full h-[36px] pl-3 pr-9 bg-zinc-50 dark:bg-[#070A0F] rounded-[6px] font-mono text-[12.5px] text-zinc-900 dark:text-zinc-100 outline-none border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                    placeholder="operator@internal.corp"
                    required
                    autoFocus
                  />
                  <Mail className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !email}
                className="w-full h-[38px] rounded-[6px] bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-[13px] inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <>
                    <span>Send reset link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider & Back to login link */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-6 text-center text-[12px] text-zinc-600 dark:text-zinc-400">
              Remember your password?{' '}
              <Link
                to="/login"
                className="font-medium text-zinc-900 dark:text-zinc-200 hover:underline cursor-pointer"
              >
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>

      {/* External Footer */}
      <div className="mt-6 text-center font-mono text-[11.5px] text-zinc-500 dark:text-zinc-500">
        PortalOps v2.4 • Zero-Downtime Control Plane
      </div>
    </div>
  )
}

