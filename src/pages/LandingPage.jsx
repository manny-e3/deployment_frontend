import { useState, useEffect } from 'react'
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
  Monitor
} from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
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
  const [simStep, setSimStep] = useState(4) // 1..4
  const [simLogs, setSimLogs] = useState([
    { time: '10:42:01', tag: 'INFO', color: 'text-sky-400', text: 'Webhook received from github.com/acme/storefront (branch: main)' },
    { time: '10:42:02', tag: 'CHECK', color: 'text-amber-400', text: 'Preflight guardrails verified: 0 freeze windows, branch main approved' },
    { time: '10:42:03', tag: 'BUILD', color: 'text-emerald-400', text: 'Vite production bundle compiled in 1.38s (38 modules, 172kB)' },
    { time: '10:42:04', tag: 'SWAP', color: 'text-purple-400', text: 'Atomic symlink swapped: /releases/20261108-142 -> /current (0ms downtime)' },
    { time: '10:42:05', tag: 'PROBE', color: 'text-teal-400', text: 'HTTP 200 OK verified across all worker nodes. Auto-rollback armed.' }
  ])

  const runSimulatedDeploy = () => {
    if (isDeployingSim) return
    setIsDeployingSim(true)
    setSimStep(1)
    setSimLogs([
      { time: '10:43:00', tag: 'TRIGGER', color: 'text-sky-400', text: 'Manual release trigger dispatched: commit 8e3f1a2 by dev@acme.inc' }
    ])

    setTimeout(() => {
      setSimStep(2)
      setSimLogs(prev => [
        ...prev,
        { time: '10:43:01', tag: 'GUARD', color: 'text-amber-400', text: 'Policy engine: tests passing (48/48), no security advisories' }
      ])
    }, 900)

    setTimeout(() => {
      setSimStep(3)
      setSimLogs(prev => [
        ...prev,
        { time: '10:43:02', tag: 'BUILD', color: 'text-emerald-400', text: 'Docker multi-stage build finished in 1.1s. Assets cached.' }
      ])
    }, 1800)

    setTimeout(() => {
      setSimStep(4)
      setSimLogs(prev => [
        ...prev,
        { time: '10:43:03', tag: 'SWAP', color: 'text-purple-400', text: 'Atomic pointer pointed to /releases/20261108-143. 0 dropped packets.' },
        { time: '10:43:04', tag: 'LIVE', color: 'text-teal-400', text: 'Release verified live. Active traffic served seamlessly.' }
      ])
      setIsDeployingSim(false)
    }, 2700)
  }

  // FAQ Accordion Open/Closed state
  const [openFaqIndex, setOpenFaqIndex] = useState(0)
  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? -1 : index)
  }

  const cloudProviders = [
    { name: 'Hetzner Cloud', price: 'from €3.79/mo', tag: 'Best Value', desc: 'Ultra-low latency EU & US NVMe cloud instances' },
    { name: 'DigitalOcean', price: 'from $4.00/mo', tag: 'Developer Favorite', desc: 'Fast SSD Droplets & 1-click snapshot capabilities' },
    { name: 'AWS Lightsail & EC2', price: 'from $3.50/mo', tag: 'Global Scale', desc: 'Enterprise reliability with VPC & route table flexibility' },
    { name: 'Linode / Akamai', price: 'from $5.00/mo', tag: 'High Performance', desc: 'Predictable pricing & native CLI automation' },
    { name: 'Vultr Cloud', price: 'from $3.50/mo', tag: 'Worldwide Edge', desc: '32+ cloud locations with fractional GPU & NVMe' },
    { name: 'Custom Bare Metal', price: 'Any Linux Server', tag: 'Zero Limits', desc: 'Any Ubuntu or Debian machine with SSH access' }
  ]

  const featurePillars = [
    {
      icon: ArrowRightLeft,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      title: 'Zero-Downtime Atomic Symlinks',
      badge: '<1ms Swap',
      description: 'Deploy code with nanosecond symlink directory pointer swaps. If a build throws an error, automated rollbacks switch pointers back instantly without dropping active websocket or HTTP traffic.'
    },
    {
      icon: Globe,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/20',
      title: 'Bring Your Own Server (BYOS)',
      badge: 'Zero Markup',
      description: 'Connect servers from DigitalOcean, Hetzner, AWS, Linode, or bare metal. Keep 100% of your provider resources without paying $250/mo PaaS bandwidth markups.'
    },
    {
      icon: ShieldCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      title: 'Zero Root Password Storage',
      badge: 'Ed25519 Keys',
      description: 'A 1-line bash setup script creates a dedicated, locked-down portalops system user with restricted sudo rights. We never ask for your root password or expose private keys.'
    },
    {
      icon: Terminal,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
      title: 'Automated Nginx, SSL & Daemons',
      badge: 'Full Automation',
      description: 'PortalOps provisions reverse proxies, Let\'s Encrypt auto-renewing SSL certificates, and PM2 process daemons. Every deployment target is optimized right out of the box.'
    },
    {
      icon: Users,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      title: 'Multi-Tenant Client Workspaces',
      badge: 'Agency Ready',
      description: 'Group servers and projects into isolated workspaces for each client or team. Assign fine-grained RBAC permissions so stakeholders only see their own deployment targets.'
    },
    {
      icon: Activity,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      title: 'Real-Time Telemetry & Alerts',
      badge: 'Multi-Channel',
      description: 'Instant notifications when CPU spikes, disk space exhausts, or deployment health probes fail. Delivered directly to your Email, Slack, Discord, or custom webhook endpoints.'
    }
  ]

  const comparisonRows = [
    {
      feature: 'Monthly Infrastructure Cost (4 CPU / 8GB RAM)',
      paas: '$240 – $400 / mo',
      manual: '$10 – $14 / mo',
      portalops: '$10 VPS (Zero Compute Markups)'
    },
    {
      feature: 'Bandwidth & Egress Fees',
      paas: 'Massive markups ($0.15 / GB)',
      manual: 'Included (20TB free on Hetzner/DO)',
      portalops: '100% Free (Direct provider bandwidth)'
    },
    {
      feature: 'Initial Server Setup Time',
      paas: 'Instant (Proprietary platform)',
      manual: '3 – 5 hours of manual SSH & Nginx',
      portalops: '60 seconds (1-line copy-paste script)'
    },
    {
      feature: 'Zero-Downtime Atomic Symlinks',
      paas: 'Proprietary container redeploy',
      manual: 'Fragile custom bash scripting',
      portalops: 'Native atomic symlink directory swap'
    },
    {
      feature: 'Server & Code Data Ownership',
      paas: 'Vendor locked in to proprietary runtime',
      manual: '100% yours, but high maintenance',
      portalops: '100% yours on your own VPS'
    },
    {
      feature: 'Multi-Tenant Client Isolation',
      paas: 'Very expensive enterprise tier ($$$)',
      manual: 'None (everyone has root SSH access)',
      portalops: 'Included out of the box with RBAC'
    }
  ]

  const faqItems = [
    {
      q: 'How does PortalOps connect to my server? Do I have to give you my root password?',
      a: 'Never. You run a single copy-paste bash setup command on your fresh VPS. It creates a dedicated, restricted "portalops" system Linux user with isolated permissions and places a unique SSH keypair into authorized_keys. You never give us your root password, and you can revoke our access in one second anytime by deleting the key.'
    },
    {
      q: 'Can I bring my existing servers from DigitalOcean, Hetzner, or AWS?',
      a: 'Yes, 100%! PortalOps is built around the "Bring Your Own Server" (BYOS) philosophy. Whether you run a $4/mo Hetzner VPS, a DigitalOcean Droplet, an AWS Lightsail instance, or a dedicated bare-metal server in your office, as long as it runs Ubuntu 20.04/22.04/24.04 or Debian 11/12, it works seamlessly.'
    },
    {
      q: 'What happens to my apps and websites if PortalOps is down or I cancel?',
      a: 'Your apps and websites keep running without missing a beat! Unlike proprietary PaaS platforms, PortalOps does not proxy your production web traffic. Your Nginx configs, PM2 daemons, Node.js/PHP processes, and database instances run natively on your VPS. If PortalOps goes offline, your servers continue serving traffic 24/7.'
    },
    {
      q: 'How does the zero-downtime deployment mechanism work?',
      a: 'We use the industry-standard atomic symlink release pattern. Each build is assembled in an isolated directory (/releases/{timestamp}). Once all build steps, database migrations, and preflight health checks pass, the /current symlink is atomically swapped in less than 1 millisecond. Visitors never see a broken page or half-uploaded assets.'
    },
    {
      q: 'Can I invite clients or coworkers without exposing other projects?',
      a: 'Yes! PortalOps features built-in Multi-Tenant Workspace isolation. You can spin up a dedicated workspace for each client or team, invite their members with role-based permissions (Admin, Member, Viewer), and ensure they only see their own servers, deployments, and environment variables.'
    },
    {
      q: 'Can I test PortalOps on personal side projects without a credit card?',
      a: 'Yes, absolutely. You can connect a test VPS and deploy your side projects completely free without entering a credit card.'
    }
  ]

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-hidden bg-[#060C16] text-white selection:bg-[#1D63FF] selection:text-white">
      {/* Deep Midnight Navy Radial Ambient Spotlights */}
      <div
        className="absolute top-0 left-0 w-[800px] h-[700px] pointer-events-none blur-[140px] -z-10 opacity-70"
        style={{
          background: 'radial-gradient(circle at 20% 30%, rgba(29, 99, 255, 0.32) 0%, rgba(14, 45, 105, 0.18) 50%, transparent 80%)'
        }}
      />
      <div
        className="absolute top-0 right-0 w-[850px] h-[750px] pointer-events-none blur-[150px] -z-10 opacity-65"
        style={{
          background: 'radial-gradient(circle at 85% 35%, rgba(29, 99, 255, 0.30) 0%, rgba(12, 38, 90, 0.16) 55%, transparent 80%)'
        }}
      />
      <div
        className="absolute bottom-1/3 left-1/2 -translate-x-1/2 w-[1100px] h-[600px] pointer-events-none blur-[180px] -z-10 opacity-30"
        style={{
          background: 'radial-gradient(circle, rgba(0, 223, 143, 0.15) 0%, rgba(29, 99, 255, 0.10) 50%, transparent 80%)'
        }}
      />

      {/* ============================================================== */}
      {/* 1. Global Navigation Bar (Matching Ploi.io Layout) */}
      {/* ============================================================== */}
      <header className="h-[74px] px-6 md:px-12 backdrop-blur-md bg-[#060C16]/80 border-b border-white/10 flex items-center justify-between sticky top-0 z-40 select-none">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <SlipwayLogo size="md" />
          <span className="font-bold text-lg tracking-tight text-white">
            portalops.online
          </span>
        </Link>

        {/* Center Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-[13.5px] font-medium text-zinc-300">
          {/* Features with Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
              onMouseEnter={() => setIsFeaturesOpen(true)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <span>Features</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {isFeaturesOpen && (
              <div
                onMouseLeave={() => setIsFeaturesOpen(false)}
                className="absolute top-full left-0 mt-2 w-64 bg-[#0A1220] border border-white/15 rounded-xl p-2 shadow-2xl space-y-1 backdrop-blur-md"
              >
                <a
                  href="#features"
                  onClick={() => setIsFeaturesOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                >
                  <div>Zero-Downtime Symlinks</div>
                  <div className="text-[11px] text-zinc-400 font-normal">Atomic pointer swapping</div>
                </a>
                <a
                  href="#providers"
                  onClick={() => setIsFeaturesOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                >
                  <div>BYOS Cloud VPS</div>
                  <div className="text-[11px] text-zinc-400 font-normal">DigitalOcean, Hetzner, AWS</div>
                </a>
                <a
                  href="#simulator"
                  onClick={() => setIsFeaturesOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-white/10 text-xs font-semibold text-white transition-colors"
                >
                  <div>Interactive Simulator</div>
                  <div className="text-[11px] text-zinc-400 font-normal">Live release telemetry test</div>
                </a>
              </div>
            )}
          </div>

          <a href="#providers" className="hover:text-white transition-colors">
            Server installation
          </a>
          <a href="#faq" className="hover:text-white transition-colors">
            Documentation
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className="h-9 px-4 rounded-lg text-xs font-bold bg-[#1D63FF] hover:bg-[#1554E0] text-white inline-flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/30"
            >
              <span>Open Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-[13.5px] font-medium text-zinc-300 hover:text-white transition-colors px-2 py-1"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="h-[38px] px-4 rounded-lg text-xs font-bold bg-white hover:bg-zinc-100 text-zinc-900 inline-flex items-center gap-1.5 transition-all shadow-xs"
              >
                <span>Start free trial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. Hero Section: Split 2-Column (Exact Match to Screenshot) */}
      {/* ============================================================== */}
      <section className="pt-12 sm:pt-16 pb-20 px-6 md:px-12 max-w-[1320px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ------------------------------------------------------------ */}
          {/* LEFT COLUMN: Headline & CTA */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-6 flex flex-col items-start text-left">
            {/* News Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-zinc-300 mb-6 backdrop-blur-xs select-none">
              <span className="bg-[#1D63FF] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                News
              </span>
              <span className="font-medium">The site commands update 💻</span>
              <span className="text-zinc-500 font-bold">›</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-black tracking-tight text-white leading-[1.07] text-balance">
              Deploy your<br />
              next server<br />
              in a{' '}
              <span className="relative inline-block text-white">
                few clicks.
                {/* Hand-drawn Curved Underline Swoosh */}
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3.5 text-[#1D63FF]"
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
              We take all the difficult work out of your hands — so you can focus on doing what you love: developing your application.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5 w-full sm:w-auto">
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="h-12 px-6 rounded-lg bg-[#1D63FF] hover:bg-[#1554E0] active:bg-[#0E46C7] text-white font-semibold text-sm inline-flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer"
              >
                <span>Deploy your app now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href="#simulator"
                className="h-12 px-6 rounded-lg bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/15 text-white font-medium text-sm inline-flex items-center justify-center transition-all cursor-pointer"
              >
                <span>See how it works</span>
              </a>
            </div>

            {/* Trust Subtext */}
            <div className="mt-4 flex items-center gap-2 text-xs text-zinc-400 font-medium">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>5-day free trial · no credit card required</span>
            </div>

            {/* 1-Line Setup Script Box (Discreet BYOS helper) */}
            <div className="mt-7 flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-[#08111D] border border-white/10 font-mono text-xs text-zinc-300 w-full max-w-[460px]">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[#1D63FF]">$</span>
                <span className="truncate">{cliCommand}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCli}
                className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 text-[11px] font-sans font-medium text-zinc-200 flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                title="Copy 1-line script"
              >
                {copiedCli ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
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

          {/* ------------------------------------------------------------ */}
          {/* RIGHT COLUMN: Interactive macOS Mockup Window Card */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-6 relative">
            {/* Glow backing */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-600/25 to-teal-500/20 blur-xl opacity-75 -z-10" />

            {/* Window Card */}
            <div className="rounded-2xl border border-white/15 bg-[#09111D]/95 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden text-left relative">
              {/* Window Title Bar */}
              <div className="px-4 py-3 bg-[#0C1524] border-b border-white/10 flex items-center justify-between">
                {/* 3 macOS dots */}
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56]" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F]" />
                </div>

                {/* Center URL pill */}
                <div className="px-3 py-1 rounded-md bg-[#050A12] border border-white/10 text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 mx-auto">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>portalops.online/servers/awesome-server</span>
                </div>

                <div className="w-10" />
              </div>

              {/* Window Body: Sidebar + Main Content */}
              <div className="flex">
                {/* Left Mini Sidebar */}
                <div className="w-12 bg-[#060D17] border-r border-white/5 py-4 flex flex-col items-center gap-4 text-zinc-500 shrink-0">
                  <Home className="w-4 h-4 hover:text-zinc-300 transition-colors cursor-pointer" />
                  <div className="w-7 h-7 rounded-md bg-[#1D63FF]/20 text-[#1D63FF] flex items-center justify-center">
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
                      <div className="w-9 h-9 rounded-lg bg-blue-500/15 border border-blue-500/30 text-[#1D63FF] flex items-center justify-center shrink-0">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white flex items-center gap-2">
                          <span>awesome-server</span>
                        </div>
                        <div className="text-xs text-zinc-400">
                          Hetzner Cloud · 4 vCPU · Frankfurt
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Active</span>
                    </div>
                  </div>

                  {/* Telemetry Stats Row */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {/* CPU */}
                    <div className="p-2.5 rounded-lg bg-[#060D17] border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400 font-semibold">CPU</span>
                        <span className="text-white font-bold">27%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-[#1D63FF] rounded-full" style={{ width: '27%' }} />
                      </div>
                    </div>

                    {/* MEMORY */}
                    <div className="p-2.5 rounded-lg bg-[#060D17] border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400 font-semibold">MEMORY</span>
                        <span className="text-white font-bold">38%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-400 rounded-full" style={{ width: '38%' }} />
                      </div>
                    </div>

                    {/* DISK */}
                    <div className="p-2.5 rounded-lg bg-[#060D17] border border-white/5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-zinc-400 font-semibold">DISK</span>
                        <span className="text-white font-bold">21%</span>
                      </div>
                      <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-400 rounded-full" style={{ width: '21%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Terminal Deploy Log */}
                  <div className="rounded-xl bg-[#050A12] border border-white/10 p-3.5 font-mono text-[11px] text-zinc-300 space-y-1.5 shadow-inner">
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 border-b border-white/5 pb-2 mb-2">
                      <div className="flex items-center gap-1.5 text-zinc-400">
                        <Terminal className="w-3 h-3 text-[#1D63FF]" />
                        <span>deploy.log</span>
                      </div>
                      <span className="text-zinc-500">main · 9f3a1c2</span>
                    </div>

                    <div className="text-zinc-400">• git pull origin main</div>
                    <div className="text-emerald-400/90">✓ 10 files changed, 13004 insertions(+)</div>
                    <div className="text-zinc-400">• npm install --omit=dev</div>
                    <div className="text-zinc-400">• npm run build</div>
                    <div className="text-zinc-400">• npx prisma migrate deploy --skip-generate</div>
                    <div className="text-emerald-400 font-semibold pt-1 flex items-center gap-1.5">
                      <span>🚀 Application deployed!</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating "Deployed in 42 seconds" Badge (Bottom-left overlapping card) */}
            <div className="absolute -bottom-4 -left-3 sm:-left-6 z-20 bg-[#0B1524]/95 border border-white/15 rounded-xl p-3 shadow-2xl flex items-center gap-3 backdrop-blur-md">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <div>
                <div className="text-[11px] text-zinc-400 font-medium leading-none">Deployed in</div>
                <div className="text-sm font-bold text-white font-mono mt-1 leading-none">42 seconds</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. Cloud Provider Freedom Strip (BYOS) */}
      {/* ============================================================== */}
      <section
        id="providers"
        className="py-14 border-y border-white/10 bg-[#050A13]/90 select-none"
      >
        <div className="max-w-[1240px] mx-auto px-6">
          <div className="text-center mb-8">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#1D63FF]">
              [ INFRASTRUCTURE FREEDOM ]
            </span>
            <h2 className="text-[22px] sm:text-[28px] font-bold tracking-tight text-white mt-1">
              Connect any cloud provider or bare metal server in 60 seconds.
            </h2>
            <p className="mt-1.5 text-[13.5px] max-w-xl mx-auto text-zinc-400">
              You pay standard VPS prices directly to your provider. Get 10x the RAM and bandwidth for a fraction of PaaS costs.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {cloudProviders.map((provider) => (
              <div
                key={provider.name}
                className="p-4 rounded-xl border border-white/10 bg-[#09111D] hover:border-blue-500/30 transition-all text-center flex flex-col justify-between"
              >
                <div>
                  <span className="inline-block font-mono text-[9.5px] px-1.5 py-0.5 rounded font-semibold mb-2 bg-white/10 text-zinc-300">
                    {provider.tag}
                  </span>
                  <div className="font-bold text-[14px] leading-tight text-white">
                    {provider.name}
                  </div>
                </div>
                <div className="mt-3 font-mono text-[12px] font-semibold text-[#1D63FF]">
                  {provider.price}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. Interactive Live Fleet & Deployment Simulator */}
      {/* ============================================================== */}
      <section id="simulator" className="py-20 px-6 max-w-[1240px] mx-auto w-full">
        <div className="text-center mb-10">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-emerald-400">
            [ INTERACTIVE PLATFORM SIMULATOR ]
          </span>
          <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-tight text-white mt-1.5">
            Experience atomic zero-downtime releases live.
          </h2>
          <p className="mt-2 text-[14.5px] max-w-xl mx-auto text-zinc-400">
            Click below to test preflight checks, atomic symlink pointer swaps, and automated rollback guards in real time.
          </p>
        </div>

        {/* Tab Controls Bar */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            type="button"
            onClick={() => setActiveSimTab('pipeline')}
            className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold transition-colors cursor-pointer border flex items-center gap-2 ${
              activeSimTab === 'pipeline'
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                : 'bg-[#08111D] border-white/10 text-zinc-400 hover:text-white'
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
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                : 'bg-[#08111D] border-white/10 text-zinc-400 hover:text-white'
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
                ? 'bg-blue-500/15 border-blue-500/40 text-blue-400'
                : 'bg-[#08111D] border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>3. Host Telemetry &amp; Vitals</span>
          </button>
        </div>

        {/* Main Terminal Window */}
        <div className="w-full max-w-[1020px] mx-auto bg-[#070D18] border border-white/10 rounded-xl overflow-hidden shadow-2xl text-left font-mono text-[12px] text-zinc-300">
          {/* Terminal Title Bar */}
          <div className="h-[42px] px-4 bg-[#0A1322] border-b border-white/10 flex items-center justify-between text-zinc-400">
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
                className="h-7 px-3 rounded bg-[#1D63FF] hover:bg-[#1554E0] text-white text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3 h-3 fill-current" />
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
                  <div className="flex items-center gap-2 text-[#1D63FF] pt-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing deployment pipeline hooks...</span>
                  </div>
                )}
              </div>
            )}

            {activeSimTab === 'symlink' && (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-[#0A1322] border border-white/10 space-y-2">
                  <div className="text-xs font-bold text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                    <span>Atomic Symlink Swap Pattern</span>
                  </div>
                  <p className="text-zinc-400 text-[11.5px] leading-relaxed">
                    Zero-downtime deploys work by assembling builds inside timestamped release folders. Only when all tests pass is the symlink swapped atomically in under 1 millisecond.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg border border-white/10 bg-[#060D17]">
                    <div className="text-zinc-500 font-mono text-[10px]">STEP 1</div>
                    <div className="font-bold text-white mt-1">Build Release</div>
                    <div className="text-zinc-400 text-[11px] mt-1">/releases/20261108-143</div>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-[#060D17]">
                    <div className="text-zinc-500 font-mono text-[10px]">STEP 2</div>
                    <div className="font-bold text-emerald-400 mt-1">Atomic Swap</div>
                    <div className="text-zinc-400 text-[11px] mt-1">ln -sfn release current</div>
                  </div>
                  <div className="p-3 rounded-lg border border-white/10 bg-[#060D17]">
                    <div className="text-zinc-500 font-mono text-[10px]">STEP 3</div>
                    <div className="font-bold text-blue-400 mt-1">Auto Rollback</div>
                    <div className="text-zinc-400 text-[11px] mt-1">Revert on 500 error</div>
                  </div>
                </div>
              </div>
            )}

            {activeSimTab === 'telemetry' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-[#0A1322] border border-white/10">
                  <div className="text-xs text-zinc-400 font-semibold">CPU LOAD</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">18.4%</div>
                  <div className="text-[11px] text-emerald-400 mt-1">✓ Nominal across 4 cores</div>
                </div>
                <div className="p-4 rounded-lg bg-[#0A1322] border border-white/10">
                  <div className="text-xs text-zinc-400 font-semibold">MEMORY USAGE</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">2.1 / 8.0 GB</div>
                  <div className="text-[11px] text-emerald-400 mt-1">✓ 73% free RAM buffer</div>
                </div>
                <div className="p-4 rounded-lg bg-[#0A1322] border border-white/10">
                  <div className="text-xs text-zinc-400 font-semibold">DISK STORAGE</div>
                  <div className="text-2xl font-bold text-white font-mono mt-1">24.2 / 160 GB</div>
                  <div className="text-[11px] text-emerald-400 mt-1">✓ NVMe healthy · 135GB free</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. Core Platform Features Grid */}
      {/* ============================================================== */}
      <section id="features" className="py-20 px-6 max-w-[1240px] mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#1D63FF]">
            [ BUILT FOR PRODUCTIVE DEVELOPERS ]
          </span>
          <h2 className="text-[30px] sm:text-[40px] font-extrabold tracking-tight text-white mt-1.5">
            Everything you need to ship and scale.
          </h2>
          <p className="mt-2 text-[14.5px] max-w-xl mx-auto text-zinc-400">
            Ditch fragile custom scripts and high PaaS prices. PortalOps automates the boring DevOps overhead.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featurePillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <div
                key={pillar.title}
                className="p-6 rounded-2xl border border-white/10 bg-[#08111D] hover:border-blue-500/30 transition-all text-left space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${pillar.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-semibold">
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
      {/* 6. Comparison: PaaS vs DIY vs PortalOps */}
      {/* ============================================================== */}
      <section id="comparison" className="py-20 px-6 max-w-[1240px] mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-[#1D63FF]">
            [ THE BYOS ADVANTAGE ]
          </span>
          <h2 className="text-[30px] sm:text-[38px] font-extrabold tracking-tight text-white mt-1.5">
            Why developers choose PortalOps over PaaS.
          </h2>
          <p className="mt-2 text-[14.5px] max-w-2xl mx-auto text-zinc-400">
            PaaS platforms charge exorbitant premiums on compute and bandwidth. Manual SSH wastes hours of engineering time. PortalOps gives you the best of both worlds.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse rounded-xl overflow-hidden text-left text-[13px] border border-white/10 bg-[#08111D]">
            <thead>
              <tr className="border-b border-white/10 font-mono text-[11.5px] uppercase bg-[#0A1322] text-zinc-400">
                <th className="p-4">Feature / Metric</th>
                <th className="p-4 text-zinc-500">Traditional PaaS (Vercel / Heroku)</th>
                <th className="p-4 text-zinc-500">DIY Manual SSH &amp; Bash</th>
                <th className="p-4 font-bold text-[#1D63FF] bg-[#1D63FF]/10">
                  PortalOps + BYOS VPS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {comparisonRows.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-semibold text-zinc-200">{row.feature}</td>
                  <td className="p-4 text-zinc-500">{row.paas}</td>
                  <td className="p-4 text-zinc-500">{row.manual}</td>
                  <td className="p-4 font-semibold text-blue-400 bg-blue-500/5">
                    {row.portalops}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. Supported Frameworks & Stacks */}
      {/* ============================================================== */}
      <section className="py-14 border-y border-white/10 bg-[#050A13]/90 select-none">
        <div className="max-w-[1240px] mx-auto px-6 text-center">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-zinc-500">
            NATIVE FIRST-CLASS ECOSYSTEM SUPPORT
          </span>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[13px] font-mono">
            {['Node.js / Express', 'Next.js & Nuxt', 'Python / FastAPI', 'PHP / Laravel', 'Go & Rust', 'Docker Containers', 'Vite / React SPAs'].map((stack) => (
              <span
                key={stack}
                className="px-3.5 py-1.5 rounded-lg border border-white/10 bg-[#08111D] text-zinc-300 font-medium"
              >
                {stack}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. Developer FAQ Accordion */}
      {/* ============================================================== */}
      <section id="faq" className="py-20 px-6 max-w-[900px] mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-widest text-emerald-400">
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
                className="rounded-xl border border-white/10 bg-[#08111D] transition-colors"
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
      {/* 9. Bottom High-Converting Call to Action Banner */}
      {/* ============================================================== */}
      <section className="py-16 px-6 max-w-[1100px] mx-auto w-full text-center">
        <div className="p-10 sm:p-14 rounded-2xl shadow-2xl relative overflow-hidden border border-white/15 bg-gradient-to-b from-[#0B1526] to-[#060D17]">
          {/* Subtle Ambient Radial Highlight inside card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 to-transparent pointer-events-none blur-3xl" />

          <h2 className="text-[30px] sm:text-[40px] font-extrabold tracking-tight text-white max-w-2xl mx-auto leading-tight">
            Ready to take back control of your servers?
          </h2>
          <p className="mt-3.5 text-[15px] text-zinc-400 max-w-xl mx-auto leading-relaxed">
            Ditch the proprietary PaaS markup. Deploy your first server in 60 seconds with full root ownership and zero vendor lock-in.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              to="/register"
              className="h-12 px-6 rounded-lg text-sm font-bold bg-[#1D63FF] hover:bg-[#1554E0] text-white shadow-lg shadow-blue-600/30 inline-flex items-center gap-2 transition-all"
            >
              <span>Get Started Free — No Credit Card</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="h-12 px-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/15 text-zinc-300 text-sm font-medium inline-flex items-center gap-2 transition-colors"
            >
              <span>Sign In to Workspace</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 10. Comprehensive Developer Footer */}
      {/* ============================================================== */}
      <footer className="mt-auto py-12 px-6 md:px-12 border-t border-white/10 select-none text-[12.5px] bg-[#040810] text-zinc-500">
        <div className="max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-10 text-left">
          {/* Col 1: Brand Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <SlipwayLogo size="sm" />
              <span className="font-bold text-[15px] text-white">portalops.online</span>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed max-w-sm text-zinc-400">
              Modern server management and deployment control plane. Bring your own cloud servers, avoid the PaaS tax, and ship zero-downtime releases.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>All Systems Operational</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="space-y-2">
            <div className="font-semibold text-[13px] text-zinc-200">Product</div>
            <div><a href="#how-it-works" className="hover:text-zinc-300 transition-colors">How It Works</a></div>
            <div><a href="#features" className="hover:text-zinc-300 transition-colors">Atomic Deploys</a></div>
            <div><a href="#providers" className="hover:text-zinc-300 transition-colors">BYOS Providers</a></div>
            <div><a href="#comparison" className="hover:text-zinc-300 transition-colors">PaaS Comparison</a></div>
          </div>

          {/* Col 3: Integrations */}
          <div className="space-y-2">
            <div className="font-semibold text-[13px] text-zinc-200">Supported Clouds</div>
            <div><span className="text-zinc-400">Hetzner Cloud</span></div>
            <div><span className="text-zinc-400">DigitalOcean</span></div>
            <div><span className="text-zinc-400">AWS Lightsail</span></div>
            <div><span className="text-zinc-400">Linode &amp; Vultr</span></div>
            <div><span className="text-zinc-400">Custom Bare Metal</span></div>
          </div>

          {/* Col 4: Legal & Security */}
          <div className="space-y-2">
            <div className="font-semibold text-[13px] text-zinc-200">Trust &amp; Legal</div>
            <div><a href="#security" className="hover:text-zinc-300 transition-colors">Security Architecture</a></div>
            <div><a href="#privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</a></div>
            <div><a href="#terms" className="hover:text-zinc-300 transition-colors">Terms of Service</a></div>
            <div><a href="#faq" className="hover:text-zinc-300 transition-colors">Developer FAQ</a></div>
          </div>
        </div>

        {/* Footer Bottom Bar */}
        <div className="max-w-[1240px] mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} PortalOps Control Plane. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>BYOS Architecture</span>
            <span>•</span>
            <span>Zero Root Key Storage</span>
            <span>•</span>
            <span>AES-256-GCM Encrypted</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
