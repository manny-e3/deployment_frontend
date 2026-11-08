import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  LayoutGrid,
  FolderGit2,
  Server,
  Rocket,
  Users,
  Clock,
  Settings,
  Plus,
  ArrowRight,
  User,
  X
} from 'lucide-react'
import { api } from '../services/api'

const STATIC_NAVIGATION = [
  { id: 'nav-dash', title: 'Dashboard', subtitle: 'Control plane metrics & telemetry', path: '/dashboard', icon: LayoutGrid, category: 'Navigation' },
  { id: 'nav-proj', title: 'Projects Catalog', subtitle: 'View all services and pipelines', path: '/projects', icon: FolderGit2, category: 'Navigation' },
  { id: 'nav-serv', title: 'Servers & Clusters', subtitle: 'Manage nodes and target fleet', path: '/servers', icon: Server, category: 'Navigation' },
  { id: 'nav-deps', title: 'Deployments', subtitle: 'Real-time deployment audit & history', path: '/deployments', icon: Rocket, category: 'Navigation' },
  { id: 'nav-user', title: 'Team & IAM', subtitle: 'Manage organization permissions', path: '/users', icon: Users, category: 'Navigation' },
  { id: 'nav-prof', title: 'Profile & Account', subtitle: 'Manage personal profile, credentials & security', path: '/profile', icon: User, category: 'Navigation' },
  { id: 'nav-audi', title: 'Audit Trail', subtitle: 'Cryptographic system audit logs', path: '/audit-log', icon: Clock, category: 'Navigation' },
  { id: 'nav-sett', title: 'Settings', subtitle: 'Cluster origin and webhooks', path: '/settings', icon: Settings, category: 'Navigation' },
  { id: 'act-new', title: 'Create New Project', subtitle: 'Onboard a repository or service', path: '/projects/new', icon: Plus, category: 'Actions' },
]

export function CommandPaletteModal({ isOpen, onClose }) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [projects, setProjects] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)

  // Fetch projects on mount or open
  useEffect(() => {
    if (!isOpen) return
    let active = true

    const loadProjects = async () => {
      try {
        const data = await api('/projects')
        const items = Array.isArray(data) ? data : data?.items || []
        if (active) {
          setProjects(items.filter(Boolean))
        }
      } catch (err) {
        console.error('CommandPalette: Failed to load projects', err)
      }
    }

    loadProjects()
    return () => {
      active = false
    }
  }, [isOpen])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim()

    // 1. Projects
    const projectItems = projects.map((p) => ({
      id: `proj-${p.id}`,
      title: p.name || 'Untitled Service',
      subtitle: p.repoUrl || p.repo || 'Repository',
      path: `/projects/${p.id}`,
      icon: FolderGit2,
      category: 'Services & Projects',
      status: p.status || 'READY'
    }))

    const all = [...projectItems, ...STATIC_NAVIGATION]

    if (!q) return all

    return all.filter((item) => {
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      )
    })
  }, [query, projects])

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Handle keyboard arrows and Enter
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const item = filteredItems[selectedIndex]
      if (item) {
        navigate(item.path)
        onClose()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4 bg-slate-900/60 backdrop-blur-sm select-none animate-in fade-in duration-100"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[620px] bg-white dark:bg-[#0E131B] rounded-[14px] shadow-2xl border border-slate-200 dark:border-[#1A222D] overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="h-[56px] px-4 border-b border-slate-100 dark:border-[#1A222D] flex items-center gap-3 bg-slate-50/50 dark:bg-[#121822]">
          <Search className="w-5 h-5 text-slate-400 dark:text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, service name, or jump to..."
            className="w-full h-full bg-transparent text-[15px] font-sans text-slate-900 dark:text-zinc-100 placeholder:text-slate-400 dark:placeholder:text-zinc-500 outline-none"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="px-2 py-0.5 rounded bg-white dark:bg-[#151D28] border border-slate-200 dark:border-zinc-700 text-slate-400 dark:text-zinc-400 font-mono text-[11px] font-semibold">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-slate-100/50 dark:divide-zinc-800/40">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-zinc-400 space-y-1">
              <p className="text-[14px] font-medium text-slate-700 dark:text-zinc-200">No results found for "{query}"</p>
              <p className="text-[12px] text-slate-400 dark:text-zinc-500">Try searching for a project name like "storefront" or "dashboard"</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex
              const Icon = item.icon

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(item.path)
                    onClose()
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`px-3 py-2 rounded-[6px] flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 font-medium'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <div
                      className={`w-7 h-7 rounded-[5px] flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>

                    <div className="truncate">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
                          {item.title}
                        </span>
                        {item.status && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 uppercase">
                            {item.status}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-mono">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-700">
                      {item.category}
                    </span>
                    {isSelected && (
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Keyboard Helper Footer */}
        <div className="h-[34px] px-4 bg-zinc-50 dark:bg-[#0A0F17] border-t border-zinc-200 dark:border-[#1A222D] flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
          <div className="flex items-center gap-3">
            <span><strong className="text-zinc-700 dark:text-zinc-300">↑↓</strong> Navigate</span>
            <span><strong className="text-zinc-700 dark:text-zinc-300">↵</strong> Select</span>
            <span><strong className="text-zinc-700 dark:text-zinc-300">ESC</strong> Close</span>
          </div>
          <span className="text-zinc-500 dark:text-zinc-500 font-mono text-[10px]">COMMAND CENTER</span>
        </div>
      </div>
    </div>
  )
}

