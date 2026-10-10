import { FolderGit2 } from 'lucide-react'

export function PlaceholderPage({ title, subtitle, icon: Icon = FolderGit2 }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-wider text-[#565f6b] font-semibold">
          CONTROL PLANE <span className="text-[#8F9CA7]">/</span> {title.toUpperCase()}
        </div>
        <h1 className="text-[30px] font-bold text-[#101d26] tracking-tight leading-tight mt-1">
          {title}
        </h1>
        {subtitle && <p className="text-[13px] text-[#565f6b] mt-1">{subtitle}</p>}
      </div>

      <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-12 text-center flex flex-col items-center justify-center">
        <div className="w-12 h-12 rounded-[8px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center mb-4">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-[16px] font-bold text-[#101d26]">{title} Console</h3>
        <p className="text-[13px] text-[#565f6b] max-w-md mt-1">
          All changes and audit records in this section are synchronized with your cluster origin and SSO policy.
        </p>
      </div>
    </div>
  )
}
