import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Terminal,
  Server,
  Shield,
  Layers,
  Cpu,
  ArrowRight,
  Check,
  Copy,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Database,
  Code2,
  FolderTree,
  ExternalLink,
  ChevronRight,
  Zap
} from 'lucide-react'
import { PublicNav } from '../components/PublicNav'
import { PublicFooter } from '../components/PublicFooter'

export function DocsView() {
  const [activeDocSection, setActiveDocSection] = useState('quickstart')
  const [copiedSnippet, setCopiedSnippet] = useState(null)

  const handleCopy = (text, id) => {
    navigator.clipboard?.writeText(text)
    setCopiedSnippet(id)
    setTimeout(() => setCopiedSnippet(null), 2000)
  }

  const docNavItems = [
    { id: 'quickstart', label: '1. 5-Minute Quickstart', icon: Terminal },
    { id: 'requirements', label: '2. Server & OS Requirements', icon: Server },
    { id: 'agent-script', label: '3. Setup Script & Ed25519 Keys', icon: Shield },
    { id: 'firewall', label: '4. Firewall & Port Rules', icon: Cpu },
    { id: 'symlink-structure', label: '5. Atomic Symlink Architecture', icon: FolderTree },
    { id: 'stacks', label: '6. Supported Application Stacks', icon: Layers },
    { id: 'env-secrets', label: '7. Env Secrets & DB Migrations', icon: Database },
    { id: 'troubleshooting', label: '8. Rollbacks & Troubleshooting', icon: RotateCcw }
  ]

  const scrollTo = (id) => {
    setActiveDocSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-x-clip bg-[#061014] text-white selection:bg-[#00DF8F] selection:text-zinc-950">
      {/* Ambient Glows */}
      <div
        className="absolute top-0 left-0 w-[800px] h-[600px] pointer-events-none blur-[140px] -z-10 opacity-60"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(0, 84, 89, 0.35) 0%, rgba(6, 16, 20, 0.20) 50%, transparent 80%)'
        }}
      />
      <div
        className="absolute top-1/3 right-0 w-[800px] h-[600px] pointer-events-none blur-[150px] -z-10 opacity-40"
        style={{
          background: 'radial-gradient(circle at 80% 30%, rgba(0, 223, 143, 0.15) 0%, transparent 70%)'
        }}
      />

      {/* Global Navigation */}
      <PublicNav />

      {/* Header Banner */}
      <div className="border-b border-white/10 bg-[#071319]/80 backdrop-blur-md py-12 px-6 md:px-12">
        <div className="max-w-[1240px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 text-left">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-teal-300 mb-3">
              <BookOpen className="w-3.5 h-3.5 text-[#00DF8F]" />
              <span>PortalOps Documentation</span>
              <span className="text-zinc-500">•</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Developer Quickstart &amp; Reference Guide
            </h1>
            <p className="mt-2 text-zinc-400 text-sm sm:text-base max-w-2xl leading-relaxed">
              Step-by-step guides for connecting your own servers, running atomic zero-downtime releases, configuring Nginx reverse proxies, and securing production environments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/register"
              className="h-10 px-5 rounded-lg bg-[#005459] hover:bg-[#004246] text-white text-xs font-semibold inline-flex items-center gap-2 transition-all shadow-md border border-teal-500/30"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00DF8F]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Documentation Body */}
      <div className="max-w-[1240px] mx-auto w-full px-6 md:px-12 py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Sticky Sidebar Nav */}
          <aside className="lg:col-span-3">
            <div className="sticky top-28 space-y-1 bg-[#081419] p-3 rounded-2xl border border-white/10 text-left">
              <div className="px-3 py-2 text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold">
                Table of Contents
              </div>
              {docNavItems.map((item) => {
                const Icon = item.icon
                const isActive = activeDocSection === item.id
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollTo(item.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${isActive
                      ? 'bg-[#005459]/40 text-[#00DF8F] font-semibold border border-teal-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                )
              })}

              <div className="pt-4 mt-3 border-t border-white/10 px-3 pb-1">
                <Link
                  to="/security"
                  className="text-xs text-teal-300 hover:text-white flex items-center justify-between group"
                >
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-[#00DF8F]" />
                    <span>Security Whitepaper</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </aside>

          {/* Right Content Area */}
          <main className="lg:col-span-9 space-y-16 text-left">

            {/* Section 1: Quickstart */}
            <section id="quickstart" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00DF8F] uppercase tracking-wider font-semibold">
                <Terminal className="w-4 h-4" />
                <span>Section 1</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                5-Minute Quickstart Guide
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PortalOps operates as an out-of-band management control plane. Your actual production traffic flows directly to your VPS; PortalOps merely connects via encrypted SSH to provision services, run tests, and perform zero-downtime symlink swaps.
              </p>

              <div className="space-y-4 pt-2">
                <div className="p-5 rounded-2xl bg-[#081419] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005459] text-[#00DF8F] flex items-center justify-center text-xs font-mono">1</span>
                      <span>Spin up a clean VPS</span>
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400">Hetzner / DO / AWS / Linode</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Provision an instance running <strong className="text-white">Ubuntu 24.04 LTS</strong> or <strong className="text-white">Debian 12</strong>. Even a $4/mo Hetzner or $6/mo DigitalOcean droplet is capable of hosting multiple production apps with zero issues.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#081419] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005459] text-[#00DF8F] flex items-center justify-center text-xs font-mono">2</span>
                      <span>Run the 1-Line Setup Script on your server</span>
                    </span>
                    <span className="text-[11px] font-mono text-[#00DF8F]">Zero Root Storage</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    SSH into your server once as root, and execute the initialization script. It provisions an unprivileged <code className="text-teal-300 bg-white/5 px-1 py-0.5 rounded font-mono">portalops</code> system user, places a unique Ed25519 key, and installs essential base dependencies (git, curl, ufw).
                  </p>

                  <div className="relative mt-2 p-3.5 rounded-xl bg-[#040A0D] border border-white/10 font-mono text-xs text-teal-300 flex items-center justify-between">
                    <span className="truncate pr-4">$ curl -fsSL https://portalops.online/setup.sh | bash</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('curl -fsSL https://portalops.online/setup.sh | bash', 'setup')}
                      className="px-2.5 py-1 rounded bg-[#005459]/40 hover:bg-[#005459] text-white text-[11px] font-sans flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      {copiedSnippet === 'setup' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#00DF8F]" />
                          <span className="text-[#00DF8F]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#081419] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#005459] text-[#00DF8F] flex items-center justify-center text-xs font-mono">3</span>
                      <span>Connect your Git repository &amp; push</span>
                    </span>
                    <span className="text-[11px] font-mono text-teal-300">&lt;1ms Atomic Swap</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Paste your repository URL (GitHub / GitLab / Bitbucket), specify your branch (<code className="text-teal-300 bg-white/5 px-1 py-0.5 rounded font-mono">main</code>), and choose your stack. Every subsequent <code className="text-teal-300 bg-white/5 px-1 py-0.5 rounded font-mono">git push</code> will trigger an isolated build and atomic swap.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2: Requirements */}
            <section id="requirements" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00DF8F] uppercase tracking-wider font-semibold">
                <Server className="w-4 h-4" />
                <span>Section 2</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Server &amp; Operating System Requirements
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PortalOps is designed to work with virtually any modern Linux distribution with zero proprietary vendor lock-in.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#081419] border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00DF8F]" />
                    <span>Supported Linux Distributions</span>
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                    <li>Ubuntu 24.04 LTS (Noble Numbat) — Recommended</li>
                    <li>Ubuntu 22.04 LTS (Jammy Jellyfish)</li>
                    <li>Ubuntu 20.04 LTS (Focal Fossa)</li>
                    <li>Debian 12 (Bookworm) &amp; Debian 11 (Bullseye)</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-[#081419] border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#00DF8F]" />
                    <span>Minimum Hardware Footprint</span>
                  </div>
                  <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                    <li>CPU: 1 vCPU (x86_64 or ARM64)</li>
                    <li>RAM: 1 GB (2 GB+ recommended for Node.js builds)</li>
                    <li>Storage: 10 GB SSD / NVMe</li>
                    <li>Network: Static public IPv4 or dual-stack IPv4/IPv6</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section 3: Setup Script & Ed25519 */}
            <section id="agent-script" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00DF8F] uppercase tracking-wider font-semibold">
                <Shield className="w-4 h-4" />
                <span>Section 3</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Setup Script &amp; Ed25519 Key Management
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Under the recommended keyless 1-line script, <strong className="text-white">PortalOps never requests, stores, or handles your root password</strong>. The setup script runs directly on your VPS to configure an isolated <code className="text-teal-300 bg-white/5 px-1 py-0.5 rounded font-mono">portalops</code> user adhering to the principle of least privilege. For teams opting for direct SSH connection, credentials are protected by AES-256-GCM envelope encryption.
              </p>

              <div className="p-5 rounded-2xl bg-[#081419] border border-white/10 space-y-3 font-mono text-xs">
                <div className="text-zinc-400 text-xs font-sans pb-1">
                  What happens when the script runs on your machine:
                </div>
                <div className="space-y-2 text-zinc-300">
                  <div className="flex items-start gap-2">
                    <span className="text-[#00DF8F]">1.</span>
                    <span>Creates system group and user: <code className="text-teal-300 bg-white/5 px-1">useradd -m -s /bin/bash portalops</code></span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#00DF8F]">2.</span>
                    <span>Generates isolated SSH directory: <code className="text-teal-300 bg-white/5 px-1">/home/portalops/.ssh/authorized_keys</code> with strict 0600 permissions</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#00DF8F]">3.</span>
                    <span>Adds dedicated Ed25519 public key authorized exclusively for deployment jobs</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#00DF8F]">4.</span>
                    <span>Configures scoped sudoers file in <code className="text-teal-300 bg-white/5 px-1">/etc/sudoers.d/portalops</code> strictly limited to Nginx reload, systemctl restart, and certbot</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: Firewall */}
            <section id="firewall" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00DF8F] uppercase tracking-wider font-semibold">
                <Cpu className="w-4 h-4" />
                <span>Section 4</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Firewall &amp; Port Requirements
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Ensure your cloud provider firewall (or UFW on the machine) allows incoming traffic on these three primary ports:
              </p>

              <div className="overflow-x-auto rounded-xl border border-white/10">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#040A0D] text-zinc-400 font-mono text-[11px] border-b border-white/10">
                    <tr>
                      <th className="py-3 px-4">Port</th>
                      <th className="py-3 px-4">Protocol</th>
                      <th className="py-3 px-4">Purpose</th>
                      <th className="py-3 px-4">Access Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono text-zinc-300">
                    <tr>
                      <td className="py-3 px-4 font-bold text-teal-300">22 / TCP</td>
                      <td className="py-3 px-4">SSH</td>
                      <td className="py-3 px-4 font-sans">Automated deployment scripts &amp; commands</td>
                      <td className="py-3 px-4 text-[#00DF8F]">Key-authenticated only</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-teal-300">80 / TCP</td>
                      <td className="py-3 px-4">HTTP</td>
                      <td className="py-3 px-4 font-sans">Web traffic &amp; Let's Encrypt ACME verification</td>
                      <td className="py-3 px-4 text-emerald-400">Public</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4 font-bold text-teal-300">443 / TCP</td>
                      <td className="py-3 px-4">HTTPS</td>
                      <td className="py-3 px-4 font-sans">Encrypted TLS production application traffic</td>
                      <td className="py-3 px-4 text-emerald-400">Public</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5: Atomic Symlink Architecture */}
            <section id="symlink-structure" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00DF8F] uppercase tracking-wider font-semibold">
                <FolderTree className="w-4 h-4" />
                <span>Section 5</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Atomic Symlink Directory Architecture
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                PortalOps achieves true zero-downtime releases by never building or installing dependencies inside the active webroot. Instead, we use timestamped release directories and atomic symlink swaps:
              </p>

              <div className="p-5 rounded-2xl bg-[#040A0D] border border-white/10 font-mono text-xs text-zinc-300 space-y-2">
                <div className="text-zinc-500">/var/www/my-storefront/</div>
                <div className="pl-4 text-teal-300">├── current -&gt; /var/www/my-storefront/releases/20261112-154 <span className="text-zinc-500">(active symlink pointer)</span></div>
                <div className="pl-4 text-zinc-300">├── releases/</div>
                <div className="pl-8 text-zinc-400">├── 20261112-152/ <span className="text-zinc-500">(previous release)</span></div>
                <div className="pl-8 text-zinc-400">├── 20261112-153/ <span className="text-zinc-500">(rollback standby)</span></div>
                <div className="pl-8 text-[#00DF8F]">└── 20261112-154/ <span className="text-zinc-500">(currently live)</span></div>
                <div className="pl-4 text-zinc-300">├── shared/</div>
                <div className="pl-8 text-amber-300">├── .env <span className="text-zinc-500">(encrypted symlinked environment)</span></div>
                <div className="pl-8 text-zinc-400">└── storage/ <span className="text-zinc-500">(persistent uploads &amp; media)</span></div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                When a new deployment finishes compiling and health probes pass, the command <code className="text-[#00DF8F] bg-white/5 px-1 py-0.5 rounded font-mono">ln -sfn /var/www/app/releases/[new] /var/www/app/current</code> executes atomically in less than 1 millisecond. If anything fails before that step, the active release is never touched.
              </p>
            </section>

            {/* Section 6: Supported Stacks */}
            <section id="stacks" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00DF8F] uppercase tracking-wider font-semibold">
                <Layers className="w-4 h-4" />
                <span>Section 6</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Supported Application Stacks &amp; Frameworks
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#081419] border border-white/10 space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-teal-400" />
                    <span>Node.js / PM2 Ecosystem</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Native support for Next.js (SSR &amp; Standalone), Express, NestJS, Remix, Nuxt, and Fastify. Managed under PM2 cluster mode with automatic core-count balancing.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#081419] border border-white/10 space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>PHP &amp; Laravel Ecosystem</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    PHP 8.2 &amp; 8.3 FPM, Composer optimization, Laravel Artisan queue workers supervised via systemd, and automatic OPcache invalidation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#081419] border border-white/10 space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>Static Single Page Apps (SPA)</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Vite, React, Vue, Svelte, Astro, and plain HTML. Nginx serves pre-compressed Brotli/Gzip assets with aggressive client-side caching headers.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#081419] border border-white/10 space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Database className="w-4 h-4 text-sky-400" />
                    <span>Databases &amp; Daemons</span>
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    One-click installation and management for PostgreSQL 16, MySQL 8.0, and Redis cache daemons with password authentication and auto-restart policies.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7: Secret Vault & Migrations */}
            <section id="env-secrets" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00DF8F] uppercase tracking-wider font-semibold">
                <Database className="w-4 h-4" />
                <span>Section 7</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Environment Variables &amp; Database Migrations
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                Environment secrets are stored in PortalOps using <strong className="text-white">AES-256-GCM envelope encryption</strong>. During deployment, the variables are securely injected into <code className="text-teal-300 bg-white/5 px-1 py-0.5 rounded font-mono">shared/.env</code> on your server.
              </p>
              <div className="p-4 rounded-xl bg-[#081419] border border-white/10 space-y-2 text-xs text-zinc-400">
                <div className="font-semibold text-white">Automated Database Migration Hooks:</div>
                <p>
                  You can specify migration commands that execute strictly after dependencies build, but <em>before</em> the symlink swap. If the migration fails, the deploy halts, and traffic stays on the previous stable release.
                </p>
                <div className="font-mono text-teal-300 bg-[#040A0D] p-2.5 rounded-lg border border-white/5">
                  # Node (Prisma)<br />
                  npx prisma migrate deploy<br /><br />
                  # PHP (Laravel)<br />
                  php artisan migrate --force
                </div>
              </div>
            </section>

            {/* Section 8: Troubleshooting & Rollbacks */}
            <section id="troubleshooting" className="space-y-4 scroll-mt-28">
              <div className="flex items-center gap-2 text-xs font-mono text-[#00DF8F] uppercase tracking-wider font-semibold">
                <RotateCcw className="w-4 h-4" />
                <span>Section 8</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Instant Rollbacks &amp; Troubleshooting
              </h2>
              <p className="text-sm text-zinc-300 leading-relaxed">
                If a deployment passes preflight checks but causes runtime errors in production, you can trigger an instant rollback directly from the PortalOps Console:
              </p>

              <div className="p-5 rounded-2xl bg-[#081419] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <RotateCcw className="w-4 h-4 text-[#00DF8F]" />
                  <span>1-Click Symlink Rollback (&lt;100ms)</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  PortalOps keeps the last 5 successful releases preserved on your server. Clicking <strong className="text-white">Rollback</strong> simply points the <code className="text-teal-300 bg-white/5 px-1 font-mono">/current</code> symlink back to the prior release folder and signals PM2 or Nginx to reload. Zero rebuild required.
                </p>
              </div>
            </section>

          </main>
        </div>
      </div>

      {/* Footer */}
      <PublicFooter />
    </div>
  )
}

