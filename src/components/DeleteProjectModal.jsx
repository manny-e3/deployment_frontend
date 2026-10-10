import { useState, useEffect } from 'react'
import { X, AlertTriangle, Trash2, Loader2, AlertCircle } from 'lucide-react'
import { api } from '../services/api'

export function DeleteProjectModal({ isOpen, onClose, project, onProjectDeleted }) {
  const [confirmName, setConfirmName] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      setConfirmName('')
      setError(null)
      setIsDeleting(false)
    }
  }, [isOpen])

  if (!isOpen || !project) return null

  const isConfirmed = confirmName.trim() === project.name?.trim()

  const handleDelete = async (e) => {
    e.preventDefault()
    if (!isConfirmed) return

    setIsDeleting(true)
    setError(null)

    try {
      await api(`/projects/${project.id}`, {
        method: 'DELETE',
      })

      if (onProjectDeleted) {
        onProjectDeleted(project.id)
      }
      onClose()
    } catch (err) {
      console.error('Failed to delete project:', err)
      setError(err.message || 'Failed to delete project. Make sure no deployment is currently running.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101d26]/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div className="w-full max-w-[480px] bg-[#FFFFFF] border border-[#F1B5AC] rounded-[8px] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAEBE9] border-b border-[#F1B5AC] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#C2412D] text-white flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#C2412D] tracking-tight">
                Delete Project
              </h3>
              <p className="text-[11px] text-[#8D2B1B]">
                Permanent and irreversible action
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-[4px] text-[#8D2B1B] hover:text-[#C2412D] hover:bg-[#F8DFDC] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleDelete} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-center gap-2 text-[#C2412D] text-[12px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="text-[13px] text-[#565f6b] leading-relaxed">
            Are you sure you want to delete <strong className="text-[#101d26] font-mono">{project.name}</strong>?
            This will permanently remove the project, all linked target destination servers, encrypted environment variables, and deployment log history.
          </div>

          <div className="p-3 bg-[#F4F6F5] rounded-[6px] border border-[#CDD4D0] space-y-2">
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b]">
              Please type <span className="font-bold text-[#101d26] select-all">{project.name}</span> to confirm:
            </label>
            <input
              type="text"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              placeholder={project.name}
              className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] font-mono text-[#101d26] outline-none focus:border-[#C2412D] focus:ring-2 focus:ring-[#C2412D]/15"
              autoFocus
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="h-[34px] px-3.5 rounded-[6px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[12px] font-medium text-[#101d26] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isConfirmed || isDeleting}
              className="h-[34px] px-4 rounded-[6px] bg-[#C2412D] hover:bg-[#A93422] active:bg-[#8D2B1B] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Permanently Delete Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
