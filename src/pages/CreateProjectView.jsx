import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  FolderGit2,
  GitBranch,
  KeyRound,
  Copy,
  Check,
  CheckCircle2,
  ArrowLeft,
  RotateCcw,
  Rocket,
  Loader2,
  AlertCircle,
  Atom,
  Layers,
  Terminal,
  FileCode2,
  Zap,
  Info,
  Globe
} from 'lucide-react'
import { api } from '../services/api'
import { OneTimeSecretModal } from '../components/OneTimeSecretModal'

export const FRAMEWORKS = [
  {
    id: 'react',
    name: 'React.js / Vite SPA',
    badge: 'Single Page App',
    badgeColor: 'bg-[#E2F0FD] text-[#005459] border-[#BEDDF7]',
    description: 'React SPA (Vite / CRA) with client-side routing, dependency installation, and static asset deployment.',
    icon: Atom,
  },
  {
    id: 'laravel',
    name: 'Laravel / PHP',
    badge: 'Fullstack / API',
    badgeColor: 'bg-[#FAF0E6] text-[#A0522D] border-[#F5DEB3]',
    description: 'Laravel framework with Composer dependencies, database migrations, and artisan cache optimization.',
    icon: Layers,
  },
  {
    id: 'node',
    name: 'Node.js / Express',
    badge: 'Backend Service',
    badgeColor: 'bg-[#EAF5EE] text-[#2E8B57] border-[#B8E0C5]',
    description: 'Node.js API or microservice managed with PM2 process manager for continuous background execution.',
    icon: Terminal,
  },
  {
    id: 'custom',
    name: 'Custom / Static',
    badge: 'Universal',
    badgeColor: 'bg-[#F4F6F5] text-[#565f6b] border-[#CDD4D0]',
    description: 'Generic HTML/CSS or custom script deployment with full lifecycle hook freedom.',
    icon: FileCode2,
  },
]

