import { Rocket, Monitor, KeyRound, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SlipwayLogo } from './SlipwayLogo'

export function AuthSidePanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 lg:p-14 xl:p-18 bg-gradient-to-br from-[#061014] via-[#081419] to-[#020507] text-white relative overflow-hidden select-none border-l border-zinc-800/80">
      {/* Subtle Ambient Radial Highlight in PortalOps Mint / Deep Teal */}
      <div className="absolute top-0 right-0 w-[520px] h-[520px] bg-[#00DF8F]/8 pointer-events-none blur-3xl rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-[420px] h-[420px] bg-[#005459]/20 pointer-events-none blur-3xl rounded-full -ml-24 -mb-24" />

      {/* Top Brand Logo */}
      <div className="relative z-10 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90">
          <SlipwayLogo size="md" />
          <span className="font-bold text-xl tracking-tight text-white font-sans">
            portalops<span className="text-[#00DF8F]">.online</span>
          </span>
        </Link>
        <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#005459]/30 text-teal-300 border border-[#005459]/50 font-semibold">
          BYOS Cloud v2.4
        </span>
      </div>

      {/* Center Hero & 2x2 Feature Grid */}
      <div className="relative z-10 my-auto py-8 max-w-xl">
        <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-white leading-tight">
          Why should you pick{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00DF8F] via-[#38BDF8] to-teal-200">
            PortalOps
          </span>
          ?
        </h2>
        <p className="mt-3.5 text-sm xl:text-[15px] text-zinc-300/90 leading-relaxed font-normal">
          PortalOps offers many features to make your life as developer as easy as possible to setup sites and servers.
        </p>

        {/* 2x2 Feature Grid */}
        <div className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7">
          {/* Feature 1: Fast Provisioning */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#005459]/35 border border-[#005459]/60 flex items-center justify-center text-[#00DF8F] shrink-0">
                <Rocket className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white tracking-tight">
                Fast Provisioning
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Quickly provision servers and deploy sites with DigitalOcean, Hetzner, Vultr, Linode, Scaleway, AWS EC2, or Custom VPS.
            </p>
          </div>

          {/* Feature 2: Accessible Interface */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#005459]/35 border border-[#005459]/60 flex items-center justify-center text-[#00DF8F] shrink-0">
                <Monitor className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white tracking-tight">
                Accessible Interface
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              A UI that is easy on the eyes. Clean, easy to use, fantastic. Built by developers, for developers.
            </p>
          </div>

          {/* Feature 3: SSH Keys */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#005459]/35 border border-[#005459]/60 flex items-center justify-center text-[#00DF8F] shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white tracking-tight">
                SSH Keys
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Each server gets its own unique encrypted key-pair generated. Zero root passwords stored.
            </p>
          </div>

          {/* Feature 4: Easy queues */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#005459]/35 border border-[#005459]/60 flex items-center justify-center text-[#00DF8F] shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-white tracking-tight">
                Easy queues
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-normal">
              Forget manually creating supervisor config files, PortalOps takes care of it!
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Trust & Compliance Footer */}
      <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400 font-mono">
        <div className="flex items-center gap-2">
          <span>AES-256-GCM Encrypted</span>
          <span>•</span>
          <span>Zero Root Storage</span>
        </div>
        <div className="flex items-center gap-1.5 text-[#00DF8F] font-sans text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-[#00DF8F] animate-pulse" />
          <span>All Systems Operational</span>
        </div>
      </div>
    </div>
  )
}
