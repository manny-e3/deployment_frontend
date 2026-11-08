import { useState, useRef, useEffect } from 'react'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  FolderGit2,
  Server,
  Rocket,
  Users,
  Clock,
  Settings,
  LogOut,
  Crown,
  Building2,
  Sun,
  Moon,
  CreditCard,
  ChevronRight,
  ChevronDown,
  Check,
  Plus,
  Briefcase
} from 'lucide-react'
import { SlipwayLogo } from './SlipwayLogo'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export function DashboardSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isSuperAdmin, organizationName, logout } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false)
  const menuRef = useRef(null)

  const [activeWorkspace, setActiveWorkspace] = useState(() => {
    return localStorage.getItem('portalops_active_workspace') || organizationName || user?.organizationName || 'Acme Agency'
  })

  const [clientWorkspaces, setClientWorkspaces] = useState(() => {
    try {
      const stored = localStorage.getItem('portalops_workspaces_list')
      return stored ? JSON.parse(stored) : [
        { id: 'ws-primary', name: organizationName || user?.organizationName || 'Acme Agency', badge: 'AGENCY HUB' },
        { id: 'ws-client-1', name: 'Logistics Pro', badge: 'CLIENT' },
        { id: 'ws-client-2', name: 'Dental Care SaaS', badge: 'CLIENT' },
      ]
    } catch {
      return [
        { id: 'ws-primary', name: 'Acme Agency', badge: 'AGENCY HUB' },
        { id: 'ws-client-1', name: 'Logistics Pro', badge: 'CLIENT' },
      ]
    }
  })

  // Close workspace dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsWorkspaceMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectWorkspace = (ws) => {
    setActiveWorkspace(ws.name)
    localStorage.setItem('portalops_active_workspace', ws.name)
    setIsWorkspaceMenuOpen(false)
  }

  const handleCreateWorkspace = () => {
    const name = window.prompt('Enter new Client / Workspace name:')
    if (name && name.trim()) {
      const newWs = {
        id: `ws-${Date.now()}`,
        name: name.trim(),
        badge: 'CLIENT',
      }
      const updated = [...clientWorkspaces, newWs]
      setClientWorkspaces(updated)
      localStorage.setItem('portalops_workspaces_list', JSON.stringify(updated))
      handleSelectWorkspace(newWs)
    }
  }

  const navItems = [
    { label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { label: 'Workspaces / Teams', icon: Users, path: '/teams' },
    { label: 'Projects', icon: FolderGit2, path: '/projects' },
    { label: 'Servers', icon: Server, path: '/servers' },
    { label: 'Deployments', icon: Rocket, path: '/deployments' },
    { label: 'Users & Team', icon: Users, path: '/users', badge: isSuperAdmin ? 'Onboard' : null },
    { label: 'Audit Log', icon: Clock, path: '/audit-log' },
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Subscription', icon: CreditCard, path: '/profile', badge: 'Trial' },
  ]

  const isItemActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard' || location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-[240px] bg-[#1B2430] text-[#8F9CA7] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none border-r border-[#24313E]">
      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <Link
          to="/dashboard"
          className="h-[64px] px-4 flex items-center justify-between border-b border-[#253241] hover:bg-[#253241]/30 transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <SlipwayLogo size="md" />
            <span className="font-semibold text-[15.5px] text-white tracking-tight">
              PortalOps
            </span>
          </div>

          {/* Control Plane Tag */}
          <div className="text-[9px] font-mono leading-tight text-right text-slate-300 font-semibold uppercase tracking-wider pl-1.5 border-l border-slate-700/60">
            <div>PortalOps</div>
            <div className="text-[8px] text-emerald-400">CONTROL</div>
            <div className="text-[8px] text-zinc-400">PLANE</div>
          </div>
        </Link>

        {/* Client Workspace / Agency Switcher */}
        <div className="px-3 pt-3 pb-1 relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className={`w-full px-3 py-2 rounded-[6px] border flex items-center justify-between transition-colors group cursor-pointer text-left ${
              isWorkspaceMenuOpen || location.pathname.startsWith('/teams')
                ? 'bg-[#253241] border-[#38485B] text-white shadow-xs'
                : 'bg-[#141416] border-[#27272A] hover:border-zinc-600 text-zinc-300 hover:text-white'
            }`}
            title="Switch Client Workspace or Manage Team"
          >
            <div className="flex items-center gap-2 truncate">
              <Briefcase className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="truncate text-left">
                <div className="text-[12px] font-semibold text-white truncate">
                  {activeWorkspace}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono truncate">
                  CLIENT WORKSPACE
                </div>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform ${isWorkspaceMenuOpen ? 'rotate-180 text-white' : ''}`} />
          </button>

          {/* Switcher Dropdown */}
          {isWorkspaceMenuOpen && (
            <div className="absolute left-3 right-3 top-full mt-1.5 z-50 bg-[#161F28] border border-[#2D3D4E] rounded-lg shadow-2xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-2.5 py-1 text-[10px] font-mono uppercase font-bold text-zinc-400">
                CLIENT WORKSPACES
              </div>

              {clientWorkspaces.map((ws) => {
                const isActive = activeWorkspace === ws.name
                return (
                  <button
                    key={ws.id}
                    type="button"
                    onClick={() => handleSelectWorkspace(ws)}
                    className={`w-full px-2.5 py-1.5 rounded-md flex items-center justify-between text-left transition-colors cursor-pointer text-xs ${
                      isActive
                        ? 'bg-[#005459] text-white font-semibold'
                        : 'text-zinc-300 hover:bg-[#202C38] hover:text-white'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    <span className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[9px] font-mono opacity-70 border border-white/20 px-1 rounded">
                        {ws.badge}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-[#00DF8F]" />}
                    </span>
                  </button>
                )
              })}

              <div className="pt-1 border-t border-[#24313E] mt-1 space-y-0.5">
                <button
                  type="button"
                  onClick={handleCreateWorkspace}
                  className="w-full px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs text-emerald-400 hover:bg-[#202C38] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Client Workspace</span>
                </button>

                <Link
                  to="/teams"
                  onClick={() => setIsWorkspaceMenuOpen(false)}
                  className="w-full px-2.5 py-1.5 rounded-md flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white hover:bg-[#202C38] transition-colors"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Configure Workspace &amp; Team</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Super Admin Platform Operations Portal Switcher */}
        {isSuperAdmin && (
          <div className="px-3 pt-2 pb-1">
            <Link
              to="/platform-admin"
              className={`w-full px-3 py-2 rounded-[6px] border flex items-center justify-between transition-all group cursor-pointer ${
                location.pathname.startsWith('/platform-admin')
                  ? 'bg-amber-400/15 border-amber-400/40 text-amber-300 font-semibold shadow-xs'
                  : 'bg-[#141416] border-[#27272A] text-zinc-300 hover:text-white hover:border-zinc-600'
              }`}
              title="Super-see all tenants and manage platform activities"
            >
              <div className="flex items-center gap-2.5 truncate">
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="truncate text-left">
                  <div className="text-[12px] font-semibold text-white tracking-tight flex items-center gap-1">
                    Platform Admin
                  </div>
                  <div className="text-[9.5px] text-zinc-400 font-mono truncate">
                    Multi-tenant supervisor
                  </div>
                </div>
              </div>
              <span className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20 uppercase">
                ROOT
              </span>
            </Link>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = isItemActive(item.path)
            const Icon = item.icon

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`w-full h-[40px] px-3 rounded-[6px] flex items-center justify-between text-[14px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#2D3A4B] text-white shadow-xs font-semibold'
                    : 'text-[#8F9CA7] hover:bg-[#253241] hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8F9CA7]'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-[#E2F0FD] text-[#005459]">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Profile Section */}
      <div className="p-3 border-t border-[#253241]">
        <div
          className={`flex items-center justify-between p-2 rounded-[6px] transition-colors ${
            location.pathname === '/profile'
              ? 'bg-[#253241] ring-1 ring-[#005459]'
              : 'hover:bg-[#253241]/70'
          }`}
        >
          <Link
            to="/profile"
            className="flex items-center gap-2.5 overflow-hidden flex-1 min-w-0 group"
            title="View & Edit Profile"
          >
            <div className="relative shrink-0">
              <img
                src={user?.avatar || '/avatar.jpg'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full object-cover border border-slate-600 shrink-0 group-hover:border-teal-400 transition-colors"
              />
              {isSuperAdmin && (
                <Crown className="w-3 h-3 text-[#E5C07B] absolute -top-1 -right-1 drop-shadow" />
              )}
            </div>
            <div className="truncate">
              <div className="text-[13px] font-semibold text-white leading-tight truncate flex items-center gap-1 group-hover:text-teal-300 transition-colors">
                <span>{user?.name || 'Alex Mercer'}</span>
              </div>
              <div className="text-[11px] text-[#8F9CA7] leading-tight truncate mt-0.5 flex items-center gap-1">
                {isSuperAdmin ? (
                  <span className="text-zinc-300 font-semibold font-mono text-[10px]">SUPER ADMIN</span>
                ) : (
                  <span>{user?.roleTitle || user?.role || 'Team Member'}</span>
                )}
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            <button
              type="button"
              onClick={toggleTheme}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="p-1.5 text-[#8F9CA7] hover:text-white rounded-[4px] hover:bg-[#1B2430] transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out of PortalOps"
              className="p-1.5 text-[#8F9CA7] hover:text-red-400 rounded-[4px] hover:bg-[#1B2430] transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
