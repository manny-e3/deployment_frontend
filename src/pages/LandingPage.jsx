import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Server,
  ShieldCheck,
  ArrowRightLeft,
  Terminal,
  Cpu,
  Database,
  Globe,
  Zap,
  Users,
  Lock,
  ChevronDown,
  ChevronUp,
  Activity,
  Layers,
  Check,
  Copy,
  ArrowRight,
  CheckCircle2,
  Play,
  Sun,
  Moon,
  ExternalLink,
  Code2,
  RefreshCw,
  HardDrive,
  AlertTriangle,
  Sparkles,
  Settings,
  Shield,
  Home,
  Monitor,
  GitBranch,
  KeyRound,
  FileCode2,
  Rocket,
  Flame,
  CheckCheck,
  RotateCcw
} from 'lucide-react'
import {
  DigitalOceanLogo,
  HetznerLogo,
  VultrLogo,
  LinodeLogo,
  AmazonEC2Logo,
  CustomServerLogo,
  HostingerLogo,
} from '../components/ProviderLogos'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { PublicNav } from '../components/PublicNav'
import { PublicFooter } from '../components/PublicFooter'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  // 1-Line Setup Script copy state
  const [copiedCli, setCopiedCli] = useState(false)
  const cliCommand = 'curl -fsSL https://portalops.online/setup.sh | bash'

  const handleCopyCli = () => {
    navigator.clipboard?.writeText(cliCommand)
    setCopiedCli(true)
    setTimeout(() => setCopiedCli(false), 2200)
  }

  // Features Dropdown state
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false)

  // Interactive Live Simulator state
  const [activeSimTab, setActiveSimTab] = useState('pipeline') // 'pipeline' | 'symlink' | 'telemetry'
  const [isDeployingSim, setIsDeployingSim] = useState(false)
  const [simLogs, setSimLogs] = useState([
    { time: '10:42:01', tag: 'WEBHOOK', color: 'text-sky-400', text: 'GitHub push event received: repo acme/storefront (branch: main, commit: 7c4e21d)' },
    { time: '10:42:02', tag: 'GUARD', color: 'text-amber-400', text: 'Preflight guardrails verified: 0 freeze windows, clean working directory' },
    { time: '10:42:03', tag: 'BUILD', color: 'text-teal-400', text: 'Vite production bundle compiled in 1.24s (2,018 modules transformed, 172 kB gzip)' },
    { time: '10:42:04', tag: 'MIGRATE', color: 'text-emerald-400', text: 'Prisma schema synchronized: 2 pending migrations applied safely' },
    { time: '10:42:05', tag: 'SWAP', color: 'text-purple-400', text: 'Atomic symlink swapped: /releases/20261109-142 -> /current (0ms downtime)' },
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
        { time: '10:43:01', tag: 'ISOLATION', color: 'text-amber-400', text: 'Assembling new release in /releases/20261109-143 without touching live traffic' }
      ])
    }, 700)

    setTimeout(() => {
      setSimLogs(prev => [
        ...prev,
        { time: '10:43:02', tag: 'BUILD', color: 'text-teal-400', text: 'npm ci --prefer-offline && npm run build completed cleanly in 1.1s' }
      ])
    }, 1400)

    setTimeout(() => {
      setSimLogs(prev => [
        ...prev,
        { time: '10:43:03', tag: 'MIGRATE', color: 'text-emerald-400', text: 'Database migrations verified. Zero schema drift.' }
      ])
    }, 2100)

    setTimeout(() => {
      setSimLogs(prev => [
        ...prev,
        { time: '10:43:04', tag: 'SWAP', color: 'text-purple-400', text: 'Atomic pointer pointed to /releases/20261109-143. 0 dropped packets.' },
        { time: '10:43:05', tag: 'HEALTH', color: 'text-emerald-400', text: 'Health probe passed: 200 OK. Auto-rollback guard disarmed.' }
      ])
      setIsDeployingSim(false)
    }, 2800)
  }

  // FAQ Accordion Open/Closed state
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index)
  }

  const cloudProviders = [
    {
      name: 'Hetzner Cloud',
      price: 'from €3.79/mo',
      tag: 'Best Value',
      desc: 'Ultra-fast NVMe cloud instances across Germany, Finland, and US locations.',
      logo: HetznerLogo,
      accent: 'border-rose-500/30 group-hover:border-rose-500/60'
    },
    {
      name: 'DigitalOcean',
      price: 'from $4.00/mo',
      tag: 'Developer Favorite',
      desc: 'Fast SSD Droplets, floating IPs, and 1-click snapshot backups.',
      logo: DigitalOceanLogo,
      accent: 'border-blue-500/30 group-hover:border-blue-500/60'
    },
    {
      name: 'AWS Lightsail & EC2',
      price: 'from $3.50/mo',
      tag: 'Global Scale',
      desc: 'Enterprise reliability with VPC peering and elastic network interfaces.',
      logo: AmazonEC2Logo,
      accent: 'border-amber-500/30 group-hover:border-amber-500/60'
    },
    {
      name: 'Linode / Akamai',
      price: 'from $5.00/mo',
      tag: 'High Performance',
      desc: 'Predictable billing, generous bundled bandwidth, and native API controls.',
      logo: LinodeLogo,
      accent: 'border-emerald-500/30 group-hover:border-emerald-500/60'
    },
    {
      name: 'Vultr Cloud',
      price: 'from $3.50/mo',
      tag: 'Worldwide Edge',
      desc: '32+ cloud data centers worldwide with high-frequency compute instances.',
      logo: VultrLogo,
      accent: 'border-sky-500/30 group-hover:border-sky-500/60'
    },
    {
      name: 'Custom Bare Metal / VPS',
      price: 'Any Linux Server',
      tag: 'Zero Limits',
      desc: 'Any Ubuntu 20.04/22.04/24.04 or Debian 11/12 machine with standard SSH access.',
      logo: CustomServerLogo,
      accent: 'border-teal-500/30 group-hover:border-teal-500/60'
    }
  ]

  const featurePillars = [
    {
      icon: ArrowRightLeft,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      title: 'Zero-Downtime Atomic Symlinks',
      badge: '<1ms Swap',
      description: 'Each deployment builds inside a dedicated, timestamped directory. Once tests pass, the /current symlink swaps in less than 1 millisecond. If a build fails, traffic stays on the previous healthy release.'
    },
    {
      icon: Globe,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'Bring Your Own Server (BYOS)',
      badge: 'Zero Markup',
      description: 'Connect servers from DigitalOcean, Hetzner, AWS, Linode, or bare metal. Pay your provider wholesale prices without paying $250/mo PaaS bandwidth or memory markups.'
    },
    {
      icon: KeyRound,
      color: 'text-[#00DF8F] bg-[#00DF8F]/10 border-[#00DF8F]/20',
      title: 'Zero Root Password Storage',
      badge: 'Isolated User',
      description: 'A 1-line bash setup script provisions a restricted portalops Linux user with scoped sudo rights and unique Ed25519 keys. We never ask for or store your root password.'
    },
    {
      icon: Terminal,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      title: 'Automated Nginx, SSL & Daemons',
      badge: 'Full Automation',
      description: 'PortalOps provisions reverse proxies, auto-renewing Let\'s Encrypt SSL certificates, PM2 cluster managers, and Supervisor queue workers out of the box.'
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

  const comparisonRows = [
    {
      feature: 'Monthly Infrastructure Cost (4 vCPU / 8GB RAM)',
      paas: '$240 – $400 / mo',
      manual: '$10 – $14 / mo',
      portalops: '$10 VPS (0% Compute Markup)'
    },
    {
      feature: 'Bandwidth & Egress Markups',
      paas: 'Massive fees ($0.15 / GB)',
      manual: 'Included (20TB free on Hetzner/DO)',
      portalops: '100% Free (Direct provider transfer)'
    },
    {
      feature: 'Initial Server Setup Time',
      paas: 'Instant (Proprietary platform)',
      manual: '3 – 5 hours of manual SSH & Nginx',
      portalops: '60 seconds (1-line setup command)'
    },
    {
      feature: 'Zero-Downtime Atomic Symlinks',
      paas: 'Proprietary container rebuilds',
      manual: 'Fragile custom bash scripts',
      portalops: 'Native atomic directory pointer swap'
    },
    {
      feature: 'Server & Code Ownership',
      paas: 'Vendor locked into proprietary runtime',
      manual: '100% yours, but high maintenance',
      portalops: '100% your servers & your code'
    },
    {
      feature: 'Multi-Tenant Client & Agency Workspaces',
      paas: 'Expensive enterprise tier ($$$)',
      manual: 'None (everyone shares root SSH)',
      portalops: 'Included out of the box with RBAC'
    },
    {
      feature: 'SSH Key & Credential Security',
      paas: 'Black box runtime environment',
      manual: 'Root credentials exposed in scripts',
      portalops: 'Zero root keys · AES-256-GCM vault'
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
      desc: 'Select Node.js / PM2 (Next.js, Express, NestJS), PHP / Laravel, or Static SPA (Vite, React). PortalOps sets up Nginx, auto-renewing Let\'s Encrypt SSL, and queue workers.',
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
      a: 'Never. You run a single copy-paste bash setup command on your fresh VPS. It provisions a dedicated, restricted "portalops" system user with isolated permissions and places a unique Ed25519 SSH public key into authorized_keys. We never ask for your root password, and you can revoke access anytime by deleting the key.'
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
      q: 'Do I need a credit card or subscription to use PortalOps?',
      a: 'No. PortalOps provides a completely free, self-sovereign control plane with zero credit card requirements and zero hidden fees. You only pay your chosen cloud provider directly for your VPS compute.'
    }
  ]

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-[#061014] text-white selection:bg-[#00DF8F] selection:text-zinc-950">
      {/* Deep PortalOps Ambient Spotlights */}
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

      {/* 1. Global Navigation Bar */}
      <PublicNav />

      {/* ============================================================== */}
      {/* 2. Hero Section: Split 2-Column */}
      {/* ============================================================== */}
      <section className="pt-12 sm:pt-16 pb-20 px-6 md:px-12 max-w-[1320px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* LEFT COLUMN: Headline & CTA */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-zinc-300 mb-6 backdrop-blur-xs select-none">
              <span className="w-2 h-2 rounded-full bg-[#00DF8F] animate-pulse" />
              <span className="font-semibold text-white">PortalOps BYOS Control Plane</span>
              <span className="text-zinc-500">•</span>
              <span className="text-teal-300 font-mono text-[11px]">Zero Root Key Storage</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black tracking-tight text-white leading-[1.08] text-balance">
              Deploy sites &amp; servers on{' '}
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#00DF8F] via-teal-300 to-sky-300">
                your own cloud.
                {/* Curved Underline Swoosh */}
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
              Connect any VPS from Hetzner, DigitalOcean, AWS, or bare metal in 60 seconds. PortalOps automates Nginx, Let's Encrypt SSL, Node.js/PM2, Laravel, and zero-downtime atomic symlinks without storing your root password.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="h-12 px-6 rounded-lg bg-[#005459] hover:bg-[#004246] active:bg-[#003538] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-950/50 cursor-pointer border border-teal-500/20"
              >
                <span>Deploy your app now</span>
                <ArrowRight className="w-4 h-4 text-[#00DF8F]" />
              </Link>

              <a
                href="#simulator"
                className="h-12 px-6 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/15 text-white font-medium text-sm inline-flex items-center justify-center transition-all cursor-pointer"
              >
                <span>Live Deploy Simulator</span>
              </a>

              <Link
                to="/security"
                className="h-12 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
              >
                <Shield className="w-4 h-4 text-[#00DF8F]" />
                <span>Security Whitepaper</span>
              </Link>
            </div>

            {/* Trust Subtext */}
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-zinc-400 font-medium">
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#00DF8F] shrink-0" />
                <span>100% BYOS Server Sovereignty</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#00DF8F] shrink-0" />
                <span>Zero Root Passwords Stored</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-[#00DF8F] shrink-0" />
                <span>Zero PaaS Markups</span>
              </div>
            </div>

            {/* 1-Line Setup Script Box */}
            <div className="mt-7 flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-[#071319] border border-[#005459]/40 font-mono text-xs text-zinc-300 w-full max-w-[480px] shadow-inner">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[#00DF8F] font-bold">$</span>
                <span className="truncate">{cliCommand}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCli}
                className="px-2.5 py-1 rounded bg-[#005459]/40 hover:bg-[#005459]/70 text-[11px] font-sans font-medium text-teal-200 border border-teal-500/30 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                title="Copy 1-line script"
              >
                {copiedCli ? (
                  <>
                    <Check className="w-3 h-3 text-[#00DF8F]" />
                    <span className="text-[#00DF8F]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: macOS Mockup Window Card */}
          <div className="lg:col-span-6 relative">
            {/* Glow backing */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#005459]/30 to-[#00DF8F]/20 blur-xl opacity-75 -z-10" />

            {/* Window Card */}
            <div className="rounded-2xl border border-white/15 bg-[#081419]/95 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden text-left relative">
              {/* Window Title Bar */}
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

              {/* Window Body: Sidebar + Main Content */}
              <div className="flex">
                {/* Mini Sidebar */}
                <div className="w-12 bg-[#040B0E] border-r border-white/5 py-4 flex flex-col items-center gap-4 text-zinc-500 shrink-0">
                  <Home className="w-4 h-4 hover:text-zinc-300 transition-colors cursor-pointer" />
                  <div className="w-7 h-7 rounded-md bg-[#005459]/40 text-[#00DF8F] flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                  <Database className="w-4 h-4 hover:text-zinc-300 transition-colors cursor-pointer" />
                  <Shield className="w-4 h-4 hover:text-zinc-300 transition-colors cursor-pointer" />
                  <Code2 className="w-4 h-4 hover:text-zinc-300 transition-colors cursor-pointer" />
                  <Settings className="w-4 h-4 hover:text-zinc-300 transition-colors cursor-pointer" />
                </div>

                {/* Main Content Area */}
                <div className="flex-1 p-5 sm:p-6 space-y-4">
                  {/* Server Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#005459]/30 border border-[#005459]/60 text-[#00DF8F] flex items-center justify-center shrink-0">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>stellar-phoenix</span>
                        </div>
                        <div className="text-xs text-zinc-400">
                          Hetzner Cloud · 4 vCPU · Ubuntu 24.04 LTS · Frankfurt
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#00DF8F]/10 border border-[#00DF8F]/25 text-[#00DF8F] text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00DF8F] animate-pulse" />
                      <span>Active</span>
                    </div>
                  </div>

                  {/* Telemetry Stats Row */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* CPU */}
                    <div className="p-2.5 rounded-lg bg-[#050D11] border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400 font-semibold">CPU</span>
                        <span className="text-white font-bold">18%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-400 rounded-full" style={{ width: '18%' }} />
                      </div>
                    </div>

                    {/* MEMORY */}
                    <div className="p-2.5 rounded-lg bg-[#050D11] border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400 font-semibold">MEMORY</span>
                        <span className="text-white font-bold">34%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#00DF8F] rounded-full" style={{ width: '34%' }} />
                      </div>
                    </div>

                    {/* DISK */}
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

                    <div className="text-zinc-400">• git pull origin main</div>
                    <div className="text-teal-400/90">✓ 8 files changed, 412 insertions(+)</div>
                    <div className="text-zinc-400">• npm ci --prefer-offline</div>
                    <div className="text-zinc-400">• npm run build (Vite 8.3)</div>
                    <div className="text-zinc-400">• npx prisma migrate deploy</div>
                    <div className="text-purple-400">• ln -sfn /releases/20261109-143 /current</div>
                    <div className="text-[#00DF8F] font-semibold pt-1 flex items-center gap-1.5">
                      <span>🚀 Atomic release live (0ms downtime)</span>
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
      {/* 3. How It Works Section */}
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                  </div>
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
      {/* 4. Interactive Live Fleet & Deployment Simulator */}
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
            className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer border flex items-center gap-2 ${activeSimTab === 'pipeline'
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
            className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer border flex items-center gap-2 ${activeSimTab === 'symlink'
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
            className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer border flex items-center gap-2 ${activeSimTab === 'telemetry'
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
          {/* Terminal Title Bar */}
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

          {/* Terminal Content by Tab */}
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
                    <div className="text-zinc-400 text-[11px] mt-1">/releases/20261109-143</div>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-[#050D11]">
                    <div className="text-zinc-500 font-mono text-[10px]">STEP 2: ATOMIC SWAP</div>
                    <div className="font-bold text-[#00DF8F] mt-1">ln -sfn Pointer</div>
                    <div className="text-zinc-400 text-[11px] mt-1">Swaps to /current (&lt;1ms)</div>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-[#050D11]">
                    <div className="text-zinc-500 font-mono text-[10px]">STEP 3: AUTOMATED ROLLBACK</div>
                    <div className="font-bold text-teal-400 mt-1">Instant Revert</div>
                    <div className="text-zinc-400 text-[11px] mt-1">Points back on 500 error</div>
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
      {/* 5. Supported Cloud Providers & Zero Markup */}
      {/* ============================================================== */}
      <section id="providers" className="py-20 px-6 max-w-[1240px] mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#00DF8F]">
            [ BRING YOUR OWN SERVER ]
          </span>
          <h2 className="text-[30px] sm:text-[40px] font-extrabold tracking-tight text-white mt-1.5">
            Connect any cloud. Pay zero server markups.
          </h2>
          <p className="mt-2 text-[14.5px] max-w-xl mx-auto text-zinc-400">
            Use your existing cloud accounts. You pay the provider directly for your compute with zero middlemen markups.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cloudProviders.map((provider) => {
            const Logo = provider.logo
            return (
              <div
                key={provider.name}
                className={`p-6 rounded-2xl border bg-[#081419] transition-all text-left space-y-3 group ${provider.accent}`}
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-2">
                    <Logo className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-teal-300 font-semibold">
                    {provider.tag}
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center justify-between">
                    <span>{provider.name}</span>
                    <span className="text-xs font-mono text-zinc-400">{provider.price}</span>
                  </h3>
                  <p className="mt-2 text-xs sm:text-[13px] text-zinc-400 leading-relaxed">
                    {provider.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* BYOS Setup Box Callout */}
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-[#005459]/20 via-[#081419] to-[#005459]/20 border border-[#005459]/40 flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="space-y-1">
            <div className="font-bold text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00DF8F]" />
              <span>Connect in 60 seconds with our automated setup script</span>
            </div>
            <div className="text-xs text-zinc-400">
              Run a single command on your fresh Ubuntu or Debian VPS to link it securely to your PortalOps console.
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/servers/create"
              className="h-10 px-5 rounded-lg bg-[#005459] hover:bg-[#004246] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors border border-teal-500/30"
            >
              <span>Provision a Server</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00DF8F]" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. Core Platform Features Grid */}
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



      {/* 10. Comprehensive Developer Footer */}
      <PublicFooter />
    </div>
  )
}
