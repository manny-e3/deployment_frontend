import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightLeft,
  ShieldCheck,
  Server,
  Check,
  Copy,
  ArrowRight,
  CheckCircle2,
  Play,
  Sun,
  Moon
} from 'lucide-react'
import { SlipwayLogo } from '../components/SlipwayLogo'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export function LandingPage() {
  const { isAuthenticated } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [copiedCli, setCopiedCli] = useState(false)

  const cliCommand = 'curl -fsSL https://get.portalops.online | bash'

  const handleCopyCli = () => {
    navigator.clipboard?.writeText(cliCommand)
    setCopiedCli(true)
    setTimeout(() => setCopiedCli(false), 2000)
  }

  const scrollToTerminal = () => {
    const el = document.getElementById('terminal-preview')
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div
      className={`min-h-screen font-sans flex flex-col relative overflow-hidden transition-colors duration-200 ${
        isDark
          ? 'bg-[#04070A] text-white selection:bg-[#00DF8F] selection:text-black'
          : 'bg-[#FAFAFA] text-zinc-950 selection:bg-zinc-900 selection:text-white'
      }`}
    >
      {/* Background Ambient Radial Glow */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] pointer-events-none blur-3xl -z-10 transition-opacity duration-300 ${
          isDark
            ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#00DF8F]/12 via-[#00DF8F]/3 to-transparent opacity-100'
            : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/8 via-teal-500/2 to-transparent opacity-80'
        }`}
      />

      {/* 1. Global Navigation Bar */}
      <header
        className={`h-[64px] px-6 md:px-12 backdrop-blur-md border-b flex items-center justify-between sticky top-0 z-40 select-none transition-colors duration-200 ${
          isDark
            ? 'bg-[#04070A]/85 border-[#141C24]'
            : 'bg-white/90 border-zinc-200/90'
        }`}
      >
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <SlipwayLogo size="md" />
            <span className={`font-semibold text-[15.5px] tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              PortalOps
            </span>
          </Link>
          <span
            className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-medium ${
              isDark
                ? 'text-[#00DF8F] bg-[#00DF8F]/10 border border-[#00DF8F]/25'
                : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
            }`}
          >
            v2.4
          </span>
        </div>

        {/* Center links */}
        <nav className={`hidden md:flex items-center gap-7 text-[13px] font-medium transition-colors ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
          <a href="#capabilities" className={`hover:transition-colors ${isDark ? 'hover:text-white' : 'hover:text-zinc-950'}`}>
            Capabilities
          </a>
          <a href="#architecture" className={`hover:transition-colors ${isDark ? 'hover:text-white' : 'hover:text-zinc-950'}`}>
            Architecture
          </a>
          <a href="#workflow" className={`hover:transition-colors ${isDark ? 'hover:text-white' : 'hover:text-zinc-950'}`}>
            Workflow
          </a>
          <Link to="/login" className={`hover:transition-colors ${isDark ? 'hover:text-white' : 'hover:text-zinc-950'}`}>
            Documentation
          </Link>
          <a href="#pricing" className={`hover:transition-colors ${isDark ? 'hover:text-white' : 'hover:text-zinc-950'}`}>
            Pricing
          </a>
        </nav>

        {/* Right CTA Actions & Theme Switcher */}
        <div className="flex items-center gap-3">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className={`w-8 h-8 rounded-[6px] flex items-center justify-center transition-colors cursor-pointer border ${
              isDark
                ? 'bg-[#0E151D] border-[#1E2B37] text-amber-400 hover:text-white hover:bg-[#16212D]'
                : 'bg-white border-zinc-200 text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100 shadow-2xs'
            }`}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <Link
              to="/dashboard"
              className={`h-[34px] px-3.5 rounded-[6px] text-[12.5px] font-semibold inline-flex items-center gap-1.5 transition-all shadow-xs ${
                isDark
                  ? 'bg-[#00DF8F] hover:bg-[#00F5A0] text-black shadow-[0_0_15px_rgba(0,223,143,0.3)]'
                  : 'bg-zinc-950 hover:bg-zinc-800 text-white'
              }`}
            >
              <span>Open Console</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className={`text-[13px] font-medium transition-colors ${
                  isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-700 hover:text-zinc-950'
                }`}
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className={`h-[34px] px-3.5 rounded-[6px] text-[12.5px] font-medium inline-flex items-center gap-1.5 transition-all border ${
                  isDark
                    ? 'bg-[#0E151D] hover:bg-[#16212D] border-zinc-700/80 hover:border-zinc-500 text-white'
                    : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-950 text-white shadow-2xs'
                }`}
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-16 md:pt-22 pb-14 px-6 max-w-[1240px] mx-auto text-center flex flex-col items-center">
        {/* Status Pill */}
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono mb-6 select-none transition-colors border ${
            isDark
              ? 'bg-[#081016] border-[#00DF8F]/30 text-[#00DF8F] shadow-[0_0_12px_rgba(0,223,143,0.1)]'
              : 'bg-white border-emerald-200 text-emerald-800 shadow-2xs'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold tracking-wider">MISSION-CRITICAL CONTROL PLANE</span>
          <span className="opacity-40">•</span>
          <span className={isDark ? 'text-zinc-400' : 'text-zinc-500'}>v2.4 READY</span>
        </div>

        {/* Main Headline */}
        <h1
          className={`text-[38px] sm:text-[54px] md:text-[64px] font-extrabold tracking-tight max-w-4xl leading-[1.08] text-balance transition-colors ${
            isDark ? 'text-white' : 'text-zinc-950'
          }`}
        >
          The deployment control plane built for{' '}
          <span
            className={
              isDark
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-[#00DF8F] via-[#00F5A0] to-[#38BDF8]'
                : 'text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600'
            }
          >
            zero downtime.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-5 text-[15px] sm:text-[16.5px] max-w-2xl leading-relaxed text-balance font-normal transition-colors ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          Automate Git-triggered builds, preflight policy guardrails, atomic multi-target releases, and instant rollback recovery for high-reliability engineering teams.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to={isAuthenticated ? '/dashboard' : '/register'}
            className={`h-[40px] px-5 rounded-[6px] text-[13.5px] font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${
              isDark
                ? 'bg-[#00DF8F] hover:bg-[#00F5A0] text-black shadow-[0_0_20px_rgba(0,223,143,0.35)]'
                : 'bg-zinc-950 hover:bg-zinc-800 text-white shadow-sm'
            }`}
          >
            <span>Start Deploying</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <button
            type="button"
            onClick={scrollToTerminal}
            className={`h-[40px] px-4 rounded-[6px] text-[13.5px] font-medium inline-flex items-center gap-2 transition-colors cursor-pointer border ${
              isDark
                ? 'bg-[#090E14] hover:bg-[#111A24] border-[#1E2B37] text-zinc-200'
                : 'bg-white hover:bg-zinc-50 border-zinc-200 text-zinc-800 shadow-2xs'
            }`}
          >
            <Play className={`w-3.5 h-3.5 fill-current ${isDark ? 'text-[#00DF8F]' : 'text-emerald-600'}`} />
            <span>Live Console Demo</span>
          </button>
        </div>

        {/* Curl Install Command Box */}
        <div
          className={`mt-6 flex items-center justify-between gap-3 px-4 py-2 rounded-[7px] font-mono text-[12px] w-full max-w-[440px] transition-colors border ${
            isDark
              ? 'bg-[#070B0F] border-[#16202A] text-zinc-300 shadow-inner'
              : 'bg-white border-zinc-200 text-zinc-700 shadow-2xs'
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <span className={isDark ? 'text-zinc-600' : 'text-zinc-400'}>$</span>
            <span className="truncate">{cliCommand}</span>
          </div>
          <button
            type="button"
            onClick={handleCopyCli}
            className={`transition-colors cursor-pointer shrink-0 ml-2 ${
              isDark ? 'text-zinc-500 hover:text-white' : 'text-zinc-400 hover:text-zinc-800'
            }`}
            title="Copy command"
          >
            {copiedCli ? (
              <Check className={`w-3.5 h-3.5 ${isDark ? 'text-[#00DF8F]' : 'text-emerald-600'}`} />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* 3. Hero Visual: Simulated Terminal Window */}
        <div
          id="terminal-preview"
          className="mt-12 w-full max-w-[980px] bg-[#06090D] border border-[#17222C] rounded-[8px] overflow-hidden shadow-[0_12px_40px_rgba(0,0,0,0.8)] text-left font-mono text-[12px] text-zinc-300"
        >
          {/* Terminal Title Bar */}
          <div className="h-[38px] px-4 bg-[#0A0F15] border-b border-[#17222C] flex items-center justify-between text-zinc-400">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E06C75]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#E5C07B]" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#98C379]" />
              <span className="ml-2 text-[11px] text-zinc-400 font-medium">portalops.ctl   pipeline run #482</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-[#00DF8F]/15 border border-[#00DF8F]/30 text-[#00DF8F] text-[10px] font-semibold flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00DF8F] animate-pulse" />
                LIVE
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-zinc-400">target: prod-cluster-01</span>
            </div>
          </div>

          {/* Stepper Pipeline Bar */}
          <div className="p-3 bg-[#080C10] border-b border-[#17222C] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div className="p-2 rounded bg-[#0D131A] border border-[#1E2B38] flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 text-[#00DF8F] shrink-0" />
                <span className="truncate text-zinc-300">1. Guardrails</span>
              </div>
              <span className="text-[10px] text-[#00DF8F] font-semibold">Passed</span>
            </div>

            <div className="p-2 rounded bg-[#0D131A] border border-[#1E2B38] flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 text-[#00DF8F] shrink-0" />
                <span className="truncate text-zinc-300">2. Build</span>
              </div>
              <span className="text-[10px] text-zinc-400">1.4s</span>
            </div>

            <div className="p-2 rounded bg-[#0D131A] border border-[#1E2B38] flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 text-[#00DF8F] shrink-0" />
                <span className="truncate text-zinc-300">3. Release Symlink</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-semibold">Atomic</span>
            </div>

            <div className="p-2 rounded bg-[#0A1A14] border border-[#00DF8F]/40 text-[#00DF8F] flex items-center justify-between">
              <div className="flex items-center gap-1.5 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00DF8F] shrink-0" />
                <span className="truncate font-semibold">4. Probe: 200 OK</span>
              </div>
              <span className="text-[10px] font-bold text-[#00DF8F]">Live</span>
            </div>
          </div>

          {/* Simulated Terminal Output Stream */}
          <div className="p-5 space-y-1.5 text-[11.5px] leading-relaxed select-text bg-[#040608]">
            <div className="text-zinc-500">[10:42:01] <span className="text-[#38BDF8] font-bold">INFO </span> <span className="text-zinc-300">Webhook dispatched from github.com/acme/storefront (branch: main)</span></div>
            <div className="text-zinc-500">[10:42:02] <span className="text-amber-400 font-bold">CHECK</span> <span className="text-zinc-300">Preflight guardrail evaluation: Freeze window inactive, branch main allowed</span></div>
            <div className="text-zinc-500">[10:42:03] <span className="text-emerald-400 font-bold">BUILD</span> <span className="text-zinc-300">Vite production bundle compiled in 1.42s (42 modules, 184kB gzipped)</span></div>
            <div className="text-zinc-500">[10:42:04] <span className="text-cyan-400 font-bold">SYNC </span> <span className="text-zinc-300">Replicating bundle to target nodes (prod-node-01, prod-node-02, prod-node-03)</span></div>
            <div className="text-zinc-500">[10:42:05] <span className="text-purple-400 font-bold">SWAP </span> <span className="text-zinc-300">Atomic symlink swap activated &rarr; <span className="text-yellow-300">/var/www/releases/release-482</span></span></div>
            <div className="text-zinc-500">[10:42:06] <span className="text-[#00DF8F] font-bold">PROBE</span> <span className="text-[#00DF8F]">HTTP health probe verified (200 OK · latency 18ms · zero error rate)</span></div>
            <div className="text-zinc-500">[10:42:06] <span className="text-white font-bold">DONE </span> <span className="text-white font-semibold">Release #482 active in production. Auto-rollback armed.</span></div>
            <div className="pt-2 text-zinc-600 text-[11px]">// Platform telemetry listening on 02-node-2 (24ms)</div>
          </div>
        </div>
      </section>

      {/* 4. Key Metrics Row */}
      <section className="py-10 px-6 max-w-[1240px] mx-auto w-full">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className={`p-5 rounded-[8px] border transition-colors ${
              isDark
                ? 'bg-[#070B0F] border-[#16202A]'
                : 'bg-white border-zinc-200/90 shadow-2xs'
            }`}
          >
            <div className={`text-[28px] sm:text-[34px] font-mono font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              99.999<span className={isDark ? 'text-[#00DF8F] text-[20px] ml-0.5' : 'text-emerald-600 text-[20px] ml-0.5'}>%</span>
            </div>
            <div className={`text-[12.5px] font-semibold mt-1 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Release Uptime SLA</div>
            <div className={`text-[11px] mt-0.5 font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Automated canary guarantees</div>
          </div>

          <div
            className={`p-5 rounded-[8px] border transition-colors ${
              isDark
                ? 'bg-[#070B0F] border-[#16202A]'
                : 'bg-white border-zinc-200/90 shadow-2xs'
            }`}
          >
            <div className={`text-[28px] sm:text-[34px] font-mono font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              18<span className={isDark ? 'text-[#00DF8F] text-[20px] ml-0.5' : 'text-emerald-600 text-[20px] ml-0.5'}>ms</span>
            </div>
            <div className={`text-[12.5px] font-semibold mt-1 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Global Health Latency</div>
            <div className={`text-[11px] mt-0.5 font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Real-time edge verification</div>
          </div>

          <div
            className={`p-5 rounded-[8px] border transition-colors ${
              isDark
                ? 'bg-[#070B0F] border-[#16202A]'
                : 'bg-white border-zinc-200/90 shadow-2xs'
            }`}
          >
            <div className={`text-[28px] sm:text-[34px] font-mono font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              0<span className={isDark ? 'text-[#00DF8F] text-[20px] ml-0.5' : 'text-emerald-600 text-[20px] ml-0.5'}>s</span>
            </div>
            <div className={`text-[12.5px] font-semibold mt-1 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Downtime Symlinks</div>
            <div className={`text-[11px] mt-0.5 font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Atomic directory switching</div>
          </div>

          <div
            className={`p-5 rounded-[8px] border transition-colors ${
              isDark
                ? 'bg-[#070B0F] border-[#16202A]'
                : 'bg-white border-zinc-200/90 shadow-2xs'
            }`}
          >
            <div className={`text-[28px] sm:text-[34px] font-mono font-bold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
              4.7<span className={isDark ? 'text-[#00DF8F] text-[20px] ml-0.5' : 'text-emerald-600 text-[20px] ml-0.5'}>x</span>
            </div>
            <div className={`text-[12.5px] font-semibold mt-1 ${isDark ? 'text-zinc-300' : 'text-zinc-800'}`}>Velocity Multiplier</div>
            <div className={`text-[11px] mt-0.5 font-mono ${isDark ? 'text-zinc-500' : 'text-zinc-500'}`}>Measured DORA ship velocity</div>
          </div>
        </div>
      </section>

      {/* 5. Trusted Logos Strip */}
      <section
        className={`py-8 border-y transition-colors select-none ${
          isDark
            ? 'border-[#121A22] bg-[#05080C]'
            : 'border-zinc-200/90 bg-white'
        }`}
      >
        <div className="max-w-[1240px] mx-auto px-6 flex flex-wrap items-center justify-between gap-6 text-[11px] font-mono uppercase tracking-widest text-zinc-500">
          <span className={`font-semibold ${isDark ? 'text-zinc-500' : 'text-zinc-600'}`}>
            TRUSTED BY MISSION-CRITICAL ENGINEERING ORGANIZATIONS
          </span>
          <div className="flex flex-wrap items-center gap-8 text-[12px] font-semibold">
            <span className={`flex items-center gap-1.5 transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-700 hover:text-black'}`}>
              <strong className={isDark ? 'text-white' : 'text-black'}>GitHub</strong> Fleet
            </span>
            <span className={`flex items-center gap-1.5 transition-colors font-sans ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-700 hover:text-black'}`}>
              <strong className={`font-black tracking-tight text-[14px] ${isDark ? 'text-white' : 'text-black'}`}>stripe</strong> Payments Engine
            </span>
            <span className={`flex items-center gap-1.5 transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-700 hover:text-black'}`}>
              ▲ Vercel Edge
            </span>
            <span className={`flex items-center gap-1.5 transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-700 hover:text-black'}`}>
              ⚡ Supabase Infra
            </span>
            <span className={`flex items-center gap-1.5 transition-colors ${isDark ? 'text-zinc-400 hover:text-white' : 'text-zinc-700 hover:text-black'}`}>
              <span className="text-purple-500 font-bold">datadog</span> Telemetry
            </span>
          </div>
        </div>
      </section>

      {/* 6. Architectural Highlights (3 Main Cards) */}
      <section id="capabilities" className="py-22 px-6 max-w-[1240px] mx-auto">
        <div className="mb-14">
          <span className={`font-mono text-[11px] font-semibold uppercase tracking-wider ${isDark ? 'text-[#00DF8F]' : 'text-emerald-700'}`}>
            [ARCHITECTURAL HIGHLIGHTS]
          </span>
          <h2 className={`text-[28px] sm:text-[36px] font-bold tracking-tight mt-2.5 ${isDark ? 'text-white' : 'text-zinc-950'}`}>
            Engineered for mission-critical reliability and<br className="hidden sm:inline" /> unstoppable teams.
          </h2>
          <p className={`mt-2.5 text-[14px] max-w-2xl leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
            Every component of PortalOps is designed to neutralize release risks, eliminate human operator error, and maximize throughput.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Atomic Swaps */}
          <div
            className={`p-6 rounded-[8px] border flex flex-col justify-between transition-all group ${
              isDark
                ? 'bg-[#070B0F] border-[#16202A] hover:border-[#1F2E3C]'
                : 'bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300'
            }`}
          >
            <div>
              <div
                className={`w-10 h-10 rounded-[6px] border flex items-center justify-center mb-5 ${
                  isDark
                    ? 'bg-[#00DF8F]/10 border-[#00DF8F]/25 text-[#00DF8F]'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <ArrowRightLeft className="w-5 h-5" />
              </div>
              <h3 className={`text-[17px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                Atomic Zero-Downtime Swaps
              </h3>
              <p className={`mt-2.5 text-[13px] leading-relaxed font-normal ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Instant symlink pointer redirects swap production traffic with nanosecond precision. If any preflight or post-release check flags an irregularity, PortalOps reverts pointers instantaneously without dropping an active connection.
              </p>
            </div>
            <div className={`mt-6 pt-4 border-t flex items-center justify-between text-[11px] font-mono ${isDark ? 'border-[#131D26] text-zinc-500' : 'border-zinc-100 text-zinc-500'}`}>
              <span>&lt;1ms Pointer Switch</span>
              <span className={`font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ${isDark ? 'text-[#00DF8F]' : 'text-emerald-700'}`}>
                Auto-Rollback Armed &rarr;
              </span>
            </div>
          </div>

          {/* Card 2: Policy Guardrails */}
          <div
            className={`p-6 rounded-[8px] border flex flex-col justify-between transition-all group ${
              isDark
                ? 'bg-[#070B0F] border-[#16202A] hover:border-[#1F2E3C]'
                : 'bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300'
            }`}
          >
            <div>
              <div
                className={`w-10 h-10 rounded-[6px] border flex items-center justify-center mb-5 ${
                  isDark
                    ? 'bg-[#00DF8F]/10 border-[#00DF8F]/25 text-[#00DF8F]'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className={`text-[17px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                Preflight Policy Guardrails
              </h3>
              <p className={`mt-2.5 text-[13px] leading-relaxed font-normal ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Establish release lockouts during peak revenue hours, enforce required test suites, branch protection audits, and multi-approver canary gates before bytecode ever touches bare metal or container registries.
              </p>
            </div>
            <div className={`mt-6 pt-4 border-t flex items-center justify-between text-[11px] font-mono ${isDark ? 'border-[#131D26] text-zinc-500' : 'border-zinc-100 text-zinc-500'}`}>
              <span>OPA / Rego Engine</span>
              <span className={`font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ${isDark ? 'text-[#00DF8F]' : 'text-emerald-700'}`}>
                Zero Unverified Deploys &rarr;
              </span>
            </div>
          </div>

          {/* Card 3: Target Fleet */}
          <div
            className={`p-6 rounded-[8px] border flex flex-col justify-between transition-all group ${
              isDark
                ? 'bg-[#070B0F] border-[#16202A] hover:border-[#1F2E3C]'
                : 'bg-white border-zinc-200/90 shadow-2xs hover:border-zinc-300'
            }`}
          >
            <div>
              <div
                className={`w-10 h-10 rounded-[6px] border flex items-center justify-center mb-5 ${
                  isDark
                    ? 'bg-[#00DF8F]/10 border-[#00DF8F]/25 text-[#00DF8F]'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
              >
                <Server className="w-5 h-5" />
              </div>
              <h3 className={`text-[17px] font-semibold tracking-tight ${isDark ? 'text-white' : 'text-zinc-950'}`}>
                Multi-Node Target Fleet
              </h3>
              <p className={`mt-2.5 text-[13px] leading-relaxed font-normal ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                Synchronize simultaneously across heterogeneous bare-metal Linux servers, AWS EC2 instances, Kubernetes pods, and edge nodes. Monitor target health in 24ms intervals with automated routing reranks.
              </p>
            </div>
            <div className={`mt-6 pt-4 border-t flex items-center justify-between text-[11px] font-mono ${isDark ? 'border-[#131D26] text-zinc-500' : 'border-zinc-100 text-zinc-500'}`}>
              <span>Heterogeneous Fleet</span>
              <span className={`font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform ${isDark ? 'text-[#00DF8F]' : 'text-emerald-700'}`}>
                100% Online Dependability &rarr;
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Bottom Call to Action Card */}
      <section className="py-16 px-6 max-w-[1100px] mx-auto w-full text-center">
        <div
          className={`p-10 sm:p-14 rounded-[10px] shadow-xl relative overflow-hidden transition-all border ${
            isDark
              ? 'bg-gradient-to-b from-[#0A121A] to-[#060A0E] border-[#1A2633]'
              : 'bg-zinc-950 border-zinc-900 text-white'
          }`}
        >
          {/* Subtle Ambient Radial Highlight inside card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/15 to-transparent pointer-events-none blur-2xl" />

          <h2 className="text-[28px] sm:text-[36px] font-bold tracking-tight text-white max-w-xl mx-auto leading-tight">
            Ready to achieve zero-downtime velocity?
          </h2>
          <p className="mt-3.5 text-[14px] text-zinc-400 max-w-lg mx-auto leading-relaxed">
            Join high-reliability teams deploying code safely dozens of times per day. Spin up your dedicated deployment plane in under two minutes.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className={`h-[40px] px-5 rounded-[6px] text-[13px] font-semibold inline-flex items-center gap-2 transition-all ${
                isDark
                  ? 'bg-[#00DF8F] hover:bg-[#00F5A0] text-black shadow-[0_0_20px_rgba(0,223,143,0.3)]'
                  : 'bg-white hover:bg-zinc-100 text-zinc-950 shadow-sm'
              }`}
            >
              <span>Start Deploying Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/login"
              className="h-[40px] px-4 rounded-[6px] bg-[#080D12] hover:bg-[#121B24] border border-[#1E2B38] text-zinc-300 text-[13px] font-medium inline-flex items-center gap-2 transition-colors"
            >
              <span>Read Documentation</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Minimalist Footer */}
      <footer
        className={`mt-auto py-8 px-6 md:px-12 border-t select-none text-[12px] font-mono transition-colors ${
          isDark
            ? 'border-[#131B24] bg-[#030608] text-zinc-500'
            : 'border-zinc-200 bg-white text-zinc-500'
        }`}
      >
        <div className="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={isDark ? 'text-[#00DF8F]' : 'text-emerald-600'}>▲</span>
            <span className={`font-semibold ${isDark ? 'text-white' : 'text-zinc-900'}`}>PortalOps Inc.</span>
            <span className="opacity-40">|</span>
            <span>Zero-Downtime Control Plane v2.4</span>
          </div>

          <div className="flex items-center gap-5">
            <a href="#privacy" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-zinc-950'}`}>Privacy</a>
            <a href="#terms" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-zinc-950'}`}>Terms</a>
            <a href="#security" className={`transition-colors ${isDark ? 'hover:text-white' : 'hover:text-zinc-950'}`}>Security Audit</a>
            <span className="opacity-40">•</span>
            <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-zinc-300' : 'text-zinc-700'}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${isDark ? 'bg-[#00DF8F]' : 'bg-emerald-600'}`} />
              All Systems Operational
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}
