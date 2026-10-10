import { Search, Bell, HelpCircle } from 'lucide-react'

export function DashboardTopBar({ onSwitchCluster }) {
  return (
    <div className="h-[56px] px-8 bg-[#FFFFFF] border-b border-[#CDD4D0] flex items-center justify-between gap-4 sticky top-0 z-20 select-none">
      {/* Left: Cluster Indicator */}
      <div className="flex items-center gap-3">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-[5px] bg-[#E2F0FD] border border-[#BEDAF2] text-[#005459] text-[11px] font-mono font-semibold tracking-wider uppercase">
        </div>
      </div>

      {/* Right: Search Bar & Utilities */}
      <div className="flex items-center gap-4">
        {/* Search services, commits... */}
        <div className="relative flex items-center w-[240px] sm:w-[280px]">
          <Search className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search services, commits..."
            className="w-full h-[34px] pl-8 pr-3 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] placeholder-[#565f6b] outline-none focus:border-[#005459] focus:bg-[#FFFFFF] focus:ring-2 focus:ring-[#005459]/15 transition-all"
          />
        </div>

        {/* Notification Bell */}
        <button
          type="button"
          className="w-8 h-8 rounded-[6px] text-[#565f6b] hover:text-[#101d26] hover:bg-[#F4F6F5] flex items-center justify-center transition-colors cursor-pointer relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#005459] absolute top-1.5 right-1.5" />
        </button>

        {/* Help Circle */}
        <button
          type="button"
          className="w-8 h-8 rounded-[6px] text-[#565f6b] hover:text-[#101d26] hover:bg-[#F4F6F5] flex items-center justify-center transition-colors cursor-pointer"
          title="Help & Documentation"
        >
          <HelpCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
