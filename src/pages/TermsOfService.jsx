import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  FileText,
  Lock,
  Server,
  AlertTriangle,
  ArrowLeft,
  Sun,
  Moon,
  CheckCircle,
  ExternalLink,
  ArrowRight
} from 'lucide-react'
import { PublicNav } from '../components/PublicNav'
import { PublicFooter } from '../components/PublicFooter'

export function TermsOfService() {
  const [activeSection, setActiveSection] = useState('acceptance')

  const sections = [
    { id: 'acceptance', title: '1. Acceptance of Terms' },
    { id: 'byos-model', title: '2. BYOS & Infrastructure Scope' },
    { id: 'accounts', title: '3. Accounts & Workspace Security' },
    { id: 'ssh-keys', title: '4. SSH Keys, Secrets & Encryption' },
    { id: 'acceptable-use', title: '5. Acceptable Use Policy' },
    { id: 'ownership', title: '6. Intellectual Property & Code Ownership' },
    { id: 'uptime-sla', title: '7. Service Availability & Control Plane SLA' },
    { id: 'billing', title: '8. Platform Usage & Quotas' },
    { id: 'liability', title: '9. Limitation of Liability & Warranty Disclaimer' },
    { id: 'termination', title: '10. Termination & Workspace Suspension' },
    { id: 'governing-law', title: '11. Governing Law & Contact' },
  ]

  const scrollTo = (id) => {
    setActiveSection(id)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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

      {/* 1. Global Navigation Bar */}
      <PublicNav />

      {/* 2. Hero Header Banner */}
      <div className="border-b border-white/10 bg-[#061014]/60 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-teal-300 mb-4 backdrop-blur-xs select-none">
            <FileText className="w-3.5 h-3.5 text-[#00DF8F]" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              MASTER SERVICE AGREEMENT
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Please read these Terms of Service carefully before provisioning servers, deploying workloads,
            or inviting team members onto the PortalOps deployment control plane.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
            <span className="px-2.5 py-1 rounded-md bg-[#081419] border border-white/10 text-[#00DF8F]">
              Effective Date: November 1, 2026
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#081419] border border-white/10 text-teal-300">
              Version: 2.4.0
            </span>
            <Link to="/privacy" className="text-teal-300 hover:text-[#00DF8F] transition-colors flex items-center gap-1 font-sans">
              <span>Read Privacy Policy</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Main Content Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Sticky Table of Contents */}
          <aside className="lg:col-span-4">
            <div className="sticky top-28 p-5 rounded-2xl border border-white/10 bg-[#081419]/95 backdrop-blur-md shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-300 font-mono">
                  [ LEGAL CONTENTS ]
                </span>
                <span className="w-2 h-2 rounded-full bg-[#00DF8F] animate-pulse" />
              </div>

              <nav className="space-y-1">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer truncate ${
                      activeSection === s.id
                        ? 'bg-[#005459]/50 text-[#00DF8F] border border-teal-500/40 font-semibold shadow-xs'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {s.title}
                  </button>
                ))}
              </nav>

              <div className="pt-4 border-t border-white/10 text-xs text-zinc-400 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-white">
                  <Shield className="w-3.5 h-3.5 text-[#00DF8F]" />
                  <span>BYOS Architecture</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  You maintain 100% control over your VPS and bare-metal nodes. PortalOps never stores root passwords.
                </p>
              </div>
            </div>
          </aside>

          {/* Right Document Body */}
          <div className="lg:col-span-8 space-y-10 text-sm text-zinc-300 leading-relaxed text-left">
            {/* Section 1 */}
            <section id="acceptance" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  01
                </span>
                Acceptance of Terms
              </h2>
              <p>
                By creating an account, registering an organization workspace, accessing the PortalOps Dashboard,
                or executing automated provisioning scripts provided by PortalOps (&quot;Service&quot;, &quot;we&quot;, &quot;our&quot;,
                or &quot;PortalOps&quot;), you (&quot;Customer&quot;, &quot;User&quot;, or &quot;You&quot;) agree to be bound by these
                Terms of Service and our Privacy Policy.
              </p>
              <p>
                If you are entering into this agreement on behalf of a company, organization, or other legal entity,
                you represent that you possess the authority to bind such entity. If you do not agree with any part
                of these terms, you must not access or use the Service.
              </p>
            </section>

            {/* Section 2 */}
            <section id="byos-model" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  02
                </span>
                Bring Your Own Server (BYOS) Model
              </h2>
              <p>
                PortalOps operates strictly as an autonomous <strong className="text-white">control plane</strong>. We provide deployment
                automation, orchestrator tooling, webhooks, pipeline management, and telemetry dashboards.
              </p>
              <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-2">
                <div className="flex items-center gap-2 font-semibold text-white text-xs">
                  <Server className="w-4 h-4 text-[#00DF8F]" />
                  <span>Infrastructure Demarcation:</span>
                </div>
                <ul className="space-y-1.5 text-xs text-zinc-400 pl-4 list-disc">
                  <li>
                    <strong className="text-zinc-200">Hosting Providers:</strong> Your servers are provisioned through third-party cloud providers
                    (e.g., DigitalOcean, Hetzner, AWS, Linode, Vultr, or private bare-metal). You remain solely responsible
                    for paying and maintaining your accounts with those providers.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Operating System &amp; Data:</strong> You maintain primary administrative authority over your
                    virtual machines, kernels, packages, filesystems, and databases.
                  </li>
                  <li>
                    <strong className="text-zinc-200">Independence:</strong> If the PortalOps control plane experiences scheduled downtime or network
                    interruption, your already-deployed applications and websites running on your own servers remain 100% operational.
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 3 */}
            <section id="accounts" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  03
                </span>
                Accounts &amp; Workspace Security
              </h2>
              <p>
                To utilize the Service, you must register with a valid email address and secure credentials.
                Account owners (&quot;Super Admins&quot;) are responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                <li>Safeguarding login credentials and enforcing strong passwords across team members.</li>
                <li>Assigning appropriate Role-Based Access Controls (RBAC: Admin, Member, Deployer).</li>
                <li>Immediately revoking access or invite links when an authorized team member departs the organization.</li>
                <li>Promptly notifying PortalOps at <code className="font-mono text-xs text-[#00DF8F]">security@portalops.online</code> upon discovering any compromised credential.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="ssh-keys" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  04
                </span>
                SSH Keys, Secrets &amp; Encryption
              </h2>
              <p>
                PortalOps adheres to strict security and cryptographic hygiene:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11]">
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5 mb-1">
                    <Lock className="w-3.5 h-3.5 text-[#00DF8F]" />
                    <span>Zero Root Password Storage</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    We never persist root passwords to disk or database. Automated provisioning utilizes dedicated deploy users and unique public keys.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11]">
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5 mb-1">
                    <Shield className="w-3.5 h-3.5 text-teal-400" />
                    <span>AES-256-GCM Envelope Encryption</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    All environment variables, API tokens, and private keys stored for deployment pipelines are encrypted at rest with AES-256-GCM.
                  </p>
                </div>
              </div>
              <p className="text-xs text-zinc-400">
                You are responsible for ensuring that any private repository tokens or webhook secrets configured in
                your workspace grant the minimum required scopes.
              </p>
            </section>

            {/* Section 5 */}
            <section id="acceptable-use" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  05
                </span>
                Acceptable Use Policy
              </h2>
              <p>
                You agree not to misuse the PortalOps control plane or orchestrate activities that violate applicable laws.
                Prohibited actions include:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                <li>Deploying or distributing malware, trojans, ransomware, or spyware.</li>
                <li>Using PortalOps runners or queues for unauthorized cryptocurrency mining.</li>
                <li>Conducting denial-of-service (DDoS) attacks, brute-force scans, or port fuzzing against third parties.</li>
                <li>Attempting to bypass tenant isolation boundaries, reverse engineer API controllers, or intercept neighbor traffic.</li>
                <li>Using automated provisioning setup scripts to compromise machines you do not legally own or have written permission to manage.</li>
              </ul>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Violations of our Acceptable Use Policy result in immediate workspace suspension and revocation of all deployer credentials without refund.
                </span>
              </div>
            </section>

            {/* Section 6 */}
            <section id="ownership" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  06
                </span>
                Intellectual Property &amp; Code Ownership
              </h2>
              <p>
                <strong className="text-white">Your Content:</strong> You retain 100% intellectual property rights, ownership, and copyright over
                all source code, database tables, configuration scripts, and assets you build or deploy using PortalOps.
                PortalOps claims zero ownership over your software applications.
              </p>
              <p>
                <strong className="text-white">Platform IP:</strong> PortalOps, its source code, UI designs, proprietary orchestration algorithms,
                trademarks, and logos are the intellectual property of PortalOps Control Plane and its licensors.
              </p>
            </section>

            {/* Section 7 */}
            <section id="uptime-sla" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  07
                </span>
                Service Availability &amp; Control Plane SLA
              </h2>
              <p>
                We strive for 99.9% uptime across the PortalOps control plane, queue workers, and webhook dispatchers.
                However, scheduled maintenance, upstream network outages, or DDoS events may occasionally cause transient
                dashboard unavailability.
              </p>
              <p>
                Because PortalOps operates under the BYOS architecture, <strong className="text-white">your running production sites and servers are never hosted on PortalOps infrastructure</strong>.
                If our web dashboard is offline, your websites, background worker daemons, and database services running on your Hetzner, AWS, or DigitalOcean servers continue running uninterrupted.
              </p>
            </section>

            {/* Section 8 */}
            <section id="billing" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  08
                </span>
                Platform Usage &amp; Operational Quotas
              </h2>
              <p>
                Platform features are provided according to workspace operational limits, including concurrent deployment
                workers, server connections, team seats, and build pipeline throughput.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-400">
                <li>Workspace resource limits and active node connections can be managed within Organization Settings.</li>
                <li>Your third-party cloud infrastructure costs (such as compute, storage, and bandwidth billed directly by Hetzner, AWS, or DigitalOcean) are independently managed by you through your provider accounts.</li>
                <li>PortalOps reserves the right to enforce fair-use limits on pipeline queuing to prevent abuse and maintain cluster stability.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="liability" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  09
                </span>
                Limitation of Liability &amp; Warranty Disclaimer
              </h2>
              <p className="text-xs text-zinc-400 uppercase tracking-wide leading-relaxed font-mono">
                THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND,
                WHETHER EXPRESS OR IMPLIED. TO THE MAXIMUM EXTENT PERMITTED BY LAW, PORTALOPS DISCLAIMS ALL WARRANTIES,
                INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
              </p>
              <p>
                PORTALOPS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES,
                INCLUDING LOSS OF PROFITS, DATA, USE, OR GOODWILL, ARISING FROM:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-400">
                <li>Faulty custom deploy scripts, migrations, or application code executed on your server targets.</li>
                <li>Outages, billing disputes, or data loss originating from your third-party cloud hosting providers.</li>
                <li>Accidental destruction of databases or files caused by customer deployment instructions or rollbacks.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="termination" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  10
                </span>
                Termination &amp; Workspace Suspension
              </h2>
              <p>
                You may terminate your account at any time by accessing Organization Settings and selecting
                &quot;Delete Workspace&quot;. Upon termination:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-400">
                <li>Your encrypted environment variables, tokens, and automated deployment queues will be permanently purged.</li>
                <li>PortalOps SSH deploy keys will remain on your servers until you remove them or revoke the deploy user.</li>
                <li>PortalOps reserves the right to suspend or terminate accounts that violate our Acceptable Use Policy or fail to remediate critical security threats within 48 hours of notification.</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section id="governing-law" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  11
                </span>
                Governing Law &amp; Contact Information
              </h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which
                PortalOps operates, without regard to its conflict of law provisions.
              </p>
              <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-2">
                <p className="font-semibold text-xs text-white">
                  Have questions about our Terms of Service?
                </p>
                <p className="text-xs text-zinc-400">
                  Contact our compliance and legal team directly:
                </p>
                <div className="font-mono text-xs text-teal-300 space-y-0.5">
                  <div>Email: legal@portalops.online</div>
                  <div>Support: support@portalops.online</div>
                </div>
              </div>
            </section>

            {/* Bottom Actions */}
            <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/"
                className="text-xs font-semibold text-zinc-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Home</span>
              </Link>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                <Link to="/privacy" className="text-teal-300 hover:text-[#00DF8F] transition-colors">
                  View Privacy Policy &rarr;
                </Link>
                <Link to="/security" className="text-teal-300 hover:text-[#00DF8F] transition-colors">
                  Security Architecture &rarr;
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-[#00DF8F] hover:bg-[#00c57d] text-zinc-950 font-bold transition-all shadow-md shadow-emerald-950/40"
                >
                  Create Account Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 4. Footer */}
      <PublicFooter />
    </div>
  )
}
