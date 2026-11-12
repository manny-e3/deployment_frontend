import { Link } from 'react-router-dom'
import { SlipwayLogo } from './SlipwayLogo'

export function PublicFooter() {
  return (
    <footer className="mt-auto py-14 px-6 md:px-12 border-t border-white/10 select-none text-[12.5px] bg-[#03080A] text-zinc-500">
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
            Self-sovereign server control plane and zero-downtime deployment platform. Connect any Linux VPS from Hetzner, DigitalOcean, or AWS with zero PaaS compute markup.
          </p>
          <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-[#00DF8F]">
            <span className="w-2 h-2 rounded-full bg-[#00DF8F] animate-pulse" />
            <span>All Systems Operational (0ms swap engine)</span>
          </div>
        </div>

        {/* Col 2: Product */}
        <div className="space-y-2.5">
          <div className="font-semibold text-[13px] text-zinc-200">Product</div>
          <div><Link to="/features" className="hover:text-zinc-300 transition-colors">Features &amp; Engine</Link></div>
          <div><Link to="/#how-it-works" className="hover:text-zinc-300 transition-colors">How It Works</Link></div>
          <div><Link to="/features" className="hover:text-zinc-300 transition-colors">Zero-Downtime Engine</Link></div>
          <div><Link to="/#simulator" className="hover:text-zinc-300 transition-colors">Live Deploy Simulator</Link></div>
          <div><Link to="/integrations" className="hover:text-zinc-300 transition-colors">Supported Clouds</Link></div>
        </div>

        {/* Col 3: Developers */}
        <div className="space-y-2.5">
          <div className="font-semibold text-[13px] text-zinc-200">Developers</div>
          <div><Link to="/docs" className="hover:text-zinc-300 transition-colors">Documentation</Link></div>
          <div><Link to="/docs#quickstart" className="hover:text-zinc-300 transition-colors">5-Min Quickstart</Link></div>
          <div><Link to="/changelog" className="hover:text-zinc-300 transition-colors">Changelog &amp; Roadmap</Link></div>
          <div><Link to="/integrations" className="hover:text-zinc-300 transition-colors">Integrations Hub</Link></div>
          <div><Link to="/#faq" className="hover:text-zinc-300 transition-colors">Developer FAQ</Link></div>
        </div>

        {/* Col 4: Partners & Enterprise Solutions */}
        <div className="space-y-2.5">
          <div className="font-semibold text-[13px] text-zinc-200">Partners &amp; Solutions</div>
          <div><Link to="/#partners" className="hover:text-zinc-300 transition-colors">Hosting Provider PaaS Layer</Link></div>
          <div><Link to="/contact?category=internal-tools" className="hover:text-zinc-300 transition-colors">Internal Tools &amp; IDP</Link></div>
          <div><Link to="/security" className="hover:text-zinc-300 transition-colors">Security Architecture</Link></div>
          <div><Link to="/contact" className="hover:text-zinc-300 transition-colors">Contact Partnerships</Link></div>
          <div><Link to="/privacy" className="hover:text-zinc-300 transition-colors">Privacy Policy</Link></div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="max-w-[1240px] mx-auto pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px]">
        <div>
          &copy; {new Date().getFullYear()} PortalOps Control Plane. All rights reserved.
        </div>
        <div className="flex items-center gap-4 text-zinc-400">
          <span>BYOS Cloud Architecture</span>
          <span>•</span>
          <span>Zero Root Key Storage</span>
          <span>•</span>
          <span>AES-256-GCM Encrypted</span>
        </div>
      </div>
    </footer>
  )
}
