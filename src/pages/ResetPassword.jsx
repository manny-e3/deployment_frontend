import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Loader2,
  Sun,
  Moon,
  ArrowLeft,
  KeyRound
} from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { AuthSidePanel } from '../components/AuthSidePanel'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { verifyResetToken, resetPassword } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const [verifying, setVerifying] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [verifyError, setVerifyError] = useState(null)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Verify token on mount
  useEffect(() => {
    let isMounted = true

    async function checkToken() {
      if (!token) {
        if (isMounted) {
          setVerifyError('Missing password reset token. Please request a new link.')
          setVerifying(false)
        }
        return
      }

      try {
        const res = await verifyResetToken(token)
        if (isMounted) {
          setTokenValid(true)
          if (res?.email) setUserEmail(res.email)
        }
      } catch (err) {
        if (isMounted) {
          setVerifyError(err.message || 'This password reset link is invalid or has expired.')
        }
      } finally {
        if (isMounted) setVerifying(false)
      }
    }

    checkToken()
    return () => {
      isMounted = false
    }
  }, [token, verifyResetToken])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await resetPassword({
        token,
        newPassword,
      })
      setIsSuccess(true)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to reset password. The link may have expired.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0D1117] selection:bg-[#005459] selection:text-white transition-colors duration-200">
      {/* 1. Left Column: Reset Password Form */}
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
          {verifying ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                Verifying reset token...
              </p>
            </div>
          ) : isSuccess ? (
            <div className="space-y-5 text-left">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Password updated
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  Your password has been securely updated. All existing active sessions have been signed out.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full h-10 rounded-lg bg-[#005459] hover:bg-[#004246] active:bg-[#003538] text-white font-semibold text-xs flex items-center justify-center transition-colors shadow-xs"
                >
                  Sign in with new password
                </Link>
              </div>
            </div>
          ) : !tokenValid ? (
            <div className="space-y-5 text-left">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Invalid or expired link
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  {verifyError || 'This password reset link is invalid or has expired. Password reset links expire after 60 minutes.'}
                </p>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  to="/forgot-password"
                  className="w-full h-10 rounded-lg bg-[#005459] hover:bg-[#004246] active:bg-[#003538] text-white font-semibold text-xs flex items-center justify-center transition-colors shadow-xs"
                >
                  Request a new link
                </Link>

                <Link
                  to="/login"
                  className="block w-full text-center text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 py-1.5 transition-colors"
                >
                  Back to sign in
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-left mb-6">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#005459]/15 dark:bg-[#005459]/30 border border-[#005459]/30 text-[#005459] dark:text-teal-300 text-xs font-medium mb-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Verified Reset Token</span>
                </div>

                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Set new password
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {userEmail ? (
                    <>Updating credentials for <strong className="font-mono text-zinc-900 dark:text-white">{userEmail}</strong></>
                  ) : (
                    'Choose a password with at least 6 characters.'
                  )}
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
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value)
                        if (errorMessage) setErrorMessage(null)
                      }}
                      placeholder="Min 6 characters"
                      className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm outline-none transition-all focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value)
                        if (errorMessage) setErrorMessage(null)
                      }}
                      placeholder="Repeat new password"
                      className="w-full h-11 pl-3.5 pr-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm outline-none transition-all focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 placeholder:text-zinc-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newPassword || !confirmPassword}
                    className="w-full h-10 rounded-lg bg-[#005459] hover:bg-[#004246] active:bg-[#003538] dark:bg-[#005459] dark:hover:bg-[#00686E] text-white font-semibold text-xs tracking-wide shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <span>Update Password &amp; Sign In</span>
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
