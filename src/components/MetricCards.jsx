import { Activity, CheckCircle2, Clock, GitFork, ArrowUpRight } from 'lucide-react'
import { Card } from './Card'

export function MetricCards({ metrics }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1 */}
      <Card padding="compact">
        <div className="flex items-center justify-between text-[#5E6B76] mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
            ACTIVE PIPELINES
          </span>
          <Activity className="w-3.5 h-3.5 text-[#0F6E74]" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-[24px] font-semibold text-[#17202A] tracking-tight font-mono leading-none">
            {metrics.activeDeployments}
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] text-[#B87E0C] font-mono font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B87E0C] animate-ping" />
            IN FLIGHT
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-[#E2E7E4] flex items-center justify-between text-[11px] text-[#5E6B76]">
          <span>Cluster pods</span>
          <span className="font-mono text-[#17202A] font-medium">{metrics.totalClusterPods} healthy</span>
        </div>
      </Card>

      {/* Metric 2 */}
      <Card padding="compact">
        <div className="flex items-center justify-between text-[#5E6B76] mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
            SUCCESS RATE (24H)
          </span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B57]" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-[24px] font-semibold text-[#17202A] tracking-tight font-mono leading-none">
            {metrics.successRate}%
          </div>
          <span className="text-[11px] text-[#2E8B57] font-mono flex items-center">
            <ArrowUpRight className="w-3 h-3" />
            +0.4%
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-[#E2E7E4] flex items-center justify-between text-[11px] text-[#5E6B76]">
          <span>Deploy count</span>
          <span className="font-mono text-[#17202A] font-medium">{metrics.dailyDeployFrequency} runs today</span>
        </div>
      </Card>

      {/* Metric 3 */}
      <Card padding="compact">
        <div className="flex items-center justify-between text-[#5E6B76] mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
            MEAN TIME TO RECOVERY
          </span>
          <Clock className="w-3.5 h-3.5 text-[#0F6E74]" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-[24px] font-semibold text-[#17202A] tracking-tight font-mono leading-none">
            {metrics.meanTimeToRecovery}
          </div>
          <span className="text-[11px] text-[#2E8B57] font-mono">
            -42s SLA
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-[#E2E7E4] flex items-center justify-between text-[11px] text-[#5E6B76]">
          <span>Automated rollback</span>
          <span className="font-mono text-[#2E8B57] font-medium">ENABLED</span>
        </div>
      </Card>

      {/* Metric 4 */}
      <Card padding="compact">
        <div className="flex items-center justify-between text-[#5E6B76] mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider font-mono">
            CANARY TRAFFIC
          </span>
          <GitFork className="w-3.5 h-3.5 text-[#0F6E74]" />
        </div>
        <div className="flex items-baseline justify-between">
          <div className="text-[24px] font-semibold text-[#17202A] tracking-tight font-mono leading-none">
            {metrics.activeCanaries > 0 ? '10%' : '0%'}
          </div>
          <span className="text-[11px] text-[#5E6B76] font-mono">
            {metrics.activeCanaries} active
          </span>
        </div>
        <div className="mt-2 pt-2 border-t border-[#E2E7E4] flex items-center justify-between text-[11px] text-[#5E6B76]">
          <span>Strategy</span>
          <span className="font-mono text-[#17202A] font-medium">Blue/Green + Argo</span>
        </div>
      </Card>
    </div>
  )
}
