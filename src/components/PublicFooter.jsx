import { Link } from 'react-router-dom'
import { SlipwayLogo } from './SlipwayLogo'

export function PublicFooter() {
  return (
    <footer className="mt-auto py-12 px-6 md:px-12 border-t border-white/10 select-none text-[12.5px] bg-[#03080A] text-zinc-500">
      <div className="max-w-[1240px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-10 text-left">
        {/* Col 1: Brand Info */}
        <div className="col-span-2">
          <div className="flex items-center gap-2.5">
            <SlipwayLogo size="sm" />
            <span className="font-bold text-[15px] text-white">
              portalops<span className="text-[#00DF8F]">.online</span>
            </span>
          </div>
          <p className="mt-3 text-[12px] leading-relaxed max-w-sm text-zinc-400">
            Modern server management and deployment control plane. Bring your own cloud servers, avoid the PaaS tax, and ship zero-downtime releases.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-[#00DF8F]">
            <span className="w-2 h-2 rounded-full bg-[#00DF8F] animate-pulse" />
            <span>All Systems Operational</span>
          </div>
        </div>

        {/* Col 2: Product */}
        <div className="space-y-2">
          <div className="font-semibold text-[13px] text-zinc-200">Product</div>
          <div><a href="/#how-it-works" className="hover:text-zinc-300 transition-colors">How It Works</a></div>
          <div><a href="/#features" className="hover:text-zinc-300 transition-colors">Atomic Deploys</a></div>
          <div><a href="/#providers" className="hover:text-zinc-300 transition-colors">BYOS Providers</a></div>
          <div><a href="/#comparison" className="hover:text-zinc-300 transition-colors">PaaS Comparison</a></div>
        </div>

        {/* Col 3: Integrations */}
        <div className="space-y-2">
          <div className="font-semibold text-[13px] text-zinc-200">Supported Clouds</div>
          <div><span className="text-zinc-400">Hetzner Cloud</span></div>
          <div><span className="text-zinc-400">DigitalOcean</span></div>
          <div><span className="text-zinc-400">AWS Lightsail &amp; EC2</span></div>
          <div><span className="text-zinc-400">Linode &amp; Vultr</span></div>
          <div><span className="text-zinc-400">Custom Bare Metal</span></div>
        </div>

        {/* Col 4: Legal & Security */}
        <div className="space-y-2">
          <div className="font-semibold text-[13px] text-zinc-200">Trust &amp; Legal</div>
          <div><Link to="/security" className="hover:text-zinc-300 transition-colors">Security Architecture</Link></div>
          <div><Link to="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link></div>
          <div><Link to="/terms" className="hover:text-zinc-300 transition-colors">Terms of Service</Link></div>
          <div><a href="/#faq" className="hover:text-zinc-300 transition-colors">Developer FAQ</a></div>
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
  )
}

