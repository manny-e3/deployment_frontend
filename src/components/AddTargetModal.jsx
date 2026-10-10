import { useState, useEffect } from 'react'
import { X, Server, Folder, GitBranch, Terminal, AlertCircle, Loader2, Activity, ShieldAlert } from 'lucide-react'
import { api } from '../services/api'

export const TARGET_PRESETS = [
  {
    id: 'react-spa',
    framework: 'react',
    label: '⚛️ React (Vite / CRA) SPA',
    desc: 'Builds app into dist/, protects source files, and routes SPA',
    script: `# 1. Ensure modern Node.js (Node 20+ or 22+ required for Vite / Rolldown styleText)
export NO_UPDATE_NOTIFIER=1
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Switch to modern Node (22 or 20) or install Node 20 LTS if only v18 is present
nvm use 22 2>/dev/null || nvm use 20 2>/dev/null || nvm install 20 2>/dev/null || true

# If NVM was bypassed, pick newest installed version from disk
for d in $(ls -d $HOME/.nvm/versions/node/* 2>/dev/null | sort -V -r); do
  if [ -d "$d/bin" ]; then
    export PATH="$d/bin:$PATH"
    break
  fi
done
for p in /opt/cpanel/ea-nodejs22/bin /opt/cpanel/ea-nodejs20/bin /opt/alt/alt-nodejs22/root/usr/bin /opt/alt/alt-nodejs20/root/usr/bin /usr/local/bin /usr/bin; do
  [ -d "$p" ] && export PATH="$PATH:$p"
done

# Resource constraints for shared hosting (prevents Rust/Rayon thread exhaustion panic)
export RAYON_NUM_THREADS=1
export ROLLDOWN_WORKERS=1
export UV_THREADPOOL_SIZE=1
export NODE_OPTIONS="--max-old-space-size=512"

echo "Building with Node: $(node -v) | npm: $(npm -v)"

# 2. Install dependencies & build production assets
npm ci 2>/dev/null || npm install
RAYON_NUM_THREADS=1 npm run build

# 3. Configure .htaccess to serve from dist/ and protect source files
cat << 'HTACCESS' > .htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Block public access to private source code
  RewriteRule ^(src|\.git|node_modules|package.*\.json|vite\.config\.js|\.env.*|README\.md) - [F,L]

  # Serve existing static files from dist/
  RewriteCond %{DOCUMENT_ROOT}/dist/$1 -f
  RewriteRule ^(.*)$ dist/$1 [L]

  # SPA fallback to dist/index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteRule . dist/index.html [L]
</IfModule>
HTACCESS`
  },
  {
    id: 'react-build',
    framework: 'react',
    label: '⚡ React (Build Only)',
    desc: 'Runs npm install && npm run build into dist/',
    script: `export NO_UPDATE_NOTIFIER=1
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 22 2>/dev/null || nvm use 20 2>/dev/null || nvm install 20 2>/dev/null || true
for d in $(ls -d $HOME/.nvm/versions/node/* 2>/dev/null | sort -V -r); do
  if [ -d "$d/bin" ]; then
    export PATH="$d/bin:$PATH"
    break
  fi
done
for p in /opt/cpanel/ea-nodejs22/bin /opt/cpanel/ea-nodejs20/bin /opt/alt/alt-nodejs22/root/usr/bin /opt/alt/alt-nodejs20/root/usr/bin /usr/local/bin /usr/bin; do
  [ -d "$p" ] && export PATH="$PATH:$p"
done
export RAYON_NUM_THREADS=1
export ROLLDOWN_WORKERS=1
export UV_THREADPOOL_SIZE=1
export NODE_OPTIONS="--max-old-space-size=512"
npm ci 2>/dev/null || npm install
RAYON_NUM_THREADS=1 npm run build`
  },
  {
    id: 'laravel',
    framework: 'laravel',
    label: '🐘 Laravel + Migrations',
    desc: 'Routes to public/, auto-creates .env, installs dependencies & migrates',
    script: `# 1. Immediately create root index.php and .htaccess to eliminate LiteSpeed "Index of /"
cat << 'INDEX_PHP' > index.php
<?php
$uri = urldecode(
    parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/'
);
if ($uri !== '/' && file_exists(__DIR__ . '/public' . $uri)) {
    return false;
}
require_once __DIR__ . '/public/index.php';
INDEX_PHP

cat << 'HTACCESS' > .htaccess
Options -Indexes
DirectoryIndex index.php public/index.php index.html

<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Serve static assets directly from public/ if requested without prefix
    RewriteCond %{DOCUMENT_ROOT}/public/$1 -f
    RewriteRule ^(.+)$ public/$1 [L]

    # Route all requests to index.php
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [L]
</IfModule>
HTACCESS

# 2. Add common node/php paths to PATH for shared hosting (cPanel / LiteSpeed)
for p in /opt/cpanel/ea-nodejs22/bin /opt/cpanel/ea-nodejs20/bin /opt/alt/alt-nodejs22/root/usr/bin /opt/alt/alt-nodejs20/root/usr/bin /usr/local/bin /usr/bin; do
  [ -d "$p" ] && export PATH="$PATH:$p"
done

# 3. Environment file setup & clear any stale bootstrap cache
[ ! -f .env ] && [ -f .env.example ] && cp .env.example .env

# Clear stale bootstrap caches so artisan reads fresh environment variables
rm -f bootstrap/cache/config.php bootstrap/cache/routes.php bootstrap/cache/packages.php bootstrap/cache/services.php 2>/dev/null || true

# Ensure APP_KEY exists and has a non-empty value
if [ -f .env ]; then
  # Remove empty APP_KEY definitions
  sed -i -E '/^APP_KEY=(""|'\'\''|)?$/d' .env 2>/dev/null || true
  if ! grep -q "^APP_KEY=" .env; then
    NEW_KEY="base64:$(head -c 32 /dev/urandom | base64)"
    echo "APP_KEY=\${NEW_KEY}" >> .env
  fi
fi

# 4. Dependencies & Database migration
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev || true
php -r '$env=parse_ini_file(".env"); if (!empty($env["DB_HOST"]) && !empty($env["DB_DATABASE"])) { $pdo=new PDO("mysql:host=".$env["DB_HOST"].";port=".($env["DB_PORT"]??3306), $env["DB_USERNAME"]??"", $env["DB_PASSWORD"]??""); $pdo->exec("CREATE DATABASE IF NOT EXISTS \\\`".$env["DB_DATABASE"]."\\\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"); }' 2>/dev/null || true
php artisan migrate --force || true

# 5. Storage & Laravel caches
php artisan storage:link 2>/dev/null || true
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

# 6. Build Vite / frontend assets if present
if [ -f "package.json" ]; then
  if [ ! -d "node_modules" ]; then
    npm install --prefer-offline --no-audit --no-fund 2>/dev/null || true
  fi
  npm run build || true
fi`
  },
  {
    id: 'node',
    framework: 'node',
    label: '🟢 Node.js / Express',
    desc: 'Installs dependencies and restarts daemon via PM2',
    script: `export NO_UPDATE_NOTIFIER=1
if [ -d "/opt/alt/alt-nodejs22/root/usr/bin" ]; then
  export PATH="/opt/alt/alt-nodejs22/root/usr/bin:$PATH"
elif [ -d "/opt/alt/alt-nodejs20/root/usr/bin" ]; then
  export PATH="/opt/alt/alt-nodejs20/root/usr/bin:$PATH"
elif [ -d "/opt/alt/alt-nodejs18/root/usr/bin" ]; then
  export PATH="/opt/alt/alt-nodejs18/root/usr/bin:$PATH"
fi
for p in /opt/cpanel/ea-nodejs*/bin /usr/local/bin; do
  [ -d "$p" ] && export PATH="$PATH:$p"
done
npm ci 2>/dev/null || npm install
pm2 restart all || pm2 start index.js --name "app" || true`
  }
]

