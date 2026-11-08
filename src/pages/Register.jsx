import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  AlertCircle,
  Eye,
  EyeOff,
  Mail,
  Loader2,
  Sun,
  Moon,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { AuthSidePanel } from '../components/AuthSidePanel'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../context/ToastContext'

export function Register() {
  const navigate = useNavigate()
  const { register, resendConfirmation, isAuthenticated, isEmailVerified } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const { showToast } = useToast()

  const [name, setName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [registrationSuccess, setRegistrationSuccess] = useState(false)
  const [isResending, setIsResending] = useState(false)

  // Redirect if already authenticated AND email is verified
  useEffect(() => {
    if (isAuthenticated && isEmailVerified && !isSubmitting && !registrationSuccess) {
      navigate('/onboarding', { replace: true })
    }
  }, [isAuthenticated, isEmailVerified, isSubmitting, registrationSuccess, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your password.')
      return
    }

    if (!agreeTerms) {
      setErrorMessage('Please accept the Terms of Service to create your workspace.')
      return
    }

    setIsSubmitting(true)
    try {
      await register({
        name,
        organizationName,
        email,
        password
      })

      setRegistrationSuccess(true)
      showToast({
        type: 'success',
        title: 'Account Created',
        message: `Confirmation email sent to ${email}. Please confirm your email to continue.`,
        duration: 7000,
      })
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create workspace account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setIsResending(true)
    try {
      await resendConfirmation(email)
      showToast({
        type: 'success',
        title: 'Confirmation Email Sent',
        message: `A fresh confirmation link has been sent to ${email}.`,
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

  const handleOAuthNotice = (provider) => {
    setErrorMessage(null)
    setName(`${provider} Developer`)
    setOrganizationName(`${provider} Workspace`)
    setEmail(`dev@${provider.toLowerCase()}.com`)
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-[#0D1117] selection:bg-[#005459] selection:text-white transition-colors duration-200">
      {/* 1. Left Column: Registration Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-12 xl:p-16 min-h-screen text-zinc-900 dark:text-zinc-100">
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
              to="/"
              className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to home</span>
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
        <div className="w-full max-w-[430px] mx-auto my-auto py-6">
          {registrationSuccess ? (
            /* Email Confirmation Notification Card */
            <div className="space-y-5 text-left">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Confirm your email
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  We sent a confirmation link to <strong className="font-mono text-zinc-900 dark:text-white">{email}</strong>. Please check your inbox and verify your email to access your workspace.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResend}
                  className="w-full h-10 rounded-lg bg-[#005459] hover:bg-[#004246] active:bg-[#003538] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resending Link...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Resend Confirmation Email</span>
                    </>
                  )}
                </button>

                <Link
                  to="/login"
                  className="w-full h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 flex items-center justify-center transition-colors"
                >
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            /* Registration Form */
            <>
              <div className="text-left mb-6">
                <h1 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Create an account
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1.5">
                  Already have an account?{' '}
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

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full h-10 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm outline-none transition-all focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 placeholder:text-zinc-400"
                  />
                </div>

                {/* Organization / Workspace Name */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                    Workspace / Organization Name
                  </label>
                  <input
                    type="text"
                    required
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="e.g. Acme Dev Studio"
                    className="w-full h-10 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm outline-none transition-all focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 placeholder:text-zinc-400"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-10 px-3.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm outline-none transition-all focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 placeholder:text-zinc-400"
                  />
                </div>

                {/* Password Fields Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        className="w-full h-10 pl-3 pr-8 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm outline-none transition-all focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 placeholder:text-zinc-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full h-10 px-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-sm outline-none transition-all focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/20 dark:focus:border-teal-400 dark:focus:ring-teal-400/20 placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                {/* Terms Acceptance */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-zinc-300 text-[#005459] focus:ring-[#005459] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                    I agree to the Terms of Service &amp; Privacy Policy
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-10 rounded-lg bg-[#005459] hover:bg-[#004246] active:bg-[#003538] dark:bg-[#005459] dark:hover:bg-[#00686E] text-white font-semibold text-xs tracking-wide shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Workspace...</span>
                      </>
                    ) : (
                      <span>Create Account &amp; Workspace</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Or sign up via Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200 dark:border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="bg-white dark:bg-[#0D1117] px-3 font-medium">
                    Or sign up via
                  </span>
                </div>
              </div>

              {/* 2x2 SSO Buttons Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleOAuthNotice('GitHub')}
                  className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                  </svg>
                  <span>GitHub</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthNotice('Bitbucket')}
                  className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-[#2684FF]" viewBox="0 0 24 24">
                    <path d="M.778 1.213a.77.77 0 00-.77.874l3.188 19.98c.065.41.419.714.834.714h15.932c.389 0 .727-.266.818-.646L23.992 2.087a.77.77 0 00-.77-.874H.778zm13.67 13.914H9.558L8.27 8.358h7.458l-1.28 6.769z"/>
                  </svg>
                  <span>Bitbucket</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthNotice('GitLab')}
                  className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4 fill-[#FC6D26]" viewBox="0 0 24 24">
                    <path d="M23.955 13.587l-1.342-4.135-2.664-8.189c-.135-.423-.73-.423-.867 0L16.418 9.45H7.582L4.918 1.263c-.136-.423-.731-.423-.867 0L1.387 9.452.045 13.587a.837.837 0 00.3.923l11.655 8.468 11.655-8.468a.837.837 0 00.3-.923" />
                  </svg>
                  <span>GitLab</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOAuthNotice('Google')}
                  className="h-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-center gap-2.5 transition-colors cursor-pointer shadow-2xs"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Google</span>
                </button>
              </div>
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
