import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Server,
  ArrowRightLeft,
  Terminal,
  Database,
  Globe,
  Users,
  Lock,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Check,
  ArrowRight,
  Play,
  Code2,
  RefreshCw,
  Home,
  KeyRound,
  Rocket,
  Sparkles,
  BookOpen,
  Shield,
  Handshake,
  Building2,
  Mail,
  CheckCircle2
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
import { useAuth } from '../context/AuthContext'

export function LandingPage() {
  const { isAuthenticated } = useAuth()

  // Interactive Live Simulator state
  const [activeSimTab, setActiveSimTab] = useState('pipeline')
  const [isDeployingSim, setIsDeployingSim] = useState(false)
  const [simLogs, setSimLogs] = useState([
    { time: '10:42:01', tag: 'WEBHOOK', color: 'text-sky-400', text: 'GitHub push event received: repo acme/storefront (branch: main, commit: 7c4e21d)' },
    { time: '10:42:02', tag: 'GUARD', color: 'text-amber-400', text: 'Preflight guardrails verified: 0 freeze windows, clean working directory' },
    { time: '10:42:03', tag: 'BUILD', color: 'text-teal-400', text: 'Vite production bundle compiled in 1.24s (2,018 modules transformed, 172 kB gzip)' },
    { time: '10:42:04', tag: 'MIGRATE', color: 'text-emerald-400', text: 'Prisma schema synchronized: 2 pending migrations applied safely' },
    { time: '10:42:05', tag: 'SWAP', color: 'text-purple-400', text: 'Atomic symlink swapped: /releases/20261112-142 -> /current (0ms downtime)' },
    { time: '10:42:06', tag: 'PROBE', color: 'text-emerald-400', text: 'HTTP 200 OK verified on https://storefront.acme.com across all workers.' }
  ])

  const runSimulatedDeploy = () => {
    if (isDeployingSim) return
    setIsDeployingSim(true)
    setSimLogs([
      { time: '10:43:00', tag: 'TRIGGER', color: 'text-sky-400', text: 'Manual deploy trigger dispatched: commit 8e3f1a2 by dev@portalops.online' }
    ])

    setTimeout(() => {
      setSimLogs(prev => [
        ...prev,
        { time: '10:43:01', tag: 'ISOLATION', color: 'text-amber-400', text: 'Assembling new release in /releases/20261112-143 without touching live traffic' }
      ])
    }, 600)

    setTimeout(() => {
      setSimLogs(prev => [
        ...prev,
        { time: '10:43:02', tag: 'BUILD', color: 'text-teal-400', text: 'npm ci --prefer-offline && npm run build completed cleanly in 1.1s' }
      ])
    }, 1200)

    setTimeout(() => {
      setSimLogs(prev => [
        ...prev,
        { time: '10:43:03', tag: 'MIGRATE', color: 'text-emerald-400', text: 'Database migrations verified. Zero schema drift.' }
      ])
    }, 1800)

    setTimeout(() => {
      setSimLogs(prev => [
        ...prev,
        { time: '10:43:04', tag: 'SWAP', color: 'text-purple-400', text: 'Atomic pointer pointed to /releases/20261112-143. 0 dropped packets.' },
        { time: '10:43:05', tag: 'HEALTH', color: 'text-emerald-400', text: 'Health probe passed: 200 OK. Auto-rollback guard disarmed.' }
      ])
      setIsDeployingSim(false)
    }, 2400)
  }

  // FAQ Accordion state
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index)
  }


  const featurePillars = [
    {
      icon: ArrowRightLeft,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      title: 'Zero-Downtime Atomic Symlinks',
      badge: '<1ms Swap',
      description: 'Each deployment builds inside a dedicated, timestamped directory. Once tests pass, the /current symlink swaps in less than 1 millisecond. If a build fails, live traffic stays untouched on the previous healthy release.'
    },
    {
      icon: Globe,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'Bring Your Own Server (BYOS)',
      badge: 'Zero Markup',
      description: 'Connect servers from Hetzner, DigitalOcean, AWS, Linode, or bare metal. Pay your provider wholesale prices directly without paying $250+/month PaaS memory or bandwidth markups.'
    },
    {
      icon: KeyRound,
      color: 'text-[#00DF8F] bg-[#00DF8F]/10 border-[#00DF8F]/20',
      title: 'Keyless Onboarding & Zero-Root Isolation',
      badge: 'Least Privilege',
      description: 'Connect via our 1-line setup script without ever sharing root credentials, or connect via direct SSH with AES-256-GCM envelope encryption. PortalOps operates under an isolated Linux user with scoped sudo permissions.'
    },
    {
      icon: Terminal,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      title: 'Automated Nginx, SSL & Daemons',
      badge: 'Full Automation',
      description: 'PortalOps provisions reverse proxies, auto-renewing Let\'s Encrypt SSL certificates, PM2 cluster managers, and Supervisor queue workers out of the box with zero manual config.'
    },
    {
      icon: Users,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      title: 'Multi-Tenant Client Workspaces',
      badge: 'Agency Ready',
      description: 'Organize servers and projects into isolated workspaces for each client or team. Assign granular RBAC permissions (Owner, Admin, Member, Deployer) with non-repudiable audit logs.'
    },
    {
      icon: Database,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      title: 'Database Migrations & Envs',
      badge: 'Encrypted Vault',
      description: 'Automate Prisma, Drizzle, and Laravel Artisan migrations on deploy. Manage environment variables with AES-256-GCM envelope encryption and preview environments.'
    }
  ]

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Connect Any Linux Server',
      desc: 'Provision a fresh Ubuntu or Debian VPS on Hetzner, DigitalOcean, or AWS, then run our 1-line setup command. PortalOps creates an isolated portalops system user with Ed25519 keys.',
      icon: Server,
      badge: '60 Seconds'
    },
    {
      step: '02',
      title: 'Configure Your Application Stack',
      desc: 'Select Node.js / PM2 (Next.js, Express, NestJS), PHP / Laravel, or Static SPA (Vite, React). PortalOps automatically sets up Nginx, auto-renewing Let\'s Encrypt SSL, and queue workers.',
      icon: Layers,
      badge: 'Zero Config'
    },
    {
      step: '03',
      title: 'Push to Deploy with Zero Downtime',
      desc: 'Push your code to GitHub, GitLab, or Bitbucket. Webhooks assemble the release in an isolated directory, run migrations, and atomically swap the /current symlink in <1ms.',
      icon: Rocket,
      badge: 'Atomic Swap'
    }
  ]

  const faqItems = [
    {
      q: 'How does PortalOps connect to my server? Do I have to share my root password?',
      a: 'No, it is completely optional. The recommended method is our 1-line bash setup script, which runs locally on your VPS to provision an isolated "portalops" system user with Ed25519 public keys—you never have to enter or transmit your root password to PortalOps. If you prefer direct SSH connections, PortalOps also supports direct key or password auth, protected by AES-256-GCM envelope encryption at rest.'
    },
    {
      q: 'Can I bring my existing servers from DigitalOcean, Hetzner, or AWS?',
      a: 'Yes, 100%! PortalOps is built around the "Bring Your Own Server" (BYOS) philosophy. Whether you run a $4/mo Hetzner VPS, a DigitalOcean Droplet, an AWS Lightsail instance, or a dedicated bare-metal machine, as long as it runs Ubuntu 20.04/22.04/24.04 or Debian 11/12, it works seamlessly.'
    },
    {
      q: 'What happens to my sites and applications if PortalOps goes offline?',
      a: 'Your apps and sites keep running 24/7 without missing a beat! Unlike proprietary PaaS platforms, PortalOps does not proxy your production web traffic. Your Nginx configs, PM2 daemons, Node.js/PHP processes, and database instances run natively on your VPS. If PortalOps goes offline, your visitors experience zero interruption.'
    },
    {
      q: 'How does the zero-downtime deployment mechanism work?',
      a: 'We use the industry-standard atomic symlink release pattern. Each build is assembled in an isolated directory (/releases/{timestamp}). Once dependencies install, assets compile, and database migrations pass, the /current symlink is atomically swapped in less than 1 millisecond. Visitors never see a broken page or half-uploaded assets.'
    },
    {
      q: 'Can I invite clients or coworkers without exposing other projects?',
      a: 'Yes! PortalOps includes built-in Multi-Tenant Workspace isolation. You can spin up a dedicated workspace for each client or team, invite their members with role-based permissions (Owner, Admin, Member, Deployer), and ensure they only see their assigned servers, deployments, and environment variables.'
    },
    {
      q: 'Do I need a credit card to use PortalOps?',
      a: 'No. PortalOps provides a self-sovereign control plane with zero credit card requirements. You only pay your chosen cloud provider directly for your VPS compute.'
    }
  ]

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-x-clip bg-[#061014] text-white selection:bg-[#00DF8F] selection:text-zinc-950">
      {/* Ambient Lighting Background */}
      <div
        className="absolute top-0 left-0 w-[800px] h-[700px] pointer-events-none blur-[140px] -z-10 opacity-70"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(0, 84, 89, 0.40) 0%, rgba(6, 16, 20, 0.20) 50%, transparent 80%)'
        }}
      />
      <div
        className="absolute top-0 right-0 w-[850px] h-[750px] pointer-events-none blur-[150px] -z-10 opacity-60"
        style={{
          background: 'radial-gradient(circle at 85% 35%, rgba(0, 223, 143, 0.18) 0%, rgba(0, 84, 89, 0.25) 55%, transparent 80%)'
        }}
      />
      <div
        className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] pointer-events-none blur-[180px] -z-10 opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(0, 223, 143, 0.16) 0%, rgba(0, 84, 89, 0.15) 50%, transparent 80%)'
        }}
      />

      {/* Global Navigation */}
      <PublicNav />

      {/* ============================================================== */}
      {/* 1. Hero Section: Split 2-Column with High First-Glance Clarity */}
      {/* ============================================================== */}
      <section className="pt-12 sm:pt-16 pb-16 px-6 md:px-12 max-w-[1320px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Clear Value Prop & CTAs */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-zinc-300 mb-6 backdrop-blur-xs select-none">
              <span className="w-2 h-2 rounded-full bg-[#00DF8F] animate-pulse" />
              <span className="font-semibold text-white">PortalOps BYOS Control Plane</span>
              <span className="text-zinc-500">•</span>
              <span className="text-teal-300 font-mono text-[11px]">Keyless Setup &amp; Zero-Root Isolation</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black tracking-tight text-white leading-[1.08] text-balance">
              The developer experience of Vercel.{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00DF8F] via-teal-300 to-sky-300">
                On your own cloud servers.
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3 text-[#005459]"
                  viewBox="0 0 250 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 14C50 4 150 2 247 11C210 16 120 18 3 14Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-zinc-400 text-base sm:text-lg leading-relaxed max-w-lg">
              Connect any VPS from Hetzner, DigitalOcean, AWS, or bare metal in 60 seconds. PortalOps automates Nginx reverse proxies, SSL certificates, PM2 daemons, and zero-downtime atomic symlinks with 0% compute markup.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="h-12 px-7 rounded-xl bg-[#00DF8F] hover:bg-[#00c57d] text-zinc-950 font-bold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-xl shadow-emerald-950/40 cursor-pointer"
              >
                <span>{isAuthenticated ? 'Open Console' : 'Start Deploying Free'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/docs"
                className="h-12 px-6 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/15 text-white font-medium text-sm inline-flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-teal-300" />
                <span>Documentation</span>
              </Link>

              <a
                href="#simulator"
                className="h-12 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-[#00DF8F]" />
                <span>Live Simulator</span>
              </a>
            </div>

            {/* Trust Subtext */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#00DF8F] shrink-0" />
                <span>100% BYOS Sovereignty</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#00DF8F] shrink-0" />
                <span>Internal Tools &amp; Hosting Ready</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#00DF8F] shrink-0" />
                <span>Zero Compute Markup</span>
              </div>
            </div>
          </div>

          {/* Right Column: High-Fidelity Interactive Mockup Card */}
          <div className="lg:col-span-6 relative">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#005459]/40 to-[#00DF8F]/25 blur-2xl opacity-75 -z-10" />

            <div className="rounded-2xl border border-white/15 bg-[#081419]/95 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden text-left relative">
              {/* Window Header */}
              <div className="px-4 py-3 bg-[#061014] border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>

                <div className="px-3 py-1 rounded-md bg-[#020608] border border-white/10 text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 mx-auto">
                  <Lock className="w-3 h-3 text-[#00DF8F]" />
                  <span>portalops.online/servers/stellar-phoenix</span>
                </div>

                <div className="w-10" />
              </div>

              {/* Window Body */}
              <div className="flex">
                <div className="w-12 bg-[#040B0E] border-r border-white/5 py-4 flex flex-col items-center gap-4 text-zinc-500 shrink-0">
                  <Home className="w-4 h-4 hover:text-zinc-300 transition-colors" />
                  <div className="w-7 h-7 rounded-md bg-[#005459]/40 text-[#00DF8F] flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                  <Database className="w-4 h-4 hover:text-zinc-300 transition-colors" />
                  <Shield className="w-4 h-4 hover:text-zinc-300 transition-colors" />
                  <Code2 className="w-4 h-4 hover:text-zinc-300 transition-colors" />
                </div>

                <div className="flex-1 p-5 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#005459]/30 border border-[#005459]/60 text-[#00DF8F] flex items-center justify-center shrink-0">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>stellar-phoenix</span>
                          <span className="text-[10px] font-mono text-teal-300 bg-teal-500/10 px-1.5 py-0.2 rounded">Hetzner Cloud</span>
                        </div>
                        <div className="text-xs text-zinc-400">
                          4 vCPU · 8GB RAM · Ubuntu 24.04 LTS · Frankfurt
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00DF8F]/10 border border-[#00DF8F]/25 text-[#00DF8F] text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00DF8F] animate-pulse" />
                      <span>Active</span>
                    </div>
                  </div>

                  {/* Telemetry Stats */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="p-2.5 rounded-lg bg-[#050D11] border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400 font-semibold">CPU</span>
                        <span className="text-white font-bold">18%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-400 rounded-full" style={{ width: '18%' }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#050D11] border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400 font-semibold">MEMORY</span>
                        <span className="text-white font-bold">34%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00DF8F] rounded-full" style={{ width: '34%' }} />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#050D11] border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400 font-semibold">DISK</span>
                        <span className="text-white font-bold">22%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-sky-400 rounded-full" style={{ width: '22%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Terminal Deploy Log */}
                  <div className="rounded-xl bg-[#040A0D] border border-white/10 p-3.5 font-mono text-[11px] text-zinc-300 space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-white/5 pb-2 mb-2">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Terminal className="w-3 h-3 text-[#00DF8F]" />
                        <span>deploy.log</span>
                      </div>
                      <span className="text-zinc-500">main · 8e3f1a2</span>
                    </div>

                    <div className="text-zinc-400">• git pull origin main (Vite 8.3)</div>
                    <div className="text-teal-400/90">✓ 8 files changed, 412 insertions(+)</div>
                    <div className="text-zinc-400">• npx prisma migrate deploy</div>
                    <div className="text-purple-400">• ln -sfn /releases/20261112-143 /current</div>
                    <div className="text-[#00DF8F] font-semibold pt-1 flex items-center gap-1.5">
                      <span>🚀 Atomic release live (&lt;1ms swap, 0 dropped packets)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating "Deployed in 38 seconds" Badge */}
            <div className="absolute -bottom-4 -left-3 sm:-left-6 z-20 bg-[#0A161D]/95 border border-[#005459]/50 rounded-xl p-3 shadow-2xl flex items-center gap-3 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-[#00DF8F]/20 border border-[#00DF8F]/30 flex items-center justify-center text-[#00DF8F] font-bold shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400 font-medium leading-none">Deployed in</div>
                <div className="text-sm font-bold text-white font-mono mt-1 leading-none">38 seconds</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. Supported Cloud Providers & Frameworks Strip */}
      {/* ============================================================== */}
      <section id="providers" className="py-12 border-y border-white/10 bg-[#040A0D]/70 select-none">
        <div className="max-w-[1240px] mx-auto px-6 text-center space-y-6">
          <p className="text-xs uppercase tracking-widest font-mono text-zinc-400 font-semibold">
            Seamlessly compatible with your preferred cloud infrastructure &amp; stacks
          </p>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 opacity-85 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2.5 font-semibold text-sm text-zinc-300">
              <HetznerLogo className="w-6 h-6" />
              <span>Hetzner Cloud</span>
            </div>
            <div className="flex items-center gap-2.5 font-semibold text-sm text-zinc-300">
              <DigitalOceanLogo className="w-6 h-6" />
              <span>DigitalOcean</span>
            </div>
            <div className="flex items-center gap-2.5 font-semibold text-sm text-zinc-300">
              <AmazonEC2Logo className="w-6 h-6" />
              <span>AWS EC2</span>
            </div>
            <div className="flex items-center gap-2.5 font-semibold text-sm text-zinc-300">
              <VultrLogo className="w-6 h-6" />
              <span>Vultr</span>
            </div>
            <div className="flex items-center gap-2.5 font-semibold text-sm text-zinc-300">
              <LinodeLogo className="w-6 h-6" />
              <span>Linode</span>
            </div>
            <div className="flex items-center gap-2.5 font-semibold text-sm text-zinc-300">
              <CustomServerLogo className="w-6 h-6" />
              <span>Bare Metal Linux</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-zinc-400">
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-teal-300">Node.js / PM2</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-rose-300">PHP / Laravel</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-emerald-300">Next.js &amp; Vite</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-sky-300">PostgreSQL</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-red-300">Redis</span>
            <span className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-purple-300">Docker</span>
          </div>
        </div>
      </section>


      {/* ============================================================== */}
      {/* 4. How It Works Section */}
      {/* ============================================================== */}
      <section id="how-it-works" className="py-20 px-6 max-w-[1240px] mx-auto w-full">
        <div className="text-center mb-14">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#00DF8F]">
            [ WORKFLOW BLUEPRINT ]
          </span>
          <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-tight text-white mt-1.5">
            How PortalOps Works in 3 Simple Steps
          </h2>
          <p className="mt-2 text-[14.5px] max-w-xl mx-auto text-zinc-400">
            From raw VPS to high-availability production application in under 2 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {howItWorksSteps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.step}
                className="p-6 sm:p-7 rounded-2xl border border-white/10 bg-[#081419] hover:border-[#005459]/60 transition-all text-left space-y-4 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-[#005459]/30 border border-[#005459]/60 flex items-center justify-center text-[#00DF8F]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-2xl font-black text-white/20 group-hover:text-[#00DF8F]/40 transition-colors">
                    {step.step}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-2">
                  <span className="inline-block text-[11px] font-mono font-semibold px-2.5 py-1 rounded bg-white/5 border border-white/10 text-teal-300">
                    {step.badge}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. Core Platform Features Grid */}
      {/* ============================================================== */}
      <section id="features" className="py-20 px-6 max-w-[1240px] mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#00DF8F]">
            [ BUILT FOR PRODUCTIVE DEVELOPERS ]
          </span>
          <h2 className="text-[30px] sm:text-[40px] font-extrabold tracking-tight text-white mt-1.5">
            Everything you need to ship and scale.
          </h2>
          <p className="mt-2 text-[14.5px] max-w-xl mx-auto text-zinc-400">
            Ditch fragile custom scripts and expensive PaaS tiers. PortalOps automates the DevOps heavy lifting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featurePillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl border border-white/10 bg-[#081419] hover:border-[#005459]/50 transition-all text-left space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${pillar.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-full bg-white/10 text-teal-300 font-semibold">
                    {pillar.badge}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/features"
            className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 hover:text-white transition-colors"
          >
            <span>Explore all architectural specifications</span>
            <ArrowRight className="w-4 h-4 text-[#00DF8F]" />
          </Link>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. Interactive Live Fleet & Deployment Simulator */}
      {/* ============================================================== */}
      <section id="simulator" className="py-20 px-6 max-w-[1240px] mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#00DF8F]">
            [ INTERACTIVE PLATFORM SIMULATOR ]
          </span>
          <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-tight text-white mt-1.5">
            Experience atomic zero-downtime releases live.
          </h2>
          <p className="mt-2 text-[14.5px] max-w-xl mx-auto text-zinc-400">
            Click simulate below to test preflight checks, isolated builds, atomic symlink pointer swaps, and automated rollback guards in real time.
          </p>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveSimTab('pipeline')}
            className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer border flex items-center gap-2 ${
              activeSimTab === 'pipeline'
                ? 'bg-[#005459]/40 border-teal-500/50 text-[#00DF8F]'
                : 'bg-[#081419] border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>1. Live Pipeline &amp; Logs</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSimTab('symlink')}
            className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer border flex items-center gap-2 ${
              activeSimTab === 'symlink'
                ? 'bg-[#005459]/40 border-teal-500/50 text-[#00DF8F]'
                : 'bg-[#081419] border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>2. Atomic Symlink Architecture</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSimTab('telemetry')}
            className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer border flex items-center gap-2 ${
              activeSimTab === 'telemetry'
                ? 'bg-[#005459]/40 border-teal-500/50 text-[#00DF8F]'
                : 'bg-[#081419] border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3. Host Telemetry &amp; Vitals</span>
          </button>
        </div>

        {/* Main Terminal Window */}
        <div className="w-full max-w-[1020px] mx-auto bg-[#050D11] border border-white/10 rounded-xl overflow-hidden shadow-2xl text-left font-mono text-[12px] text-zinc-300">
          <div className="h-[42px] px-4 bg-[#081419] border-b border-white/10 flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
              <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
              <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
              <span className="ml-2 text-[11.5px] text-zinc-400 font-medium">portalops-runner@hetzner-fsn1-01</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-zinc-400">STATUS: READY</span>
              <button
                type="button"
                onClick={runSimulatedDeploy}
                disabled={isDeployingSim}
                className="h-7 px-3 rounded bg-[#005459] hover:bg-[#004246] text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 border border-teal-500/30"
              >
                <Play className="w-3 h-3 fill-current text-[#00DF8F]" />
                <span>{isDeployingSim ? 'Deploying...' : 'Simulate Trigger'}</span>
              </button>
            </div>
          </div>

          <div className="p-6 min-h-[280px]">
            {activeSimTab === 'pipeline' && (
              <div className="space-y-2">
                {simLogs.map((log, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-zinc-600 select-none">{log.time}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border border-current/20 ${log.color}`}>
                      {log.tag}
                    </span>
                    <span className="text-zinc-300">{log.text}</span>
                  </div>
                ))}
                {isDeployingSim && (
                  <div className="flex items-center gap-2 text-[#00DF8F] pt-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing deployment pipeline hooks...</span>
                  </div>
                )}
              </div>
            )}

            {activeSimTab === 'symlink' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#081419] border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-[#00DF8F]" />
                    <span>Atomic Symlink Swap Pattern</span>
                  </div>
                  <p className="text-zinc-400 text-[11.5px] leading-relaxed">
                    Zero-downtime deploys work by assembling builds inside timestamped release folders. Only when all tests pass is the symlink swapped atomically in under 1 millisecond.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-white/10 bg-[#050D11]">
                    <div className="text-zinc-500 font-mono text-[10px]">STEP 1: ISOLATED BUILD</div>
                    <div className="font-bold text-white mt-1">Build Release</div>
                    <div className="text-zinc-400 text-[11px] mt-1">/releases/20261112-143</div>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-[#050D11]">
                    <div className="text-zinc-500 font-mono text-[10px]">STEP 2: ATOMIC SWAP</div>
                    <div className="font-bold text-[#00DF8F] mt-1">ln -sfn Pointer</div>
                    <div className="text-zinc-400 text-[11px] mt-1">Swaps to /current (&lt;1ms)</div>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-[#050D11]">
                    <div className="text-zinc-500 font-mono text-[10px]">STEP 3: ROLLBACK GUARD</div>
                    <div className="font-bold text-teal-400 mt-1">Instant Revert</div>
                    <div className="text-zinc-400 text-[11px] mt-1">Points back on 5xx error</div>
                  </div>
                </div>
              </div>
            )}

            {activeSimTab === 'telemetry' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#081419] border border-white/10">
                  <div className="text-xs text-zinc-400 font-semibold">CPU LOAD</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">18.4%</div>
                  <div className="text-[11px] text-[#00DF8F] mt-1">✓ Nominal across 4 cores</div>
                </div>
                <div className="p-4 rounded-lg bg-[#081419] border border-white/10">
                  <div className="text-xs text-zinc-400 font-semibold">MEMORY USAGE</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">2.1 / 8.0 GB</div>
                  <div className="text-[11px] text-[#00DF8F] mt-1">✓ 73% free RAM buffer</div>
                </div>
                <div className="p-4 rounded-lg bg-[#081419] border border-white/10">
                  <div className="text-xs text-zinc-400 font-semibold">DISK STORAGE</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">24.2 / 160 GB</div>
                  <div className="text-[11px] text-[#00DF8F] mt-1">✓ NVMe healthy · 135GB free</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. Partners & Collaboration Section */}
      {/* ============================================================== */}
      <section id="partners" className="py-20 px-6 max-w-[1240px] mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-teal-300 font-mono mb-3">
            <Handshake className="w-3.5 h-3.5 text-[#00DF8F]" />
            <span>PARTNERSHIPS, HOSTING &amp; INTERNAL TOOLING</span>
          </div>
          <h2 className="text-[30px] sm:text-[40px] font-extrabold tracking-tight text-white mt-1.5">
            Partner with PortalOps. Scale without limits.
          </h2>
          <p className="mt-2 text-[14.5px] max-w-2xl mx-auto text-zinc-400">
            Whether you are a hosting company wanting to offer a turnkey push-to-deploy PaaS to your customers, or an engineering team looking for a sovereign Internal Developer Platform for company tools — collaborate with PortalOps.
          </p>
        </div>

        {/* 3 Specialized Tracks Grid (3 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Track 1: Hosting & Cloud Infrastructure Companies */}
          <div className="p-7 sm:p-8 rounded-3xl border border-teal-500/30 bg-[#081419] hover:border-teal-400/60 transition-all text-left flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#005459]/40 border border-[#005459]/80 flex items-center justify-center text-[#00DF8F]">
                  <Server className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10.5px] px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-300 font-bold uppercase tracking-wider">
                  Hosting &amp; Cloud Partners
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">
                  Turnkey PaaS Layer for Hosting Providers
                </h3>
                <p className="text-xs sm:text-[13.5px] text-zinc-300 leading-relaxed">
                  Transform raw Ubuntu &amp; Debian VPS or Bare Metal instances into a modern Vercel-like push-to-deploy cloud. Eliminate customer churn to expensive PaaS vendors and increase server retention.
                </p>
              </div>

              <ul className="space-y-2.5 pt-3 border-t border-white/10 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>1-Click Marketplace Packaging:</strong> Distribute PortalOps as an official 1-click cloud image or automated cloud-init template for your VPS fleet.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Higher Customer Retention:</strong> Customers keep their servers active when automated SSL, Nginx, and zero-downtime releases work out of the box.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/contact?category=hosting-provider&subject=Hosting%20Company%20Partnership"
                className="w-full h-11 rounded-xl bg-[#005459] hover:bg-[#004246] border border-teal-500/30 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <span>Partner as Hosting Provider</span>
                <ArrowRight className="w-4 h-4 text-[#00DF8F]" />
              </Link>
            </div>
          </div>

          {/* Track 2: Companies & Teams (Internal Developer Platform - IDP) */}
          <div className="p-7 sm:p-8 rounded-3xl border border-[#00DF8F]/30 bg-gradient-to-b from-[#08171E] to-[#081419] shadow-xl text-left flex flex-col justify-between group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#00DF8F]/15 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#00DF8F]/20 border border-[#00DF8F]/40 flex items-center justify-center text-[#00DF8F]">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10.5px] px-3 py-1 rounded-full bg-[#00DF8F]/15 border border-[#00DF8F]/30 text-[#00DF8F] font-bold uppercase tracking-wider">
                  Enterprise &amp; Teams
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-[#00DF8F] transition-colors">
                  Internal Developer Platform (IDP for Companies)
                </h3>
                <p className="text-xs sm:text-[13.5px] text-zinc-200 leading-relaxed">
                  Adopt PortalOps as an internal deployment console for your company's internal tools, microservices, admin dashboards, and staging fleets on your own private cloud or on-prem servers.
                </p>
              </div>

              <ul className="space-y-2.5 pt-3 border-t border-white/10 text-xs text-zinc-200">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>100% Data Sovereignty:</strong> Run internal services inside private corporate VPCs or air-gapped subnets without public cloud exposure.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Zero Developer Root Keys:</strong> Engineering teams deploy safely via webhooks without ever needing SSH root credentials to internal hosts.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Eliminate Per-User Seat Taxes:</strong> Ditch $50+/seat/month public PaaS tiers. Deploy unlimited internal tools with zero compute markups.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/contact?category=internal-tools&subject=Internal%20Developer%20Platform%20Inquiry"
                className="w-full h-11 rounded-xl bg-[#00DF8F] hover:bg-[#00c57d] text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
              >
                <span>Adopt as Internal Tool (IDP)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Track 3: Developer Tools & Ecosystem Integrations */}
          <div className="p-7 sm:p-8 rounded-3xl border border-white/10 bg-[#081419] hover:border-sky-500/40 transition-all text-left flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="font-mono text-[10.5px] px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 font-semibold uppercase tracking-wider">
                  DevTools &amp; Open Source
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white group-hover:text-sky-300 transition-colors">
                  Developer Tooling &amp; Integrations
                </h3>
                <p className="text-xs sm:text-[13.5px] text-zinc-400 leading-relaxed">
                  Integrate your CI/CD runners, database engines, monitoring tools, or backup solutions natively into the PortalOps deployment hooks lifecycle.
                </p>
              </div>

              <ul className="space-y-2.5 pt-3 border-t border-white/5 text-xs text-zinc-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Deployment Lifecycle Webhooks:</strong> Trigger post-deploy health probes, Slack/Discord notifications, or cache flushes.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Preflight Hooks &amp; Smoke Tests:</strong> Automated test suites executed before the atomic symlink is swapped.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                  <span><strong>Integrations Hub Placement:</strong> Featured listing in the official PortalOps developer integrations registry.</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <Link
                to="/contact?category=partnership&subject=Ecosystem%20Integration%20Proposal"
                className="w-full h-11 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all group-hover:border-sky-400/40"
              >
                <span>Propose an Integration</span>
                <ArrowRight className="w-3.5 h-3.5 text-sky-400" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Direct Collaboration Box */}
        <div className="p-7 sm:p-9 rounded-3xl bg-[#040B0E] border border-white/15 flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-2xl">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-mono text-[#00DF8F]">
              <span className="w-2 h-2 rounded-full bg-[#00DF8F] animate-pulse" />
              <span>DIRECT EXECUTIVE &amp; PARTNERSHIP CHANNEL</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-white">
              Ready to partner or deploy PortalOps internally?
            </h4>
            <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed">
              Whether you manage a global hosting infrastructure fleet or need a secure internal deployment platform for company microservices, our partnership desk is ready to collaborate. Inquiries route directly to{' '}
              <a href="mailto:info@portalops.online" className="text-teal-300 font-mono underline hover:text-white">
                info@portalops.online
              </a>{' '}
              with a guaranteed reply within 24 business hours.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              to="/contact?category=hosting-provider&subject=Hosting%20and%20Internal%20Tools%20Partnership"
              className="h-11 px-6 rounded-xl bg-[#00DF8F] hover:bg-[#00c57d] text-zinc-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md shadow-emerald-950/40"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Partnerships Desk</span>
            </Link>

            <a
              href="mailto:info@portalops.online?subject=Partnership%20Inquiry%20-%20PortalOps"
              className="h-11 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white font-mono text-xs inline-flex items-center gap-1.5 transition-colors"
            >
              <span>info@portalops.online</span>
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. Developer FAQ Accordion */}
      {/* ============================================================== */}
      <section id="faq" className="py-20 px-6 max-w-[900px] mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#00DF8F]">
            [ FREQUENTLY ASKED QUESTIONS ]
          </span>
          <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-tight text-white mt-1.5">
            Answers to common developer questions.
          </h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index
            return (
              <div
                key={index}
                className="rounded-xl border border-white/10 bg-[#081419] transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="font-semibold text-[14.5px] text-zinc-100">
                    {item.q}
                  </span>
                  <div className="shrink-0 text-zinc-400">
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-[13.5px] leading-relaxed border-t border-white/5 pt-3 text-zinc-400">
                    {item.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. Bottom High-Impact Conversion Banner */}
      {/* ============================================================== */}
      <section className="py-20 px-6 max-w-[1240px] mx-auto w-full text-center">
        <div className="p-10 sm:p-16 rounded-3xl bg-gradient-to-b from-[#08171E] to-[#040A0D] border border-[#005459]/50 shadow-2xl relative overflow-hidden space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-[#00DF8F] font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Own Your Infrastructure</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white max-w-2xl mx-auto tracking-tight">
            Ready to take back control of your servers?
          </h2>

          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Connect your first Hetzner, DigitalOcean, or AWS VPS and ship your production app with zero downtime in under 2 minutes.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
            <Link
              to={isAuthenticated ? '/dashboard' : '/register'}
              className="h-12 px-8 rounded-xl bg-[#00DF8F] hover:bg-[#00c57d] text-zinc-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xl shadow-emerald-950/40 cursor-pointer"
            >
              <span>{isAuthenticated ? 'Go to Console' : 'Start Deploying Free'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/docs"
              className="h-12 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-semibold inline-flex items-center gap-2 transition-all"
            >
              <BookOpen className="w-4 h-4 text-teal-300" />
              <span>Read Quickstart Guide</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PublicFooter />
    </div>
  )
}
