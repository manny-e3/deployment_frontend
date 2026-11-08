import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sun,
  Moon,
  ArrowLeft,
  Mail
} from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { AuthSidePanel } from '../components/AuthSidePanel'
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
    <div className="min-h-screen flex bg-white dark:bg-[#0D1117] selection:bg-[#005459] selection:text-white transition-colors duration-200">
      {/* 1. Left Column: Forgot Password Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 min-h-screen text-zinc-900 dark:text-zinc-100">
        {/* Top Navbar */}
        <div className="flex items-center justify-between w-full">
          <Link to="/" className="flex items-center gap-2 group">
            <SlipwayLogo size="sm" />
            <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
              PortalOps
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to sign in</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer shadow-2xs"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Center Container */}
        <div className="w-full max-w-[420px] mx-auto my-auto py-8">
          {isSubmitted ? (
            <div className="space-y-5 text-left">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Check your inbox
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  If an account matches <strong className="font-mono text-zinc-900 dark:text-white">{email}</strong>, you will receive an email with instructions to reset your password shortly.
                </p>
              </div>

              <div className="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">•</span>
                  <span>The reset link expires in 60 minutes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300">•</span>
                  <span>Check your spam or junk folder if you don't see it within a couple minutes.</span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  to="/login"
                  className="w-full h-10 rounded-lg bg-[#005459] hover:bg-[#004246] active:bg-[#003538] text-white font-semibold text-xs flex items-center justify-center transition-colors shadow-xs"
                >
                  Return to sign in
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false)
                    setErrorMessage(null)
                  }}
                  className="w-full text-center text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 py-1.5 transition-colors cursor-pointer"
                >
                  Try a different email
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="text-left mb-6">
                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Reset password
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2">
                  Remember your password?{' '}
                  <Link
                    to="/login"
                    className="text-[#005459] dark:text-teal-400 font-semibold hover:underline"
                  >
                    Log in
                  </Link>
                </p>
              </div>

              {/* Error Banner */}
              {errorMessage && (
                <div className="mb-4 p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2.5 leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (errorMessage) setErrorMessage(null)
                      }}
                      placeholder="name@company.com"
                      className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm outline-none transition-all focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 placeholder:text-zinc-400"
                    />
                    <Mail className="w-4 h-4 text-zinc-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !email}
                    className="w-full h-10 rounded-lg bg-[#005459] hover:bg-[#004246] active:bg-[#003538] dark:bg-[#005459] dark:hover:bg-[#00686E] text-white font-semibold text-xs tracking-wide shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <span>Send Password Reset Link</span>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Bottom Trust Note */}
        <div className="w-full text-center text-xs text-zinc-400 py-2">
          Protected by AES-256-GCM encryption &amp; zero root key storage.
        </div>
      </div>

      {/* 2. Right Column: Ploi-Grade Feature Panel */}
      <AuthSidePanel />
    </div>
  )
}
