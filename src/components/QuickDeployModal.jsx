import { useState, useEffect } from 'react'
import { X, Play, GitBranch, Server, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../services/api'

export function QuickDeployModal({
  isOpen,
  onClose,
  projects: propProjects,
  servers: propServers,
  onDeploySuccess
}) {
  const [projects, setProjects] = useState(propProjects || [])
  const [servers, setServers] = useState(propServers || [])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const [selectedProjectId, setSelectedProjectId] = useState('')
  const [branch, setBranch] = useState('main')
  const [commitMsg, setCommitMsg] = useState('Manual release deployment')

  useEffect(() => {
    if (!isOpen) {
      setError(null)
      return
    }

    if (!propProjects || propProjects.length === 0) {
      setLoading(true)
      Promise.allSettled([api('/projects'), api('/servers')])
        .then(([pRes, sRes]) => {
          const pList = pRes.status === 'fulfilled' ? (Array.isArray(pRes.value) ? pRes.value : pRes.value?.items || []) : []
          const sList = sRes.status === 'fulfilled' ? (Array.isArray(sRes.value) ? sRes.value : sRes.value?.items || []) : []
          setProjects(pList)
          setServers(sList)
          if (pList.length > 0) setSelectedProjectId(pList[0].id)
        })
        .finally(() => setLoading(false))
    } else {
      setProjects(propProjects)
      if (propProjects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(propProjects[0].id)
      }
      if (propServers) setServers(propServers)
    }
  }, [isOpen, propProjects, propServers])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedProjectId) {
      setError('Please select a project to deploy.')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const res = await api(`/projects/${selectedProjectId}/deploy`, {
        method: 'POST',
        body: {
          branch: branch.trim() || 'main'
        }
      })
      if (onDeploySuccess) {
        onDeploySuccess(res)
      }
      onClose()
    } catch (err) {
      console.error('Failed to trigger quick deploy:', err)
      setError(err?.message || 'Failed to dispatch deployment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/50 backdrop-blur-xs select-none">
      <div className="w-full max-w-[480px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="h-[46px] px-4 border-b border-[#E2E7E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-[4px] bg-[#005459] text-white flex items-center justify-center">
              <Play className="w-3.5 h-3.5 fill-current" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#101d26] tracking-tight">
              Quick Deploy Service
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

        {/* Error banner */}
        {error && (
          <div className="mx-5 mt-4 p-3 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-center gap-2 text-[12px] text-[#C2412D]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[12px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
              TARGET PROJECT
            </label>
            {loading ? (
              <div className="h-[34px] flex items-center gap-2 text-[12px] text-[#565f6b]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#005459]" />
                <span>Loading available projects...</span>
              </div>
            ) : projects.length === 0 ? (
              <div className="text-[12px] text-[#565f6b] p-2 bg-[#F4F6F5] rounded border border-[#CDD4D0]">
                No projects registered in workspace. Please create a project first.
              </div>
            ) : (
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full h-[34px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15 cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.defaultBranch || 'main'})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
                FLEET TARGETS
              </label>
              <div className="relative flex items-center">
                <Server className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
                <div className="w-full h-[34px] pl-8 pr-3 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] text-[12px] text-[#565f6b] flex items-center font-mono truncate">
                  {servers.length > 0 ? `${servers.length} target fleet` : 'All project targets'}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
                GIT BRANCH
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
          </div>

          <div>
            <label className="block text-[12px] font-mono uppercase font-semibold text-[#565f6b] mb-1.5">
              DEPLOYMENT MESSAGE
            </label>
            <input
              type="text"
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              placeholder="e.g. fix: optimize token validation"
              className="w-full h-[34px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
            />
          </div>

          <div className="pt-3 border-t border-[#E2E7E4] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="h-[32px] px-3 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F4F6F5] border border-[#CDD4D0] text-[13px] text-[#101d26] font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || projects.length === 0}
              className="h-[32px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Queueing...</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-current" />
                  <span>Deploy Now</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

