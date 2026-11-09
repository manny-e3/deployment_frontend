import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield,
  Lock,
  KeyRound,
  Server,
  Terminal,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Sun,
  Moon,
  ExternalLink,
  RefreshCw,
  FileCode,
  HardDrive,
  EyeOff,
  GitBranch,
  Activity,
  Check,
  Zap,
  ArrowRight
} from 'lucide-react'
import { PublicNav } from '../components/PublicNav'
import { PublicFooter } from '../components/PublicFooter'

export function SecurityArchitecture() {
  const [activeSection, setActiveSection] = useState('overview')

  const sections = [
    { id: 'overview', title: '1. Executive Summary & Principles' },
    { id: 'byos-model', title: '2. BYOS Isolation Architecture' },
    { id: 'zero-root', title: '3. Zero Root Key Storage' },
    { id: 'encryption', title: '4. Cryptographic Standards' },
    { id: 'network-defense', title: '5. Network & Edge Protections' },
    { id: 'pipeline-guardrails', title: '6. Atomic Pipeline Guardrails' },
    { id: 'identity-rbac', title: '7. Identity, JWT & RBAC' },
    { id: 'audit-logging', title: '8. Immutable Audit Trails' },
    { id: 'vulnerability-disclosure', title: '9. Responsible Disclosure & SLA' },
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
            <Shield className="w-3.5 h-3.5 text-[#00DF8F]" />
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              SECURITY WHITEPAPER &amp; THREAT MODEL
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Security Architecture &amp; Threat Model
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Detailed technical overview of our defense-in-depth posture: Bring Your Own Server (BYOS) network isolation,
            zero root key storage, AES-256-GCM envelope encryption, and atomic deployment guardrails.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-zinc-400">
            <span className="px-2.5 py-1 rounded-md bg-[#081419] border border-white/10 text-[#00DF8F]">
              Control Plane: v2.4
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#081419] border border-white/10 text-teal-300">
              Cipher: AES-256-GCM + Argon2id
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#00DF8F]/10 border border-[#00DF8F]/25 text-[#00DF8F]">
              <span className="w-2 h-2 rounded-full bg-[#00DF8F] animate-pulse" />
              <span>All Security Systems Operational</span>
            </span>
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
                  [ SECURITY PILLARS ]
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
                  <Lock className="w-3.5 h-3.5 text-[#00DF8F]" />
                  <span>Zero-Trust Baseline</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-400">
                  Your servers never expose root passwords. Workload compute remains 100% isolated inside your cloud VPC.
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
                Executive Summary &amp; Core Principles
              </h2>
              <p>
                PortalOps is architected around an uncompromising principle: <strong className="text-white">software deployment control planes should orchestrate compute without ever owning it</strong>.
                Unlike traditional PaaS providers where customer code and production databases reside inside a multi-tenant shared cluster,
                PortalOps separates the management tier (Control Plane) from the execution tier (Your Virtual Private Cloud).
              </p>

              {/* Core Pillars Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-1.5">
                  <div className="font-bold text-xs text-white flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#00DF8F]" />
                    <span>Control / Execution Decoupling</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    If PortalOps control plane is unreachable, your customer applications, databases, and cron workers on your VPS continue serving requests at full speed.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-1.5">
                  <div className="font-bold text-xs text-white flex items-center gap-2">
                    <EyeOff className="w-4 h-4 text-sky-400" />
                    <span>Zero Root Password Ingestion</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    We never record, store, or transmit your root SSH passwords. Automated provisioning provisions a dedicated unprivileged deployer user.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-1.5">
                  <div className="font-bold text-xs text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" />
                    <span>Envelope Encryption At-Rest</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    All environment variables, SSH keypairs, and secrets are encrypted with AES-256-GCM using authenticated 96-bit random initialization vectors.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-1.5">
                  <div className="font-bold text-xs text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <span>Defense-in-Depth Observability</span>
                  </div>
                  <p className="text-xs text-zinc-400">
                    Every state-altering event (deployments, secret edits, key generation, user elevation) is committed to an immutable append-only audit trail.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="byos-model" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  02
                </span>
                BYOS (Bring Your Own Server) Isolation Architecture
              </h2>
              <p>
                In the PortalOps architecture, your target infrastructure (virtual machines, Bare Metal nodes, AWS EC2,
                Hetzner Cloud, DigitalOcean Droplets) communicates with the PortalOps control plane exclusively via encrypted
                SSH channels.
              </p>

              {/* Architecture Diagram Visualization */}
              <div className="p-5 rounded-xl border border-white/10 bg-[#040A0D] text-white font-mono text-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-zinc-400 font-bold uppercase tracking-wider text-[11px]">
                    System Boundaries &amp; Data Flow
                  </span>
                  <span className="text-[#00DF8F] text-[11px] font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00DF8F] animate-pulse" />
                    TLS 1.3 + SSH Ed25519
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#081419] border border-white/10 space-y-1.5">
                    <div className="text-teal-300 font-bold text-xs flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5" />
                      <span>Control Plane</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">portalops.online</div>
                    <div className="text-[10px] text-zinc-500">• Web Console &amp; REST API</div>
                    <div className="text-[10px] text-zinc-500">• Dispatcher &amp; Job Queues</div>
                    <div className="text-[10px] text-zinc-500">• Encrypted Key Vault</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#081419] border border-teal-500/30 space-y-1.5 text-center flex flex-col justify-center">
                    <div className="text-[#00DF8F] font-bold text-xs">Secure Boundary</div>
                    <div className="text-[10px] text-zinc-400">Strict Key Exchange</div>
                    <div className="text-[10px] text-zinc-500">Non-Root SSH Connection</div>
                    <div className="text-[10px] text-zinc-500">Zero Inbound Ports on API</div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#081419] border border-white/10 space-y-1.5">
                    <div className="text-emerald-400 font-bold text-xs flex items-center gap-1.5">
                      <Server className="w-3.5 h-3.5" />
                      <span>Customer Compute (BYOS)</span>
                    </div>
                    <div className="text-[11px] text-zinc-400">Hetzner / DO / AWS / Metal</div>
                    <div className="text-[10px] text-zinc-500">• portalops system user</div>
                    <div className="text-[10px] text-zinc-500">• Atomic Symlink Releases</div>
                    <div className="text-[10px] text-zinc-500">• Direct Visitor Traffic</div>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-zinc-400 leading-normal border-t border-white/5">
                  <strong>Key Takeaway:</strong> Customer web visitors route traffic directly to your VPS IP or Cloudflare proxy.
                  Production web traffic never passes through PortalOps servers.
                </div>
              </div>
            </section>

            {/* Section 3 */}
            <section id="zero-root" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  03
                </span>
                Zero Root Key Storage &amp; Provisioning Handshake
              </h2>
              <p>
                A core vector in traditional server management panels is the storage of root credentials.
                PortalOps eliminates this vulnerability through a cryptographically signed 1-line installation handshake:
              </p>

              <div className="p-4 rounded-xl bg-[#040A0D] border border-white/10 font-mono text-xs text-zinc-300 space-y-2">
                <div className="text-teal-300 font-semibold text-[11px] uppercase tracking-wide">
                  Server Provisioning Workflow:
                </div>
                <div className="text-zinc-400">
                  1. User requests server provisioning &rarr; API generates ephemeral <strong>setupToken</strong> (expires in 15 min).
                </div>
                <div className="text-zinc-400">
                  2. User runs: <span className="text-[#00DF8F]">curl -fsSL https://portalops.online/setup.sh | bash</span> on target node.
                </div>
                <div className="text-zinc-400">
                  3. Setup script creates isolated Linux user: <span className="text-white">useradd -m -s /bin/bash portalops</span>.
                </div>
                <div className="text-zinc-400">
                  4. Control plane public key is appended to <span className="text-white">~portalops/.ssh/authorized_keys</span>.
                </div>
                <div className="text-zinc-400">
                  5. Minimal sudoers permissions are granted strictly for Nginx reload and systemctl service restarts.
                </div>
                <div className="text-emerald-400">
                  6. Handshake callback confirms connection &rarr; setupToken is permanently invalidated and destroyed.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#005459]/20 border border-[#005459]/40 text-xs text-teal-200">
                <strong>Instant Revocation:</strong> You can completely sever PortalOps access at any second by simply deleting
                the <code className="bg-[#040A0D] px-1.5 py-0.5 rounded text-white font-mono">portalops</code> user or clearing its <code className="bg-[#040A0D] px-1.5 py-0.5 rounded text-white font-mono">~/.ssh/authorized_keys</code> file.
              </div>
            </section>

            {/* Section 4 */}
            <section id="encryption" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  04
                </span>
                Cryptographic Standards &amp; Secret Vault
              </h2>
              <p>
                All sensitive data at rest and in transit is protected using modern, NIST-approved cryptographic primitives:
              </p>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#050D11]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#081419] text-zinc-300 font-semibold">
                      <th className="p-3">Data Domain</th>
                      <th className="p-3">Algorithm / Primitive</th>
                      <th className="p-3">Key Size / Parameters</th>
                      <th className="p-3">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    <tr>
                      <td className="p-3 text-white font-sans">Environment Variables &amp; Secrets</td>
                      <td className="p-3 text-[#00DF8F]">AES-256-GCM</td>
                      <td className="p-3 text-zinc-400">256-bit Key + 96-bit IV</td>
                      <td className="p-3 text-zinc-400 font-sans">Authenticated encryption for .env keys</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white font-sans">User Passwords</td>
                      <td className="p-3 text-[#00DF8F]">Argon2id</td>
                      <td className="p-3 text-zinc-400">m=65536, t=3, p=4</td>
                      <td className="p-3 text-zinc-400 font-sans">Memory-hard password hashing against GPU brute force</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white font-sans">SSH Host Keys</td>
                      <td className="p-3 text-[#00DF8F]">Ed25519 / RSA</td>
                      <td className="p-3 text-zinc-400">256-bit Edwards / 4096-bit</td>
                      <td className="p-3 text-zinc-400 font-sans">High-speed, side-channel immune host authentication</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white font-sans">Transport Security</td>
                      <td className="p-3 text-[#00DF8F]">TLS 1.3</td>
                      <td className="p-3 text-zinc-400">ECDHE + AES-128/256-GCM</td>
                      <td className="p-3 text-zinc-400 font-sans">End-to-end transport encryption with Perfect Forward Secrecy</td>
                    </tr>
                    <tr>
                      <td className="p-3 text-white font-sans">Git Webhook Signatures</td>
                      <td className="p-3 text-[#00DF8F]">HMAC-SHA256</td>
                      <td className="p-3 text-zinc-400">256-bit Shared Secret</td>
                      <td className="p-3 text-zinc-400 font-sans">Tamper-proof payload verification from GitHub/GitLab</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 5 */}
            <section id="network-defense" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  05
                </span>
                Network &amp; Edge Protections
              </h2>
              <p>
                The PortalOps control plane API is protected behind a multi-layered edge defensive perimeter:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400 text-xs sm:text-[13px]">
                <li><strong className="text-white">Edge Shielding &amp; DDoS Mitigation:</strong> Global Anycast network proxying with automated Layer 3/4 and Layer 7 volumetric attack filtration.</li>
                <li><strong className="text-white">IP-Based Rate Limiting:</strong> Tiered rate limiters protect authentication endpoints against credential stuffing and brute force attempts.</li>
                <li><strong className="text-white">Strict CORS &amp; CSP:</strong> Cross-Origin Resource Sharing is locked down exclusively to authenticated PortalOps origins.</li>
                <li><strong className="text-white">Worker Process Sandboxing:</strong> Background queue jobs executing deployment scripts run in unprivileged containers with isolated file namespaces.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="pipeline-guardrails" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  06
                </span>
                Atomic Pipeline Guardrails &amp; Rollbacks
              </h2>
              <p>
                Deploying software directly to live production servers without downtime requires strict atomic primitives:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-2">
                  <div className="font-bold text-xs text-teal-300">1. Isolated Assembly</div>
                  <p className="text-[11px] text-zinc-400">
                    Each commit is cloned into a unique <code className="text-white font-mono">/releases/timestamp</code> folder. Dependencies, builds, and migrations execute entirely inside this sandbox.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-2">
                  <div className="font-bold text-xs text-[#00DF8F]">2. &lt;1ms Atomic Swap</div>
                  <p className="text-[11px] text-zinc-400">
                    Once all preflight assertions succeed, the pointer swap (<code className="text-white font-mono">ln -sfn release /current</code>) executes instantaneously. Zero dropped requests.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-[#050D11] space-y-2">
                  <div className="font-bold text-xs text-amber-400">3. Rollback Guard</div>
                  <p className="text-[11px] text-zinc-400">
                    If an HTTP health check returns a 5xx error immediately after switch, the symlink pointer is automatically reverted to the previous healthy release.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 7 */}
            <section id="identity-rbac" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  07
                </span>
                Identity, JWT &amp; Role-Based Access Control (RBAC)
              </h2>
              <p>
                Access to servers and deployment pipelines is governed by strict Role-Based Access Control:
              </p>

              <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#050D11]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-[#081419] text-zinc-300 font-semibold">
                      <th className="p-3">Role</th>
                      <th className="p-3">Provision Servers</th>
                      <th className="p-3">Trigger Deployments</th>
                      <th className="p-3">View Secrets (.env)</th>
                      <th className="p-3">Manage Team &amp; Billing</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    <tr>
                      <td className="p-3 font-bold text-[#00DF8F]">Owner</td>
                      <td className="p-3 text-emerald-400">Yes</td>
                      <td className="p-3 text-emerald-400">Yes</td>
                      <td className="p-3 text-emerald-400">Yes (Full)</td>
                      <td className="p-3 text-emerald-400">Yes</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-teal-300">Admin</td>
                      <td className="p-3 text-emerald-400">Yes</td>
                      <td className="p-3 text-emerald-400">Yes</td>
                      <td className="p-3 text-emerald-400">Yes</td>
                      <td className="p-3 text-rose-400">No</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-white">Member</td>
                      <td className="p-3 text-rose-400">No</td>
                      <td className="p-3 text-emerald-400">Yes</td>
                      <td className="p-3 text-zinc-400">Masked</td>
                      <td className="p-3 text-rose-400">No</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-bold text-zinc-400">Deployer</td>
                      <td className="p-3 text-rose-400">No</td>
                      <td className="p-3 text-emerald-400">Yes (Webhook)</td>
                      <td className="p-3 text-rose-400">No</td>
                      <td className="p-3 text-rose-400">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 8 */}
            <section id="audit-logging" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  08
                </span>
                Immutable Audit Trails
              </h2>
              <p>
                Every administrative or deployment event in PortalOps produces a non-repudiable audit event.
                Logs are sanitized in-flight via automated regex pattern matching to ensure API tokens, database passwords,
                and private keys are never written to disk or console output.
              </p>
            </section>

            {/* Section 9 */}
            <section id="vulnerability-disclosure" className="scroll-mt-28 p-6 sm:p-8 rounded-2xl border border-white/10 bg-[#081419] shadow-xl space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-[#005459]/40 border border-teal-500/40 text-[#00DF8F] text-xs font-mono font-bold flex items-center justify-center">
                  09
                </span>
                Responsible Disclosure &amp; Security SLA
              </h2>
              <p>
                We welcome independent security researchers and customers to inspect and test our security boundaries:
              </p>
              <div className="p-4 rounded-xl bg-[#050D11] border border-white/10 space-y-3 text-xs text-zinc-300">
                <ul className="list-disc pl-4 space-y-1.5 text-zinc-400">
                  <li>Email your proof-of-concept and technical details to <strong className="font-mono text-[#00DF8F]">security@portalops.online</strong>.</li>
                  <li>Do not access or modify data belonging to other workspaces or perform destructive actions against shared infrastructure.</li>
                  <li>We commit to acknowledging all responsible disclosures within <strong>24 hours</strong> and delivering a preliminary triage assessment within <strong>48 hours</strong>.</li>
                </ul>
                <div className="pt-2 font-mono text-xs text-[#00DF8F]">
                  Security Operations: security@portalops.online
                </div>
              </div>
            </section>

            {/* Bottom Actions Card */}
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
                  Privacy Policy &rarr;
                </Link>
                <Link to="/terms" className="text-teal-300 hover:text-[#00DF8F] transition-colors">
                  Terms of Service &rarr;
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-[#00DF8F] hover:bg-[#00c57d] text-zinc-950 font-bold transition-all shadow-md shadow-emerald-950/40"
                >
                  Get Started Free
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
