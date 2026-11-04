import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  UserPlus,
  Shield,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  Trash2,
  Crown,
  Layers,
  Server,
  Rocket
} from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { useAuth } from '../context/AuthContext'

export function OnboardingView() {
  const navigate = useNavigate()
  const { user, organizationName, updateOrganization, onboardMembers } = useAuth()

  const [step, setStep] = useState(1) // 1: Workspace, 2: Team Members, 3: Completed
  const [orgName, setOrgName] = useState(organizationName || 'Engineering Org')
  const [primaryStack, setPrimaryStack] = useState('react')
  const [environments, setEnvironments] = useState(['Production', 'Staging'])

  // Team members to onboard
  const [members, setMembers] = useState([
    { name: '', email: '', role: 'Deployer', roleTitle: 'Release Engineer' },
    { name: '', email: '', role: 'Viewer', roleTitle: 'DevOps Auditor' }
  ])

  const [onboardedList, setOnboardedList] = useState([])
  const [copiedToken, setCopiedToken] = useState(null)

  const handleAddMember = () => {
    setMembers((prev) => [
      ...prev,
      { name: '', email: '', role: 'Deployer', roleTitle: 'Platform Engineer' }
    ])
  }

  const handleRemoveMember = (idx) => {
    setMembers((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleMemberChange = (idx, field, value) => {
    setMembers((prev) => {
      const copy = [...prev]
      copy[idx] = { ...copy[idx], [field]: value }
      if (field === 'role') {
        if (value === 'Admin') copy[idx].roleTitle = 'Admin Engineer'
        if (value === 'Deployer') copy[idx].roleTitle = 'Release Engineer'
        if (value === 'Viewer') copy[idx].roleTitle = 'DevOps Auditor'
      }
      return copy
    })
  }

  const handleSaveWorkspace = (e) => {
    e.preventDefault()
    if (orgName.trim()) {
      updateOrganization(orgName.trim())
    }
    setStep(2)
  }

  const handleOnboardTeam = (e) => {
    e.preventDefault()
    // Filter only members with email filled
    const validMembers = members.filter((m) => m.email && m.email.trim())

    if (validMembers.length > 0) {
      const generated = onboardMembers(validMembers)
      setOnboardedList(generated)
    }

    setStep(3)
  }

  const handleCopyLink = (link, id) => {
    navigator.clipboard?.writeText(link)
    setCopiedToken(id)
    setTimeout(() => setCopiedToken(null), 2500)
  }

  const handleFinishOnboarding = () => {
    localStorage.setItem('deploy_portal_onboarding_completed', 'true')
    navigate('/dashboard', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#EDF0EE] flex flex-col items-center justify-center p-4 selection:bg-[#005459]/15 selection:text-[#005459]">
      <div className="w-full max-w-[680px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-[0_4px_24px_rgba(16,29,38,0.08)]">
        {/* Top Header */}
        <div className="px-8 pt-7 pb-5 border-b border-[#E2E7E4]">
          <div className="flex items-center justify-between">
            <SlipwayLogo size="md" />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FAF3E7] border border-[#F1D6A4] text-[#B87E0C] text-[11px] font-semibold">
              <Crown className="w-3.5 h-3.5 text-[#B87E0C]" />
              <span>Super Admin Onboarding</span>
            </div>
          </div>

          {/* Stepper Indicator */}
          <div className="mt-6 flex items-center justify-between">
            {[
              { num: 1, title: 'Workspace Setup' },
              { num: 2, title: 'Onboard Team' },
              { num: 3, title: 'Ready to Deploy' }
            ].map((s, idx) => {
              const isCurrent = step === s.num
              const isPast = step > s.num
              return (
                <div key={s.num} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono font-bold shrink-0 transition-colors ${
                      isPast
                        ? 'bg-[#2E8B57] text-white'
                        : isCurrent
                        ? 'bg-[#005459] text-white ring-2 ring-[#005459]/20'
                        : 'bg-[#F4F6F5] text-[#8F9CA7] border border-[#CDD4D0]'
                    }`}
                  >
                    {isPast ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-[12px] font-medium truncate ${
                      isCurrent ? 'text-[#101d26] font-semibold' : 'text-[#8F9CA7]'
                    }`}
                  >
                    {s.title}
                  </span>
                  {idx < 2 && (
                    <div
                      className={`h-[1px] flex-1 mx-2 ${
                        step > idx + 1 ? 'bg-[#2E8B57]' : 'bg-[#E2E7E4]'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* STEP 1: Workspace Setup */}
        {step === 1 && (
          <form onSubmit={handleSaveWorkspace} className="p-8 space-y-6">
            <div>
              <h2 className="text-[20px] font-bold text-[#101d26] tracking-tight">
                Welcome, {user?.name || 'Super Admin'}!
              </h2>
              <p className="text-[13px] text-[#565f6b] mt-1">
                Let's set up your primary workspace before onboarding your team members.
              </p>
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[#101d26] mb-1.5">
                Workspace / Organization Name
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#565f6b] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme Tech Labs"
                  className="w-full h-[38px] pl-9 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15 rounded-[6px] text-[13px] font-medium text-[#101d26] outline-none"
                />
              </div>
            </div>

            {/* Default Framework */}
            <div>
              <label className="block text-[12px] font-medium text-[#101d26] mb-1.5">
                Primary Technology Focus
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { id: 'react', label: 'React / Vite SPA', icon: '⚛️' },
                  { id: 'laravel', label: 'Laravel PHP', icon: '🐘' },
                  { id: 'node', label: 'Node.js Express', icon: '🟢' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPrimaryStack(item.id)}
                    className={`p-3 rounded-[6px] border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      primaryStack === item.id
                        ? 'border-[#005459] bg-[#E2F0FD] text-[#005459] ring-1 ring-[#005459]'
                        : 'border-[#CDD4D0] bg-[#FFFFFF] text-[#565f6b] hover:bg-[#F4F6F5]'
                    }`}
                  >
                    <span className="text-[18px]">{item.icon}</span>
                    <span className="text-[12px] font-semibold mt-1">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E2E7E4] flex items-center justify-end">
              <button
                type="submit"
                className="h-[38px] px-5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Continue to Onboard Team</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Onboard Team Members */}
        {step === 2 && (
          <form onSubmit={handleOnboardTeam} className="p-8 space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[20px] font-bold text-[#101d26] tracking-tight">
                    Onboard Team Members
                  </h2>
                  <p className="text-[13px] text-[#565f6b] mt-1">
                    Invite engineers, deployers, and auditors. You can assign specific permission roles.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="h-[30px] px-2.5 rounded-[4px] bg-[#E2F0FD] hover:bg-[#D0E7FC] text-[#005459] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Colleague</span>
                </button>
              </div>
            </div>

            {/* Member Rows */}
            <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
              {members.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] flex flex-col md:flex-row md:items-center gap-2.5 text-[12px]"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Name (e.g. Jordan Lee)"
                      value={m.name}
                      onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                      className="w-full h-[32px] px-2.5 bg-white border border-[#CDD4D0] focus:border-[#005459] rounded-[4px] text-[#101d26] outline-none"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="email"
                      placeholder="Work Email (e.g. jordan@company.internal)"
                      value={m.email}
                      onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                      className="w-full h-[32px] px-2.5 bg-white border border-[#CDD4D0] focus:border-[#005459] font-mono rounded-[4px] text-[#101d26] outline-none"
                    />
                  </div>
                  <div className="w-[120px]">
                    <select
                      value={m.role}
                      onChange={(e) => handleMemberChange(idx, 'role', e.target.value)}
                      className="w-full h-[32px] px-2 bg-white border border-[#CDD4D0] focus:border-[#005459] rounded-[4px] text-[#101d26] font-medium outline-none cursor-pointer"
                    >
                      <option value="Deployer">Deployer</option>
                      <option value="Admin">Admin</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      className="w-8 h-8 rounded-[4px] text-[#8F9CA7] hover:text-[#BA1A1A] hover:bg-[#FAEBE9] flex items-center justify-center transition-colors cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Role Explanations */}
            <div className="p-3 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] text-[11px] text-[#565f6b] space-y-1">
              <div><strong className="text-[#101d26]">Deployer:</strong> Can trigger pipelines, inspect logs, and execute rollbacks.</div>
              <div><strong className="text-[#101d26]">Admin:</strong> Full control over target servers, keys, and environments.</div>
              <div><strong className="text-[#101d26]">Viewer:</strong> Read-only access to metrics, deployment stream, and audit trail.</div>
            </div>

            <div className="pt-4 border-t border-[#E2E7E4] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-[36px] px-3 rounded-[6px] text-[#565f6b] hover:text-[#101d26] text-[12px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="text-[12px] text-[#565f6b] hover:text-[#101d26] font-medium hover:underline cursor-pointer"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  className="h-[38px] px-5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Onboard Team &amp; Generate Invites</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 3: Completed / Invite Links */}
        {step === 3 && (
          <div className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-[#EAF5EE] text-[#2E8B57] mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-[22px] font-bold text-[#101d26] tracking-tight">
                Workspace &amp; Team Configured!
              </h2>
              <p className="text-[13px] text-[#565f6b] max-w-md mx-auto">
                You are registered as the <strong className="text-[#005459]">Super Admin</strong> of <strong>{orgName}</strong>. You can invite additional colleagues anytime from the Users tab.
              </p>
            </div>

            {/* Generated Invite Links if any */}
            {onboardedList.length > 0 && (
              <div className="space-y-3">
                <div className="text-[12px] font-semibold text-[#101d26]">
                  Team Invitation Links ({onboardedList.length} generated):
                </div>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {onboardedList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] flex items-center justify-between gap-3 text-[12px]"
                    >
                      <div className="truncate">
                        <div className="font-semibold text-[#101d26] flex items-center gap-1.5 truncate">
                          <span>{item.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white border border-[#CDD4D0] text-[#565f6b]">
                            {item.role}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-[#565f6b] truncate">
                          {item.email}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleCopyLink(item.inviteLink, item.id)}
                        className="h-[28px] px-2.5 rounded-[4px] bg-white hover:bg-[#E2F0FD] border border-[#CDD4D0] hover:border-[#005459] text-[#101d26] hover:text-[#005459] text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer shrink-0 shadow-2xs"
                      >
                        {copiedToken === item.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-[#2E8B57]" />
                            <span className="text-[#2E8B57]">Copied Link</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#565f6b]" />
                            <span>Copy Invite</span>
                          </>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-[#E2E7E4] flex items-center justify-center">
              <button
                type="button"
                onClick={handleFinishOnboarding}
                className="w-full h-[40px] rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Rocket className="w-4 h-4" />
                <span>Enter Deploy Portal Dashboard</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
