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
} from 'lucide-react'
import { DeployPortalLogo } from './DeployPortalLogo'
import { useAuth } from '../context/AuthContext'

export function DashboardSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const navItems = [
    { label: 'Dashboard', icon: LayoutGrid, path: '/dashboard' },
    { label: 'Projects', icon: FolderGit2, path: '/projects' },
    { label: 'Servers', icon: Server, path: '/servers' },
    { label: 'Deployments', icon: Rocket, path: '/deployments' },
    { label: 'Users', icon: Users, path: '/users' },
    { label: 'Audit Log', icon: Clock, path: '/audit-log' },
    { label: 'Settings', icon: Settings, path: '/settings' },
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
            <DeployPortalLogo size="md" />
            <span className="font-semibold text-[15px] text-white tracking-tight">
              Deploy Portal
            </span>
          </div>

          {/* Control Plane Tag */}
          <div className="text-[9px] font-mono leading-tight text-right text-slate-300 font-semibold uppercase tracking-wider pl-1.5 border-l border-slate-700/60">
            <div>Deploy</div>
            <div>Portal</div>
            <div className="text-[8px] text-[#85d3da]">CONTROL</div>
            <div className="text-[8px] text-[#85d3da]">PLANE</div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="p-3 space-y-1 mt-1">
          {navItems.map((item) => {
            const isActive = isItemActive(item.path)
            const Icon = item.icon

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`w-full h-[40px] px-3 rounded-[6px] flex items-center gap-3 text-[14px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#2D3A4B] text-white shadow-xs font-semibold'
                    : 'text-[#8F9CA7] hover:bg-[#253241] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-[#8F9CA7]'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Profile Section */}
      <div className="p-3 border-t border-[#253241]">
        <div className="flex items-center justify-between p-2 rounded-[6px] hover:bg-[#253241]/70 transition-colors">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={user?.avatar || '/avatar.jpg'}
              alt={user?.name || 'Alex Mercer'}
              className="w-8 h-8 rounded-full object-cover border border-slate-600 shrink-0"
            />
            <div className="truncate">
              <div className="text-[13px] font-semibold text-white leading-tight truncate">
                {user?.name || 'Alex Mercer'}
              </div>
              <div className="text-[11px] text-[#8F9CA7] leading-tight truncate mt-0.5">
                {user?.role || 'Staff Platform Eng'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            title="Sign out of Deploy Portal"
            className="p-1.5 text-[#8F9CA7] hover:text-white rounded-[4px] hover:bg-[#1B2430] transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
