import { FolderGit2, Server, Rocket, AlertCircle, ArrowUpRight, CheckCircle2, ShieldCheck, Activity } from 'lucide-react'

export function DashboardMetrics({ metrics = {}, activeFilter = 'ALL', onSelectFilter }) {
  const successRate = metrics.deploysToday > 0 
    ? Math.round(((metrics.deploysToday - (metrics.failed24h || 0)) / metrics.deploysToday) * 100) 
    : 100

  const cards = [
    {
      id: 'projects',
      label: 'Active Projects',
      value: metrics.projects ?? 0,
      subtext: 'Monitored repositories & services',
      badge: 'All in sync',
      badgeColor: 'bg-teal-50 text-teal-700 border-teal-200/80',
      icon: FolderGit2,
      iconColor: 'text-[#005459]',
      iconBg: 'bg-[#005459]/10',
      borderColor: 'hover:border-[#005459]/50',
      filterKey: null,
    },
    {
      id: 'servers',
      label: 'Target Fleet',
      value: metrics.servers ?? 0,
      subtext: 'Nodes healthy & reachable',
      badge: '100% online',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: Server,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-500/10',
      borderColor: 'hover:border-emerald-500/50',
      filterKey: null,
    },
    {
      id: 'deploys',
      label: 'Deploys Today',
      value: metrics.deploysToday ?? 0,
      subtext: `${successRate}% success rate (24h)`,
      badge: `${metrics.deploysToday > 0 ? '+10' : '0'} runs`,
      badgeColor: 'bg-sky-50 text-sky-700 border-sky-200/80',
      icon: Rocket,
      iconColor: 'text-[#0F6E74]',
      iconBg: 'bg-[#0F6E74]/10',
      borderColor: 'hover:border-[#0F6E74]/50',
      filterKey: 'ALL',
      isActive: activeFilter === 'ALL',
    },
    {
      id: 'failed',
      label: 'Failed in 24h',
      value: metrics.failed24h ?? 0,
      subtext: metrics.failed24h > 0 ? 'Requires attention / review' : 'No incidents reported',
      badge: metrics.failed24h > 0 ? 'Action required' : 'Optimal',
      badgeColor: metrics.failed24h > 0 
        ? 'bg-rose-50 text-rose-700 border-rose-200/80 animate-pulse' 
        : 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      icon: AlertCircle,
      iconColor: metrics.failed24h > 0 ? 'text-rose-600' : 'text-emerald-600',
      iconBg: metrics.failed24h > 0 ? 'bg-rose-500/10' : 'bg-emerald-500/10',
      borderColor: metrics.failed24h > 0 ? 'hover:border-rose-400' : 'hover:border-emerald-400',
      isDanger: (metrics.failed24h ?? 0) > 0,
      filterKey: 'FAILED',
      isActive: activeFilter === 'FAILED',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon
        const isClickable = Boolean(card.filterKey && onSelectFilter)

        return (
          <div
            key={card.id}
            onClick={() => isClickable && onSelectFilter(card.filterKey)}
            className={`group bg-[#FFFFFF] border rounded-[10px] p-4.5 transition-all duration-200 relative overflow-hidden flex flex-col justify-between min-h-[118px] shadow-2xs hover:shadow-sm ${
              card.isActive 
                ? 'border-[#005459] ring-2 ring-[#005459]/15' 
                : 'border-[#CDD4D0] ' + card.borderColor
            } ${isClickable ? 'cursor-pointer' : ''}`}
          >
            {/* Top row: Label & Icon */}
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold text-[#565f6b] uppercase tracking-wider font-mono">
                {card.label}
              </span>
              <div
                className={`w-8 h-8 rounded-[8px] ${card.iconBg} flex items-center justify-center transition-transform group-hover:scale-105`}
              >
                <Icon className={`w-4.5 h-4.5 ${card.iconColor} stroke-[1.8]`} />
              </div>
            </div>

            {/* Middle row: Big Metric Number & Status badge */}
            <div className="flex items-baseline justify-between mt-1">
              <div
                className={`text-[32px] font-bold tracking-tight leading-none font-sans ${
                  card.isDanger ? 'text-[#C2412D]' : 'text-[#101d26]'
                }`}
              >
                {card.value}
              </div>
              <span
                className={`px-2 py-0.5 rounded-[5px] text-[10px] font-mono font-semibold uppercase border ${card.badgeColor}`}
              >
                {card.badge}
              </span>
            </div>

            {/* Bottom info caption */}
            <div className="mt-2.5 pt-2 border-t border-[#EAEFEA] flex items-center justify-between text-[11px] text-[#565f6b]">
              <span className="truncate">{card.subtext}</span>
              {card.filterKey && (
                <span className="text-[10px] font-medium text-[#005459] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pl-1">
                  Filter →
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
