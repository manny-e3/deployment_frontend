import { useState } from 'react'
import { UserPlus, X, Mail, Shield, Check } from 'lucide-react'

export function InviteUserModal({ isOpen, onClose, onInviteUser }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('Deployer')
  const [roleTitle, setRoleTitle] = useState('Platform Engineer')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onInviteUser) {
      onInviteUser({
        id: `u-${Date.now()}`,
        name: name || email.split('@')[0],
        initials: (name || email).slice(0, 2).toUpperCase(),
        bg: role === 'Admin' ? 'bg-[#005459]' : 'bg-[#565f6b]',
        roleTitle: roleTitle || 'Team Member',
        email,
        role,
        status: 'Invited',
        lastActive: 'Just now',
        canResend: true,
      })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-[480px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-[#E2E7E4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[4px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-[15px] text-[#101d26]">
              Invite Team Member
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[4px] text-[#565f6b] hover:text-[#101d26] hover:bg-[#F4F6F5] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[12px] font-medium text-[#101d26] mb-1">
              Email Address <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565f6b]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.internal"
                className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] font-mono text-[#101d26] outline-none focus:border-[#005459]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#101d26] mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Lee"
              className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#101d26] mb-1">
              Job Title / Team
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              placeholder="e.g. Cloud Architect"
              className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459]"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-[#101d26] mb-1">
              Permission Role <span className="text-[#BA1A1A]">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Deployer', 'Admin', 'Viewer'].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`h-[34px] rounded-[6px] text-[12px] font-medium border flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    role === r
                      ? 'border-[#005459] bg-[#E2F0FD] text-[#005459] font-bold ring-1 ring-[#005459]'
                      : 'border-[#CDD4D0] bg-[#FFFFFF] text-[#565f6b] hover:bg-[#F4F6F5]'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>{r}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E7E4] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="h-[34px] px-3 rounded-[6px] text-[12px] font-medium text-[#565f6b] hover:text-[#101d26] hover:bg-[#F4F6F5] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[34px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Send Invitation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
