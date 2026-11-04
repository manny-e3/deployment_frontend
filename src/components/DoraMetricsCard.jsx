import { useState, useEffect } from 'react'
import {
  Activity,
  Flame,
  Clock,
  RotateCcw,
  Zap,
  HelpCircle,
  Award
} from 'lucide-react'
import { api } from '../services/api'

export function DoraMetricsCard({ deployments = [], projectId = null }) {
  const [timeframe, setTimeframe] = useState('30d')
  const [metrics, setMetrics] = useState(null)
  const [showInfo, setShowInfo] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadDoraTelemetry = async () => {
      try {
        const data = await api('/telemetry/dora', {
          query: { timeframe, projectId: projectId || undefined }
        })
        if (isMounted && data) {
          setMetrics(data)
          return
        }
      } catch {
        // Calculate strictly from real deployments array — ZERO mock data
        if (isMounted) {
          const days = timeframe === '7d' ? 7 : timeframe === '90d' ? 90 : 30
          const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

          const relevant = (deployments || []).filter((d) => {
            const rawTime = d.startedAt || d.queuedAt || d.createdAt
            if (!rawTime) return true
            return new Date(rawTime).getTime() >= cutoff
          })

          const total = relevant.length
          const weeks = Math.max(days / 7, 1)

          // 1. Deployment Frequency
          const dfNum = total > 0 ? (total / weeks).toFixed(1) : '0.0'
          const dfRating = total === 0 ? 'INITIAL' : Number(dfNum) >= 7 ? 'ELITE' : Number(dfNum) >= 1 ? 'HIGH' : 'MEDIUM'

          // 2. Change Failure Rate
          const failed = relevant.filter((d) => {
            const st = (d.rawStatus || d.status || '').toUpperCase()
            return st === 'FAILED' || st === 'CANCELLED'
          }).length
          const cfrRate = total > 0 ? ((failed / total) * 100).toFixed(1) : '0.0'
          const cfrRating = total === 0 ? 'OPTIMAL' : Number(cfrRate) <= 5 ? 'ELITE' : Number(cfrRate) <= 15 ? 'HIGH' : 'MEDIUM'

          // 3. Lead Time for Changes (calculated from real durations)
          const durations = relevant
            .map((d) => {
              if (typeof d.durationMs === 'number' && d.durationMs > 0) return d.durationMs / 1000
              if (d.startedAt && d.finishedAt) {
                const diff = (new Date(d.finishedAt).getTime() - new Date(d.startedAt).getTime()) / 1000
                return diff > 0 ? diff : null
              }
              return null
            })
            .filter((v) => v !== null)

          let lttcText = '--'
          let lttcRating = 'N/A'
          let lttcDesc = 'Awaiting pipeline build duration logs'

          if (durations.length > 0) {
            const avgSec = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
            lttcText = avgSec < 60 ? `${avgSec}s` : avgSec < 3600 ? `${Math.round(avgSec / 60)}m` : `${(avgSec / 3600).toFixed(1)}h`
            lttcRating = avgSec <= 3600 ? 'ELITE' : avgSec <= 86400 ? 'HIGH' : 'MEDIUM'
            lttcDesc = `Avg execution across ${durations.length} recorded run(s)`
          }

          // 4. Mean Time to Recovery
          let mttrText = failed === 0 ? '0 Incidents' : '--'
          let mttrRating = failed === 0 ? 'ELITE' : 'OBSERVING'
          let mttrDesc = failed === 0 ? 'No failed releases in selected window' : `${failed} failed release(s) tracked`

          setMetrics({
            deploymentFrequency: {
              value: dfNum,
              unit: 'deploys/wk',
              rating: dfRating,
              benchmark: total === 0 ? 'No releases in selected window' : `${total} total release(s) across ${days} days`
            },
            leadTimeForChanges: {
              value: lttcText,
              rating: lttcRating,
              benchmark: lttcDesc
            },
            changeFailureRate: {
              value: `${cfrRate}%`,
              rating: cfrRating,
              benchmark: total === 0 ? '0 incidents recorded' : `${failed} of ${total} deployments failed`
            },
            meanTimeToRecovery: {
              value: mttrText,
              rating: mttrRating,
              benchmark: mttrDesc
            },
            overallRating: total === 0 ? 'INITIAL' : failed === 0 ? 'ELITE' : Number(cfrRate) <= 5 ? 'ELITE' : 'STABLE',
            totalCount: total
          })
        }
      }
    }

    loadDoraTelemetry()

    return () => {
      isMounted = false
    }
  }, [timeframe, deployments, projectId])

  if (!metrics) return null

  const getRatingBadge = (rating) => {
    switch (rating) {
      case 'ELITE':
      case 'OPTIMAL':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
      case 'HIGH':
        return 'bg-teal-50 text-teal-700 border-teal-300 font-bold'
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-300 font-medium'
      case 'INITIAL':
      case 'N/A':
        return 'bg-gray-100 text-gray-600 border-gray-300 font-medium'
      default:
        return 'bg-rose-50 text-rose-700 border-rose-300 font-medium'
    }
  }

  const pillars = [
    {
      id: 'df',
      name: 'Deployment Frequency',
      acronym: 'DF',
      value: metrics.deploymentFrequency.value,
      unit: metrics.deploymentFrequency.unit,
      rating: metrics.deploymentFrequency.rating,
      icon: Zap,
      description: metrics.deploymentFrequency.benchmark
    },
    {
      id: 'lttc',
      name: 'Lead Time for Changes',
      acronym: 'LTTC',
      value: metrics.leadTimeForChanges.value,
      rating: metrics.leadTimeForChanges.rating,
      icon: Clock,
      description: metrics.leadTimeForChanges.benchmark
    },
    {
      id: 'cfr',
      name: 'Change Failure Rate',
      acronym: 'CFR',
      value: metrics.changeFailureRate.value,
      rating: metrics.changeFailureRate.rating,
      icon: Flame,
      description: metrics.changeFailureRate.benchmark
    },
    {
      id: 'mttr',
      name: 'Mean Time to Recovery',
      acronym: 'MTTR',
      value: metrics.meanTimeToRecovery.value,
      rating: metrics.meanTimeToRecovery.rating,
      icon: RotateCcw,
      description: metrics.meanTimeToRecovery.benchmark
    }
  ]

  return (
    <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[10px] p-5 shadow-2xs space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[8px] bg-[#005459]/10 text-[#005459] flex items-center justify-center">
            <Award className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-bold text-[#101d26] tracking-tight">
                DORA Engineering Telemetry
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold uppercase flex items-center gap-1 ${getRatingBadge(metrics.overallRating)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {metrics.overallRating} STATUS
              </span>
            </div>
            <p className="text-[12px] text-[#565f6b]">
              Four key DevOps velocity and stability telemetry indicators
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="h-[30px] px-2 rounded-[6px] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#565f6b] text-[11px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
            title="What are DORA metrics?"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Benchmark Guide</span>
          </button>

          <div className="flex items-center bg-[#F4F6F5] p-0.5 rounded-[6px] border border-[#CDD4D0] text-[11px] font-mono">
            {['7d', '30d', '90d'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTimeframe(t)}
                className={`px-2.5 h-[26px] rounded-[4px] font-medium transition-colors cursor-pointer ${
                  timeframe === t
                    ? 'bg-white text-[#005459] font-bold shadow-2xs border border-[#CDD4D0]'
                    : 'text-[#565f6b] hover:text-[#101d26]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Explanatory Info Drawer */}
      {showInfo && (
        <div className="p-3.5 bg-[#E2F0FD]/60 border border-[#BEDDF7] rounded-[8px] text-[12px] text-[#005459] space-y-2 animate-in fade-in duration-150">
          <div className="flex items-center justify-between font-semibold">
            <span>DORA Benchmark Standards (DevOps Research and Assessment)</span>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="text-[#005459] hover:underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
          <p className="text-[11px] text-[#004246] leading-relaxed">
            DORA metrics measure software delivery throughput and operational stability:
            <strong> Deployment Frequency</strong> and <strong>Lead Time for Changes</strong> measure velocity,
            while <strong>Change Failure Rate</strong> and <strong>Mean Time to Recovery</strong> measure operational resilience.
          </p>
        </div>
      )}

      {/* 4-Pillar Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {pillars.map((p) => {
          return (
            <div
              key={p.id}
              className="p-3.5 bg-[#F9FBFA] hover:bg-white border border-[#CDD4D0] rounded-[8px] transition-all hover:shadow-xs flex flex-col justify-between space-y-2"
            >
              {/* Pillar Header */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase font-bold text-[#565f6b] tracking-wider">
                  {p.acronym}
                </span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${getRatingBadge(p.rating)}`}>
                  {p.rating}
                </span>
              </div>

              {/* Metric Value */}
              <div className="flex items-baseline gap-1.5">
                <span className="text-[26px] font-bold text-[#101d26] tracking-tight leading-none font-sans">
                  {p.value}
                </span>
                {p.unit && (
                  <span className="text-[11px] font-mono text-[#565f6b]">
                    {p.unit}
                  </span>
                )}
              </div>

              {/* Subtext description */}
              <div className="pt-1.5 border-t border-[#E2E7E4] text-[11px] text-[#565f6b] truncate" title={p.description}>
                {p.description}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
