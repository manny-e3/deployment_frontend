import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  ArrowRight,
  Sun,
  Moon,
  Shield,
  Menu,
  X
} from 'lucide-react'
import { SlipwayLogo } from './SlipwayLogo'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export function PublicNav() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const { isAuthenticated } = useAuth()
  const { isDark, toggleTheme } = useTheme()

  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getSectionHref = (hash) => {
    return isHome ? hash : `/${hash}`
  }

  return (
    <header className="h-[74px] px-6 md:px-12 backdrop-blur-md bg-[#061014]/85 border-b border-white/10 flex items-center justify-between sticky top-0 z-50 select-none">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-2.5 group">
        <SlipwayLogo size="md" />
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-white">
            portalops<span className="text-[#00DF8F]">.online</span>
          </span>
          {/* <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#005459]/40 text-teal-300 border border-[#005459]/60 font-semibold">
            BYOS v2.4
          </span> */}
        </div>
      </Link>

      {/* Center Desktop Links */}
      <nav className="hidden lg:flex items-center gap-7 text-[13.5px] font-medium text-zinc-300">
        {/* Features Dropdown */}
        <div className="relative">


          {isFeaturesOpen && (
            <div
              onMouseLeave={() => setIsFeaturesOpen(false)}
              className="absolute top-full left-0 mt-2 w-64 bg-[#0A161D] border border-white/15 rounded-xl p-2 shadow-2xl space-y-1 backdrop-blur-md z-50"
            >
              <a
                href={getSectionHref('#features')}
                onClick={() => setIsFeaturesOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-white/10 text-xs font-semibold text-white transition-colors"
              >
                <div className="text-teal-300">Zero-Downtime Symlinks</div>
                <div className="text-[11px] text-zinc-400 font-normal">Atomic pointer swapping in &lt;1ms</div>
              </a>
              <a
                href={getSectionHref('#providers')}
                onClick={() => setIsFeaturesOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-white/10 text-xs font-semibold text-white transition-colors"
              >
                <div className="text-emerald-300">BYOS Cloud VPS</div>
                <div className="text-[11px] text-zinc-400 font-normal">Hetzner, DigitalOcean, AWS, Linode</div>
              </a>
              <a
                href={getSectionHref('#simulator')}
                onClick={() => setIsFeaturesOpen(false)}
                className="block px-3 py-2 rounded-lg hover:bg-white/10 text-xs font-semibold text-white transition-colors"
              >
                <div className="text-sky-300">Interactive Simulator</div>
                <div className="text-[11px] text-zinc-400 font-normal">Live deployment telemetry test</div>
              </a>
            </div>
          )}
        </div>

        <a href={getSectionHref('#how-it-works')} className="hover:text-white transition-colors">
          How It Works
        </a>



        <a href={getSectionHref('#faq')} className="hover:text-white transition-colors">
          FAQ
        </a>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-3">


        {isAuthenticated ? (
          <Link
            to="/dashboard"
            className="h-9 px-4 rounded-lg text-xs font-bold bg-[#005459] hover:bg-[#004246] text-white inline-flex items-center gap-1.5 transition-all shadow-md shadow-teal-950/40"
          >
            <span>Console</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              className="text-[13.5px] font-medium text-zinc-300 hover:text-white transition-colors px-2 py-1"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="h-[38px] px-4 rounded-lg text-xs font-bold bg-[#00DF8F] hover:bg-[#00c57d] text-zinc-950 inline-flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </>
        )}

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden w-8 h-8 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center text-zinc-300 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Menu Modal */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[74px] left-0 w-full bg-[#061014] border-b border-white/10 p-6 space-y-4 shadow-2xl z-50">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-zinc-300">
            <a
              href={getSectionHref('#how-it-works')}
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href={getSectionHref('#providers')}
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              Supported Clouds
            </a>
            <a
              href={getSectionHref('#comparison')}
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              PaaS vs BYOS
            </a>
            <Link
              to="/security"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white transition-colors flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5 text-[#00DF8F]" />
              <span>Security Architecture</span>
            </Link>
            <Link
              to="/terms"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
            <Link
              to="/privacy"
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <a
              href={getSectionHref('#faq')}
              onClick={() => setIsMobileMenuOpen(false)}
              className="hover:text-white transition-colors"
            >
              Developer FAQ
            </a>
          </nav>
        </div>
      )}
    </header>
  )
}

