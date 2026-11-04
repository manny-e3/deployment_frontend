import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Lock, ArrowRight, Loader2, Sun, Moon } from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberSession, setRememberSession] = useState(true)
  const [errorMessage, setErrorMessage] = useState(null)
  const [errorRequestId, setErrorRequestId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasError = Boolean(errorMessage)
  const from = location.state?.from?.pathname || '/dashboard'

  // If already logged in, redirect to intended target or dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorRequestId(null)
    setErrorMessage(null)

    try {
      await login({
        email,
        password,
      })
      navigate(from, { replace: true })
    } catch (err) {
      setErrorMessage(err.message || 'Email or password is incorrect.')
      if (err.requestId) {
        setErrorRequestId(err.requestId)
      }
    } finally {
      setIsSubmitting(false)
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

      {/* Centered Sign In Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-8 shadow-xs">
        {/* Brand Logo */}
        <Link to="/" className="inline-block hover:opacity-85 transition-opacity" title="Back to Slipway">
          <SlipwayLogo size="lg" />
        </Link>

        {/* Heading */}
        <div className="mt-5">
          <h1 className="text-[22px] font-bold text-zinc-950 dark:text-white tracking-tight">
            Sign in
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-normal">
            Welcome back to your deployment control plane
          </p>
        </div>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="mt-5 p-3 rounded-[6px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-[12.5px] space-y-1">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            {errorRequestId && (
              <div className="text-[10px] font-mono text-red-500 pl-6">
                Request ID: {errorRequestId}
              </div>
            )}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Email Address */}
          <div>
            <label className="block text-[12.5px] font-medium text-zinc-900 dark:text-zinc-200 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              className={`w-full h-[36px] px-3 bg-zinc-50 dark:bg-[#070A0F] rounded-[6px] font-mono text-[12.5px] text-zinc-900 dark:text-zinc-100 outline-none border transition-colors ${
                hasError
                  ? 'border-red-400 dark:border-red-600 focus:ring-1 focus:ring-red-400'
                  : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600'
              }`}
              placeholder="operator@internal.corp"
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[12.5px] font-medium text-zinc-900 dark:text-zinc-200">
                Password
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                className={`w-full h-[36px] pl-3 pr-10 bg-zinc-50 dark:bg-[#070A0F] rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 outline-none border transition-colors ${
                  hasError
                    ? 'border-red-400 dark:border-red-600 focus:ring-1 focus:ring-red-400'
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600'
                }`}
                placeholder="••••••••••••"
                required
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

          {/* Remember session checkbox */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              checked={rememberSession}
              onChange={(e) => setRememberSession(e.target.checked)}
              className="w-3.5 h-3.5 rounded-[4px] border-zinc-300 dark:border-zinc-700 text-zinc-900 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="remember" className="text-[12px] text-zinc-600 dark:text-zinc-400 select-none cursor-pointer">
              Remember credentials for this terminal
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[38px] rounded-[6px] bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-[13px] inline-flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 shadow-xs"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Divider & Managed Access Footer */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-6 space-y-3 text-center text-[12px] text-zinc-600 dark:text-zinc-400">
          <div>
            Need to set up a new workspace?{' '}
            <Link
              to="/register"
              className="font-medium text-zinc-900 dark:text-zinc-200 hover:underline cursor-pointer"
            >
              Register Super Admin
            </Link>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-500">
            <Lock className="w-3 h-3" />
            <span>Colleagues can be onboarded after workspace setup.</span>
          </div>
        </div>
      </div>

      {/* External Footer */}
      <div className="mt-6 text-center font-mono text-[11.5px] text-zinc-500 dark:text-zinc-500">
        Slipway v2.4 • Zero-Downtime Control Plane
      </div>
    </div>
  )
}