export function CreateProjectView() {
  const navigate = useNavigate()
  const [webhookModal, setWebhookModal] = useState({ isOpen: false, secret: '', projectId: '' })

  // Framework selection
  const [selectedFramework, setSelectedFramework] = useState('react')

  // Form State
  const [projectName, setProjectName] = useState('')
  const [defaultBranch, setDefaultBranch] = useState('main')
  const [repoUrl, setRepoUrl] = useState('')
  const [projectUrl, setProjectUrl] = useState('')
  const [autoDeploy, setAutoDeploy] = useState(true)
  const [copiedKey, setCopiedKey] = useState(false)
  const [copiedRepo, setCopiedRepo] = useState(false)
  const [isTestingRepo, setIsTestingRepo] = useState(false)
  const [isRepoVerified, setIsRepoVerified] = useState(false)
  const [deployPublicKey, setDeployPublicKey] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  // Fetch deploy key from backend
  useEffect(() => {
    const loadKey = async () => {
      try {
        const keyData = await api('/settings/deploy-key')
        if (keyData?.publicKey) {
          setDeployPublicKey(keyData.publicKey)
        }
      } catch {
        // Deploy key endpoint may not exist yet
      }
    }
    loadKey()
  }, [])

  const handleCopy = (text, type) => {
    navigator.clipboard?.writeText(text)
    if (type === 'key') {
      setCopiedKey(true)
      setTimeout(() => setCopiedKey(false), 2000)
    } else if (type === 'repo') {
      setCopiedRepo(true)
      setTimeout(() => setCopiedRepo(false), 2000)
    }
  }

  const handleTestRepo = async () => {
    if (!repoUrl) return
    setIsTestingRepo(true)
    setIsRepoVerified(false)
    try {
      const res = await api('/projects/test-repo', {
        method: 'POST',
        body: { repoUrl },
      })
      setIsRepoVerified(res?.accessible === true)
    } catch {
      setIsRepoVerified(false)
    } finally {
      setIsTestingRepo(false)
    }
  }

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      setSubmitError('Project name is required.')
      return
    }
    if (!repoUrl.trim()) {
      setSubmitError('Repository URL is required.')
      return
    }
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const res = await api('/projects', {
        method: 'POST',
        body: {
          name: projectName.trim(),
          repoUrl: repoUrl.trim(),
          defaultBranch: defaultBranch.trim() || 'main',
          autoDeploy: autoDeploy,
        },
      })

      if (res?.id) {
        localStorage.setItem(`project_framework_${res.id}`, selectedFramework)
        if (projectUrl.trim()) {
          localStorage.setItem(`project_url_${res.id}`, projectUrl.trim())
        }
      }

      if (res?.webhookSecret) {
        setWebhookModal({
          isOpen: true,
          secret: res.webhookSecret,
          projectId: res.id,
        })
      } else {
        navigate(`/projects/${res?.id || ''}`, { state: { framework: selectedFramework } })
      }
    } catch (err) {
      setSubmitError(err.message || 'Failed to create project. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedFw = FRAMEWORKS.find((f) => f.id === selectedFramework) || FRAMEWORKS[0]
  const FwIcon = selectedFw.icon

  const isFormValid = Boolean(projectName.trim() && repoUrl.trim())

  return (
    <div className="space-y-6 max-w-[1240px] mx-auto pb-20">
      {/* Top Header & Breadcrumb */}
      <div>
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#565f6b]">
          <Link to="/projects" className="hover:text-[#101d26] transition-colors">
            Projects
          </Link>
          <span>/</span>
          <span className="text-[#101d26] font-medium">New project</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-2">
          <div>
            <h1 className="text-[26px] font-bold text-[#101d26] tracking-tight">
              Create new project
            </h1>
            <p className="text-[13px] text-[#565f6b] mt-1">
              Configure code source, automated build hooks, remote SSH execution, and encrypted secrets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/projects')}
              className="h-[34px] px-3.5 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#101d26] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </button>
            <button
              type="button"
              onClick={handleCreateProject}
              disabled={isSubmitting || !isFormValid}
              className="h-[34px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Provisioning...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Project Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-[#E2E7E4] flex items-center justify-between bg-[#FAFBFB]">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-[5px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
                  <FolderGit2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-semibold text-[14px] text-[#101d26]">
                    Application Architecture &amp; Source Repository
                  </h2>
                  <p className="text-[12px] text-[#565f6b] mt-0.5">
                    Select your target runtime stack and provide git credentials for automated pulls.
                  </p>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-[4px] font-mono text-[10px] font-semibold border ${isFormValid
                    ? 'bg-[#EAF5EE] text-[#2E8B57] border-[#B8E0C5]'
                    : 'bg-[#F4F6F5] text-[#565f6b] border-[#CDD4D0]'
                  }`}
              >
                {isFormValid ? '✓ READY' : 'PROJECT SETUP'}
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Framework Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] font-mono uppercase font-semibold text-[#565f6b]">
                    APPLICATION FRAMEWORK <span className="text-[#C2412D]">*</span>
                  </label>
                  <span className="text-[11px] text-[#565f6b]">
                    Loads build scripts and recommended environment keys
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {FRAMEWORKS.map((fw) => {
                    const isSelected = selectedFramework === fw.id
                    const IconComponent = fw.icon
                    return (
                      <button
                        key={fw.id}
                        type="button"
                        onClick={() => setSelectedFramework(fw.id)}
                        className={`text-left p-3 rounded-[8px] border transition-all cursor-pointer relative ${isSelected
                            ? 'border-[#005459] bg-[#F0F8F8] ring-2 ring-[#005459]/20 shadow-xs'
                            : 'border-[#CDD4D0] bg-[#FFFFFF] hover:border-[#8F9CA7] hover:bg-[#FAFBFB]'
                          }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div
                            className={`w-7 h-7 rounded-[6px] flex items-center justify-center ${isSelected ? 'bg-[#005459] text-white' : 'bg-[#F4F6F5] text-[#565f6b]'
                              }`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>
                          <span
                            className={`text-[9px] font-mono uppercase font-semibold px-1.5 py-0.5 rounded border ${fw.badgeColor}`}
                          >
                            {fw.badge}
                          </span>
                        </div>
                        <div className="font-semibold text-[13px] text-[#101d26]">
                          {fw.name}
                        </div>
                        <p className="text-[11px] text-[#565f6b] mt-1 line-clamp-2 leading-relaxed">
                          {fw.description}
                        </p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Project Name & Default Branch */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-medium text-[#101d26]">
                      Project Name <span className="text-[#C2412D]">*</span>
                    </label>
                    {projectName && (
                      <span className="text-[10px] font-mono text-[#565f6b]">
                        slug: {projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g. travaiq-react-frontend"
                    className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-1 focus:ring-[#005459]"
                    required
                  />
                </div>
                <div className="md:col-span-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[12px] font-medium text-[#101d26]">
                      Default Git Branch
                    </label>
                    <span className="px-1.5 py-0.5 rounded-[3px] bg-[#F4F6F5] text-[10px] font-mono text-[#565f6b] border border-[#E2E7E4]">
                      HEAD
                    </span>
                  </div>
                  <div className="relative">
                    <GitBranch className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565f6b]" />
                    <input
                      type="text"
                      value={defaultBranch}
                      onChange={(e) => setDefaultBranch(e.target.value)}
                      className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-1 focus:ring-[#005459]"
                    />
                  </div>
                </div>
              </div>

              {/* Repository URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-medium text-[#101d26]">
                    Git Repository URL <span className="text-[#C2412D]">*</span>
                  </label>
                  <span className="text-[11px] text-[#565f6b]">
                    Supports GitHub, GitLab, Bitbucket, Gitea
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <FolderGit2 className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565f6b]" />
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => {
                        setRepoUrl(e.target.value)
                        setIsRepoVerified(false)
                      }}
                      placeholder="git@github.com:organization/project.git or https://github.com/..."
                      className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-1 focus:ring-[#005459]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(repoUrl, 'repo')}
                    disabled={!repoUrl}
                    className="h-[36px] px-3 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#101d26] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {copiedRepo ? <Check className="w-3.5 h-3.5 text-[#2E8B57]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy</span>
                  </button>
                  {/* <button
                    type="button"
                    onClick={handleTestRepo}
                    disabled={isTestingRepo || !repoUrl}
                    className="h-[36px] px-3.5 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#101d26] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isTestingRepo ? 'animate-spin' : ''}`} />
                    <span>{isTestingRepo ? 'Verifying...' : 'Test access'}</span>
                  </button> */}
                </div>
              </div>

              {/* Project Public URL / Domain */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[12px] font-medium text-[#101d26]">
                    Project Public URL / Domain (Optional)
                  </label>
                  <span className="text-[11px] text-[#565f6b]">
                    Default address checked by post-deploy reachability probes
                  </span>
                </div>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#565f6b]" />
                  <input
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="e.g. https://myproject.com or http://localhost/kensite"
                    className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-1 focus:ring-[#005459]"
                  />
                </div>
              </div>

              {/* Git Verification Status Banner */}
              {isRepoVerified && (
                <div className="p-3 rounded-[6px] bg-[#EAF5EE] border border-[#B8E0C5] text-[#2E8B57] text-[12px] flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E8B57]" />
                  <span>Access verified successfully! Repository is reachable on branch <strong>{defaultBranch || 'main'}</strong>.</span>
                </div>
              )}

              {/* Public Deploy Key Card */}
              {deployPublicKey ? (
                <div className="p-4 rounded-[6px] bg-[#F0F8F8] border border-[#BEDDF7] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[#005459] font-medium text-[12px]">
                      <KeyRound className="w-4 h-4" />
                      <span>Cluster Public SSH Deploy Key (Read-Only)</span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-[#FFFFFF] border border-[#BEDDF7] font-mono text-[10px] text-[#005459]">
                      ED25519
                    </span>
                  </div>
                  <p className="text-[12px] text-[#565f6b]">
                    Add this public key to your repository's <strong>Settings → Deploy Keys</strong> with read-only access so Deploy Portal can pull code:
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 rounded-[4px] bg-[#FFFFFF] border border-[#BEDDF7] font-mono text-[11px] text-[#101d26] break-all select-all">
                      {deployPublicKey}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(deployPublicKey, 'key')}
                      className="h-[32px] px-3 rounded-[4px] bg-[#005459] hover:bg-[#0B5459] text-white text-[11px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>Copy Key</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-[6px] bg-[#F4F6F5] border border-[#CDD4D0] flex items-center gap-3 text-[12px] text-[#565f6b]">
                  <KeyRound className="w-4 h-4 text-[#565f6b] shrink-0" />
                  <span>SSH deploy key not detected. Deploy Portal will use system default authentication or token credentials.</span>
                </div>
              )}

              {/* Auto Deploy Toggle */}
              <div className="pt-3 border-t border-[#E2E7E4] flex items-center justify-between">
                <div>
                  <label className="text-[13px] font-medium text-[#101d26] flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#005459]" />
                    <span>Automatic Git Webhook Deployments</span>
                  </label>
                  <p className="text-[12px] text-[#565f6b] mt-0.5">
                    Automatically trigger production build &amp; deploy whenever new commits are pushed.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoDeploy}
                    onChange={(e) => setAutoDeploy(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-[#CDD4D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#005459]"></div>
                </label>
              </div>

              {/* Error Banner if any */}
              {submitError && (
                <div className="p-3.5 rounded-[6px] bg-[#FAEBE9] border border-[#F1B5AC] text-[#BA1A1A] text-[13px] flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}
            </div>

            {/* Form Footer */}
            <div className="px-6 py-4 bg-[#FAFBFB] border-t border-[#E2E7E4] flex items-center justify-between">
              <button
                type="button"
                onClick={() => navigate('/projects')}
                className="h-[36px] px-3.5 rounded-[6px] bg-[#FFFFFF] border border-[#CDD4D0] hover:bg-[#F4F6F5] text-[#101d26] text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={isSubmitting || !isFormValid}
                className="h-[36px] px-5 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[12px] font-medium flex items-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Project...</span>
                  </>
                ) : (
                  <>
                    <Rocket className="w-3.5 h-3.5" />
                    <span>Create Project</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Sticky Project Blueprint & Readiness Checklist (4 cols) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
          {/* Project Blueprint Card */}
          <div className="bg-[#FFFFFF] border border-[#CDD4D0] rounded-[8px] p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E7E4]">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-[4px] bg-[#005459] text-white flex items-center justify-center">
                  <FwIcon className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-[13px] text-[#101d26]">
                  Project Blueprint
                </h3>
              </div>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${selectedFw.badgeColor}`}>
                {selectedFw.id.toUpperCase()}
              </span>
            </div>

            {/* Spec details */}
            <div className="space-y-3 text-[12px]">
              <div>
                <span className="text-[10px] font-mono uppercase text-[#565f6b] block">PROJECT NAME</span>
                <span className="font-semibold text-[#101d26] break-all">{projectName || '—'}</span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#565f6b] block">SOURCE GIT REPO</span>
                <span className="font-mono text-[11px] text-[#101d26] break-all block truncate">
                  {repoUrl || 'Not configured'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono uppercase text-[#565f6b] block">DEFAULT BRANCH</span>
                <span className="font-mono text-[11px] text-[#005459]">
                  {defaultBranch || 'main'}
                </span>
              </div>
            </div>

            {/* Pipeline Readiness Checklist */}
            <div className="pt-3 border-t border-[#E2E7E4] space-y-2">
              <span className="text-[10px] font-mono uppercase text-[#565f6b] font-bold block">
                READINESS CHECKLIST
              </span>
              <ul className="space-y-1.5 text-[11px]">
                <li className="flex items-center gap-2">
                  {projectName.trim() ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B57]" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[#CDD4D0]" />
                  )}
                  <span className={projectName.trim() ? 'text-[#101d26]' : 'text-[#8F9CA7]'}>
                    Project name specified
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {repoUrl.trim() ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B57]" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[#CDD4D0]" />
                  )}
                  <span className={repoUrl.trim() ? 'text-[#101d26]' : 'text-[#8F9CA7]'}>
                    Git repository URL provided
                  </span>
                </li>
                <li className="flex items-center gap-2">
                  {isRepoVerified ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#2E8B57]" />
                  ) : (
                    <div className="w-3.5 h-3.5 rounded-full border border-[#CDD4D0]" />
                  )}
                  <span className={isRepoVerified ? 'text-[#101d26]' : 'text-[#8F9CA7]'}>
                    Repository access verified
                  </span>
                </li>
              </ul>
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={handleCreateProject}
              disabled={isSubmitting || !isFormValid}
              className="w-full h-[38px] rounded-[6px] bg-[#005459] hover:bg-[#0B5459] text-white text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Creating Project...</span>
                </>
              ) : (
                <>
                  <Rocket className="w-3.5 h-3.5" />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Info Box */}
          <div className="p-4 rounded-[8px] bg-[#F4F6F5] border border-[#CDD4D0] text-[11px] text-[#565f6b] space-y-1.5">
            <div className="flex items-center gap-1.5 text-[#101d26] font-medium">
              <Info className="w-3.5 h-3.5 text-[#005459]" />
              <span>SSH Key Auto-Injection</span>
            </div>
            <p>
              Once provisioned, Deploy Portal generates a cryptographically signed HMAC webhook secret and initiates initial checkout. Destination servers and target directories can be configured on the project details page.
            </p>
          </div>
        </div>
      </div>

      {/* Webhook Secret One-Time Modal */}
      <OneTimeSecretModal
        isOpen={webhookModal.isOpen}
        onClose={() => {
          const pid = webhookModal.projectId
          setWebhookModal({ isOpen: false, secret: '', projectId: '' })
          if (pid) {
            navigate(`/projects/${pid}`, { state: { framework: selectedFramework } })
          } else {
            navigate('/projects')
          }
        }}
        title="Project Created — Webhook Secret"
        subtitle={`Configure continuous deployment in GitHub or GitLab under Webhooks with target URL: https://${window.location.host}/api/v1/webhooks/github/${webhookModal.projectId}`}
        secretLabel="Webhook Signing Secret (HMAC SHA-256)"
        secretValue={webhookModal.secret}
      />
    </div>
  )
}
