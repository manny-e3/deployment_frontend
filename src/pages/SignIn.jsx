import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertCircle, Eye, EyeOff, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { DeployPortalLogo } from '../components/DeployPortalLogo'
import { useAuth } from '../context/AuthContext'

export function SignIn() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, isAuthenticated } = useAuth()

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
    <div className="min-h-screen bg-[#EDF0EE] flex flex-col items-center justify-center p-4 selection:bg-[#005459]/15 selection:text-[#005459]">
      {/* Centered Sign In Card */}
      <div className="w-full max-w-[440px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-8 shadow-[0_4px_20px_rgba(16,29,38,0.06)]">
        {/* Brand Logo */}
        <DeployPortalLogo size="lg" />

        {/* Heading */}
        <div className="mt-5">
          <h1 className="text-[24px] font-bold text-[#101d26] tracking-tight">
            Sign in
          </h1>
          <p className="text-[13px] text-[#565f6b] mt-1 font-normal">
            Welcome back to your developer console
          </p>
        </div>

        {/* Error Alert Banner matching reference image */}
        {errorMessage && (
          <div className="mt-5 p-3 rounded-[6px] bg-[#FAEBE9] border border-[#F1B5AC] text-[#BA1A1A] text-[13px] space-y-1">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#BA1A1A]" />
              <span>{errorMessage}</span>
            </div>
            {errorRequestId && (
              <div className="text-[10px] font-mono text-[#BA1A1A]/80 pl-6.5">
                Request ID: {errorRequestId}
              </div>
            )}
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Email Address */}
          <div>
            <label className="block text-[13px] font-medium text-[#101d26] mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (errorMessage) setErrorMessage(null)
              }}
              className={`w-full h-[36px] px-3 bg-[#FFFFFF] rounded-[6px] font-mono text-[13px] text-[#101d26] outline-none transition-colors ${
                hasError
                  ? 'border border-[#BA1A1A] focus:ring-2 focus:ring-[#BA1A1A]/15'
                  : 'border border-[#CDD4D0] focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15'
              }`}
              placeholder="alex.mercer@company.internal"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[13px] font-medium text-[#101d26]">
                Password
              </label>
              <button
                type="button"
                className="text-[12px] font-medium text-[#005459] hover:underline cursor-pointer"
                onClick={() => alert('Password reset link sent to your internal email.')}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                className={`w-full h-[36px] pl-3 pr-10 bg-[#FFFFFF] rounded-[6px] text-[13px] text-[#101d26] font-mono tracking-widest outline-none transition-colors ${
                  hasError
                    ? 'border border-[#BA1A1A] focus:ring-2 focus:ring-[#BA1A1A]/15'
                    : 'border border-[#CDD4D0] focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15'
                }`}
                placeholder="••••••••••••••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#565f6b] hover:text-[#101d26] cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember this session + SSO badge */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberSession}
                onChange={(e) => setRememberSession(e.target.checked)}
                className="w-4 h-4 rounded-[4px] accent-[#005459] cursor-pointer"
              />
              <span className="text-[13px] text-[#101d26]">
                Remember this session
              </span>
            </label>

            <span className="px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] font-mono text-[11px] font-medium text-[#565f6b]">
              SSO Enabled
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[38px] mt-2 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white font-medium text-[13px] flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign in</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider & Managed Access Footer */}
        <div className="border-t border-[#E2E7E4] pt-4 mt-6 flex items-center justify-center gap-1.5 text-[12px] text-[#565f6b]">
          <Lock className="w-3.5 h-3.5 text-[#565f6b]" />
          <span>Access is managed by your organization's admin.</span>
        </div>
      </div>

      {/* External Footer */}
      <div className="mt-6 text-center font-mono text-[12px] text-[#565f6b]">
        Deploy Portal v2.4 • Internal Infrastructure
      </div>
    </div>
  )
}
