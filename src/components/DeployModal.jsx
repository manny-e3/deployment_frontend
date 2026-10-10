import { useState } from 'react'
import { X, Play, GitBranch, ShieldAlert, Check } from 'lucide-react'
import { Button } from './Button'
import { Input } from './Input'

export function DeployModal({
  isOpen,
  onClose,
  onDeploy,
  currentEnv,
}) {
  const [service, setService] = useState('auth-gateway-api')
  const [environment, setEnvironment] = useState(currentEnv)
  const [branch, setBranch] = useState('main')
  const [commitSha, setCommitSha] = useState('a94c1f2')
  const [version, setVersion] = useState('v2.14.0')
  const [strategy, setStrategy] = useState('canary')

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    onDeploy({
      service,
      environment,
      branch,
      commitSha: commitSha || Math.random().toString(16).substring(2, 9),
      version,
      canaryPercent: strategy === 'canary' ? 10 : undefined,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#17202A]/50 backdrop-blur-xs select-none">
      {/* Modal Surface - Layer 3 elevation */}
      <div
        className="w-full max-w-[520px] bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-[0_4px_12px_rgba(23,32,42,0.08)] animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
      >
        {/* Modal Header */}
        <div className="h-[46px] px-4 bg-[#FFFFFF] border-b border-[#E2E7E4] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-[4px] bg-[#0F6E74] text-white flex items-center justify-center">
              <Play className="w-3 h-3 fill-current" />
            </div>
            <h3 className="text-[14px] font-semibold text-[#17202A] tracking-tight">
              Trigger Service Deployment
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-[4px] text-[#5E6B76] hover:text-[#17202A] hover:bg-[#EDF0EE] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Target Environment */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
              TARGET ENVIRONMENT
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-[#F4F6F5] rounded-[6px] border border-[#CDD4D0]">
              {['production', 'staging', 'qa', 'preview'].map((env) => (
                <button
                  key={env}
                  type="button"
                  onClick={() => setEnvironment(env)}
                  className={`h-[28px] rounded-[4px] text-[12px] font-medium uppercase font-mono transition-colors cursor-pointer ${
                    environment === env
                      ? env === 'production'
                        ? 'bg-[#C2412D] text-white font-semibold shadow-xs'
                        : 'bg-[#0F6E74] text-white font-semibold shadow-xs'
                      : 'text-[#5E6B76] hover:text-[#17202A]'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>
            {environment === 'production' && (
              <div className="mt-1.5 p-2 rounded-[4px] bg-[#FAEBE9] border border-[#F1B5AC] flex items-center gap-2 text-[11px] text-[#C2412D]">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Production deploy requires passing canary stage before full rollout.</span>
              </div>
            )}
          </div>

          {/* Service Selector */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
              SERVICE DEFINITION
            </label>
            <div className="relative">
              <select
                value={service}
                onChange={(e) => setService(e.target.value)}
                className="h-[32px] w-full bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] px-3 text-[13px] text-[#17202A] focus:outline-none focus:border-[#0F6E74] focus:ring-2 focus:ring-[#0F6E74]/15 cursor-pointer"
              >
                <option value="auth-gateway-api">auth-gateway-api (Gateway / Auth / Envoy)</option>
                <option value="billing-worker-service">billing-worker-service (Go / Temporal / Stripe)</option>
                <option value="payment-router">payment-router (Rust / High-Throughput Engine)</option>
                <option value="analytics-collector">analytics-collector (Node / ClickHouse stream)</option>
                <option value="notification-dispatcher">notification-dispatcher (Python / Celery)</option>
              </select>
            </div>
          </div>

          {/* Git Branch & Commit SHA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
                GIT BRANCH
              </label>
              <Input
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                icon={<GitBranch className="w-3.5 h-3.5" />}
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
                COMMIT SHA
              </label>
              <Input
                value={commitSha}
                onChange={(e) => setCommitSha(e.target.value)}
                placeholder="a94c1f2"
              />
            </div>
          </div>

          {/* Version Tag */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
              TAG / VERSION
            </label>
            <Input
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="v2.14.0"
            />
          </div>

          {/* Rollout Strategy */}
          <div>
            <label className="block text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-1.5">
              DEPLOYMENT STRATEGY
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'canary', label: 'Canary (10% step)', desc: 'Zero downtime' },
                { id: 'blue-green', label: 'Blue / Green', desc: 'Instant cutover' },
                { id: 'rolling', label: 'Rolling Update', desc: 'Replicas 1-by-1' },
              ].map((strat) => (
                <div
                  key={strat.id}
                  onClick={() => setStrategy(strat.id)}
                  className={`p-2.5 rounded-[6px] border cursor-pointer transition-all ${
                    strategy === strat.id
                      ? 'border-[#0F6E74] bg-[#0F6E74]/5 ring-1 ring-[#0F6E74]'
                      : 'border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F9FAF9]'
                  }`}
                >
                  <div className="text-[12px] font-semibold text-[#17202A] flex items-center justify-between">
                    <span>{strat.label}</span>
                    {strategy === strat.id && <Check className="w-3 h-3 text-[#0F6E74]" />}
                  </div>
                  <div className="text-[10px] text-[#5E6B76] mt-0.5">{strat.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Modal Footer / Actions */}
          <div className="pt-3 border-t border-[#E2E7E4] flex items-center justify-end gap-2">
            <Button variant="secondary" size="compact" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="compact"
              icon={<Play className="w-3 h-3 fill-current" />}
            >
              Confirm &amp; Dispatch
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
