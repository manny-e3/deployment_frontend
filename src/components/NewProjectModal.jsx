import { useState } from 'react'
import { X, GitBranch, FolderGit2, Plus, Server } from 'lucide-react'

export function NewProjectModal({ isOpen, onClose, onCreateProject }) {
  const [name, setName] = useState('')
  const [repo, setRepo] = useState('')
  const [branch, setBranch] = useState('main')
  const [serversCount, setServersCount] = useState(1)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onCreateProject({
      name,
      repo,
      branch: branch || 'main',
      serversCount: Number(serversCount) || 1,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-[500px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-[46px] px-5 border-b border-[#E2E7E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[4px] bg-[#005459] text-white flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#101d26] tracking-tight">
              Create New Project
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-[4px] text-[#565f6b] hover:text-[#101d26] hover:bg-[#F4F6F5] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[12px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
              PROJECT NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. checkout-service"
              className="w-full h-[34px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
              required
            />
          </div>

          <div>
            <label className="block text-[12px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
              GIT REPOSITORY URL
            </label>
            <div className="relative flex items-center">
              <FolderGit2 className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={repo}
                onChange={(e) => setRepo(e.target.value)}
                placeholder="github.com/acme/checkout-service"
                className="w-full h-[34px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
                DEFAULT BRANCH
              </label>
              <div className="relative flex items-center">
                <GitBranch className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  placeholder="main"
                  className="w-full h-[34px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
                ALLOCATED SERVERS
              </label>
              <div className="relative flex items-center">
                <Server className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={serversCount}
                  onChange={(e) => setServersCount(e.target.value)}
                  className="w-full h-[34px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#E2E7E4] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-[32px] px-3.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F4F6F5] border border-[#CDD4D0] text-[13px] text-[#101d26] font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-[32px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
