import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  Lock,
  Eye,
  Server,
  Database,
  CheckCircle2,
  ArrowLeft,
  Sun,
  Moon,
  Mail,
  FileCheck,
  ArrowRight
} from 'lucide-react'
import { PublicNav } from '../components/PublicNav'
import { PublicFooter } from '../components/PublicFooter'

export function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', title: '1. Privacy Overview & Scope' },
    { id: 'data-collected', title: '2. Information We Collect' },
    { id: 'data-not-collected', title: '3. What We Do NOT Collect' },
    { id: 'data-use', title: '4. How We Use Your Data' },
    { id: 'encryption-security', title: '5. Encryption & Security Standards' },
    { id: 'cookies', title: '6. Cookies & Client Storage' },
    { id: 'subprocessors', title: '7. Third-Party Subprocessors' },
    { id: 'data-retention', title: '8. Data Retention & Deletion' },
    { id: 'user-rights', title: '9. GDPR & CCPA Rights' },
    { id: 'contact', title: '10. Contact & Data Officer' },
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
            <Lock className="w-3.5 h-3.5 text-[#00DF8F]" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              DATA PROTECTION &amp; PRIVACY PROTOCOL
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Your data sovereignty is our architectural foundation. We believe deployment control planes must collect
            the minimum metadata necessary to orchestrate releases, while never intercepting or storing end-user traffic.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
            <span className="px-2.5 py-1 rounded-md bg-[#081419] border border-white/10 text-[#00DF8F]">
              Effective Date: November 1, 2026
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#081419] border border-white/10 text-teal-300">
              Regulation: GDPR &amp; CCPA Compliant
            </span>
            <Link to="/terms" className="text-teal-300 hover:text-[#00DF8F] transition-colors flex items-center gap-1 font-sans">
              <span>View Terms of Service</span>
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
                  [ PRIVACY INDEX ]
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
                  <span>Zero Data Snooping</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  PortalOps does not proxy your customer web traffic. Your visitor data never touches our database or logs.
                </p>
              </div>
            </div>
          </aside>

          {/* Right Document Body */}
          <div className="lg:col-span-8 space-y-10 text-sm text-zinc-300 leading-relaxed text-left">
            {/* Section 1 */}
            <section id="overview" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  01
                </span>
                Privacy Overview &amp; Scope
              </h2>
              <p>
                This Privacy Policy outlines how PortalOps (&quot;we&quot;, &quot;our&quot;, or &quot;the Service&quot;) collects,
                uses, and safeguards information when you register an account, configure servers, manage deployment pipelines,
                and communicate with our team.
              </p>
              <p>
                PortalOps operates under the <strong className="text-white">Bring Your Own Server (BYOS)</strong> architectural model.
                Because your applications, websites, and database storage execute exclusively on your own cloud instances
                (such as Hetzner, AWS, DigitalOcean, or Bare Metal), <strong className="text-white">we do not collect, intercept, inspect, or sell data belonging to your end-users or application visitors</strong>.
              </p>
            </section>

            {/* Section 2 */}
            <section id="data-collected" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  02
                </span>
                Information We Collect
              </h2>
              <p>
                We only collect information essential for provisioning infrastructure, maintaining your team workspace,
                and executing build pipelines:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-1.5">
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-[#00DF8F]" />
                    <span>Account Profile Data</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Full name, email address, hashed passwords (Argon2id), organization name, and workspace membership roles.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-1.5">
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-teal-400" />
                    <span>Server Connection Metadata</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Server IP address, SSH port, provider name (e.g., Hetzner, DO), operating system release, and generated public SSH keys.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-1.5">
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-sky-400" />
                    <span>Deployment &amp; Telemetry Logs</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Build execution stdout/stderr logs, commit hashes, branch names, deployment durations, CPU load averages, and RAM usage percentages.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-1.5">
                  <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-purple-400" />
                    <span>Encrypted Environment Secrets</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    User-configured environment variables and webhook secrets. Encrypted at rest using AES-256-GCM authenticated cipher.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="data-not-collected" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  03
                </span>
                What We Do NOT Collect
              </h2>
              <p>
                To provide absolute peace of mind for engineering teams, our software architecture enforces hard technical limits:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-300">
                <li><strong className="text-white">Zero Root Passwords:</strong> We never prompt for, receive, or store your root Linux passwords. Provisioning occurs exclusively via dedicated non-root users.</li>
                <li><strong className="text-white">Zero Customer Application Traffic:</strong> Web requests made by visitors to your sites connect directly to your server IP or your Cloudflare proxy. They never touch PortalOps infrastructure.</li>
                <li><strong className="text-white">Zero Customer Database Records:</strong> We do not inspect, query, or store records from your customer relational databases (MySQL, PostgreSQL, MongoDB, Redis).</li>
                <li><strong className="text-white">Zero Repository Retention:</strong> Your source code repositories are cloned ephemerally to your own target server directories. PortalOps never caches or stores your codebase on its control plane.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="data-use" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  04
                </span>
                How We Use Your Data
              </h2>
              <p>
                We use collected information solely to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                <li>Authenticate your identity and manage team workspace memberships.</li>
                <li>Dispatch deployment commands across your target servers via secure SSH.</li>
                <li>Trigger automated atomic symlink swaps upon receiving authenticated Git push webhooks.</li>
                <li>Deliver real-time telemetry metrics (CPU, RAM, Disk) to your console dashboard.</li>
                <li>Detect malicious activities, unauthorized access attempts, and enforce tenant rate-limiting.</li>
                <li>Send transactional notifications (e.g., failed builds, email confirmations, password resets).</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section id="encryption-security" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  05
                </span>
                Encryption &amp; Security Standards
              </h2>
              <p>
                All data handled by PortalOps is protected in accordance with industry best practices:
              </p>
              <div className="space-y-3 pt-1">
                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-1">
                  <div className="font-semibold text-xs text-white">Encryption In Transit:</div>
                  <p className="text-xs text-zinc-400">
                    All HTTPS traffic to PortalOps web console and API endpoints requires TLS 1.3 with modern AEAD cipher suites (Perfect Forward Secrecy). Unencrypted HTTP is permanently rejected with HSTS.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-1">
                  <div className="font-semibold text-xs text-white">Encryption At Rest:</div>
                  <p className="text-xs text-zinc-400">
                    Stored environment variables, provider credentials, and SSH keys are encrypted using AES-256-GCM. The initialization vectors (IVs) and authentication tags ensure tamper-evident ciphertext.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-1">
                  <div className="font-semibold text-xs text-white">Password Hashing:</div>
                  <p className="text-xs text-zinc-400">
                    User authentication utilizes Argon2id with recommended memory-hard cost parameters (m=65536, t=3, p=4) and cryptographically random unique salts.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="cookies" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  06
                </span>
                Cookies &amp; Local Storage
              </h2>
              <p>
                PortalOps does not use third-party tracking or advertising cookies. We only use essential browser storage:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs text-zinc-400">
                <li><strong className="text-zinc-200">portalops_token:</strong> Authentication JWT stored in localStorage to maintain your logged-in session.</li>
                <li><strong className="text-zinc-200">portalops_active_workspace:</strong> Remembers your currently selected client or organization workspace.</li>
                <li><strong className="text-zinc-200">portalops_theme:</strong> Stores your preference for Light or Dark theme appearance.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section id="subprocessors" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  07
                </span>
                Third-Party Subprocessors
              </h2>
              <p>
                We only partner with industry-leading infrastructure providers that maintain strict data processing standards:
              </p>
              <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#050D11]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#081419] text-zinc-300 font-semibold">
                      <th className="p-3">Subprocessor</th>
                      <th className="p-3">Purpose</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    <tr>
                      <td className="p-3 text-white font-sans">Cloudflare, Inc.</td>
                      <td className="p-3 text-zinc-400 font-sans">DDoS protection, DNS &amp; Edge CDN</td>
                      <td className="p-3 text-zinc-400">Global Anycast</td>
                      <td className="p-3 text-[#00DF8F]">SOC 2, ISO 27001</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white font-sans">Hetzner Online GmbH</td>
                      <td className="p-3 text-zinc-400 font-sans">Control plane database &amp; queue servers</td>
                      <td className="p-3 text-zinc-400">Germany &amp; Finland</td>
                      <td className="p-3 text-[#00DF8F]">GDPR, ISO 27001</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white font-sans">Hostinger / Resend</td>
                      <td className="p-3 text-zinc-400 font-sans">Transactional email delivery &amp; confirmations</td>
                      <td className="p-3 text-zinc-400">EU / US</td>
                      <td className="p-3 text-[#00DF8F]">GDPR Compliant</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 8 */}
            <section id="data-retention" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  08
                </span>
                Data Retention &amp; Deletion
              </h2>
              <p>
                We retain your metadata only as long as your workspace account is active:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                <li><strong className="text-white">Account Termination:</strong> When you delete your workspace, all associated server records, encrypted environment secrets, and webhook tokens are permanently purged within 24 hours.</li>
                <li><strong className="text-white">Deployment Logs:</strong> Build logs are automatically rotated and deleted after 90 days.</li>
                <li><strong className="text-white">Server Autonomy:</strong> Deleting a server from PortalOps does not destroy your underlying cloud machine. It simply deletes our connection credentials.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section id="user-rights" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  09
                </span>
                GDPR &amp; CCPA User Rights
              </h2>
              <p>
                Under the General Data Protection Regulation (GDPR) and California Consumer Privacy Act (CCPA), you have the right to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-300">
                <li>Request access to the personal data we maintain about you.</li>
                <li>Request rectification of inaccurate or outdated information.</li>
                <li>Request permanent deletion (&quot;Right to be Forgotten&quot;) of your account data.</li>
                <li>Request data portability in standard JSON machine-readable format.</li>
                <li>Withdraw consent for optional transactional notifications at any time.</li>
              </ul>
            </section>

            {/* Section 10 */}
            <section id="contact" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  10
                </span>
                Contact Our Data Protection Officer
              </h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or your rights under GDPR/CCPA,
                contact our security and privacy team:
              </p>
              <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-2">
                <div className="font-mono text-xs text-teal-300 space-y-0.5">
                  <div>Data Protection Officer: <span className="text-white">dpo@portalops.online</span></div>
                  <div>Privacy &amp; Compliance: <span className="text-white">privacy@portalops.online</span></div>
                  <div>Security Operations: <span className="text-white">security@portalops.online</span></div>
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
                <Link to="/terms" className="text-teal-300 hover:text-[#00DF8F] transition-colors">
                  Terms of Service &rarr;
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
