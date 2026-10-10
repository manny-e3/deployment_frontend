import { Plus, Search, RefreshCw } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'

export function Header({
  currentEnv,
  onEnvChange,
  searchQuery,
  onSearchChange,
  onOpenDeployModal,
  onSimulateNewDeploy,
  isSimulating,
}) {
  const envOptions = [
    { id: 'production', label: 'Production' },
    { id: 'staging', label: 'Staging' },
    { id: 'qa', label: 'QA / Integration' },
    { id: 'preview', label: 'Preview' },
  ]

  return (
    <header className="h-[56px] px-6 bg-[#FFFFFF] border-b border-[#CDD4D0] flex items-center justify-between gap-4 sticky top-0 z-30 select-none">
      {/* Left: Breadcrumbs & Environment Selector */}
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2 text-[13px]">
          <span className="font-mono text-[#5E6B76]">deploy</span>
          <span className="text-[#CDD4D0]">/</span>
          <span className="font-semibold text-[#17202A]">pipelines</span>
        </div>

        {/* Environment Selector Dropdown/Tabs */}
        <div className="flex items-center bg-[#F4F6F5] p-0.5 rounded-[6px] border border-[#CDD4D0]">
          {envOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onEnvChange(opt.id)}
              className={`h-[24px] px-2.5 rounded-[4px] text-[12px] font-medium transition-colors cursor-pointer ${
                currentEnv === opt.id
                  ? 'bg-[#FFFFFF] text-[#0F6E74] font-semibold shadow-xs border border-[#CDD4D0]'
                  : 'text-[#5E6B76] hover:text-[#17202A]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Search, Cluster health, Actions */}
      <div className="flex items-center gap-3">
        {/* Quick Search Input */}
        <div className="w-[180px] sm:w-[220px]">
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Filter pipelines, SHA..."
            icon={<Search className="w-3.5 h-3.5" />}
          />
        </div>

        {/* Health pill */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 h-[32px] rounded-[6px] bg-[#F4F6F5] border border-[#CDD4D0] text-[11px] font-mono text-[#5E6B76]">
          <span className="w-2 h-2 rounded-full bg-[#2E8B57]" />
          <span>cluster: OK</span>
        </div>

        {/* Simulate Live Event Button */}
        <Button
          variant="secondary"
          size="compact"
          onClick={onSimulateNewDeploy}
          disabled={isSimulating}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin text-[#0F6E74]' : ''}`} />}
          title="Simulate random deployment activity"
        >
          <span className="hidden md:inline">{isSimulating ? 'Simulating...' : 'Simulate Deploy'}</span>
        </Button>

        {/* Primary Deploy Button */}
        <Button
          variant="primary"
          size="compact"
          onClick={onOpenDeployModal}
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Deploy Service
        </Button>
      </div>
    </header>
  )
}
