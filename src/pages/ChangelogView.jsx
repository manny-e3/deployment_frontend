import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  GitBranch,
  Rocket,
  CheckCircle2,
  Calendar,
  Tag,
  ArrowRight,
  Shield,
  Zap,
  Terminal,
  Activity,
  Layers,
  Database
} from 'lucide-react'
import { PublicNav } from '../components/PublicNav'
import { PublicFooter } from '../components/PublicFooter'

export function ChangelogView() {
  const releases = [
    {
      version: 'v2.4.0',
      date: 'November 2026',
      badge: 'Current Release',
      badgeColor: 'text-[#00DF8F] bg-[#00DF8F]/10 border-[#00DF8F]/30',
      title: 'Ubuntu 24.04 LTS, Node.js 22 & Automated Rollback Probes',
      summary: 'Expanded operating system support to the latest Ubuntu LTS release, integrated Node 22 runtime detection, and added post-deployment automated HTTP health probes.',
      features: [
        'Added native support for Ubuntu 24.04 LTS (Noble Numbat) alongside Debian 12.',
        'Zero-downtime automated rollback health probe: if the new symlink returns 5xx HTTP responses within 5 seconds, PortalOps automatically points back to the prior stable release.',
        'Support for Node.js 22 LTS with optimized npm ci caching and pnpm/bun detection.',
        'Streamlined 1-line bash setup script with automatic UFW port auditing.'
      ]
    },
    {
      version: 'v2.3.0',
      date: 'October 2026',
      badge: 'Feature Update',
      badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      title: 'Multi-Tenant Client Workspaces & Granular RBAC',
      summary: 'Enables software agencies and multi-team organizations to isolate clients into segregated workspaces with role-based permissions and audit logs.',
      features: [
        'Multi-tenant workspace architecture with zero cross-tenant credential visibility.',
        'Granular role-based access control (RBAC): Owner, Admin, Member, Deployer.',
        'Cryptographically timestamped immutable audit logs for all server and deployment events.',
        'Team invitation workflow with secure tokenized email invites.'
      ]
    },
    {
      version: 'v2.2.0',
      date: 'September 2026',
      badge: 'Security & Database',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      title: 'AES-256-GCM Secret Vault & Database Migration Hooks',
      summary: 'Introduced envelope encryption for all sensitive environment variables and native preflight database migration hooks.',
      features: [
        'AES-256-GCM envelope encryption for all project environment variables.',
        'Automated database migration runner for Prisma, Drizzle ORM, and Laravel Artisan.',
        'Migration failure rollback guard: aborted migrations prevent symlink swaps.',
        'Multi-environment support (Production, Staging, QA).'
      ]
    },
    {
      version: 'v2.1.0',
      date: 'August 2026',
      badge: 'Performance',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      title: 'Real-Time Server Telemetry & Host Vitals Daemon',
      summary: 'Lightweight background host agent monitoring CPU load, memory utilization, and NVMe disk headroom without taxing VPS resources.',
      features: [
        'Under 5MB resident memory footprint for server telemetry daemon.',
        'Live CPU, RAM, and Disk storage graphs in the PortalOps console.',
        'Automated disk cleanup policy retaining the last 5 successful release directories.'
      ]
    },
    {
      version: 'v2.0.0',
      date: 'July 2026',
      badge: 'Major Milestone',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'PortalOps Core BYOS Control Plane Launch',
      summary: 'The initial public release of PortalOps bringing true cloud sovereignty and zero-downtime atomic symlink deployments to raw Linux VPS servers.',
      features: [
        'Atomic symlink release engine with sub-millisecond pointer swapping.',
        'Keyless server architecture: zero root passwords stored, Ed25519 isolated user.',
        'Automated Nginx reverse proxy configuration and Let\'s Encrypt SSL generation.',
        'Support for Hetzner, DigitalOcean, AWS EC2, Vultr, Linode, and bare metal.'
      ]
    }
  ]

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-x-clip bg-[#061014] text-white selection:bg-[#00DF8F] selection:text-zinc-950">
      <div
        className="absolute top-0 left-1/3 w-[800px] h-[600px] pointer-events-none blur-[150px] -z-10 opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(0, 84, 89, 0.40) 0%, transparent 70%)'
        }}
      />

      <PublicNav />

      {/* Header */}
      <section className="pt-16 pb-12 px-6 md:px-12 max-w-[1240px] mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-teal-300 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#00DF8F]" />
          <span>Product Updates &amp; Releases</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto">
          Changelog &amp; Release Notes
        </h1>

        <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          See what is new in PortalOps. We ship updates, security hardening, and performance improvements every week.
        </p>
      </section>

      {/* Timeline Section */}
      <section className="py-8 pb-24 px-6 max-w-[900px] mx-auto w-full">
        <div className="relative border-l border-white/10 ml-4 sm:ml-8 pl-6 sm:pl-10 space-y-16 text-left">
          {releases.map((rel, index) => (
            <div key={rel.version} className="relative group">
              {/* Bullet Node */}
              <div className="absolute -left-[31px] sm:-left-[47px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#005459] border-2 border-[#00DF8F] group-hover:scale-125 transition-transform" />

              <div className="space-y-4">
                {/* Meta Row */}
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-lg font-black text-white font-mono">{rel.version}</span>
                  <span className={`text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full border ${rel.badgeColor}`}>
                    {rel.badge}
                  </span>
                  <span className="text-xs text-zinc-500 flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{rel.date}</span>
                  </span>
                </div>

                {/* Title & Summary */}
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {rel.title}
                </h2>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {rel.summary}
                </p>

                {/* Feature List */}
                <div className="p-5 rounded-2xl bg-[#081419] border border-white/10 space-y-2.5">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-teal-300 font-bold">
                    Highlights &amp; Changes
                  </div>
                  <ul className="space-y-2 text-xs text-zinc-400">
                    {rel.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

