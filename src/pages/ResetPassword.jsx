import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  ArrowRight,
  Loader2,
  Sun,
  Moon,
  ArrowLeft,
  KeyRound,
} from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
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

      {/* Centered Reset Card */}
      <div className="w-full max-w-[440px] bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-8 shadow-xs">
        {/* Brand Logo */}
        <Link to="/" className="inline-block hover:opacity-85 transition-opacity" title="Back to PortalOps">
          <SlipwayLogo size="lg" />
        </Link>

        {verifying ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
            <Loader2 className="w-7 h-7 text-[#005459] animate-spin" />
            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 font-medium">
              Verifying reset token...
            </p>
          </div>
        ) : isSuccess ? (
          <div className="mt-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h1 className="text-[20px] font-bold text-zinc-950 dark:text-white tracking-tight mt-4">
              Password reset successfully
            </h1>

            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
              Your password has been securely updated. All existing sessions have been signed out. You can now log in with your new password.
            </p>

            <div className="mt-6">
              <Link
                to="/login"
                className="w-full h-[38px] rounded-[6px] bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-[13px] inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>Proceed to Sign in</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : !tokenValid ? (
          <div className="mt-6 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertCircle className="w-6 h-6" />
            </div>

            <h1 className="text-[20px] font-bold text-zinc-950 dark:text-white tracking-tight mt-4">
              Invalid or expired link
            </h1>

            <p className="text-[13px] text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
              {verifyError || 'This password reset link is invalid or has already expired. Password reset links can only be used once and expire after 60 minutes.'}
            </p>

            <div className="mt-6 space-y-2">
              <Link
                to="/forgot-password"
                className="w-full h-[38px] rounded-[6px] bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-[13px] inline-flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <span>Request a new link</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                to="/login"
                className="block w-full text-center text-[12.5px] text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 py-1.5 transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Form Heading */}
            <div className="mt-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium mb-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Verified Reset Request</span>
              </div>

              <h1 className="text-[22px] font-bold text-zinc-950 dark:text-white tracking-tight">
                Create new password
              </h1>
              <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-normal">
                {userEmail ? (
                  <>Setting new password for <strong className="text-zinc-800 dark:text-zinc-200 font-medium">{userEmail}</strong></>
                ) : (
                  'Choose a password with at least 6 characters.'
                )}
              </p>
            </div>

            {/* Error Banner */}
            {errorMessage && (
              <div className="mt-4 p-3 rounded-[6px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-[12.5px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-[12.5px] font-medium text-zinc-900 dark:text-zinc-200 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (errorMessage) setErrorMessage(null)
                    }}
                    className="w-full h-[36px] pl-3 pr-10 bg-zinc-50 dark:bg-[#070A0F] rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 outline-none border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                    placeholder="At least 6 characters"
                    required
                    minLength={6}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="w-7 h-7 absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12.5px] font-medium text-zinc-900 dark:text-zinc-200 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (errorMessage) setErrorMessage(null)
                    }}
                    className="w-full h-[36px] pl-3 pr-10 bg-zinc-50 dark:bg-[#070A0F] rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 outline-none border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 transition-colors"
                    placeholder="Repeat new password"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="w-7 h-7 absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center justify-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors cursor-pointer"
                    title={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="text-[11.5px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 pt-1">
                <Lock className="w-3 h-3 text-zinc-400" />
                <span>Must be at least 6 characters in length.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !newPassword || !confirmPassword}
                className="w-full h-[38px] rounded-[6px] bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-[13px] inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 shadow-xs"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <>
                    <span>Update password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
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

