import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  MessageSquare,
  Shield,
  Clock,
  Send,
  CheckCircle2,
  ExternalLink,
  LifeBuoy,
  Mail,
  Copy,
  Check,
  AlertCircle,
  Handshake,
  Server,
  Building2
} from 'lucide-react'
import { PublicNav } from '../components/PublicNav'
import { PublicFooter } from '../components/PublicFooter'

export function ContactView() {
  const [searchParams] = useSearchParams()
  const paramCategory = searchParams.get('category') || 'support'
  const paramSubject = searchParams.get('subject') || ''

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: paramCategory,
    subject: paramSubject,
    message: ''
  })

  useEffect(() => {
    if (paramCategory && paramCategory !== formData.category) {
      setFormData(prev => ({
        ...prev,
        category: paramCategory,
        subject: prev.subject || paramSubject
      }))
    }
  }, [paramCategory, paramSubject])
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [copiedEmail, setCopiedEmail] = useState(false)

  const handleCopyEmail = () => {
    navigator.clipboard?.writeText('info@portalops.online')
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/v1/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok || data.ok === false) {
        throw new Error(data?.error?.message || 'Failed to dispatch inquiry. Please email info@portalops.online directly.')
      }

      setSubmitted(true)
      setSuccessMsg(data.message || 'Your message has been successfully delivered.')
    } catch (err) {
      setErrorMsg(err.message || 'Unable to connect to the mail gateway. You can send an email directly to info@portalops.online.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen font-sans flex flex-col relative overflow-x-clip bg-[#061014] text-white selection:bg-[#00DF8F] selection:text-zinc-950">
      <div
        className="absolute top-0 right-1/4 w-[800px] h-[600px] pointer-events-none blur-[150px] -z-10 opacity-50"
        style={{
          background: 'radial-gradient(circle, rgba(0, 84, 89, 0.40) 0%, transparent 70%)'
        }}
      />

      <PublicNav />

      {/* Header */}
      <section className="pt-16 pb-12 px-6 md:px-12 max-w-[1240px] mx-auto w-full text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-teal-300 mb-6">
          <LifeBuoy className="w-3.5 h-3.5 text-[#00DF8F]" />
          <span>Support &amp; Inquiries</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white max-w-3xl mx-auto">
          We're here to help you ship.
        </h1>

        <p className="mt-4 text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Have questions about server architecture, custom cloud setups, or need technical assistance? Inquiries drop directly to our core maintainers.
        </p>
      </section>

      {/* Content Form & Channels Grid */}
      <section className="py-8 pb-24 px-6 max-w-[1240px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Left Column: Form */}
          <div className="lg:col-span-7 bg-[#081419] border border-white/10 rounded-3xl p-8 sm:p-10 text-left">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-white">Send us a message</h2>

            </div>


            {/* Direct Email Routing Banner */}


            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2.5 mb-5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <div>{errorMsg}</div>
                  <div>
                    <a
                      href={`mailto:info@portalops.online?subject=${encodeURIComponent(formData.subject || 'PortalOps Inquiry')}&body=${encodeURIComponent(formData.message || '')}`}
                      className="text-white underline font-semibold"
                    >
                      Click here to email info@portalops.online directly
                    </a>
                  </div>
                </div>
              </div>
            )}

            {submitted ? (
              <div className="p-8 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-[#00DF8F] mx-auto" />
                <h3 className="text-lg font-bold text-white">Message Sent Successfully</h3>
                <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                  {successMsg || `Thank you for reaching out. We have received your message and will get back to you soon.`}
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitted(false)
                      setErrorMsg('')
                      setFormData({ name: '', email: '', category: 'support', subject: '', message: '' })
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#005459] hover:bg-[#004246] text-white text-xs font-semibold cursor-pointer transition-all shadow-md"
                  >
                    Send Another Message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Your Name <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Alex Developer"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A0D] border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00DF8F]/60"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Email Address <span className="text-rose-400">*</span></label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="alex@company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A0D] border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00DF8F]/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A0D] border border-white/10 text-xs text-white focus:outline-none focus:border-[#00DF8F]/60"
                    >
                      <option value="hosting-provider">Hosting &amp; Cloud Provider Partnership (Turnkey PaaS Layer)</option>
                      <option value="internal-tools">Internal Developer Platform (IDP for Company Internal Tools)</option>
                      <option value="partnership">Developer Tooling &amp; Ecosystem Integration</option>
                      <option value="support">Technical Support</option>
                      <option value="custom">Enterprise &amp; Custom Cloud</option>
                      <option value="feature">Feature Request</option>
                      <option value="security">Security Vulnerability</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-300">Subject <span className="text-rose-400">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="e.g. Hosting provider partnership proposal"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A0D] border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00DF8F]/60"
                    />
                  </div>
                </div>

                {/* Dynamic Category Context Banner */}
                {formData.category === 'hosting-provider' && (
                  <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/25 text-xs text-teal-300 flex items-start gap-2.5">
                    <Server className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-white">Hosting &amp; Infrastructure Partner Track</div>
                      <div className="text-zinc-300">Inquire about bundling PortalOps as a 1-click cloud image or turnkey PaaS control panel for your VPS &amp; Bare-Metal customer fleet.</div>
                    </div>
                  </div>
                )}

                {formData.category === 'internal-tools' && (
                  <div className="p-3.5 rounded-xl bg-[#00DF8F]/10 border border-[#00DF8F]/25 text-xs text-[#00DF8F] flex items-start gap-2.5">
                    <Building2 className="w-4 h-4 text-[#00DF8F] shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <div className="font-bold text-white">Internal Developer Platform (IDP) Track</div>
                      <div className="text-zinc-300">Inquire about running PortalOps across your company's private VPCs to deploy internal microservices, dashboards, and staging fleets securely with zero root exposure.</div>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Message <span className="text-rose-400">*</span></label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide details on your architecture, question, or inquiry..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#040A0D] border border-white/10 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00DF8F]/60 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 rounded-xl bg-[#00DF8F] hover:bg-[#00c57d] text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/40 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Please Wait...' : 'Submit'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Community & Support Channels */}
          <div className="lg:col-span-5 space-y-6 text-left">


            {/* Card 1: Hosting & Cloud Providers */}
            <div className="p-6 rounded-2xl bg-[#081419] border border-teal-500/30 space-y-3">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-mono uppercase font-bold">
                <Server className="w-4 h-4 text-[#00DF8F]" />
                <span>Hosting Companies &amp; Cloud</span>
              </div>
              <h3 className="text-lg font-bold text-white">Turnkey PaaS Layer</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Offer your VPS &amp; Bare Metal customers an automated Vercel-like push-to-deploy experience. Inquire about 1-click marketplace listing, cloud-init templates, and turnkey server onboarding.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: 'hosting-provider', subject: 'Hosting Company Partnership Inquiry' }))}
                  className="text-xs text-[#00DF8F] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Select Hosting Provider category</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Card 2: Internal Developer Platform (IDP) */}
            <div className="p-6 rounded-2xl bg-[#081419] border border-[#00DF8F]/30 space-y-3">
              <div className="flex items-center gap-2 text-[#00DF8F] text-xs font-mono uppercase font-bold">
                <Building2 className="w-4 h-4 text-[#00DF8F]" />
                <span>Companies &amp; Internal Tools</span>
              </div>
              <h3 className="text-lg font-bold text-white">Internal Developer Platform</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Deploy company internal tools, microservices, and staging fleets across private VPCs. Keep root credentials locked down while granting developers automated push-to-deploy access.
              </p>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: 'internal-tools', subject: 'Internal Developer Platform Inquiry' }))}
                  className="text-xs text-[#00DF8F] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Select Internal Tools (IDP) category</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#081419] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-teal-300 text-xs font-mono uppercase font-bold">
                <Clock className="w-4 h-4 text-[#00DF8F]" />
                <span>Response SLA</span>
              </div>
              <h3 className="text-lg font-bold text-white">Under 24-Hour Reply Time</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                We know how critical infrastructure is. If you run into deployment or symlink issues, our core engineers respond promptly with actionable troubleshooting.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#081419] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-mono uppercase font-bold">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                <span>Community Channels</span>
              </div>
              <h3 className="text-lg font-bold text-white">Discord &amp; GitHub Discussions</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Join hundreds of engineers discussing cloud setups, deployment recipes, Nginx configurations, and cost optimizations.
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs">
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>Discord Community</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white flex items-center gap-1.5 transition-colors"
                >
                  <span>GitHub Discussions</span>
                  <ExternalLink className="w-3 h-3 text-zinc-400" />
                </a>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#081419] border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-sky-300 text-xs font-mono uppercase font-bold">
                <Shield className="w-4 h-4 text-[#00DF8F]" />
                <span>Security Disclosures</span>
              </div>
              <h3 className="text-lg font-bold text-white">Responsible Security Reports</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Found a potential vulnerability? We take security seriously. Read our <Link to="/security" className="text-teal-300 underline underline-offset-2">Security Whitepaper</Link> or email security@portalops.online directly.
              </p>
            </div>
          </div>

        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
