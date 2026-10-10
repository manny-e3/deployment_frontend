import { useState, useEffect } from 'react'
import { X, FolderGit2, GitBranch, Edit3, AlertCircle, Loader2, Check, Globe } from 'lucide-react'
import { api } from '../services/api'

export function EditProjectModal({ isOpen, onClose, project, onProjectUpdated }) {
  const [name, setName] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [defaultBranch, setDefaultBranch] = useState('main')
  const [url, setUrl] = useState('')
  const [autoDeploy, setAutoDeploy] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (project && isOpen) {
      setName(project.name || '')
      setRepoUrl(project.repoUrl || project.repo || '')
      setDefaultBranch(project.defaultBranch || project.branch || 'main')
      const storedUrl = localStorage.getItem(`project_url_${project.id}`) || project.url || project.projectUrl || ''
      setUrl(storedUrl)
      setAutoDeploy(project.autoDeploy ?? false)
      setError(null)
      setSuccess(false)
    }
  }, [project, isOpen])

  if (!isOpen || !project) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!name.trim()) {
      setError('Project name is required.')
      return
    }

    if (!repoUrl.trim()) {
      setError('Git repository URL is required.')
      return
    }

    setIsSubmitting(true)

    try {
      if (url.trim()) {
        localStorage.setItem(`project_url_${project.id}`, url.trim())
      } else {
        localStorage.removeItem(`project_url_${project.id}`)
      }

      // Backend project schema strictly expects name, repoUrl, defaultBranch, autoDeploy
      const payload = {
        name: name.trim(),
        repoUrl: repoUrl.trim(),
        defaultBranch: defaultBranch.trim() || 'main',
        autoDeploy: Boolean(autoDeploy),
      }

      const updated = await api(`/projects/${project.id}`, {
        method: 'PATCH',
        body: payload,
      })

      setSuccess(true)
      if (onProjectUpdated) {
        onProjectUpdated({ ...(updated || project), ...payload, url: url.trim() || null })
      }
      setTimeout(() => {
        onClose()
      }, 500)
    } catch (err) {
      console.error('Failed to update project:', err)
      setError(err.message || 'Failed to update project. Please check your inputs.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/50 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="w-full max-w-[520px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="h-[48px] px-6 border-b border-[#E2E7E4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
              <Edit3 className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#101d26] tracking-tight">
                Edit Project
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[4px] text-[#565f6b] hover:text-[#101d26] hover:bg-[#F4F6F5] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-center gap-2 text-[#C2412D] text-[12px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 bg-[#EAF5EE] border border-[#B8E0C5] rounded-[6px] flex items-center gap-2 text-[#2E8B57] text-[12px]">
              <Check className="w-4 h-4 shrink-0" />
              <span>Project updated successfully.</span>
            </div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              PROJECT NAME <span className="text-[#C2412D]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. checkout-service"
              className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
              required
            />
          </div>

          {/* Repo URL */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              GIT REPOSITORY URL <span className="text-[#C2412D]">*</span>
            </label>
            <div className="relative flex items-center">
              <FolderGit2 className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/org/repo.git or git@github.com:..."
                className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                required
              />
            </div>
          </div>

          {/* Default Branch */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              DEFAULT DEPLOYMENT BRANCH
            </label>
            <div className="relative flex items-center">
              <GitBranch className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={defaultBranch}
                onChange={(e) => setDefaultBranch(e.target.value)}
                placeholder="main"
                className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
              />
            </div>
          </div>

          {/* Project URL / Domain */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              PROJECT PUBLIC URL / DOMAIN (OPTIONAL)
            </label>
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://myproject.com or http://localhost/kensite"
                className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
              />
            </div>
            <p className="text-[11px] text-[#565f6b] mt-1">
              Default address verified by post-deploy health probes and linked in the project header.
            </p>
          </div>

          {/* Auto-Deploy Toggle */}
          <div className="pt-2 border-t border-[#E2E7E4] flex items-center justify-between">
            <div>
              <div className="text-[13px] font-semibold text-[#101d26]">Auto-Deploy on Push</div>
              <div className="text-[11px] text-[#565f6b]">
                Trigger automated releases when webhooks receive push events on the default branch.
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAutoDeploy(!autoDeploy)}
              className={`w-9 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                autoDeploy ? 'bg-[#005459]' : 'bg-[#CDD4D0]'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-xs transform transition-transform duration-200 ${
                  autoDeploy ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#E2E7E4] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="h-[34px] px-3.5 rounded-[6px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[12px] font-medium text-[#101d26] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-[34px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