export function AddTargetModal({
  isOpen,
  onClose,
  projectId,
  defaultBranch = 'main',
  projectFramework = 'react',
  onTargetAdded
}) {
  const [servers, setServers] = useState([])
  const [loadingServers, setLoadingServers] = useState(false)
  const [name, setName] = useState('')
  const [serverId, setServerId] = useState('')
  const [path, setPath] = useState('')
  const [branch, setBranch] = useState(defaultBranch || 'main')
  const [preDeploy, setPreDeploy] = useState('')
  const [postDeploy, setPostDeploy] = useState('')
  const [healthCheckUrl, setHealthCheckUrl] = useState('')
  const [autoRollbackOnFailure, setAutoRollbackOnFailure] = useState(true)
  const [requiresApproval, setRequiresApproval] = useState(false)
  const [selectedPresetId, setSelectedPresetId] = useState('react-spa')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isOpen) return
    setError(null)
    setName('')
    setPath('')
    setBranch(defaultBranch || 'main')
    setPreDeploy('')
    setHealthCheckUrl('')
    setAutoRollbackOnFailure(true)
    setRequiresApproval(false)

    // Automatically match the preset for the project's selected framework
    const matchedPreset =
      TARGET_PRESETS.find((p) => p.framework === projectFramework) ||
      TARGET_PRESETS[0]

    setSelectedPresetId(matchedPreset.id)
    setPostDeploy(matchedPreset.script)

    const fetchServers = async () => {
      setLoadingServers(true)
      try {
        const res = await api('/servers')
        const items = Array.isArray(res) ? res : res?.items || []
        const valid = items.filter(Boolean)
        setServers(valid)
        if (valid.length > 0) {
          setServerId(valid[0].id)
          setName(`Production (${valid[0].name || valid[0].host})`)
        }
      } catch (err) {
        console.error('Failed to fetch servers for target modal:', err)
        setError('Failed to load registered servers.')
      } finally {
        setLoadingServers(false)
      }
    }

    fetchServers()
  }, [isOpen, defaultBranch, projectFramework])

  if (!isOpen) return null

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id)
    setPostDeploy(preset.script)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Target name is required.')
      return
    }

    if (!serverId) {
      setError('Please select a destination server.')
      return
    }

    const trimmedPath = path.trim()
    if (!trimmedPath) {
      setError('Target deployment directory is required.')
      return
    }

    if (!trimmedPath.startsWith('/')) {
      setError('Target path must be an absolute path starting with / (e.g. /home/username/public_html).')
      return
    }

    if (trimmedPath.includes('..')) {
      setError('Target path cannot contain relative .. traversal.')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: name.trim(),
        serverId,
        path: trimmedPath,
        branch: branch.trim() || null,
        preDeploy: preDeploy.trim(),
        postDeploy: postDeploy.trim(),
      }
      if (healthCheckUrl.trim()) {
        payload.healthCheckUrl = healthCheckUrl.trim()
      } else {
        payload.healthCheckUrl = null
      }

      let res
      try {
        res = await api(`/projects/${projectId}/targets`, {
          method: 'POST',
          body: payload
        })
      } catch (apiErr) {
        // If the backend strictly rejects healthCheckUrl, retry without it
        const isHealthCheckUnrecognized =
          apiErr?.message?.includes('healthCheckUrl') ||
          apiErr?.details?.fields?.some?.((f) => f.field === 'healthCheckUrl' || f.message?.includes('healthCheckUrl'))

        if (isHealthCheckUnrecognized) {
          delete payload.healthCheckUrl
          res = await api(`/projects/${projectId}/targets`, {
            method: 'POST',
            body: payload
          })
        } else {
          throw apiErr
        }
      }

      // Persist governance & health check options in client storage
      if (res?.id) {
        try {
          localStorage.setItem(`target_meta_${res.id}`, JSON.stringify({
            autoRollbackOnFailure: Boolean(autoRollbackOnFailure),
            requiresApproval: Boolean(requiresApproval),
            healthCheckUrl: healthCheckUrl.trim() || null,
          }))
        } catch (e) {
          console.warn('Failed to save target meta to localStorage:', e)
        }
      }

      if (onTargetAdded) {
        onTargetAdded({
          ...res,
          ...payload,
          healthCheckUrl: healthCheckUrl.trim() || null,
          autoRollbackOnFailure: Boolean(autoRollbackOnFailure),
          requiresApproval: Boolean(requiresApproval),
        })
      }
      onClose()
    } catch (err) {
      console.error('Failed to add target server to project:', err)
      const isDuplicatePath =
        err?.code === 'ALREADY_EXISTS' ||
        err?.message?.includes('already exists') ||
        err?.details?.fields?.includes?.('Target_serverId_path_key') ||
        (typeof err?.details?.fields === 'string' && err.details.fields.includes('Target_serverId_path_key'))

      if (isDuplicatePath) {
        setError(
          `The destination path "${trimmedPath}" is already linked to this server. Two deployment targets cannot share the exact same folder. Please specify a different path (e.g. /home/travaiqc/app) or edit the existing target in the list.`
        )
      } else {
        setError(err.message || 'Failed to link target server. Please check your inputs.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D26]/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-[580px] bg-[#FFFFFF] rounded-[8px] border border-[#CDD4D0] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E7E4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[6px] bg-[#E2F0FD] text-[#005459] flex items-center justify-center">
              <Server className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-[#101d26] tracking-tight">
                Add Target Server
              </h2>
              <p className="text-[11px] text-[#565f6b]">
                Link a configured destination server to receive releases for this project.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8F9CA7] hover:text-[#101d26] p-1 rounded hover:bg-[#F4F6F5] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-[#FAEBE9] border border-[#F1B5AC] rounded-[6px] flex items-center gap-2 text-[#C2412D] text-[12px]">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Server */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              DESTINATION SERVER <span className="text-[#C2412D]">*</span>
            </label>
            {loadingServers ? (
              <div className="h-[36px] px-3 bg-[#F4F6F5] border border-[#CDD4D0] rounded-[6px] flex items-center gap-2 text-[12px] text-[#565f6b]">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[#005459]" />
                <span>Loading available servers...</span>
              </div>
            ) : servers.length === 0 ? (
              <div className="p-3 bg-[#FAF3E7] border border-[#F1D6A4] rounded-[6px] text-[#B87E0C] text-[12px]">
                No servers registered in the portal yet. Please register a server in the <strong>Servers</strong> tab first.
              </div>
            ) : (
              <select
                value={serverId}
                onChange={(e) => {
                  setServerId(e.target.value)
                  const found = servers.find((s) => s.id === e.target.value)
                  if (found) {
                    setName(`Production (${found.name || found.host})`)
                  }
                }}
                className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                required
              >
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.username}@{s.host}:{s.port || 22})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Target Name */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              TARGET NAME <span className="text-[#C2412D]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Production (Live cPanel)"
              className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
              required
            />
          </div>

          {/* Deployment Directory */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              ABSOLUTE DEPLOYMENT PATH <span className="text-[#C2412D]">*</span>
            </label>
            <div className="relative flex items-center">
              <Folder className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={path}
                onChange={(e) => setPath(e.target.value)}
                placeholder="/home/username/public_html or /var/www/site"
                className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                required
              />
            </div>
            <p className="text-[10px] text-[#565f6b] mt-1">
              The full destination path on the remote machine where files will be cloned or extracted.
            </p>
          </div>

          {/* Branch Override */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b] mb-1">
              DEPLOYMENT BRANCH
            </label>
            <div className="relative flex items-center">
              <GitBranch className="w-3.5 h-3.5 text-[#565f6b] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                className="w-full h-[36px] pl-8 pr-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
              />
            </div>
          </div>

          {/* Framework & Deployment Preset */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b]">
                DEPLOYMENT PRESET
              </label>
              <span className="text-[10px] text-[#565f6b] font-mono">
                Click preset to load script
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {TARGET_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left p-2.5 rounded-[6px] border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#005459] bg-[#EAF5EE] text-[#005459] ring-2 ring-[#005459]/20 shadow-xs'
                        : 'border-[#CDD4D0] bg-[#FFFFFF] hover:border-[#8F9CA7] hover:bg-[#FAFBFB]'
                    }`}
                  >
                    <div className="text-[12px] font-bold flex items-center gap-1.5">
                      <span className={isSelected ? 'text-[#005459]' : 'text-[#101d26]'}>
                        {preset.label}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#565f6b] leading-tight mt-0.5">
                      {preset.desc}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Post-Deploy Script */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-mono uppercase tracking-wider font-semibold text-[#565f6b]">
                POST-DEPLOY HOOK SCRIPT
              </label>
              <span className="text-[10px] font-mono text-[#005459]">
                Auto-filled for {projectFramework.toUpperCase()}
              </span>
            </div>
            <div className="relative">
              <textarea
                value={postDeploy}
                onChange={(e) => {
                  setPostDeploy(e.target.value)
                  // If content modified away from preset, clear active selection
                  const matched = TARGET_PRESETS.find((p) => p.script === e.target.value)
                  setSelectedPresetId(matched ? matched.id : null)
                }}
                rows={7}
                placeholder="e.g. composer install --no-dev or npm run build"
                className="w-full p-2.5 bg-[#FAFBFB] border border-[#CDD4D0] rounded-[6px] text-[11px] font-mono text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15 leading-relaxed"
              />
            </div>
            <p className="text-[10px] text-[#565f6b] mt-0.5">
              Commands executed automatically in target root immediately following git checkout and .env injection.
            </p>
          </div>

          {/* Reliability & Governance Settings */}
          <div className="p-3 bg-[#F8FAF9] border border-[#CDD4D0] rounded-[6px] space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider font-bold text-[#005459]">
              <Activity className="w-3.5 h-3.5" />
              <span>Pipeline Reliability &amp; Governance</span>
            </div>

            {/* Health Check Probe URL */}
            <div>
              <label className="block text-[11px] font-medium text-[#101d26] mb-1">
                Project URL / Health Check Endpoint (Optional)
              </label>
              <input
                type="text"
                value={healthCheckUrl}
                onChange={(e) => setHealthCheckUrl(e.target.value)}
                placeholder="e.g. https://myproject.com, http://localhost/kensite, or /health"
                className="w-full h-[32px] px-2.5 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[4px] text-[12px] font-mono text-[#101d26] outline-none focus:border-[#005459]"
              />
              <p className="text-[10px] text-[#565f6b] mt-0.5">
                Leave blank to automatically probe the Project Root URL (HTTP 200/302), or provide a specific domain or path.
              </p>
            </div>

            {/* Auto-rollback on probe fail */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoRollbackOnFailure}
                onChange={(e) => setAutoRollbackOnFailure(e.target.checked)}
                className="rounded border-[#CDD4D0] text-[#005459] focus:ring-[#005459]"
              />
              <span className="text-[11px] text-[#101d26] font-medium">
                Auto-rollback if health probe returns non-200 or times out (30s)
              </span>
            </label>

            {/* Require Deployment Approval */}
            <label className="flex items-center gap-2 cursor-pointer select-none pt-1 border-t border-[#E2E7E4]">
              <input
                type="checkbox"
                checked={requiresApproval}
                onChange={(e) => setRequiresApproval(e.target.checked)}
                className="rounded border-[#CDD4D0] text-[#005459] focus:ring-[#005459]"
              />
              <div className="flex items-center gap-1.5 text-[11px] text-[#101d26] font-medium">
                <ShieldAlert className="w-3.5 h-3.5 text-[#B87E0C]" />
                <span>Require release sign-off before executing on this target</span>
              </div>
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-[#E2E7E4] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-[34px] px-3.5 rounded-[6px] border border-[#CDD4D0] bg-[#FFFFFF] hover:bg-[#F4F6F5] text-[12px] font-medium text-[#101d26] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || servers.length === 0}
              className="h-[34px] px-4 rounded-[6px] bg-[#005459] hover:bg-[#0B5459] active:bg-[#083F43] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSubmitting ? 'Linking Target...' : 'Link Target Server'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
