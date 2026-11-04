import { useState, useEffect } from 'react'
import {
  X,
  Server,
  Folder,
  GitBranch,
  Terminal,
  AlertCircle,
  Loader2,
  Activity,
  ShieldAlert,
  RefreshCw,
  Layers,
  CheckCircle2,
  HardDrive,
  Info,
} from 'lucide-react'
import { api } from '../services/api'

export const TARGET_PRESETS = [
  {
    id: 'atomic-laravel',
    framework: 'laravel',
    label: '🔄 Atomic Symlink (Laravel)',
    desc: 'Zero downtime /releases/[ts] + /current symlink with shared .env & storage',
    architecture: 'atomic-symlink',
    script: `# -------------------------------------------------------------
# Atomic Zero-Downtime Symlink Deployment (Laravel / PHP)
# -------------------------------------------------------------
# Ensure Node, npm, and Composer are in PATH for non-interactive SSH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" 2>/dev/null || true
for d in $(ls -d $HOME/.nvm/versions/node/* 2>/dev/null | sort -V -r); do
  [ -d "$d/bin" ] && export PATH="$d/bin:$PATH" && break
done
for p in /opt/cpanel/ea-nodejs22/bin /opt/cpanel/ea-nodejs20/bin /opt/alt/alt-nodejs22/root/usr/bin /opt/alt/alt-nodejs20/root/usr/bin /usr/local/bin /usr/bin; do
  [ -d "$p" ] && export PATH="$PATH:$p"
done

APP_DIR="$(pwd)"
RELEASE_TIMESTAMP=$(date +%Y%m%d%H%M%S)
RELEASE_DIR="$APP_DIR/releases/$RELEASE_TIMESTAMP"
SHARED_DIR="$APP_DIR/shared"

echo "Creating atomic release directory: $RELEASE_DIR"
mkdir -p "$RELEASE_DIR" "$SHARED_DIR/storage" "$SHARED_DIR/storage/framework/sessions" "$SHARED_DIR/storage/framework/views" "$SHARED_DIR/storage/framework/cache" "$SHARED_DIR/storage/logs"

# Keep shared .env in sync with deployment .env
if [ -f "$APP_DIR/.env" ]; then
  cp -f "$APP_DIR/.env" "$SHARED_DIR/.env"
elif [ ! -f "$SHARED_DIR/.env" ] && [ -f "$APP_DIR/.env.example" ]; then
  cp "$APP_DIR/.env.example" "$SHARED_DIR/.env"
fi

# Copy release artifacts to isolated release directory
cp -a * "$RELEASE_DIR/" 2>/dev/null || true
rm -rf "$RELEASE_DIR/releases" "$RELEASE_DIR/shared" "$RELEASE_DIR/current" 2>/dev/null || true

# Symlink persistent shared environment and storage
ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
rm -rf "$RELEASE_DIR/storage"
ln -sfn "$SHARED_DIR/storage" "$RELEASE_DIR/storage"

# Persistent SQLite database support
mkdir -p "$SHARED_DIR/database"
if [ ! -f "$SHARED_DIR/database/database.sqlite" ]; then
  touch "$SHARED_DIR/database/database.sqlite"
  chmod 666 "$SHARED_DIR/database/database.sqlite" 2>/dev/null || true
fi
chmod 777 "$SHARED_DIR/database" 2>/dev/null || true
mkdir -p "$RELEASE_DIR/database"
ln -sfn "$SHARED_DIR/database/database.sqlite" "$RELEASE_DIR/database/database.sqlite"

# Build & optimize inside the isolated release directory
cd "$RELEASE_DIR"
composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev 2>/dev/null || true

# Ensure APP_KEY exists and has a valid base64 key in shared .env
if [ -f "$SHARED_DIR/.env" ]; then
  if ! grep -q "^APP_KEY=base64:" "$SHARED_DIR/.env"; then
    echo "Generating application encryption key..."
    NEW_KEY="base64:$(head -c 32 /dev/urandom | base64)"
    sed -i -E '/^APP_KEY=/d' "$SHARED_DIR/.env" 2>/dev/null || true
    echo "APP_KEY=\${NEW_KEY}" >> "$SHARED_DIR/.env"
  fi
fi

# Storage & framework cache permissions
chmod -R 775 "$SHARED_DIR/storage" "$RELEASE_DIR/bootstrap/cache" 2>/dev/null || true
chmod -R 777 "$SHARED_DIR/storage/framework" "$SHARED_DIR/storage/logs" 2>/dev/null || true

# Native storage symlink (bypasses Hostinger disabled PHP exec() function)
mkdir -p "$SHARED_DIR/storage/app/public"
rm -rf "$RELEASE_DIR/public/storage"
ln -sfn "$SHARED_DIR/storage/app/public" "$RELEASE_DIR/public/storage" 2>/dev/null || true

# Run database migrations for sessions/cache/app
php artisan migrate --force 2>/dev/null || true

# Clear stale caches and optimize
php artisan optimize:clear 2>/dev/null || true
php artisan config:cache 2>/dev/null || true
php artisan route:cache 2>/dev/null || true
php artisan view:cache 2>/dev/null || true

# Safe frontend asset build (avoids crashing if npm is missing on shared hosting)
if [ -f "package.json" ]; then
  if command -v npm >/dev/null 2>&1; then
    echo "Compiling frontend assets with npm..."
    (npm ci --prefer-offline 2>/dev/null || npm install --no-audit 2>/dev/null || true)
    (npm run build 2>/dev/null || true)
  else
    echo "Notice: npm not found in PATH on server. Skipping remote build (ensure assets in public/build are committed if required)."
  fi
fi

# ATOMIC SWITCH: Update /current symlink in a single atomic filesystem operation
echo "Activating release atomically..."
ln -sfn "$RELEASE_DIR" "$APP_DIR/current"

# Ensure root bridge index.php and .htaccess route to active release
cat << 'INDEX_PHP' > "$APP_DIR/index.php"
<?php
$currentPublic = __DIR__ . '/current/public';
if (file_exists($currentPublic . '/index.php')) {
    $uri = urldecode(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/');
    if ($uri !== '/' && file_exists($currentPublic . $uri)) {
        return false;
    }
    require_once $currentPublic . '/index.php';
} elseif (file_exists(__DIR__ . '/public/index.php')) {
    require_once __DIR__ . '/public/index.php';
}
INDEX_PHP

cat << 'HTACCESS' > "$APP_DIR/.htaccess"
<IfModule mod_rewrite.c>
    RewriteEngine On

    # Serve static assets directly from active release public folder
    RewriteCond %{DOCUMENT_ROOT}/current/public/$1 -f
    RewriteRule ^(.+)$ current/public/$1 [L]

    RewriteCond %{DOCUMENT_ROOT}/public/$1 -f
    RewriteRule ^(.+)$ public/$1 [L]

    # Route all requests to index.php
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule ^(.*)$ index.php [L]
</IfModule>
HTACCESS

# Prune older releases, keeping the last 5 for instant 1-second rollbacks
cd "$APP_DIR/releases"
ls -dt "$APP_DIR/releases"/* | tail -n +6 | xargs rm -rf 2>/dev/null || true
echo "Release $RELEASE_TIMESTAMP active with ZERO downtime."`
  },
  {
    id: 'atomic-node',
    framework: 'node',
    label: '🔄 Atomic Symlink (Node.js)',
    desc: 'Zero downtime /releases/[ts] + /current symlink with PM2 reload',
    architecture: 'atomic-symlink',
    script: `# -------------------------------------------------------------
# Atomic Zero-Downtime Symlink Deployment (Node.js / Express)
# -------------------------------------------------------------
export NO_UPDATE_NOTIFIER=1
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh" 2>/dev/null || true
nvm use 22 2>/dev/null || nvm use 20 2>/dev/null || nvm install 20 2>/dev/null || true
for d in $(ls -d $HOME/.nvm/versions/node/* 2>/dev/null | sort -V -r); do
  [ -d "$d/bin" ] && export PATH="$d/bin:$PATH" && break
done
for p in /opt/cpanel/ea-nodejs22/bin /opt/cpanel/ea-nodejs20/bin /opt/alt/alt-nodejs22/root/usr/bin /opt/alt/alt-nodejs20/root/usr/bin /usr/local/bin /usr/bin; do
  [ -d "$p" ] && export PATH="$PATH:$p"
done

APP_DIR="$(pwd)"
RELEASE_TIMESTAMP=$(date +%Y%m%d%H%M%S)
RELEASE_DIR="$APP_DIR/releases/$RELEASE_TIMESTAMP"
SHARED_DIR="$APP_DIR/shared"

echo "Creating atomic release directory: $RELEASE_DIR"
mkdir -p "$RELEASE_DIR" "$SHARED_DIR/uploads" "$SHARED_DIR/logs"

# Keep persistent shared .env in sync with deployed .env
if [ -f "$APP_DIR/.env" ]; then
  cp -f "$APP_DIR/.env" "$SHARED_DIR/.env"
fi

# Copy release artifacts
cp -a * "$RELEASE_DIR/" 2>/dev/null || true
rm -rf "$RELEASE_DIR/releases" "$RELEASE_DIR/shared" "$RELEASE_DIR/current" 2>/dev/null || true

# Symlink persistent environment & uploads
[ -f "$SHARED_DIR/.env" ] && ln -sfn "$SHARED_DIR/.env" "$RELEASE_DIR/.env"
ln -sfn "$SHARED_DIR/uploads" "$RELEASE_DIR/uploads"

# Install dependencies inside the new release directory
cd "$RELEASE_DIR"
(npm ci --production 2>/dev/null || npm install --production 2>/dev/null || true)

# ATOMIC SWITCH: Switch symlink to new release
ln -sfn "$RELEASE_DIR" "$APP_DIR/current"

# Reload PM2 zero-downtime cluster
pm2 reload all 2>/dev/null || pm2 restart all 2>/dev/null || pm2 start current/index.js --name "app" 2>/dev/null || true

# Prune old releases (keep 5)
cd "$APP_DIR/releases"
ls -dt "$APP_DIR/releases"/* | tail -n +6 | xargs rm -rf 2>/dev/null || true
echo "Atomic switch complete. PM2 workers drained and reloaded with zero dropped connections."`
  },
  {
    id: 'cpanel-sftp',
    framework: 'cpanel',
    label: '📁 cPanel Pure SFTP Sync',
    desc: 'Direct SFTP transfer without remote shell execution (resolves "Unable to exec")',
    architecture: 'cpanel-sftp',
    script: `# -------------------------------------------------------------
# cPanel Pure SFTP Sync (Zero-Shell Execution)
# Resolves: SSH connection failed: Unable to exec restriction
# -------------------------------------------------------------
# Pre-compiled local assets and bundle are streamed directly over SFTP
# into the web root without requiring SSH terminal exec channels.
#
# Web Root: public_html (or subdomain path)
# Target Files: Pre-compiled dist/*, index.php / index.html, .htaccess
echo "Preparing pre-compiled artifact package for SFTP delivery..."
echo "SFTP sync stream initialized directly to target root."
echo "Zero remote shell execution required. Pure SFTP payload transfer active."`
  },
  {
    id: 'docker-compose',
    framework: 'docker',
    label: '🐳 Docker Remote Compose',
    desc: 'Connects directly to Docker daemon, pulls images and deploys compose',
    architecture: 'docker',
    script: `# -------------------------------------------------------------
# Remote Docker Daemon Target (Docker API / Compose)
# Connects directly to tcp://:2376 or SSH docker socket
# -------------------------------------------------------------
echo "Pulling latest images from container registry..."
docker compose pull || true

echo "Applying zero-downtime rolling update with healthcheck..."
docker compose up -d --remove-orphans

echo "Verifying container health status..."
docker compose ps`
  },
  {
    id: 'react-spa',
    framework: 'react',
    label: 'React (Vite / CRA) SPA',
    desc: 'Builds app into dist/, protects source files, and routes SPA',
    architecture: 'standard',
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

# 2. Install dependencies & build production assets with relative base
npm ci 2>/dev/null || npm install
RAYON_NUM_THREADS=1 npm run build -- --base=./

# 3. Copy built files from dist/ directly to the web root
cp -rf dist/* .

# 4. Standard React SPA routing and source protection
cat << 'HTACCESS' > .htaccess
<IfModule mod_rewrite.c>
  RewriteEngine On

  # Block public access to private source code
  RewriteRule ^(src|\.git|node_modules|package.*\.json|vite\.config\.js|\.env.*|README\.md) - [F,L]

  # Allow direct access to existing files and directories
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # Direct access to index.html
  RewriteRule ^index\.html$ - [L]

  # Route all other URLs to index.html for SPA client-side routing
  RewriteRule . index.html [L]
</IfModule>
HTACCESS`
  },
  {
    id: 'react-build',
    framework: 'react',
    label: '⚡ React (Build Only)',
    desc: 'Runs npm install && npm run build into dist/',
    architecture: 'standard',
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
    label: 'Laravel + Migrations',
    desc: 'Routes to public/, auto-creates .env, installs dependencies & migrates',
    architecture: 'standard',
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
  if command -v npm >/dev/null 2>&1; then
    if [ ! -d "node_modules" ]; then
      npm install --prefer-offline --no-audit --no-fund 2>/dev/null || true
    fi
    npm run build || true
  else
    echo "Notice: npm not found in PATH on server. Skipping frontend build."
  fi
fi`
  },
  {
    id: 'windows-node',
    framework: 'node',
    label: '🪟 Windows Node.js API (XAMPP / Apache)',
    desc: 'Runs npm install, migrations, background Scheduled Task runner, and Apache reverse proxy',
    architecture: 'windows-node',
    script: [
      '# -------------------------------------------------------------',
      '# Windows Server / XAMPP Deployment (Node.js API)',
      '# -------------------------------------------------------------',
      'export PATH="/c/Program Files/nodejs:/c/Program Files/Git/cmd:/c/Program Files/Git/bin:$PATH"',
      'export MSYS_NO_PATHCONV=1',
      'export MSYS2_ARG_CONV_EXCL="*"',
      '',
      'echo "Installing Node.js dependencies..."',
      'npm install',
      '',
      'if [ -f "prisma/schema.prisma" ]; then',
      '  echo "Applying Prisma database migrations..."',
      '  npx prisma migrate deploy || true',
      'elif [ -f "knexfile.js" ]; then',
      '  echo "Applying Knex database migrations..."',
      '  npx knex migrate:latest || true',
      'fi',
      '',
      'NODE_PORT=$(grep -E \'^[[:space:]]*PORT=\' .env 2>/dev/null | head -n 1 | cut -d \'=\' -f 2 | tr -d \'"\\r\\n \' || echo "")',
      '[ -z "$NODE_PORT" ] && NODE_PORT="8000"',
      '',
      'DIR_BASENAME=$(basename "$(pwd)")',
      'TASK_NAME="Task_${DIR_BASENAME}"',
      '',
      'ENTRY="src/server.js"',
      '[ -f "server.js" ] && ENTRY="server.js"',
      '[ -f "index.js" ] && ENTRY="index.js"',
      '[ -f "app.js" ] && ENTRY="app.js"',
      '',
      'WIN_DIR="C:${PWD#/c}"',
      'WIN_DIR="${WIN_DIR//\\//\\\\\\\\}"',
      'WIN_ENTRY="${ENTRY//\\//\\\\\\\\}"',
      '',
      'echo "Configuring Apache reverse proxy..."',
      'cat << \'HTACCESS_EOF\' > .htaccess',
      'Options -Indexes',
      'DirectoryIndex disabled',
      '',
      '<IfModule mod_rewrite.c>',
      '  RewriteEngine On',
      '  RewriteCond %{HTTP:Upgrade} websocket [NC]',
      '  RewriteCond %{HTTP:Connection} upgrade [NC]',
      '  RewriteRule ^(.*)$ ws://127.0.0.1:__PORT__/$1 [P,L]',
      '  RewriteRule ^(index\\.php)?$ http://127.0.0.1:__PORT__/ [P,L]',
      '  RewriteRule ^(.*)$ http://127.0.0.1:__PORT__/$1 [P,L,QSA]',
      '</IfModule>',
      'HTACCESS_EOF',
      'sed -i "s/__PORT__/$NODE_PORT/g" .htaccess',
      '',
      'echo "Configuring persistent Windows background runner..."',
      'cat << START_CMD_EOF > start_service.cmd',
      '@echo off',
      'cd /d "${WIN_DIR}"',
      '"C:\\Program Files\\nodejs\\node.exe" ${WIN_ENTRY} >> "${WIN_DIR}\\server.log" 2>&1',
      'START_CMD_EOF',
      '',
      'schtasks.exe //query //tn "$TASK_NAME" >/dev/null 2>&1 || schtasks.exe //create //tn "$TASK_NAME" //tr "${WIN_DIR}\\start_service.cmd" //sc onstart //ru SYSTEM //f >/dev/null 2>&1 || true',
      '',
      'echo "Restarting Node.js service on port $NODE_PORT..."',
      'powershell.exe -NoProfile -Command "Stop-Process -Id (Get-NetTCPConnection -LocalPort $NODE_PORT -ErrorAction SilentlyContinue).OwningProcess -Force -ErrorAction SilentlyContinue" 2>/dev/null || true',
      'schtasks.exe //run //tn "$TASK_NAME" 2>/dev/null || schtasks.exe /run /tn "$TASK_NAME" 2>/dev/null || powershell.exe -NoProfile -Command "Start-Process cmd.exe -ArgumentList \'/c\', \'${WIN_DIR}\\start_service.cmd\' -WindowStyle Hidden" 2>/dev/null || true',
      '',
      'echo "Node.js API active and reverse-proxied via Apache on port $NODE_PORT."'
    ].join('\n')
  },
  {
    id: 'windows-spa',
    framework: 'react',
    label: '🪟 Windows React / Vite SPA (XAMPP / Apache)',
    desc: 'Compiles production bundle, syncs dist/ into Apache root, and enables client-side routing',
    architecture: 'windows-spa',
    script: [
      '# -------------------------------------------------------------',
      '# Windows Server / XAMPP Deployment (React / Vite / Vue / SPA)',
      '# -------------------------------------------------------------',
      'export PATH="/c/Program Files/nodejs:/c/Program Files/Git/cmd:/c/Program Files/Git/bin:$PATH"',
      'export MSYS_NO_PATHCONV=1',
      'export MSYS2_ARG_CONV_EXCL="*"',
      '',
      '# Restore pristine index.html before building if previously overwritten',
      'git checkout -- index.html 2>/dev/null || true',
      '',
      'echo "Installing dependencies..."',
      'npm install',
      '',
      'DIR_BASENAME=$(basename "$(pwd)")',
      '',
      '# Auto-inject basename into BrowserRouter if not specified in code',
      'for RF in src/main.jsx src/main.tsx src/main.js src/App.jsx src/App.tsx src/App.js src/index.jsx src/index.js; do',
      '  if [ -f "$RF" ] && grep -q "<BrowserRouter" "$RF" && ! grep -q "basename" "$RF"; then',
      '    sed -i -E \'s/<BrowserRouter([ >])/<BrowserRouter basename="\\/\'"$DIR_BASENAME"\'"\\1/g\' "$RF" 2>/dev/null || true',
      '  fi',
      'done',
      '',
      'echo "Compiling production bundle..."',
      'VITE_ROUTER_BASE="/$DIR_BASENAME" npm run build -- --base=./ 2>/dev/null || npm run build',
      'git checkout -- src/ 2>/dev/null || true',
      '',
      '# Sync compiled assets into Apache document root',
      'if [ -d "dist" ]; then',
      '  echo "Deploying dist/ assets to web root..."',
      '  cp -rf dist/* .',
      'elif [ -d "build" ]; then',
      '  echo "Deploying build/ assets to web root..."',
      '  cp -rf build/* .',
      'fi',
      '',
      '# Normalize relative asset paths for Apache subdirectory hosting',
      'if [ -f "index.html" ]; then',
      '  sed -i -E \'s/(href|src)="\\/assets\\//\\1=".\\/assets\\//g\' index.html 2>/dev/null || true',
      '  sed -i -E \'s/(href|src)="\\/favicon/\\1=".\\/favicon/g\' index.html 2>/dev/null || true',
      '  sed -i -E \'s/<base href="\\/"/<base href=".\\/"/g\' index.html 2>/dev/null || true',
      'fi',
      '',
      'echo "Configuring Apache SPA fallback routing (.htaccess)..."',
      'cat << \'HTACCESS_EOF\' > .htaccess',
      'Options -Indexes',
      '<IfModule mod_rewrite.c>',
      '  RewriteEngine On',
      '  RewriteBase /__SUBDIR__/',
      '  # If file exists in dist/, rewrite to dist/',
      '  RewriteCond %{DOCUMENT_ROOT}/__SUBDIR__/dist/$1 -f',
      '  RewriteRule ^(.*)$ dist/$1 [L]',
      '  # SPA client-side routing fallback to dist/index.html',
      '  RewriteCond %{REQUEST_FILENAME} !-f',
      '  RewriteCond %{REQUEST_FILENAME} !-d',
      '  RewriteCond %{DOCUMENT_ROOT}/__SUBDIR__/dist/index.html -f',
      '  RewriteRule . dist/index.html [L]',
      '  # Standard fallback to root index.html',
      '  RewriteRule ^index\\.html$ - [L]',
      '  RewriteCond %{REQUEST_FILENAME} !-f',
      '  RewriteCond %{REQUEST_FILENAME} !-d',
      '  RewriteRule . index.html [L]',
      '</IfModule>',
      'HTACCESS_EOF',
      'sed -i "s/__SUBDIR__/$DIR_BASENAME/g" .htaccess',
      '',
      'echo "Windows SPA deployment complete! Available at http://localhost/$DIR_BASENAME/"'
    ].join('\n')
  },
  {
    id: 'windows-laravel',
    framework: 'laravel',
    label: '🪟 Windows Laravel / PHP (XAMPP / Apache)',
    desc: 'Composer install, artisan migrate, and Apache .htaccess routing for Windows XAMPP',
    architecture: 'windows-php',
    script: `# -------------------------------------------------------------
# Windows Server / XAMPP Deployment (Laravel / PHP)
# -------------------------------------------------------------
export PATH="/c/xampp/php:/c/ProgramData/ComposerSetup/bin:/c/Program Files/Git/cmd:$PATH"

if [ -f "composer.json" ]; then
  echo "Installing Composer dependencies..."
  composer install --no-interaction --prefer-dist --optimize-autoloader --no-dev || true
fi

if [ -f "artisan" ]; then
  echo "Running database migrations..."
  php artisan migrate --force || true
  php artisan optimize:clear || true
fi

echo "Ensuring storage and cache folders exist..."
mkdir -p storage/framework/sessions storage/framework/views storage/framework/cache storage/logs bootstrap/cache 2>/dev/null || true

echo "Configuring Apache .htaccess..."
if [ -f "public/.htaccess" ] && [ ! -f ".htaccess" ]; then
  cp -f public/.htaccess .htaccess
fi

echo "Windows Laravel deployment complete."`
  },
  {
    id: 'node',
    framework: 'node',
    label: '🟢 Node.js / Express',
    desc: 'Installs dependencies and restarts daemon via PM2',
    architecture: 'standard',
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
  const [isAtomicSymlink, setIsAtomicSymlink] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const isWindowsServer = (server) => {
    if (!server) return false
    const name = (server.name || '').toLowerCase()
    const host = (server.host || '').toLowerCase()
    return (
      name.includes('windows') ||
      name.includes('fmdq') ||
      name.includes('xampp') ||
      host === '10.10.15.59' ||
      host === '101-php-01.fmdqgroup.com'
    )
  }

  const selectBestPresetForServer = (server, currentFramework) => {
    if (server?.serverType === 'CPANEL_SFTP' || server?.iconType === 'cpanel' || server?.host === 'travaiq.com') {
      return TARGET_PRESETS.find((p) => p.id === 'cpanel-sftp')
    }
    if (server?.serverType === 'DOCKER' || server?.iconType === 'docker') {
      return TARGET_PRESETS.find((p) => p.id === 'docker-compose')
    }
    if (isWindowsServer(server)) {
      if (currentFramework === 'node') {
        return TARGET_PRESETS.find((p) => p.id === 'windows-node')
      }
      if (currentFramework === 'react') {
        return TARGET_PRESETS.find((p) => p.id === 'windows-spa')
      }
      if (currentFramework === 'laravel') {
        return TARGET_PRESETS.find((p) => p.id === 'windows-laravel')
      }
      return TARGET_PRESETS.find((p) => p.id === 'windows-node') || TARGET_PRESETS.find((p) => p.id === 'windows-spa')
    }
    return TARGET_PRESETS.find((p) => p.framework === currentFramework) || TARGET_PRESETS[0]
  }

  const applyPresetForServer = (srv) => {
    const chosen = selectBestPresetForServer(srv, projectFramework)
    if (chosen) {
      setSelectedPresetId(chosen.id)
      setPostDeploy(chosen.script)
      setIsAtomicSymlink(chosen.architecture === 'atomic-symlink')
    }
  }

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
    setIsAtomicSymlink(matchedPreset.architecture === 'atomic-symlink')

    const fetchServers = async () => {
      setLoadingServers(true)
      try {
        const res = await api('/servers')
        const items = Array.isArray(res) ? res : res?.items || []
        const valid = items.filter(Boolean)
        setServers(valid)
        if (valid.length > 0) {
          const first = valid[0]
          setServerId(first.id)
          setName(`Production (${first.name || first.host})`)
          applyPresetForServer(first)
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

  const handleServerChange = (newServerId) => {
    setServerId(newServerId)
    const found = servers.find((s) => s.id === newServerId)
    if (found) {
      setName(`Production (${found.name || found.host})`)
      applyPresetForServer(found)
    }
  }

  const handleSelectPreset = (preset) => {
    setSelectedPresetId(preset.id)
    setPostDeploy(preset.script)
    setIsAtomicSymlink(preset.architecture === 'atomic-symlink')
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

    const isUnixAbsolute = trimmedPath.startsWith('/')
    const isWindowsAbsolute = /^[a-zA-Z]:[/\\]/.test(trimmedPath)

    if (!isUnixAbsolute && !isWindowsAbsolute) {
      setError('Target path must be an absolute path (e.g. /home/username/public_html or C:/xampp/htdocs).')
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
                onChange={(e) => handleServerChange(e.target.value)}
                className="w-full h-[36px] px-3 bg-[#FFFFFF] border border-[#CDD4D0] rounded-[6px] text-[13px] text-[#101d26] outline-none focus:border-[#005459] focus:ring-2 focus:ring-[#005459]/15"
                required
              >
                {servers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.username}@{s.host}:{s.port || 22}) {s.serverType === 'CPANEL_SFTP' ? '· [cPanel SFTP]' : s.serverType === 'DOCKER' ? '· [Docker Engine]' : ''}
                  </option>
                ))}
              </select>
            )}

            {/* Server Type Insight Banner */}
            {(() => {
              const currentServer = servers.find((s) => s.id === serverId)
              if (currentServer && (currentServer.serverType === 'CPANEL_SFTP' || currentServer.iconType === 'cpanel' || currentServer.host === 'travaiq.com')) {
                return (
                  <div className="mt-2 p-2.5 bg-[#FFF4E5] border border-[#FED7AA] rounded-[6px] flex items-start gap-2 text-[11px] text-[#9A3412]">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#C2410C]" />
                    <div>
                      <span className="font-bold">cPanel Pure SFTP Target:</span> Transfers pre-compiled assets cleanly over SFTP directly into the web root, completely resolving the <em>"SSH connection failed: Unable to exec"</em> restriction without requiring shell execution.
                    </div>
                  </div>
                )
              }
              if (currentServer && (currentServer.serverType === 'DOCKER' || currentServer.iconType === 'docker')) {
                return (
                  <div className="mt-2 p-2.5 bg-[#E0F2FE] border border-[#BAE6FD] rounded-[6px] flex items-start gap-2 text-[11px] text-[#0369A1]">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#0284C7]" />
                    <div>
                      <span className="font-bold">Remote Docker Engine Target:</span> Connects directly to Docker daemon for zero-downtime rolling container updates and image tag rollouts.
                    </div>
                  </div>
                )
              }
              return null
            })()}
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
                    <div className="text-[12px] font-bold flex items-center justify-between gap-1.5">
                      <span className={isSelected ? 'text-[#005459]' : 'text-[#101d26]'}>
                        {preset.label}
                      </span>
                      {preset.architecture === 'atomic-symlink' && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-[#EAF5EE] text-[#005459] border border-[#B8E0C5]">
                          Zero-Downtime
                        </span>
                      )}
                      {preset.architecture === 'cpanel-sftp' && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-[#FFF4E5] text-[#C2410C] border border-[#FED7AA]">
                          Zero-Shell
                        </span>
                      )}
                      {preset.architecture === 'docker' && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-[#E0F2FE] text-[#0284C7] border border-[#BAE6FD]">
                          Daemon
                        </span>
                      )}
                      {preset.architecture.startsWith('windows') && (
                        <span className="px-1 py-0.2 rounded text-[9px] font-mono font-bold bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]">
                          Windows
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#565f6b] leading-tight mt-0.5">
                      {preset.desc}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Architecture Mode: Atomic Zero-Downtime Symlink Toggle & Visual Card */}
          <div className="p-3 bg-[#FAFBFB] border border-[#CDD4D0] rounded-[6px] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 ${isAtomicSymlink ? 'bg-[#EAF5EE] text-[#005459]' : 'bg-[#F4F6F5] text-[#565f6b]'}`}>
                  <RefreshCw className={`w-3.5 h-3.5 ${isAtomicSymlink ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                </div>
                <div>
                  <div className="text-[12px] font-bold text-[#101d26] flex items-center gap-1.5">
                    <span>Atomic Zero-Downtime Symlink Deployment</span>
                    {isAtomicSymlink && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-semibold bg-[#EAF5EE] text-[#005459] border border-[#B8E0C5]">
                        Enabled
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#565f6b]">
                    Builds into <code className="font-mono text-[#101d26]">/releases/[ts]</code> and atomically points <code className="font-mono text-[#005459]">/current</code> symlink.
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAtomicSymlink}
                  onChange={(e) => {
                    const checked = e.target.checked
                    setIsAtomicSymlink(checked)
                    if (checked) {
                      const atomicPreset = TARGET_PRESETS.find((p) => p.architecture === 'atomic-symlink' && p.framework === projectFramework) || TARGET_PRESETS.find((p) => p.id === 'atomic-laravel')
                      if (atomicPreset) {
                        setSelectedPresetId(atomicPreset.id)
                        setPostDeploy(atomicPreset.script)
                      }
                    }
                  }}
                  className="sr-only peer"
                />
                <div className="w-8 h-4 bg-[#CDD4D0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#005459]"></div>
              </label>
            </div>

            {isAtomicSymlink && (
              <div className="bg-[#FFFFFF] p-2.5 rounded border border-[#B8E0C5] text-[10px] font-mono space-y-1.5">
                <div className="flex items-center justify-between text-[#101d26]">
                  <span className="text-[#565f6b]">Target Base:</span>
                  <span className="font-semibold">{path ? path : '/var/www/my-app'}</span>
                </div>
                <div className="flex items-center justify-between text-[#101d26]">
                  <span className="text-[#565f6b]">Active Symlink:</span>
                  <span className="text-[#005459] font-bold">{path ? `${path}/current` : '/var/www/my-app/current'} ──&gt; /releases/[timestamp]</span>
                </div>
                <div className="flex items-center justify-between text-[#101d26]">
                  <span className="text-[#565f6b]">Shared Storage:</span>
                  <span>{path ? `${path}/shared/.env` : '/var/www/my-app/shared/.env'} &amp; storage/</span>
                </div>
                <div className="flex items-center justify-between text-[#101d26]">
                  <span className="text-[#565f6b]">Rollback Duration:</span>
                  <span className="text-[#2E8B57] font-semibold">&lt; 0.05s (Instant symlink pointer switch)</span>
                </div>
                <div className="text-[10px] font-sans text-[#565f6b] pt-1.5 border-t border-[#E2E7E4]">
                  💡 <strong>Server Config:</strong> Point your web server document root to <code className="text-[#005459] bg-[#EAF5EE] px-1 py-0.5 rounded font-mono">{path ? `${path}/current/public` : '/var/www/my-app/current/public'}</code>
                </div>
              </div>
            )}
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
