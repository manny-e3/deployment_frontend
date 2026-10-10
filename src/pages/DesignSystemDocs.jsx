import { useState } from 'react'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { StatusBadge } from '../components/StatusBadge'
import { Input } from '../components/Input'
import { Copy, Check } from 'lucide-react'

export function DesignSystemDocs() {
  const [copiedToken, setCopiedToken] = useState(null)

  const copyToClipboard = (token) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 1800)
  }

  const colorPalettes = [
    {
      group: 'Surface & Canvas Tokens',
      colors: [
        { name: 'Canvas Base', hex: '#EDF0EE', desc: 'Cool, grounding stone gray' },
        { name: 'Surface Elevation', hex: '#FFFFFF', desc: 'Cards, panels, content blocks' },
        { name: 'Surface Inset / Muted', hex: '#F4F6F5', desc: 'Code blocks, table headers' },
        { name: 'Sidebar Surface', hex: '#17202A', desc: 'Deep slate navy rail' },
        { name: 'Sidebar Active', hex: '#24313E', desc: 'Active navigation item' },
        { name: 'Border Default', hex: '#CDD4D0', desc: 'Precise 1px boundaries' },
        { name: 'Border Subdued', hex: '#E2E7E4', desc: 'Internal row dividers' },
      ],
    },
    {
      group: 'Text & Typography Tokens',
      colors: [
        { name: 'Text Primary', hex: '#17202A', desc: 'High-contrast technical readability' },
        { name: 'Text Secondary', hex: '#5E6B76', desc: 'Metadata, descriptions, muted' },
        { name: 'Text Inverse', hex: '#FFFFFF', desc: 'White text on dark surfaces' },
        { name: 'Text Sidebar Muted', hex: '#8F9CA7', desc: 'Nav links and secondary rail text' },
      ],
    },
    {
      group: 'Interactive & Brand Accent',
      colors: [
        { name: 'Primary Action', hex: '#0F6E74', desc: 'Deep operational teal driver' },
        { name: 'Primary Hover', hex: '#0B5459', desc: 'Darker teal hover state' },
        { name: 'Primary Active', hex: '#083F43', desc: 'Pressed state' },
        { name: 'Focus Ring', hex: 'rgba(15, 110, 116, 0.15)', desc: '2px offset ring' },
      ],
    },
    {
      group: 'Telemetry & Deployment States',
      colors: [
        { name: 'Success Solid', hex: '#2E8B57', bg: '#EAF5EE', border: '#B8E0C5', desc: 'Deployed pipeline' },
        { name: 'Running / Queued', hex: '#B87E0C', bg: '#FAF3E7', border: '#F1D6A4', desc: 'In-flight canary/build' },
        { name: 'Failed / Incident', hex: '#C2412D', bg: '#FAEBE9', border: '#F1B5AC', desc: 'Failed deployment' },
      ],
    },
  ]

  const typographyTokens = [
    { name: 'display-lg', font: 'Geist', size: '32px', weight: '600', lh: '40px', track: '-0.02em', sample: 'Mission-Critical Deployment Control Plane' },
    { name: 'headline-lg', font: 'Geist', size: '24px', weight: '600', lh: '32px', track: '-0.015em', sample: 'Production Pipeline Cluster' },
    { name: 'headline-md', font: 'Geist', size: '20px', weight: '600', lh: '28px', track: '-0.01em', sample: 'Service Telemetry & Replicas' },
    { name: 'headline-sm', font: 'Geist', size: '16px', weight: '600', lh: '24px', track: 'normal', sample: 'Canary Rollout Threshold (10%)' },
    { name: 'body-lg', font: 'Geist', size: '15px', weight: '400', lh: '22px', track: 'normal', sample: 'Eliminates visual friction to reduce cognitive load during critical production deployments.' },
    { name: 'body-md', font: 'Geist', size: '13px', weight: '400', lh: '18px', track: 'normal', sample: 'High information density without clutter across all mission-critical infrastructure.' },
    { name: 'label-sm', font: 'Geist', size: '11px', weight: '600', lh: '14px', track: '+0.04em', sample: 'STATUS / REPLICAS / DURATION', isUppercase: true },
    { name: 'code-md', font: 'JetBrains Mono', size: '13px', weight: '400', lh: '18px', track: 'normal', sample: 'kubectl rollout restart deployment/auth-gateway-api', isCode: true },
    { name: 'code-sm', font: 'JetBrains Mono', size: '11px', weight: '500', lh: '16px', track: 'normal', sample: 'commit: 8f42d19 • branch: main • sha256:e3b0c442', isCode: true },
  ]

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <Card padding="standard">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-[4px] bg-[#0F6E74] text-white uppercase">
                Design System v1.0
              </span>
              <span className="text-[12px] font-mono text-[#5E6B76]">deploy-portal.spec</span>
            </div>
            <h2 className="text-[20px] font-semibold text-[#17202A] tracking-tight">
              Deploy Portal Design System Specifications
            </h2>
            <p className="text-[13px] text-[#5E6B76] mt-1 max-w-3xl leading-relaxed">
              Utilitarian, calm, hyper-focused, and unmistakably functional. Engineered to oversee mission-critical
              deployment pipelines, environments, and services with zero ocular fatigue and precise flat depth.
            </p>
          </div>
        </div>
      </Card>

      {/* Component Library Live Preview */}
      <Card title="Core Component Primitives" subtitle="Standardized 8px outer radius, 6px inner controls, 4px badges">
        <div className="space-y-6">
          {/* Buttons Matrix */}
          <div>
            <div className="text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-3">
              1. BUTTONS (HEIGHT 36PX REGULAR / 32PX COMPACT, 6PX RADIUS)
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary (#0F6E74)</Button>
              <Button variant="primary" size="compact">Primary Compact</Button>
              <Button variant="secondary">Secondary Default</Button>
              <Button variant="secondary" size="compact">Secondary Compact</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="destructive">Destructive Action</Button>
              <Button variant="primary" disabled>Disabled State</Button>
            </div>
          </div>

          {/* Status Badges Matrix */}
          <div className="pt-4 border-t border-[#E2E7E4]">
            <div className="text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-3">
              2. STATUS BADGES &amp; CHIPS (20PX HEIGHT, 4PX RADIUS, JETBRAINS MONO 11PX)
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <StatusBadge status="success" />
              <StatusBadge status="running" />
              <StatusBadge status="failed" />
            </div>
          </div>

          {/* Inputs & Focus Rings */}
          <div className="pt-4 border-t border-[#E2E7E4]">
            <div className="text-[11px] font-mono uppercase font-semibold text-[#5E6B76] mb-3">
              3. INPUT FIELDS (32PX DENSE DEFAULT, 1PX #CDD4D0 BORDER, 6PX RADIUS)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input placeholder="Standard placeholder..." />
              <Input defaultValue="k8s.cluster.internal:6443" />
              <Input placeholder="Invalid field state..." error="Authentication token expired" />
            </div>
          </div>
        </div>
      </Card>

      {/* Color Tokens Matrix */}
      <div className="space-y-4">
        <h3 className="text-[16px] font-semibold text-[#17202A] tracking-tight">
          Calibrated Color System
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {colorPalettes.map((group, gIdx) => (
            <Card key={gIdx} title={group.group} padding="none">
              <div className="divide-y divide-[#E2E7E4]">
                {group.colors.map((c, cIdx) => (
                  <div
                    key={cIdx}
                    className="p-3 flex items-center justify-between hover:bg-[#F9FAF9] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-[4px] border border-[#CDD4D0] shrink-0 shadow-xs"
                        style={{ backgroundColor: c.hex }}
                      />
                      <div>
                        <div className="text-[13px] font-medium text-[#17202A]">{c.name}</div>
                        <div className="text-[11px] text-[#5E6B76]">{c.desc}</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => copyToClipboard(c.hex)}
                      className="px-2 py-1 rounded-[4px] bg-[#F4F6F5] hover:bg-[#EDF0EE] border border-[#CDD4D0] font-mono text-[11px] text-[#17202A] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedToken === c.hex ? (
                        <>
                          <Check className="w-3 h-3 text-[#2E8B57]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <span>{c.hex}</span>
                          <Copy className="w-3 h-3 text-[#5E6B76]" />
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Typography Scale */}
      <Card title="Typography Hierarchy & Micro-Labels" subtitle="Pairing Geist for Scaffolding with JetBrains Mono for Technical Tokens">
        <div className="divide-y divide-[#E2E7E4]">
          {typographyTokens.map((t, idx) => (
            <div key={idx} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="w-[180px] shrink-0 font-mono text-[11px] text-[#5E6B76]">
                <div className="font-semibold text-[#17202A]">{t.name}</div>
                <div>{t.font} • {t.size}</div>
                <div>weight: {t.weight} • lh: {t.lh}</div>
              </div>

              <div
                className={`flex-1 text-[#17202A] ${t.isCode ? 'font-mono' : ''} ${
                  t.isUppercase ? 'tracking-[0.04em] uppercase text-[11px] font-semibold' : ''
                }`}
                style={{
                  fontSize: t.size,
                  fontWeight: t.weight,
                  lineHeight: t.lh,
                  letterSpacing: t.track,
                }}
              >
                {t.sample}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
