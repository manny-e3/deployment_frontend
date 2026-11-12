import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightLeft,
  Server,
  KeyRound,
  Terminal,
  Users,
  Database,
  Shield,
  Layers,
  Cpu,
  Zap,
  Globe,
  Lock,
  ArrowRight,
  Check,
  CheckCircle2,
  Activity,
  FolderTree,
  RefreshCw,
  GitBranch,
  ShieldCheck,
  HardDrive,
  Building2
} from 'lucide-react'
import { PublicNav } from '../components/PublicNav'
import { PublicFooter } from '../components/PublicFooter'

export function FeaturesView() {
  const [activeTab, setActiveTab] = useState('atomic')

  const featureTabs = [
    { id: 'atomic', label: 'Zero-Downtime Engine', icon: ArrowRightLeft },
    { id: 'byos', label: 'BYOS Cloud Sovereignty', icon: Server },
    { id: 'security', label: 'Keyless & Zero-Root', icon: KeyRound },
    { id: 'proxy', label: 'Nginx & SSL Automation', icon: Terminal },
    { id: 'daemons', label: 'PM2 & Background Workers', icon: Cpu },
    { id: 'workspaces', label: 'Multi-Tenant Workspaces', icon: Users },
    { id: 'idp', label: 'Internal Developer Platform', icon: Building2 }
  ]

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-x-clip bg-[#061014] text-white selection:bg-[#00DF8F] selection:text-zinc-950">
      {/* Ambient Lighting */}
      <div
        className="absolute top-0 left-1/4 w-[900px] h-[650px] pointer-events-none blur-[150px] -z-10 opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(0, 84, 89, 0.40) 0%, rgba(6, 16, 20, 0.20) 60%, transparent 80%)'
        }}
      />
      <div
        className="absolute top-1/2 right-0 w-[700px] h-[550px] pointer-events-none blur-[140px] -z-10 opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(0, 223, 143, 0.20) 0%, transparent 70%)'
        }}
      />

      <PublicNav />

      {/* Header Hero */}
      <section className="pt-16 pb-12 px-6 md:px-12 max-w-[1240px] mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-teal-300 mb-6 backdrop-blur-xs select-none">
          <Zap className="w-3.5 h-3.5 text-[#00DF8F]" />
          <span>Engine Architecture &amp; Capabilities</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight">
          Engineered for developers who demand{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00DF8F] via-teal-300 to-sky-300">
            performance, privacy &amp; zero markup.
          </span>
        </h1>

        <p className="mt-6 text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          PortalOps bridges the gap between raw unmanaged cloud VPS instances and modern developer experience. Here is how our architecture works under the hood.
        </p>

        {/* Feature Tab Navigation */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto">
          {featureTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer border ${isActive
                    ? 'bg-[#005459] border-teal-500/50 text-white shadow-lg shadow-teal-950/40'
                    : 'bg-[#081419] border-white/10 text-zinc-400 hover:text-white hover:border-white/20'
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#00DF8F]' : 'text-zinc-400'}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Dynamic Tab Deep-Dive Content */}
      <section className="py-10 px-6 max-w-[1240px] mx-auto w-full">
        {activeTab === 'atomic' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#081419] border border-white/10 rounded-3xl p-8 sm:p-12 text-left">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#00DF8F] uppercase font-bold tracking-wider">
                <ArrowRightLeft className="w-4 h-4" />
                <span>Zero-Downtime Releases</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Atomic Symlinks: The End of 502 Bad Gateways
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Traditional deployments compile assets and install npm/composer packages directly in the live directory. If a build takes 45 seconds, your visitors experience broken pages or partial asset loads.
              </p>
              <div className="space-y-3 text-xs text-zinc-400">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Dedicated Release Folders:</strong> Builds execute in isolated timestamped directories (<code className="text-teal-300 font-mono">/releases/[timestamp]</code>).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Sub-Millisecond Pointer Swap:</strong> When build and health checks pass, Linux executes an atomic symlink swap: <code className="text-[#00DF8F] font-mono">ln -sfn /releases/new /current</code>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Automatic Build Quarantine:</strong> If tests, migrations, or builds fail, the active site is never touched. 0 dropped requests.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#040A0D] border border-white/10 font-mono text-xs text-zinc-300 space-y-3">
              <div className="text-zinc-500 border-b border-white/10 pb-2 flex items-center justify-between">
                <span>symlink-engine.sh</span>
                <span className="text-[#00DF8F] text-[11px]">ACTIVE SWAP</span>
              </div>
              <div className="text-zinc-400"># 1. Assembling Release in isolation</div>
              <div className="text-teal-300">$ git clone --depth 1 git@github.com:org/repo /releases/20261112-160</div>
              <div className="text-zinc-400"># 2. Build assets &amp; run migrations</div>
              <div className="text-teal-300">$ npm ci --prefer-offline &amp;&amp; npm run build</div>
              <div className="text-emerald-400">✓ 1,842 modules transformed (0 errors)</div>
              <div className="text-zinc-400"># 3. Atomic Symlink Swap (&lt;1ms)</div>
              <div className="text-purple-300">$ ln -sfn /releases/20261112-160 /var/www/site/current</div>
              <div className="text-[#00DF8F] font-bold pt-2">✓ Swapped seamlessly with 0 dropped HTTP packets.</div>
            </div>
          </div>
        )}

        {activeTab === 'byos' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#081419] border border-white/10 rounded-3xl p-8 sm:p-12 text-left">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">
                <Server className="w-4 h-4" />
                <span>Cloud Sovereignty</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Bring Your Own Server. Zero Compute Markup.
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Why pay $250+/month for 8GB of RAM on managed PaaS platforms when a top-tier Hetzner, DigitalOcean, or AWS VPS costs $10/month?
              </p>
              <div className="space-y-3 text-xs text-zinc-400">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>100% Direct Provider Billing:</strong> You pay your cloud provider directly. PortalOps takes zero commission on bandwidth, CPU, or storage.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Zero Outage Dependency:</strong> PortalOps does not proxy your production traffic. If PortalOps is undergoing maintenance, your sites stay 100% online.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Any Bare Metal or VPS:</strong> Compatible with Ubuntu and Debian across Hetzner, AWS, DigitalOcean, Linode, Vultr, and private hardware.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-[#040A0D] border border-white/10 space-y-2">
                <div className="text-xs text-zinc-400 font-mono">HETZNER CLOUD</div>
                <div className="text-2xl font-black text-white">€4.50 / mo</div>
                <div className="text-xs text-[#00DF8F]">4GB RAM · 2 vCPU · 20TB Transfer</div>
              </div>
              <div className="p-5 rounded-2xl bg-[#040A0D] border border-white/10 space-y-2">
                <div className="text-xs text-zinc-400 font-mono">TRADITIONAL PAAS</div>
                <div className="text-2xl font-black text-rose-400">$200+ / mo</div>
                <div className="text-xs text-zinc-500">Heavy bandwidth &amp; seat markups</div>
              </div>
              <div className="col-span-2 p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 leading-relaxed">
                💡 <strong>True Independence:</strong> You maintain full root access to your machine at all times.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#081419] border border-white/10 rounded-3xl p-8 sm:p-12 text-left">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#00DF8F] uppercase font-bold tracking-wider">
                <KeyRound className="w-4 h-4" />
                <span>Zero-Root Isolation &amp; Keyless Setup</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Keyless Onboarding &amp; Principle of Least Privilege
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PortalOps gives you total flexibility over server authentication. Under our recommended keyless setup, you run a 1-line script locally on your VPS without sharing or transmitting your root password. For teams connecting directly via SSH, credentials are encrypted with AES-256-GCM.
              </p>
              <div className="space-y-3 text-xs text-zinc-400">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Dedicated System User:</strong> The setup script creates an isolated <code className="text-teal-300 font-mono">portalops</code> Linux user with its own home directory.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Modern Ed25519 Cryptography:</strong> High-security elliptic curve SSH keys with strict directory permissions (0600 / 0700).</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Strictly Scoped Sudoers:</strong> The user can only reload Nginx, restart application PM2 daemons, and invoke certbot. It cannot alter system core files or read root directories.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>AES-256-GCM Direct SSH Option:</strong> Direct SSH credentials (passwords or private keys) are encrypted at rest with envelope encryption.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#040A0D] border border-white/10 font-mono text-xs text-zinc-300 space-y-3">
              <div className="text-zinc-500 border-b border-white/10 pb-2">/etc/sudoers.d/portalops (Principle of Least Privilege)</div>
              <div className="text-teal-300"># Scoped command execution without root escalation</div>
              <div className="text-zinc-300">portalops ALL=(ALL) NOPASSWD: \</div>
              <div className="pl-4 text-emerald-400">/usr/sbin/nginx -t, \</div>
              <div className="pl-4 text-emerald-400">/usr/sbin/service nginx reload, \</div>
              <div className="pl-4 text-emerald-400">/usr/bin/certbot, \</div>
              <div className="pl-4 text-emerald-400">/usr/bin/systemctl restart pm2-portalops</div>
              <div className="text-zinc-500 pt-2"># Root password prompt disabled · No arbitrary execution</div>
            </div>
          </div>
        )}

        {activeTab === 'proxy' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#081419] border border-white/10 rounded-3xl p-8 sm:p-12 text-left">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-400 uppercase font-bold tracking-wider">
                <Terminal className="w-4 h-4" />
                <span>Reverse Proxy &amp; SSL</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Automated Nginx, HTTP/2 &amp; Let's Encrypt SSL
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Writing manual Nginx virtual host configurations and renewing SSL certificates manually is error-prone. PortalOps automates the entire web server lifecycle.
              </p>
              <div className="space-y-3 text-xs text-zinc-400">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Automatic Let's Encrypt SSL:</strong> Requests, verifies HTTP-01 challenges, installs, and auto-renews certificates before expiration.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>WebSocket &amp; HTTP/2 Ready:</strong> Fully configured proxy headers (<code className="text-teal-300 font-mono">Upgrade</code>, <code className="text-teal-300 font-mono">Connection</code>, <code className="text-teal-300 font-mono">X-Forwarded-For</code>) out of the box.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Brotli &amp; Gzip Compression:</strong> High-performance static asset caching for lightning-fast PageSpeed scores.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#040A0D] border border-white/10 space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-white/10 pb-2">
                <span>Domain Status</span>
                <span className="text-[#00DF8F] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00DF8F] animate-pulse" />
                  SSL Active
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-300">
                  <span>Certificate Authority</span>
                  <span className="font-mono text-teal-300">Let's Encrypt (R3)</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Protocol</span>
                  <span className="font-mono text-teal-300">TLS 1.3 / HTTP/2</span>
                </div>
                <div className="flex justify-between text-zinc-300">
                  <span>Auto-Renewal</span>
                  <span className="font-mono text-[#00DF8F]">Enabled (60-day cron)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'daemons' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#081419] border border-white/10 rounded-3xl p-8 sm:p-12 text-left">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-teal-400 uppercase font-bold tracking-wider">
                <Cpu className="w-4 h-4" />
                <span>Daemon Management</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                PM2 Clusters, Systemd &amp; Background Workers
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Keep your Node.js, Express, Next.js, and background queue workers running 24/7 with automated restarts on server reboots or memory leaks.
              </p>
              <div className="space-y-3 text-xs text-zinc-400">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Zero-Downtime Process Reload:</strong> Signals PM2 with <code className="text-teal-300 font-mono">pm2 reload</code> to restart cluster workers sequentially without dropping a single active HTTP connection.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Supervisor &amp; Queue Daemons:</strong> Manage background queues (BullMQ, Celery, Laravel Horizon) with automatic restart policies.</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#040A0D] border border-white/10 font-mono text-xs text-zinc-300 space-y-3">
              <div className="flex justify-between text-zinc-500 border-b border-white/10 pb-2">
                <span>pm2 status</span>
                <span className="text-[#00DF8F]">ONLINE</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-teal-300">api-server (cluster 0)</span>
                  <span className="text-zinc-400">CPU: 2% · RAM: 48MB · 24d up</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-teal-300">api-server (cluster 1)</span>
                  <span className="text-zinc-400">CPU: 1% · RAM: 51MB · 24d up</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-300">queue-worker (daemon)</span>
                  <span className="text-zinc-400">CPU: 0% · RAM: 32MB · 24d up</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'idp' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-[#081419] border border-[#00DF8F]/30 rounded-3xl p-8 sm:p-12 text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00DF8F]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#00DF8F] uppercase font-bold tracking-wider">
                <Building2 className="w-4 h-4" />
                <span>Internal Developer Platform (IDP)</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Self-Sovereign Deployment for Company Internal Tools
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Empower internal engineering teams to ship internal dashboards, cron workers, staging fleets, and microservices on private corporate servers with zero root key exposure and zero per-seat SaaS taxes.
              </p>
              <div className="space-y-3 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Private Subnet &amp; VPN Support:</strong> Deploy internal services behind corporate VPNs or private VPC subnets with 100% data sovereignty.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Zero Developer Root Keys:</strong> Developers push code via Git webhooks without ever needing SSH root credentials to internal servers.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>No Per-Seat Multi-User Penalties:</strong> Public PaaS platforms charge $50+/seat/month for internal tool deployments. Run unlimited internal tools on your own hardware with 0% compute markup.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Immutable Rollback Safeguards:</strong> Prevent internal company operations or billing services from going down with 1-click automated rollbacks.</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/contact?category=internal-tools&subject=Internal%20Developer%20Platform%20Inquiry"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00DF8F] hover:bg-[#00c57d] text-zinc-950 font-bold text-xs transition-all shadow-md shadow-emerald-950/40"
                >
                  <span>Inquire About Company IDP Deployment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 rounded-2xl bg-[#040A0D] border border-white/10 space-y-4 font-mono text-xs">
              <div className="text-xs text-zinc-400 border-b border-white/10 pb-2 flex items-center justify-between">
                <span>Internal Deployment Security Matrix</span>
                <span className="text-[#00DF8F]">LEAST-PRIVILEGE</span>
              </div>
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-[#081419] border border-white/5 space-y-1">
                  <div className="flex justify-between text-white font-bold">
                    <span>Developer Access</span>
                    <span className="text-[#00DF8F]">Zero Root Exposure</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-sans">Developers deploy via webhooks; no direct SSH root credentials issued to team members.</div>
                </div>

                <div className="p-3 rounded-xl bg-[#081419] border border-white/5 space-y-1">
                  <div className="flex justify-between text-white font-bold">
                    <span>Data Governance</span>
                    <span className="text-teal-300">100% Private Cloud</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-sans">Secrets and internal tools run natively on your company-owned private VPC or on-prem servers.</div>
                </div>

                <div className="p-3 rounded-xl bg-[#081419] border border-white/5 space-y-1">
                  <div className="flex justify-between text-white font-bold">
                    <span>Multi-Department Workspaces</span>
                    <span className="text-indigo-300">RBAC Segregated</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 font-sans">Operations, Finance, Data Engineering, and Staging each operate in isolated workspaces.</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-6 max-w-[1240px] mx-auto w-full text-center">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-b from-[#08171E] to-[#040A0D] border border-[#005459]/40 space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Ready to experience zero-markup deployment?
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
            Connect your first VPS and ship your production app in under 2 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="h-11 px-6 rounded-lg bg-[#00DF8F] hover:bg-[#00c57d] text-zinc-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/docs"
              className="h-11 px-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold inline-flex items-center gap-2 transition-all"
            >
              <span>Read the Docs</span>
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}

