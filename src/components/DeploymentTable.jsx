import { GitCommit, GitBranch, Terminal, RotateCcw } from 'lucide-react'
import { StatusBadge } from './StatusBadge'

export function DeploymentTable({
  deployments,
  selectedDeploymentId,
  onSelectDeployment,
  onRollback,
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse select-none">
        <thead>
          <tr className="h-[32px] bg-[#F4F6F5] border-b border-[#CDD4D0] text-[#5E6B76] font-semibold text-[11px] tracking-[0.04em] uppercase">
            <th className="px-3.5 w-[130px] font-sans">STATUS</th>
            <th className="px-3 font-sans">SERVICE / PIPELINE</th>
            <th className="px-3 font-sans">COMMIT &amp; BRANCH</th>
            <th className="px-3 font-sans w-[100px]">REPLICAS</th>
            <th className="px-3 font-sans">TRIGGERED BY</th>
            <th className="px-3 font-sans w-[90px]">DURATION</th>
            <th className="px-3 font-sans w-[110px]">TIME</th>
            <th className="px-3 text-right font-sans w-[110px]">ACTIONS</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E7E4] text-[13px]">
          {deployments.length === 0 ? (
            <tr>
              <td colSpan={8} className="h-32 text-center text-[#5E6B76] bg-[#FFFFFF]">
                No deployments match current filters.
              </td>
            </tr>
          ) : (
            deployments.map((d) => {
              const isSelected = selectedDeploymentId === d.id

              return (
                <tr
                  key={d.id}
                  onClick={() => onSelectDeployment(d)}
                  className={`h-[38px] transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F4F6F5] ring-2 ring-[#0F6E74]/20 border-l-[3px] border-l-[#0F6E74]'
                      : 'hover:bg-[#F9FAF9] bg-[#FFFFFF]'
                  }`}
                >
                  {/* Status Badge */}
                  <td className="px-3.5">
                    <StatusBadge status={d.status} />
                  </td>

                  {/* Service & Pipeline */}
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#17202A] text-[13px] tracking-tight">
                        {d.service}
                      </span>
                      <span className="text-[11px] font-mono text-[#5E6B76] px-1.5 py-0.2 rounded-[4px] bg-[#F4F6F5] border border-[#E2E7E4]">
                        {d.version}
                      </span>
                    </div>
                  </td>

                  {/* Commit & Branch */}
                  <td className="px-3 font-mono text-[12px]">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[#17202A] font-medium bg-[#EDF0EE] px-1.5 py-0.5 rounded-[4px] border border-[#CDD4D0]">
                        <GitBranch className="w-3 h-3 text-[#5E6B76]" />
                        <span>{d.branch}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 text-[#5E6B76] hover:text-[#17202A]">
                        <GitCommit className="w-3 h-3" />
                        <span>{d.commitSha.slice(0, 7)}</span>
                      </span>
                    </div>
                  </td>

                  {/* Replicas / Pods */}
                  <td className="px-3 font-mono text-[12px] text-[#5E6B76]">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-[#17202A]">{d.activePods}</span>
                      <span>/</span>
                      <span>{d.targetPods}</span>
                      {d.canaryPercent && (
                        <span className="text-[10px] text-[#0F6E74] font-medium ml-1">
                          ({d.canaryPercent}%)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Triggered by */}
                  <td className="px-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-[4px] bg-[#17202A] text-white flex items-center justify-center font-mono text-[10px] font-semibold">
                        {d.triggeredBy.avatar}
                      </span>
                      <span className="text-[#17202A] text-[12px] truncate max-w-[120px]">
                        {d.triggeredBy.name}
                      </span>
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="px-3 font-mono text-[12px] text-[#5E6B76]">
                    {d.duration}
                  </td>

                  {/* Timestamp */}
                  <td className="px-3 font-mono text-[12px] text-[#5E6B76]">
                    {d.timestamp}
                  </td>

                  {/* Action Buttons */}
                  <td className="px-3 text-right">
                    <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onSelectDeployment(d)}
                        title="View terminal logs"
                        className="h-[26px] px-2 rounded-[4px] bg-[#FFFFFF] hover:bg-[#EDF0EE] border border-[#CDD4D0] text-[#17202A] text-[11px] font-mono inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Terminal className="w-3 h-3 text-[#0F6E74]" />
                        <span>LOGS</span>
                      </button>

                      {d.status === 'success' && (
                        <button
                          type="button"
                          onClick={() => onRollback(d)}
                          title="Rollback deployment"
                          className="h-[26px] w-[26px] rounded-[4px] bg-[#FFFFFF] hover:bg-[#FAEBE9] border border-[#CDD4D0] hover:border-[#F1B5AC] text-[#5E6B76] hover:text-[#C2412D] inline-flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
