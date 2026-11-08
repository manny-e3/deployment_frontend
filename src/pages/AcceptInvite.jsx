import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import {
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Shield,
  Building2,
  CheckCircle2
} from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { useAuth } from '../context/AuthContext'

export function AcceptInvite() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { acceptInvite } = useAuth()

  const token = searchParams.get('token') || ''
  const emailParam = searchParams.get('email') || ''
  const roleParam = searchParams.get('role') || 'Deployer'
  const orgParam = searchParams.get('org') || 'Engineering Organization'
  const inviterParam = searchParams.get('inviter') || 'Super Admin'

  const [name, setName] = useState(emailParam ? emailParam.split('@')[0] : '')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage(null)

    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      setErrorMessage('Password must be at least 8 characters and contain both letters and numbers.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    try {
      await acceptInvite({
        token,
        name,
        password,
        email: emailParam,
        role: roleParam,
        organizationName: orgParam
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrorMessage(err.message || 'Failed to accept invitation. Please verify your link.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#EDF0EE] flex flex-col items-center justify-center p-4 selection:bg-[#005459]/15 selection:text-[#005459]">
      <div className="w-full max-w-[460px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-8 shadow-[0_4px_24px_rgba(16,29,38,0.08)]">
        <SlipwayLogo size="lg" />

        <div className="mt-5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E2F0FD] border border-[#BEDDF7] text-[#005459] text-[11px] font-semibold mb-2">
            <Shield className="w-3.5 h-3.5 text-[#005459]" />
            <span>Team Invitation • Role: {roleParam}</span>
          </div>

          <h1 className="text-[24px] font-bold text-[#101d26] tracking-tight">
            Join {orgParam}
          </h1>
          <p className="text-[13px] text-[#565f6b] mt-1 font-normal">
            You were invited by <strong className="text-[#101d26]">{inviterParam}</strong> to collaborate on developer releases.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 p-3 rounded-[6px] bg-[#FAEBE9] border border-[#F1B5AC] text-[#BA1A1A] text-[13px] flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#BA1A1A]" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#101d26] mb-1">
              Your Email Address
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565f6b]" />
              <input
                type="email"
                disabled
                value={emailParam}
                className="w-full h-[36px] pl-8 pr-3 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] font-mono text-[13px] text-[#565f6b] cursor-not-allowed outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#101d26] mb-1">
              Your Full Name <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565f6b]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Jordan Lee"
                className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] focus:border-[#005459] rounded-[6px] text-[13px] text-[#101d26] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#101d26] mb-1">
              Set Your Password <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565f6b]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="w-full h-[36px] pl-8 pr-10 bg-[#FFFFFF] border border-[#CDD4D0] focus:border-[#005459] rounded-[6px] text-[13px] text-[#101d26] font-mono tracking-widest outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-[#565f6b] hover:text-[#101d26] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#101d26] mb-1">
              Confirm Password <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="relative flex items-center">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565f6b]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••••••••••"
                className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] focus:border-[#005459] rounded-[6px] text-[13px] text-[#101d26] font-mono tracking-widest outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-[38px] mt-2 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white font-medium text-[13px] flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Joining Workspace...</span>
              </>
            ) : (
              <>
                <span>Complete Account &amp; Join</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-[#E2E7E4] text-center text-[12px] text-[#565f6b]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#005459] hover:underline cursor-pointer">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
