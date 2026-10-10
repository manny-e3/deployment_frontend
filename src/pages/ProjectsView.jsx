import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  Plus,
  GitBranch,
  Server,
  FolderGit2,
  MoreHorizontal,
  Play,
  RotateCcw,
  Globe,
  Zap,
  Lock,
  LayoutGrid,
  Bell,
  HelpCircle,
  Code2,
  RefreshCw,
  Loader2,
  Edit3,
  Trash2,
  ExternalLink,
  Atom
} from 'lucide-react'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { can } from '../utils/permissions'
import { EditProjectModal } from '../components/EditProjectModal'
import { DeleteProjectModal } from '../components/DeleteProjectModal'

export function ProjectsView({ onNewProject }) {
  const navigate = useNavigate()
  const { role } = useAuth()
  const canManage = can(role, 'projects:manage')
  const canDeploy = can(role, 'deploy:create')

  const [searchQuery, setSearchQuery] = useState('')
  const [filterTab, setFilterTab] = useState('All')
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingProject, setEditingProject] = useState(null)
  const [deletingProject, setDeletingProject] = useState(null)
  const [activeMenuId, setActiveMenuId] = useState(null)

  useEffect(() => {
    const handleDocClick = () => setActiveMenuId(null)
    window.addEventListener('click', handleDocClick)
    return () => window.removeEventListener('click', handleDocClick)
  }, [])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const data = await api('/projects')
      const items = Array.isArray(data) ? data : data?.items || []
      const normalized = items.filter(Boolean).map((p) => ({
        id: p?.id,
        name: p?.name || 'Untitled Project',
        repo: p?.repo || p?.repoUrl || 'No repo configured',
        branch: p?.branch || p?.defaultBranch || 'main',
        serversCount: p?.serversCount ?? p?.targets?.length ?? 0,
        status: p?.status || (p?.lastDeployment?.status === 'SUCCESS' ? 'success' : p?.lastDeployment?.status === 'FAILED' ? 'failed' : 'unbuilt'),
        errorCode: p?.errorCode || null,
        badge: p?.badge || null,
        lastCommit: p?.lastCommit || (p?.lastDeployment?.commitSha ? p.lastDeployment.commitSha.slice(0, 7) : null),
        lastDeployTime: p?.lastDeployTime || (p?.lastDeployment?.finishedAt ? 'Recently' : 'Never deployed'),
        author: p?.author || p?.lastDeployment?.user?.name || 'System',
        iconType: p?.iconType || (p?.name && (p.name.includes('react') || p.name.includes('front') || p.name.includes('ui')) ? 'react' : p?.name && p.name.includes('api') ? 'api' : p?.name && (p.name.includes('store') || p.name.includes('web')) ? 'web' : p?.name && p.name.includes('work') ? 'worker' : 'api'),
      }))
      setProjects(normalized)
    } catch (err) {
      console.error('Failed to fetch projects:', err)
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const renderProjectIcon = (type) => {
    switch (type) {
      case 'react':
        return (
          <div className="w-8 h-8 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
            <Atom className="w-4 h-4 stroke-[2.5]" />
          </div>
        )
      case 'api':
        return (
          <div className="w-8 h-8 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
            <Code2 className="w-4 h-4 stroke-[2.5]" />
          </div>
        )
      case 'web':
        return (
          <div className="w-8 h-8 rounded-[6px] bg-[#EAF5EE] text-[#2E8B57] flex items-center justify-center">
            <Globe className="w-4 h-4 stroke-[2.5]" />
          </div>
        )
      case 'worker':
        return (
          <div className="w-8 h-8 rounded-[6px] bg-[#FAEBE9] text-[#C2412D] flex items-center justify-center">
            <Zap className="w-4 h-4 stroke-[2.5]" />
          </div>
        )
      case 'auth':
        return (
          <div className="w-8 h-8 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
            <Lock className="w-4 h-4 stroke-[2.5]" />
          </div>
        )
      case 'analytics':
        return (
          <div className="w-8 h-8 rounded-[6px] bg-[#FAF3E7] text-[#B87E0C] flex items-center justify-center">
            <LayoutGrid className="w-4 h-4 stroke-[2.5]" />
          </div>
        )
      case 'notification':
      default:
        return (
          <div className="w-8 h-8 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
            <Bell className="w-4 h-4 stroke-[2.5]" />
          </div>
        )
    }
  }

  const filteredProjects = projects.filter((p) => {
    if (!p) return false
    // Filter tab
    if (filterTab === 'Active' && p.status !== 'success') return false
    if (filterTab === 'Failed' && p.status !== 'failed') return false
    if (filterTab === 'Unconfigured' && p.status !== 'unbuilt') return false

    // Search query
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.repo && p.repo.toLowerCase().includes(q)) ||
      (p.branch && p.branch.toLowerCase().includes(q))
    )
  })

  return (
    <div className="space-y-6">
      {/* Workspace Header & Action Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-wider text-[#565f6b] font-semibold">
            WORKSPACE <span className="text-[#8F9CA7]">/</span> REPOSITORIES &amp; SERVICES
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <h1 className="text-[30px] font-bold text-[#101d26] tracking-tight leading-tight">
              Projects
            </h1>
            <span className="px-2 py-0.5 rounded-[4px] bg-[#E2F0FD] border border-[#BEDAF2] font-mono text-[11px] font-medium text-[#005459]">
              {projects.length} total
            </span>
          </div>
        </div>

        {/* Right Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search projects input with ⌘K */}
          <div className="relative flex items-center w-[260px] sm:w-[290px]">
            <Search className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by name, repo, or branch.."
              className="w-full h-[36px] pl-8 pr-11 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] placeholder-[#565f6b] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15 shadow-2xs"
            />
            <span className="absolute right-2 px-1.5 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] text-[10px] font-mono text-[#565f6b] pointer-events-none">
              ⌘K
            </span>
          </div>




          {/* + New project Button */}
          {canManage && (
            <button
              type="button"
              onClick={() => navigate('/projects/new')}
              className="h-[36px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>New project</span>
            </button>
          )}
        </div>
      </div>

      {/* Content Area: Loading / Grid / Empty State */}
      {loading ? (
        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-12 text-center flex flex-col items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#005459]" />
          <span className="text-[13px] text-[#565f6b] font-mono mt-2">Loading projects...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-10 sm:p-12 shadow-xs flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-[8px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center mb-4">
            <GitBranch className="w-6 h-6 stroke-[2]" />
          </div>

          <h3 className="text-[17px] font-bold text-[#101d26] tracking-tight">
            {searchQuery || filterTab !== 'All' ? 'No projects match your filter criteria.' : 'No projects yet. Connect a Git repository to start deploying.'}
          </h3>
          <p className="text-[13px] text-[#565f6b] max-w-lg mt-1.5 leading-relaxed">
            {searchQuery || filterTab !== 'All'
              ? 'Try adjusting your search terms or clearing your status filters.'
              : 'Supports GitHub, GitLab, and self-hosted Git repositories over SSH/HTTPS. Setup takes less than two minutes.'}
          </p>

          <div className="flex items-center gap-3 mt-5">
            {canManage && (
              <button
                type="button"
                onClick={() => navigate('/projects/new')}
                className="h-[34px] px-3.5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[13px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New project</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchProjects}
              className="h-[34px] px-3.5 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F4F6F5] border border-[#CDD4D0] text-[#101d26] text-[13px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <RefreshCw className="w-4 h-4 text-[#565f6b]" />
              <span>Refresh list</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {filteredProjects.map((p) => (
            <div
              key={p.id}
              onClick={() => navigate(`/projects/${p.id || p.name}`)}
              className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs hover:border-[#005459] transition-all cursor-pointer flex flex-col justify-between group"
            >
              {/* Top Row: Icon, Title, More button */}
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {renderProjectIcon(p.iconType)}
                    <h3 className="text-[15px] font-semibold text-[#101d26] tracking-tight group-hover:text-[#005459] transition-colors">
                      {p.name}
                    </h3>
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setActiveMenuId(activeMenuId === p.id ? null : p.id)
                      }}
                      className="w-7 h-7 rounded-[4px] text-[#8F9CA7] hover:text-[#101d26] hover:bg-[#F4F6F5] flex items-center justify-center transition-colors cursor-pointer"
                      title="Project options"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>

                    {activeMenuId === p.id && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-8 z-30 w-44 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] shadow-lg py-1 text-[12px] animate-in fade-in duration-100"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveMenuId(null)
                            navigate(`/projects/${p.id || p.name}`)
                          }}
                          className="w-full px-3 py-1.5 text-left text-[#101d26] hover:bg-[#F4F6F5] flex items-center gap-2 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-[#565f6b]" />
                          <span>View Details</span>
                        </button>

                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null)
                                setEditingProject(p)
                              }}
                              className="w-full px-3 py-1.5 text-left text-[#101d26] hover:bg-[#F4F6F5] flex items-center gap-2 cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#005459]" />
                              <span>Edit Project</span>
                            </button>

                            <div className="my-1 border-t border-[#E2E7E4]" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null)
                                setDeletingProject(p)
                              }}
                              className="w-full px-3 py-1.5 text-left text-[#C2412D] hover:bg-[#FAEBE9] flex items-center gap-2 cursor-pointer font-medium"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-[#C2412D]" />
                              <span>Delete Project</span>
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Repo Link */}
                <div className="mt-3 flex items-center gap-1.5 text-[12px] font-mono text-[#565f6b]">
                  <FolderGit2 className="w-3.5 h-3.5 text-[#8F9CA7] shrink-0" />
                  <span className="truncate hover:underline">{p.repo}</span>
                </div>

                {/* Badges Row */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] font-mono text-[11px] text-[#101d26]">
                    <GitBranch className="w-3 h-3 text-[#565f6b]" />
                    <span>{p.branch}</span>
                  </span>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] font-mono text-[11px] text-[#565f6b]">
                    <Server className="w-3 h-3 text-[#8F9CA7]" />
                    <span>{p.serversCount} servers</span>
                  </span>

                  {p.errorCode && (
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#FAEBE9] border border-[#F1B5AC] font-mono text-[11px] font-semibold text-[#C2412D]">
                      {p.errorCode}
                    </span>
                  )}

                  {p.badge && (
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#F4F6F5] border border-[#CDD4D0] font-mono text-[11px] text-[#565f6b]">
                      {p.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Row: Status, Author, and Action Button */}
              <div className="mt-5 pt-3.5 border-t border-[#E2E7E4] flex items-center justify-between">
                {/* Left Telemetry info */}
                <div className="text-[12px] leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${p.status === 'failed'
                        ? 'bg-[#C2412D]'
                        : p.status === 'unbuilt'
                          ? 'bg-[#8F9CA7]'
                          : 'bg-[#2E8B57]'
                        }`}
                    />
                    {p.lastCommit && (
                      <span
                        className={`font-mono font-bold ${p.status === 'failed' ? 'text-[#C2412D]' : 'text-[#101d26]'
                          }`}
                      >
                        {p.lastCommit}
                      </span>
                    )}
                    <span className="text-[#565f6b]">{p.lastCommit ? `· ${p.lastDeployTime}` : p.lastDeployTime}</span>
                  </div>
                  <div className="text-[#565f6b] text-[11px] mt-0.5">
                    {p.status === 'unbuilt' || p.status === 'failed'
                      ? p.author
                      : `by ${p.author}`}
                  </div>
                </div>

                {/* Right Action Button */}
                {canDeploy && (
                  p.status === 'failed' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/projects/${p.id || p.name}`)
                      }}
                      className="h-[28px] px-3 rounded-[6px] bg-[#FAEBE9] hover:bg-[#F8DFDC] border border-[#F1B5AC] text-[12px] font-medium text-[#C2412D] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate(`/projects/${p.id || p.name}`)
                      }}
                      className="h-[28px] px-3 rounded-[6px] bg-[#FFFFFF] hover:bg-[#F4F6F5] border border-[#CDD4D0] text-[12px] font-medium text-[#101d26] flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-current text-[#565f6b]" />
                      <span>Deploy</span>
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <EditProjectModal
          isOpen={Boolean(editingProject)}
          onClose={() => setEditingProject(null)}
          project={editingProject}
          onProjectUpdated={(updated) => {
            setProjects((prev) =>
              prev.map((item) =>
                item.id === updated.id
                  ? {
                    ...item,
                    name: updated.name,
                    repo: updated.repoUrl || updated.repo,
                    branch: updated.defaultBranch || updated.branch,
                  }
                  : item
              )
            )
            setEditingProject(null)
          }}
        />
      )}

      {/* Delete Project Modal */}
      {deletingProject && (
        <DeleteProjectModal
          isOpen={Boolean(deletingProject)}
          onClose={() => setDeletingProject(null)}
          project={deletingProject}
          onProjectDeleted={(id) => {
            setProjects((prev) => prev.filter((item) => item.id !== id))
            setDeletingProject(null)
          }}
        />
      )}
    </div>
  )
}
