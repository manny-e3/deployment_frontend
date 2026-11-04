import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  AlertCircle,
  Eye,
  EyeOff,
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export function Register() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const [name, setName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/onboarding', { replace: true })
    }
  }, [isAuthenticated, navigate])

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

    setIsSubmitting(true)
    try {
      await register({
        name,
        organizationName,
        email,
        password
      })
      navigate('/onboarding', { replace: true })
    } catch (err) {
      setErrorMessage(err.message || 'Failed to create workspace account. Please try again.')
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

      <div className="w-full max-w-[460px] bg-white dark:bg-[#0D1219] border border-zinc-200 dark:border-zinc-800 rounded-[8px] p-8 shadow-xs">
        {/* Brand Logo */}
        <Link to="/" className="inline-block hover:opacity-85 transition-opacity" title="Back to Slipway">
          <SlipwayLogo size="lg" />
        </Link>

        {/* Heading */}
        <div className="mt-5">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[5px] bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Workspace Provisioning • Root Authority</span>
          </div>

          <h1 className="text-[22px] font-bold text-zinc-950 dark:text-white tracking-tight">
            Create your workspace
          </h1>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-1 font-normal leading-relaxed">
            The initial user receives Super Admin privileges to invite team members and configure multi-target environments.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-[6px] bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-[12.5px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[12px] font-medium text-zinc-900 dark:text-zinc-200 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full h-[36px] pl-8 pr-3 bg-zinc-50 dark:bg-[#070A0F] border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Organization Name */}
          <div>
            <label className="block text-[12px] font-medium text-zinc-900 dark:text-zinc-200 mb-1">
              Organization or Team Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                placeholder="Acme Platform Systems"
                className="w-full h-[36px] pl-8 pr-3 bg-zinc-50 dark:bg-[#070A0F] border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Work Email */}
          <div>
            <label className="block text-[12px] font-medium text-zinc-900 dark:text-zinc-200 mb-1">
              Work Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.mercer@internal.corp"
                className="w-full h-[36px] pl-8 pr-3 bg-zinc-50 dark:bg-[#070A0F] border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 rounded-[6px] font-mono text-[12.5px] text-zinc-900 dark:text-zinc-100 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[12px] font-medium text-zinc-900 dark:text-zinc-200 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-[36px] pl-8 pr-10 bg-zinc-50 dark:bg-[#070A0F] border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 font-mono outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-[12px] font-medium text-zinc-900 dark:text-zinc-200 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-[36px] pl-8 pr-3 bg-zinc-50 dark:bg-[#070A0F] border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-600 rounded-[6px] text-[13px] text-zinc-900 dark:text-zinc-100 font-mono outline-none transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[38px] mt-2 rounded-[6px] bg-zinc-950 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-950 font-medium text-[13px] inline-flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Super Admin Workspace...</span>
              </>
            ) : (
              <>
                <span>Continue to Team Onboarding</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link to Sign In */}
        <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-center text-[12px] text-zinc-600 dark:text-zinc-400">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-zinc-900 dark:text-zinc-200 hover:underline cursor-pointer"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
