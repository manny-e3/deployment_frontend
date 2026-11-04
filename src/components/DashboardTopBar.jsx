import { Search, Bell, HelpCircle, Sun, Moon } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

export function DashboardTopBar({ onOpenCommandPalette }) {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="h-[52px] px-6 bg-white/95 dark:bg-[#090C10]/95 backdrop-blur-xs border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4 sticky top-0 z-20 select-none transition-colors duration-200">
      {/* Left: Cluster Indicator */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
          <span className="font-medium text-zinc-900 dark:text-zinc-100">prod-primary</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-zinc-500 dark:text-zinc-400">us-east-1</span>
          <span className="text-zinc-300 dark:text-zinc-700">•</span>
          <span className="text-zinc-500 dark:text-zinc-400">24ms</span>
        </div>
      </div>

      {/* Right: Search Bar & Utilities */}
      <div className="flex items-center gap-2.5">
        {/* Global Command Palette / Search Input */}
        <div
          onClick={onOpenCommandPalette}
          className="relative flex items-center w-[220px] sm:w-[280px] cursor-pointer group"
          title="Open Command Palette (⌘K or Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 pointer-events-none group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
          <input
            type="text"
            readOnly
            onClick={onOpenCommandPalette}
            placeholder="Search projects, commits..."
            className="w-full h-[32px] pl-8 pr-11 bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800 rounded-[5px] text-[12px] text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none group-hover:border-zinc-300 dark:group-hover:border-zinc-700 group-hover:bg-white dark:group-hover:bg-zinc-900 cursor-pointer transition-all"
          />
          <div className="absolute right-1.5 flex items-center pointer-events-none">
            <kbd className="text-[10px] font-mono font-medium bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.2 rounded shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Theme Switcher (Light / Dark) */}
        <button
          type="button"
          onClick={toggleTheme}
          className="w-7.5 h-7.5 rounded-[5px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          className="w-7.5 h-7.5 rounded-[5px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-emerald-400 absolute top-1.5 right-1.5 ring-2 ring-white dark:ring-zinc-900" />
        </button>

        {/* Documentation / Help */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="w-7.5 h-7.5 rounded-[5px] text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer"
          title="Commands & Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </header>
  )
}
