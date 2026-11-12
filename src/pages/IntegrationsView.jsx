import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Layers,
  Server,
  GitBranch,
  Database,
  Bell,
  CheckCircle2,
  ArrowRight,
  ExternalLink,
  Code2,
  Cpu,
  Globe
} from 'lucide-react'
import {
  DigitalOceanLogo,
  HetznerLogo,
  VultrLogo,
  LinodeLogo,
  AmazonEC2Logo,
  CustomServerLogo
} from '../components/ProviderLogos'
import { PublicNav } from '../components/PublicNav'
import { PublicFooter } from '../components/PublicFooter'

export function IntegrationsView() {
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All Integrations' },
    { id: 'cloud', label: 'Cloud Providers' },
    { id: 'git', label: 'Git & Version Control' },
    { id: 'frameworks', label: 'Frameworks & Runtimes' },
    { id: 'databases', label: 'Databases & Daemons' }
  ]

  const integrations = [
    {
      id: 'hetzner',
      category: 'cloud',
      name: 'Hetzner Cloud',
      type: 'VPS & Dedicated',
      desc: 'Connect ultra-affordable European & US cloud servers starting at €3.50/mo with 20TB included traffic.',
      badge: 'Official Partner',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    },
    {
      id: 'digitalocean',
      category: 'cloud',
      name: 'DigitalOcean',
      type: 'Droplets & VPC',
      desc: 'One-click compatibility with Standard, General Purpose, and CPU-Optimized droplets worldwide.',
      badge: 'Popular',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
    },
    {
      id: 'aws',
      category: 'cloud',
      name: 'Amazon EC2 & Lightsail',
      type: 'Compute Cloud',
      desc: 'Seamlessly link t4g ARM64 or x86_64 EC2 instances and Lightsail VPS instances with VPC security groups.',
      badge: 'Enterprise',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'vultr',
      category: 'cloud',
      name: 'Vultr',
      type: 'High Frequency Compute',
      desc: 'Deploy on 32+ global data center regions with NVMe high-frequency compute instances.',
      badge: 'Global Edge',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'linode',
      category: 'cloud',
      name: 'Linode / Akamai',
      type: 'Developer Cloud',
      desc: 'Standard Linode instances, dedicated CPU, and Nanodes running Ubuntu or Debian.',
      badge: 'Standard',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'baremetal',
      category: 'cloud',
      name: 'Custom Bare Metal & Homelab',
      type: 'Dedicated Linux',
      desc: 'Any physical dedicated server, homelab, or Raspberry Pi with static public IPv4 and SSH access.',
      badge: 'Self-Hosted',
      badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
    },
    {
      id: 'github',
      category: 'git',
      name: 'GitHub Webhooks & App',
      type: 'Git Provider',
      desc: 'Trigger automatic builds and zero-downtime releases on every git push or pull request merge.',
      badge: 'Native',
      badgeColor: 'text-zinc-300 bg-white/10 border-white/20'
    },
    {
      id: 'gitlab',
      category: 'git',
      name: 'GitLab & Self-Hosted GitLab',
      type: 'Git Provider',
      desc: 'Webhook triggers for gitlab.com and self-hosted GitLab Community/Enterprise editions.',
      badge: 'Verified',
      badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/20'
    },
    {
      id: 'bitbucket',
      category: 'git',
      name: 'Bitbucket',
      type: 'Git Provider',
      desc: 'Connect Atlassian Bitbucket repositories with automated deployment push webhooks.',
      badge: 'Verified',
      badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/20'
    },
    {
      id: 'nodejs',
      category: 'frameworks',
      name: 'Node.js & PM2',
      type: 'Fullstack Runtime',
      desc: 'Next.js (App & Pages Router), Express, NestJS, Remix, Fastify, and Nuxt running under PM2 cluster mode.',
      badge: 'Cluster Mode',
      badgeColor: 'text-teal-400 bg-teal-500/10 border-teal-500/20'
    },
    {
      id: 'laravel',
      category: 'frameworks',
      name: 'PHP & Laravel',
      type: 'Web Framework',
      desc: 'PHP 8.2 / 8.3 FPM, Composer optimization, automatic migration hooks, and artisan queue supervision.',
      badge: 'Automated',
      badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
    },
    {
      id: 'vite',
      category: 'frameworks',
      name: 'Vite, React & Static SPAs',
      type: 'Frontend',
      desc: 'Single Page Apps compiled and served via Nginx with Brotli compression and cache headers.',
      badge: 'Ultra Fast',
      badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    },
    {
      id: 'postgres',
      category: 'databases',
      name: 'PostgreSQL 16',
      type: 'Relational Database',
      desc: 'Automated installation, user creation, database provisioning, and local firewall protection.',
      badge: 'One-Click',
      badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20'
    },
    {
      id: 'mysql',
      category: 'databases',
      name: 'MySQL 8.0',
      type: 'Relational Database',
      desc: 'Production-ready MySQL server with performance tuning and automated service restart guards.',
      badge: 'One-Click',
      badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
    },
    {
      id: 'redis',
      category: 'databases',
      name: 'Redis 7',
      type: 'In-Memory Cache & Queue',
      desc: 'High-speed in-memory store for session caching, BullMQ, and background job queues.',
      badge: 'In-Memory',
      badgeColor: 'text-red-400 bg-red-500/10 border-red-500/20'
    }
  ]

  const filtered = activeCategory === 'all'
    ? integrations
    : integrations.filter(item => item.category === activeCategory)

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-x-clip bg-[#061014] text-white selection:bg-[#00DF8F] selection:text-zinc-950">
      <div
        className="absolute top-0 right-0 w-[800px] h-[600px] pointer-events-none blur-[150px] -z-10 opacity-50"
        style={{
          background: 'radial-gradient(circle at 80% 20%, rgba(0, 84, 89, 0.40) 0%, transparent 70%)'
        }}
      />

      <PublicNav />

      {/* Header */}
      <section className="pt-16 pb-12 px-6 md:px-12 max-w-[1240px] mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-teal-300 mb-6">
          <Layers className="w-3.5 h-3.5 text-[#00DF8F]" />
          <span>Ecosystem &amp; Cloud Support</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto">
          Built to integrate seamlessly with your existing stack.
        </h1>

        <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Zero proprietary runtime restrictions. Connect your preferred cloud servers, Git repositories, databases, and application frameworks.
        </p>

        {/* Categories Bar */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${activeCategory === cat.id
                  ? 'bg-[#005459] border-teal-500/50 text-white shadow-md'
                  : 'bg-[#081419] border-white/10 text-zinc-400 hover:text-white'
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-8 pb-20 px-6 max-w-[1240px] mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="p-6 rounded-2xl border border-white/10 bg-[#081419] hover:border-[#005459]/60 transition-all text-left space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono text-zinc-400">{item.type}</span>
                  <span className={`text-[10.5px] font-mono font-semibold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                  {item.name}
                </h3>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                <span className="flex items-center gap-1.5 text-[#00DF8F]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Fully Supported</span>
                </span>
                <Link to="/docs" className="hover:text-white transition-colors flex items-center gap-1">
                  <span>Docs</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

