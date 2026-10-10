import {
  Layers,
  Terminal,
  Activity,
  Server,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Radio,
  Boxes,
  FileCode2
} from 'lucide-react'

export function Sidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
}) {
  const navSections = [
    {
      title: 'OPERATIONS',
      items: [
        { id: 'deployments', label: 'Deployments', icon: Layers, count: '3 active' },
        { id: 'pipelines', label: 'Pipelines', icon: Boxes },
        { id: 'services', label: 'Services', icon: Server, count: '18' },
      ],
    },
    {
      title: 'TELEMETRY',
      items: [
        { id: 'logs', label: 'Streaming Logs', icon: Terminal, live: true },
        { id: 'metrics', label: 'Cluster Vitals', icon: Activity },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'environments', label: 'Environments', icon: Radio },
        { id: 'design-system', label: 'Design System Specs', icon: FileCode2 },
      ],
    },
  ]

  return (
    <aside
      className={`fixed top-0 left-0 h-screen z-40 bg-[#17202A] text-[#8F9CA7] flex flex-col justify-between transition-all duration-200 border-r border-[#24313E] select-none ${
        isCollapsed ? 'w-[56px]' : 'w-[240px]'
      }`}
    >
      {/* Top Header */}
      <div>
        <div className="h-[56px] px-3 flex items-center justify-between border-b border-[#24313E]">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-[6px] bg-[#0F6E74] text-white flex items-center justify-center shrink-0 shadow-sm">
                <Boxes className="w-4 h-4" />
              </div>
              <div className="truncate">
                <div className="text-[13px] font-semibold text-white tracking-tight leading-none">
                  DEPLOY PORTAL
                </div>
                <div className="text-[10px] font-mono text-[#8F9CA7] mt-0.5">
                  ops.internal // v2.4
                </div>
              </div>
            </div>
          ) : (
            <div className="mx-auto w-7 h-7 rounded-[6px] bg-[#0F6E74] text-white flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          )}

          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-6 h-6 rounded-[4px] hover:bg-[#24313E] text-[#8F9CA7] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Cluster / Scope Selector */}
        {!isCollapsed && (
          <div className="p-3">
            <div className="p-2 rounded-[6px] bg-[#11161B] border border-[#24313E] flex items-center justify-between text-[11px] font-mono">
              <div className="flex items-center gap-1.5 overflow-hidden text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2E8B57] shrink-0" />
                <span className="truncate">prod-us-east-1</span>
              </div>
              <span className="text-[#8F9CA7] text-[10px] uppercase font-semibold">k8s</span>
            </div>
          </div>
        )}

        {/* Nav Sections */}
        <nav className="p-2 space-y-4">
          {navSections.map((section, idx) => (
            <div key={idx}>
              {!isCollapsed && (
                <div className="px-2 pb-1.5 text-[10px] font-mono font-semibold tracking-wider text-[#8F9CA7]/70 uppercase">
                  {section.title}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id
                  const Icon = item.icon

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => onSelectTab(item.id)}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative w-full h-[34px] rounded-[6px] flex items-center transition-colors duration-150 text-[13px] font-medium cursor-pointer ${
                        isCollapsed ? 'justify-center px-0' : 'justify-between px-2.5'
                      } ${
                        isActive
                          ? 'bg-[#24313E] text-[#FFFFFF]'
                          : 'text-[#8F9CA7] hover:bg-[rgba(255,255,255,0.05)] hover:text-[#FFFFFF]'
                      }`}
                    >
                      {/* Active Left Indicator */}
                      {isActive && (
                        <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] bg-[#0F6E74] rounded-r-[2px]" />
                      )}

                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <Icon className="w-4 h-4 shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && (
                        <div>
                          {item.live && (
                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#0F6E74]/30 text-[#85d3da] font-mono text-[9px] uppercase tracking-wider">
                              <span className="w-1 h-1 rounded-full bg-[#85d3da] animate-ping" />
                              LIVE
                            </span>
                          )}
                          {item.count && (
                            <span className="text-[11px] font-mono text-[#8F9CA7]">
                              {item.count}
                            </span>
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Profile / Status */}
      <div className="p-2 border-t border-[#24313E]">
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-1.5 rounded-[6px] hover:bg-[rgba(255,255,255,0.05)] cursor-pointer">
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-7 h-7 rounded-[4px] bg-[#24313E] text-slate-200 flex items-center justify-center font-mono text-[11px] font-semibold border border-[#3E4853]">
                EA
              </div>
              <div className="truncate">
                <div className="text-[12px] font-medium text-white truncate">Emmanuel A.</div>
                <div className="text-[10px] font-mono text-[#8F9CA7] truncate">Platform Engineer</div>
              </div>
            </div>
            <ShieldCheck className="w-3.5 h-3.5 text-[#2E8B57]" />
          </div>
        ) : (
          <div className="w-8 h-8 mx-auto rounded-[4px] bg-[#24313E] text-slate-200 flex items-center justify-center font-mono text-[11px] font-semibold">
            EA
          </div>
        )}
      </div>
    </aside>
  )
}
